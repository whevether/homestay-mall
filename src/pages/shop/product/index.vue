<template>
  <view class="product-details">
    <nut-swiper init-page="1" :pagination-visible="true" pagination-color="#426543" auto-play="3000"
      v-if="details?.albumPics?.length > 0">
      <nut-swiper-item v-for="(item, key) in details?.albumPics" :key="key">
        <img :src="item" alt="" mode="aspectFill" />
      </nut-swiper-item>
    </nut-swiper>
    <nut-cell-group>
      <nut-cell>
        <template v-slot:title>
          <view class="left">
            <view class="text-h3">
              {{ details?.name }}
            </view>
            <view class="sub-box">
              <view class="sub-title">
                {{ details?.subTitle }}
              </view>
              <view class="box">
                <nut-input-number class="mt-5" :model-value="details?.quantity ?? 0" v-if="details?.skus?.length === 0"
                  min="0" max="1000" @change="(e) => { joinCartItem(e, details, 'cart') }" />
                <nut-input-number class="mt-5" :model-value="cartData?.list?.filter(f => f?.productId === details?.id)?.length > 1 ? cartData?.list?.filter(f => f?.productId === details?.id)?.reduce((preValue, curValue) => {
                  return preValue?.quantity + curValue?.quantity;
                }) : (details?.quantity ?? 0)" v-if="details?.skus?.length > 0 && details?.quantity > 0" min="0"
                  max="1000" @click.stop="onSelectSku(details)" />
                <nut-button class="mt-5" size="mini" type="info" v-if="details?.skus?.length > 0 && !details?.quantity"
                  @click.stop="onSelectSku(details)">商品规格</nut-button>
              </view>
            </view>
            <view class="item" v-if="details?.serviceIds?.length > 0">
              <nut-tag type="primary" v-for="(item, index) in details?.serviceIds" :key="index">{{ item }}</nut-tag>
            </view>
            <view class="rate">
              <nut-price :price="details?.price" size="normal" need-symbol />
              <nut-price :price="details?.originalPrice" :decimal-digits="0" size="normal" need-symbol thousands
                strike-through style="color:#999; margin-left: 5px;" />
            </view>
            <view class="product-info">
              <view class="product-info-item">
                <text>销量</text>
                <text>{{ details?.sale }}</text>
              </view>
              <view class="product-info-item">
                <text>说明</text>
                <text>{{ details?.note }}</text>
              </view>
              <view class="product-info-item">
                <text>单位</text>
                <text>{{ details?.unit }}</text>
              </view>
            </view>
          </view>
        </template>
      </nut-cell>
      <nut-cell title="商品参数" is-link @click="showPop = 0"></nut-cell>
      <nut-cell title="优惠券" is-link @click="showPop = 1" desc="领取优惠券"></nut-cell>
      <nut-cell is-link>
        <template v-slot:title>
          <view class="proment">
            <view class="title">促销活动</view>
            <view>{{ mapTypeText[details?.promotionType] }}</view>
            <view :key="index" v-for="(item, index) in details?.memberPriceTables">
              {{ `${item?.memberLevelName}会员价${item?.memberPrice}元` }}</view>
            <view :key="index" v-for="(item, index) in details?.productFullReductions">
              {{ `满${item?.fullPrice}元减${item?.reducePrice}元` }}</view>
            <view :key="index" v-for="(item, index) in details?.productLadders">{{ `满${item?.count}件打${(item?.discount *
              1).toFixed(1)}折或减${item?.price}元` }}</view>
          </view>
        </template>
      </nut-cell>
      <nut-cell title="服务说明" is-link :desc="details?.serviceIds?.join(',')"></nut-cell>
      <nut-cell is-link>
        <template v-slot:title>
          <view class="banner"><text class="banner-title">品牌 </text> <img class="banner-logo"
              :src="details?.brand?.logo ?? 'http://upapk.oss-cn-beijing.aliyuncs.com/img/e4858cf48a8c9c7757b27474542206b9.png'" />
            <text class="banner-name">{{ details?.brand?.name }}</text>
          </view>
        </template>
      </nut-cell>
    </nut-cell-group>
    <nut-tabs v-model="tab" @click="onTabs">
      <nut-tab-pane title="商品详情">
        <scroll-view :scroll-y="true" style="height: 100vh;" v-html="details?.detailHtml"
          class="scroll-list"></scroll-view>
      </nut-tab-pane>
      <nut-tab-pane title="图文介绍">
        <scroll-view :scroll-y="true" style="height: 100vh;" class="scroll-list">
          <view class="box" v-for="(item, index) in details?.albumPics" :key="index">
            <video class="video" initial-time="0" :src="item" :controls="true" v-if="item?.includes('.mp4')"
              :autoplay="false" :loop="false" :muted="false"></video>
            <img :src="item" class="img" mode="aspectFill" v-else />
          </view>
        </scroll-view>
      </nut-tab-pane>
      <nut-tab-pane title="评价">
        <scroll-view :scroll-y="true" @scrolltolower="onLower" class="index">
          <nut-cell style="margin-bottom: 0px;" :title="`用户评价(${commentList.length})`" is-link="true"></nut-cell>
          <view class="cooment-list" v-if="commentList.length > 0">
            <nut-comment imagesRows="multi" :images="item.images" :info="item.info" ellipsis="6" :operation="['replay']"
              @clickImages="onClickImages" v-for="(item, index) in commentList" :key="index">
            </nut-comment>
          </view>
          <nut-empty description="无数据" v-else></nut-empty>
        </scroll-view>
      </nut-tab-pane>
    </nut-tabs>
    <nut-sku :visible="showSku" :sku="skuData" :goods="goods" :stepperMax="10000" :stepperMin="1" @overLimit="overLimit"
      :btnOptions="['buy', 'cart']" @selectSku="selectSku" style="height: auto;" @changeStepper="changeStepper"
      @clickBtnOperate="(e) => joinCartItem(count, goods, e?.type)"
      :stepperExtraText="() => `<view style='width:100%;text-align:right;color:#F00'>${startNum}件起售</view>`"></nut-sku>
    <nut-popup :style="{ height: '50%' }" position="bottom" closeable round :visible="showPop != -1"
      @click-overlay="showPop = -1" @click-close-icon="showPop = -1">
      <view class="params-body" v-if="showPop === 0">
        <view class="title">
          商品参数
        </view>
        <nut-cell-group v-if="details?.attrs?.length > 0">
          <nut-cell :title="`${item?.name} : ${item?.attrValue?.find(f => f?.productId === details?.id)?.value}`"
            v-for="(item, index) in details?.attrs" :key="index"></nut-cell>
        </nut-cell-group>
        <nut-empty description="无数据" v-else></nut-empty>
      </view>
      <view class="coupon-body" v-if="showPop === 1">
        <view class="title">
          优惠券
        </view>
        <view class="coupon-box" v-if="details?.coupons?.length > 0">
          <view class="coupon-item"
            v-for="(item, index) in details?.coupons?.filter(s => s?.platform === 0 || s?.platform === 1)" :key="index"
            @click="onAddUserCardBag(item.id)">
            <view class="coupon-left">
              <view class="coupon-title">{{ item?.name }}</view>
              <view class="coupon-time">{{ `有效时间至: ${onConverTime(item?.endTime?.seconds)}` }}</view>
              <view class="coupon-text">{{ `${mapText[item?.useType]}` }}</view>
            </view>
            <view class="coupon-right">
              <view class="coupon-price">
                <nut-price :price="item?.amount" size="normal" :need-symbol="false" />
              </view>
              <view class="coupon-text">{{ item?.minPoint === 0 ? '无门槛' : `满${item?.minPoint}元可用` }}</view>
              <view class="coupon-text">{{ mapTypeText[item?.type] }}</view>
            </view>
          </view>
        </view>
        <nut-empty description="无数据" v-else></nut-empty>
      </view>
    </nut-popup>
    <view class="footer">
      <view class="footer-icon" @click="onAddColl">
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
        <nut-button type="info" class="submit-btn" @click="onCheckCartValid()">去支付</nut-button>
      </view>
    </view>
  </view>
</template>
<script>
import './index.scss';
import Taro, { useDidShow, showToast } from '@tarojs/taro';
import { IconFont } from '@nutui/icons-vue-taro';
import { reactive, toRefs } from 'vue';
import http from '../../../utils/http';
import dayjs from 'dayjs';
import { pageToUrl } from '../../../utils/utils';
export default {
  components: {
    IconFont
  },
  setup() {
    const state = reactive({
      details: null,
      collection: null,
      startNum: 1,
      skuData: [],
      cartData: null,
      goods: {},
      showSku: false,
      showPop: -1,
      mapText: {
        0: '全场通用',
        1: '指定类型可用',
        2: '指定商品可用'
      },
      mapTypeText: {
        0: '全场赠券',
        1: '会员赠券',
        2: '购物赠券',
        3: '注册赠券'
      },
      tab: 0,
      pageNo: 1,
      commentList: [],
      finished: false,
      routerParams: Taro.getCurrentInstance()?.router?.params
    });
    const onShowColl = (type, id) => {
      let params = `&path=/shop/details&params=?shopId=${id}`;
      http.get(`/api/user/showUserCollectionBrowse?type=${type}${params}`)
        .then(res => {
          state.collection = res;
        });
    };

    const onAddColl = (type, data) => {
      http.post(`/api/user/addUserCollectionBrowse`, {
        name: data?.name,
        params: `?productId=${state?.routerParams?.id}&shopId=${state?.routerParams?.shopId}&promotionType=${state?.routerParams?.promotionType}`,
        path: "/shop/product/",
        pic: data?.pic,
        price: data?.price,
        type: type,
      }).then(() => {
        onShowColl(type, state?.routerParams?.shopId);
      });
    };
    const onGetDetails = (id, promotionType, cart) => {
      http.get(`/api/product/showProduct?id=${id}&promotionType=${promotionType}`)
        .then(res => {
          onAddColl(1, res);
          state.details = { ...res, quantity: 0 };
          if (cart?.list?.length > 0) {
            let productData = cart.list.find(f => f.productId == res.id);
            if (productData) {
              state.details = { ...res, quantity: productData?.quantity };
            }
          }
        });
    };
    // 检查购物车是否符合提交要求
    const onCheckCartValid = () => {
      http.get(`/api/order/checkCartValid?id=${state?.routerParams?.shopId}`)
        .then(() => {
          pageToUrl(`/pages/shop/comfirOrder/index?shopId=${state?.details?.shopId}&shopName=${state?.details?.shopName}`);
        });
    };
    const onConverTime = (time) => {
      return dayjs.unix(time).format('YYYY-MM-DD HH:mm');
    };
    const joinCartItem = (count, item, type) => {
      if (!item?.publishStatus && type == 'cart') {
        showToast({ title: '商品已经下架了,无法购买', icon: 'error' });
        return;
      }
      http.post('/api/order/joinCartItem', {
        "productSkuId": item?.skuId ?? '0',
        "quantity": count,
        "productCategoryId": item.productCategoryId ?? '0',
        "productId": item.id ?? '0',
        "productPic": item.pic,
        "productName": item.name,
        "productSubTitle": item.subTitle,
        "productBrand": item.brandName,
        "productSn": item.productSn,
        "productAttr": (item?.skus && typeof item?.skus !== 'string') ? JSON.stringify(item?.skus?.spData) : item?.skus
      }).then(res => {
        state.cartData = res;
        state.details = { ...state.details, quantity: count };
        if (type === 'cart') {
          showToast({ title: '加入购物车成功' });
        }
        if (type == 'buy') {
          onCheckCartValid();
        }
      });
    };
    const changeStepper = (e) => {
      state.count = e;
    };
    // 切换规格类目
    const selectSku = (ss) => {
      const { sku, skuIndex, parentSku, parentIndex } = ss;
      if (sku.disable) return false;
      // state.skuData[parentIndex].list.forEach((s) => {
      //   s.active = s.id == sku.id;
      // });
      state.skuData.map((item) => {
        item.list = item?.list?.map(data => {
          data.active = data?.id == sku?.id;
          return data;
        });
        return item;
      });
      state.goods = {
        ...sku.productData,
        skus: sku.skus,
        skuId: sku?.skuId,
        price: sku?.price,
        imagePath: sku?.pic
      };
    };
    const onAddUserCardBag = (id) => {
      http.post('/api/user/addUserCardBag', { id: id })
        .then(() => {
          showToast({ title: '领取成功' });
          state.showPop = -1;
        });
    };
    const onSelectSku = (productData) => {
      if (!productData?.publishStatus) {
        showToast({ title: '商品已经下架了,无法购买', icon: 'error' });
        return;
      }
      // let minPurchase = productData?.minPurchase % 2 === 0 ? productData?.minPurchase / 2 : 1;
      state.startNum = productData?.minPurchase;
      let groups = {};
      for (let index in productData?.skus) {
        let item = productData?.skus[index];
        if (index == 0) {
          state.goods = {
            ...productData,
            skus: item,
            skuId: item?.id,
            id: item?.id,
            price: item?.price,
            imagePath: item?.pic
          };
        }
        for (let sp of item.spData) {
          let value = sp['key'];
          groups[value] = groups[value] || [];
          // if(!groups[value].find(f=>f.name === sp.value)){
          groups[value].push({
            productData: productData,
            skus: item,
            id: item?.id,
            skuId: item?.id,
            name: sp?.value,
            pic: item?.pic,
            price: item?.price,
            active: state.goods?.skus?.id === item?.id,
            disable: false
          });
          // }
        }
      }
      let arr = [];
      Object.keys(groups).forEach((key, index) => {
        let list = groups[key];
        arr.push({
          id: index,
          name: key,
          list: list
        });
      });
      state.skuData = arr;
      state.showSku = !state.showSku;
    };
    // inputNumber 极限值
    const overLimit = (val) => {
      if (val.action == 'reduce') {
        showToast({ title: `至少买${state.startNum}件哦` });
      } else {
        showToast({ title: `最多买${val.value}件哦` });
      }
    };
    //获取购物车列表
    const onGetCartItemList = (shopId) => {
      http.get(`/api/order/getCartItemList?id=${shopId}`)
        .then(res => {
          state.cartData = res;
          onGetDetails(state?.routerParams?.id, state?.routerParams?.promotionType, res);
        });
    };
    const onGetProductComment = () => {
      http.post('/api/product/getProductCommentList', {
        pageNo: state.pageNo, pageSize: 10, extends: { shopId: state?.routerParams?.shopId }
      }).then(res => {
        let mapList = res?.data.map(item => {
          item.images = [];
          for (let p of item?.pics) {
            item.images.push({
              "smallImgUrl": "",
              "bigImgUrl": "",
              "imgUrl": p
            });
          }
          item.info = {
            content: item?.content,
            nickName: item?.memberNickName,
            score: item?.star,
            avatar: item?.memberIcon,
            time: dayjs.unix(item?.createTime?.seconds).fromNow(),
            replay: item?.replayCount,
          };
          return item;
        });
        let list = state.pageNo == 1 ? mapList : [...state.commentList.concat(mapList)];
        state.commentList = list;
        if (list.length >= res?.totalCount) {
          state.finished = true;
        } else {
          state.pageNo = ++state.pageNo;
        }
      });
    };
    const onLower = () => {
      if (!state.finished) {
        onGetProductComment();
      }
    };
    const onTabs = (e)=>{
      if(e?.paneKey === '2'){
        onGetProductComment();
      }
    };
    useDidShow(() => {
      onGetCartItemList(state?.routerParams?.shopId);
    });
    return { ...toRefs(state),onTabs, onLower,onCheckCartValid, onConverTime, onAddColl, changeStepper, onSelectSku, selectSku, overLimit, onAddUserCardBag, joinCartItem };
  }
}
</script>