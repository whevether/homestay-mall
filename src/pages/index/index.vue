<template>
  <view class="home" id="elId">
    <nut-backtop :distance="200">
      <template v-slot:content>
        <scroll-view :scroll-y="true" style="position: relative;" @scrolltolower="onLower"
          class="home-content">
          <view class="home-header">
            <view class="menu" @tap="visibleCascader = !visibleCascader">
              <text style="color: #fff;white-space: nowrap">{{ commonStore?.address?.city }}</text>
              <img :src="downImg" class="arrow-up" />
            </view>
            <view class="search-wrapper">
              <nut-searchbar placeholder="智慧小镇" class="search" background="transparent" input-background="transparent"
                shape="round">
                <template v-slot:leftin>
                  <IconFont size="14" name="search2" color="#fff"></IconFont>
                </template>
              </nut-searchbar>
            </view>
            <view class="qrcode" @tap="onQrCode"></view>
          </view>
          <nut-swiper init-page="1" :pagination-visible="true" pagination-color="#426543" auto-play="3000"
            v-if="countData.length > 0">
            <nut-swiper-item v-for="(item, key) in countData" :key="key"
              @click="pageToUrl(`/pages${item.url}/index${item?.params}`)">
              <text class="sw-text">{{ item?.name }}</text>
              <img :src="item?.pic" alt="" mode="aspectFill" />
            </nut-swiper-item>
          </nut-swiper>
          <nut-grid :border="false" class="mb-10" :column-num="5">
            <nut-grid-item :text="item.text" v-for="(item, index) in category" :key="index"
              @click="pageToUrl(`/pages${item?.route}`)" :id="`t${index + 1}`">
              <img :src="item.icon" style="width: 28px;height: 28px;" />
            </nut-grid-item>
          </nut-grid>
          <view style="position: relative;">
            <nut-tabs v-model="tab" @click="onTabs">
              <nut-tab-pane :title="data" v-for="(data, index) in tabArr" :key="index" :pane-key="index">

                <view class="shop-item" v-for="(item, key) in pageList" :key="key"
                  @click="pageToUrl(index === 1 ? `/pages/shop/details/index?shopId=${item?.id}` : `/pages/home/details/index?homeId=${item?.id}`)"
                  v-if="pageList.length > 0">
                  <nut-card :img-url="item?.pic[0]" :title="item?.name" :shopDesc="`${item?.initPrice}元起`" :delivery="`${item?.phone}`"
                    :shopName="`${item?.desc} ${item?.activity}`">
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
                <nut-empty description="无数据" v-else-if="(pageList.length === 0)"></nut-empty>
                <view style="font-size: 12px;text-align: center;padding: 5px 0px;" v-if="finished">没有更多了~~~~~</view>
              </nut-tab-pane>
            </nut-tabs>
            <IconFont name="more-x" style="position: absolute;right: 10px;top: 10px;z-index: 1;"
              @click="onShowActionsheet"></IconFont>
          </view>
        </scroll-view>
      </template>
    </nut-backtop>
    <nut-cascader title="地址选择" v-model:visible="visibleCascader" @change="onChangeAddress"
      :options="options"></nut-cascader>
    <nut-action-sheet v-model:visible="showActionsheet" :menu-items="sortOption" @choose="onActionsheet">
    </nut-action-sheet>
    <nut-fixed-nav :position="{ bottom: '70px' }" v-model:visible="showFixed" :nav-list="navList"
      @selected="onSelectFixNav" />
  </view>
</template>

<script>
import './index.scss';
import { reactive, toRefs, ref } from 'vue';
import http from '../../utils/http';
import Taro, { useDidShow, useDidHide, useShareAppMessage } from "@tarojs/taro";
import { useCommonStore } from '../../stores/common';
import { localStorageGet, pageToUrl } from '../../utils/utils';
import { IconFont } from '@nutui/icons-vue-taro';
export default {
  name: 'Index',
  components: {
    IconFont
  },
  setup() {

    // “weixin.zytravel.shop”已注册。
    // 在您的网站提供给用户的 HTML 代码中使用此网站密钥。
    // 6LeWBJAjAAAAAN-4o-iQoUrt7ohwia-i6g-POgj1
    // 此密钥用于您的网站和 reCAPTCHA 之间的通信。
    // 6LeWBJAjAAAAALLsTL4yDxdhVa2J3VcB7BzxBCCq
    const commonStore = useCommonStore();
    const showFixed = ref(false);
    const state = reactive({
      downImg: require('../../assets/resource/home/down.svg'),
      countData: [],
      category: [],
      navList: [{
        id: 1,
        text: '收藏',
        icon: 'http://upapk.oss-cn-beijing.aliyuncs.com/img/ab9df37efda9e30a02f9a3ddd9820135.svg'
      },
      {
        id: 2,
        text: '订单',
        icon: 'http://upapk.oss-cn-beijing.aliyuncs.com/img/fd34ab55b70a1c0fd3c34877f3f14ea2.svg'
      },
      {
        id: 3,
        text: '秒杀',
        icon: 'http://upapk.oss-cn-beijing.aliyuncs.com/img/6a7d9470cab100ccbccfc6ae7f55ee28.svg'
      },
      {
        id: 4,
        text: '优选',
        icon: 'http://upapk.oss-cn-beijing.aliyuncs.com/img/2e8ce2279c90505eda2ddf9148d92837.svg'
      }],
      navData: [{
        icon: 'http://upapk.oss-cn-beijing.aliyuncs.com/img/4509a01be0dd6e86e62eb4dc4443ec92.png',
        text: '商城',
        route: '/shop/index'
      }, {
        icon: "http://upapk.oss-cn-beijing.aliyuncs.com/img/e4f822340f31010d68f748b8b21788d5.png",
        text: '民宿',
        route: '/home/index'
      }],
      visibleCascader: false,
      options: [],
      tabArr: ['民宿', '商户'],
      tab: 0,
      sortValue: 0,
      showActionsheet: false,
      sortOption: [
        { name: '综合排序', value: 0 },
        { name: '好评排序', value: 1 },
        { name: '价格从低到高', value: 2 }
      ],
      pageList: [],
      pageNo: 1,
      finished: false
    });
    const onOpenLocation = (lat, lng) => {
      Taro.openLocation({
        latitude: lat,
        longitude: lng,
        scale: 18
      });
    };
    const onGetCategoryList = (addressCode) => {
      const categoryArr = [{
        icon: 'http://upapk.oss-cn-beijing.aliyuncs.com/img/e35d660bb5fdcc80427ab3065c113def.png',
        text: '导游服务',
        route: '/touristGuide/index'
      }, {
        icon: 'http://upapk.oss-cn-beijing.aliyuncs.com/img/6a7d9470cab100ccbccfc6ae7f55ee28.svg',
        text: '限时购',
        route: '/seckill/index'
      }, {
        icon: "http://upapk.oss-cn-beijing.aliyuncs.com/img/25cb056d996db5a71a939626a67cdc72.svg",
        text: '话题专区',
        route: '/topic/index'
      }, {
        icon: "http://upapk.oss-cn-beijing.aliyuncs.com/img/2e8ce2279c90505eda2ddf9148d92837.svg",
        text: '优选专区',
        route: '/preferred/index'
      }, {
        icon: "http://upapk.oss-cn-beijing.aliyuncs.com/img/0e18cda1c6445a884b33a0d5eadf31b5.svg",
        text: '品牌厂商',
        route: '/brand/index'
      }, {
        icon: "http://upapk.oss-cn-beijing.aliyuncs.com/img/f82f01616dd21bec6b97804db5f88763.svg",
        text: '新鲜好物',
        route: '/fresh/index'
      }, {
        icon: "http://upapk.oss-cn-beijing.aliyuncs.com/img/d79e19370b9cc3411ddad3db83715146.svg",
        text: '人气推荐',
        route: '/recommend/index'
      }, {
        icon: "http://upapk.oss-cn-beijing.aliyuncs.com/img/16da86be81beabcaf757303d69d35688.svg",
        text: '签到',
        route: '/signin/index'
      }, {
        icon: "http://upapk.oss-cn-beijing.aliyuncs.com/img/121338eb5e07f9f30f1adf5637a4337e.svg",
        text: '智慧停车',
        route: '/stop/index'
      }];
      http.post('/api/cms/getHelpCategory', { pageSize: 999, search: addressCode })
        .then(res => {
          state.category = state.navData.concat(res?.data.filter(f => f?.name === '娱乐' || f?.name === '路线规划' || f?.name === '购物' || f?.name === '景区介绍').map(item => {
            item.text = item.name;
            item.route = `/category/index?id=${item?.id}&name=${item?.name}`;
            item.isParams = true;
            return item;
          })).concat(categoryArr);
          // onGetContentDetails(res?.data[0]?.id);
        }).catch(() => {
          state.category = state.navData.concat(categoryArr);
        });
    };
    const onGetList = (t, addressCode, sort) => {
      const mapUrl = {
        0: '/api/homeStay/getHomeStayList',
        1: '/api/user/GetShopList'
      };

      http.post(mapUrl[t], { pageNo: state.pageNo, pageSize: 10, sort: sort, search: addressCode })
        .then(res => {
          let list = state.pageNo == 1 ? res?.data?.filter(f=> f?.verifyStatus && !f?.deleteStatus && f.status === 1) : [...state.pageList.concat(res?.data?.filter(f=> f?.verifyStatus && !f?.deleteStatus&& f.status === 1))];
          state.pageList = list;
          if (list.length >= res?.totalCount) {
            state.finished = true;
          } else {
            state.finished = false;
            state.pageNo = ++state.pageNo;
          }
        });
    };
    const onGetAdList = () => {
      http.get(`/api/sms/getHomeAdvertiseList?pageNo=1&pageSize=999`)
        .then(res => {
          state.countData = res.data;
        });
    };
    const onGetAddressList = () => {
      if (state?.options?.length === 0) {
        http.get('/api/user/getAddressList')
          .then(res => {
            state.options = res;
          });
      }
      if (state?.pageList?.length === 0) {
        onGetList(state.tab, commonStore?.address?.addressCode, state.sortValue);
      }
      if (state?.category?.length === 0) {
        onGetCategoryList(commonStore?.address?.addressCode);
      }
      if (state?.countData?.length === 0) {
        onGetAdList();
      }
    };
    //
    const onQrCode = () => {
      Taro.scanCode({
        success: (res) => {
          pageToUrl(res.result)
        }
      });
    };
    const onShowActionsheet = () => {
      state.showActionsheet = !state.showActionsheet;
    };
    const onChangeAddress = (e, node) => {
      let address = node[node.length - 1];
      commonStore.setAddress({ ...commonStore.address, city: address?.text, addressCode: address?.value });
      onGetList(state.tab, address?.value);
      onGetCategoryList(address?.value);
    };
    const onLower = () => {
      if (!state.finished) {
        onGetList(state.tab, commonStore?.address?.addressCode, state.sortValue);
      }
    };
    const onActionsheet = (e) => {
      state.sortValue = e?.value;
      onGetList(state.tab, commonStore?.address?.addressCode, e?.value);
    };
    const onTabs = (e) => {
      state.pageList = [];
      state.pageNo = 1;
      onGetList(parseInt(e?.paneKey), commonStore?.address?.addressCode, state.sortValue);
    };
    useShareAppMessage(res => {
      return {
        title: '智慧旅游',
        path: '/pages/index/index'
      }
    });
    const onSelectFixNav = (e) => {
      const mapRouter = {
        1: '/pages/user/record/index',
        2: '/pages/order/index?type=-1',
        3: '/pages/seckill/index',
        4: '/pages/preferred/index'
      };
      pageToUrl(mapRouter[e?.item?.id]);
    };
    useDidShow(() => {
      let time = null;
      time = setInterval(() => {
        let token = localStorageGet('token');
        if (token && commonStore?.address?.addressCode) {
          onGetAddressList();
          clearInterval(time);
        }
      }, 1000);
    });
    useDidHide(() => {
      state.pageNo = 1;
      state.visibleCascader = false;
      state.tab = 0;
      state.sortValue = 0;
    });
    return { ...toRefs(state), onChangeAddress, commonStore, onQrCode, onLower, onShowActionsheet, onActionsheet, onTabs, onOpenLocation, pageToUrl, onSelectFixNav, showFixed };
  }
}
</script>
