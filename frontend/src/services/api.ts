import request from '../utils/request'

// 认证相关API
export const authApi = {
  login: (data: { username: string; password: string }) => {
    return request.post('/auth/login', data)
  },
  register: (data: { username: string; password: string; phone: string }) => {
    return request.post('/auth/register', data)
  },
}

// 用户相关API
export const userApi = {
  getProfile: () => {
    return request.get('/user/profile')
  },
  updateProfile: (data: any) => {
    return request.patch('/user/profile', data)
  },
}

// 商品相关API
export const productApi = {
  getList: (params?: { categoryId?: number; keyword?: string }) => {
    return request.get('/product', { params })
  },
  getDetail: (id: number) => {
    return request.get(`/product/${id}`)
  },
}

// AI相关API
export const aiApi = {
  recognize: (imageUrl: string) => {
    return request.post('/ai/recognize', { imageUrl })
  },
  getRecommendations: (type: string = 'personalized') => {
    return request.get('/ai/recommend', { params: { type } })
  },
}

// 搜索相关API
export const searchApi = {
  search: (keyword: string, type: string = 'keyword') => {
    return request.get('/search', { params: { keyword, type } })
  },
}

// 订单相关API
export const orderApi = {
  create: (data: any) => {
    return request.post('/order', data)
  },
  getList: () => {
    return request.get('/order')
  },
  getDetail: (id: number) => {
    return request.get(`/order/${id}`)
  },
}
