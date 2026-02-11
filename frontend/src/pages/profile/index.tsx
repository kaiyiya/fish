import React, { Component } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useUserStore } from '../../store/user'
import { Button } from '../../components/ui'
import './index.scss'

export default class Profile extends Component {
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
                <View className="menu-item" onClick={this.handleGotoOrders}>
                  <View className="menu-icon order-icon">📋</View>
                  <View className="menu-content">
                    <Text className="menu-title">我的订单</Text>
                    <Text className="menu-desc">查看订单详情</Text>
                  </View>
                  <Text className="menu-arrow">›</Text>
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
