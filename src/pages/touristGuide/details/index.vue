<template>
  <view class="category-details" v-if="details">
    <nut-swiper init-page="1" :pagination-visible="true" pagination-color="#426543" auto-play="3000">
      <nut-swiper-item v-for="(item, key) in details?.pics" :key="key">
        <img :src="item" alt="" mode="aspectFill" />
      </nut-swiper-item>
    </nut-swiper>
    <nut-cell-group>
      <nut-cell>
        <template v-slot:title>
          <view class="left">
            <view class="tou-info">
              <nut-avatar size="normal">
                <img :src="details?.avatar" />
              </nut-avatar>
              <view class="user-title">
                <view class="shop-name m0">{{ details?.name }}</view>
                <view class="text">昵称: {{ details?.nickName }}</view>
                <nut-tag type="primary">{{ details?.desc }}</nut-tag>
              </view>
              <view class="b1">
                <view class="text">性别: {{ details?.sex === 1 ? '男' : '女' }}</view>
                <view class="text">年龄: {{ details?.age }}岁</view>
              </view>
            </view>
            <view class="rate">
              <nut-rate active-color="#FFC800" v-model="details.rate" readonly icon-size="16" />
              <nut-price :price="details?.price" :thousands="true" position="after" symbol="元/天" />
            </view>
          </view>
        </template>
        <template v-slot:link>
          <view class="cell-item">
            <nut-button type="info">评价</nut-button>
          </view>
        </template>
      </nut-cell>
    </nut-cell-group>
    <view class="check-date" @click="showCalendar = true">
      <view class="date">
        <text>起始时间</text>
        <text>{{ checkInTime.format('YYYY-MM-DD dddd') }}</text>
      </view>
      <view class="total-date">
        <text>共{{ getNumberOfDays(checkInTime, checkOutTime) }}天</text>
      </view>
      <view class="date">
        <text>结束时间</text>
        <text>{{ checkOutTime.format('YYYY-MM-DD dddd') }}</text>
      </view>
    </view>
    <view class="pd-b-60">
      <view v-html="details?.content"></view>
      <nut-cell style="margin-bottom: 0px;" :title="`用户评价(${commentList.length})`" is-link="true"></nut-cell>
      <view class="cooment-list">
        <nut-comment imagesRows="multi" :images="item.images" :info="item.info" ellipsis="6" :operation="['replay']"
          @clickImages="onClickImages" v-for="(item, index) in commentList" :key="index">
        </nut-comment>
      </view>
    </view>
    <view class="footer">
      <view class="footer-icon">
        <IconFont name="dongdong"></IconFont>
        <text class="text">
          联系店家
        </text>
      </view>
      <view class="footer-icon">
        <button open-type="share" size="mini" class="share-btn">
          <IconFont name="share"></IconFont><text class="text">
            分享
          </text>
        </button>
      </view>
      <view class="footer-icon">
        <IconFont name="dongdong"></IconFont>
        <text class="text">
          收藏
        </text>
      </view>
      <view class="footer-btn">
        <nut-button type="info" class="submit-btn" @click="showDialog = true">立即预约</nut-button>
      </view>
    </view>
    <nut-calendar v-model:visible="showCalendar" start-text="开始" end-text="结束"
      :default-value="[checkInTime.format('YYYY-MM-DD'), checkOutTime.format('YYYY-MM-DD')]" type="range"
      :start-date="checkInTime.format('YYYY-MM-DD')" @close="showCalendar = false" @choose="onsChooseDate">
    </nut-calendar>
    <nut-dialog title="预约导游-订单信息" :visible="showDialog" @cancel="showDialog = false" @ok="onSubmit">
      <view className="od-info">
        <view class="title">{{ details?.name }}</view>
        <nut-price :price="(details?.price * getNumberOfDays(checkInTime, checkOutTime)).toFixed(2)" :thousands="true"
          position="after" symbol="元" />
        <view class="text">
          {{ `${checkInTime.format('YYYY-MM-DD dddd')} ~ ${checkOutTime.format('YYYY-MM-DD dddd')}
                    共${getNumberOfDays(checkInTime, checkOutTime)}天` }}
        </view>
      </view>
    </nut-dialog>
  </view>
  <nut-empty image="empty" description="内容空空如也" v-else></nut-empty>
</template>
<script>
import Taro, { useDidShow, showToast,useShareAppMessage } from '@tarojs/taro';
import { reactive, toRefs } from 'vue';
import http from '../../../utils/http';
import './index.scss';
import { IconFont } from '@nutui/icons-vue-taro';
import { useCommonStore } from '../../../stores/common';
import dayjs from 'dayjs';
import { pageToUrl } from '../../../utils/utils';
export default {
  components: {
    IconFont
  },
  setup() {
    const commonStore = useCommonStore();
    const state = reactive({
      details: null,
      checkInTime: dayjs(),
      checkOutTime: dayjs().add(1, 'day'),
      showCalendar: false,
      showDialog: false,
      commentList: [],
      routerParams: Taro.getCurrentInstance()?.router?.params
    });
    const onGetDetails = () => {
      http.get(`/api/cms/showTourisGuideDetails`, { id: state?.routerParams?.id })
        .then(res => {
          state.details = res;
          state.commentList = res?.comment.map(item => {
            item.images = [];
            for (let view of item?.pic) {
              item.images.push({
                "smallImgUrl": "",
                "bigImgUrl": "",
                "imgUrl": view
              });
            }
            item.info = {
              content: item?.content,
              nickName: item?.memberName,
              score: item?.rate,
              avatar: item?.memberAvatar,
              time: dayjs.unix(item?.createTime?.seconds).fromNow(),
              replay: item?.replayCount,
            };
            return item;
          });
        });
    };
    const getNumberOfDays = (date1, date2) => {//获得天数
      //date1：开始日期，date2结束日期
      let a1 = Date.parse(new Date(date1));
      let a2 = Date.parse(new Date(date2));
      let day = parseInt((a2 - a1) / (1000 * 60 * 60 * 24));//核心：时间戳相减，然后除以天数
      return day;
    };
    const onsChooseDate = param => {
      // state.date = [...[param[0][3], param[1][3]]];
      let checkInTime = dayjs(param[0][3]);
      let checkOutTime = dayjs(param[1][3]);
      state.checkInTime = checkInTime;
      state.checkOutTime = checkOutTime;
    };
    const onSubmit = () => {
      http.post('/api/cms/addTourisGuideOrder', {
        touristGuideId: state?.routerParams?.id,
        sourceType: 3,
        checkinDate: state.checkInTime.unix(),//入住时间
        checkoutDate: state.checkOutTime.unix(),// 离开时间
        payType: 0,
        openId: commonStore?.userInfo?.wxSmallOpenid,
        payShape: 1,
      }).then(res => {
        if (res?.contentMap) {
          let contentMap = JSON.parse(res?.contentMap);
          Taro.requestPayment({
            timeStamp: contentMap.timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
            nonceStr: contentMap.nonceStr, // 支付签名随机串，不长于 32 位
            package: contentMap.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
            signType: contentMap.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
            paySign: contentMap.paySign, // 支付签名
            success: () => {
              pageToUrl(`/pages/touristGuide/orderDetails/index?orderNo=${res?.outTradeNo}`);
            },
            fail: () => {
              pageToUrl(`/pages/touristGuide/orderDetails/index?orderNo=${res?.outTradeNo}`);
            }
          });
        } else {
          showToast({ title: '支付失败', icon: 'none' });
        }
      });
    };
    useShareAppMessage(() => {
      return {
        title: details?.name,
        path: `/pages/touristGuide/details/index?id=${state.routerParams?.id}`
      }
    });
    useDidShow(() => {
      onGetDetails();
    });
    return { ...toRefs(state), onSubmit, getNumberOfDays, onsChooseDate };
  }
}
</script>