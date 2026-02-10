export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/recognize/index',
    'pages/product/list/index',
    'pages/product/detail/index',
    'pages/search/index',
    'pages/order/list/index',
    'pages/order/detail/index',
    'pages/profile/index',
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
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
      },
      {
        pagePath: 'pages/recognize/index',
        text: '识别',
      },
      {
        pagePath: 'pages/search/index',
        text: '搜索',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
      },
    ],
  },
})

function defineAppConfig(config: any) {
  return config
}
