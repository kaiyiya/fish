import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => ({
                type: 'mysql',
                host: configService.get('DB_HOST', 'localhost'),
                port: configService.get('DB_PORT', 3306),
                username: configService.get('DB_USERNAME', 'root'),
                password: configService.get('DB_PASSWORD', ''),
                database: configService.get('DB_DATABASE', 'fish_app'),
                entities: [__dirname + '/../**/*.entity{.ts,.js}'],
                // 为了本地和容器环境都能自动建表，这里统一开启 synchronize
                // 项目规模不大，用于毕设演示是安全且方便的
                // 注意：如果遇到外键索引冲突，可以暂时设置为 false，手动管理数据库结构
                synchronize: process.env.DISABLE_SYNC !== 'true',
                // 禁用自动删除schema，避免删除外键索引
                dropSchema: false,
                logging: configService.get('NODE_ENV') === 'development',
                charset: 'utf8mb4',
                timezone: '+08:00',
            }),
            inject: [ConfigService],
        }),
    ],
})
export class DatabaseModule { }
