const getBaseUrl = () => {
  let BASE_URL = '';
  if (process.env.NODE_ENV === 'development') {
    //开发环境 - 根据请求不同返回不同的BASE_URL
    BASE_URL = 'http://localhost:5300'
  } else {
    BASE_URL = 'https://api.zytravel.shop'
  }
  return BASE_URL
}
export default getBaseUrl;