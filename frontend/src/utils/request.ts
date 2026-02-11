import Taro from '@tarojs/taro'

// API 基础地址
const BASE_URL = 'http://localhost:3000'

// 统一请求函数，基于 Taro.request，兼容 H5 和 小程序
function baseRequest(options) {
  const token = Taro.getStorageSync('token')

  const headers = Object.assign(
    {
      'Content-Type': 'application/json',
    },
    options.header || {}
  )

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return Taro.request({
    url: BASE_URL + options.url,
    method: options.method || 'GET',
    data: options.data || options.params || {},
    header: headers,
    timeout: 10000,
  }).then((res) => {
    const data = res.data || {}

    // 兼容后端 TransformInterceptor：{ code, data, message }
    if (typeof data.code !== 'undefined') {
      if (data.code !== 200) {
        Taro.showToast({
          title: data.message || '请求失败',
          icon: 'none',
          duration: 2000,
        })

        if (data.code === 401) {
          Taro.removeStorageSync('token')
          Taro.removeStorageSync('userInfo')
          Taro.reLaunch({
            url: '/pages/profile/index',
          })
        }

        return Promise.reject(new Error(data.message || '请求失败'))
      }

      return data.data
    }

    // 兼容未包裹的情况，直接返回 res.data
    return data
  }).catch((error) => {
    Taro.showToast({
      title: error.message || '网络错误',
      icon: 'none',
      duration: 2000,
    })
    return Promise.reject(error)
  })
}

// 提供 axios 风格的调用方式，给现有 api.ts 使用
const request = {
  get(url, config = {}) {
    return baseRequest({
      url,
      method: 'GET',
      params: config.params || {},
      header: config.headers || {},
    })
  },
  post(url, data = {}, config = {}) {
    return baseRequest({
      url,
      method: 'POST',
      data,
      header: config.headers || {},
    })
  },
  patch(url, data = {}, config = {}) {
    return baseRequest({
      url,
      method: 'PATCH',
      data,
      header: config.headers || {},
    })
  },
  delete(url, config = {}) {
    return baseRequest({
      url,
      method: 'DELETE',
      data: config.data || {},
      header: config.headers || {},
    })
  },
}

export default request
