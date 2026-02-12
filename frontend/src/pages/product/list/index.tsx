import { Component } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { productApi } from '../../../services/api'
import { logger } from '../../../utils/logger'
import './index.scss'

export default class ProductList extends Component {
  state = {
    loading: true,
    products: [],
  }

  componentDidMount() {
    this.loadProducts()
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
      console.log('商品列表图片数据:', processedProducts.map(p => ({
        id: p.id,
        name: p.name,
        imageUrls: p.imageUrls,
      })))
      this.setState({ products: processedProducts, loading: false })
    } catch (error) {
      logger.error('加载商品列表失败', error)
      Taro.showToast({ title: error.message || '加载失败，请稍后重试', icon: 'none' })
      this.setState({ loading: false })
    }
  }

  handleProductClick = (id) => {
    Taro.navigateTo({
      url: `/pages/product/detail/index?id=${id}`,
    })
  }

  render() {
    const { loading, products } = this.state

    return (
      <View className="product-list-page">
        <View className="header">
          <Text className="title">全部商品</Text>
          <Text className="subtitle">发现更多优质鱼类</Text>
        </View>

        {loading ? (
          <View className="loading-state">
            <Text className="loading-text">加载中...</Text>
          </View>
        ) : products.length === 0 ? (
          <View className="empty-state">
            <Text className="empty-icon">🐟</Text>
            <Text className="empty-text">暂无商品</Text>
          </View>
        ) : (
          <ScrollView scrollY className="list-scroll">
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
          </ScrollView>
        )}
      </View>
    )
  }
}
