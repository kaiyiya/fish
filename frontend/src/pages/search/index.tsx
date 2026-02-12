import { Component } from 'react'
import { View, Text, Input, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { aiApi } from '../../services/api'
import { Button, Input as UIInput } from '../../components/ui'
import { useUserStore } from '../../store/user'
import { logger } from '../../utils/logger'
import './index.scss'

export default class Search extends Component {
  state = {
    question: '',
    loading: false,
    messages: [],
    products: [],
  }

  componentDidMount() {
    // 初始化AI欢迎消息
    this.addMessage('ai', '您好！我是您的智能购物助手。\n\n您可以这样问我：\n• "最近感冒了，想喝点鱼汤，你建议买什么品种的鱼？"\n• "我想做清蒸鱼，推荐一下"\n• "有什么便宜又好吃的鱼？"\n\n我会根据您的需求为您推荐合适的商品！')
  }

  addMessage = (type, content, products) => {
    this.setState((prevState) => ({
      messages: [
        ...prevState.messages,
        {
          type,
          content,
          products,
          timestamp: Date.now(),
        },
      ],
    }))
  }

  handleInputChange = (e) => {
    this.setState({ question: e.detail.value })
  }

  handleSend = async () => {
    const { question, loading } = this.state
    const realQuestion = (question || '').trim()
    
    if (!realQuestion) {
      Taro.showToast({ title: '请输入您的问题', icon: 'none' })
      return
    }

    if (loading) return

    // 检查登录状态
    const store = useUserStore.getState()
    const userInfo = store && store.userInfo
    if (!userInfo) {
      Taro.showModal({
        title: '需要登录',
        content: '使用AI对话功能需要先登录，是否前往登录？',
        success: (res) => {
          if (res.confirm) {
            Taro.navigateTo({ url: '/pages/login/index' })
          }
        },
      })
      return
    }

    // 添加用户消息
    this.addMessage('user', realQuestion)
    this.setState({ question: '', loading: true })

    try {
      const result = await aiApi.chat(realQuestion)
      
      // 添加AI回复
      this.addMessage('ai', result.answer, result.products || [])
      
      // 更新商品列表
      if (result.products && result.products.length > 0) {
        this.setState({ products: result.products })
      }
    } catch (error) {
      logger.error('AI对话失败', error)
      this.addMessage('ai', '抱歉，我暂时无法回答您的问题。请稍后再试，或者尝试换一种方式提问。')
      Taro.showToast({ 
        title: error.message || '对话失败，请稍后重试', 
        icon: 'none' 
      })
    } finally {
      this.setState({ loading: false })
    }
  }

  handleConfirm = (e) => {
    this.setState({ question: e.detail.value })
    this.handleSend()
  }

  handleProductClick = (id) => {
    Taro.navigateTo({
      url: `/pages/product/detail/index?id=${id}`,
    })
  }

  scrollToBottom = () => {
    // 滚动到底部
    setTimeout(() => {
      const query = Taro.createSelectorQuery()
      query.select('.messages-scroll').scrollOffset()
      query.exec(() => {
        // 小程序中需要手动滚动
        Taro.pageScrollTo({
          scrollTop: 99999,
          duration: 300,
        })
      })
    }, 100)
  }

  componentDidUpdate(prevProps, prevState) {
    // 当消息更新时，滚动到底部
    if (this.state.messages.length !== prevState.messages.length) {
      this.scrollToBottom()
    }
  }

  render() {
    const { question, loading, messages, products } = this.state

    return (
      <View className="search-page">
        <View className="chat-container">
          <ScrollView scrollY className="messages-scroll" scrollIntoView={`message-${messages.length - 1}`}>
            <View className="messages-list">
              {messages.map((msg, index) => (
                <View
                  key={index}
                  id={`message-${index}`}
                  className={`message-item ${msg.type === 'user' ? 'user-message' : 'ai-message'}`}
                >
                  <View className="message-avatar">
                    {msg.type === 'user' ? '👤' : '🤖'}
                  </View>
                  <View className="message-content">
                    <Text className="message-text">{msg.content}</Text>
                    
                    {/* 显示推荐的商品 */}
                    {msg.products && msg.products.length > 0 && (
                      <View className="message-products">
                        {msg.products.slice(0, 3).map((product) => {
                          const firstImage = product.imageUrls && product.imageUrls.length > 0 
                            ? product.imageUrls[0] 
                            : ''
                          return (
                            <View
                              key={product.id}
                              className="product-card"
                              onClick={() => this.handleProductClick(product.id)}
                            >
                              {firstImage ? (
                                <Image
                                  src={firstImage}
                                  className="product-image"
                                  mode="aspectFill"
                                />
                              ) : (
                                <View className="product-image-placeholder">
                                  <Text className="placeholder-icon">🐟</Text>
                                </View>
                              )}
                              <Text className="product-name" numberOfLines={1}>
                                {product.name}
                              </Text>
                              <Text className="product-price">¥{product.price}</Text>
                            </View>
                          )
                        })}
                      </View>
                    )}
                  </View>
                </View>
              ))}
              
              {loading && (
                <View className="message-item ai-message">
                  <View className="message-avatar">🤖</View>
                  <View className="message-content">
                    <View className="typing-indicator">
                      <Text className="typing-dot">.</Text>
                      <Text className="typing-dot">.</Text>
                      <Text className="typing-dot">.</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </ScrollView>

          <View className="input-bar">
            <View className="input-wrapper">
              <UIInput
                type="text"
                value={question}
                onInput={this.handleInputChange}
                onConfirm={this.handleConfirm}
                placeholder="问我任何问题，比如：感冒了想喝鱼汤..."
                className="chat-input"
              />
            </View>
            <View className="button-wrapper">
              <Button
                type="primary"
                size="medium"
                onClick={this.handleSend}
                loading={loading}
                disabled={loading || !question.trim()}
                className="send-btn"
              >
                发送
              </Button>
            </View>
          </View>
        </View>
      </View>
    )
  }
}
