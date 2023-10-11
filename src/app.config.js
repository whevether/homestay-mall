export default {
  pages: [
    'pages/index/index',
    'pages/hot/index',
    'pages/video/index',
    'pages/my/index',
    'pages/login/index',
    'pages/h5webview/index',
    'pages/video/details/index',
    'pages/address/index',
    'pages/address/create/index',
    'pages/address/modify/index',
    'pages/order/index',
    'pages/order/cancelOrder/index',
    'pages/shop/details/index',
    'pages/home/details/index',
    'pages/shop/index',
    'pages/home/index',
    'pages/shop/cart/index',
    'pages/shop/cart/list/index',
    'pages/shop/comfirOrder/index',
    'pages/shop/orderDetails/index',
    'pages/shop/product/index',
    'pages/home/orderDetails/index',
    'pages/home/room/index',
    'pages/category/index',
    'pages/category/details/index',
    'pages/touristGuide/index',
    'pages/touristGuide/details/index',
    'pages/touristGuide/orderDetails/index',
    'pages/seckill/index',
    'pages/topic/index',
    'pages/topic/details/index',
    'pages/preferred/index',
    'pages/preferred/details/index',
    'pages/brand/index',
    'pages/brand/details/index',
    'pages/fresh/index',
    'pages/fresh/details/index',
    'pages/recommend/index',
    'pages/recommend/details/index',
    'pages/signin/index',
    'pages/stop/index',
    'pages/user/index',
    'pages/user/card/index',
    'pages/user/growth/index',
    'pages/user/integration/index',
    'pages/user/record/index',
    'pages/setting/index',
    'pages/home/order/index'
  ],
  tabBar: {
    "list": [{
      "pagePath": "pages/index/index",
      "text": "首页",
      "iconPath": "assets/resource/home.png",
      "selectedIconPath": "assets/resource/home_sel.png"
    }, 
    {
      "pagePath": "pages/hot/index",
      "text": "发现",
      "iconPath": "assets/resource/hot.png",
      "selectedIconPath": "assets/resource/hot_sel.png"
    }, {
      "pagePath": "pages/video/index",
      "text": "视频",
      "iconPath": "assets/resource/video.png",
      "selectedIconPath": "assets/resource/video_sel.png"
    }, 
    {
      "pagePath": "pages/my/index",
      "text": "我的",
      "iconPath": "assets/resource/my.png",
      "selectedIconPath": "assets/resource/my_sel.png"
    }
  ],
    'color': '#000',
    'selectedColor': '#56abe4',
    'backgroundColor': '#fff',
    'borderStyle': 'white'
  },
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '中源避暑旅游',
    navigationBarTextStyle: 'black'
  },
  "requiredPrivateInfos": [
    "getLocation",
    "onLocationChange",
    "startLocationUpdateBackground",
    "chooseAddress"
  ],
  "permission":{
    "scope.userLocation":{
      "desc": "通过地理位置获取对应程序信息"
    }
  }
}
