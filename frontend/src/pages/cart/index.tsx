import React, { Component } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { cartApi, orderApi } from '../../services/api'
import { ensureDefaultAddress } from '../../utils/address'
import { logger } from '../../utils/logger'
import { Button } from '../../components/ui'
import { useUserStore } from '../../store/user'
import './index.scss'

export default class Cart extends Component {
  state = {
    loading: true,
    cartList: [],
    selectedItems: [], // 选中的商品ID数组
    submitting: false,
  }

  componentDidMount() {
    this.loadCartList()
  }

  componentDidShow() {
    // 每次页面显示时刷新购物车
    this.loadCartList()
  }

  loadCartList = async () => {
    try {
      const list = await cartApi.getList()
      this.setState({ 
        cartList: list || [],
        loading: false,
        selectedItems: (list || []).map(item => item.id), // 默认全选
      })
    } catch (error) {
      logger.error('加载购物车失败', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
      this.setState({ loading: false })
    }
  }

  handleToggleSelect = (cartId) => {
    const { selectedItems } = this.state
    const index = selectedItems.indexOf(cartId)
    if (index > -1) {
      selectedItems.splice(index, 1)
    } else {
      selectedItems.push(cartId)
    }
    this.setState({ selectedItems: [...selectedItems] })
  }

  handleToggleSelectAll = () => {
    const { cartList, selectedItems } = this.state
    if (selectedItems.length === cartList.length) {
      // 全不选
      this.setState({ selectedItems: [] })
    } else {
      // 全选
      this.setState({ selectedItems: cartList.map(item => item.id) })
    }
  }

  handleUpdateQuantity = async (cartId, newQuantity) => {
    if (newQuantity <= 0) {
      await this.handleRemoveItem(cartId)
      return
    }

    try {
      await cartApi.updateItem(cartId, { quantity: newQuantity })
      Taro.showToast({ title: '更新成功', icon: 'success' })
      this.loadCartList()
    } catch (error) {
      logger.error('更新数量失败', error)
      Taro.showToast({ 
        title: error.message || '更新失败', 
        icon: 'none' 
      })
    }
  }

  handleRemoveItem = async (cartId) => {
    try {
      await cartApi.removeItem(cartId)
      Taro.showToast({ title: '删除成功', icon: 'success' })
      this.loadCartList()
    } catch (error) {
      logger.error('删除失败', error)
      Taro.showToast({ title: '删除失败', icon: 'none' })
    }
  }

  handleClearCart = async () => {
    const res = await Taro.showModal({
      title: '提示',
      content: '确定要清空购物车吗？',
    })
    if (!res.confirm) return

    try {
      await cartApi.clearCart()
      Taro.showToast({ title: '清空成功', icon: 'success' })
      this.loadCartList()
    } catch (error) {
      logger.error('清空失败', error)
      Taro.showToast({ title: '清空失败', icon: 'none' })
    }
  }

  handleCheckout = async () => {
    const { cartList, selectedItems, submitting } = this.state
    if (submitting) return

    if (selectedItems.length === 0) {
      Taro.showToast({ title: '请选择要结算的商品', icon: 'none' })
      return
    }

    // 获取选中的商品
    const selectedCarts = cartList.filter(item => selectedItems.includes(item.id))
    
    // 检查库存
    for (const cart of selectedCarts) {
      if (cart.product.stock < cart.quantity) {
        Taro.showToast({ 
          title: `${cart.product.name} 库存不足`, 
          icon: 'none' 
        })
        return
      }
    }

    // 获取默认地址
    const addressId = await ensureDefaultAddress()
    if (!addressId) {
      return
    }

    this.setState({ submitting: true })
    try {
      // 计算总金额
      const totalAmount = selectedCarts.reduce((sum, cart) => {
        return sum + (Number(cart.product.price) || 0) * cart.quantity
      }, 0)

      // 创建订单
      const order = await orderApi.create({
        totalAmount,
        addressId,
        items: selectedCarts.map(cart => ({
          productId: cart.productId,
          quantity: cart.quantity,
          price: Number(cart.product.price) || 0,
        })),
      })

      // 删除已结算的购物车商品
      for (const cartId of selectedItems) {
        await cartApi.removeItem(cartId)
      }

      Taro.showToast({ title: '下单成功', icon: 'success' })
      if (order && order.id) {
        setTimeout(() => {
          Taro.navigateTo({
            url: `/pages/order/detail/index?id=${order.id}`,
          })
        }, 500)
      }
    } catch (error) {
      Taro.showToast({ 
        title: error.message || '结算失败，请稍后重试', 
        icon: 'none' 
      })
    } finally {
      this.setState({ submitting: false })
    }
  }

  render() {
    const { loading, cartList, selectedItems, submitting } = this.state
    const store = useUserStore.getState()
    const userInfo = store && store.userInfo

    if (!userInfo) {
      return (
        <View className="cart-page">
          <View className="empty-container">
            <Text className="empty-icon">🔒</Text>
            <Text className="empty-text">请先登录</Text>
            <Button
              type="primary"
              size="medium"
              onClick={() => Taro.navigateTo({ url: '/pages/login/index' })}
              className="login-btn"
            >
              去登录
            </Button>
          </View>
        </View>
      )
    }

    if (loading) {
      return (
        <View className="cart-page">
          <View className="loading-container">
            <Text className="loading-text">加载中...</Text>
          </View>
        </View>
      )
    }

    if (cartList.length === 0) {
      return (
        <View className="cart-page">
          <View className="empty-container">
            <Text className="empty-icon">🛒</Text>
            <Text className="empty-text">购物车是空的</Text>
            <Button
              type="primary"
              size="medium"
              onClick={() => Taro.switchTab({ url: '/pages/index/index' })}
              className="go-shopping-btn"
            >
              去逛逛
            </Button>
          </View>
        </View>
      )
    }

    // 计算总金额
    const selectedCarts = cartList.filter(item => selectedItems.includes(item.id))
    const totalAmount = selectedCarts.reduce((sum, cart) => {
      return sum + (Number(cart.product.price) || 0) * cart.quantity
    }, 0)

    const isAllSelected = selectedItems.length === cartList.length && cartList.length > 0

    return (
      <View className="cart-page">
        <ScrollView scrollY className="cart-scroll">
          <View className="cart-header">
            <View className="select-all" onClick={this.handleToggleSelectAll}>
              <View className={`checkbox ${isAllSelected ? 'checked' : ''}`}>
                {isAllSelected && <Text className="check-icon">✓</Text>}
              </View>
              <Text className="select-all-text">全选</Text>
            </View>
            <View className="clear-cart" onClick={this.handleClearCart}>
              <Text className="clear-text">清空</Text>
            </View>
          </View>

          <View className="cart-list">
            {cartList.map((cart) => {
              const isSelected = selectedItems.includes(cart.id)
              const product = cart.product
              const firstImage = product.imageUrls && product.imageUrls.length > 0 
                ? product.imageUrls[0] 
                : ''

              return (
                <View key={cart.id} className="cart-item">
                  <View 
                    className={`checkbox ${isSelected ? 'checked' : ''}`}
                    onClick={() => this.handleToggleSelect(cart.id)}
                  >
                    {isSelected && <Text className="check-icon">✓</Text>}
                  </View>

                  {firstImage ? (
                    <Image
                      src={firstImage}
                      className="product-image"
                      mode="aspectFill"
                      onClick={() => {
                        Taro.navigateTo({
                          url: `/pages/product/detail/index?id=${product.id}`,
                        })
                      }}
                    />
                  ) : (
                    <View className="product-image-placeholder">
                      <Text className="placeholder-icon">🐟</Text>
                    </View>
                  )}

                  <View className="product-info">
                    <Text 
                      className="product-name"
                      onClick={() => {
                        Taro.navigateTo({
                          url: `/pages/product/detail/index?id=${product.id}`,
                        })
                      }}
                    >
                      {product.name}
                    </Text>
                    <Text className="product-price">¥{product.price}</Text>
                    <View className="quantity-control">
                      <View
                        className="quantity-btn minus"
                        onClick={() => this.handleUpdateQuantity(cart.id, cart.quantity - 1)}
                      >
                        <Text>-</Text>
                      </View>
                      <Text className="quantity-text">{cart.quantity}</Text>
                      <View
                        className="quantity-btn plus"
                        onClick={() => this.handleUpdateQuantity(cart.id, cart.quantity + 1)}
                      >
                        <Text>+</Text>
                      </View>
                    </View>
                  </View>

                  <View 
                    className="delete-btn"
                    onClick={() => this.handleRemoveItem(cart.id)}
                  >
                    <Text className="delete-icon">🗑️</Text>
                  </View>
                </View>
              )
            })}
          </View>
        </ScrollView>

        <View className="cart-footer">
          <View className="footer-left">
            <Text className="total-label">合计：</Text>
            <Text className="total-amount">¥{totalAmount.toFixed(2)}</Text>
          </View>
          <Button
            type="primary"
            size="large"
            onClick={this.handleCheckout}
            disabled={submitting || selectedItems.length === 0}
            loading={submitting}
            className="checkout-btn"
          >
            {submitting ? '结算中...' : `结算(${selectedItems.length})`}
          </Button>
        </View>
      </View>
    )
  }
}
