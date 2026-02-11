/**
 * 测试识别服务
 * 用于调试识别功能
 */

const { execFile } = require('child_process');
const { join } = require('path');

const pythonPath = 'D:\\Anaconda\\envs\\pytorch\\python.exe';
const scriptPath = join(__dirname, 'training', 'infer_pytorch.py');
const trainingDir = join(__dirname, 'training');
const testImage = join(process.cwd(), 'uploads', '1770786390442-d8f6fca774194f4b.png');

console.log('测试参数:');
console.log('  pythonPath:', pythonPath);
console.log('  scriptPath:', scriptPath);
console.log('  trainingDir:', trainingDir);
console.log('  testImage:', testImage);
console.log('  process.cwd():', process.cwd());
console.log('  __dirname:', __dirname);
console.log();

// 检查文件是否存在
const fs = require('fs');
console.log('文件检查:');
console.log('  Python存在:', fs.existsSync(pythonPath));
console.log('  脚本存在:', fs.existsSync(scriptPath));
console.log('  图片存在:', fs.existsSync(testImage));
console.log();

execFile(
  pythonPath,
  [scriptPath, '--image', testImage],
  {
    maxBuffer: 10 * 1024 * 1024,
    cwd: trainingDir,
  },
  (error, stdout, stderr) => {
    if (error) {
      console.error('❌ 执行错误:', error);
      if (stderr) console.error('stderr:', stderr.toString());
      return;
    }
    
    console.log('✅ 执行成功');
    console.log('stdout:', stdout.toString());
    
    try {
      const text = stdout.toString().trim();
      const lines = text.split('\n');
      const jsonLine = lines.find(line => line.trim().startsWith('{'));
      if (jsonLine) {
        const json = JSON.parse(jsonLine);
        console.log('解析结果:', JSON.stringify(json, null, 2));
      } else {
        console.log('未找到JSON行');
      }
    } catch (e) {
      console.error('解析失败:', e);
    }
  }
);
