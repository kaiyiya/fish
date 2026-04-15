/** 仅 H5 为 true；小程序等其他端为 false，便于区分后台 Web 与小程序样式 */
export const isH5 = process.env.TARO_ENV === 'h5'
