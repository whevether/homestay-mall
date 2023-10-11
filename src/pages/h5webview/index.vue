<template>
  <web-view :src="url" />
</template>

<script>
import './index.scss';
import {useLoad } from "@tarojs/taro";
import {reactive,toRefs} from 'vue';
export default {
  name: 'h5webview',
  components: {
  },
  setup(){
    const state = reactive({
      url: ''
    });
    useLoad((options)=>{
      state.url = decodeURIComponent(options?.redirectUrl);
    });
    return {
      ...toRefs(state)
    };
  }
}
</script>
