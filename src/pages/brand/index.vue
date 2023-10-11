<template>
  <view class="index">
    品牌厂商
    <nut-button type="info" size="large" @click="pageToUrl('/pages/brand/details/index')">提交</nut-button>
  </view>
</template>
<script>
import { pageToUrl } from '../../utils/utils';
import './index.scss';
export default{
  setup(){
    return {pageToUrl};
  }
}
</script>