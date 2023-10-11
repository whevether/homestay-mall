<template>
  <scroll-view :scroll-y="true" @scrolltolower="onLower" class="index">
    <view class="header">
      <nut-row type="flex" justify="center" align="center">
        <nut-col :span="24" offset="10">
          <nut-avatar size="large">
            <img :src="commonStore?.userInfo?.avatar ?? defaultAvatar" />
          </nut-avatar>
        </nut-col>
      </nut-row>
      <nut-grid :border="false" :column-num="6">
        <nut-grid-item :class="item.active ? 'active' : ''" :text="item?.name" v-for="(item, index) in userLevelList"
          :key="index">
          <IconFont font-class-name="iconfont" class-prefix="icon" :name="item?.icon"
            :color="item.active ? '#ffcc00' : '#fff'" size="40" />
        </nut-grid-item>
      </nut-grid>
      <view class="data">
        会员成长值 {{ commonStore?.userInfo?.growth }}
      </view>
    </view>
    <nut-grid :column-num="3" :border="true">
      <nut-grid-item :class="currentUserLevel?.priviledgeFreeFreight == 0 ? 'group-disabled' : ''" text="满免运费">
        <IconFont font-class-name="iconfont" class-prefix="icon" name="mianyunfei" size="40" />
      </nut-grid-item>
      <nut-grid-item :class="currentUserLevel?.priviledgeSignIn == 0 ? 'group-disabled' : ''" text="签到奖励">
        <IconFont font-class-name="iconfont" class-prefix="icon" name="qiandao" size="40" />
      </nut-grid-item>
      <nut-grid-item :class="currentUserLevel?.priviledgeComment == 0 ? 'group-disabled' : ''" text="评价奖励">
        <IconFont font-class-name="iconfont" class-prefix="icon" name="pingjia" size="40" />
      </nut-grid-item>
      <nut-grid-item :class="currentUserLevel?.priviledgePromotion == 0 ? 'group-disabled' : ''" text="专享活动">
        <IconFont font-class-name="iconfont" class-prefix="icon" name="yaoqingjiangli" size="40" />
      </nut-grid-item>
      <nut-grid-item :class="currentUserLevel?.priviledgeMemberPrice == 0 ? 'group-disabled' : ''" text="会员特价">
        <IconFont font-class-name="iconfont" class-prefix="icon" name="tejia" size="40" />
      </nut-grid-item>
      <nut-grid-item :class="currentUserLevel?.priviledgeBirthday == 0 ? 'group-disabled' : ''" text="生日礼包">
        <IconFont font-class-name="iconfont" class-prefix="icon" name="quantianreshui" size="40" />
      </nut-grid-item>
    </nut-grid>
    <nut-swipe v-for="(item, index) in list" :key="index">
      <nut-cell :desc="`创建时间: ${onConvertDate(item?.createTime?.seconds)}`" :sub-title="`${mapChangeType[item?.changeType]}${item.changeCount}`">
        <template v-slot:title>
          <view class="record-title">{{ item?.operateNote }}</view>
          <view class="record-text">成长值来源: {{mapSourceType[item?.sourceType]}}</view>
        </template>
      </nut-cell>
      <template #right>
        <nut-button shape="square" style="height:100%" type="danger">删除</nut-button>
      </template>
    </nut-swipe>
    <nut-empty description="没有记录" v-if="(list.length === 0 &&  !loading)"></nut-empty>
    <view style="font-size: 12px;text-align: center;padding: 5px 0px;" v-if="finished && !loading">没有更多了~~~~~</view>
  </scroll-view>
</template>
<script>
import { pageToUrl } from '../../../utils/utils';
import './index.scss';
import { useCommonStore } from '../../../stores/common';
import { reactive, toRefs } from 'vue';
import { IconFont } from '@nutui/icons-vue-taro';
import { useDidShow } from '@tarojs/taro';
import http from '../../../utils/http';
import dayjs from 'dayjs';
export default {
  components: {
    IconFont
  },
  setup() {
    const commonStore = useCommonStore();
    const state = reactive({
      userLevelList: [],
      pageNo: 1,
      loading: false,
      list: [],
      mapChangeType: {
        0: '+',
        1: '-'
      },
      mapSourceType: {
        1: '公众号',
        2: 'app',
        3: '小程序',
        4: '网站'
      },
      finished: false,
      currentUserLevel: null,
      defaultAvatar: "http://upapk.oss-cn-beijing.aliyuncs.com/img/30e0f7ee86576e09f7378ae46a5b710c.svg",
    });
    const onGetlevelList = () => {
      http.get(`/api/user/getUmsMemberLevelList?pageNo=1&pageSize=9999`)
        .then(res => {
          //获取会员成长值
          let list = res.data.map(item => {
            if (item.id.toString() === commonStore?.userInfo?.memberLevelId) {
              item.active = true;
              state.currentUserLevel = item;
            } else {
              item.active = false;
            }
            return item;
          });
          state.userLevelList = list;
        });
    };
    const onGetGrowthList = () => {
      state.loading = true;
      http.get(`/api/user/getUmsGrowthChangeHistoryList?pageNo=${state.pageNo}&pageSize=10`)
        .then(res => {
          state.loading = false;
          let list = state.pageNo == 1 ? res?.data : [...state.list.concat(res?.data)];
          state.list = list;
          if (list.length >= res?.totalCount) {
            state.finished = true;
          } else {
            state.pageNo = ++state.pageNo;
          }
        });
    };
    const onLower = () => {
      if (!state.finished) {
        onGetGrowthList();
      }
    };
    const onConvertDate = (value) => {
      return dayjs.unix(value).format('YYYY-MM-DD HH:mm');
    };
    useDidShow(() => {
      onGetlevelList();
      onGetGrowthList();
    });
    return { pageToUrl, onConvertDate, commonStore, onLower, ...toRefs(state) };
  }
}
</script>