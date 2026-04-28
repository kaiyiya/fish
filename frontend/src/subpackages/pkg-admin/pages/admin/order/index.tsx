import { Component } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import AdminShell from '../../../../../components/admin-shell'
import { orderApi } from '../../../../../services/api'
import { Button, Input } from '../../../../../components/ui'
import { logger } from '../../../../../utils/logger'
import { isH5 } from '../../../../../utils/is-h5'
import './index.scss'

export default class AdminOrder extends Component {
  state = {
    loading: true,
    orders: [],
    userIdFilter: '',
  }

  componentDidMount() {
    this.loadOrders()
  }

  loadOrders = async (userId?: string) => {
    try {
      const orders = userId ? await orderApi.getByUserAdmin(userId) : await orderApi.getAll()
      this.setState({ orders, loading: false })
    } catch (error) {
      logger.error('加载订单列表失败', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
      this.setState({ loading: false })
    }
  }

  handleSearch = async () => {
    const { userIdFilter } = this.state
    const trimmed = String(userIdFilter || '').trim()

    if (!trimmed) {
      this.setState({ loading: true }, () => this.loadOrders())
      return
    }

    const id = Number(trimmed)
    if (!Number.isFinite(id) || id <= 0) {
      Taro.showToast({ title: '请输入有效的用户ID', icon: 'none' })
      return
    }

    this.setState({ loading: true }, () => this.loadOrders(String(id)))
  }

  getStatusText = (status) => {
    const map = {
      pending: '待支付',
      paid: '已支付',
      shipped: '已发货',
      completed: '已完成',
      cancelled: '已取消',
    }
    return map[status] || status
  }

  getStatusColor = (status) => {
    const map = {
      pending: '#faad14',
      paid: '#1890ff',
      shipped: '#722ed1',
      completed: '#52c41a',
      cancelled: '#ff4d4f',
    }
    return map[status] || '#666'
  }

  handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderApi.updateStatus(orderId, newStatus)
      Taro.showToast({ title: '更新成功', icon: 'success' })
      this.loadOrders()
    } catch (error) {
      logger.error('更新订单状态失败', error)
      Taro.showToast({ title: '更新失败', icon: 'none' })
    }
  }

  handlePay = async (orderId) => {
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
      const res = await Taro.showModal({
        title: '导出订单',
        content: '确定要导出所有订单到 Excel 表格吗？',
        confirmText: '导出',
        cancelText: '取消',
      })

      if (!res.confirm) return

      const exportUrl = orderApi.exportOrders()
      const token = Taro.getStorageSync('token')

      Taro.showLoading({ title: '生成 Excel...', mask: true })

      if (isH5 && Taro.getEnv() === Taro.ENV_TYPE.WEB) {
        // H5 环境：直接打开新窗口下载（携带 token）
        const link = document.createElement('a')
        link.href = exportUrl
        link.setAttribute(
          'header',
          `Authorization: ${token ? `Bearer ${token}` : ''}`,
        )
        // 使用 fetch 下载并创建 blob
        const response = await fetch(exportUrl, {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        })
        if (!response.ok) throw new Error('下载失败')
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `订单列表_${new Date().toISOString().split('T')[0]}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        Taro.hideLoading()
        Taro.showToast({ title: '导出成功', icon: 'success' })
      } else {
        // 小程序环境
        const downloadTask = Taro.downloadFile({
          url: exportUrl,
          header: {
            Authorization: token ? `Bearer ${token}` : '',
          },
          success: (res) => {
            Taro.hideLoading()
            if (res.statusCode === 200) {
              Taro.saveFile({
                tempFilePath: res.tempFilePath,
                success: (saveRes) => {
                  Taro.showToast({ title: '文件已保存', icon: 'success' })
                  Taro.openDocument({
                    filePath: saveRes.savedFilePath,
                  })
                },
                fail: () => {
                  Tarao.showToast({ title: '保存失败', icon: 'none' })
                },
              })
            } else {
              Taro.showToast({ title: '导出失败', icon: 'none' })
            }
          },
          fail: (err) => {
            Taro.hideLoading()
            console.error('下载失败', err)
            Taro.showToast({ title: '网络错误', icon: 'none' })
          },
        })
      }
    } catch (error) {
      Taro.hideLoading()
      logger.error('导出订单失败', error)
      Taro.showToast({ title: '导出失败', icon: 'none' })
    }
  }

  formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
  }

  renderOrderRowActions = (order) => {
    const status = String(order.status || '').trim().toLowerCase()
    const id = order.id
    return (
      <View className="order-table__actions">
        {status === 'pending' && (
          <>
            <Button
              type="primary"
              size="mini"
              className="order-table__btn"
              onClick={() => this.handlePay(id)}
            >
              已支付
            </Button>
            <Button
              type="danger"
              size="mini"
              className="order-table__btn"
              onClick={() => this.handleStatusChange(id, 'cancelled')}
            >
              取消
            </Button>
          </>
        )}
        {status === 'paid' && (
          <Button
            type="primary"
            size="mini"
            className="order-table__btn"
            onClick={() => this.handleStatusChange(id, 'shipped')}
          >
            发货
          </Button>
        )}
        {status === 'shipped' && (
          <Button
            type="primary"
            size="mini"
            className="order-table__btn"
            onClick={() => this.handleStatusChange(id, 'completed')}
          >
            完成
          </Button>
        )}
      </View>
    )
  }

  render() {
    const { loading, orders, userIdFilter } = this.state

    const page = (
      <View className={`admin-order-page ${isH5 ? 'admin-order-page--h5' : ''}`}>
        <View className="header">
          <Text className="title">订单管理</Text>
        </View>

        <View className={`search-area ${isH5 ? 'search-area--h5' : ''}`}>
          {isH5 ? (
            <View className="order-filter-h5">
              <View className="order-filter-h5__row">
                <Text className="order-filter-h5__label">用户 ID</Text>
                <Input
                  type="digit"
                  value={userIdFilter}
                  placeholder="留空为全部"
                  onInput={(e) => this.setState({ userIdFilter: e.detail.value })}
                  className="order-filter-h5__input search-input"
                />
                <Button
                  type="primary"
                  size="small"
                  onClick={this.handleSearch}
                  loading={loading}
                  className="order-filter-h5__query search-btn"
                >
                  查询
                </Button>
                <Text
                  className="order-filter-h5__reset"
                  onClick={() => this.setState({ userIdFilter: '' }, () => this.loadOrders())}
                >
                  查看全部
                </Text>
              </View>
            </View>
          ) : (
            <>
              <View className="search-row">
                <Input
                  type="digit"
                  value={userIdFilter}
                  placeholder="输入用户ID（可选）"
                  onInput={(e) => this.setState({ userIdFilter: e.detail.value })}
                  className="search-input"
                />
                <Button
                  type="primary"
                  size="small"
                  onClick={this.handleSearch}
                  loading={loading}
                  className="search-btn"
                >
                  查询
                </Button>
              </View>
              <View className="reset-row">
                <View
                  className="reset-btn"
                  onClick={() => this.setState({ userIdFilter: '' }, () => this.loadOrders())}
                >
                  <Text>查看全部</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {isH5 ? (
          <View className="list-scroll list-scroll--h5 list-section--enterprise">
            <View className="enterprise-list-header">
              <View className="enterprise-list-header__left">
                <Text className="enterprise-list-header__title">订单列表</Text>
                <Text className="enterprise-list-header__meta">
                  {loading ? '加载中…' : `共 ${orders.length} 单`}
                </Text>
              </View>
              <View
                className="enterprise-list-header__export"
                onClick={this.handleExportOrders}
              >
                <Text className="enterprise-list-header__export-text">导出 Excel</Text>
              </View>
            </View>
            {loading ? (
              <View className="empty">
                <Text>加载中...</Text>
              </View>
            ) : orders.length === 0 ? (
              <View className="empty">
                <Text>暂无订单</Text>
              </View>
            ) : (
              <View className="order-table-wrap">
                <View className="order-table">
                  <View className="order-table__thead">
                    <View className="order-table__tr order-table__tr--head">
                      <View className="order-table__th order-table__col-no">订单号</View>
                      <View className="order-table__th order-table__col-time">下单时间</View>
                      <View className="order-table__th order-table__col-status">状态</View>
                      <View className="order-table__th order-table__col-user">用户ID</View>
                      <View className="order-table__th order-table__col-qty">件数</View>
                      <View className="order-table__th order-table__col-amount">金额</View>
                      <View className="order-table__th order-table__col-actions">操作</View>
                    </View>
                  </View>
                  <View className="order-table__tbody">
                    {orders.map((order) => {
                      const status = String(order.status || '').trim().toLowerCase()
                      return (
                        <View key={order.id} className="order-table__tr order-table__tr--data">
                          <View className="order-table__td order-table__col-no">
                            <Text className="order-table__mono order-table__order-no">{order.orderNo}</Text>
                          </View>
                          <View className="order-table__td order-table__col-time">
                            <Text className="order-table__time">{this.formatDate(order.created_at)}</Text>
                          </View>
                          <View className="order-table__td order-table__col-status">
                            <View
                              className={`order-table__badge order-table__badge--${
                                ['pending', 'paid', 'shipped', 'completed', 'cancelled'].includes(status)
                                  ? status
                                  : 'unknown'
                              }`}
                            >
                              <Text className="order-table__badge-text">{this.getStatusText(status)}</Text>
                            </View>
                          </View>
                          <View className="order-table__td order-table__col-user">
                            <Text>{order.userId}</Text>
                          </View>
                          <View className="order-table__td order-table__col-qty">
                            <Text>{order.items?.length || 0}</Text>
                          </View>
                          <View className="order-table__td order-table__col-amount">
                            <Text className="order-table__amount">¥{order.totalAmount}</Text>
                          </View>
                          <View className="order-table__td order-table__col-actions">
                            {this.renderOrderRowActions(order)}
                          </View>
                        </View>
                      )
                    })}
                  </View>
                </View>
              </View>
            )}
          </View>
        ) : (
          <ScrollView scrollY className="list-scroll">
            {loading ? (
              <View className="empty">
                <Text>加载中...</Text>
              </View>
            ) : orders.length === 0 ? (
              <View className="empty">
                <Text>暂无订单</Text>
              </View>
            ) : (
              orders.map((order) => (
                <View key={order.id} className="order-card">
                  {(() => {
                    const status = String(order.status || '').trim().toLowerCase()
                    return (
                      <>
                        <View className="card-header">
                          <View className="header-left">
                            <Text className="order-no">订单号：{order.orderNo}</Text>
                            <Text className="order-time">{this.formatDate(order.created_at)}</Text>
                          </View>
                          <View
                            className="status-badge"
                            style={{ backgroundColor: this.getStatusColor(status) }}
                          >
                            <Text className="status-text">{this.getStatusText(status)}</Text>
                          </View>
                        </View>

                        <View className="card-body">
                          <View className="info-row">
                            <Text className="label">用户ID：</Text>
                            <Text className="value">{order.userId}</Text>
                          </View>
                          {order.receiverName ? (
                            <View className="info-row">
                              <Text className="label">收货人：</Text>
                              <Text className="value">{order.receiverName}</Text>
                            </View>
                          ) : null}
                          {order.fullAddress ? (
                            <View className="info-row">
                              <Text className="label">收货地址：</Text>
                              <Text className="value">{order.fullAddress}</Text>
                            </View>
                          ) : null}
                          <View className="info-row">
                            <Text className="label">商品数量：</Text>
                            <Text className="value">{order.items?.length || 0} 件</Text>
                          </View>
                          <View className="info-row">
                            <Text className="label">总金额：</Text>
                            <Text className="price">¥{order.totalAmount}</Text>
                          </View>
                        </View>

                        <View className="card-footer">
                          {status === 'pending' && (
                            <View className="admin-action-buttons">
                              <View
                                className="admin-action-btn admin-btn-secondary"
                                onClick={() => this.handlePay(order.id)}
                              >
                                <Text className="btn-text">标记已支付</Text>
                              </View>
                              <View
                                className="admin-action-btn admin-btn-danger"
                                onClick={() => this.handleStatusChange(order.id, 'cancelled')}
                              >
                                <Text className="btn-text">取消订单</Text>
                              </View>
                            </View>
                          )}
                          {status === 'paid' && (
                            <View
                              className="admin-action-btn admin-btn-secondary single"
                              onClick={() => this.handleStatusChange(order.id, 'shipped')}
                            >
                              <Text className="btn-text">标记已发货</Text>
                            </View>
                          )}
                          {status === 'shipped' && (
                            <View
                              className="admin-action-btn admin-btn-secondary single"
                              onClick={() => this.handleStatusChange(order.id, 'completed')}
                            >
                              <Text className="btn-text">标记已完成</Text>
                            </View>
                          )}
                        </View>
                      </>
                    )
                  })()}
                </View>
              ))
            )}
          </ScrollView>
        )}
      </View>
    )

    if (isH5) {
      return (
        <AdminShell
          title="订单管理"
          breadcrumb={[
            { label: '管理后台', path: '/subpackages/pkg-admin/pages/admin/index' },
            { label: '订单管理' },
          ]}
        >
          {page}
        </AdminShell>
      )
    }

    return page
  }
}
