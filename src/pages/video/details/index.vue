<template>
  <view class="video-details" v-if="details">
    <video class="video" :src="details?.videoUrl" :poster="details?.videoPic" initial-time="0" :controls="true"
      :autoplay="false" :loop="false" :muted="false" v-if="details?.isShow !== 0" />
    <nut-cell :title="('用户评价 ' + details?.comment.length ?? 0)" is-link></nut-cell>
    <view class="comment-list">
      <view class="comment-item" v-for="(item, index) in details?.comment" :key="index">
        <view class="left">
          <nut-avatar size="normal" shape="round">
            <img :src="item?.memberAvatar" />
          </nut-avatar>
        </view>
        <view class="right">
          <view class="comment-header">
            <view class="header-item">
              <h6 class="comment-username m0">{{ item?.memberName }}</h6>
              <Rate defaultValue="5" allowHalf readonly color="#ffcc00" size="14" />
            </view>
            <span class="comment-time">{{ onRenderTime(item?.createTime?.seconds) }}</span>
          </view>
          <p class="m0 comment-content">{{ item?.content }}</p>
          <view class="comment-images">
            <img style="width:80px;height: 80px;margin-left: 5px;" @tap="onPreImage(data, item?.pic)" :src="data"
              v-for="(data, key) in item?.pic" :key="key" />
          </view>
        </view>
      </view>
    </view>
    <view class="commit-input" id="popid">
      <nut-input v-model="commitText" placeholder="请输入评论内容" :clearable="true" :border="false">
      </nut-input>
      <nut-button size="small" type="primary" @click="onSubmitCommit" :disabled="isUpload">发送</nut-button>
      <IconFont name="photograph" style="padding: 10px 5px;" @click="onChooseImage"></IconFont>
    </view>
    <nut-popover :visible="showPopover" location="top-end" custom-class="pre-popover" targetId="popid">
      <template #content>
        <view class="pre-image">
          <img  @tap="onPreImage(data, commitUrl)" :src="data"
            v-for="(data, key) in commitUrl" :key="key" class="img"/>
        </view>
      </template>
    </nut-popover>
  </view>
</template>
<script>
import './index.scss';
import http from '../../../utils/http';
import { reactive, toRefs } from 'vue';
import Taro, { useDidShow, showToast } from '@tarojs/taro';
import { FormData } from '../../../utils/file/formData';
import dayjs from 'dayjs';
import { IconFont } from '@nutui/icons-vue-taro';
export default {
  name: 'videoDetails',
  components: {
    IconFont
  },
  setup() {
    const state = reactive({
      details: null,
      commitText: '',
      routerParams: Taro.getCurrentInstance()?.router?.params,
      commitUrl: [],
      isUpload: false,
      showPopover: false
    });
    const onGetDetails = () => {
      http.get(`/api/cms/showVideo?id=${state?.routerParams?.id}`)
        .then(res => {
          state.details = res;
        });
    };
    const onPreImage = (current, url) => {
      Taro.previewImage({
        current: current,
        urls: url
      });
    };
    const onRenderTime = (time) => {
      return dayjs.unix(time).fromNow();
    };
    const onChooseImage = () => {
      state.isUpload = true;
      Taro.chooseMedia({
        count: 9,
        mediaType: ['image', 'video'],
        sourceType: ['album', 'camera'],
        maxDuration: 30,
        camera: 'back',
        success: (res) => {
          let data = FormData();
          data.append('type', 'img');
          res.tempFiles.forEach(file => {
            data.appendFile('files', file.tempFilePath, file.name);
          });
          let file = data.getData();
          http.post('/upload/index', file.buffer, file.contentType)
            .then(ff => {
              state.isUpload = false;
              let arr = ff.map(item => item?.url);
              state.commitUrl = arr;
              setTimeout(()=>{
                state.showPopover = true;
              },300);
            });
        }
      });
    };
    const onSubmitCommit = () => {
      if (!state.commitText) {
        showToast({
          title: '请输入评论内容分'
        });
        return;
      }
      http.post('/api/cms/addVideoAndHelpComment', {
        content: state.commitText,
        pic: state.commitUrl.join(','),
        type: 1,
        detailsId: state?.routerParams?.id
      }).then(() => {
        showToast({
          title: '评论成功'
        });
        state.showPopover = false;
        state.commitUrl = [];
        state.commitText = '';
        onGetDetails();
      });
    };
    useDidShow(() => {
      onGetDetails();
    });

    return { ...toRefs(state), onPreImage, onRenderTime, onChooseImage, onSubmitCommit };
  }
}
</script>