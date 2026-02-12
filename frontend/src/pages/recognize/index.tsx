import { Component } from 'react'
import { View, Image, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { aiApi } from '../../services/api'
import { Button } from '../../components/ui'
import config from '../../config'
import { logger } from '../../utils/logger'
import './index.scss'

export default class Recognize extends Component {
  state = {
    imageUrl: '',
    recognizing: false,
    result: null,
  }

  chooseImage = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera', 'album'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0]
        this.setState({ imageUrl: tempFilePath, result: null })
      },
    })
  }

  uploadAndRecognize = async () => {
    const { imageUrl } = this.state
    if (!imageUrl) {
      Taro.showToast({
        title: '请先选择图片',
        icon: 'none',
      })
      return
    }

    this.setState({ recognizing: true })

    try {
      // 获取后端API地址
      const baseUrl = config.baseURL
      
      // 获取token
      const token = Taro.getStorageSync('token') || ''
      
      // 先上传图片到服务器
      const uploadRes = await Taro.uploadFile({
        url: `${baseUrl}/upload`,
        filePath: imageUrl,
        name: 'file',
        header: {
          Authorization: `Bearer ${token}`,
        },
      })

      // 解析上传结果
      let uploadResult
      try {
        uploadResult = JSON.parse(uploadRes.data)
      } catch (e) {
        logger.error('上传响应解析失败', uploadRes.data)
        throw new Error('上传响应解析失败')
      }

      // 检查响应格式
      // TransformInterceptor 会把响应包装成 { code: 200, data: { success: true, data: { url } }, message: 'success' }
      let imageUrlFromServer
      if (uploadResult.code === 200 && uploadResult.data) {
        // 如果 data 中有 success 和 data，说明是上传接口的原始响应被包装了
        if (uploadResult.data.success && uploadResult.data.data) {
          imageUrlFromServer = uploadResult.data.data.url
        } else if (uploadResult.data.url) {
          // 直接包含 url
          imageUrlFromServer = uploadResult.data.url
        } else {
          throw new Error('响应格式不正确')
        }
      } else if (uploadResult.success && uploadResult.data) {
        // 如果没有被 TransformInterceptor 包装（理论上不会发生）
        imageUrlFromServer = uploadResult.data.url
      } else {
        throw new Error(uploadResult.message || '上传失败')
      }

      if (!imageUrlFromServer) {
        throw new Error('无法获取上传后的图片地址')
      }

      // 调用识别接口
      const result = await aiApi.recognize(imageUrlFromServer)
      
      this.setState({ result })
      
      Taro.showToast({
        title: '识别成功',
        icon: 'success',
      })
    } catch (error) {
      logger.error('识别失败', error)
      Taro.showToast({
        title: error.message || '识别失败，请重试',
        icon: 'none',
        duration: 2000,
      })
    } finally {
      this.setState({ recognizing: false })
    }
  }

  viewProduct = (productId) => {
    Taro.navigateTo({
      url: `/pages/product/detail/index?id=${productId}`,
    })
  }

  render() {
    const { imageUrl, recognizing, result } = this.state

    return (
      <View className="recognize">
        <View className="container">
          {recognizing && (
            <View className="recognizing-overlay">
              <View className="recognizing-content">
                <View className="recognizing-spinner">
                  <View className="spinner-ring"></View>
                  <View className="spinner-ring"></View>
                  <View className="spinner-ring"></View>
                </View>
                <Text className="recognizing-text">AI 正在识别中...</Text>
                <Text className="recognizing-hint">请稍候，这可能需要几秒钟</Text>
              </View>
            </View>
          )}
          
          {imageUrl ? (
            <View className="preview-wrapper">
              <Image src={imageUrl} className="preview-image" mode="aspectFit" />
              {recognizing && (
                <View className="preview-overlay">
                  <View className="overlay-spinner">
                    <View className="spinner-dot"></View>
                    <View className="spinner-dot"></View>
                    <View className="spinner-dot"></View>
                  </View>
                </View>
              )}
            </View>
          ) : (
            <View className="placeholder">
              <Text className="placeholder-text">点击下方按钮选择图片</Text>
            </View>
          )}

          {result ? (
            <View className="result">
              <View className="result-title">识别结果</View>
              <View className="result-item">
                <Text className="result-label">鱼类：</Text>
                <Text className="result-value highlight">{result.fishName || '未知'}</Text>
              </View>
              <View className="result-item">
                <Text className="result-label">置信度：</Text>
                <Text className="result-value">{(result.confidence ? (result.confidence * 100).toFixed(2) : 0)}%</Text>
              </View>
              
              {result.result && result.result.alternatives && Array.isArray(result.result.alternatives) && result.result.alternatives.length > 0 ? (
                <View className="alternatives">
                  <Text className="alternatives-title">备选结果：</Text>
                  {result.result.alternatives.map((alt, index) => {
                    const uniqueKey = alt.name || alt.nameCN || `alt-${index}`;
                    return (
                      <View key={uniqueKey} className="alternative-item">
                        <Text className="alternative-name">{alt.nameCN || alt.name || '未知'}</Text>
                        <Text className="alternative-confidence">{(alt.confidence ? (alt.confidence * 100).toFixed(2) : 0)}%</Text>
                      </View>
                    );
                  })}
                </View>
              ) : null}
              
              {result.recommendedProducts && result.recommendedProducts.length > 0 ? (
                <View className="recommended-products">
                  <Text className="recommended-title">推荐商品</Text>
                  <ScrollView scrollX className="products-scroll">
                    {result.recommendedProducts.map((product) => (
                      <View
                        key={product.id}
                        className="product-card"
                        onClick={() => this.viewProduct(product.id)}
                      >
                        {product.imageUrls && product.imageUrls.length > 0 ? (
                          <Image
                            src={product.imageUrls[0]}
                            className="product-image"
                            mode="aspectFill"
                          />
                        ) : (
                          <View className="product-image-placeholder">
                            <Text className="placeholder-icon">🐟</Text>
                          </View>
                        )}
                        <Text className="product-name" numberOfLines={2}>
                          {product.name}
                        </Text>
                        <Text className="product-price">¥{product.price}</Text>
                        {product.stock !== undefined && product.stock > 0 ? (
                          <Text className="product-stock">库存: {product.stock}</Text>
                        ) : (
                          <Text className="product-stock out">缺货</Text>
                        )}
                      </View>
                    ))}
                  </ScrollView>
                </View>
              ) : null}
            </View>
          ) : null}

          <View className="actions">
            <Button
              type="default"
              size="medium"
              onClick={this.chooseImage}
              className="action-btn"
            >
              选择图片
            </Button>
            <Button
              type="primary"
              size="medium"
              onClick={this.uploadAndRecognize}
              loading={recognizing}
              disabled={!imageUrl || recognizing}
              className="action-btn primary"
            >
              {recognizing ? '识别中...' : '开始识别'}
            </Button>
          </View>
        </View>
      </View>
    )
  }
}
