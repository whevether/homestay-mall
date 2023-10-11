<template>
  <view class="address-wrapper">
    <view class="choose-addrress" @click="onChooseAddress"><IconFont name="locationg3" color="#64b578"></IconFont>选择微信地址</view>
    <nut-form :model-value="formData" ref="ruleForm">
      <nut-form-item label="收货人姓名" prop="name" required :rules="[{ required: true, message: '请填写姓名' }]">
        <nut-input  class="nut-input-text" placeholder="请填写姓名" type="text" v-model="formData.name"/>
      </nut-form-item>
      <nut-form-item label="86+" prop="phone" required
        :rules="[{ required: true, message: '请填写手机号码' }, { validator: asyncValidator, message: '电话格式不正确' }]">
        <nut-input  class="nut-input-text" placeholder="请填写手机号码" type="tel" v-model="formData.phone"/>
      </nut-form-item>
      <nut-form-item label="地址" prop="addressText" required :rules="[{ required: true, message: '请选择地址' }]">
        <nut-input  class="nut-input-text" placeholder="请选择收货人地址" type="text" v-model="formData.addressText"  @click="onShowCascader" readonly />
      </nut-form-item>
      <nut-form-item label="地址编码" prop="addressValue" required :rules="[{ required: true, message: '请选择地址' }]" >
        <nut-input  class="nut-input-text" placeholder="请选择收货人地址编码" type="text" v-model="formData.addressValue" @click="onShowCascader" readonly />
      </nut-form-item>
      <nut-form-item label="详细住址" prop="detailAddress" required :rules="[{ required: true, message: '请填写详细住址' }]">
        <nut-input  class="nut-input-text" placeholder="请填写详细住址" type="text" v-model="formData.detailAddress"/>
      </nut-form-item>
      <nut-form-item label="设为默认地址" prop="defaultAddress">
        <nut-switch v-model="formData.defaultAddress"></nut-switch>
      </nut-form-item>
    </nut-form>
    <nut-cell class="address-footer">
      <nut-button type="info" size="large" @click="submit">提交</nut-button>
    </nut-cell>
    <nut-cascader title="地址选择" v-model:visible="formData.visibleCascader" @change="onChangeAddress"
      :options="formData.options"></nut-cascader>
  </view>
</template>
<script>
import { reactive, ref } from 'vue';
import Taro,{useDidShow,showToast} from '@tarojs/taro';
import './index.scss'
import http from '../../../utils/http';
import {IconFont} from '@nutui/icons-vue-taro';
import { pageToUrl } from '../../../utils/utils';
export default {
  components: {
    IconFont
  },
  setup() {
    const formData = reactive({
      name: '',
      phone: '',
      addressText: '',
      addressValue: '',
      detailAddress: '',
      visibleCascader: false,
      options: [],
      defaultAddress: false
    });
    const ruleForm = ref(null);
    const onGetAddressList = () => {
      http.get('/api/user/getAddressList')
        .then(res => {
          formData.options = res;
        });
    };
    const onShowCascader = ()=>{
      formData.visibleCascader = !formData.visibleCascader;
    };
    // Promise 异步校验
    const asyncValidator = (val) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(/^400(-?)[0-9]{7}$|^1\d{10}$|^0[0-9]{2,3}-[0-9]{7,8}$/.test(val));
        }, 1000);
      });
    };
    const submit = () => {
      ruleForm.value.validate().then(({ valid }) => {
        if (valid) {
          let arrAddress = formData?.addressText.split(',') ?? [];
          let data = {
            defaultStatus: Number(formData?.defaultAddress),
            postCode: formData?.addressValue,
            province: arrAddress[0] ?? '',
            city: arrAddress[1] ?? '',
            region: arrAddress[2] ?? '',
            phoneNumber: formData?.phone,
            name: formData?.name,
            detailAddress: formData?.detailAddress
          }
          http.post('/api/user/addUmsMemberReceiveAddress',data)
            .then(()=>{
              showToast({title: '添加成功'});
              pageToUrl();
            });
        } else {
          showToast({
            title: '请检查内容'
          });
        }
      });
    };
    const onChangeAddress = (e, node) => {
      let address = node[node.length - 1];
      formData.addressText = node.map(m=>m?.text).join(',');
      formData.addressValue = address?.value;
    };
    const onChooseAddress = ()=>{
      Taro.chooseAddress({
        success: (res)=>{
          formData.addressText = `${res?.provinceName}${res?.cityName}${res?.countyName}`;
          formData.detailAddress = res?.detailInfo;
          formData.addressValue = res?.postalCode;
          formData.phone = res?.telNumber;
          formData.name = res?.userName;
        },
        fail: (err)=>{
          showToast({title:'选择地址失败',icon:'fail'});
        }
      });
    };
    useDidShow(()=>{
      onGetAddressList();
    });
    return { formData, ruleForm, asyncValidator,submit,onShowCascader,onChangeAddress,onChooseAddress }
  }
}
</script>