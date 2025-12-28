# 卖鱼小程序后端服务

基于 NestJS 的后端 API 服务

## 技术栈

- NestJS 10.x
- TypeScript
- TypeORM
- MySQL
- Redis
- JWT 认证

## 项目结构

```
src/
├── main.ts                 # 应用入口
├── app.module.ts           # 根模块
├── config/                 # 配置文件
├── common/                 # 公共模块
│   ├── decorators/         # 装饰器
│   ├── filters/            # 异常过滤器
│   ├── guards/             # 守卫
│   ├── interceptors/       # 拦截器
│   └── pipes/              # 管道
├── modules/                # 业务模块
│   ├── auth/               # 认证模块
│   ├── user/               # 用户模块
│   ├── product/            # 商品模块
│   ├── order/              # 订单模块
│   ├── ai/                 # AI服务模块（图像识别、推荐）
│   ├── search/             # 搜索模块
│   └── statistics/         # 统计模块
└── database/               # 数据库相关
    ├── entities/           # 实体类
    └── migrations/         # 迁移文件
```

## 安装依赖

```bash
npm install
```

## 运行

开发模式：
```bash
npm run start:dev
```

生产模式：
```bash
npm run build
npm run start:prod
```

## 环境变量

创建 `.env` 文件，配置以下变量：

```
# 应用配置
PORT=3000
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=fish_app

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT配置
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
```
