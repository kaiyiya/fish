import { Component } from 'react'
import { View, Text, Input, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { categoryApi } from '../../../services/api'
import './index.scss'

export default class AdminCategory extends Component {
  state = {
    loading: true,
    saving: false,
    categories: [],
    editingId: null,
    form: {
      name: '',
      sortOrder: '0',
    },
  }

  componentDidMount() {
    this.loadCategories()
  }

  loadCategories = async () => {
    try {
      const categories = await categoryApi.getList()
      this.setState({ categories, loading: false })
    } catch (error) {
      console.error('加载分类列表失败:', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
      this.setState({ loading: false })
    }
  }

  startCreate = () => {
    this.setState({
      editingId: 'new',
      form: {
        name: '',
        sortOrder: '0',
      },
    })
  }

  startEdit = (category) => {
    this.setState({
      editingId: category.id,
      form: {
        name: category.name || '',
        sortOrder: String(category.sortOrder || 0),
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

  handleSave = async () => {
    const { editingId, form, saving } = this.state
    if (!editingId || saving) return

    if (!form.name) {
      Taro.showToast({ title: '请输入分类名称', icon: 'none' })
      return
    }

    this.setState({ saving: true })

    try {
      const payload = {
        name: form.name,
        sortOrder: Number(form.sortOrder) || 0,
      }

      if (editingId === 'new') {
        await categoryApi.create(payload)
        Taro.showToast({ title: '创建成功', icon: 'success' })
      } else {
        await categoryApi.update(editingId, payload)
        Taro.showToast({ title: '保存成功', icon: 'success' })
      }

      this.setState({ editingId: null })
      this.loadCategories()
    } catch (error) {
      console.error('保存分类失败:', error)
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
      content: '确定要删除该分类吗？',
      success: async (res) => {
        if (!res.confirm) return
        try {
          await categoryApi.remove(id)
          Taro.showToast({ title: '删除成功', icon: 'success' })
          this.loadCategories()
        } catch (error) {
          console.error('删除分类失败:', error)
          Taro.showToast({ title: '删除失败', icon: 'none' })
        }
      },
    })
  }

  render() {
    const { loading, categories, editingId, form, saving } = this.state

    return (
      <View className="admin-category-page">
        <View className="header">
          <Text className="title">分类管理</Text>
          <Button className="create-btn" onClick={this.startCreate}>
            新建分类
          </Button>
        </View>

        {editingId && (
          <View className="edit-panel">
            <Text className="panel-title">
              {editingId === 'new' ? '新建分类' : `编辑分类 #${editingId}`}
            </Text>

            <View className="form-item">
              <Text className="label">分类名称 *</Text>
              <Input
                className="input"
                value={form.name}
                onInput={(e) => this.handleChange('name', e.detail.value)}
                placeholder="例如：海鱼"
              />
            </View>

            <View className="form-item">
              <Text className="label">排序（数字越小越靠前）</Text>
              <Input
                className="input"
                value={form.sortOrder}
                onInput={(e) => this.handleChange('sortOrder', e.detail.value)}
                placeholder="例如：0"
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
          ) : categories.length === 0 ? (
            <View className="empty">
              <Text>暂无分类</Text>
            </View>
          ) : (
            categories.map((item) => (
              <View key={item.id} className="category-card">
                <View className="card-content">
                  <View className="card-left">
                    <Text className="card-name">{item.name}</Text>
                    <Text className="card-meta">
                      ID: {item.id} | 排序: {item.sortOrder || 0}
                    </Text>
                  </View>
                </View>
                <View className="card-actions">
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
