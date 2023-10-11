<template>
  <view class="index">
    我的积分
  </view>
</template>
<script>
import { pageToUrl } from '../../../utils/utils';
import './index.scss';
import Taro from '@tarojs/taro';
export default{
  setup(){
    return {pageToUrl};
  }
}
</script>