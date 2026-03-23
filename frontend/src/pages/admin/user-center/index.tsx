import { Component } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { Button, Input } from '../../../components/ui'
import { logger } from '../../../utils/logger'
import { walletApi, userApi } from '../../../services/api'
import './index.scss'

export default class AdminUserCenter extends Component {
  state = {
    loadingRecharge: false,
    loadingPassword: false,
    loadingUsers: false,

    userId: '',
    rechargeAmount: '',
    newPassword: '',

    lastBalance: '',

    phone: '',
    rechargeAmountByPhone: '',
    lastBalanceByPhone: '',

    users: [],
  }

  handleRecharge = async () => {
    const { userId, rechargeAmount } = this.state
    const uid = Number(String(userId || '').trim())
    const amount = Number(String(rechargeAmount || '').trim())

    if (!Number.isFinite(uid) || uid <= 0) {
      Taro.showToast({ title: '请输入有效用户ID', icon: 'none' })
      return
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      Taro.showToast({ title: '请输入有效充值金额', icon: 'none' })
      return
    }

    this.setState({ loadingRecharge: true })
    try {
      const res = await walletApi.adminRecharge({ userId: uid, amount })
      const balance = res?.balance ?? ''
      this.setState({ lastBalance: balance ? String(balance) : '', rechargeAmount: '' })
      Taro.showToast({ title: '充值成功', icon: 'success' })
    } catch (error) {
      logger.error('管理员充值失败', error)
      Taro.showToast({ title: '充值失败', icon: 'none' })
    } finally {
      this.setState({ loadingRecharge: false })
    }
  }

  handleUpdatePassword = async () => {
    const { userId, newPassword } = this.state
    const uid = Number(String(userId || '').trim())
    const password = String(newPassword || '')

    if (!Number.isFinite(uid) || uid <= 0) {
      Taro.showToast({ title: '请输入有效用户ID', icon: 'none' })
      return
    }
    if (password.length < 6) {
      Taro.showToast({ title: '密码至少6位', icon: 'none' })
      return
    }

    this.setState({ loadingPassword: true })
    try {
      await userApi.adminUpdatePassword(uid, { password })
      this.setState({ newPassword: '' })
      Taro.showToast({ title: '密码修改成功', icon: 'success' })
    } catch (error) {
      logger.error('管理员改密失败', error)
      Taro.showToast({ title: '修改失败', icon: 'none' })
    } finally {
      this.setState({ loadingPassword: false })
    }
  }

  loadUsers = async () => {
    this.setState({ loadingUsers: true })
    try {
      const users = await userApi.adminFindAll()
      this.setState({ users: users || [] })
      Taro.showToast({ title: `共 ${users?.length || 0} 个用户`, icon: 'none' })
    } catch (error) {
      logger.error('加载用户列表失败', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setState({ loadingUsers: false })
    }
  }

  handleRechargeByPhone = async () => {
    const { phone, rechargeAmountByPhone } = this.state
    const amount = Number(String(rechargeAmountByPhone || '').trim())

    if (!String(phone || '').trim()) {
      Taro.showToast({ title: '请输入手机号', icon: 'none' })
      return
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      Taro.showToast({ title: '请输入有效充值金额', icon: 'none' })
      return
    }

    this.setState({ loadingRecharge: true })
    try {
      const res = await walletApi.adminRechargeByPhone({
        phone: String(phone).trim(),
        amount,
      })
      const balance = res?.balance ?? ''
      this.setState({ lastBalanceByPhone: balance ? String(balance) : '', rechargeAmountByPhone: '' })
      Taro.showToast({ title: '手机号充值成功', icon: 'success' })
    } catch (error) {
      logger.error('手机号充值失败', error)
      Taro.showToast({ title: '充值失败', icon: 'none' })
    } finally {
      this.setState({ loadingRecharge: false })
    }
  }

  render() {
    const {
      userId,
      rechargeAmount,
      newPassword,
      loadingRecharge,
      loadingPassword,
      lastBalance,
      loadingUsers,
      users,
      phone,
      rechargeAmountByPhone,
      lastBalanceByPhone,
    } = this.state

    return (
      <View className="admin-user-center">
        <View className="header">
          <Text className="title">用户充值 / 改密</Text>
        </View>

        <ScrollView scrollY className="content">
          <View className="section">
            <Text className="section-title">查看所有用户信息</Text>
            <View className="row-actions">
              <Button type="primary" size="medium" loading={loadingUsers} onClick={this.loadUsers}>
                获取用户列表
              </Button>
            </View>

            {users.length > 0 && (
              <View className="users-list">
                {users.map((u) => (
                  <View key={u.id} className="user-row">
                    <Text className="user-text">ID: {u.id}</Text>
                    <Text className="user-text">用户名: {u.username}</Text>
                    <Text className="user-text">手机号: {u.phone}</Text>
                    <Text className="user-text">角色: {u.role}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View className="section">
            <Text className="section-title">共同字段</Text>
            <View className="field">
              <Text className="label">用户ID</Text>
              <Input
                type="digit"
                value={userId}
                placeholder="输入要操作的用户ID"
                onInput={(e) => this.setState({ userId: e.detail.value })}
              />
            </View>
          </View>

          <View className="section">
            <Text className="section-title">管理员充值</Text>
            <View className="field">
              <Text className="label">充值金额（CNY）</Text>
              <Input
                type="digit"
                value={rechargeAmount}
                placeholder="例如：100"
                onInput={(e) => this.setState({ rechargeAmount: e.detail.value })}
              />
            </View>

            <View className="row-actions">
              <Button
                type="primary"
                size="medium"
                loading={loadingRecharge}
                onClick={this.handleRecharge}
              >
                立即充值
              </Button>
            </View>

            {lastBalance !== '' && (
              <View className="hint">
                <Text>充值后余额：{lastBalance}</Text>
              </View>
            )}
          </View>

          <View className="section">
            <Text className="section-title">管理员通过手机号充值</Text>
            <View className="field">
              <Text className="label">手机号</Text>
              <Input
                type="text"
                value={phone}
                placeholder="输入用户手机号"
                onInput={(e) => this.setState({ phone: e.detail.value })}
              />
            </View>

            <View className="field">
              <Text className="label">充值金额（CNY）</Text>
              <Input
                type="digit"
                value={rechargeAmountByPhone}
                placeholder="例如：100"
                onInput={(e) => this.setState({ rechargeAmountByPhone: e.detail.value })}
              />
            </View>

            <View className="row-actions">
              <Button
                type="primary"
                size="medium"
                loading={loadingRecharge}
                onClick={this.handleRechargeByPhone}
              >
                手机号充值
              </Button>
            </View>

            {lastBalanceByPhone !== '' && (
              <View className="hint">
                <Text>充值后余额：{lastBalanceByPhone}</Text>
              </View>
            )}
          </View>

          <View className="section">
            <Text className="section-title">管理员修改密码</Text>
            <View className="field">
              <Text className="label">新密码</Text>
              <Input
                type="password"
                value={newPassword}
                placeholder="至少6位"
                onInput={(e) => this.setState({ newPassword: e.detail.value })}
              />
            </View>

            <View className="row-actions">
              <Button
                type="default"
                size="medium"
                loading={loadingPassword}
                onClick={this.handleUpdatePassword}
              >
                修改密码
              </Button>
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }
}

