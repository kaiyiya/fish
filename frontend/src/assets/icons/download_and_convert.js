/**
 * 下载并转换图标
 * 使用sharp库将SVG转换为PNG
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// 使用简单的base64编码图标（如果无法下载）
const createSimpleIcons = () => {
  console.log('创建简单的图标文件...');
  
  // 这里我们创建一个使用emoji的简单方案
  // 或者使用canvas创建简单的图标
  
  const icons = ['home', 'recognize', 'search', 'profile'];
  
  icons.forEach(name => {
    // 创建占位文件说明
    const placeholder = `这是一个占位文件。
请替换为实际的81x81像素PNG图标。

图标要求:
- 尺寸: 81x81像素
- 格式: PNG
- 普通状态颜色: #666666
- 激活状态颜色: #1890ff

可以从以下网站下载:
- https://www.iconfont.cn/
- https://www.flaticon.com/
`;
    
    fs.writeFileSync(path.join(__dirname, `${name}.txt`), placeholder);
    fs.writeFileSync(path.join(__dirname, `${name}-active.txt`), placeholder);
  });
  
  console.log('已创建占位文件，请手动替换为实际图标');
};

// 尝试使用sharp转换SVG到PNG
const convertWithSharp = () => {
  try {
    const sharp = require('sharp');
    const iconsDir = __dirname;
    
    // 读取SVG文件并转换为PNG
    const icons = ['home', 'recognize', 'search', 'profile'];
    
    icons.forEach(name => {
      const svgPath = path.join(iconsDir, `${name}.svg`);
      const pngPath = path.join(iconsDir, `${name}.png`);
      
      if (fs.existsSync(svgPath)) {
        sharp(svgPath)
          .resize(81, 81)
          .png()
          .toFile(pngPath)
          .then(() => console.log(`[OK] 转换: ${name}.png`))
          .catch(err => console.error(`[ERROR] 转换失败: ${err.message}`));
      }
    });
  } catch (e) {
    console.log('sharp库未安装，使用其他方法');
    createSimpleIcons();
  }
};

// 运行
if (require.main === module) {
  convertWithSharp();
}

module.exports = { createSimpleIcons, convertWithSharp };
