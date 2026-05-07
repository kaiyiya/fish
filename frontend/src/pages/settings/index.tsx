import React from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

const settingsItems = [
  {
    title: '清理缓存',
    desc: '删除本地临时数据与登录缓存',
  },
  {
    title: '关于我们',
    desc: '查看应用简介与版本信息',
  },
]

export default function SettingsPage() {
  const handleBack = () => Taro.navigateBack()

  const handleClearCache = () => {
    Taro.showModal({
      title: '清理缓存',
      content: '是否清除本地缓存数据？',
      success: (res) => {
        if (res.confirm) {
          Taro.clearStorageSync()
          Taro.showToast({ title: '缓存已清理', icon: 'success' })
        }
      },
    })
  }

  const handleAbout = () => {
    Taro.showModal({
      title: '关于我们',
      content: '鱼类智能识别与管理系统',
      showCancel: false,
    })
  }

  return (
    <View className="settings-page">
      <ScrollView scrollY className="settings-scroll">
        <View className="settings-header">
          <Text className="settings-title">设置</Text>
          <Text className="settings-desc">管理账户与个性化选项</Text>
        </View>

        <View className="settings-card">
          <View className="settings-item" onClick={handleClearCache}>
            <View>
              <Text className="settings-item-title">{settingsItems[0].title}</Text>
              <Text className="settings-item-desc">{settingsItems[0].desc}</Text>
            </View>
            <Text className="settings-arrow">›</Text>
          </View>

          <View className="settings-item" onClick={handleAbout}>
            <View>
              <Text className="settings-item-title">{settingsItems[1].title}</Text>
              <Text className="settings-item-desc">{settingsItems[1].desc}</Text>
            </View>
            <Text className="settings-arrow">›</Text>
          </View>
        </View>

        <View className="settings-actions">
          <View className="settings-btn" onClick={handleBack}>
            <Text>返回</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
