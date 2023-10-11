<template>
  <view class="my-wrapper">
    <scroll-view :scroll-y="true" style="height: 100%;" @scrolltolower="onLower">
      <view class="my-header">
        <nut-avatar size="normal" shape="round">
          <img :src="commonStore?.userInfo?.avatar ?? defaultAvatar" style="border-radius:50%" />
        </nut-avatar>
        <IconFont name="setting" size="16" class="setting" color="#fff" @click="pageToUrl('/pages/setting/index')"></IconFont>
        <view class="right">
          <view class="rt-m">
            <view class="qt">
              <IconFont name="date" size="16" style="margin-right: 5px;" ></IconFont>
              <text>签到</text>
            </view>
          </view>
          <view class="rt-m">
            <text>{{ commonStore?.userInfo?.nickName }}</text>
            <view class="member-level">
              <IconFont name="add" size="16" style="margin-right: 5px;"></IconFont>
              <text>会员等级: {{ commonStore?.userInfo?.memberLevelName ?? "普通会员" }}</text>
            </view>
          </view>
          <view class="member-growth"><text>会员成长值: {{ commonStore?.userInfo?.growth ?? 0 }}</text><text
              style="margin-left: 15px;">会员积分:
              {{ commonStore?.userInfo?.integration ?? 0 }}</text></view>
          <nut-progress
            :percentage="(commonStore?.userInfo?.growth ?? 0) / mapProgress[commonStore?.userInfo?.memberLevelName]"
            stroke-color="#f2826a" stroke-width="8" />
        </view>
      </view>
      <nut-grid :border="false" class="mb-10" :column-num="5">
        <nut-grid-item :text="item.text" v-for="(item, index) in orderMenu" :key="index"
          @click="pageToUrl(`/pages/order/index?type=${item.type}`)">

          <img :src="item.icon" style="width: 28px;height: 28px;" />

        </nut-grid-item>
      </nut-grid>
      <nut-grid :border="false" class="mb-10" :column-num="5">
        <nut-grid-item :text="item.text" v-for="(item, index) in cardMenu" :key="index"
          @click="pageToUrl(`${item.route}?type=${item?.params?.type}`)">

          <img :src="item.icon" style="width: 28px;height: 28px;" />
        </nut-grid-item>
      </nut-grid>
      <view className="mb-10">
        <nut-cell-group>
          <nut-cell title="地址管理" is-link @click="pageToUrl('/pages/address/index')">
            <template v-slot:icon>
              <IconFont name="add" size="16"></IconFont>
            </template>
          </nut-cell>
          <nut-cell title="成为商户" is-link v-if="commonStore?.userInfo?.user?.roleslug === 'user'">
            <template v-slot:icon>
              <IconFont name="add" size="16"></IconFont>
            </template>
          </nut-cell>
          <nut-cell title="意见反馈" is-link>
            <template v-slot:icon>
              <IconFont name="add" size="16"></IconFont>
            </template>
          </nut-cell>
        </nut-cell-group>
      </view>
      <view className="mb-10">
        <nut-cell-group>
          <nut-cell title="关于我们" is-link @click="showAbout = true">
            <template v-slot:icon>
              <IconFont name="add" size="16"></IconFont>
            </template>
          </nut-cell>
        </nut-cell-group>
      </view>
      <view class="link-content" v-if="list.length > 0">
        <view class="my-title">猜你喜欢</view>
        <view class="content">
          <view class="link-item" v-for="(item, index) in list" :key="index"
            @click="pageToUrl(`/pages${item?.path}/index${item?.params}`)">
            <img :src="item?.pic" class="link-pic" />
            <text class="link-price">¥{{ item?.price }}</text>
            <view class="link-footer">
              <text class="price">¥{{ item?.price }}起</text>
              <text class="desc">{{ item?.name }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
    <nut-dialog title="关于我们" v-model:visible="showAbout" @cancel="showAbout = false" @ok="showAbout = false">
      <img src="http://upapk.oss-cn-beijing.aliyuncs.com/img/e4858cf48a8c9c7757b27474542206b9.png"
        style="width: 100%;" />
    </nut-dialog>
  </view>
</template>

<script>
import './index.scss'
import { reactive, toRefs } from 'vue';
import { useDidShow } from '@tarojs/taro';
import { useCommonStore } from '../../stores/common';
import http from '../../utils/http';
import { IconFont } from '@nutui/icons-vue-taro';
import { pageToUrl } from '../../utils/utils';
export default {
  name: 'My',
  components: {
    IconFont
  },
  setup() {
    const commonStore = useCommonStore();
    const state = reactive({
      list: [],
      pageNo: 1,
      finished: false,
      showAbout: false,
      mapProgress: {
        '游客': 1,
        '普通会员': 1,
        '白银会员': 2,
        '黄金会员': 4,
        '钻石会员': 8,
        '荣耀会员': 16,
        '王者会员': 32
      },
      defaultAvatar: "http://upapk.oss-cn-beijing.aliyuncs.com/img/30e0f7ee86576e09f7378ae46a5b710c.svg",
      cardMenu: [{ icon: 'http://upapk.oss-cn-beijing.aliyuncs.com/img/420865b6ae113ee05ab6e4b0428699ee.svg', text: '我的卡包', route: '/pages/user/card/index', params: {} }, { icon: 'http://upapk.oss-cn-beijing.aliyuncs.com/img/ab9df37efda9e30a02f9a3ddd9820135.svg', text: '我的收藏', route: '/pages/user/record/index', params: { type: 1 } }, { icon: "http://upapk.oss-cn-beijing.aliyuncs.com/img/56702edd68bb36a2cf1512600e8a1d4d.svg", text: '浏览记录', route: '/pages/user/record/index', params: { type: 0 } }, { icon: 'http://upapk.oss-cn-beijing.aliyuncs.com/img/7dcf49c3cc0569cc8e318bb7c5180ab7.svg', text: '成长值记录', route: '/pages/user/growth/index', params: {} }, { icon: 'http://upapk.oss-cn-beijing.aliyuncs.com/img/d0e8bda07b1cd5ff79e4a4e9825c930d.svg', text: '积分记录', route: '/pages/user/integration/index', params: {} }],
      orderMenu: [{ icon: 'http://upapk.oss-cn-beijing.aliyuncs.com/img/fd34ab55b70a1c0fd3c34877f3f14ea2.svg', text: '全部订单', type: -1 }, { icon: 'http://upapk.oss-cn-beijing.aliyuncs.com/img/c1538a6b83d81462178d643124ffff5d.svg', text: '待付款', type: 0 }, { icon: 'http://upapk.oss-cn-beijing.aliyuncs.com/img/15c1d5a255408cf26c7f8f9db70caf23.svg', text: '待发货', type: 1 }, { icon: 'http://upapk.oss-cn-beijing.aliyuncs.com/img/637d8dc629f00b9655e53d94fb7485e4.svg', text: '待评价', type: 3 }, { icon: 'http://upapk.oss-cn-beijing.aliyuncs.com/img/6bb46dbf0b56a093db301e89aaf7193a.svg', text: '已退款', type: 6 }]
    });
    const onGetBrowse = () => {
      http.post('/api/user/getUserCollectionBrowseList', {
        'extends': { type: 0 }, pageNo: state.pageNo, pageSize: 10
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
        onGetBrowse();
      }
    };
    useDidShow(() => {
      onGetBrowse();
    });
    return { ...toRefs(state), commonStore, pageToUrl, onLower };
  }
}
</script>
