<template>
  <view class="home-wrapper"  v-if="details?.verifyStatus && !details?.deleteStatus">
    <view class="home-details">
      <nut-notify v-model:visible="showNotify" :msg="details?.activity" :duration="0" type="primary" />
      <nut-swiper init-page="1" :pagination-visible="true" pagination-color="#426543" auto-play="3000">
        <nut-swiper-item v-for="(item, key) in [...details.pic, ...details.hygienePic]" :key="key">
          <img :src="item" alt="" mode="aspectFill" />
        </nut-swiper-item>
      </nut-swiper>
      <nut-cell-group>
        <nut-cell style="border-bottom: 1px solid #eee;">
          <template v-slot:title>
            <view class="home-left">
              <text class="home-title">{{ details?.name }}</text>
              <view> <nut-rate active-color="#FFC800" icon-size="16" v-model="details.rate" readonly /> 
                <view>
                  <nut-price :price="details?.initPrice" :thousands="true" position="after" symbol="元起" />
                </view>
              </view>
              <view>
                <nut-tag type="primary">{{ details?.status === 0 ? '暂停营业' : '正常营业' }}</nut-tag>
                <nut-tag type="primary" style="margin-left: 2px;">{{ details?.hygieneStatus === 0 ? '卫生一般' :
                  '卫生达标' }}</nut-tag>
                <nut-tag type="primary" v-for="(item, index) in details?.tags" :key="index" style="margin-left: 2px;">{{
                  item
                }}</nut-tag>
              </view>
            </view>
          </template>
        </nut-cell>
        <nut-cell style="border-bottom: 1px solid #eee;" :title="details?.desc"></nut-cell>
        <nut-cell style="border-bottom: 1px solid #eee;" :title="details?.address">
          <template v-slot:link>
            <IconFont font-class-name="iconfont" class-prefix="icon" name="lvyoutehui"
              @click="onOpenLocation(details?.lat, details?.lng)"></IconFont>
          </template>
        </nut-cell>
      </nut-cell-group>
      <nut-grid v-if="details?.service.length > 0" :column-num="5" :border="false">
        <nut-grid-item :text="item?.text" v-for="(item, index) in details?.service" :key="index">
          <IconFont font-class-name="iconfont" class-prefix="icon" :name="item?.icon" size="25"></IconFont>
        </nut-grid-item>
      </nut-grid>
      <view class="room-wrapper">
        <view class="check-date" @click="showCalendar = true">
          <view class="date">
            <text>入住</text>
            <text>{{ checkInTime.format('YYYY-MM-DD dddd') }}</text>
          </view>
          <view class="total-date">
            <text>共{{ getNumberOfDays(checkInTime, checkOutTime) }}天</text>
          </view>
          <view class="date">
            <text>退房</text>
            <text>{{ checkOutTime.format('YYYY-MM-DD dddd') }}</text>
          </view>
        </view>
        <scroll-view :scroll-y="true" style="height: 50vh;" @scrolltolower="onLower" class="room-list">
          <nut-card :img-url="item?.pic[0]" :title="item?.name" :price="item?.oldPrice" :vipPrice="item.newPrice"
            :shopDesc="`${item?.desc}`" :delivery="item?.roomCategoryName" :shopName="item.homeStayName"
            v-for="(item, key) in roomList" :key="key" @click="pageToUrl(`/pages/home/room/index?id=${item.id}&checkInDate=${checkInTime.unix()}&checkOutDate=${checkOutTime.unix()}`)">
            <template #prolist>
              <view class="search_prolist_attr">
                <nut-tag type="primary" style="margin-right: 5px;">可日租</nut-tag>
                <nut-tag type="primary" style="margin-right: 5px;">可月租</nut-tag>
                <nut-tag type="primary" style="margin-right: 5px;" v-for="(data, index) in item?.tags" :key="index">{{
                  data
                }}</nut-tag>
              </view>
            </template>
            <template #footer>
              <view class="customize">
                <text class="room-number">房间剩余数量: {{ item?.roomSurplusNumber }}间</text>
                <nut-button type="info" :disabled="item?.roomSurplusNumber == 0 ? true : false"
                  @click.stop="pageToUrl(`/pages/home/order/index?id=${item?.id}&checkInDate=${checkInTime.unix()}&checkOutDate=${checkOutTime.unix()}`)">预定</nut-button>
              </view>
            </template>
          </nut-card>
        </scroll-view>
      </view>
      <view class="footer">
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
        <view class="footer-btn">
          <nut-button type="info" class="submit-btn" @click="showActionsheet = !showActionsheet">联系民宿主</nut-button>
        </view>
      </view>
    </view>
    <nut-calendar v-model:visible="showCalendar" start-text="入住" end-text="退房"
      :default-value="[checkInTime.format('YYYY-MM-DD'), checkOutTime.format('YYYY-MM-DD')]" type="range"
      :start-date="checkInTime.format('YYYY-MM-DD')" @close="showCalendar = false" @choose="onsChooseDate">
    </nut-calendar>
    <nut-action-sheet v-model:visible="showActionsheet" :menu-items="[{ name: details?.tel }, { name: details?.phone }]"
      @choose="onChoosePhone" title="联系店家">
    </nut-action-sheet>
  </view>
  <nut-empty v-else-if="!details?.verifyStatus || details?.deleteStatus" description="店铺不存在或已关闭"></nut-empty>
  <nut-empty v-else-if="!details" description="店铺不存在"></nut-empty>
</template>
<script>
import './index.scss';
import { reactive, toRefs } from 'vue';
import Taro, { useDidShow, useDidHide, useShareAppMessage, showToast } from '@tarojs/taro';
import http from '../../../utils/http';
import dayjs from 'dayjs';
import { IconFont } from '@nutui/icons-vue-taro';
import { pageToUrl } from '../../../utils/utils';
export default {
  components: {
    IconFont
  },
  setup() {
    const state = reactive({
      showNotify: true,
      finished: false,
      showActionsheet: false,
      details: null,
      checkInTime: dayjs(),
      checkOutTime: dayjs().add(1, 'day'),
      showCalendar: false,
      roomList: [],
      pageNo: 1,
      collection: null,
      routerParams: Taro.getCurrentInstance()?.router?.params
    });
    const onShowColl = (id) => {
      let params = `&path=/home/details&params=?homeId=${id}`;
      http.get(`/api/user/showUserCollectionBrowse?type=1${params}`)
        .then(res => {
          state.collection = res;
        });
    };

    const onAddColl = (type, details) => {
      http.post(`/api/user/addUserCollectionBrowse`, {
        name: details?.name,
        params: `?homeId=${state?.routerParams?.homeId}`,
        path: "/home/details",
        pic: details?.pic[0],
        price: details?.initPrice,
        type: type,
      }).then(() => {
        if (type === 1) {
          onShowColl(state?.routerParams?.homeId);
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
      http.get(`/api/homeStay/showHomeStay?id=${id}`)
        .then(res => {
          state.details = res;
          onShowColl(state.routerParams?.homeId);
          onAddColl(0, res);
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
      onGetRoomRemainingList(state.routerParams?.homeId, state.pageNo, checkInTime, checkOutTime);
    };
    const onGetRoomRemainingList = (id, pageNo, checkInTime, checkOutTime) => {
      http.post(`/api/homeStay/getRoomRemainingList`, {
        pageNo: pageNo,
        pageSize: 20,
        extends: {
          homeId: id,
          checkInTime: checkInTime.unix(),
          checkOutTime: checkOutTime.unix()
        }
      }).then(res => {
        let list = state.pageNo == 1 ? res?.data : [...state.roomList.concat(res?.data)];
        state.roomList = list;
        if (list.length >= res?.totalCount) {
          state.finished = true;
        } else {
          state.pageNo = ++state.pageNo;
        }
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
        onGetRoomRemainingList(state.routerParams?.homeId, state.pageNo, state.checkInTime, state.checkOutTime);
      }
    };
    useShareAppMessage(() => {
      return {
        title: details?.name,
        path: `/pages/home/details/index?homeId=${state.routerParams?.homeId}`
      }
    });
    const onOpenLocation = (lat, lng) => {
      Taro.openLocation({
        latitude: lat,
        longitude: lng,
        scale: 18
      });
    };
    useDidShow(() => {
      onGetDetails(state.routerParams?.homeId);
      onGetRoomRemainingList(state.routerParams?.homeId, state.pageNo, state.checkInTime, state.checkOutTime);
    });
    useDidHide(() => {
      state.pageNo = 1;
      state.roomList = [];
    });
    return { ...toRefs(state), onsChooseDate, getNumberOfDays, onLower, onChoosePhone, onCollection, onOpenLocation, pageToUrl };
  }
}
</script>