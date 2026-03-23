import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as QRCode from 'qrcode';
import { ConfigService } from '@nestjs/config';

import { VirtualAccount } from '../../database/entities/virtual-account.entity';
import { WalletRechargeSession } from '../../database/entities/wallet-recharge-session.entity';
import { WalletTransaction } from '../../database/entities/wallet-transaction.entity';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(VirtualAccount)
    private virtualAccountRepository: Repository<VirtualAccount>,
    @InjectRepository(WalletRechargeSession)
    private rechargeSessionRepository: Repository<WalletRechargeSession>,
    @InjectRepository(WalletTransaction)
    private walletTransactionRepository: Repository<WalletTransaction>,
    private configService: ConfigService,
  ) {}

  async ensureAccount(userId: number): Promise<VirtualAccount> {
    let account = await this.virtualAccountRepository.findOne({ where: { userId } });
    if (!account) {
      account = this.virtualAccountRepository.create({
        userId,
        balance: 0,
        currency: 'CNY',
      });
      account = await this.virtualAccountRepository.save(account);
    }
    return account;
  }

  async getBalance(userId: number) {
    const account = await this.ensureAccount(userId);
    return {
      balance: Number(account.balance),
      currency: account.currency,
    };
  }

  async createRechargeCode(userId: number, amount: number) {
    const account = await this.ensureAccount(userId);
    if (amount <= 0) throw new BadRequestException('充值金额必须大于0');

    const token = `RC${Date.now()}${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    const session = await this.rechargeSessionRepository.save({
      userId: account.userId,
      amount,
      status: 'pending',
      token,
      paid_at: null,
    });

    const confirmBaseUrl =
      this.configService.get('RECHARGE_CONFIRM_BASE_URL') ||
      'http://localhost:3000';
    const confirmUrl = `${confirmBaseUrl}/wallet/recharge/confirm?token=${encodeURIComponent(token)}`;

    const qrcodeDataUrl = await QRCode.toDataURL(confirmUrl, {
      errorCorrectionLevel: 'M',
      margin: 2,
      scale: 6,
    });

    return {
      rechargeSessionId: session.id,
      token,
      amount: Number(session.amount),
      status: session.status,
      qrcodeDataUrl,
      // 给前端做显示/提示用（可选）
      confirmUrl,
    };
  }

  async confirmRechargeByToken(token: string) {
    const session = await this.rechargeSessionRepository.findOne({ where: { token } });
    if (!session) throw new NotFoundException('充值码不存在');
    if (session.status !== 'pending') {
      return {
        rechargeSessionId: session.id,
        status: session.status,
        balance: await this.getBalance(session.userId),
      };
    }

    // 原子扣/加逻辑：确保并发场景余额不会不一致（简单条件更新）
    await this.virtualAccountRepository.manager.transaction(async (manager) => {
      const account = await manager.findOne(VirtualAccount, {
        where: { userId: session.userId },
      });

      const accountToUse =
        account ||
        manager.create(VirtualAccount, {
          userId: session.userId,
          balance: 0,
          currency: 'CNY',
        });

      const before = Number(accountToUse.balance);
      accountToUse.balance = before + Number(session.amount);
      await manager.save(accountToUse);

      session.status = 'success';
      session.paid_at = new Date();
      await manager.save(session);

      const after = Number(accountToUse.balance);
      await manager.save(
        this.walletTransactionRepository.create({
          userId: session.userId,
          type: 'recharge',
          amount: Number(session.amount),
          balanceBefore: before,
          balanceAfter: after,
          orderId: null,
          rechargeSessionId: session.id,
          status: 'success',
        }),
      );
    });

    const balance = await this.getBalance(session.userId);
    return {
      rechargeSessionId: session.id,
      status: 'success',
      balance,
    };
  }

  async payWithWallet(userId: number, orderId: number, amount: number, paymentMethod = 'wallet_mock') {
    if (amount <= 0) throw new BadRequestException('支付金额无效');

    const account = await this.ensureAccount(userId);

    await this.virtualAccountRepository.manager.transaction(async (manager) => {
      const beforeAccount = await manager.findOne(VirtualAccount, { where: { userId } });
      if (!beforeAccount) throw new NotFoundException('虚拟账户不存在');
      const before = Number(beforeAccount.balance);

      // 余额不足直接拒绝（保证并发安全：条件更新）
      const result = await manager
        .createQueryBuilder()
        .update(VirtualAccount)
        .set({ balance: () => 'balance - :amount', updated_at: () => 'CURRENT_TIMESTAMP' })
        .where('userId = :userId', { userId })
        .andWhere('balance >= :amount', { amount })
        .execute();

      if (!result.affected || result.affected <= 0) {
        throw new BadRequestException('余额不足');
      }

      const afterAccount = await manager.findOne(VirtualAccount, { where: { userId } });
      if (!afterAccount) throw new NotFoundException('虚拟账户不存在');
      const after = Number(afterAccount.balance);

      // 写入流水（扣款为负数：用于快速区分）
      await manager.save(
        this.walletTransactionRepository.create({
          userId,
          type: 'payment',
          amount: -Math.abs(Number(amount)),
          balanceBefore: before,
          balanceAfter: after,
          orderId,
          rechargeSessionId: null,
          status: 'success',
        }),
      );

      // 直接更新 order.paymentMethod 由 OrderService 再处理（这里不依赖 Order 表，避免循环依赖）
    });

    const balance = await this.getBalance(userId);
    return { balance };
  }
}

