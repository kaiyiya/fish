import { Component } from 'react'
import { View, Text } from '@tarojs/components'
import './index.scss'

export default class OrderList extends Component {
  render() {
    return (
      <View className="order-list">
        <Text>订单列表页面</Text>
      </View>
    )
  }
}
