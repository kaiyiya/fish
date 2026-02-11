import { Component } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { searchApi } from '../../services/api'
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
      console.error('加载热门搜索失败:', error)
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
      console.error('搜索失败:', error)
      Taro.showToast({ title: '搜索失败', icon: 'none' })
      this.setState({ loading: false })
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
            <Text>搜索中...</Text>
          ) : results.length === 0 ? (
            <Text>暂无搜索结果</Text>
          ) : (
            <ScrollView scrollY className="result-scroll">
              {results.map((item) => (
                <View
                  key={item.id}
                  className="result-item"
                  onClick={() => this.handleProductClick(item.id)}
                >
                  <View className="result-main">
                    <Text className="result-name">{item.name}</Text>
                    <Text className="result-price">¥{item.price}</Text>
                  </View>
                  {item.description ? (
                    <Text className="result-desc">{item.description}</Text>
                  ) : null}
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    )
  }
}
