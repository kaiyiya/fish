// 应用配置
// 注意：在小程序环境中，process 对象不存在
//
// 真机 / 手机预览：不能使用 localhost（会指向手机自身）。
// 填写本机局域网 IPv4（与电脑同一 WiFi，cmd 里 ipconfig 查看）。
// 留空字符串则使用 localhost（仅适合开发者工具模拟器连本机后端）。
// 修改后需重新编译/保存触发 watch，再在真机里预览。
// 微信开发者工具：本地设置 → 勾选「不校验合法域名…」（仅开发用）。

/** 开发机局域网 IPv4，例如 '192.168.31.217'；真机调试请填写，不需要局域网时写 '' */
const LAN_HOST = "172.20.10.2";
// 在cmd终端里面用ipconfig查看动态ip地址，如 IPv4 地址 . . . . . . . . . . . . : 192.168.31.140
const DEV_BASE_URL = LAN_HOST
  ? `http://${LAN_HOST}:3000`
  : 'http://localhost:3000'

const config = {
  baseURL: DEV_BASE_URL,

  // 请求超时时间（毫秒）
  timeout: 10000,

  // 是否显示错误提示
  showErrorToast: true,
}

export default config
