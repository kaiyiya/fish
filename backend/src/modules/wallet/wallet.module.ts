import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { VirtualAccount } from '../../database/entities/virtual-account.entity';
import { WalletRechargeSession } from '../../database/entities/wallet-recharge-session.entity';
import { WalletTransaction } from '../../database/entities/wallet-transaction.entity';
import { User } from '../../database/entities/user.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([VirtualAccount, WalletRechargeSession, WalletTransaction, User]),
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}

