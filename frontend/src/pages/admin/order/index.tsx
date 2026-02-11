import { Component } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { orderApi } from '../../../services/api'
import './index.scss'

export default class AdminOrder extends Component {
  state = {
    loading: true,
    orders: [],
  }

  componentDidMount() {
    this.loadOrders()
  }

  loadOrders = async () => {
    try {
      const orders = await orderApi.getAll()
      this.setState({ orders, loading: false })
    } catch (error) {
      console.error('加载订单列表失败:', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
      this.setState({ loading: false })
    }
  }

  getStatusText = (status) => {
    const map = {
      pending: '待支付',
      paid: '已支付',
      shipped: '已发货',
      completed: '已完成',
      cancelled: '已取消',
    }
    return map[status] || status
  }

  getStatusColor = (status) => {
    const map = {
      pending: '#faad14',
      paid: '#1890ff',
      shipped: '#722ed1',
      completed: '#52c41a',
      cancelled: '#ff4d4f',
    }
    return map[status] || '#666'
  }

  handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderApi.updateStatus(orderId, newStatus)
      Taro.showToast({ title: '更新成功', icon: 'success' })
      this.loadOrders()
    } catch (error) {
      console.error('更新订单状态失败:', error)
      Taro.showToast({ title: '更新失败', icon: 'none' })
    }
  }

  formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  render() {
    const { loading, orders } = this.state

    return (
      <View className="admin-order-page">
        <View className="header">
          <Text className="title">订单管理</Text>
        </View>

        <ScrollView scrollY className="list-scroll">
          {loading ? (
            <View className="empty">
              <Text>加载中...</Text>
            </View>
          ) : orders.length === 0 ? (
            <View className="empty">
              <Text>暂无订单</Text>
            </View>
          ) : (
            orders.map((order) => (
              <View key={order.id} className="order-card">
                <View className="card-header">
                  <View className="header-left">
                    <Text className="order-no">订单号：{order.orderNo}</Text>
                    <Text className="order-time">
                      {this.formatDate(order.created_at)}
                    </Text>
                  </View>
                  <View
                    className="status-badge"
                    style={{ backgroundColor: this.getStatusColor(order.status) }}
                  >
                    <Text className="status-text">
                      {this.getStatusText(order.status)}
                    </Text>
                  </View>
                </View>

                <View className="card-body">
                  <View className="info-row">
                    <Text className="label">用户ID：</Text>
                    <Text className="value">{order.userId}</Text>
                  </View>
                  <View className="info-row">
                    <Text className="label">商品数量：</Text>
                    <Text className="value">
                      {order.items?.length || 0} 件
                    </Text>
                  </View>
                  <View className="info-row">
                    <Text className="label">总金额：</Text>
                    <Text className="price">¥{order.totalAmount}</Text>
                  </View>
                </View>

                <View className="card-footer">
                  {order.status === 'pending' && (
                    <>
                      <Button
                        className="status-btn paid"
                        size="mini"
                        onClick={() => this.handleStatusChange(order.id, 'paid')}
                      >
                        标记已支付
                      </Button>
                      <Button
                        className="status-btn cancelled"
                        size="mini"
                        onClick={() => this.handleStatusChange(order.id, 'cancelled')}
                      >
                        取消订单
                      </Button>
                    </>
                  )}
                  {order.status === 'paid' && (
                    <Button
                      className="status-btn shipped"
                      size="mini"
                      onClick={() => this.handleStatusChange(order.id, 'shipped')}
                    >
                      标记已发货
                    </Button>
                  )}
                  {order.status === 'shipped' && (
                    <Button
                      className="status-btn completed"
                      size="mini"
                      onClick={() => this.handleStatusChange(order.id, 'completed')}
                    >
                      标记已完成
                    </Button>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    )
  }
}
