/**
 * 第二波：对 AIGC 报告中仍标高疑似的正文做段落级改写（从「报告优化」版继续处理）
 * 依赖：replacements-wave2.js（from 须与 word/document.xml 完全一致）
 */
const fs = require('fs');
const path = require('path');
const JSZip = require('jszip');
const wave2 = require('./replacements-wave2');

const INPUT = path.join(
  __dirname,
  '..',
  '智能鱼类电商推荐系统的设计与实现_报告优化_20260410.docx',
);
const OUTPUT = path.join(
  __dirname,
  '..',
  '智能鱼类电商推荐系统的设计与实现_报告优化_全文20260410.docx',
);

async function main() {
  if (!fs.existsSync(INPUT)) {
    console.error('找不到输入:', INPUT);
    process.exit(1);
  }
  const sorted = [...wave2].sort((a, b) => b[0].length - a[0].length);
  const buf = fs.readFileSync(INPUT);
  const zip = await JSZip.loadAsync(buf);
  const xmlPath = 'word/document.xml';
  const f = zip.file(xmlPath);
  if (!f) {
    console.error('缺少', xmlPath);
    process.exit(1);
  }
  let xml = await f.async('string');
  let total = 0;
  for (const [from, to] of sorted) {
    const n = xml.split(from).length - 1;
    if (n === 0) {
      console.warn('○ 未匹配:', from.slice(0, 72) + (from.length > 72 ? '…' : ''));
      continue;
    }
    xml = xml.split(from).join(to);
    total += n;
    console.log('✓', n, '×', from.slice(0, 52) + (from.length > 52 ? '…' : ''));
  }
  zip.file(xmlPath, xml);
  const out = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
  });
  fs.writeFileSync(OUTPUT, out);
  console.log('\n共替换', total, '处');
  console.log('已生成:', OUTPUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
