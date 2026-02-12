import { Component } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { productApi, aiApi } from '../../services/api'
import { logger } from '../../utils/logger'
import './index.scss'

export default class Index extends Component {
  state = {
    loading: true,
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
      // 处理imageUrls数据格式
      const processedProducts = products.map(product => {
        let imageUrls = product.imageUrls
        // 如果imageUrls是字符串，尝试解析为数组
        if (typeof imageUrls === 'string') {
          try {
            imageUrls = JSON.parse(imageUrls)
          } catch (e) {
            // 如果不是JSON，当作单个URL处理
            imageUrls = imageUrls ? [imageUrls] : []
          }
        } else if (!Array.isArray(imageUrls)) {
          imageUrls = []
        }
        return {
          ...product,
          imageUrls: imageUrls || [],
        }
      })
      this.setState({ products: processedProducts, loading: false })
    } catch (error) {
      logger.error('加载商品失败', error)
      Taro.showToast({ title: '加载商品失败', icon: 'none' })
      this.setState({ loading: false })
    }
  }

  loadRecommendations = async () => {
    try {
      const recommendations = await aiApi.getRecommendations()
      this.setState({ recommendations })
    } catch (error) {
      logger.error('加载推荐失败', error)
      // 推荐失败不影响主流程，静默处理
    }
  }

  onRefresh = () => {
    this.setState({ loading: true })
    this.loadProducts()
    this.loadRecommendations()
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
                    <Image 
                      src={item.imageUrl || ''} 
                      className="recommend-image"
                      mode="aspectFill"
                    />
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
            {this.state.loading ? (
              <View className="loading-state">
                <Text className="loading-text">加载中...</Text>
              </View>
            ) : products.length === 0 ? (
              <View className="empty-state">
                <Text className="empty-icon">🐟</Text>
                <Text className="empty-text">暂无商品</Text>
              </View>
            ) : (
              <View className="product-list">
                {products.map((item) => (
                  <View
                    key={item.id}
                    className="product-item"
                    onClick={() => this.handleProductClick(item.id)}
                  >
                    <View className="image-wrapper">
                      {item.imageUrls && item.imageUrls.length > 0 && item.imageUrls[0] ? (
                        <Image
                          src={item.imageUrls[0]}
                          className="product-image"
                          mode="aspectFill"
                          lazyLoad
                        />
                      ) : (
                        <View className="product-image-placeholder">
                          <Text className="placeholder-icon">🐟</Text>
                          <Text className="placeholder-text">暂无图片</Text>
                        </View>
                      )}
                      {item.stock <= 10 && item.stock > 0 && (
                        <View className="stock-badge">
                          <Text className="stock-text">仅剩{item.stock}件</Text>
                        </View>
                      )}
                      {item.stock === 0 && (
                        <View className="sold-out">
                          <Text className="sold-out-text">已售罄</Text>
                        </View>
                      )}
                    </View>
                    <View className="product-info">
                      <Text className="product-name">{item.name}</Text>
                      <View className="price-row">
                        <Text className="product-price">¥{item.price}</Text>
                        {item.stock > 0 && (
                          <Text className="stock-info">库存: {item.stock}</Text>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    )
  }
}
