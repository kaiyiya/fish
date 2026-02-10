import Taro from '@tarojs/taro'
import axios from 'axios'

// API基础地址（避免在浏览器端直接访问 process.env 导致 \"process is not defined\" 报错）
// 如需按环境区分地址，可改为从 Taro 配置或后端返回的配置里读取。
const BASE_URL = 'http://localhost:3000'

// 创建axios实例（去掉TS类型标注，避免 Babel 报错）
const service = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从本地存储获取token
    const token = Taro.getStorageSync('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data

    // 如果返回的状态码不是200，说明有错误
    if (res.code !== 200) {
      Taro.showToast({
        title: res.message || '请求失败',
        icon: 'none',
        duration: 2000,
      })

      // 401: token过期，需要重新登录
      if (res.code === 401) {
        Taro.removeStorageSync('token')
        Taro.removeStorageSync('userInfo')
        Taro.reLaunch({
          url: '/pages/profile/index',
        })
      }

      return Promise.reject(new Error(res.message || '请求失败'))
    } else {
      return res.data
    }
  },
  (error) => {
    Taro.showToast({
      title: error.message || '网络错误',
      icon: 'none',
      duration: 2000,
    })
    return Promise.reject(error)
  }
)

export default service
