<template>
  <scroll-view class="index" :scroll-y="true" style="position:" @scrolltolower="onLower" v-if="details">
    <nut-swiper init-page="1" :pagination-visible="true" pagination-color="#426543" auto-play="3000">
      <nut-swiper-item v-for="(item, key) in details.pic" :key="key">
        <img :src="item" alt="" mode="aspectFill" />
      </nut-swiper-item>
    </nut-swiper>
    <nut-cell-group>
      <nut-cell style="border-bottom: 1px solid #eee;">
        <template v-slot:title>
          <view class="home-left">
            <text class="home-title">{{ details?.name }}</text>
            <view>
              <nut-price :price="details?.newPrice" size="normal" position="after" symbol="天" />
              <!-- oldPrice -->
              <nut-price :price="details?.oldPrice" size="small" position="after" symbol="天" thousands strike-through
                style="margin-left: 5px; color: #999;" />
            </view>
            <view>
              <nut-tag type="primary" v-for="(item, index) in details?.tags" :key="index" style="margin-left: 2px;">{{
                item
              }}</nut-tag>
            </view>
          </view>
        </template>
        <template v-slot:link>
          <view class="sharp">
            <view>可住{{ details?.numberPeople }}人</view>
            <view>{{ details?.roomCategoryName }}</view>
            <button open-type="share" size="mini" class="share-btn b1">
              <IconFont name="share"></IconFont><text class="text">
                分享
              </text>
            </button>
          </view>
        </template>
      </nut-cell>
      <nut-cell>
        <template v-slot:title>
          <view class="rule-info">
            <view class="title">
              退款规则
            </view>
            <view class="rule-item" v-for="(item, index) in details?.rule" :key="index">
              <view class="rule-title">
                {{ item?.title }}
              </view>
              <view class="rule-text">
                {{ item?.text }}
              </view>
            </view>
          </view>
        </template>
      </nut-cell>
      <nut-cell>
        <template v-slot:title>
          <view class="check-notify">
            <view class="title">
              入住须知
            </view>
            <view class="rule-item" v-for="(item, index) in details?.checkinNotice" :key="index">
              <view class="rule-text">
                {{ item }}
              </view>
            </view>
          </view>
        </template>
      </nut-cell>
      <nut-cell>
        <template v-slot:title>
          <view class="service">
            <view class="service-item" v-for="(item, index) in details?.service" :key="index">
              <text class="text">
                {{ item?.title }}
              </text>
              <text class="text">
                {{ item?.text }}
              </text>
            </view>
          </view>
        </template>
      </nut-cell>
    </nut-cell-group>
    <view class="footer">
      <view class="footer-icon">
        <button open-type="share" size="mini" class="share-btn">
          <IconFont name="share"></IconFont><text class="text">
            分享
          </text>
        </button>
      </view>
      <view class="footer-icon" @click="onCollection">
        <IconFont name="dongdong" :color="collection ? '#3460fa' : ''"></IconFont>
        <text class="text" :style="collection ? 'color: #3460fa' : ''">
          收藏
        </text>
      </view>
      <view class="footer-btn">
        <nut-button type="info" class="submit-btn" @click="pageToUrl(`/pages/home/order/index?id=${routerParams?.id}&checkInDate=${routerParams?.checkInDate}&checkOutDate=${routerParams?.checkOutDate}`)">预定房间</nut-button>
      </view>
    </view>
    <nut-cell :title="`用户评价(${commentList?.length ?? 0})`" is-link>
    </nut-cell>
    <view class="cooment-list">
      <nut-comment imagesRows="multi" :images="item.images" :info="item.info" ellipsis="6" :operation="['replay']"
        @clickImages="onClickImages" v-for="(item, index) in commentList" :key="index">
      </nut-comment>
    </view>
  </scroll-view>
</template>
<script>
import './index.scss';
import Taro, { useDidShow, showToast } from '@tarojs/taro';
import { reactive, toRefs } from 'vue';
import { IconFont } from '@nutui/icons-vue-taro';
import http from '../../../utils/http';
import dayjs from 'dayjs';
import { pageToUrl } from '../../../utils/utils';
export default {
  components: {
    IconFont
  },
  setup() {
    const state = reactive({
      details: null,
      collection: null,
      pageNo: 1,
      finished: false,
      commentList: [],
      routerParams: Taro.getCurrentInstance()?.router?.params
    });
    const onShowColl = (id) => {
      let params = `&path=/home/room/&params=?id=${id}`;
      http.get(`/api/user/showUserCollectionBrowse?type=1${params}`)
        .then(res => {
          state.collection = res;
        });
    };

    const onAddColl = (type, details) => {
      http.post(`/api/user/addUserCollectionBrowse`, {
        name: details?.name,
        params: `?id=${state?.routerParams?.id}`,
        path: "/home/room",
        pic: details?.pic[0],
        price: details?.newPrice,
        type: type,
      }).then(() => {
        if (type === 1) {
          onShowColl(state?.routerParams?.id);
        }
      });
    };
    //收藏
    const onCollection = () => {
      if (state?.collection) {
        http.post('/api/user/deleteUserCollectionBrowse', { id: [state?.collection?.id] })
          .then(() => {
            showToast({ title: '取消成功' });
            state.collection = null;
          });
      } else {
        onAddColl(1, state?.details);
      }
    };
    const onGetDetails = (id) => {
      http.get(`/api/homeStay/showRoom?id=${id}`).then(res => {
        state.details = res;
        onShowColl(state.routerParams?.homeId);
        onAddColl(0, res);
      });
    };
    const onGetRommCommit = () => {
      http.get(`/api/homeStay/getRoomCommitList?pageNo=${state.pageNo}&pageSize=10&extend=${JSON.stringify({ roomId: state?.routerParams?.id })}`)
        .then(res => {
          let mapList = res?.data.map(item => {
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
              time: dayjs.unix(item?.commitDate?.seconds).fromNow(),
              replay: 0,
            };
            return item;
          });
          let list = state.pageNo == 1 ? mapList : [...state.commentList.concat(mapList)];
          state.commentList = list;
          if (list.length >= res?.totalCount) {
            state.finished = true;
          } else {
            state.finished = false;
            state.pageNo = ++state.pageNo;
          }
        });
    };
    const onLower = () => {
      if (!state.finished) {
        onGetRommCommit();
      }
    };
    useDidShow(() => {
      onGetDetails(state?.routerParams?.id)
      onGetRommCommit();
    });
    return { pageToUrl, onCollection, onLower, ...toRefs(state) };
  }
}
</script>