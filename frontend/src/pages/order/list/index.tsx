import { Component } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { orderApi } from '../../../services/api'
import './index.scss'

export default class OrderList extends Component {
  state = {
    loading: true,
    orders: [],
  }

  componentDidMount() {
    this.loadOrders()
  }

  loadOrders = async () => {
    try {
      const orders = await orderApi.getList()
      this.setState({ orders, loading: false })
    } catch (error) {
      console.error('加载订单列表失败:', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
      this.setState({ loading: false })
    }
  }

  handleOrderClick = (id) => {
    Taro.navigateTo({
      url: `/pages/order/detail/index?id=${id}`,
    })
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

  render() {
    const { loading, orders } = this.state

    return (
      <View className="order-list-page">
        {loading ? (
          <View className="empty">
            <Text>加载中...</Text>
          </View>
        ) : orders.length === 0 ? (
          <View className="empty">
            <Text>暂无订单</Text>
          </View>
        ) : (
          <ScrollView scrollY className="order-scroll">
            {orders.map((order) => (
              <View
                key={order.id}
                className="order-item"
                onClick={() => this.handleOrderClick(order.id)}
              >
                <View className="order-row">
                  <Text className="label">订单号：</Text>
                  <Text className="value">{order.orderNo || '-'}</Text>
                </View>
                <View className="order-row">
                  <Text className="label">金额：</Text>
                  <Text className="price">¥{order.totalAmount}</Text>
                </View>
                <View className="order-row">
                  <Text className="label">状态：</Text>
                  <Text className="value">{order.status}</Text>
                </View>
                <View className="order-row">
                  <Text className="label">时间：</Text>
                  <Text className="value">
                    {this.formatDate(order.created_at)}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    )
  }
}
