
import Taro from "@tarojs/taro";
import dayjs from 'dayjs';
//删除数组
export const arrDelete = (arr, func) => {
  arr.forEach((item, i) => {
    if (func(item)) {
      arr.splice(i, 1)
    }
  })
}
export const localStorageSet = (name, data, date = 30, unit = "minute") => {
  const expire = dayjs().add(date, unit).unix();
  const obj = { data, expire };
  Taro.setStorageSync(name, JSON.stringify(obj));
}
export const localStorageGet = (name) => {
  const storage = Taro.getStorageSync(name);
  const time = dayjs().unix();
  let result = null;
  if (storage) {
    const obj = JSON.parse(storage);
    if (time < obj.expire) {
      result = obj.data;
    } else {
      // console.log(name,obj.expire,time);
      Taro.removeStorageSync(name);

    }
  }
  return result;
}
/**
 * @description 获取当前页url
 */
export const getCurrentPageUrl = () => {
  let pages = Taro.getCurrentPages();
  let currentPage = pages[pages.length - 1];
  let url = currentPage.route;
  return url;
}
//跳转到登录页面
//跳转到登录页面
export const pageToUrl = (name,isTab = false,isRedirect=false) => {
  let path = getCurrentPageUrl();
  if(path){
    localStorageSet('navigateUrl',`/${path}`);
  }
  if(name){
    let exUrl = ['/pages/index/index',
    '/pages/hot/index',
    '/pages/video/index',
    '/pages/my/index', '/pages/login/index'];
    if(!exUrl.find(f=>name.search(f) !== -1) && !localStorageGet('token')){
      showModal({
        title: '系统提示',
        content: '此功能需要登录之后才能使用',
        confirmText: '立即登录',
        cancelText: '取消',
        success: (res)=>{
          if(res.confirm){
            pageToUrl('/pages/login/index');
          }
        }
      });
      return;
    }
    if(isTab){
      Taro.switchTab({
        url: name
      });
    }else if(isRedirect){
      Taro.redirectTo({
        url: name
      });
    }else{
      Taro.navigateTo({
        url: name
      });
    }
  }else{
    Taro.navigateBack({delta: -1});
  }
};
