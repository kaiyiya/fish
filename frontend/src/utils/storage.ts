import Taro from '@tarojs/taro'

// 使用 JS + JSDoc，而不是 TS 语法，避免 Babel 报错
export const storage = {
  /**
   * @param {string} key
   * @param {*} value
   */
  set(key, value) {
    Taro.setStorageSync(key, value)
  },

  /**
   * @template T
   * @param {string} key
   * @returns {T | null}
   */
  get(key) {
    try {
      return Taro.getStorageSync(key)
    } catch (e) {
      return null
    }
  },

  /**
   * @param {string} key
   */
  remove(key) {
    Taro.removeStorageSync(key)
  },

  clear() {
    Taro.clearStorageSync()
  },
}
