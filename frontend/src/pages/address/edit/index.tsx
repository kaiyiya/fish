import React, { Component } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { addressApi } from '../../../services/api'
import { Button, Input } from '../../../components/ui'
import RegionSelector from '../../../components/common/RegionSelector'
import { useUserStore } from '../../../store/user'
import { logger } from '../../../utils/logger'
import './index.scss'

export default class AddressEdit extends Component {
  state = {
    loading: true,
    addressId: null,
    form: {
      name: '',
      phone: '',
      province: '',
      city: '',
      district: '',
      detail: '',
      postalCode: '',
      isDefault: false,
    },
    submitting: false,
  }

  componentDidMount() {
    const instance = Taro.getCurrentInstance()
    const id = instance?.router?.params?.id
    if (id) {
      this.setState({ addressId: id })
      this.loadAddress(id)
    } else {
      this.setState({ loading: false })
    }
  }

  loadAddress = async (id) => {
    try {
      const address = await addressApi.getDetail(id)
      this.setState({
        form: {
          name: address.name || '',
          phone: address.phone || '',
          province: address.province || '',
          city: address.city || '',
          district: address.district || '',
          detail: address.detail || '',
          postalCode: address.postalCode || '',
          isDefault: address.isDefault || false,
        },
        loading: false,
      })
    } catch (error) {
      logger.error('加载地址失败', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
      this.setState({ loading: false })
    }
  }

  handleInputChange = (key, value) => {
    this.setState((prevState) => ({
      form: {
        ...prevState.form,
        [key]: value,
      },
    }))
  }

  handleRegionChange = (region: { province: string; city: string; district: string }) => {
    this.setState((prevState) => ({
      form: {
        ...prevState.form,
        province: region.province,
        city: region.city,
        district: region.district,
      },
    }))
  }

  handleSubmit = async () => {
    const { form, addressId, submitting } = this.state
    if (submitting) return

    // 验证必填项
    if (!form.name || !form.phone || !form.province || !form.city || !form.district || !form.detail) {
      Taro.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }

    // 验证手机号
    const phoneReg = /^1[3-9]\d{9}$/
    if (!phoneReg.test(form.phone)) {
      Taro.showToast({ title: '请输入正确的手机号', icon: 'none' })
      return
    }

    this.setState({ submitting: true })
    try {
      if (addressId) {
        // 更新地址
        await addressApi.update(addressId, form)
        Taro.showToast({ title: '更新成功', icon: 'success' })
      } else {
        // 创建地址
        await addressApi.create(form)
        Taro.showToast({ title: '添加成功', icon: 'success' })
      }
      // 保存成功后返回上一页
      setTimeout(() => {
        Taro.navigateBack()
      }, 800)
    } catch (error) {
      logger.error('保存地址失败', error)
      Taro.showToast({ 
        title: error.message || '保存失败，请稍后重试', 
        icon: 'none' 
      })
      this.setState({ submitting: false })
    }
  }

  render() {
    const { loading, form, submitting, addressId } = this.state
    const store = useUserStore.getState()
    const userInfo = store && store.userInfo

    if (!userInfo) {
      return (
        <View className="address-edit-page">
          <View className="empty-container">
            <Text className="empty-icon">🔒</Text>
            <Text className="empty-text">请先登录</Text>
            <Button
              type="primary"
              size="medium"
              onClick={() => Taro.navigateTo({ url: '/pages/login/index' })}
              className="login-btn"
            >
              去登录
            </Button>
          </View>
        </View>
      )
    }

    if (loading) {
      return (
        <View className="address-edit-page">
          <View className="loading-container">
            <Text className="loading-text">加载中...</Text>
          </View>
        </View>
      )
    }

    return (
      <View className="address-edit-page">
        <ScrollView scrollY className="edit-scroll">
          <View className="form-section">
            <View className="form-item">
              <Text className="form-label">收货人姓名</Text>
              <Input
                type="text"
                value={form.name}
                onInput={(e) => this.handleInputChange('name', e.detail.value)}
                placeholder="请输入收货人姓名"
                className="form-input"
              />
            </View>

            <View className="form-item">
              <Text className="form-label">手机号码</Text>
              <Input
                type="text"
                value={form.phone}
                onInput={(e) => this.handleInputChange('phone', e.detail.value)}
                placeholder="请输入手机号码"
                maxlength={11}
                className="form-input"
              />
            </View>

            <View className="form-item">
              <Text className="form-label">所在地区</Text>
              <RegionSelector
                value={{
                  province: form.province,
                  city: form.city,
                  district: form.district,
                }}
                onChange={this.handleRegionChange}
              />
            </View>

            <View className="form-item">
              <Text className="form-label">详细地址</Text>
              <Input
                type="text"
                value={form.detail}
                onInput={(e) => this.handleInputChange('detail', e.detail.value)}
                placeholder="请输入详细地址"
                className="form-input"
              />
            </View>

            <View className="form-item">
              <Text className="form-label">邮政编码（可选）</Text>
              <Input
                type="text"
                value={form.postalCode}
                onInput={(e) => this.handleInputChange('postalCode', e.detail.value)}
                placeholder="请输入邮政编码"
                className="form-input"
              />
            </View>

            <View className="form-item checkbox-item">
              <View 
                className={`checkbox ${form.isDefault ? 'checked' : ''}`}
                onClick={() => this.handleInputChange('isDefault', !form.isDefault)}
              >
                {form.isDefault && <Text className="check-icon">✓</Text>}
              </View>
              <Text className="checkbox-label">设为默认地址</Text>
            </View>
          </View>
        </ScrollView>

        <View className="edit-footer">
          <Button
            type="primary"
            size="large"
            block
            onClick={this.handleSubmit}
            loading={submitting}
            className="submit-btn"
          >
            {submitting ? '保存中...' : addressId ? '更新地址' : '保存地址'}
          </Button>
        </View>
      </View>
    )
  }
}
