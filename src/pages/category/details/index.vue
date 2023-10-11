<template>
  <view class="category-details" v-if="details">
    <nut-swiper init-page="1" :pagination-visible="true" pagination-color="#426543" auto-play="3000">
      <nut-swiper-item v-for="(item, key) in details?.pic" :key="key">
        <img :src="item" alt="" mode="aspectFill" />
      </nut-swiper-item>
    </nut-swiper>
    <nut-cell-group>
      <nut-cell :title="details?.name" :desc="details?.desc"></nut-cell>
      <nut-cell>
        <template v-slot:title>
          <view class="cell-item">
            <nut-rate active-color="#FFC800" v-model="details.rate" readonly icon-size="16" />
            <nut-price :price="details?.ticketPrice"  position="after" symbol="元/起" :thousands="true" />
          </view>
        </template>
        <template v-slot:link>
          <view class="cell-item">
            <nut-button type="info">评价</nut-button>
          </view>
        </template>
      </nut-cell>
      <nut-cell>
        <template v-slot:title>
          <view class="cell-item">
            <IconFont name="location"></IconFont>
            <text>{{ details?.address }}</text>
          </view>
        </template>
        <template v-slot:link>
          <view class="cell-item">
            <IconFont name="notice"></IconFont>
          </view>
        </template>
      </nut-cell>
    </nut-cell-group>
    <view class="pd-b-60">
      <view v-html="details?.content"></view>
      <nut-steps direction="vertical" current="1" v-if="details?.dayTrip?.length > 0">
        <nut-step :title="item?.title" v-for="(item, index) in details?.dayTrip" :key="index">
          <template v-slot:content>
            <view class="content">
              <view class="content-item" v-for="(data, key) in JSON.parse(item?.content)" :key="key">
                <text class="text">{{ data?.title }}</text>
                <text class="text">{{ data?.text }}</text>
              </view>
            </view>
          </template>
        </nut-step>
      </nut-steps>
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
        <nut-button type="info" class="submit-btn">评价</nut-button>
      </view>
    </view>
  </view>
  <nut-empty image="empty" description="内容空空如也" v-else></nut-empty>
</template>
<script>
import Taro, { useDidShow,useShareAppMessage } from '@tarojs/taro';
import { reactive, toRefs } from 'vue';
import http from '../../../utils/http';
import './index.scss';
import { IconFont } from '@nutui/icons-vue-taro';
import dayjs from 'dayjs';
export default {
  components: {
    IconFont
  },
  setup() {
    const state = reactive({
      details: null,
      commentList: [],
      routerParams: Taro.getCurrentInstance()?.router?.params
    });
    const onGetDetails = () => {
      http.get(`/api/cms/showContentDetails`, { id: state?.routerParams?.id })
        .then(res => {
          state.details = res;
          state.commentList = res?.comment.map(item => {
            item.images = [];
            for (let p of item?.pic) {
              item.images.push({
                "smallImgUrl": "",
                "bigImgUrl": "",
                "imgUrl": p
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
    useShareAppMessage(() => {
      return {
        title: details?.name,
        path: `/pages/category/details/index?id=${state.routerParams?.id}`
      }
    });
    useDidShow(() => {
      onGetDetails();
    });
    return { ...toRefs(state) };
  }
}
</script>