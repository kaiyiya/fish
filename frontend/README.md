# 卖鱼小程序前端

基于 Taro + React + TypeScript 开发

## 技术栈

- Taro 3.x
- React 18
- TypeScript
- Zustand (状态管理)
- Axios (HTTP请求)

## 项目结构

```
src/
├── app.config.ts           # 小程序全局配置
├── app.tsx                 # 小程序入口文件
├── index.html              # H5入口HTML
├── pages/                  # 页面目录
│   ├── index/              # 首页
│   ├── recognize/          # 图像识别页面
│   ├── product/            # 商品列表/详情
│   ├── order/              # 订单相关
│   ├── search/             # 搜索页面
│   └── profile/            # 个人中心
├── components/             # 组件目录
├── utils/                  # 工具函数
│   ├── request.ts          # HTTP请求封装
│   └── storage.ts          # 本地存储
├── services/               # API服务
├── store/                  # 状态管理
└── styles/                 # 全局样式
```

## 安装依赖

```bash
npm install
# 或
yarn install
```

## 开发

```bash
# 微信小程序
npm run dev:weapp

# H5
npm run dev:h5
```

## 构建

```bash
# 微信小程序
npm run build:weapp

# H5
npm run build:h5
```
