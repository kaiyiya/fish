import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductModule } from './modules/product/product.module';
import { OrderModule } from './modules/order/order.module';
import { AiModule } from './modules/ai/ai.module';
import { SearchModule } from './modules/search/search.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { UploadModule } from './modules/upload/upload.module';
import { CategoryModule } from './modules/category/category.module';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './modules/health/health.controller';

@Module({
    imports: [
        // 配置模块
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        // 数据库模块
        DatabaseModule,
        // 业务模块
        UserModule,
        AuthModule,
        ProductModule,
        OrderModule,
        AiModule,
        SearchModule,
        StatisticsModule,
        UploadModule,
        CategoryModule,
    ],
    controllers: [HealthController],
})
export class AppModule { }
