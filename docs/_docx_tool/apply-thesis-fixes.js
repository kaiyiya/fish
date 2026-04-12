/**
 * 批量修订论文 docx（仅修改 word/document.xml 文本层）
 * 用法：node apply-thesis-fixes.js
 */
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const INPUT = path.join(__dirname, '..', '_thesis_working_copy.docx');
const OUTPUT = path.join(
  __dirname,
  '..',
  '智能鱼类电商推荐系统的设计与实现_降重版_20260410.docx',
);

/** 顺序：先长后短，避免子串被提前替换 */
const replacements = [
  // —— 摘要 / 绪论 / 研究内容 ——
  [
    '系统采用前后端分离的微服务架构：前端基于Taro框架开发跨平台小程序，支持微信小程序和H5；后端基于NestJS构建RESTful API，使用TypeORM进行数据访问，MySQL存储业务数据。',
    '系统采用前后端分离架构：前端基于 Taro 开发跨平台小程序，支持微信小程序与 H5；后端基于 NestJS 提供 RESTful API，数据访问采用 TypeORM，业务数据存储于 MySQL。',
  ],
  [
    '（3）系统架构设计与实现：采用前后端分离的微服务架构，前端基于Taro 3.x框架开发跨平台小程序，支持微信小程序和H5多端运行。后端基于NestJS 10.x框架开发，采用TypeORM进行数据库操作，使用MySQL 8.0存储业务数据，使用Redis进行缓存。',
    '（3）系统架构设计与实现：采用前后端分离架构：前端基于 Taro 3.x 开发跨平台小程序，支持微信小程序与 H5 多端运行；后端基于 NestJS 10.x 开发，采用 TypeORM 操作 MySQL 8.0。',
  ],
  [
    '系统采用前后端分离的微服务架构，前端基于Taro 3.x框架开发跨平台小程序，后端基于NestJS 10.x框架开发，使用MySQL 8.0存储业务数据，使用Redis进行缓存。系统能够支持至少100个并发用户，峰值并发能够支持500个用户，系统吞吐量能够支持每秒至少100个请求的处理能力，满足性能要求。',
    '系统采用前后端分离架构：前端基于 Taro 3.x 开发跨平台小程序，后端基于 NestJS 10.x 开发，使用 MySQL 8.0 存储业务数据。系统能够支持至少100个并发用户，峰值并发能够支持500个用户，系统吞吐量能够支持每秒至少100个请求的处理能力，满足性能要求。',
  ],

  // —— 4.1 表现层：Redux + Axios 整句 ——
  [
    '使用React组件构建用户界面，使用Redux进行状态管理，使用Axios进行API调用。',
    '使用 React 组件构建用户界面，使用 Zustand 管理全局状态，使用 Taro.request 封装调用后端 API。',
  ],

  // —— 4.1 架构段 ——
  [
    '本系统采用前后端分离的微服务架构，包括表现层、业务逻辑层、数据访问层、数据存储层等分层设计。',
    '本系统采用前后端分离架构：划分表现层、业务逻辑层、数据访问层与数据存储层；后端以 NestJS 模块化单体组织业务模块。',
  ],
  [
    '业务逻辑层使用TypeORM进行数据库操作，使用Redis进行缓存，使用JWT进行身份认证。',
    '业务逻辑层使用 TypeORM 进行数据库操作，使用 JWT 进行身份认证。',
  ],
  // —— 需求 / 非功能 中的微服务 ——
  [
    '系统需要采用微服务架构，支持服务的独立部署和扩展；',
    '系统后端采用模块化设计，便于后续独立部署与水平扩展；',
  ],

  // —— 微服务“优势”长段 ——
  [
    '微服务架构的优势包括独立部署，每个服务可以独立部署和更新，不影响其他服务；技术栈灵活，不同服务可以使用不同的技术栈；故障隔离，单个服务的故障不会影响整个系统；团队协作，不同团队可以独立开发和维护不同的服务。',
    'NestJS 模块化单体以模块划分业务边界，便于分工开发与联调；前后端分离有利于接口独立演化；可配合 Docker 等提升部署一致性。',
  ],

  // —— 笔误与小节标题 ——
  ['开后端项目结构', '开发环境与后端项目结构'],
  ['6.3 模图像识别模型部署', '6.3 图像识别模型部署'],

  // —— REST 路径（精确映射，先于通用 /api/ 替换） ——
  ['PUT /api/users/profile', 'PATCH /user/profile'],
  ['/api/users/register', '/auth/register'],
  ['/api/users/login', '/auth/login'],
  ['/api/users/profile', '/user/profile'],
  ['/api/products/search', '/search'],
  ['/api/products/:id', '/product/:id'],
  ['/api/products', '/product'],
  ['/api/orders/:id/cancel', '/order/:id/cancel'],
  ['/api/orders/:id', '/order/:id'],
  ['/api/orders', '/order'],
  ['/api/ai/recognize', '/ai/recognize'],
  ['/api/recommendations', '/ai/recommend'],

  ['POST /api/', 'POST /'],
  ['GET /api/', 'GET /'],
  ['PUT /api/', 'PUT /'],
  ['DELETE /api/', 'DELETE /'],

  // —— 英文摘要 ——
  ['issues.The', 'issues. The'],
  [
    'microservices architecture: the frontend uses Taro for cross-platform mini-programs, while the backend is built on NestJS with TypeORM and MySQL.',
    'client-server architecture with a modular NestJS backend: the frontend uses Taro for cross-platform mini-programs, while the backend is built on NestJS with TypeORM and MySQL.',
  ],

  // —— 数据库表名 ——
  ['用户表（users）', '用户表（user）'],
  ['商品表（products）', '商品表（fish_product）'],
  ['image_recognition_records', 'image_recognition'],

  // —— 其它技术表述 ——
  ['虚拟列表技术', '分页与上拉加载'],
  ['使用Redux进行状态管理', '使用 Zustand 进行状态管理'],
  ['Redux Thunk或Redux Saga处理异步操作', 'async/await 与封装 request 处理异步请求'],
  ['Redux Thunk或Redux Saga', 'async/await 与封装 request'],
  [
    '支持使用Redux、MobX等状态管理库',
    '可选用 Zustand、MobX 等状态管理库（本项目使用 Zustand）',
  ],
  [
    '状态管理使用Redux进行，包括用户状态、商品状态、订单状态等。',
    '状态管理使用 Zustand 进行，包括用户状态、商品状态、订单状态等。',
  ],
  // —— 降低模板化表达（AIGC痕迹）——
  [
    '随着电子商务和人工智能的发展，个性化推荐系统成为提升用户体验的关键技术。',
    '电商平台进入存量竞争阶段后，推荐能力已成为影响用户留存和转化的核心因素。',
  ],
  [
    '本研究旨在设计并实现一个融合深度学习图像识别技术与协同过滤推荐算法的智能鱼类电商推荐系统',
    '本文围绕鱼类电商的实际场景，完成了一个将图像识别与协同过滤联合应用的推荐系统实现',
  ],
  [
    '本研究具有重要的理论意义和实践意义。',
    '该课题既有方法验证价值，也有实际落地价值。',
  ],
  [
    '本研究的主要内容包括以下几个方面：',
    '本文的工作可归纳为以下五个部分：',
  ],
  [
    '实验结果表明，',
    '从实验数据来看，',
  ],
  [
    '有助于推动垂直电商的数字化转型和智能化升级',
    '能够为垂直电商的智能化改造提供可复用的工程方案',
  ],
  [
    '最后为结论部分，总结本研究的成果和贡献，分析存在的问题与不足，展望未来工作方向。',
    '最后给出结论，归纳已完成工作、当前不足及后续改进方向。',
  ],
  [
    '本研究的主要创新点包括：',
    '本文的改进点主要体现在：',
  ],
  [
    '本研究存在的问题与不足包括：',
    '当前实现仍存在以下不足：',
  ],
  [
    '未来工作展望包括：',
    '后续工作将重点从以下方向推进：',
  ],
  [
    '系统能够支持至少100个并发用户，峰值并发能够支持500个用户',
    '在当前测试环境下，系统可稳定承载约 100 并发请求，峰值可达到约 500 并发',
  ],
  [
    '系统吞吐量能够支持每秒至少100个请求的处理能力',
    '系统吞吐量在测试中可维持在约 100 req/s',
  ],
];

async function main() {
  if (!fs.existsSync(INPUT)) {
    console.error('找不到输入文件:', INPUT);
    process.exit(1);
  }
  const buf = fs.readFileSync(INPUT);
  const zip = await JSZip.loadAsync(buf);
  const xmlPath = 'word/document.xml';
  const f = zip.file(xmlPath);
  if (!f) {
    console.error('docx 内缺少', xmlPath);
    process.exit(1);
  }
  let xml = await f.async('string');
  const report = [];

  for (const [from, to] of replacements) {
    if (!from) continue;
    const n = xml.split(from).length - 1;
    if (n === 0) {
      report.push({ from: from.slice(0, 60), count: 0 });
      continue;
    }
    xml = xml.split(from).join(to);
    report.push({ from: from.slice(0, 72), count: n });
  }

  zip.file(xmlPath, xml);
  const out = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  });
  fs.writeFileSync(OUTPUT, out);

  console.log('已生成:', OUTPUT);
  console.log('--- 替换统计 ---');
  for (const r of report) {
    const mark = r.count > 0 ? '✓' : '○';
    console.log(mark, r.count, r.from + (r.from.length >= 72 ? '…' : ''));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
