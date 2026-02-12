import Taro from '@tarojs/taro'
import { logger } from './logger'

/**
 * 统一的错误处理函数
 * @param {Error} error - 错误对象
 * @param {string} defaultMessage - 默认错误消息
 * @param {boolean} showToast - 是否显示Toast提示
 */
export function handleError(error, defaultMessage = '操作失败，请稍后重试', showToast = true) {
  logger.error(defaultMessage, error)
  
  if (showToast) {
    const message = error?.message || defaultMessage
    Taro.showToast({
      title: message,
      icon: 'none',
      duration: 2000,
    })
  }
  
  return error
}
