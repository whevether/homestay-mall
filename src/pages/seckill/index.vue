<template>
  <view class="index">
    <nut-tabs v-model="tab" title-gutter="9" title-scroll @click="onTabs">
      <nut-tab-pane :title="flash?.name" :pane-key="flashIndex" v-for="(flash, flashIndex) in sessionList" :key="flashIndex">
        <scroll-view :scroll-y="true" style="position: relative;height: 100vh;" @scrolltolower="onLower" v-if="flashPromotionList.length > 0">
          <view class="flash-body" v-for="(item, index) in flashPromotionList" :key="index">
            <view class="flash-header">
              <view class="flash-title">
                {{ item?.title }}
              </view>
              <view class="flash-header-body">
               <text class="text">{{onConverTime(item?.endTime?.seconds)}} 结束</text>
              </view>
            </view>
            <view class="flash-product" v-if="item?.product?.length > 0">
              <view class="order-body" v-for="(data, key) in item?.product?.filter(f=> f?.verifyStatus && !f?.deleteStatus && f?.publishStatus)" :key="key">
                <view class="order-item">
                  <view class="order-left">
                    <img :src="data?.pic" class="order-img" />
                  </view>
                  <view class="order-right">
                    <view class="order-item-title">
                      <text class="title">{{ data?.name }}</text>
                    </view>
                    <view class="order-item-attr">
                      商家 {{ decodeURIComponent(data?.shopName) }}
                    </view>
                    <view class="order-item-attr">
                      品牌 {{ data?.brandName }}
                    </view>

                    <view class="order-item-attr">
                      {{ data?.weight + 'kg' + '/' + data?.unit }}
                    </view>
                    <view class="order-item-attr">
                      销量:{{ data?.sale }}
                    </view>
                    <view class="order-item-attr">
                      <nut-tag type="primary" v-for="(tt,tIndex) in data?.serviceIds" :key="tIndex" style="margin-right: 5px;">{{ tt }}</nut-tag> <text>{{ data?.productCategoryName }}</text>
                    </view>
                  </view>
                </view>
                <view class="order-footer">
                  <view class="left">
                    <text class="text" v-if="onDisabledPay()">
                      未到抢购时间
                    </text>
                    <text class="text">
                      每人限购 {{ item?.flashPromotionLimit }} 件
                    </text>
                    <text class="text">限购商品数量 {{item?.flashPromotionCount}}</text>
                  </view>
                  <view class="right">
                    <view class="info">
                      <nut-price :price="item?.flashPromotionPrice" size="large" need-symbol decimal-digits="2" thousands />
                    </view>
                    <view class="status">
                      <nut-button type="primary" :disabled="onDisabledPay()"  @click="pageToUrl(`/pages/shop/product/index?id=${data?.id}&promotionType=${data?.promotionType}&shopId=${data?.shopId}`)">去抢购</nut-button>
                    </view>
                  </view>
                </view>
              </view>
            </view>
            <view class="flash-room" v-if="item?.room?.length > 0">
              <view class="order-body" v-for="(data, key) in item?.room?.filter(f=> f?.status === 1)" :key="key">
                <view class="order-item">
                  <view class="order-left">
                    <img :src="data?.pic[0]" class="order-img" />
                  </view>
                  <view class="order-right">
                    <view class="order-item-title">
                      <text class="title">{{ data?.name }}</text>
                    </view>
                    <view class="order-item-attr">
                      {{ data?.desc }}
                    </view>
                    <view class="order-item-attr">
                      民宿 {{ data?.homeStayName }}
                    </view>
                    <view class="order-item-attr">
                      销量:{{ data?.sale }}
                    </view>
                    <view class="order-item-attr">
                      <nut-tag type="primary" v-for="(tt,tIndex) in data?.tags" :key="tIndex" style="margin-right: 5px;">{{ tt }}</nut-tag>
                    </view>
                  </view>
                </view>
                <view class="order-footer">
                  <view class="left">
                    <text class="text" v-if="onDisabledPay()">
                      未到抢购时间
                    </text>
                    <text class="text">
                      每人限购 {{ item?.flashPromotionLimit }} 件
                    </text>
                    <text class="text">限购商品数量 {{item?.flashPromotionCount}}</text>
                  </view>
                  <view class="right">
                    <view class="info">
                      <nut-price :price="item?.flashPromotionPrice" size="large" need-symbol decimal-digits="2" thousands />
                    </view>
                    <view class="status">
                      <nut-button type="primary" :disabled="onDisabledPay()" @click="pageToUrl(`/pages/home/room/index?id=${data.id}`)">去抢购</nut-button>
                    </view>
                  </view>
                </view>
              </view>
            </view>
          </view>

        </scroll-view>
        <nut-empty v-else-if="flashPromotionList.length ===0 && finished" description="无数据"></nut-empty>
      </nut-tab-pane>
    </nut-tabs>
  </view>
</template>
<script>
import dayjs from 'dayjs';
import http from '../../utils/http';
import { pageToUrl } from '../../utils/utils';
import './index.scss';
import { useDidShow } from '@tarojs/taro';
import { reactive, toRefs } from 'vue';
export default {
  setup() {
    const state = reactive({
      tab: '0',
      sessionList: [],
      pageNo: 1,
      flashPromotionList: [],
      finished: false
    });
    const onGetFlashPromotion = (id) => {
      http.get(`/api/sms/getFlashPromotionList?pageNo=${state.pageNo}&pageSize=10&search=${id}`)
        .then(res => {
          let list = state.pageNo == 1 ? res?.data : [...state.flashPromotionList.concat(res?.data)];
          state.flashPromotionList = list;
          if (list.length >= res?.totalCount) {
            state.finished = true;
          } else {
            state.finished = false;
            state.pageNo = ++state.pageNo;
          }
        });
    };
    const onGetList = () => {
      http.get(`/api/sms/getFlashPromotionSessionList?pageNo=1&pageSize=20`)
        .then(res => {
          state.sessionList = res?.data;
          if (res?.data?.length > 0) {
            state.sessionValue = res?.data[0]; 
            onGetFlashPromotion(res?.data[0]?.id);
          }
        });
    };
    const onLower = () => {
      if (!state.finished) {
        onGetFlashPromotion(state?.sessionList[state.tab]?.id);
      }
    };
    const onTabs = (item)=>{
      onGetFlashPromotion(state?.sessionList[item?.paneKey]?.id);
    };
    const onDisabledPay = ()=>{
      let nowDate = dayjs().unix();
      let start = dayjs(`${dayjs().format("YYYY-MM-DD")} ${state?.sessionList[state.tab]?.startTime}`).unix();
      let end =  dayjs(`${dayjs().format("YYYY-MM-DD")} ${state?.sessionList[state.tab]?.endTime}`).unix();
      return start >= nowDate ||  end <= nowDate;
    };
    const onConverTime = (val)=>{
      return dayjs.unix(val).format("YYYY-MM-DD HH:mm")
    };
    useDidShow(() => {
      onGetList();
    });
    return { pageToUrl, onConverTime,onLower, onDisabledPay,onTabs,...toRefs(state) };
  }
}
</script>