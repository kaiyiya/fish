import type { FC, ReactNode } from 'react'
import { useCallback, useState } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { isH5 } from '../../utils/is-h5'
import './index.scss'

export type AdminBreadcrumb = { label: string; path?: string }

type Props = {
  /** 当前页标题（顶栏右侧展示） */
  title: string
  breadcrumb?: AdminBreadcrumb[]
  children?: ReactNode
}

const ADMIN_NAV: Array<{ path: string; label: string }> = [
  { path: '/pages/admin/index', label: '工作台' },
  { path: '/pages/admin/product/index', label: '商品管理' },
  { path: '/pages/admin/order/index', label: '订单管理' },
  { path: '/pages/admin/category/index', label: '分类管理' },
  { path: '/pages/admin/data-center/index', label: '数据中心' },
  { path: '/pages/admin/user-center/index', label: '用户与充值' },
]

function currentPath(): string {
  try {
    return Taro.getCurrentInstance()?.router?.path || ''
  } catch {
    return ''
  }
}

function goAdmin(url: string) {
  const p = currentPath()
  if (p === url) return
  Taro.navigateTo({ url }).catch(() => {
    Taro.redirectTo({ url }).catch(() => {
      Taro.reLaunch({ url })
    })
  })
}

const NavIcon: FC<{ name: string }> = ({ name }) => (
  <View className="admin-shell__nav-icon" aria-hidden>
    {name === 'dashboard' && (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z" />
      </svg>
    )}
    {name === 'product' && (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <path d="M3.27 6.96 12 12.01l8.73-5.05" />
        <path d="M12 22.08V12" />
      </svg>
    )}
    {name === 'order' && (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    )}
    {name === 'category' && (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <path d="M7 7h.01" />
      </svg>
    )}
    {name === 'data' && (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M18 20V10M12 20V4M6 20v-6" />
      </svg>
    )}
    {name === 'user' && (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    )}
  </View>
)

const iconByPath: Record<string, string> = {
  '/pages/admin/index': 'dashboard',
  '/pages/admin/product/index': 'product',
  '/pages/admin/order/index': 'order',
  '/pages/admin/category/index': 'category',
  '/pages/admin/data-center/index': 'data',
  '/pages/admin/user-center/index': 'user',
}

export const AdminShell: FC<Props> = ({ title, breadcrumb, children }) => {
  const [query, setQuery] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const path = currentPath()

  const handleSearch = useCallback(() => {
    const q = String(query || '').trim()
    if (!q) return
    Taro.navigateTo({
      url: `/pages/search/index?keyword=${encodeURIComponent(q)}`,
    }).catch(() => {})
  }, [query])

  const handleGoFront = useCallback(() => {
    Taro.reLaunch({ url: '/pages/index/index' })
  }, [])

  if (!isH5) {
    return <>{children}</>
  }

  return (
    <View className={`admin-shell ${sidebarOpen ? 'admin-shell--sidebar-open' : ''}`}>
      <View className="admin-shell__sidebar-mask" onClick={() => setSidebarOpen(false)} />

      <View className="admin-shell__sidebar">
        <View className="admin-shell__brand">
          <Text className="admin-shell__brand-mark">鱼</Text>
          <View className="admin-shell__brand-text-wrap">
            <Text className="admin-shell__brand-title">鱼类智能识别</Text>
            <Text className="admin-shell__brand-sub">管理后台</Text>
          </View>
        </View>

        <View className="admin-shell__nav">
          {ADMIN_NAV.map((item) => {
            const active = path === item.path
            const icon = iconByPath[item.path] || 'dashboard'
            return (
              <View
                key={item.path}
                className={`admin-shell__nav-item ${active ? 'admin-shell__nav-item--active' : ''}`}
                onClick={() => {
                  setSidebarOpen(false)
                  goAdmin(item.path)
                }}
              >
                <NavIcon name={icon} />
                <Text className="admin-shell__nav-label">{item.label}</Text>
              </View>
            )
          })}
        </View>

        <View className="admin-shell__sidebar-foot">
          <Text className="admin-shell__sidebar-foot-text">仅供管理员使用</Text>
        </View>
      </View>

      <View className="admin-shell__main">
        <View className="admin-shell__topbar">
          <View className="admin-shell__topbar-left">
            <View className="admin-shell__menu-btn" onClick={() => setSidebarOpen((v) => !v)}>
              <Text className="admin-shell__menu-icon">☰</Text>
            </View>
            <View className="admin-shell__crumbs">
              {(breadcrumb && breadcrumb.length > 0
                ? breadcrumb
                : [{ label: title }]
              ).map((c, i, arr) => (
                <View key={`${c.label}-${i}`} className="admin-shell__crumb-unit">
                  {c.path ? (
                    <Text className="admin-shell__crumb-link" onClick={() => goAdmin(c.path!)}>
                      {c.label}
                    </Text>
                  ) : (
                    <Text
                      className={
                        i === arr.length - 1
                          ? 'admin-shell__crumb-current'
                          : 'admin-shell__crumb-text'
                      }
                    >
                      {c.label}
                    </Text>
                  )}
                  {i < arr.length - 1 ? <Text className="admin-shell__crumb-sep">/</Text> : null}
                </View>
              ))}
            </View>
          </View>

          <View className="admin-shell__search">
            <Input
              className="admin-shell__search-input"
              placeholder="搜索商城商品…"
              value={query}
              onInput={(e) => setQuery(e.detail.value)}
              confirmType="search"
              onConfirm={handleSearch}
            />
          </View>

          <View className="admin-shell__topbar-right">
            <View className="admin-shell__user">
              <View className="admin-shell__avatar">
                <Text className="admin-shell__avatar-letter">管</Text>
              </View>
              <Text className="admin-shell__user-label">管理员</Text>
            </View>
            <Text className="admin-shell__link" onClick={handleGoFront}>
              返回商城
            </Text>
          </View>
        </View>

        <View className="admin-shell__body">{children}</View>
      </View>
    </View>
  )
}

export default AdminShell
