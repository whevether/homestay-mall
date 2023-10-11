<template>
  <view class="index">
    <nut-tabs v-model="tab">
      <nut-tab-pane :title="item" v-for="(item, index) in tabArr" :key="index">
        <nut-searchbar v-model="searchValue" placeholder="请输入关键字搜索">
          <template v-slot:leftin>
            <IconFont size="14" name="search2"></IconFont>
          </template>
        </nut-searchbar>
        <scroll-view :scroll-y="true" style="height: 80vh;" @scrolltolower="onLower" class="shop-list">
          <view class="shop-item" v-if="list.length > 0" v-for="(item, key) in list" :key="key"
            @click="pageToUrl(`/pages/touristGuide/details/index?id=${item?.id}`)">
            <nut-card :img-url="item?.pics[0]" :title="item?.name"
              :shopDesc="`${item?.price}元起`" :delivery="`${item?.phone}`" :shopName="`${item?.desc}`">
              <template #price>
                <nut-rate allow-half v-model="item.rate" active-color="#FFC800" readonly></nut-rate>
              </template>
              <template #origin>
                <text class="text">{{ item?.rate }}分</text>
              </template>
              <template #prolist>
                <view class="search_prolist_attr">
                  <nut-tag type="primary" style="margin-right: 5px;" >{{item?.sex === 1 ? '男' : '女'}} </nut-tag>
                  <nut-tag type="primary" style="margin-right: 5px;" >{{item?.age}} 岁</nut-tag>
                </view>
              </template>
            </nut-card>
          </view>
          <nut-empty description="无数据" v-else-if="(list.length === 0)"></nut-empty>
          <view style="font-size: 12px;text-align: center;padding: 5px 0px;" v-if="finished">没有更多了~~~~~</view>
        </scroll-view>
      </nut-tab-pane>
    </nut-tabs>
  </view>
</template>
<script>
import './index.scss';
import { reactive, toRefs } from 'vue';
import  { useDidShow } from '@tarojs/taro';
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
      list: []
    });
    const onGetList = (pageNo, sort, search) => {
      http.get('/api/cms/getTourisGuideList', {
        pageNo: pageNo,
        pageSize: 10,
        sort: sort,
        search: search
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
        onGetList(state.pageNo, state.tab, commonStore?.address?.addressCode);
      }
    };
    useDidShow(() => {
      onGetList(state.pageNo, state.tab, commonStore?.address?.addressCode);
    });
    return { ...toRefs(state), pageToUrl, onLower };
  }
}
</script>