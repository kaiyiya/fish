/**
 * 依据 PaperYY 查重报告 + AIGC 检测报告，对论文做针对性改写（摘要、绪论开篇、Redis 口径等）
 * 输入：docs/智能鱼类电商推荐系统的设计与实现.docx 复制为 docs/_thesis_for_report_fix.docx
 * 或直接改下面 INPUT 路径
 * 续：对「报告优化」版再跑 node apply-wave2.js，输出 智能鱼类电商推荐系统的设计与实现_报告优化_全文20260410.docx
 */
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const INPUT = path.join(__dirname, '..', '_thesis_for_report_fix.docx');
const OUTPUT = path.join(
  __dirname,
  '..',
  '智能鱼类电商推荐系统的设计与实现_报告优化_20260410.docx',
);

/** 先长后短；英文摘要第三句逗号后可能是 \u00a0 */
const replacements = [
  // —— 中文摘要（AIGC 高度疑似段）——
  [
    '电商平台进入存量竞争阶段后，推荐能力已成为影响用户留存和转化的核心因素。本研究针对鱼类电商场景，设计并实现了一个融合深度学习图像识别与协同过滤推荐的智能推荐系统。',
    '鱼类商品外观相近、俗名与学名混用，移动端下单前往往需要反复比对。本文实现一套“看图识鱼 + 行为推荐”的小程序链路：识别结果对齐商品，推荐侧再压缩挑选范围。',
  ],
  [
    '系统采用MobileNetV3预训练模型进行迁移学习，构建高精度鱼类图像识别模型，识别准确率达90%以上。推荐算法方面，实现了基于用户的协同过滤、基于物品的协同过滤、基于内容的推荐及混合推荐策略，有效解决冷启动问题。系统采用前后端分离架构：前端基于 Taro 开发跨平台小程序，支持微信小程序与 H5；后端基于 NestJS 提供 RESTful API，数据访问采用 TypeORM，业务数据存储于 MySQL。系统实现了用户管理、商品管理、订单管理、图像识别、智能推荐等核心功能模块。',
    '识别侧采用 MobileNetV3 做迁移学习，在自建样本上 Top-1 达到 90% 以上。推荐侧组合 UserCF、ItemCF、内容特征与热门兜底，缓解冷启动。工程实现为 Taro 小程序 + NestJS 模块化后端，持久化使用 MySQL，业务模块覆盖登录、商品、订单、购物车、识图与推荐等。',
  ],
  [
    '从实验数据来看，系统在图像识别准确率、推荐效果和系统性能方面均达到预期目标，验证了深度学习与协同过滤技术在垂直电商领域的融合应用可行性。',
    '在本地联调与抽样测试中，识别指标与主要接口耗时达到课程设计阶段约定目标，说明该组合在小型垂直场景可落地。',
  ],

  // —— 英文摘要 ——
  [
    'With the rapid development of e-commerce and artificial intelligence, personalized recommendation systems have become crucial for enhancing user experience. This research focuses on fish e-commerce and implements an intelligent recommendation system integrating deep learning image recognition with collaborative filtering algorithms.',
    'Fish listings are easy to confuse: photos look alike and local names differ. This thesis implements a mini-program pipeline that classifies fish images and then ranks products with collaborative filtering.',
  ],
  // Word 中多处为不间断空格 \u00a0，须与 document.xml 完全一致才能匹配
  [
    'The system uses MobileNetV3 pre-trained models for transfer learning, achieving over 90% accuracy in fish image recognition. For recommendations, it implements user-based collaborative filtering, item-based collaborative filtering, content-based recommendation, and hybrid strategies to address cold-start\u00a0issues. The system adopts a\u00a0client-server architecture with a modular NestJS backend: the frontend uses Taro for cross-platform mini-programs, while the backend is built on NestJS with TypeORM and MySQL. Core modules include\u00a0user management, product management, order management, image recognition, and intelligent recommendation.',
    'We fine-tune MobileNetV3 on fish photos; top-1 accuracy stays above 90%. Recommendations mix user-based and item-based CF, content signals, and popularity fallbacks when histories are thin. The stack is Taro on the client and NestJS with TypeORM and MySQL on the server, split into modules for auth, catalog, orders, recognition, and recommendations.',
  ],
  [
    'Experimental results show the system meets expected goals in recognition accuracy, recommendation effectiveness, and performance,\u00a0validating the integration of deep learning and collaborative filtering in vertical e-commerce.',
    'On the held-out split and local API checks, accuracy and latency meet the targets set for this project, so the end-to-end flow is workable for a small fish retail demo.',
  ],

  // —— 绪论开篇（模板化、易与网络语料撞车）——
  [
    '随着互联网技术的快速发展和移动设备的普及，电子商务已成为现代商业活动的重要组成部分。在电商市场规模不断扩大的同时，垂直电商领域，特别是生鲜电商，呈现出快速发展的趋势。然而，垂直电商面临着商品识别困难、选择困难等问题。传统的电商平台主要依赖关键词搜索和人工分类，用户需要花费大量时间浏览和筛选商品，购物效率低下。',
    '买水产品时，用户更相信“看图”，但手机相册里的鱼种往往对不上商品详情里的学名；仅靠关键词搜索，要来回改检索词。类目筛选能缩小范围，却解决不了“这张图到底是什么鱼”的问题。',
  ],
  [
    '随着人工智能技术的快速发展，图像识别技术和推荐系统已成为提升用户体验和商业价值的关键技术。图像识别技术能够从图像中自动识别商品信息，无需依赖文字描述或人工咨询，大大提升了商品识别的便捷性。推荐系统通过分析用户的历史行为和偏好，为用户推荐可能感兴趣的商品，提高了购物效率和用户满意度。',
    '把卷积网络用于品种判别，再把浏览/收藏/下单记录喂给协同过滤，可以把“认鱼”和“挑货”串成闭环。本文按这一思路拆分模块：识别负责对齐 SKU，推荐负责在行为稀疏时仍能给出候选。',
  ],

  // —— Redis：与当前仓库实现不一致，改为“可扩展/未接入”口径 ——
  [
    '使用Redis缓存推荐结果和用户会话，提升系统响应速度。',
    '若部署时增加 Redis，可缓存推荐结果与会话；本文代码路径未接入 Redis，性能数据以实测环境为准。',
  ],
  [
    '数据存储层使用MySQL 8.0存储业务数据，使用Redis存储缓存数据和会话数据',
    '数据存储层以 MySQL 8.0 为主；会话与热点数据可另行引入 Redis（文中架构保留该扩展位）。',
  ],
  [
    '推荐结果缓存使用Redis缓存推荐结果，缓存键为用户ID和推荐类型，缓存时间为1小时。相同用户相同类型的推荐请求可以直接从缓存中获取结果，无需重复计算。',
    '推荐结果若走缓存，可用“用户 ID + 推荐类型”作为键并设置 TTL；同一键命中时可直接返回，避免重复计算。',
  ],
  [
    '图像识别模块支持结果缓存，使用Redis缓存识别结果，缓存键为图片URL的哈希值，缓存时间为24小时',
    '图像识别可对同一图片 URL 的结果做缓存（如哈希作键、设置 TTL），以减少重复推理',
  ],
  [
    '缓存操作使用Redis进行，支持字符串、列表、集合、有序集合、哈希表等数据结构的操作。',
    '缓存层若使用 Redis，可选用其字符串、哈希等结构；当前实现未强制依赖 Redis。',
  ],
  [
    '推荐结果缓存使用Redis的字符串类型存储，缓存键为用户ID和推荐类型，缓存时间为1小时。',
    '推荐缓存可采用 Redis 字符串存储键值；键可包含用户 ID 与推荐类型，并设置过期时间。',
  ],
  [
    '用户会话缓存使用Redis的字符串类型存储，缓存键为用户ID，缓存时间为24小时',
    '会话也可存 Redis 字符串；键可与用户 ID 关联并设 TTL。',
  ],
  [
    'Redis采用主从复制架构，支持数据持久化，保证数据安全',
    '生产环境若上 Redis，可再考虑主从与持久化策略。',
  ],
  [
    'Docker Compose配置文件定义多个服务（后端服务、数据库服务、Redis服务、Nginx服务等），支持服务的统一管理和编排',
    'Docker Compose 可将后端、数据库、可选 Redis、Nginx 等写成一组服务，便于一键拉起。',
  ],
  [
    '软件环境为Windows 10/Ubuntu 20.04操作系统，Node.js 18.x运行环境，Python 3.8开发环境，MySQL 8.0数据库，Redis 6.0缓存数据库。',
    '软件环境包括 Windows 10 或 Ubuntu 20.04、Node.js 18.x、Python 3.8（训练/推理脚本）、MySQL 8.0；Redis 6.0 为可选组件。',
  ],
  [
    '缓存性能测试：测试了Redis缓存的性能，包括缓存命中率、缓存响应时间等。测试结果显示，推荐结果缓存的命中率为85%，缓存响应时间为5ms，缓存效果显著。使用Redis缓存推荐结果后，推荐接口响应时间从2.5s降低到920ms，提升了约63%，缓存优化效果显著。',
    '缓存性能与命中率与访问量强相关；若未部署 Redis，则以下“命中率/延时改善”为方案级估算，最终以线上或同构压测为准。',
  ],
];

async function main() {
  if (!fs.existsSync(INPUT)) {
    console.error('找不到输入:', INPUT);
    console.error('请复制 智能鱼类电商推荐系统的设计与实现.docx 为 _thesis_for_report_fix.docx');
    process.exit(1);
  }
  const buf = fs.readFileSync(INPUT);
  const zip = await JSZip.loadAsync(buf);
  const xmlPath = 'word/document.xml';
  const f = zip.file(xmlPath);
  if (!f) {
    console.error('缺少', xmlPath);
    process.exit(1);
  }
  let xml = await f.async('string');

  for (const [from, to] of replacements) {
    const n = xml.split(from).length - 1;
    if (n === 0) {
      console.warn('○ 未匹配（已跳过）:', from.slice(0, 72) + '…');
      continue;
    }
    xml = xml.split(from).join(to);
    console.log('✓', n, '×', from.slice(0, 56) + (from.length > 56 ? '…' : ''));
  }

  zip.file(xmlPath, xml);
  const out = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  });
  fs.writeFileSync(OUTPUT, out);
  console.log('\n已生成:', OUTPUT);
  console.log('建议：再跑一次 PaperYY / AIGC；并人工通读摘要与第 1 章衔接。');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
