import { Component } from 'react'
import { View, Text, Textarea, ScrollView, Image, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { productApi, categoryApi } from '../../../services/api'
import { Button, Input } from '../../../components/ui'
import { logger } from '../../../utils/logger'
import './index.scss'

export default class AdminProduct extends Component {
  state = {
    loading: true,
    saving: false,
    products: [],
    categories: [],
    editingId: null,
      form: {
        name: '',
        categoryId: null,
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
    this.loadCategories()
  }

  loadCategories = async () => {
    try {
      const categories = await categoryApi.getList()
      this.setState({ categories })
    } catch (error) {
      logger.error('加载分类列表失败', error)
    }
  }

  loadProducts = async () => {
    try {
      const products = await productApi.getList()
      // 调试日志：检查图片数据
      console.log('加载的商品列表:', products.map(p => ({
        id: p.id,
        name: p.name,
        imageUrls: p.imageUrls,
        imageUrlsType: typeof p.imageUrls,
        imageUrlsIsArray: Array.isArray(p.imageUrls),
      })))
      this.setState({ products, loading: false })
    } catch (error) {
      logger.error('加载商品列表失败', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
      this.setState({ loading: false })
    }
  }

  startCreate = () => {
    this.setState({
      editingId: 'new',
      form: {
        name: '',
        categoryId: null, // 使用 null 而不是空字符串
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
    // 处理imageUrls：可能是数组、字符串或null
    let imageUrlsArray = []
    if (product.imageUrls) {
      if (Array.isArray(product.imageUrls)) {
        imageUrlsArray = product.imageUrls
      } else if (typeof product.imageUrls === 'string') {
        // 如果是JSON字符串，尝试解析
        try {
          imageUrlsArray = JSON.parse(product.imageUrls)
        } catch (e) {
          // 如果不是JSON，当作单个URL处理
          imageUrlsArray = [product.imageUrls]
        }
      }
    }
    
    console.log('编辑商品，图片数据:', {
      id: product.id,
      imageUrls: product.imageUrls,
      imageUrlsType: typeof product.imageUrls,
      parsed: imageUrlsArray,
    })
    
    this.setState({
      editingId: product.id,
      form: {
        name: product.name || '',
        categoryId: product.categoryId ? String(product.categoryId) : null,
        price: String(product.price || ''),
        stock: String(product.stock || ''),
        description: product.description || '',
        nutritionInfo: product.nutritionInfo || '',
        cookingTips: product.cookingTips || '',
        imageUrlsText: imageUrlsArray.join('\n'),
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
          // 使用配置中的 baseURL
          const config = require('../../../config')
          const baseUrl = config.baseURL || 'http://localhost:3000'
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
            console.error('上传响应解析失败:', uploadRes.data)
            throw new Error('上传响应解析失败')
          }

          console.log('上传原始响应:', uploadResult)

          // 处理后端 TransformInterceptor 格式：{ code: 200, data: {...}, message: 'success' }
          let imageUrl = null
          if (uploadResult.code === 200 && uploadResult.data) {
            // TransformInterceptor 包装后的格式
            const wrappedData = uploadResult.data
            // 检查是否是 { success: true, data: { url, filename } } 格式
            if (wrappedData.success && wrappedData.data) {
              imageUrl = wrappedData.data.url
            } else if (wrappedData.url) {
              // 直接是 { url, filename } 格式
              imageUrl = wrappedData.url
            } else {
              // 尝试其他可能的格式
              imageUrl = wrappedData.url || wrappedData
            }
          } else if (uploadResult.success && uploadResult.data) {
            // 未经过 TransformInterceptor 的格式
            imageUrl = uploadResult.data.url || uploadResult.data
          } else {
            throw new Error(uploadResult.message || uploadResult.msg || '上传失败')
          }

          if (!imageUrl) {
            console.error('无法提取图片URL，响应数据:', uploadResult)
            throw new Error('未获取到图片URL，请检查上传接口响应格式')
          }

          console.log('提取的图片URL:', imageUrl)

          this.setState((prevState) => {
            const prev = prevState.form.imageUrlsText || ''
            const urls = prev ? prev.split('\n').filter(s => s.trim()) : []
            // 避免重复添加
            if (!urls.includes(imageUrl)) {
              urls.push(imageUrl)
            }
            const newImageUrlsText = urls.join('\n')
            console.log('更新后的图片URL列表:', newImageUrlsText)
            return {
              form: {
                ...prevState.form,
                imageUrlsText: newImageUrlsText,
              },
            }
          })

          Taro.showToast({ title: '上传成功', icon: 'success' })
        } catch (error) {
          logger.error('上传图片失败', error)
          Taro.showToast({
            title: error.message || '上传失败',
            icon: 'none',
          })
        }
      },
    })
  }

  handleSave = async () => {
    const { editingId, form, saving, categories } = this.state
    if (!editingId || saving) return

    if (!form.name || !form.price || !form.stock) {
      Taro.showToast({ title: '请完整填写必填项', icon: 'none' })
      return
    }

    // 如果提供了分类ID，验证分类是否存在
    let categoryId = null
    if (form.categoryId && form.categoryId !== null && form.categoryId !== '') {
      const categoryIdStr = String(form.categoryId).trim()
      if (categoryIdStr !== '') {
        categoryId = Number(categoryIdStr)
        if (isNaN(categoryId)) {
          Taro.showToast({ title: '请选择有效的商品分类', icon: 'none' })
          return
        }
        if (categories.length > 0) {
          const categoryExists = categories.some(c => c.id === categoryId)
          if (!categoryExists) {
            Taro.showToast({
              title: '请选择有效的商品分类',
              icon: 'none',
              duration: 2000,
            })
            return
          }
        }
      }
    }

    // 验证价格和库存
    const price = Number(form.price)
    const stock = Number(form.stock)
    if (isNaN(price) || price <= 0) {
      Taro.showToast({ title: '请输入有效的价格', icon: 'none' })
      return
    }
    if (isNaN(stock) || stock < 0) {
      Taro.showToast({ title: '请输入有效的库存数量', icon: 'none' })
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
        categoryId: categoryId || undefined, // 如果为 null，则不传该字段
        price: price,
        stock: stock,
        description: form.description || undefined,
        nutritionInfo: form.nutritionInfo || undefined,
        cookingTips: form.cookingTips || undefined,
        // 只有当imageUrls数组不为空时才传递
        imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
      }
      
      // 调试日志
      console.log('保存商品数据:', {
        ...payload,
        imageUrlsCount: imageUrls.length,
        imageUrlsText: form.imageUrlsText,
      })

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
      logger.error('保存商品失败', error)
      // 提取错误信息
      let errorMessage = '保存失败'
      if (error.message) {
        // 如果错误信息包含中文，直接使用
        if (error.message.includes('分类') || error.message.includes('不存在')) {
          errorMessage = error.message
        } else {
          errorMessage = error.message
        }
      }
      
      Taro.showToast({
        title: errorMessage,
        icon: 'none',
        duration: 3000,
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
          logger.error('删除商品失败', error)
          Taro.showToast({ title: '删除失败', icon: 'none' })
        }
      },
    })
  }

  handleCategoryChange = (e) => {
    const index = e.detail.value
    const category = this.state.categories[index]
    if (category) {
      this.handleChange('categoryId', String(category.id))
    }
  }

  removeImage = (index) => {
    const urls = (this.state.form.imageUrlsText || '').split('\n').filter(s => s.trim())
    urls.splice(index, 1)
    this.handleChange('imageUrlsText', urls.join('\n'))
  }

  render() {
    const { loading, products, categories, editingId, form, saving } = this.state
    const imageUrls = (form.imageUrlsText || '').split('\n').filter(s => s.trim())
    // 计算当前选中的分类索引（如果分类ID为空或找不到，返回 -1）
    const selectedCategoryIndex = form.categoryId && form.categoryId !== null && form.categoryId !== ''
      ? categories.findIndex(c => String(c.id) === String(form.categoryId))
      : -1

    return (
      <View className='admin-product-page'>
        <View className='header'>
          <View className='header-content'>
            <Text className='title'>商品管理</Text>
            <Text className='subtitle'>管理您的商品信息</Text>
          </View>
          <Button
            type='default'
            size='large'
            onClick={this.startCreate}
            className='create-btn'
          >
            <Text className='btn-icon'>+</Text>
            <Text>新建商品</Text>
          </Button>
        </View>

        {editingId && (
          <ScrollView scrollY className='edit-panel-scroll'>
            <View className='edit-panel'>
              <View className="panel-header">
                <Text className="panel-title">
                  {editingId === 'new' ? '创建新商品' : `编辑商品 #${editingId}`}
                </Text>
                <Text className="panel-subtitle">
                  {editingId === 'new' ? '填写商品信息以创建新商品' : '修改商品信息'}
                </Text>
              </View>

              {/* 基本信息卡片 */}
              <View className='form-section'>
                <Text className='section-title'>基本信息</Text>
                <View className='form-item'>
                  <Text className='label'>
                    商品名称 <Text className='required'>*</Text>
                  </Text>
                  <Input
                    value={form.name}
                    onInput={(e) => this.handleChange('name', e.detail.value)}
                    placeholder='请输入商品名称'
                  />
                </View>

                <View className='form-item'>
                  <Text className='label'>商品分类</Text>
                  {categories.length > 0 ? (
                    <Picker
                      mode='selector'
                      range={categories}
                      rangeKey='name'
                      value={selectedCategoryIndex >= 0 ? selectedCategoryIndex : 0}
                      onChange={(e) => {
                        const index = e.detail.value
                        const category = this.state.categories[index]
                        if (category) {
                          this.handleChange('categoryId', String(category.id))
                        }
                      }}
                    >
                      <View className='picker-view'>
                        <Text className={selectedCategoryIndex >= 0 ? 'picker-text' : 'picker-placeholder'}>
                          {selectedCategoryIndex >= 0 && categories[selectedCategoryIndex] 
                            ? categories[selectedCategoryIndex].name 
                            : categories.length > 0 ? '请选择分类' : '暂无分类'}
                        </Text>
                        <Text className='picker-arrow'>▼</Text>
                      </View>
                    </Picker>
                  ) : (
                    <View className='picker-view'>
                      <Text className='picker-placeholder'>暂无分类，请先在分类管理中创建</Text>
                    </View>
                  )}
                </View>

                <View className='form-row'>
                  <View className='form-item half price-item'>
                    <Text className='label'>
                      价格 <Text className='required'>*</Text>
                    </Text>
                    <Input
                      type='digit'
                      value={form.price}
                      onInput={(e) => this.handleChange('price', e.detail.value)}
                      placeholder='0.00'
                      prefix='¥'
                    />
                  </View>
                  <View className='form-item half stock-item'>
                    <Text className='label'>
                      库存 <Text className='required'>*</Text>
                    </Text>
                    <Input
                      type='number'
                      value={form.stock}
                      onInput={(e) => this.handleChange('stock', e.detail.value)}
                      placeholder='0'
                    />
                  </View>
                </View>
              </View>

              {/* 商品描述卡片 */}
              <View className='form-section'>
                <Text className='section-title'>商品描述</Text>
                <View className='form-item'>
                  <Text className='label'>商品描述</Text>
                  <Textarea
                    className='textarea'
                    value={form.description}
                    onInput={(e) => this.handleChange('description', e.detail.value)}
                    placeholder='请输入商品详细描述...'
                    maxlength={500}
                  />
                  <Text className='char-count'>{form.description.length}/500</Text>
                </View>
              </View>

              {/* 详细信息卡片 */}
              <View className='form-section'>
                <Text className='section-title'>详细信息</Text>
                <View className='form-item'>
                  <Text className='label'>营养信息</Text>
                  <Textarea
                    className='textarea'
                    value={form.nutritionInfo}
                    onInput={(e) => this.handleChange('nutritionInfo', e.detail.value)}
                    placeholder='请输入营养信息...'
                    maxlength={300}
                  />
                  <Text className='char-count'>{form.nutritionInfo.length}/300</Text>
                </View>

                <View className='form-item'>
                  <Text className='label'>烹饪建议</Text>
                  <Textarea
                    className='textarea'
                    value={form.cookingTips}
                    onInput={(e) => this.handleChange('cookingTips', e.detail.value)}
                    placeholder='请输入烹饪方法建议...'
                    maxlength={300}
                  />
                  <Text className='char-count'>{form.cookingTips.length}/300</Text>
                </View>
              </View>

              {/* 商品图片卡片 */}
              <View className='form-section'>
                <Text className='section-title'>商品图片</Text>
                <View className='image-upload-area'>
                  {imageUrls.length > 0 ? (
                    <View className='image-list'>
                      {imageUrls.map((url, index) => (
                        <View key={index} className='image-item'>
                          <Image src={url} className='preview-image' mode='aspectFill' />
                          <View className='image-overlay'>
                            <Text className='remove-btn' onClick={() => this.removeImage(index)}>×</Text>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View className='no-images-hint'>
                      <Text className='hint-text'>暂无图片，请上传或输入图片URL</Text>
                    </View>
                  )}
                  <Button
                    type='primary'
                    size='large'
                    onClick={this.handleUploadImage}
                    className='upload-btn'
                  >
                    <Text className='upload-icon'>📷</Text>
                    <Text>上传图片</Text>
                  </Button>
                  <Text className='upload-tip'>支持 JPG、PNG 格式，建议尺寸 800x800</Text>
                </View>
                <View className='form-item' style={{ marginTop: '20px' }}>
                  <Text className='label'>图片URL（一行一个，可选）</Text>
                  <Textarea
                    className='textarea'
                    value={form.imageUrlsText}
                    onInput={(e) => this.handleChange('imageUrlsText', e.detail.value)}
                    placeholder='也可以直接粘贴图片URL，每行一个&#10;例如：&#10;http://localhost:3000/uploads/image1.jpg&#10;http://localhost:3000/uploads/image2.jpg'
                  />
                  {imageUrls.length > 0 && (
                    <Text className='image-count-hint'>
                      当前有 {imageUrls.length} 张图片
                    </Text>
                  )}
                </View>
              </View>

              <View className='btn-row'>
                <Button
                  type='default'
                  size='large'
                  onClick={this.cancelEdit}
                  className='cancel-btn'
                >
                  取消
                </Button>
                <Button
                  type='primary'
                  size='large'
                  onClick={this.handleSave}
                  loading={saving}
                  className='save-btn'
                >
                  {saving ? '保存中...' : '保存商品'}
                </Button>
              </View>
            </View>
          </ScrollView>
        )}

        {!editingId && (
          <View className='list-section'>
            <Text className='list-title'>商品列表</Text>
            <ScrollView scrollY className='list-scroll'>
              {loading ? (
                <View className='empty'>
                  <Text>加载中...</Text>
                </View>
              ) : products.length === 0 ? (
                <View className='empty'>
                  <Text>暂无商品</Text>
                </View>
              ) : (
                products.map((item) => (
                  <View key={item.id} className='product-card'>
                    {item.imageUrls && item.imageUrls.length > 0 && item.imageUrls[0] ? (
                      <View className='card-image-wrapper'>
                        <Image
                          src={item.imageUrls[0]}
                          className='card-image'
                          mode='aspectFill'
                        />
                      </View>
                    ) : null}
                    <View className='card-header'>
                      <Text className='card-title'>{item.name}</Text>
                      <Text className='card-sub'>
                        ID: {item.id} / 分类: {item.categoryId}
                      </Text>
                    </View>
                    <View className='card-body'>
                      <Text className='card-line'>价格：¥{item.price}</Text>
                      <Text className='card-line'>库存：{item.stock}</Text>
                      {item.description ? (
                        <Text className='card-desc'>{item.description}</Text>
                      ) : null}
                    </View>
                    <View className='card-footer'>
                      <Button
                        type='default'
                        size='small'
                        className='card-btn'
                        onClick={() => this.startEdit(item)}
                      >
                        编辑
                      </Button>
                      <Button
                        type='danger'
                        size='small'
                        className='card-btn'
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
        )}
      </View>
    )
  }
}

