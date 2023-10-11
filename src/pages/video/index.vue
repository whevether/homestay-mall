<template>
  <view class="index">
    <nut-searchbar v-model="searchValue">
      <template v-slot:leftin>
        <IconFont size="14" name="search2"></IconFont>
      </template>
      <template v-slot:rightout>
        <IconFont name="more-x" @click="onShowActionsheet"></IconFont>
      </template>
    </nut-searchbar>
    <scroll-view :scroll-y="true" style="height: 100vh;" @scrolltolower="onLower">
      <view v-if="videoList.length > 0" class="video-list">
        <view class="video-box" v-for="(item, index) in videoList" :key="index">
          <view class="video-item"
            @click="pageToUrl(`/pages/video/details/index?id=${data?.id}`)"  v-for="(data, key) in item" :key="key">
            <img :src="data?.videoPic" class="video-pic" />
            <view class="video-footer">
              <text class="video-title">{{ data?.title }}</text>
              <view class="browse">
                <IconFont name="eye"></IconFont><text class="num">{{ data?.browse }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>
      <nut-empty description="无数据" v-else-if="(videoList.length === 0 && finished)"></nut-empty>
      <view style="font-size: 12px;text-align: center;" v-if="finished">没有更多了~~~~~</view>
    </scroll-view>
    <nut-action-sheet title="排序规则" v-model:visible="showActionsheet" :menu-items="menuOption" @choose="onActionsheet">
    </nut-action-sheet>
  </view>
</template>

<script>
import './index.scss';
import { reactive, toRefs } from 'vue';
import http from '../../utils/http';
import Taro, { useDidShow, useDidHide, useShareAppMessage } from '@tarojs/taro';
import { useCommonStore } from '../../stores/common';
import { IconFont } from '@nutui/icons-vue-taro';
import { pageToUrl } from '../../utils/utils';
export default {
  name: 'Video',
  components: {
    IconFont
  },
  setup() {
    const commonStore = useCommonStore();
    const state = reactive({
      videoList: [],
      pageList: [],
      pageNo: 1,
      searchValue: '',
      showActionsheet: false,
      finished: false,
      menuValue: 0,
      menuOption: [
        {
          name: '推荐',
          value: 0
        },
        {
          name: '观看最多',
          value: 1
        }]
    });
    const onGetList = (addressCode) => {
      http.get(`/api/cms/GetVideoList?pageNo=${state.pageNo}&pageSize=10&search=${addressCode}`)
        .then(res => {
          let list = state.pageNo == 1 ? res?.data : [...state.pageList,...res?.data];
          state.pageList = list;
          let arr1 = Object.assign([],list);
          const half = Math.ceil(arr1.length / 2);
          let arr = [arr1.splice(0, half),arr1.splice(-half)];
          state.videoList = arr;
          if (list.length >= res?.totalCount) {
            state.finished = true;
          } else {
            state.pageNo = ++state.pageNo;
          }
        });
    };
    const onShowActionsheet = () => {
      state.showActionsheet = !state.showActionsheet;
    };
    const onLower = () => {
      if (!state.finished) {
        onGetList(commonStore?.address?.addressCode);
      }
    };
    const onActionsheet = (e) => {
      state.menuValue = e?.value;
    };
    useShareAppMessage(res => {
      return {
        title: '宣传视频',
        path: '/pages/video/index'
      }
    });
    useDidShow(() => {
      onGetList(commonStore?.address?.addressCode);
    });
    useDidHide(() => {
      state.pageNo = 1;
      state.videoList = [];
      state.finished = false;
    });
    return { ...toRefs(state), onLower, pageToUrl, onShowActionsheet, onActionsheet }
  }
}
</script>
