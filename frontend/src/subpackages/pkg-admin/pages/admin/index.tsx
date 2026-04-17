import { Component, type ReactNode } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import AdminShell from '../../../../components/admin-shell'
import { statisticsApi, productApi, orderApi } from '../../../../services/api'
import { logger } from '../../../../utils/logger'
import { isH5 } from '../../../../utils/is-h5'
import './index.scss'

const MenuIcon: Record<string, ReactNode> = {
  product: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="admin-dashboard__svg">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="M3.27 6.96 12 12.01l8.73-5.05" />
      <path d="M12 22.08V12" />
    </svg>
  ),
  order: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="admin-dashboard__svg">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
    </svg>
  ),
  category: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="admin-dashboard__svg">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <path d="M7 7h.01" />
    </svg>
  ),
  data: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="admin-dashboard__svg">
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="admin-dashboard__svg">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
}

export default class AdminDashboard extends Component {
  state = {
    loading: true,
    stats: {
      totalProducts: 0,
      totalOrders: 0,
      totalUsers: 0,
      recognitionCount: 0,
    },
  }

  componentDidMount() {
    this.loadStats()
  }

  loadStats = async () => {
    try {
      const [products, orders, recognitionStats] = await Promise.all([
        productApi.getList(),
        orderApi.getAll().catch(() => []),
        statisticsApi.getRecognition({}).catch(() => ({ total: 0 })),
      ])

      this.setState({
        stats: {
          totalProducts: products.length || 0,
          totalOrders: orders.length || 0,
          totalUsers: 0,
          recognitionCount: recognitionStats.total || 0,
        },
        loading: false,
      })
    } catch (error) {
      logger.error('加载统计数据失败', error)
      this.setState({ loading: false })
    }
  }

  navigateTo = (url) => {
    Taro.navigateTo({ url })
  }

  render() {
    const { loading, stats } = this.state

    const inner = (
      <View className={`admin-dashboard ${isH5 ? 'admin-dashboard--h5' : ''}`}>
        {!isH5 && (
          <View className="header">
            <Text className="title">后台管理</Text>
          </View>
        )}

        {isH5 ? (
          <View className="content">
            {loading ? (
              <View className="admin-dashboard__loading">
                <Text>加载中…</Text>
              </View>
            ) : (
              <>
                <View className="admin-dashboard__welcome">
                  <Text className="admin-dashboard__welcome-title">工作台</Text>
                  <Text className="admin-dashboard__welcome-desc">核心业务数据与快捷入口</Text>
                </View>

                <View className="stats-grid">
                  <View className="stat-card">
                    <Text className="stat-value">{stats.totalProducts}</Text>
                    <Text className="stat-label">商品总数</Text>
                  </View>
                  <View className="stat-card">
                    <Text className="stat-value">{stats.totalOrders}</Text>
                    <Text className="stat-label">订单总数</Text>
                  </View>
                  <View className="stat-card">
                    <Text className="stat-value">{stats.recognitionCount}</Text>
                    <Text className="stat-label">识别次数</Text>
                  </View>
                  <View className="stat-card">
                    <Text className="stat-value">{stats.totalUsers}</Text>
                    <Text className="stat-label">用户总数</Text>
                  </View>
                </View>

                <View className="menu-section">
                  <Text className="section-title">数据管理</Text>
                  <View className="menu-grid">
                    <View
                      className="menu-item"
                      onClick={() => this.navigateTo('/subpackages/pkg-admin/pages/admin/product/index')}
                    >
                      <View className="menu-icon-wrap menu-icon-wrap--a">{MenuIcon.product}</View>
                      <Text className="menu-text">商品管理</Text>
                      <Text className="menu-desc">维护商品与库存</Text>
                    </View>
                    <View
                      className="menu-item"
                      onClick={() => this.navigateTo('/subpackages/pkg-admin/pages/admin/order/index')}
                    >
                      <View className="menu-icon-wrap menu-icon-wrap--b">{MenuIcon.order}</View>
                      <Text className="menu-text">订单管理</Text>
                      <Text className="menu-desc">处理订单状态</Text>
                    </View>
                    <View
                      className="menu-item"
                      onClick={() => this.navigateTo('/subpackages/pkg-admin/pages/admin/category/index')}
                    >
                      <View className="menu-icon-wrap menu-icon-wrap--c">{MenuIcon.category}</View>
                      <Text className="menu-text">分类管理</Text>
                      <Text className="menu-desc">商品分类与排序</Text>
                    </View>
                    <View
                      className="menu-item"
                      onClick={() => this.navigateTo('/subpackages/pkg-admin/pages/admin/data-center/index')}
                    >
                      <View className="menu-icon-wrap menu-icon-wrap--d">{MenuIcon.data}</View>
                      <Text className="menu-text">数据中心</Text>
                      <Text className="menu-desc">销售与偏好分析</Text>
                    </View>
                    <View
                      className="menu-item menu-item--wide"
                      onClick={() => this.navigateTo('/subpackages/pkg-admin/pages/admin/user-center/index')}
                    >
                      <View className="menu-icon-wrap menu-icon-wrap--e">{MenuIcon.user}</View>
                      <Text className="menu-text">用户充值 / 改密</Text>
                      <Text className="menu-desc">钱包与账号安全</Text>
                    </View>
                  </View>
                </View>
              </>
            )}
          </View>
        ) : (
          <ScrollView scrollY className="content">
            <View className="stats-grid">
              <View className="stat-card blue">
                <Text className="stat-value">{stats.totalProducts}</Text>
                <Text className="stat-label">商品总数</Text>
              </View>
              <View className="stat-card green">
                <Text className="stat-value">{stats.totalOrders}</Text>
                <Text className="stat-label">订单总数</Text>
              </View>
              <View className="stat-card orange">
                <Text className="stat-value">{stats.recognitionCount}</Text>
                <Text className="stat-label">识别次数</Text>
              </View>
              <View className="stat-card purple">
                <Text className="stat-value">{stats.totalUsers}</Text>
                <Text className="stat-label">用户总数</Text>
              </View>
            </View>

            <View className="menu-section">
              <Text className="section-title">数据管理</Text>
              <View className="menu-grid">
                <View
                  className="menu-item"
                  onClick={() => this.navigateTo('/subpackages/pkg-admin/pages/admin/product/index')}
                >
                  <View className="menu-icon product">📦</View>
                  <Text className="menu-text">商品管理</Text>
                </View>
                <View
                  className="menu-item"
                  onClick={() => this.navigateTo('/subpackages/pkg-admin/pages/admin/order/index')}
                >
                  <View className="menu-icon order">📋</View>
                  <Text className="menu-text">订单管理</Text>
                </View>
                <View
                  className="menu-item"
                  onClick={() => this.navigateTo('/subpackages/pkg-admin/pages/admin/category/index')}
                >
                  <View className="menu-icon category">🏷️</View>
                  <Text className="menu-text">分类管理</Text>
                </View>
                <View
                  className="menu-item"
                  onClick={() => this.navigateTo('/subpackages/pkg-admin/pages/admin/data-center/index')}
                >
                  <View className="menu-icon data">📊</View>
                  <Text className="menu-text">数据中心</Text>
                </View>
                <View
                  className="menu-item"
                  onClick={() => this.navigateTo('/subpackages/pkg-admin/pages/admin/user-center/index')}
                >
                  <View className="menu-icon user">👤</View>
                  <Text className="menu-text">用户充值/改密</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    )

    if (isH5) {
      return (
        <AdminShell title="工作台" breadcrumb={[{ label: '工作台' }]}>
          {inner}
        </AdminShell>
      )
    }

    return inner
  }
}
