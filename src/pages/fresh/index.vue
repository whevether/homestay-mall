<template>
  <view class="index">
    新鲜好物
    <nut-button type="info" size="large" @click="pageToUrl('/pages/fresh/details/index')">提交</nut-button>
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