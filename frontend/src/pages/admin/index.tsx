import { Component } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { statisticsApi, productApi, orderApi } from '../../services/api'
import { logger } from '../../utils/logger'
import './index.scss'

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
          totalUsers: 0, // 暂时没有用户统计接口
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

    return (
      <View className="admin-dashboard">
        <View className="header">
          <Text className="title">后台管理</Text>
        </View>

        <ScrollView scrollY className="content">
          {/* 统计卡片 */}
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

          {/* 快捷入口 */}
          <View className="menu-section">
            <Text className="section-title">数据管理</Text>
            <View className="menu-grid">
              <View
                className="menu-item"
                onClick={() => this.navigateTo('/pages/admin/product/index')}
              >
                <View className="menu-icon product">📦</View>
                <Text className="menu-text">商品管理</Text>
              </View>
              <View
                className="menu-item"
                onClick={() => this.navigateTo('/pages/admin/order/index')}
              >
                <View className="menu-icon order">📋</View>
                <Text className="menu-text">订单管理</Text>
              </View>
              <View
                className="menu-item"
                onClick={() => this.navigateTo('/pages/admin/category/index')}
              >
                <View className="menu-icon category">🏷️</View>
                <Text className="menu-text">分类管理</Text>
              </View>
              <View
                className="menu-item"
                onClick={() => this.navigateTo('/pages/admin/data-center/index')}
              >
                <View className="menu-icon data">📊</View>
                <Text className="menu-text">数据中心</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }
}
