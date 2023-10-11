<template>
  <view class="index">
    <nut-cell-group>
      <nut-cell>
        <template v-slot:title>
          <view class="cancel-box">
            <view class="cancel-title">
              退款金额
            </view>
            <view class="cancel-content">
              <nut-price :price="routerParams?.price" position="after" symbol="元" />
            </view>
          </view>
        </template>
      </nut-cell>
      <nut-cell>
        <template v-slot:title>
          <view class="cancel-box">
            <view class="cancel-title">
              退还方式
            </view>
            <view class="cancel-content">
              <text class="text">原路退回</text>
              <text class="desc">(预计1-7个工作日到账)</text>
            </view>
          </view>
        </template>
      </nut-cell>
    </nut-cell-group>
    <nut-cell-group title="退款原因 (必选一项)">
      <nut-cell>
        <nut-radio-group v-model="cancelVal" text-position="left">
          <nut-radio :label="item" v-for="(item, index) in mapCancel[routerParams?.type]" :key="index">{{ item
          }}</nut-radio>
        </nut-radio-group>
      </nut-cell>
    </nut-cell-group>
    <nut-cell>
      <nut-textarea v-model="description" placeholder="请输入取消原因" limit-show max-length="200"  />
    </nut-cell>
    <view class="upload-box">
      <view v-if="cancelImg.length > 0">
        <view class="upload-item" v-for="(item, index) in cancelImg" :key="index">
          <img :src="item?.url" class="pre-img" />
        </view>
      </view>
      <view class="upload-item">
        <IconFont name="photograph" style="padding: 10px 5px;" @click="onChooseImage"></IconFont>
      </view>
    </view>
    <view class="footer">
      <view class="footer-btn">
        <nut-button type="primary" class="submit-btn" @click="onCancel">取消订单</nut-button>
      </view>
    </view>
  </view>
</template>
<script>
import './index.scss';
import { toRefs, reactive } from 'vue';
import Taro, { showModal, showToast } from '@tarojs/taro';
import { pageToUrl } from '../../../utils/utils';
import http from '../../../utils/http';
import { IconFont } from '@nutui/icons-vue-taro';
import { FormData } from '../../../utils/file/formData';
export default {
  components: {
    IconFont
  },
  setup() {
    const state = reactive({
      cancelVal: '买错了/买多了/不想买了',
      cancelImg: [],
      description: '',
      mapCancel: {
        0: ['买错了/买多了/不想买了', '计划有变，暂时不需要', '网上评价不好', '太贵了', '商品和图片不符', '味道不好', '其他理由'],
        1: ['到店民宿告知无房', '买错了/买多了/不想买了', '计划有变,没时间消费', '太贵了', '房间和图片不符', '网上评价不好', '预约时间太长,不想等了', '其他理由'],
        2: ['导游不专业', '买错了/买多了/不想买了', '价格不合理', '预约时间过长,不想等了', '导游迟到或毁约', '导游和图片不符合', '其他理由']
      },
      routerParams: Taro.getCurrentInstance()?.router?.params
    });
    const onChooseImage = () => {
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
              state.cancelImg = ff;
            });
        }
      });
    };
    const onCancel = () => {
      const mapUrl = {
        0: `/api/order/cancelOrder`,
        1: `/api/homeStay/cancelOrder`,
        2: `/api/cms/cancelOrder`
      };
      showModal({
        title: '系统提示',
        content: '确认是否取消订单',
        success: (data) => {
          if (data.confirm) {
            http.post(mapUrl[state?.routerParams?.type], {
              id: state?.routerParams?.orderNo,
              extend: {
                reason: state.cancelVal,
                description: state.description,
                proofPics: state.cancelImg.filter(f => f?.url).map(m => m?.url).join(','),
                type: 1
              }
            }).then(() => {
              showToast({ title: '操作成功', icon: 'success' });
              pageToUrl();
            });
          }
        }
      });
    };
    return { ...toRefs(state), onChooseImage, onCancel };
  }
}
</script>