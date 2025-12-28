import { Component } from 'react'
import { View, Button, Image, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { aiApi } from '../../services/api'
import './index.scss'

export default class Recognize extends Component {
  state = {
    imageUrl: '',
    recognizing: false,
    result: null as any,
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
      // 先上传图片到服务器
      const uploadRes = await Taro.uploadFile({
        url: 'http://localhost:3000/upload', // 需要后端提供上传接口
        filePath: imageUrl,
        name: 'file',
      })

      // TODO: 解析上传结果，获取图片URL
      // 然后调用识别接口
      const result = await aiApi.recognize(imageUrl) // 临时使用本地路径
      
      this.setState({ result })
      
      Taro.showToast({
        title: '识别成功',
        icon: 'success',
      })
    } catch (error) {
      console.error('识别失败:', error)
      Taro.showToast({
        title: '识别失败，请重试',
        icon: 'none',
      })
    } finally {
      this.setState({ recognizing: false })
    }
  }

  viewProduct = (productId: number) => {
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
