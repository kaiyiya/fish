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

// 购物车相关API
export const cartApi = {
  addToCart: (data) => {
    return request.post('/cart', data)
  },
  getList: () => {
    return request.get('/cart')
  },
  getCount: () => {
    return request.get('/cart/count')
  },
  updateItem: (id, data) => {
    return request.patch(`/cart/${id}`, data)
  },
  removeItem: (id) => {
    return request.delete(`/cart/${id}`)
  },
  clearCart: () => {
    return request.delete('/cart')
  },
}

// 评价相关API
export const reviewApi = {
  create: (data) => {
    return request.post('/review', data)
  },
  getProductReviews: (productId, params) => {
    return request.get(`/review/product/${productId}`, { params })
  },
  getProductRating: (productId) => {
    return request.get(`/review/product/${productId}/rating`)
  },
  getUserReviews: () => {
    return request.get('/review/user')
  },
  remove: (id) => {
    return request.delete(`/review/${id}`)
  },
  markHelpful: (id) => {
    return request.post(`/review/${id}/helpful`)
  },
}

// 收藏相关API
export const favoriteApi = {
  add: (productId) => {
    return request.post(`/favorite/${productId}`)
  },
  remove: (productId) => {
    return request.delete(`/favorite/${productId}`)
  },
  getList: () => {
    return request.get('/favorite')
  },
  check: (productId) => {
    return request.get(`/favorite/${productId}/check`)
  },
  getCount: (productId) => {
    return request.get(`/favorite/${productId}/count`)
  },
}

// 地址相关API
export const addressApi = {
  create: (data) => {
    return request.post('/address', data)
  },
  getList: () => {
    return request.get('/address')
  },
  getDefault: () => {
    return request.get('/address/default')
  },
  getDetail: (id) => {
    return request.get(`/address/${id}`)
  },
  update: (id, data) => {
    return request.patch(`/address/${id}`, data)
  },
  remove: (id) => {
    return request.delete(`/address/${id}`)
  },
  setDefault: (id) => {
    return request.patch(`/address/${id}/default`)
  },
}

// 优惠券相关API
export const couponApi = {
  getAvailable: () => {
    return request.get('/coupon/available')
  },
  receive: (couponId) => {
    return request.post(`/coupon/${couponId}/receive`)
  },
  getUserCoupons: (params) => {
    return request.get('/coupon/user', { params })
  },
  use: (userCouponId, orderId) => {
    return request.post(`/coupon/${userCouponId}/use`, { orderId })
  },
  getAll: () => {
    return request.get('/coupon/admin/all')
  },
  create: (data) => {
    return request.post('/coupon', data)
  },
  update: (id, data) => {
    return request.patch(`/coupon/${id}`, data)
  },
  remove: (id) => {
    return request.delete(`/coupon/${id}`)
  },
}

// 通知相关API
export const notificationApi = {
  getList: (params) => {
    return request.get('/notification', { params })
  },
  getUnreadCount: () => {
    return request.get('/notification/unread/count')
  },
  markAsRead: (id) => {
    return request.post(`/notification/${id}/read`)
  },
  markAllAsRead: () => {
    return request.post('/notification/read-all')
  },
  remove: (id) => {
    return request.delete(`/notification/${id}`)
  },
  clearAll: () => {
    return request.delete('/notification')
  },
}
