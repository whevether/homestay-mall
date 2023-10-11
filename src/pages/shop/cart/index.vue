<template>
  <view class="index">
    <nut-tabs v-model="selectKeys" title-scroll swipeable direction="vertical"
      v-if="menuData.length > 0"
      @click="(e) => onGetProductList(routerParams?.shopId, menuData[e?.paneKey].parentId == 0 ? menuData[e?.paneKey].parentId : menuData[e?.paneKey].id, cartData)">
      <nut-tab-pane v-for="(item, index) in menuData" :pane-key="index" :title="item?.name" :key="index">
        <view class="product-item" v-for="(data, key) in productList" :key="key" v-if="productList.length > 0">
          <nut-card :img-url="data?.pic" :title="data?.name" :price="data?.originalPrice" :vipPrice="data?.price"
            :shopDesc="`${data?.productCategoryName}`" :delivery="data.detailDesc" :shopName="data.shopName" @click="pageToUrl(`/pages/shop/product/index?id=${data?.id}&promotionType=${data?.promotionType}&shopId=${data?.shopId}`)">
            <template #prolist>
              <view class="search_prolist_attr" v-if="data?.serviceIds?.length > 0">
                <text class="word" v-for="(t, tkey) in data?.serviceIds" :key="tkey">{{ t }}</text>
              </view>
            </template>
            <template #footer>
              <view class="customize">
                <text v-if="data?.newStatus" class="text">新品</text>
                <text class="text" style>{{ data?.weight + 'kg' + '/' + data?.unit }}</text>
                <text class="text">销量:{{ data?.sale }}</text>
                <nut-input-number class="mt-5" :model-value="data?.quantity ?? 0" v-if="data?.skus?.length === 0" min="0"
                  max="1000" @change="(e,) => { joinCartItem(e, data, 'cart'); }" @click.stop/>
                <nut-input-number class="mt-5" :model-value="cartData?.list?.filter(f => f?.productId === data?.id)?.length > 1 ? cartData?.list?.filter(f => f?.productId === data?.id)?.reduce((preValue, curValue) => {
                  return preValue?.quantity + curValue?.quantity;
                }) : (data?.quantity ?? 0)" v-if="data?.skus?.length > 0 && data?.quantity > 0" min="0" max="1000"
                  @click.stop="onSelectSku(data)" />
                <nut-button class="mt-5" size="mini" type="info" v-if="data?.skus?.length > 0 && !data?.quantity"
                  @click.stop="onSelectSku(data)">商品规格</nut-button>
              </view>
            </template>
          </nut-card>
        </view>
        <view v-else>
          <nut-empty description="无数据"></nut-empty>
        </view>
      </nut-tab-pane>
    </nut-tabs>
    <view v-else>
      <nut-empty description="无数据"></nut-empty>
    </view>
    <nut-sku :visible="showSku" :sku="skuData" :goods="goods" :stepperMax="10000" :stepperMin="1" @overLimit="overLimit"
      :btnOptions="['buy', 'cart']" @selectSku="selectSku" style="height: auto;" @changeStepper="changeStepper"
      @clickBtnOperate="(e) => joinCartItem(count, goods, e?.type)"
      :stepperExtraText="() => `<view style='width:100%;text-align:right;color:#F00'>${startNum}件起售</view>`"></nut-sku>
    <view class="footer-cart">
      <view class="cart" @click="showCart = !showCart">
        <nut-badge :value="cartData?.totalCount ?? 0" class="cart-image">
          <img src="http://upapk.oss-cn-beijing.aliyuncs.com/img/6612e1ea84da4596369044004517218c.png" />
        </nut-badge>
        <view class="cart-price">
          <text class="total-cart-price">¥{{ cartData?.totalAmount ?? "0" }}元</text>
          <text class="total-cart-promotion ft-12">优惠金额 ¥{{ cartData?.totalPromotionAmount ?? "0" }}元</text>
        </view>
      </view>
      <nut-button type="info" shape="square" class="submit-btn" @click="onCheckCartValid">去支付</nut-button>
    </view>
    <nut-popup title class="cart-list" position="bottom" :style="{ height: '60%' }" :visible="showCart" :closeable="true"
      round :safe-area-inset-bottom="true" @click-close-icon="showCart = false" @click-overlay="showCart = false"
      close-icon-position="top-right">
      <view class="cart-info">
        <view class="cart-title">购物车列表</view>
        <view class="list" v-if="cartData?.list.length > 0">
          <view className="header-clear" @click="onClearCart(cartData?.list?.map(s => s?.id))">
            <Del2 />清空
          </view>
          <nut-swipe class="product-item" v-for="(data, key) in cartData?.list" :key="key">
            <nut-card :img-url="data?.productPic" :title="data?.productName" :price="data?.price"
              :shopDesc="`${data?.productBrand}`" :shopName="`${decodeURIComponent(data.shopName)}`" @click="pageToUrl('/pages/shop/cart/list/index')">
              <template #prolist>
                <view class="search_prolist_attr" v-if="data?.productAttr">
                  <text class="word" v-for="(it,ik) in JSON.parse(data?.productAttr)" :key="ik">{{ `${it?.key} : ${it?.value}` }}</text>
                </view>
              </template>
              <template #footer>
                <view class="customize"> <nut-input-number class="mt-5" :model-value="data?.quantity ?? 0" max="1000"
                    @change="(e) => { joinCartItem(e, { ...data, pic: data?.productPic, id: data?.productId, name: data?.productName, skus: data?.productAttr, skuId: data?.productSkuId, subTitle: data?.productSubTitle, brandName: data?.productBrand, publishStatus: true }, 'cart') }" />
                </view>
              </template>
            </nut-card>
            <template #right>
              <nut-button shape="square" style="height:100%" type="danger"
                @click="onClearCart([data?.id])">删除</nut-button>
            </template>
          </nut-swipe>
        </view>
        <nut-empty image="empty" description="购物车空空如也" v-else></nut-empty>
      </view>
    </nut-popup>
  </view>
</template>
<script>
import './index.scss';
import Taro, { useDidShow, showToast } from '@tarojs/taro';
import { reactive, toRefs } from 'vue';
import http from '../../../utils/http';
import { Del2 } from '@nutui/icons-vue-taro';
import { pageToUrl } from '../../../utils/utils';
export default {
  components: {
    Del2
  },
  setup() {
    const state = reactive({
      cartData: null,
      selectKeys: '0',
      menuData: [],
      skuData: [],
      productList: [],
      startNum: 1,
      count: 1,
      goods: {},
      showSku: false,
      showCart: false,
      routerParams: Taro.getCurrentInstance()?.router?.params
    })
    const onGetProductList = (shopId, categoryId, cart) => {
      http.post(`/api/product/getProductList`, {
        extends: { shopId: shopId, categoryId: categoryId }
      }).then(res => {
        if (cart?.list?.length > 0) {
          state.productList = res?.data.filter(f=>f?.publishStatus && f?.verifyStatus && !f?.deleteStatus).map(data => {
            let productData = cart.list.find(f => f.productId == data.id);
            if (productData) {
              data.quantity = productData.quantity;
            } else {
              data.quantity = 0;
            }
            return data;
          });
        } else {
          state.productList = res?.data.filter(f=>f?.publishStatus && f?.verifyStatus && !f?.deleteStatus);
        }
      });
    };
    const onGetProductCategory = (shopId, cart) => {
      http.post(`/api/product/getProductCategoryList`, {
        extends: { shopId: shopId }
      }).then(res => {
        state.menuData = res?.data ?? [];
        if (res?.data && res?.data?.length > 0) {
          onGetProductList(shopId, res?.data[0].parentId == 0 ? res?.data[0].parentId : res?.data[0].id, cart);
        }
      });
    };
    // 检查购物车是否符合提交要求
    const onCheckCartValid = () => {
      http.get(`/api/order/checkCartValid?id=${state?.routerParams?.shopId}`)
        .then(() => {
          pageToUrl(`/pages/shop/comfirOrder/index?shopId=${state?.routerParams?.shopId}&shopName=${state?.routerParams?.shopName}`);
        });
    };
    //获取购物车列表
    const onGetCartItemList = (shopId) => {
      http.get(`/api/order/getCartItemList?id=${shopId}`)
        .then(res => {
          state.cartData = res;
          onGetProductCategory(shopId, res);
        });
    };
    const onSelectSku = (productData) => {
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
              skuId: item?.id,
              id: item?.id,
              name: sp?.value,
              pic: item?.pic,
              price: item?.price,
              active: state.goods?.skus?.id === item?.id,
              disable: false
            });
          // }
        }
      }
      console.log(groups);
      let arr = [];
      Object.keys(groups).forEach((key, index) => {
        let list = groups[key];
        arr.push({
          id: index+1,
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
    // 切换规格类目
    const selectSku = (ss) => {
      const { sku, skuIndex, parentSku, parentIndex } = ss;
      // if (sku.disable) return false;
      //  state.skuData[parentIndex].list.forEach((s) => {
      //   s.active = s.id == sku.id;
      // });
      state.skuData.map((item)=>{
        item.list = item?.list?.map(data=>{
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
    const changeStepper = (e) => {
      state.count = e;
    };
    const joinCartItem = (count, item, type) => {
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
        state.productList = state.productList.map(data => {
          if (data.id === item.id) {
            data.quantity = count;
          }
          return data;
        });
        if (type === 'cart') {
          showToast({ title: '加入购物车成功' });
        }
        if (type == 'buy') {
          onCheckCartValid();
        }
      });
    };
    const onClearCart = (ids) => {
      if (ids.length === 0) {
        showToast({ title: '购物车是空的', icon: 'error' });
        return;
      }
      http.post('/api/order/deleteCartItem', { id: ids })
        .then(() => {
          showToast({ title: '清空成功' });
          state.showCart = false;
          onGetCartItemList(state?.routerParams?.shopId);
        });
    };
    useDidShow(() => {
      onGetCartItemList(state?.routerParams?.shopId);
    });
    return { ...toRefs(state), pageToUrl, onCheckCartValid, onSelectSku, overLimit, selectSku, joinCartItem, changeStepper, onGetProductList, onClearCart };
  }
}
</script>