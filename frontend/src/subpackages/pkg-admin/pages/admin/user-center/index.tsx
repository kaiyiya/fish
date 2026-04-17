import { Component } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import AdminShell from '../../../../../components/admin-shell'
import { Button, Input } from '../../../../../components/ui'
import { logger } from '../../../../../utils/logger'
import { walletApi, userApi } from '../../../../../services/api'
import { isH5 } from '../../../../../utils/is-h5'
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

  loadUsers = async (opts?: { silent?: boolean }) => {
    this.setState({ loadingUsers: true })
    try {
      const users = await userApi.adminFindAll()
      this.setState({ users: users || [] })
      if (!opts?.silent) {
        Taro.showToast({ title: `共 ${users?.length || 0} 个用户`, icon: 'none' })
      }
    } catch (error) {
      logger.error('加载用户列表失败', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      this.setState({ loadingUsers: false })
    }
  }

  componentDidMount() {
    if (isH5) {
      this.loadUsers({ silent: true })
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

    const tableBodyH5 =
      users.length > 0 ? (
        users.map((u) => (
          <View key={u.id} className="users-table__tr users-table__tr--data">
            <View className="users-table__td users-table__mono users-table__col-id">{u.id}</View>
            <View className="users-table__td">
              <Text className="users-table__name">{u.username || '—'}</Text>
            </View>
            <View className="users-table__td users-table__td--phone">{u.phone || '—'}</View>
            <View className="users-table__td users-table__td--role">{u.role || '—'}</View>
          </View>
        ))
      ) : (
        <View className="users-table__placeholder">
          <Text className="users-table__placeholder-text">
            {loadingUsers ? '加载中…' : '暂无数据，可点击右上角「刷新列表」重新加载'}
          </Text>
        </View>
      )

    const bodyH5 = (
      <View className="list-section list-section--enterprise user-center-h5">
        <View className="uc-panel uc-panel--table">
          <View className="enterprise-list-header enterprise-list-header--with-action">
            <View className="enterprise-list-header__text">
              <Text className="enterprise-list-header__title user-center-h5__title-inline">
                用户账号列表
              </Text>
              <Text className="enterprise-list-header__meta">共 {users.length} 条</Text>
            </View>
            <Button
              type="primary"
              size="small"
              loading={loadingUsers}
              onClick={() => this.loadUsers()}
              className="enterprise-list-header__action"
            >
              刷新列表
            </Button>
          </View>
          <View className="users-table-frame">
            <View className="users-table">
              <View className="users-table__tr users-table__tr--head">
                <View className="users-table__th users-table__col-id">ID</View>
                <View className="users-table__th">用户名</View>
                <View className="users-table__th users-table__th--phone">手机号</View>
                <View className="users-table__th users-table__th--role">角色</View>
              </View>
              {tableBodyH5}
            </View>
          </View>
        </View>

        <View className="uc-panel uc-panel--ops">
          <Text className="uc-panel__heading user-center-h5__title-inline">管理操作</Text>
          <Text className="uc-panel__lead">
            先填写「目标用户 ID」再进行按 ID 充值或改密；手机号充值为独立通道。
          </Text>

          <View className="uc-target">
            <Text className="uc-target__label">目标用户 ID</Text>
            <Input
              type="digit"
              value={userId}
              placeholder="充值、改密前填写"
              onInput={(e) => this.setState({ userId: e.detail.value })}
              className="uc-target__input"
            />
          </View>

          <View className="uc-ops-grid">
            <View className="uc-ops-card">
              <Text className="uc-ops-card__name user-center-h5__title-inline">按用户 ID 充值</Text>
              <View className="uc-ops-card__row">
                <Text className="uc-ops-card__lbl">金额（CNY）</Text>
                <Input
                  type="digit"
                  value={rechargeAmount}
                  placeholder="100"
                  onInput={(e) => this.setState({ rechargeAmount: e.detail.value })}
                  className="uc-ops-card__field"
                />
                <Button type="primary" size="small" loading={loadingRecharge} onClick={this.handleRecharge}>
                  立即充值
                </Button>
              </View>
              {lastBalance !== '' ? (
                <View className="uc-hint">
                  <Text>充值后余额：{lastBalance}</Text>
                </View>
              ) : null}
            </View>

            <View className="uc-ops-card">
              <Text className="uc-ops-card__name user-center-h5__title-inline">按手机号充值</Text>
              <View className="uc-ops-card__row uc-ops-card__row--phone">
                <View className="uc-ops-card__pair">
                  <Text className="uc-ops-card__lbl">手机号</Text>
                  <Input
                    type="text"
                    value={phone}
                    placeholder="11 位手机号"
                    onInput={(e) => this.setState({ phone: e.detail.value })}
                    className="uc-ops-card__field"
                  />
                </View>
                <View className="uc-ops-card__pair">
                  <Text className="uc-ops-card__lbl">金额</Text>
                  <Input
                    type="digit"
                    value={rechargeAmountByPhone}
                    placeholder="100"
                    onInput={(e) => this.setState({ rechargeAmountByPhone: e.detail.value })}
                    className="uc-ops-card__field"
                  />
                </View>
                <Button
                  type="primary"
                  size="small"
                  loading={loadingRecharge}
                  onClick={this.handleRechargeByPhone}
                  className="uc-ops-card__btn-inline"
                >
                  充值
                </Button>
              </View>
              {lastBalanceByPhone !== '' ? (
                <View className="uc-hint">
                  <Text>充值后余额：{lastBalanceByPhone}</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View className="uc-ops-card uc-ops-card--password">
            <Text className="uc-ops-card__name user-center-h5__title-inline">修改密码</Text>
            <View className="uc-ops-card__row">
              <Text className="uc-ops-card__lbl">新密码</Text>
              <Input
                type="password"
                value={newPassword}
                placeholder="至少 6 位"
                onInput={(e) => this.setState({ newPassword: e.detail.value })}
                className="uc-ops-card__field uc-ops-card__field--wide"
              />
              <Button type="default" size="small" loading={loadingPassword} onClick={this.handleUpdatePassword}>
                保存
              </Button>
            </View>
          </View>
        </View>
      </View>
    )

    const bodyMini = (
      <>
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
            <Text className="label">用户 ID</Text>
            <Input
              type="digit"
              value={userId}
              placeholder="充值、改密前填写"
              onInput={(e) => this.setState({ userId: e.detail.value })}
            />
          </View>
        </View>

        <View className="section">
          <Text className="section-title">按用户 ID 充值</Text>
          <View className="field">
            <Text className="label">金额（CNY）</Text>
            <Input
              type="digit"
              value={rechargeAmount}
              placeholder="例如：100"
              onInput={(e) => this.setState({ rechargeAmount: e.detail.value })}
            />
          </View>

          <View className="row-actions">
            <Button type="primary" size="medium" loading={loadingRecharge} onClick={this.handleRecharge}>
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
          <Text className="section-title">按手机号充值</Text>
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
            <Text className="label">金额（CNY）</Text>
            <Input
              type="digit"
              value={rechargeAmountByPhone}
              placeholder="例如：100"
              onInput={(e) => this.setState({ rechargeAmountByPhone: e.detail.value })}
            />
          </View>

          <View className="row-actions">
            <Button type="primary" size="medium" loading={loadingRecharge} onClick={this.handleRechargeByPhone}>
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
          <Text className="section-title">修改密码</Text>
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
            <Button type="default" size="medium" loading={loadingPassword} onClick={this.handleUpdatePassword}>
              修改密码
            </Button>
          </View>
        </View>
      </>
    )

    const body = isH5 ? bodyH5 : bodyMini

    const page = (
      <View className={`admin-user-center ${isH5 ? 'admin-user-center--h5' : ''}`}>
        <View className="header">
          <Text className="title">用户充值 / 改密</Text>
        </View>

        {isH5 && (
          <View className="user-center-toolbar-h5">
            <View className="user-center-toolbar-h5__left">
              <Text className="user-center-toolbar-h5__title">用户与充值</Text>
              <Text className="user-center-toolbar-h5__subtitle">查询用户、余额充值与密码管理</Text>
            </View>
          </View>
        )}

        {isH5 ? (
          <View className="content content--h5 content--h5--wide">{body}</View>
        ) : (
          <ScrollView scrollY className="content">
            {body}
          </ScrollView>
        )}
      </View>
    )

    if (isH5) {
      return (
        <AdminShell
          title="用户与充值"
          breadcrumb={[
            { label: '管理后台', path: '/subpackages/pkg-admin/pages/admin/index' },
            { label: '用户与充值' },
          ]}
        >
          {page}
        </AdminShell>
      )
    }

    return page
  }
}

