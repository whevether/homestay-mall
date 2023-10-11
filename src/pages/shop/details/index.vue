<template>
  <scroll-view :scroll-y="true" @scrolltolower="onLower" class="index" v-if="details?.verifyStatus && !details?.deleteStatus">
    <nut-noticebar :text="details?.notify" :background="`rgba(251, 248, 220, 1)`" :color="`#D9500B`"></nut-noticebar>
    <nut-swiper init-page="1" :pagination-visible="true" pagination-color="#426543" auto-play="3000"
      v-if="details?.pic?.length > 0">
      <nut-swiper-item v-for="(item, key) in details?.pic" :key="key">
        <img :src="item" alt="" mode="aspectFill" />
      </nut-swiper-item>
    </nut-swiper>
    <nut-cell-group>
      <nut-cell style="border-bottom: 1px solid #eee;">
        <template v-slot:title>
          <view class="shop-left">
            <text class="shop-title">{{ details?.name }}</text>
            <view> <nut-rate active-color="#FFC800" icon-size="16" v-model="details.rate" readonly spacing="5" /> <text
                class="price">¥{{ details?.initPrice }}起</text></view>
            <view>
              <nut-tag type="primary">{{ details?.status === 0 ? '暂停营业' : '正常营业' }}</nut-tag>
              <nut-tag type="primary" v-for="(item, index) in details?.tags" :key="index" style="margin-left: 2px;">{{
                item
              }}</nut-tag>
            </view>
          </view>
        </template>
        <template v-slot:link>
          <view class="right-btn">
            <nut-button type="info" style="margin-top: 5px;" @click="pageToUrl(`/pages/shop/cart/index?shopId=${details?.id}&shopName=${details?.name}`)">进店购买</nut-button>
          </view>
        </template>
      </nut-cell>
      <nut-cell style="border-bottom: 1px solid #eee;" :title="details?.desc"></nut-cell>
      <nut-cell style="border-bottom: 1px solid #eee;">
        <template v-slot:title>
          <nut-row @click="onOpenLocation(details?.lat, details?.lng)">
            <nut-col :span="2">
              <IconFont font-class-name="iconfont" class-prefix="icon" name="lvyoutehui"></IconFont>
            </nut-col>
            <nut-col :span="22">
              <text class="text">{{ details?.address }}</text>
            </nut-col>
          </nut-row>
        </template>
        <template v-slot:link>
          <IconFont name="dongdong" @click="showActionsheet = !showActionsheet"></IconFont>
        </template>
      </nut-cell>
    </nut-cell-group>
    <nut-cell style="margin-bottom: 0px;" :title="`用户评价(${commentList.length})`" is-link="true"></nut-cell>
    <view class="cooment-list">
      <nut-comment  imagesRows="multi" :images="item.images" :info="item.info"
        ellipsis="6" :operation="['replay']" @clickImages="onClickImages" v-for="(item,index) in commentList" :key="index">
      </nut-comment>
    </view>
    <view class="footer">
      <view class="footer-icon" @click="showActionsheet = !showActionsheet">
        <IconFont name="dongdong" ></IconFont>
        <text class="text">
          联系店家
        </text>
      </view>
      <view class="footer-icon" @click="onCollection">
        <IconFont name="star-fill-n" :style="collection ? 'color: rgb(255, 204, 0)' : ''"></IconFont>
        <text class="text">
          收藏
        </text>
      </view>
      <view class="footer-icon">
        <button open-type="share" size="mini" class="share-btn">
          <IconFont name="share"></IconFont><text class="text">
            分享
          </text>
        </button>
      </view>
      <view class="footer-btn" @click="pageToUrl(`/pages/shop/cart/index?shopId=${details?.id}&shopName=${details?.name}`)">
        <nut-button type="info" class="submit-btn">进店购买</nut-button>
      </view>
    </view>
    <nut-action-sheet v-model:visible="showActionsheet" :menu-items="[{ name: details?.tel }, { name: details?.phone }]"
      @choose="onChoosePhone" title="联系店家">
    </nut-action-sheet>
  </scroll-view>
  <nut-empty v-else-if="!details?.verifyStatus || details?.deleteStatus" description="店铺不存在或已关闭"></nut-empty>
  <nut-empty v-else-if="!details" description="店铺不存在"></nut-empty>
</template>
<script>
import './index.scss';
import dayjs from 'dayjs';
import { reactive, toRefs } from 'vue';
import Taro, { useDidShow, useShareAppMessage, showToast } from '@tarojs/taro';
import http from '../../../utils/http';
import { IconFont } from '@nutui/icons-vue-taro';
import { pageToUrl } from '../../../utils/utils';
export default {
  components: {
    IconFont
  },
  setup() {
    const state = reactive({
      showNotify: true,
      details: null,
      finished: false,
      collection: null,
      commentList: [],
      pageNo: 1,
      showActionsheet: false,
      routerParams: Taro.getCurrentInstance()?.router?.params
    });
    const onGetProductCommentList = (id, pageNo) => {
      http.post(`/api/product/getProductCommentList`, {
        pageNo: pageNo,
        pageSize: 20,
        extends: {
          shopId: id
        }
      }).then(res => {
        let mapList = res?.data.map(item => {
          item.images = [];
          for(let p of item?.pics){
            item.images.push({
              "smallImgUrl": "",
              "bigImgUrl": "",
              "imgUrl": p
            });
          }
          item.info = {
            content: item?.content,
            nickName: item?.memberNickName,
            score: item?.star,
            avatar: item?.memberIcon,
            time: dayjs.unix(item?.createTime?.seconds).fromNow(),
            replay: item?.replayCount,
          };
          return item;
        });
        let list = state.pageNo == 1 ? mapList : [...state.commentList.concat(mapList)];
        state.commentList = list;
        if (list.length >= res?.totalCount) {
          state.finished = true;
        } else {
          state.pageNo = ++state.pageNo;
        }
      });
    };
    const onShowColl = (type,id) => {
      let params = `&path=/shop/details&params=?shopId=${id}`;
      http.get(`/api/user/showUserCollectionBrowse?type=${type}${params}`)
        .then(res => {
          state.collection = res;
        });
    };

    const onAddColl = (type, details) => {
      http.post(`/api/user/addUserCollectionBrowse`, {
        name: details?.name,
        params: `?shopId=${state?.routerParams?.shopId}`,
        path: "/shop/details",
        pic: details?.pic[0],
        price: details?.initPrice,
        type: type,
      }).then(() => {
        
        onShowColl(type,state?.routerParams?.shopId);
        
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
      http.get(`/api/user/showShop?id=${id}`)
        .then(res => {
          state.details = res;
          onAddColl(0, res);
        });
    };
    const onChoosePhone = (e) => {
      Taro.makePhoneCall({
        phoneNumber: e?.name,
        success: () => {
          showToast({ title: '拨打成功' });
        }
      });
    };
    const onLower = () => {
      if (!state.finished) {
        onGetProductCommentList(state.routerParams?.shopId, state.pageNo);
      }
    };
    useShareAppMessage(() => {
      return {
        title: details?.name,
        path: `/pages/shop/details/index?shopId=${state.routerParams?.shopId}`
      }
    });
    const onOpenLocation = (lat, lng) => {
      Taro.openLocation({
        latitude: lat,
        longitude: lng,
        scale: 18
      });
    };
    const onClickImages = (e)=>{
      Taro.previewImage({urls: [e?.value?.imgUrl]});
    };
    useDidShow(() => {
      onGetDetails(state.routerParams?.shopId);
      onGetProductCommentList(state.routerParams?.shopId, state.pageNo);
    });
    return { ...toRefs(state),onClickImages, pageToUrl, onOpenLocation, onCollection, onChoosePhone, onLower };
  }
}
</script>