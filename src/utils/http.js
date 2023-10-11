import Taro,{showLoading} from '@tarojs/taro';
import getBaseUrl from './baseUrl';
import interceptors from './interceptors';
import {localStorageGet} from './utils';
if (Taro.getEnv() !== Taro.ENV_TYPE.WEB) {
  interceptors.forEach(interceptorItem => Taro.addInterceptor(interceptorItem));
}

class httpRequest {
  baseOptions(params = { url: '', data: null }, method = 'GET') {
    const pubkey = localStorageGet('pubkey');
    const tokenType = localStorageGet('tokenType');
    const token = localStorageGet('token');
    let { url, data } = params;
    const BASE_URL = getBaseUrl();
    let contentType = params.contentType ?? 'application/json';
    const option = {
      url: BASE_URL + url,
      data: data,
      mode: 'cors',
      method: method,
      header: pubkey ? {
        'content-type': contentType,
        'Authorization': `${tokenType} ${token}`,
        'appKey': pubkey?.appKey,
        'sign': pubkey?.sign,
        'time': pubkey?.timestamp
        // 'Authorization': `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoia2VlcC53YW4lZjAlOWYlOGMlODglZjAlOWYlOGQlYWQiLCJyb2xlIjoic3VwZXJhZG1pbiIsInRlbHBob25lIjoiODYrMTU1NzU4NjcxNTkiLCJzdWIiOiIxIiwiYXV0aF9tb2RlIjoid3hfc21hbGwiLCJ0ZW5hbmN5X2lkIjoiMSIsIm5iZiI6MTY1NDc1NjE4NiwiZXhwIjoxNjU3Mzc2OTg2LCJpYXQiOjE2NTQ3ODQ5ODYsImlzcyI6ImRvbmdzaGkiLCJhdWQiOiJkb25nc2hpIn0.WnHlz-zpnTK4Ug7_-fwjZkqbbdt8snBBkJMZm98ZijpFufl7A2lwGvabvsp1s3L19GoXZHfxDoiiU6hxSIYx_QTRH6JsWUPHPUjOWgyxXUWbQBbvMXDr1wxmnoU4Q1wqNcve3QtGvDL79jYqbAqIQNxHKJYNQZWFGgi6HasV-iJUCwBB0jaiB4E6D-BOlSvkd06QYOvS0WTPUj0wCfPGonZ45t6UajAj-kFcSRzn54BDzBIf4SnxakeyPg-G6ZRoxYi7FrwIPZne6xw8e4fHqvB4RU8bXGItn7ML9ePaRGc7d6Jmn_7XtS1lbmyd8PEqheooAlNTOOmCrEKy_pKe-Q`
      } : {
        'content-type': contentType
      } 
    };
    showLoading({
      title: '加载中',
    });
    return Taro.request(option);
  }

  get(url, data = "") {
    let option = { url, data };
    return this.baseOptions(option);
  }

  post(url, data, contentType) {
    let params = { url, data, contentType };
    return this.baseOptions(params, "POST");
  }

  put(url, data) {
    let option = { url, data };
    return this.baseOptions(option, "PUT");
  }

  delete(url, data) {
    let option = { url, data };
    return this.baseOptions(option, "DELETE");
  }

}

export default new httpRequest()