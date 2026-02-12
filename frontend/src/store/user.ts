import { create } from 'zustand'
import { storage } from '../utils/storage'

// 使用纯 JS + JSDoc，避免 TS 语法在 Babel 中报错
/**
 * @typedef {Object} UserInfo
 * @property {number} id
 * @property {string} username
 * @property {string} phone
 * @property {string} [avatar]
 * @property {string} [role] - 'user' | 'admin'
 */

// 初始化时从本地存储恢复状态
const initUserInfo = storage.get('userInfo')
const initToken = storage.get('token')

export const useUserStore = create((set) => ({
  userInfo: initUserInfo || null,
  token: initToken || null,
  setUserInfo: (userInfo) => {
    if (userInfo) {
      storage.set('userInfo', userInfo)
      set({ userInfo })
    } else {
      storage.remove('userInfo')
      set({ userInfo: null })
    }
  },
  setToken: (token) => {
    if (token) {
      storage.set('token', token)
      set({ token })
    } else {
      storage.remove('token')
      set({ token: null })
    }
  },
  logout: () => {
    storage.remove('userInfo')
    storage.remove('token')
    set({ userInfo: null, token: null })
  },
}))
