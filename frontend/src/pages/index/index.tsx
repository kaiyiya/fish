import { Component } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { productApi, aiApi } from '../../services/api'
import './index.scss'

export default class Index extends Component {
  state = {
    products: [],
    recommendations: [],
  }

  componentDidMount() {
    this.loadProducts()
    this.loadRecommendations()
  }

  loadProducts = async () => {
    try {
      const products = await productApi.getList()
      this.setState({ products })
    } catch (error) {
      console.error('加载商品失败:', error)
    }
  }

  loadRecommendations = async () => {
    try {
      const recommendations = await aiApi.getRecommendations()
      this.setState({ recommendations })
    } catch (error) {
      console.error('加载推荐失败:', error)
    }
  }

  handleProductClick = (id) => {
    Taro.navigateTo({
      url: `/pages/product/detail/index?id=${id}`,
    })
  }

  handleRecognizeClick = () => {
    Taro.switchTab({
      url: '/pages/recognize/index',
    })
  }

  render() {
    const { products, recommendations } = this.state

    return (
      <View className="index">
        <ScrollView scrollY className="scroll-view">
          {/* Banner区域 */}
          <View className="banner" onClick={this.handleRecognizeClick}>
            <Text className="banner-title">AI识别鱼类</Text>
            <Text className="banner-desc">拍照识别，智能推荐</Text>
          </View>

          {/* 推荐商品 */}
          {recommendations.length > 0 && (
            <View className="section">
              <View className="section-title">为你推荐</View>
              <ScrollView scrollX className="recommend-scroll">
                {recommendations.map((item) => (
                  <View
                    key={item.id}
                    className="recommend-item"
                    onClick={() => this.handleProductClick(item.id)}
                  >
                    <Image src={item.imageUrl || ''} className="recommend-image" />
                    <Text className="recommend-name">{item.name}</Text>
                    <Text className="recommend-price">¥{item.price}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* 商品列表 */}
          <View className="section">
            <View className="section-title">热门商品</View>
            <View className="product-list">
              {products.map((item) => (
                <View
                  key={item.id}
                  className="product-item"
                  onClick={() => this.handleProductClick(item.id)}
                >
                  <Image src={item.imageUrls?.[0] || ''} className="product-image" />
                  <View className="product-info">
                    <Text className="product-name">{item.name}</Text>
                    <Text className="product-price">¥{item.price}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }
}
