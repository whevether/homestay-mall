<template>
  <view class="index">
    <img src="http://upapk.oss-cn-beijing.aliyuncs.com/img/e4858cf48a8c9c7757b27474542206b9.png" />
    <nut-button type="info" @click="wxLogin">重新登陆</nut-button>
    <!-- 废弃， 因为获取手机号码后面开始收费了。使用微信 unioid -->
    <!-- <button class="nut-button--info" open-type="getPhoneNumber" @getPhoneNumber="onGetPhoneNumber"
      size="mini">微信一键登录</button>
    <nut-dialog title="完善用户信息" v-model:visible="showOpen" :no-ok-btn="true" :no-cancel-btn="true">
      <button open-type="chooseAvatar" @chooseAvatar="onChooseAvatar" size="mini" class="btn-avatar">
        <img class="avatar" :src="avatarUrl" />
      </button>
      <input type="nickname" class="nickname" placeholder="请输入昵称" v-model="nickName" id="nickname-input" />
      <Button class="nut-button--info" size="mini" @click="onGetUserInfo">确定</Button>
    </nut-dialog> -->
  </view>
</template>

<script>
import "./index.scss";
import Taro, { useDidShow, showToast } from "@tarojs/taro";
import { reactive, toRefs } from "vue";
import http from '../../utils/http';
import { localStorageSet, localStorageGet, pageToUrl } from '../../utils/utils';
// import { FormData } from '../../utils/file/formData';
// import { Button } from '@tarojs/components';
import { useCommonStore } from '../../stores/common';
export default {
  name: "Login",
  setup() {
    const commonStore = useCommonStore();
    const state = reactive({
      code: ''
      // url: '',
      // phone: '',
      // nickName: '',
      // avatarUrl: 'https://minioapi.zytravel.shop/avatar/333128767074963456avatarGroup1052.png',
      // showOpen: false
    });
    const onGetLocation = () => {
      Taro.getLocation({
        type: 'wgs84',
        success: (res) => {
          http.get(`/api/user/getLocation?lat=${res?.latitude}&lng=${res.longitude}`)
            .then(lo => {
              commonStore.setAddress({ 'addressCode': lo?.regeocode?.addressComponent?.adcode, 'province': lo?.regeocode?.addressComponent?.province, 'city': lo?.regeocode?.addressComponent?.city, 'district': lo?.regeocode?.addressComponent?.district });
            });
        }
      });
    };
    // const onChooseAvatar = (e) => {
    //   const { avatarUrl } = e.detail
    //   if (avatarUrl) {
    //     let data = FormData();
    //     data.append('type', 'img');
    //     data.appendFile('files', avatarUrl, 'nameavatar');
    //     let file = data.getData();
    //     http.post('/upload/uploadQiNiu', file.buffer, file.contentType)
    //       .then(ff => {
    //         state.avatarUrl = ff[0]?.url;
    //       });
    //   }
    // };
    const onGetUserInfo = () => {
      http.get('/api/user/getUserInfo').then(info => {
        commonStore.setUserInfo(info?.user);
      });
    };
    const loginWxOrAlipay = (data) => {
      http.post('/api/user/loginWxOrAlipay', data)
        .then(res => {
          localStorageSet('token', res?.accessToken, res?.expiresIn, 'second');
          localStorageSet('tokenType', res?.tokenType, res?.expiresIn, 'second');
          localStorageSet('refreshToken', res?.refreshToken, 5000);
          onGetUserInfo();
          onGetLocation();
          pageToUrl();
        });
    };
    const wxLogin = () => {
      Taro.login({
        success: (res) => {
          state.code = res.code;
          let data = {
            code: res.code,
            sourceType: 2 //微信小程序登录
          };
          loginWxOrAlipay(data);
        },
        fail: () => {
          showToast({ title: "获取code失败", fail: "error" });
        },
      });
    };
    // const onGetUserInfo = () => {
    //   Taro.createSelectorQuery()
    //     .select("#nickname-input")
    //     .fields({
    //       properties: ["value"],
    //     }).exec((item) => {
    //       const nickname = item[0].value;
    //       if (!state?.avatarUrl || !nickname) {
    //         showToast({ title: '头像或昵称不能为空', icon: 'none' });
    //         return;
    //       }
    //       let data = {
    //         phoneNumber: state.phone,
    //         code: state.code,
    //         sourceType: 2, //微信小程序登录
    //         extendDic: {
    //           avatarUrl: state?.avatarUrl,
    //           nickName: nickname
    //         }
    //       };
    //       loginWxOrAlipay(data);
    //     });
    // };
    // const onGetPhoneNumber = (e) => {
    //   http.get(`/api/user/getPhoneNumber?phoneCode=${e?.detail?.code}`)
    //     .then(res => {
    //       if (!state.url && res?.accessToken) {
    //         localStorageSet('token', res?.accessToken, res?.expiresIn, 'second');
    //         localStorageSet('tokenType', res?.tokenType, res?.expiresIn, 'second');
    //         localStorageSet('refreshToken', res?.refreshToken, 5000);
    //         http.get('/api/user/getUserInfo').then(data => {
    //           commonStore.setUserInfo(data?.user);
    //         });
    //         onGetLocation();
    //         let navigateUrl = localStorageGet('navigateUrl');
    //         const mapSwitchTabPage = ['/pages/index/index', '/pages/hot/index', '/pages/video/index', '/pages/my/index'];
    //         if (navigateUrl) {
    //           if (mapSwitchTabPage.includes(navigateUrl)) {
    //             Taro.switchTab({ url: navigateUrl });
    //           } else {
    //             Taro.navigateTo({ url: navigateUrl });
    //           }

    //         } else {
    //           Taro.switchTab({ url: '/pages/index/index' });
    //         }
    //       } else if (state.url) {
    //         let url = state?.url?.includes('?') ? `${state.url}&phone=${res?.phone}` : `${state.url}?phone=${res?.phone}`;
    //         // 如果是h5就获取手机号码之后跳回h5页面
    //         Taro.navigateTo({ url: `/pages/h5webview/index?redirectUrl=${encodeURIComponent(url)}` });
    //       } else {
    //         state.phone = res?.phone;
    //         state.showOpen = !state.showOpen;
    //       }
    //     });
    // };
    // useLoad((option) => {
    //   state.url = option?.url ? decodeURIComponent(option?.url) : '';
    // });
    useDidShow(() => {
      let openId = localStorageGet("openId");
      let token = localStorageGet('token');
      if (token) {
        Taro.navigateBack({ delta: -1 });
      } else {
        if (!openId) {
          wxLogin();
        }
      }
    });
    return {
      wxLogin,
      ...toRefs(state),
    };
  },
};
</script>
