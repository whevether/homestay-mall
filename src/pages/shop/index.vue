<template>
  <view class="index">
    <nut-tabs v-model="tab">
      <nut-tab-pane :title="data" v-for="(data, index) in tabArr" :key="index">
        <nut-searchbar v-model="searchValue" placeholder="请输入关键字搜索">
          <template v-slot:leftin>
            <IconFont size="14" name="search2"></IconFont>
          </template>
        </nut-searchbar>
        <scroll-view :scroll-y="true" style="height: 80vh;" @scrolltolower="onLower" class="shop-list">
          <view class="shop-item" v-for="(item, key) in list" :key="key" @click="pageToUrl(`/pages/shop/details/index?shopId=${item?.id}`)">
            <nut-card :img-url="item?.pic[0]" :title="item?.name" :price="item?.initPrice" :vipPrice="item.initPrice"
              :shopDesc="`${item?.desc}`" :delivery="`${item?.phone}`" :shopName="item?.notify ?? item?.activity">
              <template #price>
                <nut-rate allow-half v-model="item.rate" active-color="#FFC800" readonly></nut-rate>
              </template>
              <template #origin>
                <text class="text">{{item?.rate}}分</text>
              </template>
              <template #prolist>
                <view class="search_prolist_attr">
                  <nut-tag type="primary" style="margin-right: 5px;" v-for="(data1, index1) in item?.tags" :key="index1">{{
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
                <view class="footer-right"  @click="onOpenLocation(item?.lat, item?.lng)">
                  <text class="text">去这里</text>
                  <IconFont name="locationg3"></IconFont>
                </view>
              </nut-col>
            </nut-row>
          </view>
          <nut-empty description="无数据" v-if="(list.length === 0 && !loading)"></nut-empty>
          <view style="font-size: 12px;text-align: center;padding: 5px 0px;" v-if="finished && !loading">没有更多了~~~~~</view>
        </scroll-view>
      </nut-tab-pane>
    </nut-tabs>
  </view>
</template>
<script>
import './index.scss';
import { reactive, toRefs } from 'vue';
import Taro, { useDidShow } from '@tarojs/taro';
import { IconFont } from '@nutui/icons-vue-taro';
import http from '../../utils/http';
import { useCommonStore } from '../../stores/common';
import { pageToUrl } from '../../utils/utils';
export default {
  components: {
    IconFont
  },
  setup() {
    const commonStore = useCommonStore();
    const state = reactive({
      tab: 0,
      tabArr: ['综合排序', '好评优先'],
      searchValue: '',
      pageNo: 1,
      finished: false,
      loading: false,
      list: []
    });
    const onGetShopList = (pageNo, sort, addressCode) => {
      state.loading = true;
      http.post('/api/user/GetShopList', {
        pageNo: pageNo,
        pageSize: 10,
        sort: sort,
        extends: { addressCode: addressCode }
      }).then(res => {
        state.loading = false;
        let list = state.pageNo == 1 ? res?.data?.filter(f=> f?.verifyStatus && !f?.deleteStatus&& f.status === 1) : [...state.list.concat(res?.data?.filter(f=> f?.verifyStatus && !f?.deleteStatus&& f.status === 1))];
        state.list = list;
        if (list.length >= res?.totalCount) {
          state.finished = true;
        } else {
          state.pageNo = ++state.pageNo;
        }
      });
    };
    const onOpenLocation = (lat, lng) => {
      Taro.openLocation({
        latitude: lat,
        longitude: lng,
        scale: 18
      });
    };
    const onLower = () => {
      if (!state.finished) {
        onGetShopList(state.pageNo, state.tab, commonStore?.address?.addressCode);
      }
    };
    useDidShow(() => {
      onGetShopList(state.pageNo, state.tab, commonStore?.address?.addressCode);
    });
    return { ...toRefs(state), pageToUrl, onLower,onOpenLocation };
  }
}
</script>