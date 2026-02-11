import { useState } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { authApi } from '../../services/api'
import { useUserStore } from '../../store/user'
import { Button, Input } from '../../components/ui'
import './index.scss'

export default function Login() {
  const [mode, setMode] = useState('login') // 'login' or 'register'
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const setUserInfo = useUserStore((state) => state.setUserInfo)
  const setToken = useUserStore((state) => state.setToken)

  const handleSubmit = async () => {
    if (!username || !password || (mode === 'register' && !phone)) {
      Taro.showToast({
        title: '请填写完整信息',
        icon: 'none',
      })
      return
    }

    try {
      if (mode === 'register') {
        await authApi.register({ username, password, phone })
        Taro.showToast({ title: '注册成功，请登录', icon: 'success' })
        setMode('login')
      } else {
        const res = await authApi.login({ username, password })
        // 后端返回 { access_token, user }
        setToken(res.access_token)
        setUserInfo(res.user)
        Taro.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => {
          Taro.switchTab({ url: '/pages/profile/index' })
        }, 500)
      }
    } catch (error) {
      console.error('登录/注册失败:', error)
      Taro.showToast({
        title: '操作失败，请检查账号信息',
        icon: 'none',
      })
    }
  }

  return (
    <View className="login-page">
      <View className="login-card">
        <Text className="title">{mode === 'login' ? '登录' : '注册'}</Text>

        <View className="form-item">
          <Text className="label">用户名</Text>
          <Input
            value={username}
            onInput={(e) => setUsername(e.detail.value)}
            placeholder="请输入用户名"
          />
        </View>

        {mode === 'register' && (
          <View className="form-item">
            <Text className="label">手机号</Text>
            <Input
              value={phone}
              onInput={(e) => setPhone(e.detail.value)}
              placeholder="请输入手机号"
            />
          </View>
        )}

        <View className="form-item">
          <Text className="label">密码</Text>
          <Input
            type="password"
            value={password}
            onInput={(e) => setPassword(e.detail.value)}
            placeholder="请输入密码"
          />
        </View>

        <Button
          type="primary"
          size="large"
          block
          onClick={handleSubmit}
          className="submit-btn"
        >
          {mode === 'login' ? '登录' : '注册'}
        </Button>

        <View className="switch-mode">
          {mode === 'login' ? (
            <Text onClick={() => setMode('register')}>没有账号？去注册</Text>
          ) : (
            <Text onClick={() => setMode('login')}>已有账号？去登录</Text>
          )}
        </View>
      </View>
    </View>
  )
}

