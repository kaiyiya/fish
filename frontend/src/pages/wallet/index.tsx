import React, { Component } from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { walletApi } from '../../services/api'
import { Button, Input } from '../../components/ui'
import { logger } from '../../utils/logger'
import './index.scss'

export default class WalletPage extends Component {
  state = {
    loading: true,
    balance: 0,
    currency: 'CNY',
    creating: false,
    rechargeAmount: '',
    rechargeCode: null as null | {
      rechargeSessionId: number
      token: string
      amount: number
      qrcodeDataUrl: string
      confirmUrl?: string
    },
  }

  componentDidMount() {
    this.loadBalance()
  }

  loadBalance = async () => {
    try {
      const res = await walletApi.getBalance()
      this.setState({
        balance: Number(res?.balance || 0),
        currency: res?.currency || 'CNY',
        loading: false,
      })
    } catch (error) {
      logger.error('加载钱包余额失败', error)
      Taro.showToast({ title: '加载失败', icon: 'none' })
      this.setState({ loading: false })
    }
  }

  handleCreateRecharge = async () => {
    const { creating, rechargeAmount } = this.state
    if (creating) return

    const amount = Number(rechargeAmount)
    if (!Number.isFinite(amount) || amount <= 0) {
      Taro.showToast({ title: '请输入正确充值金额', icon: 'none' })
      return
    }

    this.setState({ creating: true })
    try {
      const res = await walletApi.createRechargeCode(amount)
      this.setState({ rechargeCode: res, creating: false })
      Taro.showToast({ title: '充值码已生成', icon: 'success' })
    } catch (error) {
      logger.error('生成充值码失败', error)
      Taro.showToast({ title: error.message || '生成失败', icon: 'none' })
      this.setState({ creating: false })
    }
  }

  render() {
    const { loading, balance, currency, creating, rechargeAmount, rechargeCode } = this.state

    if (loading) {
      return (
        <View className="wallet-page">
          <View className="loading-container">
            <Text className="loading-text">加载中...</Text>
          </View>
        </View>
      )
    }

    return (
      <View className="wallet-page">
        <View className="balance-card">
          <Text className="balance-label">虚拟账户余额</Text>
          <Text className="balance-value">
            {currency} {balance.toFixed(2)}
          </Text>
        </View>

        <View className="recharge-card">
          <Text className="section-title">充值（扫码演示）</Text>

          <View className="row">
            <Input
              type="digit"
              value={rechargeAmount}
              onInput={(e) => this.setState({ rechargeAmount: e.detail.value })}
              placeholder="输入充值金额（元）"
              className="amount-input"
            />
          </View>

          <Button
            type="primary"
            size="large"
            block
            onClick={this.handleCreateRecharge}
            loading={creating}
            className="recharge-btn"
          >
            {creating ? '生成中...' : '生成充值码'}
          </Button>

          {rechargeCode ? (
            <View className="qr-section">
              <Text className="qr-title">扫描二维码完成充值</Text>
              <View className="qr-wrap">
                <Image className="qr-img" src={rechargeCode.qrcodeDataUrl} />
              </View>
              <Text className="qr-hint">
                演示模式：扫码后会调用 `充值确认` 接口自动入账。若未自动入账，可再次刷新余额。
              </Text>
              <Button
                type="default"
                size="medium"
                onClick={async () => {
                  await this.loadBalance()
                  Taro.showToast({ title: '已刷新', icon: 'success', duration: 1200 })
                }}
                className="refresh-btn"
              >
                刷新余额
              </Button>
            </View>
          ) : null}
        </View>
      </View>
    )
  }
}

