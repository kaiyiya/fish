# AI卖鱼小程序 - 毕业设计项目

基于 Taro + NestJS 的智能卖鱼小程序，结合AI图像识别和智能推荐系统。

## 项目结构

```
fish_app/
├── backend/          # NestJS后端服务
├── frontend/         # Taro前端小程序
└── README.md
```

## 技术栈

### 后端
- NestJS 10.x
- TypeScript
- TypeORM
- MySQL
- Redis (可选)
- JWT 认证

### 前端
- Taro 3.x
- React 18
- TypeScript
- Zustand (状态管理)
- Axios

## 功能模块

### 核心功能
1. **AI图像识别** - 拍照识别鱼类，获取商品信息
2. **智能推荐** - 基于用户行为的个性化推荐
3. **商品管理** - 商品列表、详情、分类
4. **订单管理** - 下单、订单查询、订单详情
5. **用户系统** - 注册、登录、个人中心
6. **搜索功能** - 关键词搜索、语义搜索
7. **统计分析** - 识别统计、推荐效果、销售分析

## 快速开始

### 方式一：Docker部署（推荐）

详细说明请查看 [Docker部署指南](./README-DOCKER.md)

**快速启动：**
```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑.env文件，修改数据库密码等配置

# 2. 启动服务（Windows PowerShell）
.\scripts\deploy.ps1 prod

# 或使用docker-compose
docker-compose up -d

# 3. 查看服务状态
docker-compose ps
```

**或使用Makefile（Linux/Mac）：**
```bash
make up          # 启动服务
make logs        # 查看日志
make down        # 停止服务
```

### 方式二：本地开发

#### 后端启动

```bash
cd backend

# 安装依赖
npm install

# 配置环境变量（复制.env.example并修改）
cp .env.example .env

# 启动开发服务器
npm run start:dev
```

后端服务默认运行在 `http://localhost:3000`

#### 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 启动微信小程序开发
npm run dev:weapp

# 启动H5开发
npm run dev:h5
```

### 方式三：混合开发（推荐开发阶段）

```bash
# 只启动基础服务（MySQL、Redis）
docker-compose -f docker-compose.dev.yml up -d

# 后端在本地运行
cd backend
npm install
npm run start:dev

# 前端在本地运行
cd frontend
npm install
npm run dev:weapp
```

## 数据库设计

项目包含15+张数据表：
- 用户相关表（user, user_preference, user_address）
- 商品相关表（fish_product, category, product_tag, supplier）
- AI识别相关表（image_recognition, recognition_product_link, fish_recognition_data）
- 推荐相关表（recommendation_log, user_behavior）
- 订单相关表（order, order_item）
- 统计相关表（report_config）
- 其他辅助表（cart, favorite, review, search_log, promotion）

## 开发计划

- [x] 项目架构搭建
- [x] 后端基础模块（用户、商品、订单、AI服务）
- [x] 前端基础页面和路由
- [ ] AI图像识别模型训练和集成
- [ ] 推荐算法实现（协同过滤、内容推荐）
- [ ] 完整的前端页面开发
- [ ] 数据库表完善
- [ ] 统计报表功能
- [ ] 测试和优化

## 环境要求

- Node.js >= 16
- MySQL >= 5.7
- Redis (可选)

## 许可证

MIT

## 联系方式

毕业设计项目 - AI卖鱼小程序
