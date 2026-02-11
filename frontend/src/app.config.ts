export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/recognize/index',
    'pages/product/list/index',
    'pages/product/detail/index',
    'pages/admin/index',
    'pages/admin/product/index',
    'pages/admin/order/index',
    'pages/admin/category/index',
    'pages/search/index',
    'pages/order/list/index',
    'pages/order/detail/index',
    'pages/profile/index',
    'pages/login/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: 'AI卖鱼商城',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    color: '#666',
    selectedColor: '#1890ff',
    backgroundColor: '#fff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'assets/icons/home.png',
        selectedIconPath: 'assets/icons/home-active.png',
      },
      {
        pagePath: 'pages/recognize/index',
        text: '识别',
        iconPath: 'assets/icons/recognize.png',
        selectedIconPath: 'assets/icons/recognize-active.png',
      },
      {
        pagePath: 'pages/search/index',
        text: '搜索',
        iconPath: 'assets/icons/search.png',
        selectedIconPath: 'assets/icons/search-active.png',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
        iconPath: 'assets/icons/profile.png',
        selectedIconPath: 'assets/icons/profile-active.png',
      },
    ],
  },
})

// JS 环境下不需要类型声明，简单返回配置对象即可
function defineAppConfig(config) {
  return config
}
