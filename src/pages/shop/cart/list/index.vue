<template>
  <view class="index">
    <nut-sticky>
      <view class="cart-header">
        <img :src="cartLogo" class="cart-logo" />
        <nut-button
          type="default"
          size="small"
          @click="cartManage = !cartManage"
          >{{ cartManage ? "取消" : "管理" }}</nut-button
        >
      </view>
    </nut-sticky>
    <view class="cart-wrapper">
      <view class="cart-item" v-for="(item, index) in cartList" :key="index">
        <nut-checkbox
          :indeterminate="item.indeterminate"
          class="check-all"
          :modelValue="item.checkList.length > 0 ? true : false"
          @click="onOrderChange(item)"
        >
          <view class="box">
            <text class="title">{{ item?.title }}</text>
            <text class="order-no">订单号: 1515151515151511</text>
          </view></nut-checkbox
        >
        <nut-checkbox-group
          v-model="item.checkList"
          class="group"
          @click.stop
          @change="(e) => onOrderItemChange(e, item)"
        >
          <nut-checkbox
            class="check-item"
            :label="data.id"
            v-for="(data, key) in item?.orderItem"
            :key="key"
          >
            <view class="box">
              <view class="left">
                <img
                  src="//img10.360buyimg.com/n2/s240x240_jfs/t1/210890/22/4728/163829/6163a590Eb7c6f4b5/6390526d49791cb9.jpg!q70.jpg"
                  class="cart-img"
                />
              </view>
              <view class="right">
                <view class="order-title"> 广西百色市桂七芒果 </view>
                <view class="order-attr"> 中果5斤，单果150g起 </view>
                <view class="order-footer">
                  <view class="price">
                    <nut-price
                      :price="999"
                      size="large"
                      need-symbol
                      decimal-digits="2"
                      thousands
                      style="margin-right: 5px"
                    />
                    <nut-price
                      style="color: #999"
                      :price="1100"
                      decimal-digits="2"
                      need-symbol
                      thousands
                      strike-through
                    />
                  </view>
                  <view class="num">
                    <nut-input-number v-model="data.number" @click.stop/>
                  </view>
                </view>
              </view>
            </view>
          </nut-checkbox>
        </nut-checkbox-group>
      </view>
    </view>
    <view class="footer">
      <view class="cart-submit">
        <view class="left">
          <nut-checkbox
            class="cart-all"
            @click="onAllCart"
            :modelValue="onIsAllCart() > 0"
          >
            全选
          </nut-checkbox>
          <view class="total-price" v-if="!cartManage">
            <text class="price-text">合计: </text>
            <nut-price
              :price="999"
              need-symbol
              decimal-digits="2"
              thousands
              style="margin-left: 5px"
            />
          </view>
          <view class="total-price" v-if="cartManage">
            <text class="price-text">共</text>
            <nut-price
              :price="onIsAllCart()"
              :need-symbol="false"
              decimal-digits="2"
              style="margin: 0px 5px"
            />
            <text class="price-text">件商品</text>
          </view>
        </view>
        <view class="right">
          <nut-button color="linear-gradient(to right, #ff6034, #ee0a24)">{{
            cartManage ? "删除" : "结算"
          }}</nut-button>
        </view>
      </view>
    </view>
  </view>
</template>
<script>
import "./index.scss";
import { toRefs, reactive } from "vue";
import { pageToUrl } from "../../../../utils/utils";
export default {
  setup() {
    const state = reactive({
      cartManage: false,
      cartLogo: 'http://upapk.oss-cn-beijing.aliyuncs.com/img/6612e1ea84da4596369044004517218c.png',
      cartList: [
        {
          id: "1233",
          indeterminate: false,
          orderNo: "151515151515",
          title: "兑换区",
          checkList: [],
          orderItem: [
            {
              orderId: "1233",
              id: "1",
              img: "//img10.360buyimg.com/n2/s240x240_jfs/t1/210890/22/4728/163829/6163a590Eb7c6f4b5/6390526d49791cb9.jpg!q70.jpg",
              price: "388",
              vipPrice: "378",
              number: 1,
              title: "活蟹】湖塘煙雨 阳澄湖大闸蟹公4.5两 母3.5两 4对8只",
            },
            {
              orderId: "1233",
              id: "2",
              img: "//img10.360buyimg.com/n2/s240x240_jfs/t1/210890/22/4728/163829/6163a590Eb7c6f4b5/6390526d49791cb9.jpg!q70.jpg",
              price: "388",
              vipPrice: "378",
              number: 1,
              title: "活蟹】湖塘煙雨 阳澄湖大闸蟹公4.5两 母3.5两 4对8只",
            },
          ],
        },
        {
          id: "1234",
          orderNo: "151515151515",
          title: "兑换区",
          indeterminate: false,
          checkList: [],
          orderItem: [
            {
              orderId: "1234",
              id: "3",
              img: "//img10.360buyimg.com/n2/s240x240_jfs/t1/210890/22/4728/163829/6163a590Eb7c6f4b5/6390526d49791cb9.jpg!q70.jpg",
              price: "388",
              vipPrice: "378",
              number: 1,
              title: "活蟹】湖塘煙雨 阳澄湖大闸蟹公4.5两 母3.5两 4对8只",
            },
          ],
        },
      ],
    });
    const onOrderChange = (item) => {
      state.cartList = state.cartList.map((data) => {
        if (item.id === data.id) {
          if (data?.checkList?.length === 0) {
            data.checkList = data.orderItem.map((ii) => ii.id);
          } else {
            data.checkList = [];
          }
        }
        return data;
      });
    };
    const onOrderItemChange = (e, item) => {
      state.cartList = state.cartList.map((data) => {
        if (item.id === data.id) {
          data.checkList = e;
          if (data?.orderItem?.length === e?.length) {
            data.indeterminate = false;
          } else if (data?.orderItem?.length != e?.length && e?.length > 0) {
            data.indeterminate = true;
          } else if (e?.length === 0) {
            data.indeterminate = false;
          }
        }
        return data;
      });
    };
    const onIsAllCart = () => {
      let count = state.cartList.reduce(
        (preVal, nextVal) =>
          preVal?.checkList?.length + nextVal?.checkList.length
      );
      return count;
    };
    const onAllCart = () => {
      if (onIsAllCart() === 0) {
        state.cartList = state.cartList.map((item) => {
          item.checkList = item.orderItem.map((ii) => ii.id);
          return item;
        });
      } else {
        state.cartList = state.cartList.map((item) => {
          item.checkList = [];
          return item;
        });
      }
    };
    return {
      pageToUrl,
      onOrderChange,
      onOrderItemChange,
      onAllCart,
      onIsAllCart,
      ...toRefs(state),
    };
  },
};
</script>
