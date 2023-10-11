<template>
  <view class="index">
    <nut-cell-group>
      <nut-cell is-link>
        <template v-slot:title>
          <button open-type="chooseAvatar" @chooseAvatar="onChooseAvatar" size="mini" class="btn-avatar">
            <img class="avatar" :src="commonStore?.userInfo?.avatar" />
          </button>
        </template>
      </nut-cell>
      <nut-cell is-link title="会员昵称" :desc="commonStore?.userInfo?.nickName" @click="inputType = 1">
      </nut-cell>
      <nut-cell title="会员生日" is-link @click="!commonStore?.userInfo?.birthday ? showPop = 1 : showPop = 0" :desc="commonStore?.userInfo?.birthday ? onConverTime(commonStore?.userInfo?.birthday?.seconds) : '请设置生日'"></nut-cell>
      <nut-cell title="会员手机" is-link :desc="commonStore?.userInfo?.phone ?? '绑定手机号码'" @click="inputType = 3"></nut-cell>
      <nut-cell title="会员职业" is-link :desc="commonStore?.userInfo?.job" @click="inputType = 2">
      </nut-cell>
      <nut-cell title="会员性别" is-link :desc="mapGender[commonStore?.userInfo?.gender ?? 0]" @click="showPop = 2"></nut-cell>
      <nut-cell title="账户名" is-link :desc="commonStore?.userInfo?.username ?? '绑定用户名'"  @click="!commonStore?.userInfo?.username ? inputType = 4 : inputType =0"></nut-cell>
      <nut-cell title="邮箱地址" is-link :desc="commonStore?.userInfo?.email ?? '--'"  @click="inputType = 5"></nut-cell>
      <nut-cell title="设置密码" is-link   @click="inputType = 6"></nut-cell>
    </nut-cell-group>
    <view class="logout">
      <nut-button type="info"  @click="showLogout = true" class="setting">退出登录</nut-button>
    </view>
    <nut-popup position="bottom" :visible="showPop > 0">
      <nut-date-picker :modelValue="onConverDate(commonStore?.userInfo?.birthday?.seconds)" :min-date="new Date(1970, 0, 0)" :max-date="new Date(2050, 0, 0)"
        @confirm="onModifyBirthday" @cancel="showPop = 0" :is-show-chinese="true" v-if="showPop == 1">
      </nut-date-picker>
      <nut-picker v-if="showPop == 2" :modelValue="[commonStore?.userInfo?.gender ?? 0]" :columns="columns" title="请选择性别" @confirm="onModifyGender" @cancel="showPop = 0">
      </nut-picker>
    </nut-popup>
    <nut-dialog  title="系统提示" content="是否退出登录" :visible="showLogout" @cancel="showLogout = false" @ok="onLogout" />
    <nut-dialog :title="mapTitle[inputType]"  :visible="inputType > 0" @cancel="inputType = 0" @ok="onSubmit" >
      <input type="nickname" class="nickname" placeholder="请输入昵称" v-if="inputType==1" v-model="nickName" confirm-type="done" />
      <input type="text" class="nickname" placeholder="请输入职业" v-else-if="inputType==2" v-model="job"  confirm-type="done" />
      <view class="phone-body" v-else-if="inputType==3">
        <nut-input v-model="phone" placeholder="输入手机号码"  class="phone" type="tel">
          <template #right> <nut-button type="primary" size="small" @click="onSendCaptcha">{{sendText}}</nut-button> </template>
        </nut-input>
        <nut-input v-model="phoneCode" placeholder="输入手机验证码"  class="phone">
        </nut-input>
      </view>
      <input type="text" class="nickname" placeholder="请输入账户名" v-else-if="inputType==4" v-model="username"  confirm-type="done" />
      <view class="phone-body" v-else-if="inputType==5">
        <nut-input v-model="email" placeholder="输入邮箱地址"  class="phone" >
          <template #right> <nut-button type="primary" size="small"  @click="onSendCaptcha">{{sendText}}</nut-button> </template>
        </nut-input>
        <nut-input v-model="emailCode" placeholder="输入邮箱验证码"  class="phone">
        </nut-input>
      </view>
      <input type="password" class="nickname" placeholder="请输入新密码" v-else-if="inputType==6" v-model="password"  confirm-type="done" />
    </nut-dialog>
  </view>
</template>
<script>
import './index.scss';
import Taro, { showToast,useDidShow } from '@tarojs/taro';
import { useCommonStore } from '../../stores/common';
import { reactive, toRefs } from "vue";
import http from '../../utils/http';
import { FormData } from '../../utils/file/formData';
import dayjs from 'dayjs';
import {mobile,email, empty} from '../../utils/validate';
import { localStorageSet, pageToUrl } from '../../utils/utils';
export default {
  setup() {
    const commonStore = useCommonStore();
    const state = reactive({
      showLogout: false,
      nickName: '',
      job:'',
      phone: '',
      phoneCode: '',
      username: '',
      password: '',
      email: '',
      emailCode: '',
      token: '',
      sendText: '发送验证码',
      mapGender: {
        0: '未知',
        1: '男',
        2: '女'
      },
      inputType: 0,
      mapTitle: {
        1: '修改昵称',
        2: '修改职业',
        3: '修改手机号码',
        4: '修改账户名',
        5: '修改邮箱',
        6: '修改密码'
      },
      showPop: 0,
      columns: [{
        text: '请选择',
        value: 0
      }, {
        text: '男',
        value: 1
      }, {
        text: '女',
        value: 2
      }]
    });
    const onGetUsertInfo = () => {
      http.get('/api/user/getUserInfo').then(res => {
        commonStore.setUserInfo(res?.user);
      });
    };
    const onConverTime = (time) => {
      if (time) {
        return dayjs.unix(time).format('YYYY-MM-DD HH:mm');
      } else {
        return '--';
      }
    };
    const onConverDate = (date)=>{
      return dayjs.unix(date).toDate();
    };
    const onChooseAvatar = (e) => {
      const { avatarUrl } = e.detail
      if (avatarUrl) {
        let data = FormData();
        data.append('type', 'img');
        data.appendFile('files', avatarUrl, 'avatar');
        let file = data.getData();
        http.post('/upload/uploadQiNiu', file.buffer, file.contentType)
          .then(ff => {
            http.put('/api/user/modifyUserAvatar', {
              avatar: ff[0]?.url,
              id: commonStore?.userInfo?.id
            }).then(() => {
              onGetUsertInfo();
              showToast({ title: '操作成功' });
            });
          });
      }
    };
    const onModifyNickName = () => {
      if(empty(state?.nickName)){
        showToast({title: '昵称不能为空',icon: 'error'});
        return;
      }
      http.put('/api/user/modifyNickName', {
        nickName: state?.nickName,
        id: commonStore?.userInfo?.id
      }).then(() => {
        showToast({ title: '操作成功' });
        onGetUsertInfo();
      });
    };
    // 修改用户生日,
    const onModifyBirthday = (e) => {
      if (e?.selectedValue.length === 0) {
        showToast({ title: '请选择生日', icon: 'error' });
        return;
      }
      http.put('/api/user/modifyBirthday', {
        birthday:dayjs().unix(e?.selectedValue?.join('-')),
        id: commonStore?.userInfo?.id
      }).then(() => {
        showToast({ title: '操作成功' });
        state.showPop = 0;
        onGetUsertInfo();
      });
    };
    // 修改用户性别,
    const onModifyGender = (e) => {
      if (e?.selectedValue?.length === 0) {
        showToast({ title: '请选择性别', icon: 'error' });
        return;
      }
      http.put('/api/user/modifyGender', {
        gender: e?.selectedValue[0],
        id: commonStore?.userInfo?.id
      }).then(() => {
        showToast({ title: '操作成功' });
        state.showPop = 0;
        onGetUsertInfo();
      });
    };
    // 修改用户职业
    const onModifyJob = () => {
      http.put('/api/user/modifyJob', {
        job: state.job,
        id: commonStore?.userInfo?.id
      }).then(() => {
        showToast({ title: '操作成功' });
        state.inputType = 0;
        onGetUsertInfo();
      });
    };
    const onModifyPhone = () => {
      if(!mobile(state.phone)){
        showToast({ title: '手机号码不正确', icon: 'none' });
        return;
      }
      http.put('/api/user/modifyUserPhone',{
        recipient: state.phone,
        captcha: state.phoneCode,
        token: state.token,
        id: commonStore?.userInfo?.id
      }).then(()=>{
          showToast({ title: '修改成功' });
          state.inputType = 0;
          onGetUsertInfo();
        });
    };
    const onModifyEmail = () => {
      if(!email(state.email)){
        showToast({ title: '手机号码不正确', icon: 'none' });
        return;
      }
      http.put('/api/user/modifyUserEmail',{
        recipient: state.email,
        captcha: state.emailCode,
        token: state.token,
        id: commonStore?.userInfo?.id
      }).then(()=>{
          showToast({ title: '修改成功' });
          state.inputType = 0;
          onGetUsertInfo();
        });
    };
    const onModiftUserName = ()=>{
      if(empty(state?.username)){
        showToast({title: '用户名不能为空',icon: 'error'});
        return;
      }
      http.put('/api/user/modifyUserName', {
        username: state?.username,
        id: commonStore?.userInfo?.id
      }).then(() => {
        state.inputType = 0;
        onGetUsertInfo();
        showToast({ title: '操作成功' });
      });
    };
    const onModiftPassword = ()=>{
      if(empty(state?.password)){
        showToast({title: '密码不能为空',icon: 'error'});
        return;
      }
      http.put('/api/user/modifyUserPassword', {
        password: state?.password,
        id: commonStore?.userInfo?.id
      }).then(() => {
        state.inputType = 0;
        onGetUsertInfo();
        showToast({ title: '操作成功' });
      });
    };
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
    const onLogin = () => {
      let data = {
        code: "gust",
        sourceType: 2, //微信小程序登录
      };
      http.post('/api/user/loginWxOrAlipay', data)
        .then(res => {
          localStorageSet('token', res?.accessToken, res?.expiresIn, 'second');
          localStorageSet('tokenType', res?.tokenType, res?.expiresIn, 'second');
          localStorageSet('refreshToken', res?.refreshToken, 5000);
          onGetUsertInfo();
          onGetLocation();
          pageToUrl();
          state.showLogout = false;
        });
    };
    const onLogout = () => {
      http.get('/api/user/logout', JSON.stringify({
        id: commonStore?.userInfo?.id
      })).then(() => {
        Taro.removeStorageSync('navigateUrl');
        Taro.removeStorageSync('token');
        Taro.removeStorageSync('tokenType');
        Taro.removeStorageSync('refreshToken');
        onLogin();
      });
    };
    const onSubmit = () => {
      if (state?.inputType === 1) {
        onModifyNickName();
      } else if (state?.inputType === 2) {
        onModifyJob();
      }else if (state?.inputType === 3){
        onModifyPhone();
      }else if (state?.inputType === 4){
        onModiftUserName();
      }else if (state?.inputType === 5){
        onModifyEmail();
      }else if(state?.inputType === 6){
        onModiftPassword();
      }else{
        showToast({title: '错误类型',icon: 'error'});
        return;
      }
    };
    const onSendCaptcha = ()=>{
      if(state.inputType === 3 && !mobile(state.phone)){
        showToast({title: '手机号码不正确',icon: 'error'});
        return;
      }
      if(state.inputType === 5 && !email(state.email)){
        showToast({title: '邮箱地址不正确',icon: 'error'});
        return;
      }
      let interval = null;
      const mapRecipient = {
        3: state.phone,
        5: state.email
      };
      const mapType = {
        3: 2,
        5: 0
      };
      http.post('/api/msg/sendCaptcha',{
        recipient: mapRecipient[state.inputType],
        isVerifyCaptcha: false,
        type: mapType[state.inputType]
      }).then((res)=>{
        let time = res.sendInterval;
        interval = setInterval(() => {
          --time;
          if (time == 0) {
            clearInterval(interval);
            state.sendText = '发送验证码'
          } else {
            state.sendText = time + 's(秒)';
          }
        }, 1000);
        state.token = res?.token;
        showToast({title: '发送成功'});
      });
    };
    useDidShow(()=>{
      state.nickName = commonStore?.userInfo?.nickName ?? '';
      state.job =  commonStore?.userInfo?.job ?? '';
      state.phone = commonStore?.userInfo?.phone ?? '';
      state.username = commonStore?.userInfo?.username ?? '';
      state.email = commonStore?.userInfo?.email ?? ''
    });
    return { pageToUrl, onChooseAvatar,onConverDate, onConverTime, onLogout, onSendCaptcha,onModifyBirthday, onModifyGender, onSubmit, commonStore, ...toRefs(state) };
  }
}
</script>