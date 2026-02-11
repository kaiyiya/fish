import { Component } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { productApi, orderApi } from '../../../services/api'
import { Button } from '../../../components/ui'
import './index.scss'

export default class ProductDetail extends Component {
  state = {
    loading: true,
    submitting: false,
    product: null,
  }

  componentDidMount() {
    const instance = Taro.getCurrentInstance()
    const id = instance?.router?.params?.id
    if (!id) {
      Taro.showToast({ title: '缺少商品ID', icon: 'none' })
      this.setState({ loading: false })
      return
    }
    this.loadDetail(id)
  }

  loadDetail = async (id) => {
    try {
      const product = await productApi.getDetail(id)
      this.setState({ product, loading: false })
    } catch (error) {
      console.error('加载商品详情失败:', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
      this.setState({ loading: false })
    }
  }

  handleImageClick = (imageUrl) => {
    if (!imageUrl) return
    Taro.previewImage({
      urls: this.state.product?.imageUrls || [imageUrl],
      current: imageUrl,
    })
  }

  handleBuyNow = async () => {
    const { product, submitting } = this.state
    if (!product || submitting) return

    if (product.stock !== undefined && product.stock === 0) {
      Taro.showToast({ title: '商品已售罄', icon: 'none' })
      return
    }

    this.setState({ submitting: true })
    try {
      const quantity = 1
      const price = Number(product.price) || 0
      const totalAmount = quantity * price

      const order = await orderApi.create({
        totalAmount,
        addressId: 1,
        items: [
          {
            productId: product.id,
            quantity,
            price,
          },
        ],
      })

      Taro.showToast({ title: '下单成功', icon: 'success' })
      if (order && order.id) {
        setTimeout(() => {
          Taro.navigateTo({
            url: `/pages/order/detail/index?id=${order.id}`,
          })
        }, 500)
      }
    } catch (error) {
      console.error('下单失败:', error)
      Taro.showToast({ title: '下单失败，请稍后重试', icon: 'none' })
    } finally {
      this.setState({ submitting: false })
    }
  }

  render() {
    const { loading, product, submitting } = this.state

    if (loading) {
      return (
        <View className="product-detail">
          <View className="loading-container">
            <Text className="loading-text">加载中...</Text>
          </View>
        </View>
      )
    }

    if (!product) {
      return (
        <View className="product-detail">
          <View className="empty-container">
            <Text className="empty-icon">😕</Text>
            <Text className="empty-text">商品不存在</Text>
          </View>
        </View>
      )
    }

    const firstImage = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : ''

    return (
      <View className="product-detail">
        <ScrollView scrollY className="detail-scroll">
          {firstImage ? (
            <Image
              src={firstImage}
              className="detail-image"
              mode="aspectFill"
              onClick={() => this.handleImageClick(firstImage)}
            />
          ) : (
            <View className="detail-image-placeholder">
              <Text className="placeholder-icon">🐟</Text>
              <Text className="placeholder-text">暂无图片</Text>
            </View>
          )}

          <View className="detail-info">
            <Text className="detail-name">{product.name}</Text>
            <View className="price-row">
              <Text className="detail-price">¥{product.price}</Text>
              {product.stock !== undefined && (
                <Text className="stock-info">库存: {product.stock}件</Text>
              )}
            </View>
          </View>

          {product.description ? (
            <View className="detail-section">
              <Text className="section-title">商品描述</Text>
              <Text className="section-content">{product.description}</Text>
            </View>
          ) : null}

          {product.nutritionInfo ? (
            <View className="detail-section">
              <Text className="section-title">营养信息</Text>
              <Text className="section-content">{product.nutritionInfo}</Text>
            </View>
          ) : null}

          {product.cookingTips ? (
            <View className="detail-section">
              <Text className="section-title">烹饪建议</Text>
              <Text className="section-content">{product.cookingTips}</Text>
            </View>
          ) : null}
        </ScrollView>

        <View className="detail-footer">
          <Button
            type="primary"
            size="large"
            block
            onClick={this.handleBuyNow}
            disabled={submitting || (product.stock !== undefined && product.stock === 0)}
            loading={submitting}
            className="buy-btn"
          >
            {submitting
              ? '提交中...'
              : product.stock === 0
              ? '已售罄'
              : '立即购买'}
          </Button>
        </View>
      </View>
    )
  }
}
