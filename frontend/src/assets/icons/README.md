# TabBar图标说明

## 需要的图标文件

Taro的tabBar需要以下图标文件（尺寸：81x81像素）：

1. `home.png` / `home-active.png` - 首页图标
2. `recognize.png` / `recognize-active.png` - 识别图标
3. `search.png` / `search-active.png` - 搜索图标
4. `profile.png` / `profile-active.png` - 我的图标

## 创建图标的方法

### 方法1：使用在线工具
1. 访问图标网站（如 iconfont.cn, flaticon.com）
2. 搜索对应的图标
3. 下载81x81尺寸的PNG图标
4. 重命名为对应文件名

### 方法2：使用HTML生成器
1. 打开 `create_simple_icons.html`
2. 在浏览器中打开
3. 点击下载按钮保存图标

### 方法3：使用设计工具
使用Photoshop、Figma等工具创建81x81的图标

## 图标要求

- 尺寸：81x81像素
- 格式：PNG（支持透明背景）
- 颜色：
  - 普通状态：#666666
  - 激活状态：#1890ff

## 临时方案

如果暂时没有图标文件，可以：
1. 使用简单的文字图标
2. 或者暂时移除iconPath配置，只显示文字
