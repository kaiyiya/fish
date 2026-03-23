import { Component } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { statisticsApi } from '../../../services/api'
import { logger } from '../../../utils/logger'
import './index.scss'

export default class DataCenter extends Component {
  state = {
    loading: true,
    stats: {
      totalUsers: 0,
      totalOrders: 0,
      totalRevenue: 0,
      monthlySales: [] as Array<{ month: string; amount: number; count: number }>,
      topUsers: [] as Array<{
        userId: number
        username: string
        totalAmount: number
        orderCount: number
        topCategoryName: string | null
      }>,
      topCategories: [] as Array<{ categoryId: number; categoryName: string | null; totalQuantity: number; totalAmount: number }>,
    },
  }

  componentDidMount() {
    this.loadStats()
  }

  loadStats = async () => {
    try {
      const res = await statisticsApi.getDataCenter({})
      this.setState({ stats: res || this.state.stats, loading: false })
    } catch (error) {
      logger.error('加载数据中心失败', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
      this.setState({ loading: false })
    }
  }

  render() {
    const { loading, stats } = this.state

    return (
      <View className="data-center-page">
        <View className="header">
          <Text className="title">数据中心</Text>
        </View>

        <ScrollView scrollY className="content">
          {loading ? (
            <View className="empty">
              <Text>加载中...</Text>
            </View>
          ) : (
            <>
              <View className="stats-grid">
                <View className="stat-card blue">
                  <Text className="stat-value">¥{Number(stats.totalRevenue || 0).toFixed(2)}</Text>
                  <Text className="stat-label">累计销售额</Text>
                </View>
                <View className="stat-card green">
                  <Text className="stat-value">{stats.totalOrders}</Text>
                  <Text className="stat-label">累计订单数</Text>
                </View>
                <View className="stat-card orange">
                  <Text className="stat-value">{stats.totalUsers}</Text>
                  <Text className="stat-label">用户总数</Text>
                </View>
                <View className="stat-card purple">
                  <Text className="stat-value">{(stats.monthlySales || []).length}</Text>
                  <Text className="stat-label">最近月份</Text>
                </View>
              </View>

              <View className="section">
                <Text className="section-title">月销量/金额汇总</Text>
                <View className="list">
                  {(stats.monthlySales || []).map((m) => (
                    <View className="list-row" key={m.month}>
                      <Text className="row-left">{m.month}</Text>
                      <Text className="row-right">
                        {m.count} 单 / ¥{Number(m.amount || 0).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                  {(stats.monthlySales || []).length === 0 ? (
                    <View className="empty-sub">
                      <Text>暂无数据</Text>
                    </View>
                  ) : null}
                </View>
              </View>

              <View className="section">
                <Text className="section-title">用户消费偏好（按消费金额 Top）</Text>
                <View className="list">
                  {(stats.topUsers || []).map((u) => (
                    <View className="list-row" key={u.userId}>
                      <Text className="row-left">
                        {u.username}（{u.userId}）
                      </Text>
                      <Text className="row-right">
                        {u.topCategoryName || '未知'} / ¥{Number(u.totalAmount || 0).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                  {(stats.topUsers || []).length === 0 ? (
                    <View className="empty-sub">
                      <Text>暂无数据</Text>
                    </View>
                  ) : null}
                </View>
              </View>

              <View className="section">
                <Text className="section-title">消费最多的品类</Text>
                <View className="list">
                  {(stats.topCategories || []).map((c) => (
                    <View className="list-row" key={c.categoryId}>
                      <Text className="row-left">{c.categoryName || `分类${c.categoryId}`}</Text>
                      <Text className="row-right">
                        {c.totalQuantity} 件 / ¥{Number(c.totalAmount || 0).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                  {(stats.topCategories || []).length === 0 ? (
                    <View className="empty-sub">
                      <Text>暂无数据</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    )
  }
}

