import { create } from 'zustand'
import { storage } from '../utils/storage'

// 使用纯 JS + JSDoc，避免 TS 语法在 Babel 中报错
/**
 * @typedef {Object} UserInfo
 * @property {number} id
 * @property {string} username
 * @property {string} phone
 * @property {string} [avatar]
 */

export const useUserStore = create((set) => ({
  userInfo: storage.get('userInfo'),
  token: storage.get('token'),
  setUserInfo: (userInfo) => {
    storage.set('userInfo', userInfo)
    set({ userInfo })
  },
  setToken: (token) => {
    storage.set('token', token)
    set({ token })
  },
  logout: () => {
    storage.remove('userInfo')
    storage.remove('token')
    set({ userInfo: null, token: null })
  },
}))
