import { Component } from 'react'
import { View, Button, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { aiApi } from '../../services/api'
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
      // 获取后端API地址（固定地址，避免 process.env 问题）
      const baseUrl = 'http://localhost:3000'
      
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
        console.error('上传响应解析失败:', uploadRes.data)
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
      console.error('识别失败:', error)
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
          {imageUrl ? (
            <Image src={imageUrl} className="preview-image" mode="aspectFit" />
          ) : (
            <View className="placeholder">
              <Text className="placeholder-text">点击下方按钮选择图片</Text>
            </View>
          )}

          {result && (
            <View className="result">
              <View className="result-title">识别结果</View>
              <View className="result-item">
                <Text className="result-label">鱼类：</Text>
                <Text className="result-value">{result.fishName}</Text>
              </View>
              <View className="result-item">
                <Text className="result-label">置信度：</Text>
                <Text className="result-value">{(result.confidence * 100).toFixed(2)}%</Text>
              </View>
              
              {result.productId && (
                <Button
                  className="view-product-btn"
                  onClick={() => this.viewProduct(result.productId)}
                >
                  查看商品
                </Button>
              )}
            </View>
          )}

          <View className="actions">
            <Button className="action-btn" onClick={this.chooseImage}>
              选择图片
            </Button>
            <Button
              className="action-btn primary"
              onClick={this.uploadAndRecognize}
              loading={recognizing}
              disabled={!imageUrl || recognizing}
            >
              {recognizing ? '识别中...' : '开始识别'}
            </Button>
          </View>
        </View>
      </View>
    )
  }
}
