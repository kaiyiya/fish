import { Component } from 'react'
import { View } from '@tarojs/components'
import './Card.scss'

/**
 * 统一的卡片组件
 * @typedef {Object} CardProps
 * @property {boolean} [shadow] - 是否显示阴影
 * @property {boolean} [hover] - 是否显示悬停效果
 * @property {string} [className] - 自定义类名
 * @property {React.ReactNode} [children] - 子元素
 * @property {function} [onClick] - 点击事件
 */

// 使用 JSDoc 而不是 TypeScript interface，避免编译错误
export default class Card extends Component {
  render() {
    const {
      shadow = true,
      hover = false,
      className = '',
      children,
      onClick,
    } = this.props

    const cardClass = `ui-card ${shadow ? 'ui-card--shadow' : ''} ${
      hover ? 'ui-card--hover' : ''
    } ${onClick ? 'ui-card--clickable' : ''} ${className}`

    return (
      <View className={cardClass} onClick={onClick}>
        {children}
      </View>
    )
  }
}
