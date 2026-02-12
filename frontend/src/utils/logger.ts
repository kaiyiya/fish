/**
 * 统一的日志工具
 * 在生产环境可以禁用console输出，或发送到日志服务
 */

// 在小程序环境中，process 对象不存在
// 默认总是显示日志（开发模式）
// 如果需要禁用日志，可以修改这里为 false
const isDevelopment = true

export const logger = {
  /**
   * @param {string} message
   * @param {any} error
   */
  error(message, error) {
    if (isDevelopment) {
      console.error(`[ERROR] ${message}`, error || '')
    }
    // 生产环境可以发送到日志服务
    // if (!isDevelopment && error) {
    //   sendToLogService('error', message, error)
    // }
  },

  /**
   * @param {string} message
   * @param {any} data
   */
  warn(message, data) {
    if (isDevelopment) {
      console.warn(`[WARN] ${message}`, data || '')
    }
  },

  /**
   * @param {string} message
   * @param {any} data
   */
  info(message, data) {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, data || '')
    }
  },

  /**
   * @param {string} message
   * @param {any} data
   */
  debug(message, data) {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, data || '')
    }
  },
}
