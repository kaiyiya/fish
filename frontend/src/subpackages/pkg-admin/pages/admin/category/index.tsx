import { Component } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import AdminShell from '../../../../../components/admin-shell'
import { categoryApi } from '../../../../../services/api'
import { Button, Input } from '../../../../../components/ui'
import { logger } from '../../../../../utils/logger'
import { isH5 } from '../../../../../utils/is-h5'
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
      logger.error('加载分类列表失败', error)
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
      logger.error('保存分类失败', error)
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
          logger.error('删除分类失败', error)
          Taro.showToast({ title: '删除失败', icon: 'none' })
        }
      },
    })
  }

  render() {
    const { loading, categories, editingId, form, saving } = this.state

    const page = (
      <View className={`admin-category-page ${isH5 ? 'admin-category-page--h5' : ''}`}>
        <View className="header">
          <Text className="title">分类管理</Text>
          <Button
            type="default"
            size="large"
            onClick={this.startCreate}
            className="create-btn"
          >
            新建分类
          </Button>
        </View>

        {isH5 && (
          <View className="category-toolbar-h5">
            <View className="category-toolbar-h5__left">
              <Text className="category-toolbar-h5__title">分类管理</Text>
              <Text className="category-toolbar-h5__subtitle">维护分类名称与前台排序</Text>
            </View>
            <Button type="primary" size="small" onClick={this.startCreate} className="category-toolbar-h5__btn">
              新建分类
            </Button>
          </View>
        )}

        {editingId && (
          <View className="edit-panel">
            <View className="panel-header">
              <Text className="panel-title">
                {editingId === 'new' ? '新建分类' : `编辑分类 #${editingId}`}
              </Text>
              <Text className="panel-subtitle">
                {editingId === 'new' ? '填写分类信息以创建新分类' : '修改分类信息'}
              </Text>
            </View>

            <View className="form-section">
              <Text className="section-title">基本信息</Text>
              <View className="form-item">
                <Text className="label">
                  分类名称 <Text className="required">*</Text>
                </Text>
                <Input
                  value={form.name}
                  onInput={(e) => this.handleChange('name', e.detail.value)}
                  placeholder="例如：海鱼"
                />
              </View>

              <View className="form-item">
                <Text className="label">排序（数字越小越靠前）</Text>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onInput={(e) => this.handleChange('sortOrder', e.detail.value)}
                  placeholder="例如：0"
                />
              </View>
            </View>

            <View className="btn-row">
              <Button
                type="default"
                size="large"
                onClick={this.cancelEdit}
                className="cancel-btn"
              >
                取消
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={this.handleSave}
                loading={saving}
                className="save-btn"
              >
                保存
              </Button>
            </View>
          </View>
        )}

        {!editingId && (
          <View className={`list-section ${isH5 ? 'list-section--enterprise' : ''}`}>
            {!isH5 && <Text className="list-title">分类列表</Text>}
            {isH5 && (
              <View className="enterprise-list-header">
                <Text className="enterprise-list-header__title">分类列表</Text>
                <Text className="enterprise-list-header__meta">
                  {loading ? '加载中…' : `共 ${categories.length} 条`}
                </Text>
              </View>
            )}
            {isH5 ? (
              <View className="list-scroll list-scroll--h5">
                {loading ? (
                  <View className="empty">
                    <Text>加载中...</Text>
                  </View>
                ) : categories.length === 0 ? (
                  <View className="empty">
                    <Text>暂无分类</Text>
                  </View>
                ) : (
                  <View className="category-table-wrap">
                    <View className="category-table">
                      <View className="category-table__thead">
                        <View className="category-table__tr category-table__tr--head">
                          <View className="category-table__th category-table__col-id">ID</View>
                          <View className="category-table__th category-table__col-name">分类名称</View>
                          <View className="category-table__th category-table__col-sort">排序</View>
                          <View className="category-table__th category-table__col-actions">操作</View>
                        </View>
                      </View>
                      <View className="category-table__tbody">
                        {categories.map((item) => (
                          <View key={item.id} className="category-table__tr category-table__tr--data">
                            <View className="category-table__td category-table__col-id">
                              <Text className="category-table__mono">{item.id}</Text>
                            </View>
                            <View className="category-table__td category-table__col-name">
                              <Text className="category-table__name">{item.name}</Text>
                            </View>
                            <View className="category-table__td category-table__col-sort">
                              <Text>{item.sortOrder || 0}</Text>
                            </View>
                            <View className="category-table__td category-table__col-actions">
                              <View className="category-table__action-btns">
                                <Button
                                  type="default"
                                  size="mini"
                                  className="category-table__btn"
                                  onClick={() => this.startEdit(item)}
                                >
                                  编辑
                                </Button>
                                <Button
                                  type="danger"
                                  size="mini"
                                  className="category-table__btn"
                                  onClick={() => this.handleRemove(item.id)}
                                >
                                  删除
                                </Button>
                              </View>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                )}
              </View>
            ) : (
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
                        <Button type="default" size="small" onClick={() => this.startEdit(item)}>
                          编辑
                        </Button>
                        <Button type="danger" size="small" onClick={() => this.handleRemove(item.id)}>
                          删除
                        </Button>
                      </View>
                    </View>
                  ))
                )}
              </ScrollView>
            )}
          </View>
        )}
      </View>
    )

    if (isH5) {
      return (
        <AdminShell
          title="分类管理"
          breadcrumb={[
            { label: '管理后台', path: '/subpackages/pkg-admin/pages/admin/index' },
            { label: '分类管理' },
          ]}
        >
          {page}
        </AdminShell>
      )
    }

    return page
  }
}
