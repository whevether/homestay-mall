<template>
  <view class="address-wrapper">
    <nut-empty description="无数据" v-if="(data.length === 0)"></nut-empty>
    <nut-address-list swipe-edition :data="data" @clickItem="onClickItem" @editIcon="onEdit" @delIcon="onDel"
      @swipeDel="onDel" @add="onAddress" :show-bottom-button="true" :data-options="mapOption">
    </nut-address-list>
  </view>
</template>
<script>
import './index.scss'
import { reactive, toRefs } from 'vue';
import Taro, { useDidShow, useDidHide, showToast } from '@tarojs/taro';
import http from '../../utils/http';
import { useCommonStore } from '../../stores/common';
import { pageToUrl } from '../../utils/utils';
export default {
  setup() {
    const commonStore = useCommonStore();
    const state = reactive({
      pageNo: 1,
      finished: false,
      mapOption: {
        id: "id"
      },
      data: [],
      routerParams: Taro.getCurrentInstance()?.router?.params
    });
    const onEdit = (e, item) => {
      pageToUrl(`/pages/address/modify/index?id=${item.id}`);
    };
    const onClickItem = (e, item) => {
      if (state?.routerParams?.isback) {
        let data = state.data.find(f => f.id == item.id);
        // let data = state.data.find()
        commonStore.setUserAddress({
          name: data?.name,
          address: `${data?.province}${data?.city}${data?.region}${data?.detailAddress}`,
          phoneNumber: data?.phoneNumber,
          province: data?.province,
          city: data?.city,
          region: data?.region,
          detailAddress: data?.detailAddress,
          postCode: data?.postCode
        });
        pageToUrl();
      } else {
        onEdit(e, item);
      }

    };
    const onGetList = () => {
      http.get(`/api/user/getUmsMemberReceiveAddressList?pageNo=${state.pageNo}&pageSize=999`)
        .then(res => {
          let list = state.pageNo == 1 ? res?.data : [...state.data.concat(res?.data)];
          state.data = list.map(item => {
            item.addressDetail = item.detailAddress;
            item.addressName = item.name;
            item.defaultAddress = Boolean(item.defaultStatus);
            item.phone = item.phoneNumber;
            item.fullAddress = `${item.province}${item.city}${item.region}${item.detailAddress}`
            return item;
          });
          if (list.length >= res?.totalCount) {
            state.finished = true;
          } else {
            state.pageNo = ++state.pageNo;
          }
        });
    };
    const onDel = (e, item) => {
      http.post('/api/user/deleteUmsMemberReceiveAddress', {
        id: [item.id]
      }).then(() => {
        showToast({ title: '删除地址成功' });
        onGetList();
      });
    };
    const onAddress = () => {
      pageToUrl('/pages/address/create/index')
    };
    useDidShow(() => {
      onGetList();
    });
    useDidHide(() => {
      state.data = [];
      state.pageNo = 1;
    });
    return { ...toRefs(state), onDel, onEdit, onAddress, onClickItem };
  }
}
</script>