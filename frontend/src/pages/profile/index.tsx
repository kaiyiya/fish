import React, { Component } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useUserStore } from '../../store/user'
import { Button } from '../../components/ui'
import { notificationApi, userApi } from '../../services/api'
import config from '../../config'
import { logger } from '../../utils/logger'
import './index.scss'

export default class Profile extends Component {
  state = {
    unreadCount: 0,
    uploadingAvatar: false,
  }

  componentDidMount() {
    const store = useUserStore.getState()
    const token = Taro.getStorageSync('token')
    const userInfo = Taro.getStorageSync('userInfo')

    if (token && userInfo && (!store.token || !store.userInfo)) {
      store.setToken(token)
      store.setUserInfo(userInfo)
      this.forceUpdate()
    }

    if (userInfo) {
      this.loadUnreadCount()
    }
  }

  componentDidShow() {
    const store = useUserStore.getState()
    if (store && store.userInfo) {
      this.loadUnreadCount()
    }
  }

  loadUnreadCount = async () => {
    try {
      const result = await notificationApi.getUnreadCount()
      this.setState({ unreadCount: result.count || 0 })
    } catch (error) {
      logger.error('加载未读通知数量失败', error)
    }
  }

  handleGotoNotifications = () => {
    Taro.navigateTo({ url: '/pages/notification/list/index' })
  }

  handleGotoAddress = () => {
    Taro.navigateTo({ url: '/pages/address/list/index' })
  }

  handleGotoWallet = () => {
    Taro.navigateTo({ url: '/pages/wallet/index' })
  }

  handleGotoCart = () => {
    Taro.navigateTo({ url: '/pages/cart/index' })
  }

  handleGotoSettings = () => {
    Taro.navigateTo({ url: '/pages/settings/index' })
  }

  handleGotoHelp = () => {
    Taro.navigateTo({ url: '/pages/help/index' })
  }

  handleLogin = () => {
    Taro.navigateTo({ url: '/pages/login/index' })
  }

  handleLogout = () => {
    Taro.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          const store = useUserStore.getState()
          if (store && store.logout) {
            store.logout()
          }
          Taro.showToast({ title: '已退出登录', icon: 'success' })
          setTimeout(() => {
            Taro.reLaunch({ url: '/pages/profile/index' })
          }, 300)
        }
      },
    })
  }

  handleGotoAdmin = () => {
    Taro.navigateTo({ url: '/subpackages/pkg-admin/pages/admin/index' })
  }

  handleGotoOrders = () => {
    Taro.navigateTo({ url: '/pages/order/list/index' })
  }

  handleChangeAvatar = async () => {
    if (this.state.uploadingAvatar) return
    try {
      const chooseResult = await Taro.chooseImage({ count: 1, sizeType: ['compressed', 'original'] })
      const tempFilePath = chooseResult.tempFilePaths?.[0]
      if (!tempFilePath) return

      this.setState({ uploadingAvatar: true })
      Taro.showLoading({ title: '上传中...' })

      const token = Taro.getStorageSync('token')
      const uploadResult = await Taro.uploadFile({
        url: `${config.baseURL}/upload`,
        filePath: tempFilePath,
        name: 'file',
        header: {
          Authorization: token ? `Bearer ${token}` : '',
          Accept: 'application/json',
        },
      })

      const uploadData = (() => {
        const rawData = uploadResult.data
        if (typeof rawData === 'string') {
          try {
            return JSON.parse(rawData)
          } catch {
            return rawData
          }
        }
        return rawData
      })()

      const responseCode = Number(uploadData?.code ?? uploadResult.statusCode)
      const isSuccessStatus = uploadResult.statusCode >= 200 && uploadResult.statusCode < 300
      const isSuccessCode = !Number.isNaN(responseCode) ? responseCode === 200 : true

      if (!isSuccessStatus || !isSuccessCode) {
        const serverMessage = uploadData?.message || uploadData?.msg || `上传失败（${uploadResult.statusCode}）`
        throw new Error(serverMessage)
      }

      const avatarPath = uploadData?.data?.url || uploadData?.url || ''

      if (!avatarPath) {
        const serverMessage =
          uploadData?.message || uploadData?.msg || '上传失败，未返回头像地址'
        throw new Error(serverMessage)
      }

      const resolvedAvatarUrl = avatarPath.startsWith('http')
        ? avatarPath
        : `${config.baseURL}${avatarPath}`

      const store = useUserStore.getState()
      const currentUser = store.userInfo || {}
      const updatedUser = { ...currentUser, avatar: resolvedAvatarUrl }

      // 先本地立即生效，避免界面看起来没更新
      store.setUserInfo(updatedUser)
      Taro.setStorageSync('userInfo', updatedUser)
      this.forceUpdate()

      Taro.showToast({ title: '头像已更新', icon: 'success' })
    } catch (error) {
      logger.error('头像上传失败', error)
      Taro.showToast({
        title: error instanceof Error ? error.message : '头像上传失败',
        icon: 'none',
      })
    } finally {
      Taro.hideLoading()
      this.setState({ uploadingAvatar: false })
    }
  }

  render() {
    const store = useUserStore.getState()
    const userInfo = store && store.userInfo
    const avatarUrl = userInfo?.avatar

    return (
      <View className="profile">
        <ScrollView scrollY className="profile-scroll">
          {userInfo ? (
            <View>
              <View className="user-header">
                <View className="user-avatar" onClick={this.handleChangeAvatar}>
                  {avatarUrl ? (
                    <Image className="avatar-image" src={avatarUrl} mode="aspectFill" />
                  ) : (
                    <Text className="avatar-text">
                      {userInfo.username ? userInfo.username.charAt(0).toUpperCase() : 'U'}
                    </Text>
                  )}
                  <View className="avatar-edit-tip">
                    <Text className="avatar-edit-text">
                      {this.state.uploadingAvatar ? '上传中' : '点击更换头像'}
                    </Text>
                  </View>
                </View>
                <Text className="username">{userInfo.username}</Text>
                <View className="user-badges">
                  {userInfo.role === 'admin' && (
                    <View className="badge admin-badge">
                      <Text className="badge-text">管理员</Text>
                    </View>
                  )}
                  <View className="badge user-badge">
                    <Text className="badge-text">普通用户</Text>
                  </View>
                </View>
              </View>

              <View className="menu-section">
                <View className="menu-item" onClick={this.handleGotoCart}>
                  <View className="menu-icon cart-icon">🛒</View>
                  <View className="menu-content">
                    <Text className="menu-title">购物车</Text>
                    <Text className="menu-desc">查看购物车商品</Text>
                  </View>
                  <Text className="menu-arrow">›</Text>
                </View>

                <View className="menu-item" onClick={this.handleGotoOrders}>
                  <View className="menu-icon order-icon">📋</View>
                  <View className="menu-content">
                    <Text className="menu-title">我的订单</Text>
                    <Text className="menu-desc">查看订单详情</Text>
                  </View>
                  <Text className="menu-arrow">›</Text>
                </View>

                <View className="menu-item" onClick={this.handleGotoAddress}>
                  <View className="menu-icon address-icon">📍</View>
                  <View className="menu-content">
                    <Text className="menu-title">收货地址</Text>
                    <Text className="menu-desc">管理收货地址</Text>
                  </View>
                  <Text className="menu-arrow">›</Text>
                </View>

                <View className="menu-item" onClick={this.handleGotoWallet}>
                  <View className="menu-icon wallet-icon">💳</View>
                  <View className="menu-content">
                    <Text className="menu-title">我的钱包</Text>
                    <Text className="menu-desc">虚拟账户余额与充值</Text>
                  </View>
                  <Text className="menu-arrow">›</Text>
                </View>

                <View className="menu-item" onClick={this.handleGotoNotifications}>
                  <View className="menu-icon notification-icon">🔔</View>
                  <View className="menu-content">
                    <Text className="menu-title">消息通知</Text>
                    <Text className="menu-desc">查看系统通知</Text>
                  </View>
                  <View className="menu-right">
                    {this.state.unreadCount > 0 && (
                      <View className="unread-badge">
                        <Text className="unread-text">{this.state.unreadCount}</Text>
                      </View>
                    )}
                    <Text className="menu-arrow">›</Text>
                  </View>
                </View>

                {userInfo.role === 'admin' && (
                  <View className="menu-item" onClick={this.handleGotoAdmin}>
                    <View className="menu-icon admin-icon">⚙️</View>
                    <View className="menu-content">
                      <Text className="menu-title">后台管理</Text>
                      <Text className="menu-desc">管理系统数据</Text>
                    </View>
                    <Text className="menu-arrow">›</Text>
                  </View>
                )}

                <View className="menu-item" onClick={this.handleGotoSettings}>
                  <View className="menu-icon settings-icon">🔧</View>
                  <View className="menu-content">
                    <Text className="menu-title">设置</Text>
                    <Text className="menu-desc">账户、隐私与通知设置</Text>
                  </View>
                  <Text className="menu-arrow">›</Text>
                </View>

                <View className="menu-item" onClick={this.handleGotoHelp}>
                  <View className="menu-icon help-icon">❓</View>
                  <View className="menu-content">
                    <Text className="menu-title">帮助中心</Text>
                    <Text className="menu-desc">常见问题、联系客服与反馈</Text>
                  </View>
                  <Text className="menu-arrow">›</Text>
                </View>
              </View>

              <View className="logout-section">
                <Button type="danger" size="large" block onClick={this.handleLogout} className="logout-btn">
                  退出登录
                </Button>
              </View>
            </View>
          ) : (
            <View className="login-prompt">
              <View className="prompt-icon">👤</View>
              <Text className="prompt-title">您还未登录</Text>
              <Text className="prompt-desc">登录后可以查看订单、管理账户</Text>
              <Button type="primary" size="large" block onClick={this.handleLogin} className="login-btn">
                立即登录
              </Button>
            </View>
          )}
        </ScrollView>
      </View>
    )
  }
}
