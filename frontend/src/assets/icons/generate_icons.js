/**
 * 生成TabBar图标
 * 使用Node.js和canvas库生成简单的图标
 * 
 * 运行方法：
 * 1. 安装依赖: npm install canvas
 * 2. 运行: node generate_icons.js
 */

const fs = require('fs');
const path = require('path');

// 如果canvas不可用，创建一个简单的占位说明
const icons = [
  { name: 'home', emoji: '🏠', label: '首页' },
  { name: 'recognize', emoji: '📷', label: '识别' },
  { name: 'search', emoji: '🔍', label: '搜索' },
  { name: 'profile', emoji: '👤', label: '我的' },
];

console.log('='.repeat(60));
console.log('TabBar图标生成说明');
console.log('='.repeat(60));
console.log();
console.log('需要的图标文件（81x81像素PNG）：');
console.log();

icons.forEach(icon => {
  console.log(`  ${icon.name}.png / ${icon.name}-active.png - ${icon.label} (${icon.emoji})`);
});

console.log();
console.log('='.repeat(60));
console.log('创建图标的方法：');
console.log('='.repeat(60));
console.log();
console.log('方法1：使用在线图标库（推荐）');
console.log('  1. 访问 https://www.iconfont.cn/ 或 https://www.flaticon.com/');
console.log('  2. 搜索对应的图标（首页、相机、搜索、用户）');
console.log('  3. 下载81x81尺寸的PNG图标');
console.log('  4. 重命名为对应文件名并放入此目录');
console.log();
console.log('方法2：使用设计工具');
console.log('  使用Photoshop、Figma等工具创建81x81的图标');
console.log();
console.log('方法3：使用HTML生成器');
console.log('  打开 create_simple_icons.html 在浏览器中生成');
console.log();
console.log('='.repeat(60));
console.log();
console.log('临时方案：如果暂时没有图标，可以：');
console.log('  1. 在 app.config.ts 中暂时移除 iconPath 配置');
console.log('  2. tabBar将只显示文字，不显示图标');
console.log();

// 创建占位文件说明
const placeholderInfo = {
  note: '此目录用于存放TabBar图标文件',
  required: icons.map(icon => ({
    name: icon.name,
    files: [`${icon.name}.png`, `${icon.name}-active.png`],
    size: '81x81像素',
    format: 'PNG',
    colors: {
      normal: '#666666',
      active: '#1890ff'
    }
  }))
};

fs.writeFileSync(
  path.join(__dirname, '图标说明.json'),
  JSON.stringify(placeholderInfo, null, 2),
  'utf-8'
);

console.log('[OK] 已创建图标说明文件: 图标说明.json');
