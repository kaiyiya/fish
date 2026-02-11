import { Component } from 'react'
import { View, Text, Input, Textarea, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { productApi } from '../../../services/api'
import './index.scss'

export default class AdminProduct extends Component {
  state = {
    loading: true,
    saving: false,
    products: [],
    editingId: null,
    form: {
      name: '',
      categoryId: '',
      price: '',
      stock: '',
      description: '',
      nutritionInfo: '',
      cookingTips: '',
      imageUrlsText: '',
    },
  }

  componentDidMount() {
    this.loadProducts()
  }

  loadProducts = async () => {
    try {
      const products = await productApi.getList()
      this.setState({ products, loading: false })
    } catch (error) {
      console.error('加载商品列表失败:', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
      this.setState({ loading: false })
    }
  }

  startCreate = () => {
    this.setState({
      editingId: 'new',
      form: {
        name: '',
        categoryId: '',
        price: '',
        stock: '',
        description: '',
        nutritionInfo: '',
        cookingTips: '',
        imageUrlsText: '',
      },
    })
  }

  startEdit = (product) => {
    this.setState({
      editingId: product.id,
      form: {
        name: product.name || '',
        categoryId: String(product.categoryId || ''),
        price: String(product.price || ''),
        stock: String(product.stock || ''),
        description: product.description || '',
        nutritionInfo: product.nutritionInfo || '',
        cookingTips: product.cookingTips || '',
        imageUrlsText: (product.imageUrls || []).join('\n'),
      },
    })
  }

  cancelEdit = () => {
    this.setState({ editingId: null })
  }

  handleChange = (key, value) => {
    this.setState((prevState) => ({
      form: {
        ...prevState.form,
        [key]: value,
      },
    }))
  }

  handleUploadImage = () => {
    Taro.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempFilePath = res.tempFilePaths[0]
        try {
          const baseUrl = 'http://localhost:3000'
          const uploadRes = await Taro.uploadFile({
            url: `${baseUrl}/upload`,
            filePath: tempFilePath,
            name: 'file',
            header: {
              Authorization: `Bearer ${Taro.getStorageSync('token') || ''}`,
            },
          })

          let uploadResult
          try {
            uploadResult = JSON.parse(uploadRes.data)
          } catch (e) {
            throw new Error('上传响应解析失败')
          }

          if (!uploadResult.success || !uploadResult.data) {
            throw new Error(uploadResult.message || '上传失败')
          }

          const url = uploadResult.data.url
          this.setState((prevState) => {
            const prev = prevState.form.imageUrlsText || ''
            const next = prev ? `${prev}\n${url}` : url
            return {
              form: {
                ...prevState.form,
                imageUrlsText: next,
              },
            }
          })

          Taro.showToast({ title: '上传成功', icon: 'success' })
        } catch (error) {
          console.error('上传图片失败:', error)
          Taro.showToast({
            title: error.message || '上传失败',
            icon: 'none',
          })
        }
      },
    })
  }

  handleSave = async () => {
    const { editingId, form, saving } = this.state
    if (!editingId || saving) return

    if (!form.name || !form.categoryId || !form.price || !form.stock) {
      Taro.showToast({ title: '请完整填写必填项', icon: 'none' })
      return
    }

    this.setState({ saving: true })

    try {
      const imageUrls = (form.imageUrlsText || '')
        .split('\n')
        .map((s) => s.trim())
        .filter((s) => s)

      const payload = {
        name: form.name,
        categoryId: Number(form.categoryId),
        price: Number(form.price),
        stock: Number(form.stock),
        description: form.description || undefined,
        nutritionInfo: form.nutritionInfo || undefined,
        cookingTips: form.cookingTips || undefined,
        imageUrls,
      }

      if (editingId === 'new') {
        await productApi.create(payload)
        Taro.showToast({ title: '创建成功', icon: 'success' })
      } else {
        await productApi.update(editingId, payload)
        Taro.showToast({ title: '保存成功', icon: 'success' })
      }

      this.setState({ editingId: null })
      this.loadProducts()
    } catch (error) {
      console.error('保存商品失败:', error)
      Taro.showToast({
        title: error.message || '保存失败',
        icon: 'none',
      })
    } finally {
      this.setState({ saving: false })
    }
  }

  handleRemove = async (id) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除该商品吗？',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await productApi.remove(id)
          Taro.showToast({ title: '删除成功', icon: 'success' })
          this.loadProducts()
        } catch (error) {
          console.error('删除商品失败:', error)
          Taro.showToast({ title: '删除失败', icon: 'none' })
        }
      },
    })
  }

  render() {
    const { loading, products, editingId, form, saving } = this.state

    return (
      <View className="admin-product-page">
        <View className="header">
          <Text className="title">后台商品管理</Text>
          <Button className="create-btn" onClick={this.startCreate}>
            新建商品
          </Button>
        </View>

        {editingId && (
          <View className="edit-panel">
            <Text className="panel-title">
              {editingId === 'new' ? '新建商品' : `编辑商品 #${editingId}`}
            </Text>

            <View className="form-item">
              <Text className="label">名称 *</Text>
              <Input
                className="input"
                value={form.name}
                onInput={(e) => this.handleChange('name', e.detail.value)}
                placeholder="请输入商品名称"
              />
            </View>

            <View className="form-item">
              <Text className="label">分类ID *</Text>
              <Input
                className="input"
                value={form.categoryId}
                onInput={(e) => this.handleChange('categoryId', e.detail.value)}
                placeholder="例如：1（海鱼）"
              />
            </View>

            <View className="form-row">
              <View className="form-item half">
                <Text className="label">价格 *</Text>
                <Input
                  className="input"
                  value={form.price}
                  onInput={(e) => this.handleChange('price', e.detail.value)}
                  placeholder="例如：88.00"
                />
              </View>
              <View className="form-item half">
                <Text className="label">库存 *</Text>
                <Input
                  className="input"
                  value={form.stock}
                  onInput={(e) => this.handleChange('stock', e.detail.value)}
                  placeholder="例如：100"
                />
              </View>
            </View>

            <View className="form-item">
              <Text className="label">描述</Text>
              <Textarea
                className="textarea"
                value={form.description}
                onInput={(e) => this.handleChange('description', e.detail.value)}
                placeholder="商品描述"
              />
            </View>

            <View className="form-item">
              <Text className="label">营养信息</Text>
              <Textarea
                className="textarea"
                value={form.nutritionInfo}
                onInput={(e) => this.handleChange('nutritionInfo', e.detail.value)}
                placeholder="营养说明"
              />
            </View>

            <View className="form-item">
              <Text className="label">烹饪建议</Text>
              <Textarea
                className="textarea"
                value={form.cookingTips}
                onInput={(e) => this.handleChange('cookingTips', e.detail.value)}
                placeholder="烹饪方法建议"
              />
            </View>

            <View className="form-item">
              <View className="label-row">
                <Text className="label">图片URL（一行一个）</Text>
                <Text className="upload-link" onClick={this.handleUploadImage}>
                  上传图片并自动填入
                </Text>
              </View>
              <Textarea
                className="textarea"
                value={form.imageUrlsText}
                onInput={(e) => this.handleChange('imageUrlsText', e.detail.value)}
                placeholder="可以粘贴在线图片地址，也可以点击“上传图片”自动生成"
              />
            </View>

            <View className="btn-row">
              <Button className="cancel-btn" onClick={this.cancelEdit}>
                取消
              </Button>
              <Button
                className="save-btn"
                onClick={this.handleSave}
                loading={saving}
              >
                保存
              </Button>
            </View>
          </View>
        )}

        <ScrollView scrollY className="list-scroll">
          {loading ? (
            <View className="empty">
              <Text>加载中...</Text>
            </View>
          ) : products.length === 0 ? (
            <View className="empty">
              <Text>暂无商品</Text>
            </View>
          ) : (
            products.map((item) => (
              <View key={item.id} className="product-card">
                <View className="card-header">
                  <Text className="card-title">{item.name}</Text>
                  <Text className="card-sub">
                    ID: {item.id} / 分类: {item.categoryId}
                  </Text>
                </View>
                <View className="card-body">
                  <Text className="card-line">价格：¥{item.price}</Text>
                  <Text className="card-line">库存：{item.stock}</Text>
                  {item.description ? (
                    <Text className="card-desc">{item.description}</Text>
                  ) : null}
                </View>
                <View className="card-footer">
                  <Button
                    className="small-btn"
                    size="mini"
                    onClick={() => this.startEdit(item)}
                  >
                    编辑
                  </Button>
                  <Button
                    className="small-btn danger"
                    size="mini"
                    onClick={() => this.handleRemove(item.id)}
                  >
                    删除
                  </Button>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    )
  }
}

