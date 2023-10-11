<template>
  <view class="index">
    优选专区
    <nut-button type="info" size="large" @click="pageToUrl('/pages/preferred/details/index')">提交</nut-button>
  </view>
</template>
<script>
import { pageToUrl } from '../../utils/utils';
import './index.scss';
import Taro from '@tarojs/taro';
export default{
  setup(){
    return {pageToUrl};
  }
}
</script>