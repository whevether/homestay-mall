import Taro, { showToast, hideLoading } from "@tarojs/taro"
import { pageToUrl } from "./utils"
import { HTTP_STATUS } from './config'
import http from './http';
import { localStorageSet } from "./utils";
const customInterceptor = (chain) => {
  const requestParams = chain.requestParams;
  return chain.proceed(requestParams).then(res => {
    hideLoading();
    // 只要请求成功，不管返回什么状态码，都走这个回调
    if (res.statusCode === HTTP_STATUS.NOT_FOUND) {
      showToast({
        title: '请求资源不存在',
        icon: 'none',
        duration: 1000
      });
      return Promise.reject("请求资源不存在")

    } else if (res.statusCode === HTTP_STATUS.BAD_GATEWAY) {
      showToast({
        title: '网络连接失败',
        icon: 'none',
        duration: 1000
      });
      return Promise.reject("网络连接失败")

    } else if (res.statusCode === HTTP_STATUS.NET_301 || res.statusCode === HTTP_STATUS.NET_302) {
      showToast({
        title: res?.data?.msg,
        icon: 'none',
        duration: 1000
      });
      Taro.removeStorageSync("pubkey");
      http.get('/api/user/getPubKey')
        .then(res => {
          localStorageSet('pubkey', res, res?.timestamp - 180);
          pageToUrl();
        });
      return Promise.reject(res?.data?.msg)

    } else if (res.statusCode === HTTP_STATUS.SERVER_ERROR) {
      showToast({
        title: '服务端出现了问题',
        icon: 'none',
        duration: 1000
      });
      return Promise.reject("服务端出现了问题")

    } else if (res.statusCode === HTTP_STATUS.FORBIDDEN || res.statusCode === HTTP_STATUS.AUTHENTICATE) {

      if (res?.header?.blacklist === 'error' || res.statusCode === HTTP_STATUS.FORBIDDEN) {
        Taro.removeStorageSync("token");
        Taro.removeStorageSync("expired");
        Taro.removeStorageSync("tokenType");
        Taro.removeStorageSync("refreshToken");
        showToast({
          title: '授权无效',
          icon: 'none',
          duration: 1000
        });
        http.get('/api/user/getPubKey')
        .then(res => {
          localStorageSet('pubkey', res, res?.timestamp - 180);
          pageToUrl('/pages/login/index');
        });
        return Promise.reject("授权无效");
      } else {
        Taro.removeStorageSync("token");
        Taro.removeStorageSync("expired");
        Taro.removeStorageSync("tokenType");
        Taro.removeStorageSync("refreshToken");
        showToast({
          title: '授权过期',
          icon: 'none',
          duration: 1000
        });
        http.get('/api/user/getPubKey')
        .then(res => {
          localStorageSet('pubkey', res, res?.timestamp - 180);
          pageToUrl('/pages/login/index');
        });
        return Promise.reject("没有权限访问");
      }
      // let refreshToken = localStorageGet('refreshToken');
      // if (refreshToken ) {
      //   http.get('/api/user/getPubKey')
      //     .then(data => {
      //       localStorageSet('pubkey', data, data?.timestamp-180);
      //       http.post('/api/user/refreshToken', { 'refreshToken': refreshToken })
      //         .then(res => {
      //           localStorageSet('token', res?.accessToken, res?.expiresIn, 'second');
      //           localStorageSet('tokenType', res?.tokenType, res?.expiresIn, 'second');
      //           localStorageSet('refreshToken', res?.refreshToken, 5000);
      //           pageToUrl();
      //         });
      //     });

    // } else {
    //   pageToUrl('/pages/login/index');
    // }
    // TODO 根据自身业务修改
    // return Promise.reject("没有权限访问");

  } else if (res.statusCode === HTTP_STATUS.SUCCESS) {
    if (res?.data?.code === 200 || res?.data?.status === 200) {
      if (res?.data?.page >= 0) {
        return Promise.resolve(res?.data);
      } else {
        return Promise.resolve(res?.data?.data);
      }
    } else {
      if(res?.data?.code != 404){
        showToast({
          title: res?.data?.msg,
          icon: 'none',
          duration: 1000
        });
      }
      //如果没有用户信息就跳转到授权注册
      if (res.data.code === 3000) {
        pageToUrl('/pages/login/index');
      }
      //token失败
      if (res.data.code === 50) {
        // Taro.removeStorageSync("token");
        Taro.removeStorageSync("expired");
        Taro.removeStorageSync("tokenType");
        Taro.removeStorageSync("refreshToken");
        pageToUrl('/pages/login/index');
      }
      return Promise.reject(res?.data)
    }

  } else {
    showToast({
      title: '未知错误',
      icon: 'none',
      duration: 1000
    });
    return Promise.reject(res?.data);
  }
});
}

// Taro 提供了两个内置拦截器
// logInterceptor - 用于打印请求的相关信息
// timeoutInterceptor - 在请求超时时抛出错误。
const interceptors = [customInterceptor, Taro.interceptors.logInterceptor]

export default interceptors