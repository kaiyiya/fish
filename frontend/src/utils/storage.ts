import Taro from '@tarojs/taro'

export const storage = {
  set(key: string, value: any): void {
    Taro.setStorageSync(key, value)
  },

  get<T = any>(key: string): T | null {
    try {
      return Taro.getStorageSync(key)
    } catch (e) {
      return null
    }
  },

  remove(key: string): void {
    Taro.removeStorageSync(key)
  },

  clear(): void {
    Taro.clearStorageSync()
  },
}
