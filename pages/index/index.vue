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
export default {
  components:{
	  ProfileEditPopup
  },
  data(){
	  return {
		  guestInfo:{}
	  }
  },
  methods: {
    // 跳转到聊天页面
    goToChat() {
	  this.$refs.filePopup.open()
     
    },
	onSubmit(data){
	
	
		uni.navigateTo({
		  url: '/pages/chat/chat?guestInfo=' + encodeURIComponent(JSON.stringify(data))
		});
	},
    // 跳转到转账记录页面
    goToRecords() {
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
