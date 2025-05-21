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
        <input v-model="passwordHash" class="input" placeholder="请输入密码"  />
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
import { BASE_URL } from '@/utils/request.js'

const REGISTER_API_URL = BASE_URL + '/user/register'
const PHONE_REGEX = /^1[3-9]\d{9}$/
const ERROR_MESSAGES = {
  nickname: '请填写昵称',
  phone: '请填写手机号',
  phoneFormat: '手机号格式不正确',
  avatar: '请选择头像',
  network: '网络错误',
  registerSuccess: '注册成功',
  registerFail: '失败'
}

export default {
  name: 'RegisterPage',
  data() {
    return {
      avatar: '',
      nickname: '',
      phone: '',
      passwordHash: "",
      inviteCode: ''
    }
  },
  methods: {
    // 手机号校验逻辑
    validatePhone() {
      if (!PHONE_REGEX.test(this.phone)) {
        this.showToast(ERROR_MESSAGES.phoneFormat)
        return false
      }
      return true
    },
    chooseAvatar() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          this.avatar = res.tempFilePaths[0]
        }
      })
    },
    async submit() {
      if (!this.nickname.trim()) {
        return this.showToast(ERROR_MESSAGES.nickname)
      }
      if (!this.phone.trim()) {
        return this.showToast(ERROR_MESSAGES.phone)
      }
      if (!this.validatePhone()) {
        return
      }
      const userInfo = {
        username: this.nickname,
        phone: this.phone,
        passwordHash: this.passwordHash,
        inviteCode: this.inviteCode,
		tryCount:5
      }
      console.log('注册信息：', userInfo)
      this.uploadWithAvatar(userInfo, this.avatar)
    },
    uploadWithAvatar(data, filePath) {
      if (!filePath) {
        return this.showToast(ERROR_MESSAGES.avatar)
      }
      uni.uploadFile({
        url: REGISTER_API_URL,
        filePath,
        name: 'avatar',
        formData: {
          ...data
        },
        success: (res) => {
          try {
			
            const data =JSON.parse(res.data)
		  
			console.log(res.data);
            if (data.code === 200 || data.code === 0) {
              this.showToast(ERROR_MESSAGES.registerSuccess)
              uni.navigateTo({
                url: "/pages/login/login"
              })
            } else {
              this.showToast(data.message || ERROR_MESSAGES.registerFail)
            }
          } catch (error) {
            this.showToast(ERROR_MESSAGES.registerFail)
            console.error('解析响应数据失败：', error)
          }
        },
        fail: (err) => {
		   console.error('上传文件失败：', err);
		    console.log('请求地址：', REGISTER_API_URL);
		    console.log('文件路径：', filePath);
		    console.log('表单数据：', data);
          this.showToast(ERROR_MESSAGES.network)
          console.error('上传文件失败：', err)
        }
      })
    },
    showToast(message) {
      uni.showToast({
        title: message,
        icon: 'none'
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
