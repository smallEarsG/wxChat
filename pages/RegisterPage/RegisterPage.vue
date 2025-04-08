<template>
  <view class="register-page">
    <view class="form-box">
      <!-- 上传头像 -->
      <view class="avatar-upload" @click="chooseAvatar">
        <image v-if="avatar" :src="avatar" class="avatar" mode="aspectFill" />
        <view v-else class="avatar-placeholder">点击上传</view>
      </view>

      <!-- 用户名称 -->
      <view class="form-item">
        <text class="label">用户名称</text>
        <input v-model="nickname" class="input" placeholder="请输入昵称" />
      </view>

      <!-- 手机号 -->
      <view class="form-item">
        <text class="label">手机号</text>
        <input v-model="phone" class="input" placeholder="请输入手机号" type="number" />
      </view>
	<view class="form-item">
        <text class="label">密码</text>
        <input v-model="passwordHash" class="input" placeholder="请输入手机号"  />
      </view>
      <!-- 邀请码 -->
      <view class="form-item">
        <text class="label">邀请码（选填）</text>
        <input v-model="inviteCode" class="input" placeholder="请输入邀请码（可选）" />
      </view>

      <!-- 提交按钮 -->
      <button class="btn" @click="submit">注册</button>
    </view>
  </view>
</template>

<script>
import { register } from '@/api/index.js'
import {BASE_URL}  from '@/utils/request.js'

export default {
  name: 'RegisterPage',
  data() {
    return {
      avatar: '',
      nickname: 'tt',
      phone: '123345',
	  passwordHash:"123456",
      inviteCode: ''
    }
  },
  methods: {
    chooseAvatar() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          this.avatar = res.tempFilePaths[0];
        }
      });
    },
   async  submit() {
      if (!this.nickname.trim()) {
        return uni.showToast({ title: '请填写昵称', icon: 'none' });
      }
      if (!this.phone.trim()) {
        return uni.showToast({ title: '请填写手机号', icon: 'none' });
      }
      // 模拟提交
	   
	  const userInfo =  {
       
        username: this.nickname,
        phone: this.phone,
		passwordHash:this.passwordHash,
        inviteCode: this.inviteCode
      }
      console.log('注册信息：',userInfo);
	  this.uploadWithAvatar(userInfo,this.avatar,)
    },
	uploadWithAvatar(data,filePath) {
	  uni.uploadFile({
	    url: BASE_URL + '/user/register', // 后端接口地址
	    filePath, // 本地临时文件路径
	    name: 'avatar', // 👈 与后端 MultipartFile 参数名一致
	    formData: {
			...data
	    },
	    success: (res) => {
	      const data = JSON.parse(res.data)
	      if (data.code === 200 || data.code === 0) {
	        uni.showToast({ title: '注册成功', icon: 'none'  })
			uni.navigateTo({
				url:"/pages/login/login"
			})
	      } else {
	        uni.showToast({ title: data.message || '失败', icon: 'none' })
	      }
	    },
	    fail: (err) => {
	      uni.showToast({ title: '网络错误', icon: 'none' })
	      console.error(err)
	    }
	  })
	}
  }
}
</script>

<style scoped>
.register-page {
  padding: 60rpx 30rpx;
  background-color: #f8f8f8;
  /* height: 100vh; */
  box-sizing: border-box;
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.form-box {
  background: #fff;
  padding: 40rpx;
  border-radius: 20rpx;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
}
.avatar-upload {
  display: flex;
  justify-content: center;
  margin-bottom: 40rpx;
}
.avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 2rpx solid #ddd;
}
.avatar-placeholder {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  background-color: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 28rpx;
}
.form-item {
  margin-bottom: 30rpx;
}
.label {
  display: block;
  font-size: 28rpx;
  margin-bottom: 10rpx;
  color: #333;
}
.input {
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 8rpx;
  padding: 16rpx;
  height: 80rpx;
  font-size: 28rpx;
  background-color: #fff;
   box-sizing: border-box;
}
.btn {
  background-color: #007aff;
  color: white;
  padding: 20rpx;
  border-radius: 10rpx;
  font-size: 32rpx;
  margin-top: 30rpx;
 box-sizing: border-box;
}
</style>
