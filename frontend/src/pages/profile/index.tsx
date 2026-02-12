import React, { Component } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useUserStore } from '../../store/user'
import { Button } from '../../components/ui'
import { notificationApi } from '../../services/api'
import { logger } from '../../utils/logger'
import './index.scss'

export default class Profile extends Component {
  state = {
    unreadCount: 0,
  }

  componentDidMount() {
    // 确保从本地存储恢复用户状态
    const store = useUserStore.getState()
    const token = Taro.getStorageSync('token')
    const userInfo = Taro.getStorageSync('userInfo')
    
    if (token && userInfo && (!store.token || !store.userInfo)) {
      store.setToken(token)
      store.setUserInfo(userInfo)
      // 强制更新组件
      this.forceUpdate()
    }

    // 加载未读通知数量
    if (userInfo) {
      this.loadUnreadCount()
    }
  }

  componentDidShow() {
    // 每次页面显示时刷新未读数量
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
      // 静默处理，不影响主流程
    }
  }

  handleGotoNotifications = () => {
    Taro.navigateTo({
      url: '/pages/notification/list/index',
    })
  }

  handleGotoAddress = () => {
    Taro.navigateTo({
      url: '/pages/address/list/index',
    })
  }

  handleGotoCart = () => {
    Taro.navigateTo({
      url: '/pages/cart/index',
    })
  }

  handleLogin = () => {
    Taro.navigateTo({
      url: '/pages/login/index',
    })
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
          Taro.showToast({
            title: '已退出登录',
            icon: 'success',
          })
        }
      },
    })
  }

  handleGotoAdmin = () => {
    Taro.navigateTo({
      url: '/pages/admin/index',
    })
  }

  handleGotoOrders = () => {
    Taro.navigateTo({
      url: '/pages/order/list/index',
    })
  }

  render() {
    const store = useUserStore.getState()
    const userInfo = store && store.userInfo

    return (
      <View className="profile">
        <ScrollView scrollY className="profile-scroll">
          {userInfo ? (
            <View>
              {/* 用户信息卡片 */}
              <View className="user-header">
                <View className="user-avatar">
                  <Text className="avatar-text">
                    {userInfo.username ? userInfo.username.charAt(0).toUpperCase() : 'U'}
                  </Text>
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

              {/* 功能菜单 */}
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

                <View className="menu-item">
                  <View className="menu-icon settings-icon">🔧</View>
                  <View className="menu-content">
                    <Text className="menu-title">设置</Text>
                    <Text className="menu-desc">账户与隐私设置</Text>
                  </View>
                  <Text className="menu-arrow">›</Text>
                </View>

                <View className="menu-item">
                  <View className="menu-icon help-icon">❓</View>
                  <View className="menu-content">
                    <Text className="menu-title">帮助中心</Text>
                    <Text className="menu-desc">常见问题与反馈</Text>
                  </View>
                  <Text className="menu-arrow">›</Text>
                </View>
              </View>

              {/* 退出登录按钮 */}
              <View className="logout-section">
                <Button
                  type="danger"
                  size="large"
                  block
                  onClick={this.handleLogout}
                  className="logout-btn"
                >
                  退出登录
                </Button>
              </View>
            </View>
          ) : (
            <View className="login-prompt">
              <View className="prompt-icon">👤</View>
              <Text className="prompt-title">您还未登录</Text>
              <Text className="prompt-desc">登录后可以查看订单、管理账户</Text>
              <Button
                type="primary"
                size="large"
                block
                onClick={this.handleLogin}
                className="login-btn"
              >
                立即登录
              </Button>
            </View>
          )}
        </ScrollView>
      </View>
    )
  }
}
