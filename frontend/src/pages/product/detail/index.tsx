import { Component } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { productApi, orderApi, cartApi, reviewApi, favoriteApi } from '../../../services/api'
import { ensureDefaultAddress } from '../../../utils/address'
import { logger } from '../../../utils/logger'
import { Button, Input } from '../../../components/ui'
import { useUserStore } from '../../../store/user'
import './index.scss'

export default class ProductDetail extends Component {
  state = {
    loading: true,
    submitting: false,
    addingToCart: false,
    editing: false,
    saving: false,
    product: null,
    editForm: {
      price: '',
      stock: '',
    },
    reviews: [],
    rating: { average: 0, count: 0 },
    showReviewForm: false,
    reviewForm: {
      rating: 5,
      content: '',
    },
    submittingReview: false,
    isFavorite: false,
    favoriteLoading: false,
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
      const store = useUserStore.getState()
      const userInfo = store && store.userInfo
      
      const [product, ratingData] = await Promise.all([
        productApi.getDetail(id),
        reviewApi.getProductRating(id).catch(() => ({ average: 0, count: 0 })),
      ])
      
      // 处理imageUrls数据格式
      if (product) {
        let imageUrls = product.imageUrls
        if (typeof imageUrls === 'string') {
          try {
            imageUrls = JSON.parse(imageUrls)
          } catch (e) {
            imageUrls = imageUrls ? [imageUrls] : []
          }
        } else if (!Array.isArray(imageUrls)) {
          imageUrls = []
        }
        product.imageUrls = imageUrls || []
      }
      
      this.setState({ 
        product, 
        loading: false,
        rating: ratingData,
        editForm: {
          price: String(product.price || ''),
          stock: String(product.stock || ''),
        },
      })
      
      // 加载评价列表
      this.loadReviews(id)
      
      // 检查是否已收藏
      if (userInfo) {
        this.checkFavorite(id)
      }
    } catch (error) {
      logger.error('加载商品详情失败', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
      this.setState({ loading: false })
    }
  }

  checkFavorite = async (productId) => {
    try {
      const result = await favoriteApi.check(productId)
      this.setState({ isFavorite: result.isFavorite })
    } catch (error) {
      logger.error('检查收藏状态失败', error)
    }
  }

  handleToggleFavorite = async () => {
    const { product, isFavorite, favoriteLoading } = this.state
    if (!product || favoriteLoading) return

    this.setState({ favoriteLoading: true })
    try {
      if (isFavorite) {
        await favoriteApi.remove(product.id)
        this.setState({ isFavorite: false })
        Taro.showToast({ title: '已取消收藏', icon: 'success' })
      } else {
        await favoriteApi.add(product.id)
        this.setState({ isFavorite: true })
        Taro.showToast({ title: '已收藏', icon: 'success' })
      }
    } catch (error) {
      logger.error('操作收藏失败', error)
      Taro.showToast({ 
        title: error.message || '操作失败', 
        icon: 'none' 
      })
    } finally {
      this.setState({ favoriteLoading: false })
    }
  }

  loadReviews = async (productId) => {
    try {
      const result = await reviewApi.getProductReviews(productId, { page: 1, limit: 10 })
      this.setState({ reviews: result.reviews || [] })
    } catch (error) {
      logger.error('加载评价失败', error)
    }
  }

  handleSubmitReview = async () => {
    const { product, reviewForm, submittingReview } = this.state
    if (!product || submittingReview) return

    if (!reviewForm.rating) {
      Taro.showToast({ title: '请选择评分', icon: 'none' })
      return
    }

    this.setState({ submittingReview: true })
    try {
      await reviewApi.create({
        productId: product.id,
        rating: reviewForm.rating,
        content: reviewForm.content || '',
      })
      Taro.showToast({ title: '评价成功', icon: 'success' })
      this.setState({ 
        showReviewForm: false,
        reviewForm: { rating: 5, content: '' },
      })
      // 重新加载评价和评分
      await Promise.all([
        this.loadReviews(product.id),
        reviewApi.getProductRating(product.id).then(rating => {
          this.setState({ rating })
        }),
      ])
    } catch (error) {
      logger.error('提交评价失败', error)
      Taro.showToast({ 
        title: error.message || '评价失败，请稍后重试', 
        icon: 'none' 
      })
    } finally {
      this.setState({ submittingReview: false })
    }
  }

  handleEdit = () => {
    const { product } = this.state
    if (product) {
      this.setState({
        editing: true,
        editForm: {
          price: String(product.price || ''),
          stock: String(product.stock || ''),
        },
      })
    }
  }

  handleCancelEdit = () => {
    const { product } = this.state
    if (product) {
      this.setState({
        editing: false,
        editForm: {
          price: String(product.price || ''),
          stock: String(product.stock || ''),
        },
      })
    }
  }

  handleEditChange = (key, value) => {
    this.setState((prevState) => ({
      editForm: {
        ...prevState.editForm,
        [key]: value,
      },
    }))
  }

  handleSaveEdit = async () => {
    const { product, editForm, saving } = this.state
    if (!product || saving) return

    const price = Number(editForm.price)
    const stock = Number(editForm.stock)

    if (isNaN(price) || price <= 0) {
      Taro.showToast({ title: '请输入有效的价格', icon: 'none' })
      return
    }
    if (isNaN(stock) || stock < 0) {
      Taro.showToast({ title: '请输入有效的库存数量', icon: 'none' })
      return
    }

    this.setState({ saving: true })
    try {
      await productApi.update(product.id, {
        price,
        stock,
      })
      Taro.showToast({ title: '保存成功', icon: 'success' })
      // 重新加载商品详情
      await this.loadDetail(product.id)
      this.setState({ editing: false })
    } catch (error) {
      logger.error('保存失败', error)
      Taro.showToast({
        title: error.message || '保存失败',
        icon: 'none',
      })
    } finally {
      this.setState({ saving: false })
    }
  }

  handleImageClick = (imageUrl) => {
    if (!imageUrl) return
    Taro.previewImage({
      urls: this.state.product?.imageUrls || [imageUrl],
      current: imageUrl,
    })
  }

  handleAddToCart = async () => {
    const { product, addingToCart } = this.state
    if (!product || addingToCart) return

    // 检查登录状态
    const store = useUserStore.getState()
    const userInfo = store && store.userInfo
    if (!userInfo) {
      Taro.showModal({
        title: '需要登录',
        content: '加入购物车需要先登录，是否前往登录？',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({ url: '/pages/login/index' })
          }
        },
      })
      return
    }

    if (product.stock !== undefined && product.stock === 0) {
      Taro.showToast({ title: '商品已售罄', icon: 'none' })
      return
    }

    this.setState({ addingToCart: true })
    try {
      logger.info('加入购物车请求', { productId: product.id, quantity: 1 })
      const result = await cartApi.addToCart({
        productId: product.id,
        quantity: 1,
      })
      logger.info('加入购物车成功', result)
      Taro.showToast({ title: '已加入购物车', icon: 'success', duration: 2000 })
    } catch (error) {
      logger.error('加入购物车失败', error)
      const errorMessage = error?.message || error?.data?.message || '加入购物车失败，请稍后重试'
      Taro.showToast({ 
        title: errorMessage, 
        icon: 'none',
        duration: 3000
      })
    } finally {
      this.setState({ addingToCart: false })
    }
  }

  handleBuyNow = async () => {
    const { product, submitting } = this.state
    if (!product || submitting) return

    if (product.stock !== undefined && product.stock === 0) {
      Taro.showToast({ title: '商品已售罄', icon: 'none' })
      return
    }

    // 获取默认地址
    const addressId = await ensureDefaultAddress()
    if (!addressId) {
      return
    }

    this.setState({ submitting: true })
    try {
      const quantity = 1
      const price = Number(product.price) || 0
      const totalAmount = quantity * price

      const order = await orderApi.create({
        totalAmount,
        addressId,
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
      Taro.showToast({ 
        title: error.message || '下单失败，请稍后重试', 
        icon: 'none' 
      })
    } finally {
      this.setState({ submitting: false })
    }
  }

  render() {
    const { 
      loading, 
      product, 
      submitting, 
      editing, 
      saving, 
      editForm,
      rating,
      reviews,
      showReviewForm,
      reviewForm,
      submittingReview,
      isFavorite,
      addingToCart,
    } = this.state
    const store = useUserStore.getState()
    const userInfo = store && store.userInfo
    const isAdmin = userInfo && userInfo.role === 'admin'

    if (loading) {
      return (
        <View className="product-detail">
          <View className="loading-container">
            <View className="loading-spinner">
              <View className="spinner-dot"></View>
              <View className="spinner-dot"></View>
              <View className="spinner-dot"></View>
            </View>
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
            <View className="detail-header-row">
              <Text className="detail-name">{product.name}</Text>
              <View className="header-actions">
                {userInfo && !isAdmin && !editing && (
                  <View 
                    className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                    onClick={this.handleToggleFavorite}
                  >
                    <Text className="favorite-icon">
                      {isFavorite ? '❤️' : '🤍'}
                    </Text>
                  </View>
                )}
                {isAdmin && !editing && (
                  <Button
                    type="default"
                    size="small"
                    onClick={this.handleEdit}
                    className="edit-btn"
                  >
                    编辑
                  </Button>
                )}
              </View>
            </View>
            {editing ? (
              <View className="edit-form">
                <View className="edit-item">
                  <Text className="edit-label">价格</Text>
                  <Input
                    type="digit"
                    value={editForm.price}
                    onInput={(e) => this.handleEditChange('price', e.detail.value)}
                    placeholder="请输入价格"
                    prefix="¥"
                  />
                </View>
                <View className="edit-item">
                  <Text className="edit-label">库存</Text>
                  <Input
                    type="number"
                    value={editForm.stock}
                    onInput={(e) => this.handleEditChange('stock', e.detail.value)}
                    placeholder="请输入库存"
                  />
                </View>
                <View className="edit-actions">
                  <Button
                    type="default"
                    size="medium"
                    onClick={this.handleCancelEdit}
                    className="cancel-edit-btn"
                  >
                    取消
                  </Button>
                  <Button
                    type="primary"
                    size="medium"
                    onClick={this.handleSaveEdit}
                    loading={saving}
                    className="save-edit-btn"
                  >
                    {saving ? '保存中...' : '保存'}
                  </Button>
                </View>
              </View>
            ) : (
              <View className="price-row">
                <View className="price-wrapper">
                  <Text className="price-symbol">¥</Text>
                  <Text className="detail-price">{product.price}</Text>
                </View>
                {product.stock !== undefined && (
                  <View className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    <Text className="stock-icon">{product.stock > 0 ? '✓' : '✗'}</Text>
                    <Text className="stock-info">库存 {product.stock}件</Text>
                  </View>
                )}
              </View>
            )}
          </View>

          {product.description ? (
            <View className="detail-section">
              <Text className="section-title">商品描述</Text>
              <View className="section-content-wrapper">
                <Text className="section-content" selectable>{product.description}</Text>
              </View>
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

          {/* 评价区域 */}
          <View className="detail-section review-section">
            <View className="review-header">
              <Text className="section-title">商品评价</Text>
              {rating.count > 0 && (
                <View className="rating-summary">
                  <Text className="rating-score">{rating.average.toFixed(1)}</Text>
                  <Text className="rating-stars">
                    {'⭐'.repeat(Math.round(rating.average))}
                  </Text>
                  <Text className="rating-count">({rating.count}条评价)</Text>
                </View>
              )}
            </View>
            
            {userInfo && !showReviewForm && (
              <Button
                type="default"
                size="small"
                onClick={() => this.setState({ showReviewForm: true })}
                className="write-review-btn"
              >
                写评价
              </Button>
            )}

            {showReviewForm && userInfo && (
              <View className="review-form">
                <View className="rating-selector">
                  <Text className="rating-label">评分：</Text>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Text
                      key={star}
                      className={`star ${reviewForm.rating >= star ? 'active' : ''}`}
                      onClick={() => this.setState({
                        reviewForm: { ...reviewForm, rating: star }
                      })}
                    >
                      ⭐
                    </Text>
                  ))}
                </View>
                <Input
                  type="text"
                  value={reviewForm.content}
                  onInput={(e) => this.setState({
                    reviewForm: { ...reviewForm, content: e.detail.value }
                  })}
                  placeholder="写下您的评价..."
                  className="review-input"
                />
                <View className="review-form-actions">
                  <Button
                    type="default"
                    size="small"
                    onClick={() => this.setState({ 
                      showReviewForm: false,
                      reviewForm: { rating: 5, content: '' }
                    })}
                  >
                    取消
                  </Button>
                  <Button
                    type="primary"
                    size="small"
                    onClick={this.handleSubmitReview}
                    loading={submittingReview}
                  >
                    {submittingReview ? '提交中...' : '提交'}
                  </Button>
                </View>
              </View>
            )}

            {reviews.length > 0 ? (
              <View className="review-list">
                {reviews.map((review) => (
                  <View key={review.id} className="review-item">
                    <View className="review-user">
                      <Text className="review-username">
                        {review.user?.username || '匿名用户'}
                      </Text>
                      <Text className="review-rating">
                        {'⭐'.repeat(review.rating)}
                      </Text>
                    </View>
                    {review.content && (
                      <Text className="review-content">{review.content}</Text>
                    )}
                    <Text className="review-time">
                      {new Date(review.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View className="no-reviews-wrapper">
                <Text className="no-reviews-icon">💬</Text>
                <Text className="no-reviews">暂无评价</Text>
                <Text className="no-reviews-hint">成为第一个评价的用户吧</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {!editing && (
          <View className="detail-footer">
            <Button
              type="default"
              size="large"
              onClick={this.handleAddToCart}
              disabled={addingToCart || (product.stock !== undefined && product.stock === 0)}
              loading={addingToCart}
              className="add-cart-btn"
            >
              {addingToCart ? '添加中...' : '加入购物车'}
            </Button>
            <Button
              type="primary"
              size="large"
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
        )}
      </View>
    )
  }
}
