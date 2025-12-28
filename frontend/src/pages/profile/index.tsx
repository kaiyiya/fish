import { Component } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { useUserStore } from '../../store/user'
import './index.scss'

export default class Profile extends Component {
  handleLogin = () => {
    Taro.navigateTo({
      url: '/pages/login/index',
    })
  }

  handleLogout = () => {
    useUserStore.getState().logout()
    Taro.showToast({
      title: '已退出登录',
      icon: 'success',
    })
  }

  render() {
    const userInfo = useUserStore.getState().userInfo

    return (
      <View className="profile">
        {userInfo ? (
          <View className="user-info">
            <Text className="username">{userInfo.username}</Text>
            <Button className="logout-btn" onClick={this.handleLogout}>
              退出登录
            </Button>
          </View>
        ) : (
          <View className="login-prompt">
            <Text>请先登录</Text>
            <Button className="login-btn" onClick={this.handleLogin}>
              登录
            </Button>
          </View>
        )}
      </View>
    )
  }
}
