<template>
  <view class="index">
    <nut-tabs v-model="tab" title-scroll title-gutter="10" v-if="(categoryList.length > 0)" @click="onTabs">
      <nut-tab-pane v-for="item in categoryList" :title="item?.name" :key="item?.id" :pane-key="item?.id">
        <scroll-view :scroll-y="true" style="height: 400px;" @scrolltolower="onLower">
         <view class="shop-item" v-if="list.length > 0" v-for="(item, key) in list" :key="key"
            @click="pageToUrl(`/pages/category/details/index?id=${item?.id}`)">
            <nut-card :img-url="item?.pic[0]" :title="item?.name"
              :shopDesc="`${item?.ticketPrice}元起`" :delivery="`${item?.phone}`" :shopName="item?.desc">
              <template #price>
                <nut-rate allow-half v-model="item.rate" active-color="#FFC800" readonly></nut-rate>
              </template>
              <template #origin>
                <text class="text">{{ item?.rate }}分</text>
              </template>
              <template #prolist>
                <view class="search_prolist_attr">
                  <nut-tag type="primary" style="margin-right: 5px;" v-for="(data1, index1) in item?.tags"
                    :key="index1">{{
                      data1
                    }}</nut-tag>
                </view>
              </template>
            </nut-card>
            <nut-row class="shop-footer">
              <nut-col :span="20">
                <text class="text">{{ item?.address }}</text>
              </nut-col>
              <nut-col :span="4">
                <view class="footer-right" @click="onOpenLocation(item?.lat, item?.lng)">
                  <text class="text">去这里</text>
                  <IconFont name="locationg3"></IconFont>
                </view>
              </nut-col>
            </nut-row>
          </view>
          <nut-empty description="无数据" v-else-if="(list.length === 0)"></nut-empty>
          <view style="font-size: 12px;text-align: center;padding: 5px 0px;" v-if="finished">没有更多了~~~~~</view>
        </scroll-view>
      </nut-tab-pane>
    </nut-tabs>
    <nut-empty description="无数据" v-else-if="(categoryList.length === 0)"></nut-empty>
  </view>
</template>

<script>
import './index.scss'
import { reactive, toRefs } from 'vue';
import  { useDidShow } from '@tarojs/taro';
import http from '../../utils/http';
import dayjs from 'dayjs';
import { useCommonStore } from '../../stores/common';
import { pageToUrl } from '../../utils/utils';
export default {
  name: 'Hot',
  components: {
  },
  setup() {
    const commonStore = useCommonStore();
    const state = reactive({
      categoryList: [],
      tab: '1',
      categoryId: 0,
      list: [],
      pageNo: 1,
      finished: false
    });
    const onConverTime = (time)=>{
      return dayjs.unix(time).format('YYYY-MM-DD HH:mm');
    };
    const onLower = () => {
      if (!state.finished) {
        onGetDetails(state.categoryId);
      }
    };
    const onGetDetails = (id) => {
      http.post(`/api/cms/getContentDetailPageList`, {
        pageNo: state.pageNo,
        pageSize: 10,
        extends: { categoryId: id }
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
    const onTabs = (e)=>{
      onGetDetails(e?.paneKey);
    };
    const onGetCategoryList = (addressCode) => {
      http.post('/api/cms/getHelpCategory', { pageSize: 999, search: addressCode  })
        .then(res => {
          let arr= res?.data.filter(f => f?.name !== '娱乐' && f?.name !== '路线规划' && f?.name !== '购物' && f?.name !== '景区介绍') ?? [];
          state.categoryList = arr;
          state.categoryId = arr[0]?.id;
          onGetDetails(arr[0]?.id);
        });
    };
    useDidShow(() => {
      onGetCategoryList(commonStore?.address?.addressCode);
    });
    return { ...toRefs(state), onLower,onConverTime,onTabs,pageToUrl };
  }
}
</script>
