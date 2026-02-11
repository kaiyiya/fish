import { Component } from 'react'
import { Input as TaroInput, View, Text } from '@tarojs/components'
import './Input.scss'

/**
 * 统一的输入框组件
 * @typedef {Object} InputProps
 * @property {string} [type] - 输入框类型
 * @property {string} [placeholder] - 占位符
 * @property {string} [value] - 值
 * @property {function} [onInput] - 输入事件
 * @property {boolean} [disabled] - 是否禁用
 * @property {string} [className] - 自定义类名
 * @property {string} [prefix] - 前缀（如价格符号）
 */

// 使用 JSDoc 而不是 TypeScript interface，避免编译错误
export default class Input extends Component {
  render() {
    const {
      type = 'text',
      placeholder = '',
      value = '',
      onInput,
      disabled = false,
      className = '',
      prefix,
    } = this.props

    const inputClass = `ui-input ${prefix ? 'ui-input--with-prefix' : ''} ${className}`

    return (
      <View className="ui-input-wrapper">
        {prefix && <Text className="ui-input-prefix">{prefix}</Text>}
        <TaroInput
          className={inputClass}
          type={type}
          placeholder={placeholder}
          value={value}
          onInput={onInput}
          disabled={disabled}
        />
      </View>
    )
  }
}
