import { Component } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { orderApi } from '../../../services/api'
import './index.scss'

export default class OrderDetail extends Component {
  state = {
    loading: true,
    order: null,
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
      console.error('加载订单详情失败:', error)
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

  render() {
    const { loading, order } = this.state

    if (loading) {
      return (
        <View className="order-detail-page">
          <Text>加载中...</Text>
        </View>
      )
    }

    if (!order) {
      return (
        <View className="order-detail-page">
          <Text>订单不存在</Text>
        </View>
      )
    }

    const items = order.items || []

    return (
      <View className="order-detail-page">
        <View className="order-header">
          <Text className="order-status">{order.status}</Text>
          <Text className="order-no">订单号：{order.orderNo || '-'}</Text>
          <Text className="order-time">
            下单时间：{this.formatDate(order.created_at)}
          </Text>
        </View>

        <View className="order-summary">
          <Text className="label">总金额：</Text>
          <Text className="price">¥{order.totalAmount}</Text>
        </View>

        <ScrollView scrollY className="item-scroll">
          {items.map((item) => (
            <View key={item.id} className="order-item-row">
              <View className="item-line">
                <Text className="label">商品ID：</Text>
                <Text className="value">{item.productId}</Text>
              </View>
              <View className="item-line">
                <Text className="label">数量：</Text>
                <Text className="value">{item.quantity}</Text>
              </View>
              <View className="item-line">
                <Text className="label">单价：</Text>
                <Text className="value">¥{item.price}</Text>
              </View>
              <View className="item-line">
                <Text className="label">小计：</Text>
                <Text className="value">¥{item.subtotal}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    )
  }
}
