import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Taro from '@tarojs/taro';
import './app.scss';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';
import http from './utils/http';
import { localStorageGet, localStorageSet, pageToUrl } from './utils/utils';
import { useCommonStore } from './stores/common';
// import { useCounterStore } from './stores/counter'
const App = createApp({
  onShow(options) {
    if (options?.path !== 'pages/h5webview/index') {
      this.onAppUpdate();
      this.onGetPubKey();
    }
  },
  methods: {
    onAppUpdate() {
      const updateManager = Taro.getUpdateManager()
      updateManager.onCheckForUpdate((res) =>{
        // 请求完新版本信息的回调
        if (res?.hasUpdate) {
          updateManager.onUpdateReady(() => {
            Taro.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              success:  (data) => {
                if (data?.confirm) {
                  // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate();
                }
              }
            });
          });
          updateManager.onUpdateFailed( () => {
            // 新的版本下载失败
            Taro.showToast({title: '更新版本失败'});
          });
        }
      });
    },
    onGetPubKey() {
      http.get('/api/user/getPubKey')
        .then(res => {
          localStorageSet('pubkey', res, res?.timestamp - 180);
          this.onLogin();
          this.onGetLocation();
        });
    },
    onGetLocation() {
      const commonStore = useCommonStore();
      Taro.getLocation({
        type: 'wgs84',
        success: (res) => {
          http.get(`/api/user/getLocation?lat=${res?.latitude}&lng=${res.longitude}`)
            .then(lo => {
              commonStore.setAddress({ 'addressCode': lo?.regeocode?.addressComponent?.adcode, 'province': lo?.regeocode?.addressComponent?.province, 'city': lo?.regeocode?.addressComponent?.city, 'district': lo?.regeocode?.addressComponent?.district });
            });
        }
      });
    },
    onGetUerInfo() {
      const commonStore = useCommonStore();
      http.get('/api/user/getUserInfo').then(res => {
        commonStore.setUserInfo(res?.user);
      });
    },
    onLogin() {
      let token = localStorageGet('token');
      let refreshToken = localStorageGet('refreshToken');
      if (token) {
        this.onGetUerInfo();
      } else if (!token && !refreshToken) {
        let data = {
          code: "gust",
          sourceType: 2, //微信小程序登录
        };
        http.post('/api/user/loginWxOrAlipay', data)
          .then(res => {
            localStorageSet('token', res?.accessToken, res?.expiresIn, 'second');
            localStorageSet('tokenType', res?.tokenType, res?.expiresIn, 'second');
            localStorageSet('refreshToken', res?.refreshToken, 5000);
            this.onGetUerInfo();
          });
      } else if (!refreshToken) {
        pageToUrl(`/pages/login/index`);
      } else {
        pageToUrl(`/pages/login/index`);
      }
    }
  }
  // 入口组件不需要实现 render 方法，即使实现了也会被 taro 所覆盖
})
dayjs.locale('zh-cn');
dayjs.extend(relativeTime);
App.use(createPinia());
export default App;
