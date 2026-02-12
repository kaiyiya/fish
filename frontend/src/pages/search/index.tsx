import { Component } from 'react'
import { View, Text, Input, ScrollView, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { searchApi } from '../../services/api'
import { logger } from '../../utils/logger'
import './index.scss'

export default class Search extends Component {
  state = {
    keyword: '',
    loading: false,
    results: [],
    hotKeywords: [],
  }

  componentDidMount() {
    this.loadHotKeywords()
  }

  loadHotKeywords = async () => {
    try {
      const hot = await searchApi.getHot(10)
      this.setState({ hotKeywords: hot || [] })
    } catch (error) {
      logger.error('加载热门搜索失败', error)
      // 热门搜索失败不影响主流程
    }
  }

  handleInputChange = (e) => {
    this.setState({ keyword: e.detail.value })
  }

  handleSearch = async (value) => {
    const keyword = typeof value === 'string' ? value : this.state.keyword
    const realKeyword = (keyword || '').trim()
    if (!realKeyword) {
      Taro.showToast({ title: '请输入关键词', icon: 'none' })
      return
    }

    this.setState({ loading: true, keyword: realKeyword })
    try {
      const results = await searchApi.search(realKeyword, 'keyword')
      this.setState({ results, loading: false })
    } catch (error) {
      logger.error('搜索失败', error)
      Taro.showToast({ title: error.message || '搜索失败，请稍后重试', icon: 'none' })
      this.setState({ loading: false, results: [] })
    }
  }

  handleConfirm = (e) => {
    this.handleSearch(e.detail.value)
  }

  handleHotClick = (keyword) => {
    this.setState({ keyword })
    this.handleSearch(keyword)
  }

  handleProductClick = (id) => {
    Taro.navigateTo({
      url: `/pages/product/detail/index?id=${id}`,
    })
  }

  render() {
    const { keyword, loading, results, hotKeywords } = this.state

    return (
      <View className="search-page">
        <View className="search-bar">
          <Input
            className="search-input"
            value={keyword}
            placeholder="请输入鱼类名称或关键词"
            onInput={this.handleInputChange}
            onConfirm={this.handleConfirm}
          />
          <Text className="search-btn" onClick={() => this.handleSearch()}>
            搜索
          </Text>
        </View>

        {hotKeywords && hotKeywords.length > 0 && (
          <View className="hot-section">
            <Text className="section-title">热门搜索</Text>
            <View className="hot-list">
              {hotKeywords.map((item) => (
                <Text
                  key={item.keyword}
                  className="hot-item"
                  onClick={() => this.handleHotClick(item.keyword)}
                >
                  {item.keyword}
                </Text>
              ))}
            </View>
          </View>
        )}

        <View className="result-section">
          {loading ? (
            <View className="loading-state">
              <Text className="loading-text">搜索中...</Text>
            </View>
          ) : results.length === 0 && keyword ? (
            <View className="empty-state">
              <Text className="empty-icon">🔍</Text>
              <Text className="empty-text">暂无搜索结果</Text>
              <Text className="empty-desc">试试其他关键词吧</Text>
            </View>
          ) : results.length > 0 ? (
            <ScrollView scrollY className="result-scroll">
              <View className="result-list">
                {results.map((item) => {
                  const firstImage = item.imageUrls && item.imageUrls.length > 0 
                    ? item.imageUrls[0] 
                    : ''
                  return (
                    <View
                      key={item.id}
                      className="result-item"
                      onClick={() => this.handleProductClick(item.id)}
                    >
                      {firstImage ? (
                        <Image
                          src={firstImage}
                          className="result-image"
                          mode="aspectFill"
                        />
                      ) : (
                        <View className="result-image-placeholder">
                          <Text className="placeholder-icon">🐟</Text>
                        </View>
                      )}
                      <View className="result-info">
                        <Text className="result-name">{item.name}</Text>
                        {item.description && (
                          <Text className="result-desc" numberOfLines={2}>
                            {item.description}
                          </Text>
                        )}
                        <View className="result-footer">
                          <Text className="result-price">¥{item.price}</Text>
                          {item.stock !== undefined && item.stock > 0 && (
                            <Text className="result-stock">库存: {item.stock}</Text>
                          )}
                        </View>
                      </View>
                    </View>
                  )
                })}
              </View>
            </ScrollView>
          ) : null}
        </View>
      </View>
    )
  }
}
