import { Component } from 'react'
import Taro from '@tarojs/taro'
import { useUserStore } from './store/user'
import './app.scss'

class App extends Component {
  componentDidMount() {
    // 应用启动时，从本地存储恢复用户登录状态
    const store = useUserStore.getState()
    const token = Taro.getStorageSync('token')
    const userInfo = Taro.getStorageSync('userInfo')
    
    if (token && userInfo) {
      // 如果本地存储有 token 和 userInfo，恢复 store 状态
      store.setToken(token)
      store.setUserInfo(userInfo)
    }
  }

  componentDidShow() {}

  componentDidHide() {}

  render() {
    // this.props.children 是将要会渲染的页面
    return this.props.children
  }
}

export default App
