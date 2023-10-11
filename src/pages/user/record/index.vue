<template>
  <scroll-view :scroll-y="true" style="height: 100vh;" @scrolltolower="onLower" class="coll-list">
    <nut-swipe v-if="list.length > 0" v-for="(item, index) in list" :key="index">
      <view class="coll-item">
        <img :src="item?.pic" class="coll-img" />
      </view>
      <view class="coll-body">
        <view class="name">
          {{ item?.name }}
        </view>
        <view class="time">
          {{ onConverTime(item?.createTime?.seconds) }}
        </view>
      </view>
      <view class="coll-footer">
        <nut-button type="primary" @click="pageToUrl(`/pages${item?.path}/index${item?.params}`)">到这去</nut-button>
        <nut-button type="default" @click.stop="onDelete(item?.id)">{{ btnText }}</nut-button>
      </view>
      <template #right>
        <nut-button shape="square" style="height:100%" type="danger" @click.stop="onDelete(item?.id)">删除</nut-button>
      </template>
    </nut-swipe>
    <nut-empty description="无数据" v-else-if="(list.length === 0)"></nut-empty>
    <view style="font-size: 12px;text-align: center;padding: 5px 0px;" v-if="finished">没有更多了~~~~~</view>
  </scroll-view>
</template>
<script>
import dayjs from 'dayjs';
import http from '../../../utils/http';
import { pageToUrl } from '../../../utils/utils';
import './index.scss';
import Taro, { useDidShow,showToast } from '@tarojs/taro';
import { reactive, toRefs } from 'vue';
export default {
  setup() {
    const state = reactive({
      list: [],
      pageNo: 1,
      finished: false,
      btnText: '',
      routerParams: Taro.getCurrentInstance()?.router?.params
    });
    const onConverTime = (time) => {
      return dayjs.unix(time).format('YYYY-MM-DD HH:mm');
    };
    const onGetList = () => {
      state.btnText = state?.routerParams?.type === '1' ? '取消收藏' : '删除';
      http.post('/api/user/getUserCollectionBrowseList', {
        'extends': { type: state?.routerParams?.type },
        pageNo: state.pageNo,
        pageSize: 10
      }).then(res => {
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
        onGetList();
      }
    };
    const onDelete = (id)=>{
      http.post('/api/user/deleteUserCollectionBrowse',{
        id: [id]
      }).then(()=>{
        showToast({title: '操作成功'});
        onGetList();
      });
    };
    useDidShow(() => {
      onGetList();
    });
    return { pageToUrl, ...toRefs(state), onConverTime, onLower,onDelete };
  }
}
</script>