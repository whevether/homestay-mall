<template>
  <view class="index" v-if="details">
    <nut-cell class="address" :sub-title="commonStore?.userAddress?.phoneNumber" is-link
      @click="pageToUrl('/pages/address/index?isback=true')">
      <template v-slot:title>
        <view class="address-inco">
          <view class="nick-name">{{ commonStore?.userAddress?.name }}</view>
          <view class="">{{ commonStore?.userAddress?.address }}</view>
        </view>
      </template>
      <template v-slot:icon>
        <Locationg3 size="16" />
      </template>
    </nut-cell>
    <nut-cell-group title="商品信息" v-if="cartData">
      <nut-cell v-for="(item, key) in cartData?.list" :key="key">
        <template v-slot:title>
          <view class="product-info">
            <view class="title">{{ item.productName }}</view>
            <view class="product-attr" v-if="item?.productAttr">
              <text class="word" v-for="(it, ik) in JSON.parse(item?.productAttr)" :key="ik">{{ `${it?.key} : ${it?.value}`
              }}</text>
            </view>
            <nut-price :price="item?.price" size="normal" :need-symbol="false" />
            <view class="text">品牌: {{ decodeURIComponent(item?.productBrand) }}</view>
            <view class="text">所属商家: {{ decodeURIComponent(item?.shopName) }}</view>
            <view class="time">{{ onConverTime(item?.createTime?.seconds) }}</view>
          </view>
        </template>
        <template v-slot:icon>
          <img class="product-img" :src="item?.productPic" />
        </template>
        <template v-slot:link>
          <view class="product-quantity"><text class="num">X</text>{{ item.quantity }}</view>
        </template>
      </nut-cell>
    </nut-cell-group>
    <nut-cell-group>
      <nut-cell title="优惠券" :desc="`${coupons?.length}张可用`" is-link @click="showCoupon = !showCoupon">
      </nut-cell>
      <nut-cell title="会员积分" desc="100积分可抵1元" v-if="commonStore?.userInfo?.integration > 0">
        <nut-switch v-model="isUseIntegration" />
      </nut-cell>
      <nut-cell title="备注">
        <nut-textarea v-model="orderData.note" placeholder="请输入备注内容" limit-show max-length="500"
          style="padding-left: 0px;padding-right: 0px;" autosize/>
      </nut-cell>
    </nut-cell-group>
    <nut-cell-group>
      <nut-cell title="商品合计" :desc="`¥${details?.orderPrice ?? 0}元`" is-link>
      </nut-cell>
      <nut-cell title="运费" :desc="`¥${details?.feightPrice ?? 0}元`" is-link>
      </nut-cell>
      <nut-cell title="优惠券抵扣" :desc="`-¥${(coupons[chosenCoupon]?.value ?? 0) / 100}元`" is-link>
      </nut-cell>
      <nut-cell title="积分抵扣" :desc="`-¥${details?.integrationAmount ?? 0}元`" is-link>
      </nut-cell>
      <nut-cell title="活动优惠" :desc="`-¥${details?.promotionAmount ?? 0}元`" is-link>
      </nut-cell>
    </nut-cell-group>
    <nut-cell-group>
      <nut-cell title="发票信息" desc="不开发票" is-link></nut-cell>
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
      <view @click="onCancelCoupon" class="cancel-coupon">
        <nut-button type="info" size="large">不使用优惠券</nut-button>
      </view>
    </nut-popup>
    <view class="footer">
      <view class="submit">
        <text>合计:</text>
        <nut-price :price="details?.orderPrice" size="large" :need-symbol="false" />
        <nut-button type="info" size="large" @click="onSubmitOrder">提交订单</nut-button>
      </view>
    </view>
  </view>
</template>
<script>
import http from '../../../utils/http';
import './index.scss';
import Taro, { useDidShow, showToast } from '@tarojs/taro';
import { useCommonStore } from '../../../stores/common';
import { reactive, toRefs } from 'vue';
import { Locationg3, Checked } from '@nutui/icons-vue-taro';
import dayjs from 'dayjs';
import { pageToUrl } from '../../../utils/utils';
import { empty } from '../../../utils/validate';
export default {
  components: {
    Locationg3,
    Checked
  },
  setup() {
    const commonStore = useCommonStore();
    const state = reactive({
      note: '',
      showCoupon: false,
      coupons: [],
      couponTab: '0',
      disabledCoupons: [],
      cartData: null,
      details: null,
      chosenCoupon: -1,
      isUseIntegration: false,
      orderData: {
        "sourceType": 3,
        "couponId": '0',
        "receiverName": '',
        "receiverPhone": '',
        "receiverPostCode": '',
        "receiverProvince": '',
        "receiverCity": '',
        "receiverRegion": '',
        "receiverDetailAddress": '',
        "note": '',
        "shopId": '',
        "shopName": '',
        "integration": 0,
        "orderType": 0,
        "billType": 0,
        "billHeader": "",
        "billContent": "",
        "billReceiverPhone": "",
        "billReceiverEmail": "",
        "payShape": 1,
        "payType": 0,
        "openId": '',
        "isAdd": false
      },
      routerParams: Taro.getCurrentInstance()?.router?.params
    });
    const onCancelCoupon = () => {
      state.showCoupon = !state.showCoupon;
      state.orderData.couponId = '0';
    };
    const onConverTime = (time) => {
      return dayjs.unix(time).format('YYYY-MM-DD HH:mm');
    };
    const handleGetUserCardList = (categoryId, productOrRoomId) => {
      http.get('/api/user/getUserCardBagList', { categoryId: categoryId, productOrRoomId: productOrRoomId, platform: 3 })
        .then(res => {
          state.coupons = res?.cardBagData;
          state.disabledCoupons = res?.disabledCardBagData;
        });
    };
    //获取购物车列表
    const onGetCartItemList = (shopId) => {
      http.get(`/api/order/getCartItemList?id=${shopId}`)
        .then(res => {
          state.cartData = res;
          let categoryId = [];
          let productId = [];
          for (let item of res.list) {
            categoryId.push(item?.productCategoryId);
            productId.push(item?.productId);
          }
          if (categoryId.length > 0 && productId.length > 0) {
            handleGetUserCardList(categoryId.join(','), productId.join(','));
          }
        });
    };
    //计算商品订单
    const calcOrder = (data) => {
      http.post('/api/order/calcorder', data)
        .then(res => {
          state.details = res;
        }).catch(() => {
          state.chosenCoupon = -1;
        });
    };
    const onChosenCoupon = (index) => {
      if (index != -1) {
        if ((state.coupons[index]?.value / 100) >= state.details?.orderPrice) {
          showToast({ title: '订单金额不能小于优惠券金额', icon: 'none' });
          return;
        }
        let data = Object.assign(state.orderData, { couponId: state.coupons[index]?.id });
        state.orderData = data;
        //计算订单
        calcOrder(data);
      } else {
        let data = Object.assign(state.orderData, { couponId: '0' });
        state.orderData = data;
        //计算订单
        calcOrder(data);
      }
      state.chosenCoupon = index;
      state.showCoupon = false;
    };
    const onGetDefaultAddress = () => {
      if (commonStore.userAddress.address === '选择收货地址') {
        http.get('/api/user/getUserDefaultAddress')
          .then(res => {
            commonStore.setUserAddress({
              name: res?.name,
              address: `${res?.province}${res?.city}${res?.region}${res?.detailAddress}`,
              phoneNumber: res?.phoneNumber,
              province: res?.province,
              city: res?.city,
              region: res?.region,
              detailAddress: res?.detailAddress,
              postCode: res?.postCode
            });
          });
      }
    };
    const onSubmit = () => {
      let address = commonStore.userAddress;
      if(empty(address?.phoneNumber) && empty(address?.province)&& empty(address?.name)){
        showToast({title:'请选择收货地址'});
        return;
      }
      let data = Object.assign(state.orderData, {
        "receiverName": address?.name,
        "receiverPhone": address?.phoneNumber,
        "receiverPostCode": address?.postCode,
        "receiverProvince": address?.province,
        "receiverCity": address?.city,
        "receiverRegion": address?.region,
        "receiverDetailAddress": address?.detailAddress,
        "openId": commonStore?.userInfo?.wxSmallOpenid,
        "isAdd": true
      });
      state.orderData = data;
      http.post('/api/order/addOrder', data)
        .then(res => {
          if (res?.contentMap) {
            let contentMap = JSON.parse(res?.contentMap);
            Taro.requestPayment({
              timeStamp: contentMap.timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
              nonceStr: contentMap.nonceStr, // 支付签名随机串，不长于 32 位
              package: contentMap.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
              signType: contentMap.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
              paySign: contentMap.paySign, // 支付签名
              success: () => {
                pageToUrl(`/pages/shop/orderDetails/index?orderNo=${res?.outTradeNo}`,false,true);
              },
              fail: () => {
                pageToUrl(`/pages/shop/orderDetails/index?orderNo=${res?.outTradeNo}`,false,true);
              }
            });
          } else {
            showToast({ title: '支付失败',icon: 'none' });
          }
        });
    };
    const onSubmitOrder = () => {
      Taro.requestSubscribeMessage({
        tmplIds: ['dRrn8VT74lR6oF6exbhAgCRqbv3CzZgcI6k9Oo6PsAE','PK8bMADWqd3zjF4xuKVfjyFZN1HdqgZxCnV36OpmAvk'],
        success: () => {
          onSubmit()
        },
        fail: () => {
          onSubmit()
        }
      });
    };
    const onInit = () => {
      let shopId = state?.routerParams?.shopId;
      state.orderData.shopId = shopId;
      state.orderData.shopName = state?.routerParams?.shopName;
      onGetCartItemList(shopId);
      calcOrder(state.orderData);
      onGetDefaultAddress();
    };
    useDidShow(() => {
      onInit();
    });
    return { pageToUrl, onConverTime, onSubmitOrder, onCancelCoupon, onChosenCoupon, commonStore, ...toRefs(state) };
  }
}
</script>