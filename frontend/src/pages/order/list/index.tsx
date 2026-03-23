import { Component } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { orderApi } from '../../../services/api'
import { logger } from '../../../utils/logger'
import './index.scss'

export default class OrderList extends Component {
  state = {
    loading: true,
    orders: [],
    statusFilter: 'all', // all, pending, paid, shipped, completed, cancelled
  }

  componentDidMount() {
    this.loadOrders()
  }

  loadOrders = async () => {
    try {
      const orders = await orderApi.getList()
      this.setState({ orders, loading: false })
    } catch (error) {
      logger.error('加载订单列表失败', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
      this.setState({ loading: false })
    }
  }

  handleOrderClick = (id) => {
    Taro.navigateTo({
      url: `/pages/order/detail/index?id=${id}`,
    })
  }

  handleCancelOrder = async (e, orderId) => {
    e.stopPropagation()
    const res = await Taro.showModal({
      title: '确认取消',
      content: '确定要取消这个订单吗？',
    })
    if (res.confirm) {
      try {
        await orderApi.cancel(orderId)
        Taro.showToast({ title: '订单已取消', icon: 'success' })
        this.loadOrders()
      } catch (error) {
        logger.error('取消订单失败', error)
        Taro.showToast({ title: error.message || '取消失败', icon: 'none' })
      }
    }
  }

  handlePayOrder = async (e, orderId) => {
    e.stopPropagation()
    try {
      await orderApi.simulatePay(orderId)
      Taro.showToast({ title: '支付成功', icon: 'success' })
      this.loadOrders()
    } catch (error) {
      logger.error('支付失败', error)
      Taro.showToast({ title: error.message || '支付失败', icon: 'none' })
    }
  }

  handleExportOrders = async () => {
    try {
      // 检查是否是管理员（可以在用户信息中存储 role）
      const userInfo = Taro.getStorageSync('userInfo')
      if (!userInfo || userInfo.role !== 'admin') {
        Taro.showToast({
          title: '仅限管理员操作',
          icon: 'none',
          duration: 2000,
        })
        return
      }

      // 确认导出
      const res = await Taro.showModal({
        title: '导出订单',
        content: '确定要导出所有订单到 Excel 表格吗？',
        confirmText: '导出',
        cancelText: '取消',
      })

      if (res.confirm) {
        // 使用 Taro.downloadFile 来下载文件
        const exportUrl = orderApi.exportOrders()
        
        // 获取 token 并添加到请求头
        const token = Taro.getStorageSync('token')
        
        Taro.showLoading({ title: '生成 Excel...', mask: true })
        
        // 使用 downloadFile API 下载文件
        const downloadTask = Taro.downloadFile({
          url: exportUrl,
          header: {
            Authorization: token ? `Bearer ${token}` : '',
          },
          success: (res) => {
            Taro.hideLoading()
            if (res.statusCode === 200) {
              // H5 环境下，直接打开新窗口下载
              if (Taro.getEnv() === Taro.ENV_TYPE.WEB) {
                window.open(exportUrl, '_blank')
              } else {
                // 小程序环境保存文件
                Taro.saveFile({
                  tempFilePath: res.tempFilePath,
                  success: (saveRes) => {
                    Taro.showToast({
                      title: '文件已保存',
                      icon: 'success',
                    })
                    // 可以打开文件查看
                    Taro.openDocument({
                      filePath: saveRes.savedFilePath,
                    })
                  },
                  fail: (err) => {
                    console.error('保存文件失败', err)
                    Taro.showToast({
                      title: '保存失败',
                      icon: 'none',
                    })
                  },
                })
              }
            } else {
              Taro.showToast({
                title: '导出失败',
                icon: 'none',
              })
            }
          },
          fail: (err) => {
            Taro.hideLoading()
            console.error('下载失败', err)
            Taro.showToast({
              title: '网络错误',
              icon: 'none',
            })
          },
        })
      }
    } catch (error) {
      logger.error('导出订单失败', error)
      Taro.showToast({
        title: '导出失败',
        icon: 'none',
      })
    }
  }

  getStatusText = (status) => {
    const statusMap = {
      pending: '待支付',
      paid: '待发货',
      shipped: '待收货',
      completed: '已完成',
      cancelled: '已取消',
    }
    return statusMap[status] || status
  }

  getStatusClass = (status) => {
    const statusClassMap = {
      pending: 'status-pending',
      paid: 'status-paid',
      shipped: 'status-shipped',
      completed: 'status-completed',
      cancelled: 'status-cancelled',
    }
    return statusClassMap[status] || ''
  }

  formatDate = (str) => {
    if (!str) return ''
    try {
      const d = new Date(str)
      const month = (d.getMonth() + 1).toString().padStart(2, '0')
      const day = d.getDate().toString().padStart(2, '0')
      const hours = d.getHours().toString().padStart(2, '0')
      const minutes = d.getMinutes().toString().padStart(2, '0')
      return `${month}-${day} ${hours}:${minutes}`
    } catch (e) {
      return str
    }
  }

  getFilteredOrders = () => {
    const { orders, statusFilter } = this.state
    if (statusFilter === 'all') {
      return orders
    }
    return orders.filter((order) => order.status === statusFilter)
  }

  render() {
    const { loading, statusFilter } = this.state
    const filteredOrders = this.getFilteredOrders()

    return (
      <View className="order-list-page">
        {/* 状态筛选 */}
        <View className="status-filter">
          <View
            className={`filter-item ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => this.setState({ statusFilter: 'all' })}
          >
            <Text>全部</Text>
          </View>
          <View
            className={`filter-item ${statusFilter === 'pending' ? 'active' : ''}`}
            onClick={() => this.setState({ statusFilter: 'pending' })}
          >
            <Text>待支付</Text>
          </View>
          <View
            className={`filter-item ${statusFilter === 'paid' ? 'active' : ''}`}
            onClick={() => this.setState({ statusFilter: 'paid' })}
          >
            <Text>待发货</Text>
          </View>
          <View
            className={`filter-item ${statusFilter === 'shipped' ? 'active' : ''}`}
            onClick={() => this.setState({ statusFilter: 'shipped' })}
          >
            <Text>待收货</Text>
          </View>
          <View
            className={`filter-item ${statusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => this.setState({ statusFilter: 'completed' })}
          >
            <Text>已完成</Text>
          </View>
          
          {/* 导出按钮（仅管理员可见） */}
          {(() => {
            const userInfo = typeof Taro !== 'undefined' && Taro.getStorageSync ? Taro.getStorageSync('userInfo') : null
            return userInfo?.role === 'admin' && (
              <View
                className="filter-item export-btn"
                onClick={this.handleExportOrders}
              >
                <Text>📊 导出 Excel</Text>
              </View>
            )
          })()}
        </View>

        {loading ? (
          <View className="loading-state">
            <View className="loading-spinner">
              <View className="spinner-dot"></View>
              <View className="spinner-dot"></View>
              <View className="spinner-dot"></View>
            </View>
            <Text className="loading-text">加载中...</Text>
          </View>
        ) : filteredOrders.length === 0 ? (
          <View className="empty-state">
            <Text className="empty-icon">📋</Text>
            <Text className="empty-text">暂无订单</Text>
            <Text className="empty-hint">
              {statusFilter === 'all' ? '快去选购心仪的商品吧' : '该状态下暂无订单'}
            </Text>
          </View>
        ) : (
          <ScrollView scrollY className="order-scroll">
            {filteredOrders.map((order) => {
              const totalQuantity = order.items
                ? order.items.reduce((sum, item) => sum + item.quantity, 0)
                : 0
              const firstItem = order.items && order.items.length > 0 ? order.items[0] : null
              const firstProduct = firstItem?.product || null

              return (
                <View
                  key={order.id}
                  className="order-item"
                  onClick={() => this.handleOrderClick(order.id)}
                >
                  {/* 订单头部 */}
                  <View className="order-header">
                    <View className="order-info">
                      <Text className="order-no">订单号：{order.orderNo || order.id}</Text>
                      <Text className="order-date">{this.formatDate(order.created_at)}</Text>
                    </View>
                    <View className={`status-badge ${this.getStatusClass(order.status)}`}>
                      <Text className="status-text">{this.getStatusText(order.status)}</Text>
                    </View>
                  </View>

                  {/* 商品信息 */}
                  {firstProduct ? (
                    <View className="product-section">
                      <Image
                        src={
                          firstProduct.imageUrls && firstProduct.imageUrls.length > 0
                            ? firstProduct.imageUrls[0]
                            : ''
                        }
                        className="product-image"
                        mode="aspectFill"
                      />
                      <View className="product-info">
                        <Text className="product-name" numberOfLines={2}>
                          {firstProduct.name}
                        </Text>
                        <Text className="product-quantity">
                          共{totalQuantity}件商品
                        </Text>
                      </View>
                      <View className="product-price">
                        <Text className="price-symbol">¥</Text>
                        <Text className="price-amount">{order.totalAmount}</Text>
                      </View>
                    </View>
                  ) : (
                    <View className="product-section">
                      <View className="product-image-placeholder">
                        <Text className="placeholder-icon">🐟</Text>
                      </View>
                      <View className="product-info">
                        <Text className="product-name">商品信息加载中...</Text>
                        <Text className="product-quantity">
                          共{totalQuantity}件商品
                        </Text>
                      </View>
                      <View className="product-price">
                        <Text className="price-symbol">¥</Text>
                        <Text className="price-amount">{order.totalAmount}</Text>
                      </View>
                    </View>
                  )}

                  {/* 订单操作 */}
                  <View className="order-actions" onClick={(e) => e.stopPropagation()}>
                    {order.status === 'pending' ? (
                      <View className="action-buttons-wrapper">
                        <View
                          className="action-btn cancel-btn"
                          onClick={(e) => this.handleCancelOrder(e, order.id)}
                        >
                          <Text className="btn-text">取消订单</Text>
                        </View>
                        <View
                          className="action-btn pay-btn"
                          onClick={(e) => this.handlePayOrder(e, order.id)}
                        >
                          <Text className="btn-text">立即支付</Text>
                        </View>
                      </View>
                    ) : order.status === 'paid' ? (
                      <View
                        className="action-btn detail-btn"
                        onClick={() => this.handleOrderClick(order.id)}
                      >
                        <Text className="btn-text">查看详情</Text>
                      </View>
                    ) : order.status === 'shipped' ? (
                      <View
                        className="action-btn detail-btn primary"
                        onClick={() => this.handleOrderClick(order.id)}
                      >
                        <Text className="btn-text">查看物流</Text>
                      </View>
                    ) : order.status === 'completed' ? (
                      <View
                        className="action-btn detail-btn"
                        onClick={() => this.handleOrderClick(order.id)}
                      >
                        <Text className="btn-text">再次购买</Text>
                      </View>
                    ) : (
                      <View
                        className="action-btn detail-btn"
                        onClick={() => this.handleOrderClick(order.id)}
                      >
                        <Text className="btn-text">查看详情</Text>
                      </View>
                    )}
                  </View>
                </View>
              )
            })}
          </ScrollView>
        )}
      </View>
    )
  }
}
