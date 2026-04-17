import { Component } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import AdminShell from '../../../../../components/admin-shell'
import { statisticsApi } from '../../../../../services/api'
import { logger } from '../../../../../utils/logger'
import { isH5 } from '../../../../../utils/is-h5'
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

  renderStatsGrid = (stats: typeof this.state.stats) => (
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
  )

  render() {
    const { loading, stats } = this.state
    const monthly = stats.monthlySales || []
    const topUsers = stats.topUsers || []
    const topCats = stats.topCategories || []

    const mainContentMini = loading ? (
      <View className="empty">
        <Text>加载中...</Text>
      </View>
    ) : (
      <>
        {this.renderStatsGrid(stats)}

        <View className="section">
          <Text className="section-title">月销量/金额汇总</Text>
          <View className="list">
            {monthly.map((m) => (
              <View className="list-row" key={m.month}>
                <Text className="row-left">{m.month}</Text>
                <Text className="row-right">
                  {m.count} 单 / ¥{Number(m.amount || 0).toFixed(2)}
                </Text>
              </View>
            ))}
            {monthly.length === 0 ? (
              <View className="empty-sub">
                <Text>暂无数据</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View className="section">
          <Text className="section-title">用户消费偏好（按消费金额 Top）</Text>
          <View className="list">
            {topUsers.map((u) => (
              <View className="list-row" key={u.userId}>
                <Text className="row-left">
                  {u.username}（{u.userId}）
                </Text>
                <Text className="row-right">
                  {u.topCategoryName || '未知'} / ¥{Number(u.totalAmount || 0).toFixed(2)}
                </Text>
              </View>
            ))}
            {topUsers.length === 0 ? (
              <View className="empty-sub">
                <Text>暂无数据</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View className="section">
          <Text className="section-title">消费最多的品类</Text>
          <View className="list">
            {topCats.map((c) => (
              <View className="list-row" key={c.categoryId}>
                <Text className="row-left">{c.categoryName || `分类${c.categoryId}`}</Text>
                <Text className="row-right">
                  {c.totalQuantity} 件 / ¥{Number(c.totalAmount || 0).toFixed(2)}
                </Text>
              </View>
            ))}
            {topCats.length === 0 ? (
              <View className="empty-sub">
                <Text>暂无数据</Text>
              </View>
            ) : null}
          </View>
        </View>
      </>
    )

    const mainContentH5 = loading ? (
      <View className="list-scroll list-scroll--h5">
        <View className="empty empty--h5">
          <Text>加载中...</Text>
        </View>
      </View>
    ) : (
      <View className="list-scroll list-scroll--h5">
        <View className="list-section-inner">
          {this.renderStatsGrid(stats)}

          <View className="dc-table-section">
            <View className="enterprise-list-header">
              <Text className="enterprise-list-header__title">月销量 / 金额汇总</Text>
              <Text className="enterprise-list-header__meta">共 {monthly.length} 条</Text>
            </View>
            <View className="dc-table-wrap">
              {monthly.length === 0 ? (
                <View className="empty-sub empty-sub--inline">
                  <Text>暂无数据</Text>
                </View>
              ) : (
                <View className="dc-table dc-table--monthly">
                  <View className="dc-table__tr dc-table__tr--head">
                    <View className="dc-table__th">月份</View>
                    <View className="dc-table__th dc-table__th--num">订单数</View>
                    <View className="dc-table__th dc-table__th--right">金额</View>
                  </View>
                  {monthly.map((m) => (
                    <View className="dc-table__tr dc-table__tr--data" key={m.month}>
                      <View className="dc-table__td">
                        <Text>{m.month}</Text>
                      </View>
                      <View className="dc-table__td dc-table__td--num">
                        <Text>{m.count}</Text>
                      </View>
                      <View className="dc-table__td dc-table__td--right">
                        <Text>¥{Number(m.amount || 0).toFixed(2)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View className="dc-table-section">
            <View className="enterprise-list-header">
              <Text className="enterprise-list-header__title">用户消费偏好（按金额 Top）</Text>
              <Text className="enterprise-list-header__meta">共 {topUsers.length} 条</Text>
            </View>
            <View className="dc-table-wrap">
              {topUsers.length === 0 ? (
                <View className="empty-sub empty-sub--inline">
                  <Text>暂无数据</Text>
                </View>
              ) : (
                <View className="dc-table dc-table--users">
                  <View className="dc-table__tr dc-table__tr--head">
                    <View className="dc-table__th">用户</View>
                    <View className="dc-table__th">偏好品类</View>
                    <View className="dc-table__th dc-table__th--right">消费金额</View>
                  </View>
                  {topUsers.map((u) => (
                    <View className="dc-table__tr dc-table__tr--data" key={u.userId}>
                      <View className="dc-table__td">
                        <Text className="dc-table__name">{u.username}</Text>
                        <Text className="dc-table__sub">ID {u.userId}</Text>
                      </View>
                      <View className="dc-table__td dc-table__td--muted">
                        <Text>{u.topCategoryName || '未知'}</Text>
                      </View>
                      <View className="dc-table__td dc-table__td--right">
                        <Text>¥{Number(u.totalAmount || 0).toFixed(2)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          <View className="dc-table-section">
            <View className="enterprise-list-header">
              <Text className="enterprise-list-header__title">消费最多的品类</Text>
              <Text className="enterprise-list-header__meta">共 {topCats.length} 条</Text>
            </View>
            <View className="dc-table-wrap">
              {topCats.length === 0 ? (
                <View className="empty-sub empty-sub--inline">
                  <Text>暂无数据</Text>
                </View>
              ) : (
                <View className="dc-table dc-table--categories">
                  <View className="dc-table__tr dc-table__tr--head">
                    <View className="dc-table__th">品类</View>
                    <View className="dc-table__th dc-table__th--num">件数</View>
                    <View className="dc-table__th dc-table__th--right">金额</View>
                  </View>
                  {topCats.map((c) => (
                    <View className="dc-table__tr dc-table__tr--data" key={c.categoryId}>
                      <View className="dc-table__td">
                        <Text>{c.categoryName || `分类${c.categoryId}`}</Text>
                      </View>
                      <View className="dc-table__td dc-table__td--num">
                        <Text>{c.totalQuantity}</Text>
                      </View>
                      <View className="dc-table__td dc-table__td--right">
                        <Text>¥{Number(c.totalAmount || 0).toFixed(2)}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    )

    const page = (
      <View className={`data-center-page ${isH5 ? 'data-center-page--h5' : ''}`}>
        <View className="header">
          <Text className="title">数据中心</Text>
        </View>

        {isH5 && (
          <View className="data-center-toolbar-h5">
            <View className="data-center-toolbar-h5__left">
              <Text className="data-center-toolbar-h5__title">数据中心</Text>
              <Text className="data-center-toolbar-h5__subtitle">销售趋势与用户行为概览</Text>
            </View>
          </View>
        )}

        {isH5 ? (
          <View className="list-section list-section--enterprise">{mainContentH5}</View>
        ) : (
          <ScrollView scrollY className="content">
            {mainContentMini}
          </ScrollView>
        )}
      </View>
    )

    if (isH5) {
      return (
        <AdminShell
          title="数据中心"
          breadcrumb={[
            { label: '管理后台', path: '/subpackages/pkg-admin/pages/admin/index' },
            { label: '数据中心' },
          ]}
        >
          {page}
        </AdminShell>
      )
    }

    return page
  }
}
