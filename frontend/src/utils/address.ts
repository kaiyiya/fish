import Taro from '@tarojs/taro'
import { addressApi } from '../services/api'

/**
 * 获取默认地址，如果没有则提示用户添加
 * @returns {Promise<number|null>} 返回地址ID，如果没有则返回null
 */
export async function getDefaultAddressId() {
  try {
    const defaultAddress = await addressApi.getDefault()
    if (defaultAddress) {
      return defaultAddress.id
    }
    return null
  } catch (error) {
    return null
  }
}

/**
 * 确保有默认地址，如果没有则引导用户添加
 * @returns {Promise<number|null>} 返回地址ID，如果用户取消则返回null
 */
export async function ensureDefaultAddress() {
  const addressId = await getDefaultAddressId()
  
  if (!addressId) {
    const res = await Taro.showModal({
      title: '提示',
      content: '请先添加收货地址',
      showCancel: true,
      confirmText: '去添加',
      cancelText: '取消',
    })
    
    if (res.confirm) {
      Taro.navigateTo({
        url: '/pages/address/list/index?selecting=true',
      })
    }
    return null
  }
  
  return addressId
}
