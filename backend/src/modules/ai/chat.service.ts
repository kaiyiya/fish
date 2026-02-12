import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import { Product } from '../../database/entities/product.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);
  private readonly deepseekApiKey: string;
  private readonly deepseekApiUrl = 'https://api.deepseek.com/v1/chat/completions';
  private readonly deepseekTimeout = 15000; // 15秒超时

  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private configService: ConfigService,
  ) {
    this.deepseekApiKey = this.configService.get<string>('DEEPSEEK_API_KEY', '');
    if (this.deepseekApiKey) {
      this.logger.log(`DeepSeek API Key 已配置，长度: ${this.deepseekApiKey.length}`);
    } else {
      this.logger.warn('DeepSeek API Key 未配置，将使用本地规则匹配');
    }
  }

  /**
   * 对话式AI搜索和推荐
   * 优先使用 DeepSeek API，失败时降级到本地规则匹配
   */
  async chat(userId: number, question: string): Promise<{
    answer: string;
    products: Product[];
    keywords: string[];
  }> {
    // 先尝试使用 DeepSeek API
    if (this.deepseekApiKey) {
      try {
        const result = await this.chatWithDeepSeek(question);
        if (result) {
          return result;
        }
      } catch (error) {
        this.logger.warn('DeepSeek API 调用失败，降级到本地规则匹配', error.message);
      }
    } else {
      this.logger.debug('DeepSeek API Key 未配置，使用本地规则匹配');
    }

    // 降级到本地规则匹配（备选方案）
    return this.chatWithLocalRules(question);
  }

  /**
   * 使用 DeepSeek API 进行对话
   */
  private async chatWithDeepSeek(question: string): Promise<{
    answer: string;
    products: Product[];
    keywords: string[];
  } | null> {
    try {
      // 先搜索相关商品
      const normalizedQuestion = question.trim().toLowerCase();
      const keywords = this.extractKeywords(normalizedQuestion);
      const products = await this.searchProductsForDeepSeek(keywords, normalizedQuestion);

      // 构建商品信息字符串
      const productsInfo = products.map((p, index) => {
        let info = `${index + 1}. ${p.name} - ¥${p.price}`;
        if (p.description) {
          info += `\n   描述：${p.description.substring(0, 100)}${p.description.length > 100 ? '...' : ''}`;
        }
        if (p.nutritionInfo) {
          info += `\n   营养：${p.nutritionInfo.substring(0, 80)}${p.nutritionInfo.length > 80 ? '...' : ''}`;
        }
        if (p.cookingTips) {
          info += `\n   烹饪：${p.cookingTips.substring(0, 80)}${p.cookingTips.length > 80 ? '...' : ''}`;
        }
        info += `\n   库存：${p.stock}`;
        return info;
      }).join('\n\n');

      // 构建提示词
      const systemPrompt = `你是一个专业的海鲜购物助手，帮助用户推荐合适的海鲜商品。

当前可用的商品列表：
${productsInfo || '暂无商品'}

请根据用户的问题，推荐合适的商品，并给出专业的建议。回答要：
1. 简洁友好，不超过200字
2. 推荐1-3个最合适的商品
3. 说明推荐理由
4. 可以给出烹饪建议或营养建议
5. 使用emoji让回答更生动

如果商品列表为空或没有合适的商品，请友好地告诉用户，并建议其他搜索方式。`;

      // 调用 DeepSeek API
      this.logger.debug(`调用 DeepSeek API，问题: ${question.substring(0, 50)}...`);
      
      const requestBody = {
        model: 'deepseek-chat', // DeepSeek 模型名称，如果使用其他版本可以改为 'deepseek-chat-v2' 等
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question },
        ],
        temperature: 0.7,
        max_tokens: 500,
        stream: false, // 确保非流式响应
      };

      this.logger.debug(`DeepSeek API 请求 URL: ${this.deepseekApiUrl}`);
      this.logger.debug(`DeepSeek API 请求体: ${JSON.stringify(requestBody).substring(0, 200)}...`);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.deepseekTimeout);

      let response;
      try {
        response = await fetch(this.deepseekApiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.deepseekApiKey}`,
          },
          body: JSON.stringify(requestBody),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          throw new Error('DeepSeek API 请求超时');
        }
        throw fetchError;
      }

      this.logger.debug(`DeepSeek API 响应状态: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`DeepSeek API 返回错误: ${response.status} ${response.statusText}`);
        this.logger.error(`错误响应内容: ${errorText}`);
        
        // 尝试解析错误信息
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error && errorData.error.message) {
            this.logger.error(`DeepSeek API 错误详情: ${errorData.error.message}`);
            throw new Error(`DeepSeek API 错误: ${errorData.error.message}`);
          }
        } catch (e) {
          // 如果解析失败，使用原始错误文本
        }
        
        throw new Error(`DeepSeek API 返回错误: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.logger.debug(`DeepSeek API 响应数据: ${JSON.stringify(data).substring(0, 300)}...`);
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        this.logger.error(`DeepSeek API 返回数据格式错误`);
        this.logger.error(`完整响应: ${JSON.stringify(data, null, 2)}`);
        throw new Error('DeepSeek API 返回数据格式错误');
      }

      const answer = data.choices[0].message.content.trim();
      this.logger.log(`DeepSeek API 调用成功，回答长度: ${answer.length}`);

      return {
        answer,
        products: products.slice(0, 3), // 只返回前3个商品
        keywords,
      };
    } catch (error) {
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        this.logger.warn('DeepSeek API 请求超时');
      } else {
        this.logger.error('DeepSeek API 调用失败', {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      }
      return null;
    }
  }

  /**
   * 为 DeepSeek 搜索商品（更宽松的搜索）
   */
  private async searchProductsForDeepSeek(
    keywords: string[],
    originalQuestion: string,
  ): Promise<Product[]> {
    const queryBuilder = this.productRepository.createQueryBuilder('product');
    
    // 如果有关键词，使用关键词搜索
    if (keywords.length > 0) {
      const conditions = keywords.map((keyword, index) => {
        const paramName = `keyword${index}`;
        return `(product.name LIKE :${paramName} OR product.description LIKE :${paramName} OR product.cookingTips LIKE :${paramName} OR product.nutritionInfo LIKE :${paramName})`;
      }).join(' OR ');
      
      queryBuilder.where(conditions);
      
      keywords.forEach((keyword, index) => {
        queryBuilder.setParameter(`keyword${index}`, `%${keyword}%`);
      });
    } else {
      // 没有关键词时，返回所有有库存的商品
      queryBuilder.where('product.stock > 0');
    }
    
    // 只返回有库存的商品
    queryBuilder.andWhere('product.stock > 0');
    
    // 按新鲜度和价格排序
    queryBuilder.orderBy('product.freshnessLevel', 'DESC');
    queryBuilder.addOrderBy('product.price', 'ASC');
    
    // 限制返回数量
    queryBuilder.limit(10);
    
    return queryBuilder.getMany();
  }

  /**
   * 使用本地规则匹配（备选方案）
   */
  private async chatWithLocalRules(question: string): Promise<{
    answer: string;
    products: Product[];
    keywords: string[];
  }> {
    const normalizedQuestion = question.trim().toLowerCase();
    
    // 提取关键词和意图
    const intent = this.extractIntent(normalizedQuestion);
    const keywords = this.extractKeywords(normalizedQuestion);
    
    // 根据意图和关键词搜索商品
    const products = await this.searchProducts(intent, keywords, normalizedQuestion);
    
    // 生成回答
    const answer = this.generateAnswer(intent, keywords, products, normalizedQuestion);
    
    return {
      answer,
      products,
      keywords,
    };
  }

  /**
   * 提取用户意图
   */
  private extractIntent(question: string): {
    type: 'health' | 'cooking' | 'price' | 'taste' | 'recommend' | 'search';
    context: string;
  } {
    // 健康相关
    if (this.matchKeywords(question, ['感冒', '生病', '健康', '营养', '补', '增强', '免疫力', '恢复', '虚弱', '调理'])) {
      return { type: 'health', context: 'health' };
    }
    
    // 烹饪相关
    if (this.matchKeywords(question, ['做', '煮', '炖', '汤', '清蒸', '红烧', '煎', '烤', '烹饪', '做法', '怎么', '如何做'])) {
      return { type: 'cooking', context: 'cooking' };
    }
    
    // 价格相关
    if (this.matchKeywords(question, ['便宜', '贵', '价格', '多少钱', '性价比', '实惠', '经济', '划算'])) {
      return { type: 'price', context: 'price' };
    }
    
    // 口味相关
    if (this.matchKeywords(question, ['好吃', '美味', '香', '鲜', '嫩', '口感', '味道', '推荐好吃的', '什么好吃'])) {
      return { type: 'taste', context: 'taste' };
    }
    
    // 推荐相关
    if (this.matchKeywords(question, ['推荐', '建议', '买什么', '选什么', '哪个好', '什么好'])) {
      return { type: 'recommend', context: 'recommend' };
    }
    
    // 默认搜索
    return { type: 'search', context: 'search' };
  }

  /**
   * 提取关键词（更智能的提取）
   */
  private extractKeywords(question: string): string[] {
    const keywords: string[] = [];
    
    // 扩展的鱼类名称关键词（包括常见海鲜）
    const fishNames = [
      '鲈鱼', '鲷鱼', '鲭鱼', '鲻鱼', '鳟鱼', '三文鱼', '金枪鱼',
      '带鱼', '黄鱼', '鲳鱼', '石斑鱼', '多宝鱼', '比目鱼',
      '虾', '小龙虾', '大虾', '基围虾', '对虾', '河虾',
      '蟹', '大闸蟹', '梭子蟹', '青蟹',
      '贝类', '扇贝', '生蚝', '蛤蜊', '蛏子', '海螺',
      '海参', '鲍鱼', '鱿鱼', '章鱼', '墨鱼',
      '鱼', '海鲜', '水产',
    ];
    
    for (const fish of fishNames) {
      if (question.includes(fish)) {
        keywords.push(fish);
      }
    }
    
    // 烹饪方式关键词
    const cookingMethods = ['汤', '清蒸', '红烧', '煎', '烤', '炖', '煮', '炸', '蒸', '爆炒'];
    for (const method of cookingMethods) {
      if (question.includes(method)) {
        keywords.push(method);
      }
    }
    
    // 健康相关关键词
    const healthKeywords = ['营养', '蛋白质', '维生素', '补钙', '补铁', 'DHA', 'EPA', 'omega', '低脂', '高蛋白'];
    for (const keyword of healthKeywords) {
      if (question.includes(keyword)) {
        keywords.push(keyword);
      }
    }
    
    // 口味相关关键词
    const tasteKeywords = ['鲜', '嫩', '香', '甜', '清淡', '重口味'];
    for (const keyword of tasteKeywords) {
      if (question.includes(keyword)) {
        keywords.push(keyword);
      }
    }
    
    return keywords;
  }

  /**
   * 匹配关键词
   */
  private matchKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }

  /**
   * 根据意图和关键词搜索商品（更智能的搜索）
   */
  private async searchProducts(
    intent: { type: string; context: string },
    keywords: string[],
    originalQuestion: string,
  ): Promise<Product[]> {
    const queryBuilder = this.productRepository.createQueryBuilder('product');
    
    // 如果没有关键词，尝试从问题中提取更多信息
    if (keywords.length === 0) {
      // 检查是否包含"好吃的"、"好吃的鱼"等
      if (originalQuestion.includes('好吃') || originalQuestion.includes('美味')) {
        // 推荐所有有库存的商品，按价格和新鲜度排序
        queryBuilder.where('product.stock > 0');
        queryBuilder.orderBy('product.freshnessLevel', 'DESC');
        queryBuilder.addOrderBy('product.price', 'ASC');
        queryBuilder.limit(10);
        return queryBuilder.getMany();
      }
      
      // 如果只是问"有什么"、"推荐"等，返回热门商品
      if (originalQuestion.includes('什么') || originalQuestion.includes('推荐') || originalQuestion.length < 5) {
        queryBuilder.where('product.stock > 0');
        queryBuilder.orderBy('product.freshnessLevel', 'DESC');
        queryBuilder.addOrderBy('product.created_at', 'DESC');
        queryBuilder.limit(10);
        return queryBuilder.getMany();
      }
    }
    
    // 根据关键词搜索
    if (keywords.length > 0) {
      const conditions = keywords.map((keyword, index) => {
        const paramName = `keyword${index}`;
        return `(product.name LIKE :${paramName} OR product.description LIKE :${paramName} OR product.cookingTips LIKE :${paramName} OR product.nutritionInfo LIKE :${paramName})`;
      }).join(' OR ');
      
      queryBuilder.where(conditions);
      
      keywords.forEach((keyword, index) => {
        queryBuilder.setParameter(`keyword${index}`, `%${keyword}%`);
      });
    }
    
    // 根据意图过滤和排序
    if (intent.type === 'health') {
      // 健康相关：优先推荐营养丰富的，有营养信息的
      queryBuilder.andWhere('product.stock > 0');
      queryBuilder.andWhere('(product.nutritionInfo IS NOT NULL AND product.nutritionInfo != "")');
      queryBuilder.orderBy('product.freshnessLevel', 'DESC');
      queryBuilder.addOrderBy('product.price', 'ASC');
    } else if (intent.type === 'cooking') {
      // 烹饪相关：优先推荐有烹饪建议的
      queryBuilder.andWhere('product.stock > 0');
      queryBuilder.andWhere('(product.cookingTips IS NOT NULL AND product.cookingTips != "")');
      queryBuilder.orderBy('product.freshnessLevel', 'DESC');
    } else if (intent.type === 'price') {
      // 价格相关：按价格排序
      queryBuilder.andWhere('product.stock > 0');
      queryBuilder.orderBy('product.price', 'ASC');
      queryBuilder.addOrderBy('product.freshnessLevel', 'DESC');
    } else if (intent.type === 'taste') {
      // 口味相关：推荐新鲜度高、有描述的
      queryBuilder.andWhere('product.stock > 0');
      queryBuilder.andWhere('(product.description IS NOT NULL AND product.description != "")');
      queryBuilder.orderBy('product.freshnessLevel', 'DESC');
      queryBuilder.addOrderBy('product.price', 'ASC');
    } else if (intent.type === 'recommend') {
      // 推荐相关：综合排序
      queryBuilder.andWhere('product.stock > 0');
      queryBuilder.orderBy('product.freshnessLevel', 'DESC');
      queryBuilder.addOrderBy('product.price', 'ASC');
      queryBuilder.addOrderBy('product.created_at', 'DESC');
    } else {
      // 默认搜索：只返回有库存的
      queryBuilder.andWhere('product.stock > 0');
      queryBuilder.orderBy('product.freshnessLevel', 'DESC');
    }
    
    // 限制返回数量
    queryBuilder.limit(10);
    
    return queryBuilder.getMany();
  }

  /**
   * 生成回答（更智能的回答）
   */
  private generateAnswer(
    intent: { type: string; context: string },
    keywords: string[],
    products: Product[],
    originalQuestion: string,
  ): string {
    if (products.length === 0) {
      // 更友好的无结果提示
      if (keywords.length > 0) {
        return `抱歉，没有找到包含"${keywords.join('、')}"的商品。\n\n您可以尝试：\n• 使用其他关键词搜索\n• 告诉我您的具体需求（比如"好吃的鱼"、"便宜的虾"）\n• 或者直接问我"推荐一些商品"`;
      }
      return '抱歉，没有找到符合您需求的商品。\n\n您可以尝试：\n• 使用其他关键词搜索\n• 告诉我您的具体需求\n• 或者直接问我"推荐一些商品"';
    }
    
    let answer = '';
    
    // 根据意图生成不同的回答
    if (intent.type === 'health') {
      answer = '根据您的健康需求，我为您推荐以下营养丰富的商品：\n\n';
      
      // 针对感冒等健康问题，推荐适合的商品
      if (this.matchKeywords(keywords.join(' '), ['感冒', '生病'])) {
        answer = '感冒期间建议选择营养丰富、易于消化的商品。我为您推荐：\n\n';
      }
      
      products.forEach((product, index) => {
        answer += `${index + 1}. ${product.name} - ¥${product.price}\n`;
        if (product.nutritionInfo) {
          const nutrition = product.nutritionInfo.substring(0, 60);
          answer += `   💊 ${nutrition}${product.nutritionInfo.length > 60 ? '...' : ''}\n`;
        }
        answer += '\n';
      });
      
      answer += '💡 这些商品富含优质蛋白质和多种维生素，有助于身体恢复。建议选择清蒸或炖汤的烹饪方式，既保留了营养，又易于消化。';
      
    } else if (intent.type === 'cooking') {
      answer = '根据您的烹饪需求，我为您推荐以下适合的商品：\n\n';
      
      products.forEach((product, index) => {
        answer += `${index + 1}. ${product.name} - ¥${product.price}\n`;
        if (product.cookingTips) {
          const tips = product.cookingTips.substring(0, 100);
          answer += `   🍳 烹饪建议：${tips}${product.cookingTips.length > 100 ? '...' : ''}\n`;
        }
        answer += '\n';
      });
      
      answer += '💡 这些商品都适合您提到的烹饪方式，您可以查看商品详情了解更多烹饪技巧。';
      
    } else if (intent.type === 'price') {
      answer = '根据您的价格需求，我为您推荐以下性价比高的商品：\n\n';
      
      products.slice(0, 5).forEach((product, index) => {
        answer += `${index + 1}. ${product.name} - ¥${product.price}（库存：${product.stock}）\n`;
      });
      
      answer += '\n💡 这些都是价格实惠、品质优良的选择。';
      
    } else if (intent.type === 'taste') {
      answer = '根据您的口味偏好，我为您推荐以下美味的商品：\n\n';
      
      products.forEach((product, index) => {
        answer += `${index + 1}. ${product.name} - ¥${product.price}\n`;
        if (product.description) {
          const desc = product.description.substring(0, 80);
          answer += `   🍽️ ${desc}${product.description.length > 80 ? '...' : ''}\n`;
        }
        answer += '\n';
      });
      
      answer += '💡 这些都是新鲜美味的选择，您可以点击商品查看详细信息。';
      
    } else if (intent.type === 'recommend') {
      answer = '根据您的需求，我为您推荐以下商品：\n\n';
      
      products.forEach((product, index) => {
        answer += `${index + 1}. ${product.name} - ¥${product.price}\n`;
        if (product.description) {
          const desc = product.description.substring(0, 70);
          answer += `   ${desc}${product.description.length > 70 ? '...' : ''}\n`;
        }
        answer += '\n';
      });
      
      answer += '💡 这些都是不错的选择，您可以点击商品查看详细信息。';
      
    } else {
      // 默认搜索回答（更智能）
      if (products.length === 1) {
        answer = `为您找到 1 个相关商品：\n\n`;
      } else {
        answer = `为您找到 ${products.length} 个相关商品：\n\n`;
      }
      
      products.forEach((product, index) => {
        answer += `${index + 1}. ${product.name} - ¥${product.price}`;
        if (product.stock > 0) {
          answer += `（库存：${product.stock}）`;
        }
        answer += '\n';
      });
      
      answer += '\n💡 您可以点击商品查看详细信息。';
    }
    
    return answer;
  }
}
