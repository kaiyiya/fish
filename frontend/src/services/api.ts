import request from '../utils/request'

// 认证相关API
export const authApi = {
  login: (data) => {
    return request.post('/auth/login', data)
  },
  register: (data) => {
    return request.post('/auth/register', data)
  },
}

// 用户相关API
export const userApi = {
  getProfile: () => {
    return request.get('/user/profile')
  },
  updateProfile: (data) => {
    return request.patch('/user/profile', data)
  },
}

// 商品相关API
export const productApi = {
  getList: (params) => {
    return request.get('/product', { params })
  },
  getDetail: (id) => {
    return request.get(`/product/${id}`)
  },
  create: (data) => {
    return request.post('/product', data)
  },
  update: (id, data) => {
    return request.patch(`/product/${id}`, data)
  },
  remove: (id) => {
    return request.delete(`/product/${id}`)
  },
}

// AI相关API
export const aiApi = {
  recognize: (imageUrl) => {
    return request.post('/ai/recognize', { imageUrl })
  },
  getRecommendations: (type = 'personalized') => {
    return request.get('/ai/recommend', { params: { type } })
  },
}

// 搜索相关API
export const searchApi = {
  search: (keyword, type = 'keyword') => {
    return request.get('/search', { params: { keyword, type } })
  },
  getHot: (limit = 10) => {
    return request.get('/search/hot', { params: { limit } })
  },
}

// 订单相关API
export const orderApi = {
  create: (data) => {
    return request.post('/order', data)
  },
  getList: () => {
    return request.get('/order')
  },
  getAll: () => {
    return request.get('/order/admin/all')
  },
  getDetail: (id) => {
    return request.get(`/order/${id}`)
  },
  updateStatus: (id, status) => {
    return request.patch(`/order/${id}/status`, { status })
  },
}

// 分类相关API
export const categoryApi = {
  getList: () => {
    return request.get('/category')
  },
  getDetail: (id) => {
    return request.get(`/category/${id}`)
  },
  create: (data) => {
    return request.post('/category', data)
  },
  update: (id, data) => {
    return request.patch(`/category/${id}`, data)
  },
  remove: (id) => {
    return request.delete(`/category/${id}`)
  },
}

// 统计相关API
export const statisticsApi = {
  getRecognition: (params) => {
    return request.get('/statistics/recognition', { params })
  },
  getRecommendation: (params) => {
    return request.get('/statistics/recommendation', { params })
  },
  getSales: (params) => {
    return request.get('/statistics/sales', { params })
  },
}

// 上传相关API
export const uploadApi = {
  upload: (file) => {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/upload', formData)
  },
}
