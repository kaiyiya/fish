import { Component } from 'react'
import { Button as TaroButton } from '@tarojs/components'
import './Button.scss'

/**
 * 统一的按钮组件
 * @typedef {Object} ButtonProps
 * @property {'primary'|'secondary'|'danger'|'default'} [type] - 按钮类型
 * @property {'large'|'medium'|'small'|'mini'} [size] - 按钮尺寸
 * @property {boolean} [block] - 是否块级按钮（占满宽度）
 * @property {boolean} [loading] - 是否加载中
 * @property {boolean} [disabled] - 是否禁用
 * @property {function} [onClick] - 点击事件
 * @property {string} [className] - 自定义类名
 * @property {React.ReactNode} [children] - 子元素
 */

// 使用 JSDoc 而不是 TypeScript interface，避免编译错误
export default class Button extends Component {
  render() {
    const {
      type = 'default',
      size = 'medium',
      block = false,
      loading = false,
      disabled = false,
      onClick,
      className = '',
      children,
    } = this.props

    const buttonClass = `ui-button ui-button--${type} ui-button--${size} ${
      block ? 'ui-button--block' : ''
    } ${loading ? 'ui-button--loading' : ''} ${disabled ? 'ui-button--disabled' : ''} ${className}`

    return (
      <TaroButton
        className={buttonClass}
        onClick={onClick}
        loading={loading}
        disabled={disabled || loading}
      >
        {children}
      </TaroButton>
    )
  }
}
