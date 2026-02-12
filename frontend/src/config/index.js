// 应用配置
// 注意：在小程序环境中，process 对象不存在
// 如果需要配置不同的 API 地址，可以直接修改这里的 baseURL

const config = {
  // API基础地址
  // 开发环境：http://localhost:3000
  // 生产环境：修改为实际的服务器地址，例如：https://api.example.com
  baseURL: 'http://localhost:3000',
  
  // 请求超时时间（毫秒）
  timeout: 10000,
  
  // 是否显示错误提示
  showErrorToast: true,
}

export default config
