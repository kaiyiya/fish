import React, { Component } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { addressApi } from '../../../services/api'
import { Button } from '../../../components/ui'
import { useUserStore } from '../../../store/user'
import { logger } from '../../../utils/logger'
import './index.scss'

export default class AddressList extends Component {
  state = {
    loading: true,
    addressList: [],
    selecting: false, // 是否在选择地址模式（从订单页面跳转过来）
  }

  componentDidMount() {
    const instance = Taro.getCurrentInstance()
    const selecting = instance?.router?.params?.selecting === 'true'
    this.setState({ selecting })
    this.loadAddressList()
  }

  componentDidShow() {
    // 每次页面显示时刷新地址列表
    this.loadAddressList()
  }

  loadAddressList = async () => {
    try {
      const list = await addressApi.getList()
      this.setState({ 
        addressList: list || [],
        loading: false,
      })
    } catch (error) {
      logger.error('加载地址列表失败', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
      this.setState({ loading: false })
    }
  }

  handleAddAddress = () => {
    Taro.navigateTo({
      url: '/pages/address/edit/index',
    })
  }

  handleEditAddress = (id) => {
    Taro.navigateTo({
      url: `/pages/address/edit/index?id=${id}`,
    })
  }

  handleDeleteAddress = async (id) => {
    const res = await Taro.showModal({
      title: '提示',
      content: '确定要删除这个地址吗？',
    })
    if (!res.confirm) return

    try {
      await addressApi.remove(id)
      Taro.showToast({ title: '删除成功', icon: 'success' })
      this.loadAddressList()
    } catch (error) {
      logger.error('删除地址失败', error)
      Taro.showToast({ title: '删除失败', icon: 'none' })
    }
  }

  handleSetDefault = async (id) => {
    try {
      await addressApi.setDefault(id)
      Taro.showToast({ title: '设置成功', icon: 'success' })
      this.loadAddressList()
    } catch (error) {
      logger.error('设置默认地址失败', error)
      Taro.showToast({ title: '设置失败', icon: 'none' })
    }
  }

  handleSelectAddress = (address) => {
    if (this.state.selecting) {
      // 返回上一页并传递选中的地址
      const pages = Taro.getCurrentPages()
      const prevPage = pages[pages.length - 2]
      if (prevPage) {
        prevPage.setData?.({ selectedAddress: address })
      }
      Taro.navigateBack()
    }
  }

  render() {
    const { loading, addressList, selecting } = this.state
    const store = useUserStore.getState()
    const userInfo = store && store.userInfo

    if (!userInfo) {
      return (
        <View className="address-page">
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
        <View className="address-page">
          <View className="loading-container">
            <Text className="loading-text">加载中...</Text>
          </View>
        </View>
      )
    }

    return (
      <View className="address-page">
        <ScrollView scrollY className="address-scroll">
          {addressList.length > 0 ? (
            <View className="address-list">
              {addressList.map((address) => (
                <View 
                  key={address.id} 
                  className={`address-item ${address.isDefault ? 'default' : ''}`}
                  onClick={() => this.handleSelectAddress(address)}
                >
                  <View className="address-content">
                    <View className="address-header">
                      <Text className="address-name">{address.name}</Text>
                      <Text className="address-phone">{address.phone}</Text>
                      {address.isDefault && (
                        <View className="default-badge">
                          <Text>默认</Text>
                        </View>
                      )}
                    </View>
                    <Text className="address-detail">
                      {address.province}{address.city}{address.district}{address.detail}
                    </Text>
                  </View>
                  <View className="address-actions" onClick={(e) => e.stopPropagation()}>
                    {!address.isDefault && (
                      <View 
                        className="action-btn"
                        onClick={() => this.handleSetDefault(address.id)}
                      >
                        <Text className="action-text">设为默认</Text>
                      </View>
                    )}
                    <View 
                      className="action-btn"
                      onClick={() => this.handleEditAddress(address.id)}
                    >
                      <Text className="action-text">编辑</Text>
                    </View>
                    <View 
                      className="action-btn delete"
                      onClick={() => this.handleDeleteAddress(address.id)}
                    >
                      <Text className="action-text">删除</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View className="empty-container">
              <Text className="empty-icon">📍</Text>
              <Text className="empty-text">暂无地址</Text>
            </View>
          )}
        </ScrollView>

        <View className="address-footer">
          <Button
            type="primary"
            size="large"
            block
            onClick={this.handleAddAddress}
            className="add-address-btn"
          >
            添加新地址
          </Button>
        </View>
      </View>
    )
  }
}
