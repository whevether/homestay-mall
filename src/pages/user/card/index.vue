<template>
  <view class="coupon-list">
    <nut-tabs v-model="couponTab" coupon-list>
        <nut-tab-pane :title="`可用(${coupons?.length})`">
          <view class="coupon-item" v-for="(item, key) in coupons" :key="key" v-if="coupons.length > 0">
            <view class="info">
              <view class="left">
                <view class="price-info">
                  <nut-price :price="item?.valueDesc" size="large" :need-symbol="false" />
                  <text class="price-unit">{{ item?.unitDesc }}</text>
                </view>
                <view class="price-desc">
                  {{ item?.condition }}
                </view>
              </view>
              <view class="right">
                <view class="header">
                  <view class="title">{{ item?.name }}</view>
                  <Checked v-if="item?.id === orderData?.couponId" color="rgb(73 101 242)" />
                </view>
                <view class="time">{{ `${onConverTime(item?.startAt)}-${onConverTime(item?.endAt)}` }}</view>
              </view>
            </view>
            <view class="coupon-footer">
              {{ item?.reason }}
            </view>
          </view>
          <nut-empty image="empty" description="没有优惠券" v-else></nut-empty>
        </nut-tab-pane>
        <nut-tab-pane :title="`不可用(${disabledCoupons?.length})`">
          <view class="coupon-item" v-for="(item, key) in disabledCoupons" :key="key" v-if="disabledCoupons.length > 0">
            <view class="info">
              <view class="left">
                <view class="price-info">
                  <nut-price :price="item?.valueDesc" size="large" :need-symbol="false" />
                  <text class="price-unit">{{ item?.unitDesc }}</text>
                </view>
                <view class="price-desc">
                  {{ item?.condition }}
                </view>
              </view>
              <view class="right">
                <view class="title">{{ item?.name }}</view>
                <view class="time">{{ `${onConverTime(item?.startAt)}-${onConverTime(item?.endAt)}` }}</view>
              </view>
            </view>
            <view class="coupon-footer">
              {{ item?.reason }}
            </view>
          </view>
          <nut-empty image="empty" description="没有优惠券" v-else></nut-empty>
        </nut-tab-pane>
      </nut-tabs>
  </view>
</template>
<script>
import dayjs from 'dayjs';
import http from '../../../utils/http';
import { pageToUrl } from '../../../utils/utils';
import './index.scss';
import {useDidShow} from '@tarojs/taro';
import {toRefs,reactive} from 'vue';
export default{
  setup(){
    const state = reactive({
      coupons: [],
      couponTab: '0',
      disabledCoupons: [],
      chosenCoupon: -1,
    });
    const onConverTime = (time) => {
      return dayjs.unix(time).format('YYYY-MM-DD HH:mm');
    };
    const onGetCardList = ()=>{
      http.get(`/api/user/getUserCardBagList?platform=3`)
        .then(res=>{
          state.coupons = res?.cardBagData;
          state.disabledCoupons = res?.disabledCardBagData;
        });
    };
    useDidShow(()=>{
      onGetCardList();
    });
    return {pageToUrl,onConverTime,...toRefs(state)};
  }
}
</script>