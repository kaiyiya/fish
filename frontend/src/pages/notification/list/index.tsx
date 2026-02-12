import React, { Component } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { notificationApi } from '../../../services/api'
import { Button } from '../../../components/ui'
import { useUserStore } from '../../../store/user'
import { logger } from '../../../utils/logger'
import './index.scss'

export default class NotificationList extends Component {
  state = {
    loading: true,
    notificationList: [],
    unreadCount: 0,
    page: 1,
    hasMore: true,
  }

  componentDidMount() {
    this.loadNotifications()
    this.loadUnreadCount()
  }

  componentDidShow() {
    // 每次页面显示时刷新
    this.loadNotifications()
    this.loadUnreadCount()
  }

  loadNotifications = async (page = 1) => {
    try {
      const result = await notificationApi.getList({ page, limit: 20 })
      const notifications = result.notifications || []
      
      this.setState((prevState) => ({
        notificationList: page === 1 ? notifications : [...prevState.notificationList, ...notifications],
        page,
        hasMore: notifications.length >= 20,
        loading: false,
      }))
    } catch (error) {
      logger.error('加载通知失败', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
      this.setState({ loading: false })
    }
  }

  loadUnreadCount = async () => {
    try {
      const result = await notificationApi.getUnreadCount()
      this.setState({ unreadCount: result.count || 0 })
    } catch (error) {
      logger.error('加载未读数量失败', error)
    }
  }

  handleMarkAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id)
      // 更新本地状态
      this.setState((prevState) => ({
        notificationList: prevState.notificationList.map(item =>
          item.id === id ? { ...item, isRead: true } : item
        ),
        unreadCount: Math.max(0, prevState.unreadCount - 1),
      }))
    } catch (error) {
      logger.error('标记已读失败', error)
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead()
      Taro.showToast({ title: '已全部标记为已读', icon: 'success' })
      this.setState((prevState) => ({
        notificationList: prevState.notificationList.map(item => ({ ...item, isRead: true })),
        unreadCount: 0,
      }))
    } catch (error) {
      logger.error('标记全部已读失败', error)
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  handleDelete = async (id) => {
    try {
      await notificationApi.remove(id)
      Taro.showToast({ title: '删除成功', icon: 'success' })
      this.setState((prevState) => ({
        notificationList: prevState.notificationList.filter(item => item.id !== id),
      }))
    } catch (error) {
      logger.error('删除通知失败', error)
      Taro.showToast({ title: '删除失败', icon: 'none' })
    }
  }

  handleClearAll = async () => {
    const res = await Taro.showModal({
      title: '提示',
      content: '确定要清空所有通知吗？',
    })
    if (!res.confirm) return

    try {
      await notificationApi.clearAll()
      Taro.showToast({ title: '清空成功', icon: 'success' })
      this.setState({ notificationList: [] })
    } catch (error) {
      logger.error('清空通知失败', error)
      Taro.showToast({ title: '清空失败', icon: 'none' })
    }
  }

  handleNotificationClick = (notification) => {
    // 标记为已读
    if (!notification.isRead) {
      this.handleMarkAsRead(notification.id)
    }

    // 根据通知类型跳转
    if (notification.type === 'order' && notification.relatedId) {
      Taro.navigateTo({
        url: `/pages/order/detail/index?id=${notification.relatedId}`,
      })
    }
  }

  getTypeIcon = (type) => {
    const icons = {
      order: '📦',
      system: '🔔',
      promotion: '🎁',
      review: '⭐',
    }
    return icons[type] || '📢'
  }

  getTypeName = (type) => {
    const names = {
      order: '订单',
      system: '系统',
      promotion: '促销',
      review: '评价',
    }
    return names[type] || '通知'
  }

  formatTime = (time) => {
    const date = new Date(time)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString()
  }

  render() {
    const { loading, notificationList, unreadCount } = this.state
    const store = useUserStore.getState()
    const userInfo = store && store.userInfo

    if (!userInfo) {
      return (
        <View className="notification-page">
          <View className="empty-container">
            <Text className="empty-icon">🔒</Text>
            <Text className="empty-text">请先登录</Text>
            <Button
              type="primary"
              size="medium"
              onClick={() => Taro.navigateTo({ url: '/pages/login/index' })}
              className="login-btn"
            >
              去登录
            </Button>
          </View>
        </View>
      )
    }

    if (loading) {
      return (
        <View className="notification-page">
          <View className="loading-container">
            <Text className="loading-text">加载中...</Text>
          </View>
        </View>
      )
    }

    return (
      <View className="notification-page">
        <View className="notification-header">
          <Text className="header-title">消息通知</Text>
          {unreadCount > 0 && (
            <View className="unread-badge">
              <Text className="unread-text">{unreadCount}条未读</Text>
            </View>
          )}
          {notificationList.length > 0 && (
            <View className="header-actions">
              <Text className="action-text" onClick={this.handleMarkAllAsRead}>
                全部已读
              </Text>
              <Text className="action-text delete" onClick={this.handleClearAll}>
                清空
              </Text>
            </View>
          )}
        </View>

        <ScrollView scrollY className="notification-scroll">
          {notificationList.length > 0 ? (
            <View className="notification-list">
              {notificationList.map((notification) => (
                <View
                  key={notification.id}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => this.handleNotificationClick(notification)}
                >
                  <View className="notification-icon">
                    <Text>{this.getTypeIcon(notification.type)}</Text>
                  </View>
                  <View className="notification-content">
                    <View className="notification-header-row">
                      <Text className="notification-title">{notification.title}</Text>
                      {!notification.isRead && (
                        <View className="unread-dot"></View>
                      )}
                    </View>
                    {notification.content && (
                      <Text className="notification-text">{notification.content}</Text>
                    )}
                    <Text className="notification-time">
                      {this.getTypeName(notification.type)} · {this.formatTime(notification.created_at)}
                    </Text>
                  </View>
                  <View 
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      this.handleDelete(notification.id)
                    }}
                  >
                    <Text className="delete-icon">🗑️</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="empty-container">
              <Text className="empty-icon">📭</Text>
              <Text className="empty-text">暂无通知</Text>
            </View>
          )}
        </ScrollView>
      </View>
    )
  }
}
