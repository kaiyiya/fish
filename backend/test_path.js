/**
 * 测试路径计算
 */

const path = require('path');
const fs = require('fs');

// 模拟 __dirname 在不同环境下的值
const testCases = [
  {
    name: '开发环境',
    __dirname: 'E:\\vscode\\eye\\eye_scan\\fish\\backend\\src\\modules\\ai',
  },
  {
    name: '生产环境',
    __dirname: 'E:\\vscode\\eye\\eye_scan\\fish\\backend\\dist\\src\\modules\\ai',
  },
];

function getBackendDir(currentDir) {
  if (currentDir.includes('dist')) {
    return path.join(currentDir, '..', '..', '..', '..');
  } else {
    return path.join(currentDir, '..', '..', '..');
  }
}

console.log('测试路径计算:');
console.log('='.repeat(60));

testCases.forEach(testCase => {
  const backendDir = getBackendDir(testCase.__dirname);
  const scriptPath = path.join(backendDir, 'src', 'modules', 'ai', 'training', 'infer_pytorch.py');
  const uploadsDir = path.join(backendDir, 'uploads');
  
  console.log(`\n${testCase.name}:`);
  console.log('  __dirname:', testCase.__dirname);
  console.log('  backendDir:', backendDir);
  console.log('  scriptPath:', scriptPath);
  console.log('  scriptExists:', fs.existsSync(scriptPath));
  console.log('  uploadsDir:', uploadsDir);
  console.log('  uploadsExists:', fs.existsSync(uploadsDir));
  
  // 测试一个上传的文件
  if (fs.existsSync(uploadsDir)) {
    const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.png'));
    if (files.length > 0) {
      const testFile = path.join(uploadsDir, files[0]);
      console.log('  测试文件:', testFile);
      console.log('  文件存在:', fs.existsSync(testFile));
    }
  }
});

console.log('\n' + '='.repeat(60));
