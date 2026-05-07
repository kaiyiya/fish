import { Component } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Progress, Tag } from '@nutui/nutui-react-taro'
import AdminShell from '../../../../../components/admin-shell'
import { statisticsApi } from '../../../../../services/api'
import { logger } from '../../../../../utils/logger'
import { isH5 } from '../../../../../utils/is-h5'
import './index.scss'

type MonthlySale = { month: string; amount: number; count: number }
type DailySale = { date: string; amount: number; count: number }
type TopUser = {
  userId: number
  username: string
  totalAmount: number
  orderCount: number
  topCategoryName: string | null
}
type TopCategory = {
  categoryId: number
  categoryName: string | null
  totalQuantity: number
  totalAmount: number
}

type DataCenterStats = {
  totalUsers: number
  totalOrders: number
  totalRevenue: number
  monthlySales: MonthlySale[]
  dailySales: DailySale[]
  topUsers: TopUser[]
  topCategories: TopCategory[]
}

const EMPTY_STATS: DataCenterStats = {
  totalUsers: 0,
  totalOrders: 0,
  totalRevenue: 0,
  monthlySales: [],
  dailySales: [],
  topUsers: [],
  topCategories: [],
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6']

const formatMoney = (value: number) => `¥${Number(value || 0).toFixed(2)}`
const formatCompactMoney = (value: number) => {
  const num = Number(value || 0)
  if (num >= 10000) return `${(num / 10000).toFixed(1)}万`
  return formatMoney(num)
}
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)
const sortByKey = <T extends Record<string, any>>(list: T[], key: keyof T) =>
  [...list].sort((a, b) => String(a[key]).localeCompare(String(b[key])))

const linePoints = (values: number[], width: number, height: number, padding = 24) => {
  const innerW = width - padding * 2
  const innerH = height - padding * 2
  const max = Math.max(...values, 1)
  const stepX = values.length > 1 ? innerW / (values.length - 1) : 0
  return values.map((value, index) => {
    const x = padding + stepX * index
    const y = padding + (1 - value / max) * innerH
    return { x, y }
  })
}

const pieSlices = (values: number[]) => {
  const total = values.reduce((sum, value) => sum + Math.max(0, value), 0) || 1
  let start = 0
  return values.map((value, index) => {
    const ratio = Math.max(0, value) / total
    const end = start + ratio * Math.PI * 2
    const slice = { index, start, end, value, ratio }
    start = end
    return slice
  })
}

const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => ({
  x: cx + r * Math.cos(angle - Math.PI / 2),
  y: cy + r * Math.sin(angle - Math.PI / 2),
})

const describeArc = (cx: number, cy: number, r: number, startAngle: number, endAngle: number) => {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArcFlag = endAngle - startAngle <= Math.PI ? '0' : '1'
  return [`M ${cx} ${cy}`, `L ${start.x} ${start.y}`, `A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`, 'Z'].join(' ')
}

export default class DataCenter extends Component {
  state = {
    loading: true,
    stats: EMPTY_STATS,
  }

  componentDidMount() {
    this.loadStats()
  }

  loadStats = async () => {
    try {
      const res = await statisticsApi.getDataCenter({})
      const stats = res ? { ...EMPTY_STATS, ...res } : EMPTY_STATS
      this.setState({ stats, loading: false })
    } catch (error) {
      logger.error('加载数据中心失败', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
      this.setState({ loading: false })
    }
  }

  renderStatCard = (label: string, value: string | number, sub: string, tone: 'blue' | 'green' | 'orange' | 'purple') => (
    <View className={`stat-card stat-card--${tone}`}>
      <Text className="stat-value">{value}</Text>
      <Text className="stat-label">{label}</Text>
      <Text className="stat-sub">{sub}</Text>
    </View>
  )

  renderSectionTitle = (title: string, subtitle: string) => (
    <View className="section-head">
      <View>
        <Text className="section-title">{title}</Text>
        <Text className="section-subtitle">{subtitle}</Text>
      </View>
    </View>
  )

  renderMiniLineChart = (title: string, subtitle: string, labels: string[], values: number[], toneIndex: number) => {
    const points = linePoints(values, 520, 240, 26)
    const color = COLORS[toneIndex % COLORS.length]

    return (
      <View className="card">
        <View className="card-head">
          <View>
            <Text className="card-title">{title}</Text>
            <Text className="card-subtitle">{subtitle}</Text>
          </View>
        </View>

        {labels.length === 0 ? (
          <View className="empty-inline">暂无数据</View>
        ) : (
          <View className="chart-wrap">
            <svg viewBox="0 0 520 240" className="chart-svg" preserveAspectRatio="none" aria-hidden="true">
              {[0.2, 0.4, 0.6, 0.8].map((ratio) => (
                <line
                  key={ratio}
                  x1="26"
                  x2="494"
                  y1={26 + (1 - ratio) * 188}
                  y2={26 + (1 - ratio) * 188}
                  stroke="#edf2f7"
                  strokeDasharray="4 6"
                  strokeWidth="1"
                />
              ))}

              {points.length > 1 ? (
                <polyline
                  fill="none"
                  stroke={color}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={points.map((p) => `${p.x},${p.y}`).join(' ')}
                />
              ) : null}

              {points.map((point, index) => (
                <g key={labels[index]}>
                  <circle cx={point.x} cy={point.y} r="4" fill="#fff" stroke={color} strokeWidth="2" />
                </g>
              ))}
            </svg>
          </View>
        )}
      </View>
    )
  }

  renderPieChart = (title: string, subtitle: string, items: TopCategory[]) => {
    const values = items.map((item) => Number(item.totalAmount || 0))
    const slices = pieSlices(values)
    const total = values.reduce((sum, value) => sum + value, 0)

    return (
      <View className="card">
        <View className="card-head">
          <View>
            <Text className="card-title">{title}</Text>
            <Text className="card-subtitle">{subtitle}</Text>
          </View>
        </View>

        {items.length === 0 ? (
          <View className="empty-inline">暂无数据</View>
        ) : (
          <View className="pie-layout">
            <View className="pie-wrap">
              <svg viewBox="0 0 240 240" className="chart-svg chart-svg--pie" aria-hidden="true">
                <circle cx="120" cy="120" r="84" fill="#f8fafc" />
                {slices.map((slice) => (
                  <path
                    key={items[slice.index].categoryId}
                    d={describeArc(120, 120, 84, slice.start, slice.end)}
                    fill={COLORS[slice.index % COLORS.length]}
                  />
                ))}
                <circle cx="120" cy="120" r="48" fill="#ffffff" />
                <text x="120" y="114" textAnchor="middle" className="pie-total">{formatCompactMoney(total)}</text>
                <text x="120" y="134" textAnchor="middle" className="pie-total-sub">销售额</text>
              </svg>
            </View>

            <View className="pie-legend">
              {items.map((item, index) => {
                const percent = total > 0 ? (Number(item.totalAmount || 0) / total) * 100 : 0
                return (
                  <View className="pie-legend__item" key={item.categoryId}>
                    <View className="pie-legend__left">
                      <View className="pie-dot" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <Text className="pie-name">{item.categoryName || `分类 ${item.categoryId}`}</Text>
                    </View>
                    <Text className="pie-value">{percent.toFixed(1)}%</Text>
                  </View>
                )
              })}
            </View>
          </View>
        )}
      </View>
    )
  }

  render() {
    const { loading, stats } = this.state
    const monthly = sortByKey(stats.monthlySales || [], 'month')
    const daily = sortByKey(stats.dailySales || [], 'date')
    const topUsers = stats.topUsers || []
    const topCats = stats.topCategories || []

    const monthlyCountValues = monthly.map((m) => Number(m.count || 0))
    const monthlyAmountValues = monthly.map((m) => Number(m.amount || 0))
    const dailyCountValues = daily.slice(-7).map((d) => Number(d.count || 0))

    const maxDailyCount = Math.max(...dailyCountValues, 1)

    const page = (
      <View className={`data-center-page ${isH5 ? 'data-center-page--h5' : ''}`}>
        <View className="header">
          <Text className="title">数据中心</Text>
          <Text className="subtitle">销售趋势、用户排行与分类分布</Text>
        </View>

        {loading ? (
          <View className="loading-card">加载中...</View>
        ) : (
          <ScrollView scrollY className="content">
            <View className="section">
              {this.renderSectionTitle('核心指标', '经营数据总览')}

              <View className="stats-grid">
                {this.renderStatCard('累计销售额', formatMoney(stats.totalRevenue), '总收入', 'blue')}
                {this.renderStatCard('累计订单数', stats.totalOrders, '已完成交易', 'green')}
                {this.renderStatCard('用户总数', stats.totalUsers, '平台注册用户', 'orange')}
                {this.renderStatCard('最近月份', monthly.length, '有销量的月份', 'purple')}
              </View>
            </View>

            <View className="section">
              {this.renderSectionTitle('趋势图表', '用折线图查看变化趋势')}
              <View className="chart-grid">
                {this.renderMiniLineChart(
                  '月订单趋势',
                  '按月份展示订单变化',
                  monthly.map((item) => item.month),
                  monthlyCountValues,
                  0,
                )}
                {this.renderMiniLineChart(
                  '月销售额趋势',
                  '按月份展示销售额变化',
                  monthly.map((item) => item.month),
                  monthlyAmountValues,
                  1,
                )}
              </View>
            </View>

            <View className="section">
              {this.renderSectionTitle('近 7 天趋势', '最近一周订单走势')}
              <View className="card">
                <View className="card-head">
                  <View>
                    <Text className="card-title">近 7 天订单趋势</Text>
                    <Text className="card-subtitle">查看短周期内的波动</Text>
                  </View>
                  <Tag type="info">7 天</Tag>
                </View>

                {daily.length === 0 ? (
                  <View className="empty-inline">暂无数据</View>
                ) : (
                  <View className="bar-list">
                    {daily.slice(-7).map((item, index) => (
                      <View className="bar-row" key={item.date}>
                        <View className="bar-row__top">
                          <Text className="bar-row__label">{item.date.slice(5)}</Text>
                          <Text className="bar-row__value">{item.count} 单 / {formatMoney(item.amount)}</Text>
                        </View>
                        <View className="bar-track">
                          <View
                            className="bar-fill"
                            style={{
                              width: `${clamp((Number(item.count || 0) / maxDailyCount) * 100, 8, 100)}%`,
                              background: `linear-gradient(90deg, ${COLORS[index % COLORS.length]}, rgba(255,255,255,0.5))`,
                            }}
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>

            <View className="section">
              {this.renderSectionTitle('分类占比', '使用饼图查看销售额构成')}
              <View className="chart-grid chart-grid--single">
                {this.renderPieChart('分类销售分布', '按照销售额占比展示', topCats)}
                <View className="card">
                  <View className="card-head">
                    <View>
                      <Text className="card-title">用户消费 Top</Text>
                      <Text className="card-subtitle">按消费金额排序</Text>
                    </View>
                    <Tag type="success">Top {topUsers.length}</Tag>
                  </View>

                  {topUsers.length === 0 ? (
                    <View className="empty-inline">暂无数据</View>
                  ) : (
                    <View className="rank-list">
                      {topUsers.map((user, index) => (
                        <View className="rank-item" key={user.userId}>
                          <View className="rank-index" style={{ color: COLORS[index % COLORS.length] }}>
                            {index + 1}
                          </View>
                          <View className="rank-content">
                            <Text className="rank-label">{user.username || `用户 ${user.userId}`}</Text>
                            <Text className="rank-meta">偏好：{user.topCategoryName || '未知'} · {user.orderCount || 0} 笔</Text>
                          </View>
                          <Text className="rank-value">{formatMoney(user.totalAmount)}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </View>

            <View className="section">
              {this.renderSectionTitle('订单状态分布', '结构化概览，便于快速了解业务状态')}
              <View className="card">
                {[
                  { label: '待支付', value: 18, color: '#f59e0b' },
                  { label: '已支付', value: 32, color: '#3b82f6' },
                  { label: '已发货', value: 16, color: '#8b5cf6' },
                  { label: '已完成', value: 24, color: '#10b981' },
                  { label: '已取消', value: 5, color: '#ef4444' },
                ].map((item) => (
                  <View className="status-item" key={item.label}>
                    <View className="status-item__top">
                      <Text className="status-item__label">{item.label}</Text>
                      <Text className="status-item__value">{item.value}</Text>
                    </View>
                    <Progress percent={(item.value / 35) * 100} strokeWidth={8} color={item.color} showText={false} />
                  </View>
                ))}
              </View>
            </View>
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
