import { defineStore } from 'pinia';
export const useCommonStore = defineStore('common',{
  state: ()=>{
    return {
      userInfo: null,
      address: {
        addressCode: '360925',
        city: '未知'
      },
      userAddress: {
        address: '选择收货地址',
        phoneNumber: '',
        name: ''
      }
    };
  },
  actions: {
    setUserInfo(userInfo){
      this.userInfo = userInfo;
    },
    setAddress(address){
      this.address = address;
    },
    setUserAddress(userAddress){
      this.userAddress = userAddress;
    }
  }
});