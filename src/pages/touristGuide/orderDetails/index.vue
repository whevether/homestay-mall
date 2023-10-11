<template>
  <view class="order-details" v-if="orderDetails">
    <view class="order-pay-info" v-if="orderDetails?.status === 0">
      <img src="http://upapk.oss-cn-beijing.aliyuncs.com/img/3c33189f5ad250a6532bc6051f235114.png"
        style="width: 50px;height: 50px;" />
      <view class="pay-status">等待支付</view>
      <view class="order-desc">逾期未支付订单将自动取消</view>
      <view class="paybtn-group">
        <nut-countdown v-model="resetTime" :endTime="endTime" @end="onGetDetails">
          <view class="btn btn-pay" @click="retryTread">
            <text class="pay">去支付</text>
            <text class="block">(还剩{{ resetTime?.m }}</text>
            <text class="colon">:</text>
            <text class="block">{{ resetTime?.s }}</text>
          </view>
        </nut-countdown>
        <view class="btn btn-cancle-pay" @click="pageToUrl('/pages/order/index?type=-1')" style="margin-left: 5px;">返回订单列表
        </view>
      </view>
    </view>
    <view class="order-pay-info" v-else-if="orderDetails?.status === 4">
      <img src="http://upapk.oss-cn-beijing.aliyuncs.com/img/3c33189f5ad250a6532bc6051f235114.png"
        style="width: 50px;height: 50px;" />
      <view class="pay-status">订单已经关闭</view>
      <view class="order-desc">超过支付时间</view>
      <view class="paybtn-group">
        <view class="btn btn-cancle-pay" @click="pageToUrl('/pages/order/index?type=-1')">返回订单列表</view>
      </view>
    </view>
    <view class="order-pay-info" v-else-if="orderDetails?.status === 1">
      <img src="http://upapk.oss-cn-beijing.aliyuncs.com/img/1fd96c869e1efcec660e1bdc9ccf23d3.png"
        style="width: 50px;height: 50px;" />
      <view class="pay-status">支付成功</view>
      <view class="order-desc">等待房主确认</view>
      <view class="paybtn-group">
        <view class="btn btn-cancle-pay" @click="pageToUrl('/pages/order/index?type=-1')">返回订单列表</view>
      </view>
    </view>
    <view class="order-pay-info" v-else-if="orderDetails?.status === 2">
      <img src="http://upapk.oss-cn-beijing.aliyuncs.com/img/1fd96c869e1efcec660e1bdc9ccf23d3.png"
        style="width: 50px;height: 50px;" />
      <view class="pay-status">已确认</view>
      <view class="order-desc">等待入住</view>
      <view class="paybtn-group">
        <view class="btn btn-cancle-pay" @click="pageToUrl('/pages/order/index?type=-1')">返回订单列表</view>
      </view>
    </view>
    <view class="order-pay-info" v-else-if="orderDetails?.status === 3">
      <img src="http://upapk.oss-cn-beijing.aliyuncs.com/img/1fd96c869e1efcec660e1bdc9ccf23d3.png"
        style="width: 50px;height: 50px;" />
      <view class="pay-status">订单已完成</view>
      <view class="order-desc">欢迎下次光临</view>
      <view class="paybtn-group">
        <view class="btn btn-cancle-pay" @click="pageToUrl('/pages/order/index?type=-1')">返回订单列表</view>
      </view>
    </view>
    <view class="order-pay-info" v-else-if="orderDetails?.status === 6">
      <img src="http://upapk.oss-cn-beijing.aliyuncs.com/img/1fd96c869e1efcec660e1bdc9ccf23d3.png"
        style="width: 50px;height: 50px;" />
      <view class="order-desc">{{ onReturnApplyText(orderDetails?.returnApply) }}</view>
      <view class="paybtn-group">
        <view class="btn btn-cancle-pay" @click="pageToUrl('/pages/order/index?type=-1')">返回订单列表</view>
      </view>
    </view>
    <nut-steps :current="mapStep[orderDetails?.status]" v-if="orderDetails?.status !== 4 && orderDetails?.status !== 6"
      style="margin-top: 5px;">
      <nut-step title="等待支付"></nut-step>
      <nut-step title="导游确认"></nut-step>
      <nut-step title="已确认"></nut-step>
      <nut-step title="地点集合"></nut-step>
    </nut-steps>
    <nut-cell title="为了保护游客隐私只有游客主动联系导游,导游并没有游客手机号码无法主动联系"></nut-cell>
    <view class="home-order-info">
      <view class="left">
        <img :src="orderDetails?.pic[0]" class="room-img" />
      </view>
      <view class="right">
        <view class="text"><text class="text-title">游客名称 :</text><text>{{ orderDetails?.memberName }}</text></view>
        <view class="text"><text class="text-title">导游名称 :</text><text>{{ orderDetails?.tourisGuide?.name }}</text></view>
        <view class="text" @click="onChoosePhone(orderDetails?.tourisGuide?.phone)"><text class="text-title">导游电话
            :</text><text>{{ orderDetails?.tourisGuide?.phone }}</text></view>
        <view class="text"><text class="text-title">游玩时间 :</text><text>{{ onConverDate() }}</text></view>
        <view class="text"><text class="text-title">导游性别 :</text><text>{{ orderDetails?.tourisGuide?.sex === 1 ? '男' :
          '女' }}</text></view>
        <view class="text"><text class="text-title">导游年龄 :</text><text>{{ orderDetails?.age }}岁</text></view>
      </view>
    </view>
    <nut-cell-group title="订单信息">
      <nut-cell title="合计" :desc="`¥${orderDetails?.price ?? 0}元`" is-link>
      </nut-cell>
    </nut-cell-group>
    <nut-cell-group>
      <nut-cell title="发票信息" is-link desc="不开发票"></nut-cell>
    </nut-cell-group>
    <view class="footer" v-if="orderDetails.status !== 4 && orderDetails.status !== 6 && orderDetails.status !== 5">
      <view class="footer-btn">
        <nut-button type="primary" class="submit-btn"
          v-if="orderDetails.status === 1 || orderDetails.status === 2">确认入住</nut-button>
        <nut-button type="info" class="submit-btn" @click="showDialog = true"
          v-if="orderDetails.status !== 4 && orderDetails.status !== 6 && orderDetails.status !== 5">取消订单</nut-button>
      </view>
    </view>
    <nut-dialog title="系统提示" content="确认是否取消订单" :visible="showDialog" @cancel="showDialog = false" @ok="onCancelOrder" />
  </view>
  <nut-empty description="无数据" v-else></nut-empty>
</template>
<script>
import './index.scss';
import http from '../../../utils/http';
import Taro, { useDidShow, showToast } from '@tarojs/taro';
import { useCommonStore } from '../../../stores/common';
import { reactive, toRefs } from 'vue';
import dayjs from 'dayjs';
import { pageToUrl } from '../../../utils/utils';
export default {
  setup() {
    const commonStore = useCommonStore();
    const state = reactive({
      orderDetails: null,
      resetTime: {
        m: '00',
        s: '00'
      },
      showDialog: false,
      mapStep: {
        0: 1,
        1: 2,
        2: 3,
        3: 4,
        4: 1,
        5: 1,
        6: 1
      },
      endTime: null,
      routerParams: Taro.getCurrentInstance()?.router?.params
    });
    const onConverDate = () => {
      return `${dayjs.unix(state?.orderDetails?.checkinDate?.seconds).format('YYYY-MM-DD dddd')}至${dayjs.unix(state?.orderDetails?.checkoutDate?.seconds).format('YYYY-MM-DD dddd')}`;
    };
    const onGetDetails = () => {
      http.get(`/api/cms/showTourisGuideOrderDetails?id=${state?.routerParams?.orderNo}`)
        .then(res => {
          state.endTime = dayjs.unix(res?.closeDate?.seconds);
          state.orderDetails = res;
        });
    };
    const onReturnApplyText = (returnApply) => {
      if (returnApply?.status === 1 || returnApply?.checkStatus === 1) {
        return '退款成功,请关注公众号下发的信息';
      } if (returnApply?.status === 2 || returnApply?.checkStatus === 2) {
        return `退款失败,${returnApply?.handleNote}请关注公众号下发的信息`;
      } else {
        return '退款中,请耐心等待审核,一般七个工作日退款会到账,请关注公众号下发的信息';
      }
    };
    const onChoosePhone = (phone) => {
      Taro.makePhoneCall({
        phoneNumber: phone,
        success: () => {
          showToast({ title: '拨打成功' });
        }
      });
    };
    //重试支付
    const retryTread = () => {
      if (state?.orderDetails?.sourceType !== 3) {
        const mapSourceType = {
          1: '公众号',
          2: 'APP'
        };
        showToast({ title: `只能在${mapSourceType[state?.orderDetails?.sourceType]}里面重新支付`, icon: 'none' });
        return;
      }
      http.get(`/api/cms/retryTread?outTradeNo=${state?.routerParams?.orderNo}&openId=${commonStore?.userInfo?.wxSmallOpenid}`)
        .then((res) => {
          if (res?.contentMap) {
            let contentMap = JSON.parse(res?.contentMap);
            Taro.requestPayment({
              timeStamp: contentMap.timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
              nonceStr: contentMap.nonceStr, // 支付签名随机串，不长于 32 位
              package: contentMap.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
              signType: contentMap.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
              paySign: contentMap.paySign, // 支付签名
              success: () => {
                onGetDetails();
              },
              fail: () => {
                onGetDetails();
              }
            });
          } else {
            showToast({ title: '支付失败', icon: 'error' });
          }
        });
    };
    const onCancelOrder = () => {
      state.showDialog = false;
      if (state?.orderDetails?.status === 0) {
        http.post(`'/api/cms/cancelOrder`, {
          id: state?.routerParams?.orderNo,
          extend: {
            type: 0
          }
        }).then(() => {
          showToast({ title: '取消成功' });
          onGetDetails();
        });
      } else if (state?.orderDetails?.status === 1 || state?.orderDetails?.status === 2 || state?.orderDetails?.status === 3) {
        pageToUrl(`/pages/order/cancelOrder/index?type=1&orderNo=${state?.routerParams?.orderNo}&price=${state?.orderDetails?.paymentAmount}`);
      } else {
        showToast({ title: '订单不能被取消', icon: 'none' });
        return;
      }
    };
    useDidShow(() => {
      onGetDetails();
    });
    return { ...toRefs(state), onChoosePhone, onReturnApplyText, pageToUrl, onConverDate, retryTread, onGetDetails, onCancelOrder };
  }
}
</script>