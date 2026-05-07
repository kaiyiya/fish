import React from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.scss'

const faqs = [
  { q: '如何上传头像？', a: '进入“我的”页面，点击头像即可选择本地图片上传并保存。' },
  { q: '如何查看订单？', a: '在“我的”页面点击“我的订单”，可以查看所有订单和订单详情。' },
  { q: '如何联系客服？', a: '你可以通过帮助中心的反馈入口联系管理员，或在通知中查看系统消息。' },
]

export default function HelpPage() {
  const handleBack = () => Taro.navigateBack()

  return (
    <View className="help-page">
      <ScrollView scrollY className="help-scroll">
        <View className="help-header">
          <Text className="help-title">帮助中心</Text>
          <Text className="help-desc">常见问题、使用说明与反馈入口</Text>
        </View>

        <View className="help-card">
          {faqs.map((item) => (
            <View className="help-item" key={item.q}>
              <Text className="help-question">{item.q}</Text>
              <Text className="help-answer">{item.a}</Text>
            </View>
          ))}
        </View>

        <View className="help-card help-contact">
          <Text className="help-section-title">反馈与支持</Text>
          <Text className="help-answer">如遇到问题，请联系后台管理员或通过系统通知获取帮助。</Text>
        </View>

        <View className="help-actions">
          <View className="help-btn" onClick={handleBack}>
            <Text>返回</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  )
}
