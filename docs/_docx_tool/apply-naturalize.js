/**
 * 自然润色：减少不必要括号、语气略作口语化（仅改 word/document.xml 文本层）
 * 输入：优先使用「降重版」docx（已含事实校对与降 AI 痕迹替换）
 * 用法：node apply-naturalize.js
 */
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');

const INPUT = path.join(
  __dirname,
  '..',
  '智能鱼类电商推荐系统的设计与实现_降重版_20260410.docx',
);
const OUTPUT = path.join(
  __dirname,
  '..',
  '智能鱼类电商推荐系统的设计与实现_自然润色_20260410.docx',
);

const replacements = [
  // 指标列举：去掉成串括号，读起来更顺
  [
    '常用的评估指标包括准确率（Accuracy）、精确率（Precision）、召回率（Recall）、F1值（F1-Score）、Top-K准确率（Top-K Accuracy）等。',
    '常用的评估指标包括准确率、精确率、召回率、F1 值与 Top-K 准确率等，英文文献中常写作 Accuracy、Precision、Recall、F1-Score。',
  ],
  [
    '推荐系统评估指标是衡量推荐效果的重要标准，常用的评估指标包括准确率（Precision）、召回率（Recall）、F1值（F1-Score）、覆盖率（Coverage）、多样性（Diversity）等。',
    '推荐系统评估指标用于衡量推荐效果，常用指标包括准确率 Precision、召回率 Recall、F1 值、覆盖率 Coverage、多样性 Diversity 等。',
  ],

  // 协同过滤缩写：括号改空格，避免密集标点
  ['基于用户的协同过滤（UserCF）', '基于用户的协同过滤 UserCF'],
  ['基于物品的协同过滤（ItemCF）', '基于物品的协同过滤 ItemCF'],
  ['（UserCF）', ' UserCF'],
  ['（ItemCF）', ' ItemCF'],

  // 英文术语首次出现可不用括号夹注
  ['（CNN）', ' CNN'],
  ['（NCF）', ' NCF'],
  ['SE（Squeeze-and-Excitation）模块', 'SE 模块'],

  // 研究内容分点
  ['（1）', '第一，'],
  ['（2）', '第二，'],
  ['（3）', '第三，'],
  ['（4）', '第四，'],
  ['（5）', '第五，'],

  // 括号内列举改短句，更口语
  [
    '（拍照、上传图片、选择相册图片）',
    '，包括拍照、上传或从相册选择',
  ],
  ['（至少20种常见鱼类品种）', '，覆盖常见品种不少于 20 种'],
  ['响应时间要求在3秒以内', '响应时间控制在 3 秒以内'],

  // 池化英文括号
  ['（Max Pooling）', ' Max Pooling'],
  ['（Average Pooling）', ' Average Pooling'],
  ['（Depthwise Convolution）', ' Depthwise 卷积'],
  ['（Pointwise Convolution）', ' Pointwise 卷积'],

  // 表名：表名与物理名之间不用全角括号，改为空格
  ['用户表（user）', '用户表 user'],
  ['商品表（fish_product）', '商品表 fish_product'],
  ['订单表（orders）', '订单表 orders'],
  ['订单项表（order_items）', '订单项表 order_items'],
  ['用户行为表（user_behaviors）', '用户行为表 user_behaviors'],
  ['推荐日志表（recommendation_logs）', '推荐日志表 recommendation_logs'],
  ['图像识别记录表（image_recognition）', '图像识别记录表 image_recognition'],
  ['分类表（categories）', '分类表 categories'],

  // 轻微语气自然化（避免改动技术含义）
  ['需要进行', '需要'],
  [
    '本文围绕鱼类电商的实际场景，完成了一个将图像识别与协同过滤联合应用的推荐系统实现，通过图像识别技术实现鱼类的自动识别，通过协同过滤算法实现个性化商品推荐，为用户提供便捷、高效的购物体验。',
    '本文面向鱼类电商场景，将图像识别与协同过滤落地为可运行系统：识别用于补齐品种信息，推荐用于缩小挑选范围，缩短从看图到下单的路径。',
  ],
];

async function main() {
  if (!fs.existsSync(INPUT)) {
    console.error('找不到输入文件，请先确认已生成降重版:', INPUT);
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

  for (const [from, to] of replacements) {
    if (!from) continue;
    const n = xml.split(from).length - 1;
    if (n === 0) continue;
    xml = xml.split(from).join(to);
    console.log('✓', n, '×', from.slice(0, 56) + (from.length > 56 ? '…' : ''));
  }

  // 去掉连续全角逗号、多余空白（保守）
  xml = xml.replace(/，{2,}/g, '，');
  xml = xml.replace(/。{2,}/g, '。');

  zip.file(xmlPath, xml);
  const out = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  });
  fs.writeFileSync(OUTPUT, out);
  console.log('已生成:', OUTPUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
