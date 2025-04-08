<template>
  <view class="container">
    <!-- 按钮区域 -->
    <view class="btn-box">
      <button class="btn" @click="goToChat" >聊天</button>
      <button class="btn" @click="goToRecords">转账记录</button>
    </view>
	<ProfileEditPopup ref="filePopup"  @submit="onSubmit"></ProfileEditPopup>
  </view>
</template>

<script>
import ProfileEditPopup from "../../components/ProfileEditPopup/ProfileEditPopup.vue"

import { getUserInfo,updateUseFeature } from '@/api/index.js'
export default {
  components:{
	  ProfileEditPopup
  },
  data(){
	  return {
		  guestInfo:{},
		  
	  }
  },
  onLoad(){
	  const userId = uni.getStorageSync('userId')
	  // 查询用户使用次数 以及是否是VIP
	  
	    this.getUserInfo(userId)
  },
  methods: {
 
	async getUserInfo(userId){
	  const res = await getUserInfo(userId)
	  this.guestInfo = res.data
	  console.log(res);
	},
	
    goToChat() {
	 if(this.guestInfo.tryCount == 0){
		 if(!this.guestInfo.isMember){
			 // 试用次数用完后开始需要充值会员
			  uni.showToast({
			    title: '使用次数已用完请充值会员',
			    icon: 'none'
			  });
			  return
		 }
	 }
	  this.$refs.filePopup.open()
     
    },
	onSubmit(data){
	updateUseFeature(this.guestInfo.id)
		uni.navigateTo({
		  url: '/pages/chat/chat?guestInfo=' + encodeURIComponent(JSON.stringify(data))
		});
	},
    // 跳转到转账记录页面
    goToRecords() {
	// 试用次数用完后开始需要充值会员
	// uni.requestPayment({
	//   provider: 'alipay',
	//   orderInfo: orderStr, // 来自后端接口返回的字符串
	//   success: function (res) {
	//     uni.showToast({ title: '支付成功' });
	//     // 你可以在这里刷新用户会员状态
	//   },
	//   fail: function (err) {
	//     console.log('支付失败', err);
	//     uni.showToast({ title: '支付失败', icon: 'none' });
	//   }
	// });
	if(this.guestInfo.tryCount == 0){
			 if(!this.guestInfo.isMember){
				 // 试用次数用完后开始需要充值会员
				  uni.showToast({
				    title: '使用次数已用完请充值会员',
				    icon: 'none'
				  });
				  return
			 }
	  }
	  // 减少使用次数
	  updateUseFeature(this.guestInfo.id)
      uni.navigateTo({
        url: '/pages/records/records'
      });
    }
  }
};
</script>

<style>
/* 页面布局样式 */
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  flex-direction: column;
  background-color: #f5f5f5;
}

/* 按钮区域 */
.btn-box {
  width: 80%;
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
.btn {
  width: 45%;
  padding: 12px;
  background-color: #007AFF;
  color: #fff;
  border-radius: 5px;
  text-align: center;
}
</style>
