<template>
  <view class="order-wrapper">
    <nut-tabs v-model="tab" @click="onTabs"  title-scroll title-gutter="10" name="order-tab">
      <nut-tab-pane :title="tab?.name" :pane-key="tab?.type" v-for="(tab, index) in mapTab[menuValue]" :key="index">
        <nut-searchbar v-model="searchValue">
          <template v-slot:leftin>
            <IconFont size="14" name="search2"></IconFont>
          </template>
        </nut-searchbar>
        <nut-menu>
          <nut-menu-item v-model="menuValue" :cols="2" :options="menuOption" @change="onActionsheet" />
        </nut-menu>
        <scroll-view :scroll-y="true" style="height:100vh;margin-top: 15px;" @scrolltolower="onLower" class="order-list">
          <nut-swipe v-for="(item, key) in mallOrderList" :key="key" v-if="mallOrderList.length > 0 && menuValue === 0">
            <view class="order-body" @click="pageToUrl(`/pages/shop/orderDetails/index?orderNo=${item?.orderSn}`)">
              <view class="order-header">
                <text class="time">{{ onConverDate(item?.createTime?.seconds, 'YYYY-MM-DD HH:mm') }}</text>
                <text class="status" v-if="item?.status !== 6">{{ mapStatus[menuValue][item?.status] }}</text>
                <text class="status" v-if="item?.status === 6">{{ onReturnApplyText(item?.returnApply) }}</text>
              </view>
              <view class="order-item" v-for="(data, key) in item?.omsOrderItems" :key="key">
                <view class="order-left">
                  <img :src="data?.productPic" class="order-img" />
                </view>
                <view class="order-right">
                  <view class="order-item-title">
                    <text class="title">{{ data?.productName }}</text>
                    <nut-tag type="primary">{{ item?.orderType === 0 ? '正常订单' : '秒杀订单' }}</nut-tag>
                  </view>
                  <view class="order-item-attr">
                    商家 {{ decodeURIComponent(item?.shopName) }}
                  </view>
                  <view class="order-item-attr">
                    品牌 {{ data?.productBrand }}
                  </view>

                  <view class="order-item-attr" v-if="data?.productAttr">
                    规格 【{{ onRenderAttr(data?.productAttr) }}】
                  </view>
                  <view class="order-item-footer">
                    <view class="price">
                      <nut-price :price="data?.productPrice" size="large" need-symbol decimal-digits="2" thousands
                        style="margin-right: 5px" />
                    </view>
                    <view class="num"><text class="num-sb"></text><text class="num-text">{{ data?.productQuantity
                    }}件</text></view>
                  </view>
                </view>
              </view>
              <view class="order-footer">
                <view class="left" @click="pageToUrl(`/pages/shop/orderDetails/index?orderNo=${item?.orderSn}`)">
                  <text class="order-no">订单号: {{ item?.orderSn }}</text>
                  <nut-button type="primary" size="small">查看详情</nut-button>
                </view>
                <view class="right">
                  <view class="info">
                    <text class="num">共 {{ item?.omsOrderItems?.length }} 件</text>
                    <nut-price :price="item?.paymentAmount" size="large" need-symbol decimal-digits="2" thousands />
                  </view>
                  <view class="status">
                    <nut-button type="info" v-if="item?.status === 0" @click.stop="retryTread(item)">去付款</nut-button>
                    <nut-button plain type="info" v-if="item?.status !== 4 && item?.status !== 5 && item?.status !== 6" @click.stop="onCancel(item)">取消</nut-button>
                    <nut-button type="info" v-else-if="item?.status === 2">确认收货</nut-button>
                    <nut-button type="info" v-else-if="item?.status === 3">去评价</nut-button>
                    <nut-button plain type="info"
                      v-else-if="(item?.status !== 0 && item?.status !== 1 && item?.status !== 2 && item?.status !== 3 && item?.status !== 6)" @click.stop="onDelete(item)">删除</nut-button>
                  </view>
                </view>
              </view>
            </view>

            <template #right>
              <nut-button shape="square" style="height:100%" type="danger" @click.stop="onDelete(item)">删除</nut-button>
            </template>
          </nut-swipe>
          <nut-swipe v-else-if="(mallOrderList.length > 0 && menuValue === 1)" v-for="(item, key1) in mallOrderList"
            :key="key1">
            <view class="order-body" @click="pageToUrl(`/pages/home/orderDetails/index?orderNo=${item?.orderSn}`)">
              <view class="order-header">
                <text class="time">{{ onConverDate(item?.createTime?.seconds, 'YYYY-MM-DD HH:mm') }}</text>
                <text class="status" v-if="item?.status !== 6">{{ mapStatus[menuValue][item?.status] }}</text>
                <text class="status" v-if="item?.status === 6">{{ onReturnApplyText(item?.returnApply) }}</text>
              </view>
              <view class="order-item">
                <view class="order-left">
                  <img :src="item?.pic[0] ?? 'https://img2.doubanio.com/view/group_topic/l/public/p399945622.webp'"
                    class="order-img" />
                </view>
                <view class="order-right">
                  <view class="order-item-title">
                    <text class="title">{{ item?.roomCategoryName }}</text>
                  </view>
                  <view class="order-item-attr">
                    商家 {{ decodeURIComponent(item?.shopName) }}
                  </view>
                  <view class="order-item-attr">
                    入住时间 {{ onConverDate(item?.checkinDate?.seconds, 'YYYY-MM-DD HH:mm') }}
                  </view>

                  <view class="order-item-attr">
                    离开时间 {{ onConverDate(item?.checkoutDate?.seconds, 'YYYY-MM-DD HH:mm') }}
                  </view>
                  <view class="order-item-footer">
                    <view class="price">
                      <nut-price :price="item?.roomPrice" size="large" need-symbol decimal-digits="2" thousands
                        style="margin-right: 5px" />
                    </view>
                    <view class="num"><text class="num-sb"></text><text class="num-text">{{ item?.roomNumber
                    }}间</text></view>
                  </view>
                </view>
              </view>
              <view class="order-footer">
                <view class="left" @click="pageToUrl(`/pages/home/orderDetails/index?orderNo=${item?.orderSn}`)">
                  <text class="order-no">订单号: {{ item?.orderSn }}</text>
                  <nut-button type="primary" size="small">查看详情</nut-button>
                </view>
                <view class="right">
                  <view class="info">
                    <text class="num">共 {{ item?.roomNumber }} 间</text>
                    <nut-price :price="item?.paymentAmount" size="large" need-symbol decimal-digits="2" thousands />
                  </view>
                  <view class="status">
                    <nut-button type="info" v-if="item?.status === 0" @click.stop="retryTread(item)">去付款</nut-button>
                    <nut-button plain type="info" v-if="item?.status !== 4 && item?.status !== 5 && item?.status !== 6" @click.stop="onCancel(item)">取消</nut-button>
                    <nut-button type="info" v-else-if="item?.status === 2">确认入住</nut-button>
                    <nut-button type="info" v-else-if="item?.status === 3">去评价</nut-button>
                    <nut-button plain type="info"
                      v-else-if="(item?.status !== 0 && item?.status !== 1 && item?.status !== 2 && item?.status !== 3 && item?.status !== 6)" @click.stop="onDelete(item)">删除</nut-button>
                  </view>
                </view>
              </view>
            </view>
            <template #right>
              <nut-button shape="square" style="height:100%" type="danger" @click.stop="onDelete(item)">删除</nut-button>
            </template>
          </nut-swipe>
          <nut-swipe v-else-if="(mallOrderList.length > 0 && menuValue === 2)" v-for="(item, key2) in mallOrderList"
            :key="key2">
            <view class="order-body"
              @click="pageToUrl(`/pages/touristGuide/orderDetails/index?orderNo=${item?.orderSn}`)">
              <view class="order-header">
                <text class="time">{{ onConverDate(item?.createTime?.seconds, 'YYYY-MM-DD HH:mm') }}</text>
                <text class="status" v-if="item?.status !== 6">{{ mapStatus[menuValue][item?.status] }}</text>
                <text class="status" v-if="item?.status === 6">{{ onReturnApplyText(item?.returnApply) }}</text>
              </view>
              <view class="order-item">
                <view class="order-left">
                  <img :src="item?.pic[0] ?? 'https://img2.doubanio.com/view/group_topic/l/public/p399945622.webp'"
                    class="order-img" />
                </view>
                <view class="order-right">
                  <view class="order-item-title">
                    <text class="title">{{ item?.touristGuideName }}</text>
                  </view>
                  <view class="order-item-attr">
                    开始时间 {{ onConverDate(item?.checkinDate?.seconds, 'YYYY-MM-DD HH:mm') }}
                  </view>

                  <view class="order-item-attr">
                    结束时间 {{ onConverDate(item?.checkoutDate?.seconds, 'YYYY-MM-DD HH:mm') }}
                  </view>
                  <view class="order-item-footer">
                    <view class="price">
                      <nut-price :price="item?.price" size="large" need-symbol decimal-digits="2" thousands
                        style="margin-right: 5px" />
                    </view>
                  </view>
                </view>
              </view>
              <view class="order-footer">
                <view class="left" @click="pageToUrl(`/pages/touristGuide/orderDetails/index?orderNo=${item?.orderSn}`)">
                  <text class="order-no">订单号: {{ item?.orderSn }}</text>
                  <nut-button type="primary" size="small">查看详情</nut-button>
                </view>
                <view class="right">
                  <view class="info">
                    <text class="num">共 {{ getNumberOfDays(
                      onConverDate(item?.checkinDate?.seconds), onConverDate(item?.checkoutDate?.seconds)) }} 天</text>
                    <nut-price :price="item?.paymentAmount" size="large" need-symbol decimal-digits="2" thousands />
                  </view>
                  <view class="status">
                    <nut-button type="info" v-if="item?.status === 0" @click.stop="retryTread(item)">去付款</nut-button>
                    <nut-button plain type="info" v-if="item?.status !== 4 && item?.status !== 5 && item?.status !== 6" @click.stop="onCancel(item)">取消</nut-button>
                    <nut-button type="info" v-else-if="item?.status === 2">确认到达</nut-button>
                    <nut-button type="info" v-else-if="item?.status === 3">去评价</nut-button>
                    <nut-button plain type="info"
                      v-else-if="(item?.status !== 0 && item?.status !== 1 && item?.status !== 2 && item?.status !== 3 && item?.status !== 6)" @click.stop="onDelete(item)">删除</nut-button>
                  </view>
                </view>
              </view>
            </view>
            <template #right>
              <nut-button shape="square" style="height:100%" type="danger" @click.stop="onDelete(item)">删除</nut-button>
            </template>
          </nut-swipe>
          <nut-empty description="无数据" v-else-if="(mallOrderList.length === 0 && finished)"></nut-empty>
          <view style="font-size: 12px;text-align: center;" v-if="finished">没有更多了~~~~~</view>
        </scroll-view>
      </nut-tab-pane>
    </nut-tabs>
    <nut-toast msg="加载中" :visible="loading" type="loading" :cover="true" />
  </view>
</template>
<script>
import './index.scss';
import { reactive, toRefs } from 'vue';
import http from '../../utils/http';
import Taro, { useDidShow,showModal,showToast } from '@tarojs/taro';
import dayjs from 'dayjs';
import { IconFont } from '@nutui/icons-vue-taro';
import { pageToUrl } from '../../utils/utils';
import { useCommonStore } from '../../stores/common';
export default {
  components: {
    IconFont
  },
  setup() {
    const commonStore = useCommonStore();
    const state = reactive({
      loading: false,
      mapTab: {
        0: [{ name: '全部订单', type: -1 }, { name: '待付款', type: 0 }, { name: '待发货', type: 1 }, { name: '已发货', type: 2 }, { name: '已完成', type: 3 },{ name: '已关闭', type: 4 }, { name: '已退款', type: 6 }],
        1: [{ name: '全部订单', type: -1 }, { name: '待付款', type: 0 }, { name: '待确认', type: 1 }, { name: '待入住', type: 2 }, { name: '已完成', type: 3 }, { name: '已关闭', type: 4 },{ name: '已退款', type: 6 }],
        2: [{ name: '全部订单', type: -1 }, { name: '待付款', type: 0 }, { name: '待确认', type: 1 }, { name: '待使用', type: 2 }, { name: '已完成', type: 3 }, { name: '已关闭', type: 4 },{ name: '已退款', type: 6 }]
      },
      mapStatus: {
        0: {
          0: '未支付',
          1: '待发货',
          2: '已发货',
          3: '已完成',
          4: '已关闭',
          5: '已失效',
          6: '已退款'
        },
        1: {
          0: '未支付',
          1: '待确认',
          2: '待入住',
          3: '已完成',
          4: '已关闭',
          5: '已失效',
          6: '已退款'
        },
        2: {
          0: '未支付',
          1: '待确认',
          2: '待使用',
          3: '已完成',
          4: '已关闭',
          5: '已失效',
          6: '已退款'
        }
      },
      tab: Taro.getCurrentInstance()?.router?.params?.type ?? -1,
      searchValue: '',
      menuValue: 0,
      menuOption: [
        {
          text: '商城订单',
          value: 0
        },
        {
          text: '民宿订单',
          value: 1
        },
        {
          text: '导游订单',
          value: 2
        }],
      mallOrderList: [],
      pageNo: 1,
      finished: false,
    });
    const onConverDate = (val, format) => {
      if (format) {
        return dayjs.unix(val).format(format);
      } else {
        return dayjs.unix(val);
      }
    };
    const getNumberOfDays = (date1, date2) => {//获得天数
      //date1：开始日期，date2结束日期
      let a1 = Date.parse(new Date(date1));
      let a2 = Date.parse(new Date(date2));
      let day = parseInt((a2 - a1) / (1000 * 60 * 60 * 24));//核心：时间戳相减，然后除以天数
      return day;
    };
    const onReturnApplyText = (returnApply) => {
      if (returnApply?.status === 1 || returnApply?.checkStatus === 1) {
        return '退款成功,请关注公众号下发的信息';
      } if (returnApply?.status === 2 || returnApply?.checkStatus === 2) {
        return `退款失败,${returnApply?.handleNote}请关注公众号下发的信息`;
      } else {
        return '退款中,请耐心等待审核,一般七个工作日退款会到账,请关注公众号下发的信息';
      }
    };
    const onRenderAttr = (data) => {
      if (data) {
        let attr = JSON.parse(data);
        let str = '';
        for (let item of attr) {
          str += `${item?.key},${item?.value}`;
        }
        return str;
      }
    };
    const onGetOrderList = (menuValue, tab) => {
      state.loading = true;
      const mapUrl = {
        0: '/api/order/getOrderList',
        1: '/api/homeStay/getRoomOrder',
        2: '/api/cms/getTourisGuideOrderList'
      };
      http.get(mapUrl[menuValue], { pageNo: state.pageNo, pageSize: 10, status: tab })
        .then(res => {
          state.loading = false;
          let list = state.pageNo == 1 ? res?.data : [...state.mallOrderList.concat(res?.data)];
          state.mallOrderList = list;
          if (list.length >= res?.totalCount) {
            state.finished = true;
          } else {
            state.pageNo = ++state.pageNo;
          }
        }).catch(() => {
          state.loading = false;
        });
    };
    const onTabs = (e) => {
      state.mallOrderList = [];
      state.pageNo = 1;
      onGetOrderList(state.menuValue, parseInt(e?.paneKey));
    };
    const onActionsheet = (e) => {
      state.mallOrderList = [];
      state.pageNo = 1;
      state.menuValue = e;
      onGetOrderList(e, state.tab);
    };
    const onLower = () => {
      if (!state.finished) {
        onGetOrderList(state.menuValue, state.tab);
      }
    };
    const retryTread = (item) => {
      if(item?.sourceType !== 3){
        const mapSourceType = {
          1: '公众号',
          2: 'APP'
        };
        showToast({title: `只能在${mapSourceType[item?.sourceType]}里面重新支付`,icon: 'none'});
        return;
      }
      const mapUrl = {
        0: `/api/order/retryTread?outTradeNo=${item?.orderSn}&openId=${commonStore?.userInfo?.wxSmallOpenid}`,
        1: `/api/homeStay/retryTread?outTradeNo=${item?.orderSn}&openId=${commonStore?.userInfo?.wxSmallOpenid}`,
        2: `/api/cms/retryTread?outTradeNo=${item?.orderSn}&openId=${commonStore?.userInfo?.wxSmallOpenid}`
      };
      http.get(mapUrl[state.menuValue]).then(res => {
        if (res?.contentMap) {
          let contentMap = JSON.parse(res?.contentMap);
          Taro.requestPayment({
            timeStamp: contentMap.timeStamp, // 支付签名时间戳，注意微信jssdk中的所有使用timestamp字段均为小写。但最新版的支付后台生成签名使用的timeStamp字段名需大写其中的S字符
            nonceStr: contentMap.nonceStr, // 支付签名随机串，不长于 32 位
            package: contentMap.package, // 统一支付接口返回的prepay_id参数值，提交格式如：prepay_id=***）
            signType: contentMap.signType, // 签名方式，默认为'SHA1'，使用新版支付需传入'MD5'
            paySign: contentMap.paySign, // 支付签名
            success: () => {
              state.pageNo = 1;
              onGetOrderList(state.menuValue, state.tab);
            },
            fail: () => {
              state.pageNo = 1;
              onGetOrderList(state.menuValue, state.tab);
            }
          });
        } else {
          showToast({ title: '支付失败', icon: 'error' });
        }
      });
    };
    const onDelete = (item)=>{
      if(item?.status !== 4 && item?.status !== 5){
        showToast({title: '只能删除关闭的订单或无效的订单',icon: 'none'});
        return;
      }
      const mapUrl = {
        0: `/api/order/modifyProductOrderDelete?id=${item?.orderSn}`,
        1: `/api/homeStay/modifyRoomOrderDelete?id=${item?.orderSn}`,
        2: `/api/cms/modifyTourisGuideOrderDelete?id=${item?.orderSn}`
      };
      showModal({
        title: '系统提示',
        content: '确认是否删除该订单',
        success: (data)=>{
          if(data?.confirm){
            http.get(mapUrl[state.menuValue])
              .then(()=>{
                showToast({title: '操作成功',icon: 'success'});
                state.pageNo = 1;
                onGetOrderList(state.menuValue, state.tab);
              });
          }
        }
      })
    };
    const onCancel = (item)=>{
      const mapUrl = {
        0: `/api/order/cancelOrder`,
        1: `/api/homeStay/cancelOrder`,
        2: `/api/cms/cancelOrder`
      };
      if(item?.status === 0){
        showModal({
          title: '系统提示',
          content: '是否取消订单',
          success: (data)=>{
            if(data?.confirm){
              http.post(mapUrl[state?.menuValue],{
                id: item?.orderSn,
                extend: {
                  type: 0
                }
              }).then(()=>{
                  showToast({title: '操作成功',icon: 'success'});
                  state.pageNo = 1;
                  onGetOrderList(state.menuValue, state.tab);
                });
            }
          }
        })
      }else if(item?.status === 1 || item?.status === 2 || item?.status === 3){
        pageToUrl(`/pages/order/cancelOrder/index?type=${state.menuValue}&orderNo=${item?.orderSn}&price=${item?.paymentAmount}`);
      }else{
        showToast({title: '订单不能被取消',icon: 'error'});
        return;
      }
    };
    useDidShow(() => {
      onGetOrderList(state.menuValue, state.tab);
    });
    return { ...toRefs(state), onCancel,onDelete,retryTread,getNumberOfDays, onActionsheet, onLower, onReturnApplyText, onConverDate, onRenderAttr, onTabs, pageToUrl };
  }
}
</script>