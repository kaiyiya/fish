import { Component } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { orderApi } from '../../../services/api'
import { logger } from '../../../utils/logger'
import { Button } from '../../../components/ui'
import './index.scss'

export default class OrderDetail extends Component {
  state = {
    loading: true,
    order: null,
    paying: false,
  }

  componentDidMount() {
    const instance = Taro.getCurrentInstance()
    const id = instance?.router?.params?.id
    if (!id) {
      Taro.showToast({ title: '缺少订单ID', icon: 'none' })
      this.setState({ loading: false })
      return
    }
    this.loadDetail(id)
  }

  loadDetail = async (id) => {
    try {
      const order = await orderApi.getDetail(id)
      this.setState({ order, loading: false })
    } catch (error) {
      logger.error('加载订单详情失败', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
      this.setState({ loading: false })
    }
  }

  formatDate = (str) => {
    if (!str) return ''
    try {
      const d = new Date(str)
      return `${d.getFullYear()}-${(d.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d
        .getHours()
        .toString()
        .padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
    } catch (e) {
      return str
    }
  }

  getStatusText = (status) => {
    const statusMap = {
      'pending': '待支付',
      'paid': '已支付',
      'completed': '已完成',
      'cancelled': '已取消',
      'refunded': '已退款',
    }
    return statusMap[status] || status || '未知状态'
  }

  getStatusColor = (status) => {
    const colorMap = {
      'pending': '#ff9800',
      'paid': '#1890ff',
      'completed': '#52c41a',
      'cancelled': '#999999',
      'refunded': '#ff4d4f',
    }
    return colorMap[status] || '#667eea'
  }

  handlePay = async () => {
    const { order, paying } = this.state
    if (!order || paying) return

    if (order.status !== 'pending') {
      Taro.showToast({ title: '订单状态不正确', icon: 'none' })
      return
    }

    this.setState({ paying: true })
    try {
      Taro.showToast({
        title: '正在模拟支付...',
        icon: 'none',
        duration: 1500,
      })

      await orderApi.simulatePay(order.id)
      Taro.showToast({ title: '支付成功', icon: 'success' })
      this.loadDetail(order.id)
    } catch (error) {
      logger.error('支付失败', error)
      Taro.showToast({ 
        title: error.message || '支付失败，请稍后重试', 
        icon: 'none' 
      })
    } finally {
      this.setState({ paying: false })
    }
  }

  render() {
    const { loading, order, paying } = this.state

    if (loading) {
      return (
        <View className="order-detail-page">
          <View className="loading-container">
            <Text className="loading-text">加载中...</Text>
          </View>
        </View>
      )
    }

    if (!order) {
      return (
        <View className="order-detail-page">
          <View className="empty-container">
            <Text className="empty-icon">📋</Text>
            <Text className="empty-text">订单不存在</Text>
          </View>
        </View>
      )
    }

    const items = order.items || []

    const statusText = this.getStatusText(order.status)
    const statusColor = this.getStatusColor(order.status)

    return (
      <View className="order-detail-page">
        <View className="order-header" style={{ background: `linear-gradient(135deg, ${statusColor} 0%, ${statusColor}dd 100%)` }}>
          <View className="status-badge" style={{ background: `rgba(255, 255, 255, 0.25)` }}>
            <Text className="order-status">{statusText}</Text>
          </View>
          <View className="order-info-group">
            <View className="order-info-item">
              <Text className="info-label">订单号</Text>
              <Text className="info-value">{order.orderNo || '-'}</Text>
            </View>
            <View className="order-info-item">
              <Text className="info-label">下单时间</Text>
              <Text className="info-value">{this.formatDate(order.created_at)}</Text>
            </View>
          </View>
        </View>

        <View className="order-summary">
          <View className="summary-content">
            <Text className="summary-label">订单总金额</Text>
            <Text className="summary-price">¥{order.totalAmount}</Text>
          </View>
        </View>

        <View className="items-section">
          <Text className="section-title">商品明细</Text>
          <ScrollView scrollY className="item-scroll">
            {items.length === 0 ? (
              <View className="empty-items">
                <Text className="empty-items-text">暂无商品信息</Text>
              </View>
            ) : (
              items.map((item) => (
                <View key={item.id} className="order-item-card">
                  <View className="item-header">
                    <Text className="item-title">商品 #{item.productId}</Text>
                  </View>
                  <View className="item-details">
                    <View className="item-detail-row">
                      <Text className="detail-label">数量</Text>
                      <Text className="detail-value">{item.quantity} 件</Text>
                    </View>
                    <View className="item-detail-row">
                      <Text className="detail-label">单价</Text>
                      <Text className="detail-value price-text">¥{item.price}</Text>
                    </View>
                    <View className="item-detail-row subtotal-row">
                      <Text className="detail-label">小计</Text>
                      <Text className="detail-value subtotal-text">¥{item.subtotal}</Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>

        {order.status === 'pending' && (
          <View className="order-footer">
            <Button
              type="primary"
              size="large"
              onClick={this.handlePay}
              loading={paying}
              disabled={paying}
              className="pay-btn"
            >
              {paying ? '支付中...' : '立即支付'}
            </Button>
          </View>
        )}
      </View>
    )
  }
}
