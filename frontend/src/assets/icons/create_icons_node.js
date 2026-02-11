/**
 * 使用Node.js创建TabBar图标
 * 需要安装: npm install canvas
 * 或者使用更简单的方法：创建base64编码的图标
 */

const fs = require('fs');
const path = require('path');

// 简单的图标SVG模板
const iconTemplates = {
  home: {
    normal: `<svg width="81" height="81" xmlns="http://www.w3.org/2000/svg">
  <rect width="81" height="81" fill="transparent"/>
  <path d="M40.5 20 L20 35 L20 70 L30 70 L30 50 L51 50 L51 70 L61 70 L61 35 Z" fill="#666666"/>
</svg>`,
    active: `<svg width="81" height="81" xmlns="http://www.w3.org/2000/svg">
  <rect width="81" height="81" fill="transparent"/>
  <path d="M40.5 20 L20 35 L20 70 L30 70 L30 50 L51 50 L51 70 L61 70 L61 35 Z" fill="#1890ff"/>
</svg>`
  },
  recognize: {
    normal: `<svg width="81" height="81" xmlns="http://www.w3.org/2000/svg">
  <rect width="81" height="81" fill="transparent"/>
  <circle cx="40.5" cy="40.5" r="18" fill="none" stroke="#666666" stroke-width="3"/>
  <circle cx="40.5" cy="40.5" r="12" fill="#666666"/>
  <rect x="55" y="25" width="8" height="8" rx="2" fill="#666666"/>
</svg>`,
    active: `<svg width="81" height="81" xmlns="http://www.w3.org/2000/svg">
  <rect width="81" height="81" fill="transparent"/>
  <circle cx="40.5" cy="40.5" r="18" fill="none" stroke="#1890ff" stroke-width="3"/>
  <circle cx="40.5" cy="40.5" r="12" fill="#1890ff"/>
  <rect x="55" y="25" width="8" height="8" rx="2" fill="#1890ff"/>
</svg>`
  },
  search: {
    normal: `<svg width="81" height="81" xmlns="http://www.w3.org/2000/svg">
  <rect width="81" height="81" fill="transparent"/>
  <circle cx="35" cy="35" r="12" fill="none" stroke="#666666" stroke-width="3"/>
  <line x1="42" y1="42" x2="52" y2="52" stroke="#666666" stroke-width="3" stroke-linecap="round"/>
</svg>`,
    active: `<svg width="81" height="81" xmlns="http://www.w3.org/2000/svg">
  <rect width="81" height="81" fill="transparent"/>
  <circle cx="35" cy="35" r="12" fill="none" stroke="#1890ff" stroke-width="3"/>
  <line x1="42" y1="42" x2="52" y2="52" stroke="#1890ff" stroke-width="3" stroke-linecap="round"/>
</svg>`
  },
  profile: {
    normal: `<svg width="81" height="81" xmlns="http://www.w3.org/2000/svg">
  <rect width="81" height="81" fill="transparent"/>
  <circle cx="40.5" cy="28" r="10" fill="#666666"/>
  <path d="M20 60 Q20 45 40.5 45 Q61 45 61 60 L61 70 L20 70 Z" fill="#666666"/>
</svg>`,
    active: `<svg width="81" height="81" xmlns="http://www.w3.org/2000/svg">
  <rect width="81" height="81" fill="transparent"/>
  <circle cx="40.5" cy="28" r="10" fill="#1890ff"/>
  <path d="M20 60 Q20 45 40.5 45 Q61 45 61 60 L61 70 L20 70 Z" fill="#1890ff"/>
</svg>`
  }
};

// 创建图标文件
function createIcons() {
  const iconsDir = __dirname;
  
  console.log('开始创建图标文件...\n');
  
  Object.keys(iconTemplates).forEach(name => {
    const templates = iconTemplates[name];
    
    // 保存普通状态图标
    const normalPath = path.join(iconsDir, `${name}.svg`);
    fs.writeFileSync(normalPath, templates.normal, 'utf-8');
    console.log(`[OK] 创建: ${name}.svg`);
    
    // 保存激活状态图标
    const activePath = path.join(iconsDir, `${name}-active.svg`);
    fs.writeFileSync(activePath, templates.active, 'utf-8');
    console.log(`[OK] 创建: ${name}-active.svg`);
  });
  
  console.log('\n注意: 创建的是SVG格式，需要转换为PNG');
  console.log('可以使用在线工具转换: https://cloudconvert.com/svg-to-png');
  console.log('或者使用ImageMagick: convert icon.svg icon.png');
}

// 尝试使用canvas创建PNG（如果可用）
function createPNGIcons() {
  try {
    const { createCanvas } = require('canvas');
    const iconsDir = __dirname;
    
    console.log('使用canvas库创建PNG图标...\n');
    
    Object.keys(iconTemplates).forEach(name => {
      const templates = iconTemplates[name];
      
      // 创建普通状态图标
      const canvas = createCanvas(81, 81);
      const ctx = canvas.getContext('2d');
      
      // 这里需要解析SVG并绘制，比较复杂
      // 暂时先创建SVG，然后提示用户转换
    });
  } catch (e) {
    console.log('canvas库未安装，创建SVG格式图标');
    createIcons();
  }
}

// 运行
try {
  createPNGIcons();
} catch (e) {
  createIcons();
}
