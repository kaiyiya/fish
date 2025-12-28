# 协同过滤推荐算法实现文档

## 算法概述

本系统实现了完整的协同过滤推荐算法，包括：
1. **基于用户的协同过滤（UserCF）**
2. **基于物品的协同过滤（ItemCF）**
3. **混合推荐策略（Hybrid）**
4. **基于内容的推荐（Content-Based）**
5. **基于流行度的推荐（Popularity-Based，用于冷启动）**

---

## 算法原理

### 1. 基于用户的协同过滤（UserCF）

**核心思想：** 找到与目标用户兴趣相似的其他用户，推荐这些相似用户喜欢的商品。

**算法流程：**
```
1. 构建用户-物品评分矩阵
2. 计算目标用户与其他用户的相似度（余弦相似度/皮尔逊相关系数）
3. 找出最相似的K个用户（Top-K相似用户）
4. 计算推荐分数：累加相似用户对商品的评分 × 相似度
5. 返回推荐分数最高的N个商品
```

**相似度计算公式：**

**余弦相似度：**
```
sim(u,v) = (u · v) / (||u|| × ||v||)
```

**皮尔逊相关系数：**
```
sim(u,v) = Σ(ui - ū)(vi - v̄) / √(Σ(ui - ū)² × Σ(vi - v̄)²)
```

**时间复杂度：** O(n²×m)
- n: 用户数量
- m: 商品数量

**优点：**
- 能发现用户潜在兴趣
- 推荐结果有较强的解释性

**缺点：**
- 用户数量增长时，计算复杂度急剧增加
- 对稀疏数据敏感

---

### 2. 基于物品的协同过滤（ItemCF）

**核心思想：** 找到与用户喜欢的商品相似的商品进行推荐。

**算法流程：**
```
1. 构建物品-用户矩阵（用户-物品矩阵的转置）
2. 对于用户喜欢的每个商品，计算与其他商品的相似度
3. 计算推荐分数：累加用户对商品的评分 × 商品相似度
4. 返回推荐分数最高的N个商品
```

**相似度计算：** 同样使用余弦相似度

**时间复杂度：** O(m²×n)
- m: 商品数量
- n: 用户数量

**优点：**
- 商品数量通常远小于用户数量，计算更高效
- 推荐结果更稳定
- 适合商品数量相对固定的场景

**缺点：**
- 对稀疏数据敏感
- 难以推荐新颖商品

---

### 3. 混合推荐策略

**核心思想：** 结合UserCF和ItemCF，取长补短。

**公式：**
```
Score(hybrid) = α × Score(UserCF) + β × Score(ItemCF)
```
其中 α + β = 1，通常 α = 0.6, β = 0.4

**优点：**
- 综合两种算法的优势
- 推荐效果通常更好

---

### 4. 基于内容的推荐

**核心思想：** 基于商品特征（价格、分类、标签等）和用户历史偏好进行推荐。

**算法流程：**
```
1. 获取用户历史行为数据
2. 构建用户偏好向量（基于用户喜欢的商品特征）
3. 计算每个商品特征向量与用户偏好向量的相似度
4. 返回相似度最高的N个商品
```

**优点：**
- 不需要其他用户数据，解决冷启动问题
- 推荐结果可解释性强
- 能推荐小众商品

---

### 5. 基于流行度的推荐

**核心思想：** 推荐热门商品，用于新用户冷启动。

**算法：** 统计最近N天内商品的行为权重总和，推荐最热门的商品

---

## 行为权重设计

不同用户行为具有不同的权重，用于构建用户-物品评分矩阵：

```typescript
{
  view: 1.0,        // 浏览
  collect: 3.0,     // 收藏
  add_cart: 5.0,    // 加入购物车
  purchase: 10.0,   // 购买
  share: 2.0,       // 分享
}
```

---

## 冷启动问题处理

### 新用户冷启动
1. 使用热门推荐
2. 使用基于内容的推荐（如果有初始偏好）

### 新商品冷启动
1. 使用基于内容的推荐
2. 结合新商品特征推荐

### 系统冷启动
1. 使用热门推荐
2. 基于商品分类推荐

---

## 使用方法

### API调用

```typescript
// 个性化推荐（智能选择最佳策略）
GET /ai/recommend?type=personalized

// 基于用户的协同过滤
GET /ai/recommend?type=collaborative
// 或
GET /ai/recommend?type=usercf

// 基于物品的协同过滤
GET /ai/recommend?type=itemcf

// 基于内容的推荐
GET /ai/recommend?type=content

// 热门推荐
GET /ai/recommend?type=popular

// 混合推荐
GET /ai/recommend?type=hybrid
```

### 代码调用

```typescript
// 在服务中使用
const recommendations = await recommendationService.getRecommendations(
  userId,
  'hybrid',  // 推荐类型
  20         // 返回数量
);
```

### 记录用户行为

```typescript
// 当用户浏览商品时
await collaborativeFilteringService.recordBehavior(
  userId,
  productId,
  'view'
);

// 当用户购买商品时
await collaborativeFilteringService.recordBehavior(
  userId,
  productId,
  'purchase'
);
```

---

## 性能优化

### 1. 缓存策略

推荐结果可以缓存，减少重复计算：

```typescript
// 缓存用户相似度矩阵（定期更新）
// 缓存热门商品列表（每小时更新）
// 缓存推荐结果（5-10分钟过期）
```

### 2. 增量计算

只计算新用户的推荐，避免全量重算。

### 3. 分布式计算

对于大规模数据，可以使用MapReduce等分布式计算框架。

### 4. 数据库优化

- 为user_behavior表添加索引
- 使用分区表（按时间分区）
- 定期归档历史数据

---

## 算法复杂度分析

### UserCF复杂度
- **时间复杂度：** O(n²×m)
  - n: 用户数
  - m: 商品数
- **空间复杂度：** O(n×m)（用户-物品矩阵）

### ItemCF复杂度
- **时间复杂度：** O(m²×n)
  - m: 商品数
  - n: 用户数
- **空间复杂度：** O(m×n)（物品-用户矩阵）

### 实际性能

假设：
- 用户数：10,000
- 商品数：1,000
- 每个用户平均交互：50个商品

**UserCF：**
- 计算相似度：10,000² = 100,000,000 次运算
- 实际优化后：约1-2秒

**ItemCF：**
- 计算相似度：1,000² = 1,000,000 次运算
- 实际优化后：约0.1-0.2秒

**结论：** ItemCF通常更快，但两者都需要优化才能满足实时推荐需求。

---

## 推荐效果评估

### 离线评估指标

1. **准确率（Precision）**
   ```
   Precision = 推荐的商品中用户实际喜欢的数量 / 推荐的商品总数
   ```

2. **召回率（Recall）**
   ```
   Recall = 推荐的商品中用户实际喜欢的数量 / 用户实际喜欢的商品总数
   ```

3. **F1值**
   ```
   F1 = 2 × (Precision × Recall) / (Precision + Recall)
   ```

4. **覆盖率（Coverage）**
   ```
   Coverage = 推荐系统覆盖的商品数量 / 商品总数
   ```

5. **多样性（Diversity）**
   - 推荐列表中商品类别的多样性

### 在线评估指标

1. **点击率（CTR）**
2. **转化率（Conversion Rate）**
3. **平均点击位置（Average Click Position）**

---

## 论文写作要点

### 算法设计章节应包含：

1. **问题描述**
   - 推荐系统的定义和目标
   - 协同过滤的基本思想

2. **算法设计**
   - UserCF算法详细设计
   - ItemCF算法详细设计
   - 混合策略设计

3. **相似度计算方法**
   - 余弦相似度公式
   - 皮尔逊相关系数公式
   - 选择理由

4. **算法流程**
   - 详细的算法步骤
   - 流程图

5. **复杂度分析**
   - 时间复杂度分析
   - 空间复杂度分析
   - 性能优化策略

6. **实验设计**
   - 数据集描述
   - 评估指标
   - 实验设置

7. **结果分析**
   - 不同算法的对比
   - 参数敏感性分析
   - 性能分析

---

## 代码示例（论文中可用）

```typescript
// 基于用户的协同过滤算法伪代码
function UserBasedCF(userId, topN) {
  // 1. 构建用户-物品评分矩阵
  matrix = buildUserItemMatrix()
  
  // 2. 计算用户相似度
  similarities = []
  for each otherUser in allUsers {
    similarity = cosineSimilarity(matrix[userId], matrix[otherUser])
    similarities.append({user: otherUser, similarity: similarity})
  }
  
  // 3. 获取Top-K相似用户
  topSimilarUsers = sort(similarities).take(topK)
  
  // 4. 计算推荐分数
  recommendations = {}
  for each similarUser in topSimilarUsers {
    for each product in similarUser.likedProducts {
      if product not in user.likedProducts {
        recommendations[product] += 
          similarity * similarUser.rating[product]
      }
    }
  }
  
  // 5. 返回Top-N推荐
  return sort(recommendations).take(topN)
}
```

---

## 总结

本实现提供了完整的协同过滤推荐算法，包括：
- ✅ 基于用户的协同过滤
- ✅ 基于物品的协同过滤
- ✅ 混合推荐策略
- ✅ 基于内容的推荐
- ✅ 热门推荐（冷启动）
- ✅ 性能优化考虑
- ✅ 完整的文档和注释

**适合用于毕业设计的算法实现部分！**
