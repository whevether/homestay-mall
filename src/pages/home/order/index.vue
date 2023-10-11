<template>
  <view class="index">
    
    <view class="room-category  nut-input nut-input--border">
      <view class="left">
        <img :src="orderDetails?.pic[0]" class="room-img"/>
      </view>
      <view class="right">
        <view class="text">{{ orderDetails?.roomCategoryName }}</view>
        <view class="text"  @click="showCalendar = true">{{`${onConverDate(orderData?.checkInDate, 'YYYY-MM-DD dddd')}到${onConverDate(orderData?.checkOutDate,'YYYY - MM - DD dddd')} 共 ${ getNumberOfDays(onConverDate(orderData?.checkInDate), onConverDate(orderData?.checkOutDate))}天` }}
        </view>
        <nut-input-number v-model="orderData.roomNumber" @change="onNumberChange" />
      </view>
    </view>
    <nut-input v-model="orderData.memberName" placeholder="请输入联系人姓名" />
    <nut-input v-model="orderData.memberTelPhone" placeholder="请输入手机号" type="tel" max-length="11" />
    <nut-input v-model="orderData.identity" placeholder="请输入身份证号码" disabled @click="showIdentity = true"/>
    <nut-textarea v-model="orderData.desc" placeholder="请输入备注" limit-show max-length="500" autosize/>
    <nut-cell-group>
      <nut-cell title="优惠券" :desc="`${coupons?.length}张可用`" is-link @click="showCoupon = !showCoupon">
      </nut-cell>
      <nut-cell title="会员积分" desc="100积分可抵1元" v-if="commonStore?.userInfo?.integration > 0">
        <nut-switch v-model="isUseIntegration" />
      </nut-cell>
    </nut-cell-group>
    <nut-cell-group>
      <nut-cell title="民宿合计" :desc="orderDetails?.totalAmount" is-link></nut-cell>
      <nut-cell title="优惠券抵扣" :desc="`-${orderDetails?.couponAmount}元`" is-link></nut-cell>
      <nut-cell title="积分抵扣" :desc="`-${orderDetails?.integrationAmount}元`" is-link></nut-cell>
      <nut-cell title="活动优惠" :desc="`-${orderDetails?.promotionAmount}元`" is-link></nut-cell>
    </nut-cell-group>
    <nut-popup class="coupon-list" position="bottom" :style="{ height: '60%' }" :visible="showCoupon" round
      :safe-area-inset-bottom="true" @click-overlay="showCoupon = false">
      <nut-tabs v-model="couponTab">
        <nut-tab-pane :title="`可用(${coupons?.length})`">
          <view class="coupon-item" v-for="(item, key) in coupons" :key="key" v-if="coupons.length > 0"
            @click="onChosenCoupon(key)">
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
                <view class="time">{{ `${onConverDate(item?.startAt, 'YYYY-MM-DD HH: mm')}-${onConverDate(item?.endAt,'YYYY - MM - DD HH: mm')}` }}</view>
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
                <view class="time">{{ `${onConverDate(item?.startAt, 'YYYY-MM-DD HH: mm')}-${onConverDate(item?.endAt,'YYYY - MM - DD HH: mm')}` }}</view>
              </view>
            </view>
            <view class="coupon-footer">
              {{ item?.reason }}
            </view>
          </view>
          <nut-empty image="empty" description="没有优惠券" v-else></nut-empty>
        </nut-tab-pane>
      </nut-tabs>
      <view @click="onCancelCoupon" class="cancel-coupon">
        <nut-button type="info" size="large">不使用优惠券</nut-button>
      </view>
    </nut-popup>
    <nut-calendar v-model:visible="showCalendar" start-text="入住" end-text="退房"
      :default-value="[onConverDate(orderData?.checkInDate, 'YYYY-MM-DD'), onConverDate(orderData?.checkOutDate, 'YYYY-MM-DD')]"
      type="range" :start-date="onConverDate(orderData?.checkInDate, 'YYYY-MM-DD')" @close="showCalendar = false"
      @choose="onsChooseDate">
    </nut-calendar>
    <nut-number-keyboard v-model="orderData.identity" maxlength="18" :visible="showIdentity" custom-key="X"
      @close="showIdentity = false" title="身份证键盘" type="rightColumn" confirm-text="确定" :overlay="true">
    </nut-number-keyboard>
    <view class="footer">
      <view class="submit">
        <text>合计:</text>
        <nut-price :price="orderDetails?.paymentAmount" size="large" :need-symbol="false" />
        <nut-button type="info" size="large" @click="onSubmitOrder">提交订单</nut-button>
      </view>
    </view>
  </view>
</template>
<script>
import { pageToUrl } from '../../../utils/utils';
import Taro, { useDidShow, showToast } from '@tarojs/taro';
import { useCommonStore } from '../../../stores/common';
import http from '../../../utils/http';
import { reactive, toRefs } from 'vue';
import {idCard,mobile} from '../../../utils/validate';
import dayjs from 'dayjs';
import './index.scss';
export default {
  setup() {
    const commonStore = useCommonStore();
    const state = reactive({
      orderDetails: null,
      showCoupon: false,
      showCalendar: false,
      showIdentity: false,
      coupons: [],
      couponTab: '0',
      disabledCoupons: [],
      orderData: {
        shopId: '',
        payType: 0,
        payShape: 1,
        roomId: '',
        memberName: '',
        homeStayId: '',
        roomNumber: 1,
        sourceType: 3, // 订单来源
        integration: 0, //积分
        couponId: '0', //优惠券id
        memberTelPhone: '',// 联系人电话
        checkInDate: Taro.getCurrentInstance()?.router?.params.checkInDate,//入住时间
        checkOutDate: Taro.getCurrentInstance()?.router?.params.checkOutDate,// 离开时间
        shopName: '',
        desc: '', //订单备注
        orderType: 0,
        identity: '',
        roomCategoryId: '',//房间类型id
        isAdd: false// 是否添加订单
      },
      routerParams: Taro.getCurrentInstance()?.router?.params
    });
    const onConverDate = (val, format) => {
      if (format) {
        return dayjs.unix(val).format(format);
      } else {
        return dayjs.unix(val);
      }
    };
    //计算订单
    const calcRoomOrder = (data) => {
      http.post('/api/homeStay/calcRoomOrder ', data)
        .then(res => {
          state.orderDetails = res;
        });
    };
    const onsChooseDate = param => {
      // state.date = [...[param[0][3], param[1][3]]];
      let checkInTime = dayjs(param[0][3]);
      let checkOutTime = dayjs(param[1][3]);
      state.orderData.checkInDate = checkInTime.unix();
      state.orderData.checkOutDate = checkOutTime.unix();
      calcRoomOrder(state.orderData);
    };
    const handleGetUserCardList = (categoryId, productOrRoomId) => {
      http.get('/api/user/getUserCardBagList', { categoryId: categoryId, productOrRoomId: productOrRoomId, platform: 3 })
        .then(res => {
          state.coupons = res?.cardBagData;
          state.disabledCoupons = res?.disabledCardBagData;
        });
    };
    const onGetDetails = () => {
      http.get(`/api/homeStay/showRoom?id=${state?.routerParams?.id}`).then(res => {
        let data = Object.assign(state.orderData, { shopId: res?.shopId, roomId: res?.id, homeStayId: res?.homeStayId, shopName: res?.shopName, roomCategoryId: res?.roomCategoryId });
        state.orderData = data;
        calcRoomOrder(data);
        handleGetUserCardList(res?.roomCategoryId, res?.id);
      });
    };
    const getNumberOfDays = (date1, date2) => {//获得天数
      //date1：开始日期，date2结束日期
      let a1 = Date.parse(new Date(date1));
      let a2 = Date.parse(new Date(date2));
      let day = parseInt((a2 - a1) / (1000 * 60 * 60 * 24));//核心：时间戳相减，然后除以天数
      return day;
    };
    const onNumberChange = (value) => {
      state.orderData.roomNumber = value;
      calcRoomOrder(state.orderData);
    };
    const onSubmitOrder = () => {
      if (!state.orderData.memberName) {
        showToast({ title: '请输入入住人姓名',icon: 'none' });
        return;
      }
      if (!mobile(state.orderData.memberTelPhone)) {;
        showToast({ title: '请输入正确入住人手机',icon: 'none' });
        return;
      }
      if (!idCard(state.orderData.identity)) {
        showToast({ title: '请输入正确入住人身份证号码',icon: 'none' });
        return;
      }
      let data = Object.assign(state.orderData,{ "openId": commonStore?.userInfo?.wxSmallOpenid,"isAdd": true});
      http.post('/api/homeStay/addRoomOrder',data)
        .then(res=>{
          if (res?.contentMap) {
            let contentMap = JSON.parse(res?.contentMap);
            Taro.requestPayment({
                timeStamp: contentMap.timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
                nonceStr: contentMap.nonceStr, // 支付签名随机串，不长于 32 位
                package: contentMap.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
                signType: contentMap.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
                paySign: contentMap.paySign, // 支付签名
                success: () => {
                  pageToUrl(`/pages/home/orderDetails/index?orderNo=${res?.outTradeNo}`,false,true);
                },
                fail: () => {
                  pageToUrl(`/pages/home/orderDetails/index?orderNo=${res?.outTradeNo}`,false,true);
                }
              });
          }else{
            showToast({ title: '支付失败',icon: 'none' });
          }
        });
    };
    useDidShow(() => {
      onGetDetails();
    });
    return { pageToUrl, getNumberOfDays, onConverDate, onNumberChange, onsChooseDate, onSubmitOrder,commonStore, ...toRefs(state) };
  }
}
</script>