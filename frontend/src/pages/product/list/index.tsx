import { Component } from 'react'
import { View, Text } from '@tarojs/components'
import './index.scss'

export default class ProductList extends Component {
  render() {
    return (
      <View className="product-list">
        <Text>商品列表页面</Text>
      </View>
    )
  }
}
