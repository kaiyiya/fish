import Taro from '@tarojs/taro'
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// API基础地址
const BASE_URL = process.env.TARO_APP_API_URL || 'http://localhost:3000'

// 创建axios实例
const service: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
})

// 请求拦截器
service.interceptors.request.use(
  (config: AxiosRequestConfig) => {
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
  (response: AxiosResponse) => {
    const res = response.data
    
    // 如果返回的状态码不是200，说明有错误
    if (res.code !== 200) {
      Taro.showToast({
        title: res.message || '请求失败',
        icon: 'none',
        duration: 2000
      })
      
      // 401: token过期，需要重新登录
      if (res.code === 401) {
        Taro.removeStorageSync('token')
        Taro.removeStorageSync('userInfo')
        Taro.reLaunch({
          url: '/pages/profile/index'
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
      duration: 2000
    })
    return Promise.reject(error)
  }
)

export default service
