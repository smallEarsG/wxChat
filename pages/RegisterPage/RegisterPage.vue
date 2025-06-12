<template>
  <view class="register-page" :style="{ paddingTop: statusBarHeight + 'px' }">
    <!-- 背景装饰 -->
    <view class="bg-decoration"></view>
    
    <!-- 主内容区 -->
    <view class="content-wrapper">
      <!-- 返回按钮 -->
      <view class="back-button" @click="goBack">
        <uni-icons type="arrowleft" size="32" color="#fff" />
      </view>
      
      <!-- 标题 -->
      <view class="page-title">
        <text>创建新账户</text>
      </view>
      
      <!-- 表单卡片 -->
      <view class="form-card">
        <!-- 上传头像 -->
        <view class="avatar-upload" @click="chooseAvatar">
          <image v-if="avatar" :src="avatar" class="avatar" mode="aspectFill" />
          <view v-else class="avatar-placeholder">
            <uni-icons type="camera" size="40" color="#999" />
            <text>点击上传头像</text>
          </view>
        </view>

        <!-- 用户名称 -->
        <view class="form-item">
          <text class="label">用户名称</text>
          <view class="input-wrapper">
            <uni-icons type="person" size="24" color="#4A90E2" class="input-icon" />
            <input 
              v-model="nickname" 
              class="input-field" 
              placeholder="请输入昵称" 
              @focus="onInputFocus"
              @blur="onInputBlur"
            />
          </view>
        </view>

        <!-- 手机号 -->
        <view class="form-item">
          <text class="label">手机号</text>
          <view class="input-wrapper">
            <uni-icons type="phone" size="24" color="#4A90E2" class="input-icon" />
            <input 
              v-model="phone" 
              class="input-field" 
              placeholder="请输入手机号" 
              type="number"
              @focus="onInputFocus"
              @blur="onInputBlur"
            />
          </view>
        </view>
        
        <!-- 密码 -->
        <view class="form-item">
          <text class="label">密码</text>
          <view class="input-wrapper">
            <uni-icons type="lock" size="24" color="#4A90E2" class="input-icon" />
            <input 
              v-model="passwordHash" 
              class="input-field" 
              placeholder="请输入密码" 
              type="password"
              @focus="onInputFocus"
              @blur="onInputBlur"
            />
          </view>
        </view>
        
        <!-- 邀请码 -->
        <view class="form-item">
          <text class="label">邀请码（选填）</text>
          <view class="input-wrapper">
            <uni-icons type="gift" size="24" color="#4A90E2" class="input-icon" />
            <input 
              v-model="inviteCode" 
              class="input-field" 
              placeholder="请输入邀请码（可选）"
              @focus="onInputFocus"
              @blur="onInputBlur"
            />
          </view>
        </view>

        <!-- 提交按钮 -->
        <button class="submit-btn" @click="submit">
          <text>完成注册</text>
        </button>
        
        <!-- 已有账号提示 -->
        <view class="have-account">
          <text>已有账号？</text>
          <view class="login-link" @click="goToLogin">
            <text>立即登录</text>
          </view>
        </view>
      </view>
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
  registerFail: '注册失败'
}

export default {
  name: 'RegisterPage',
  data() {
    return {
	  statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
      avatar: '',
      nickname: '',
      phone: '',
      passwordHash: "",
      inviteCode: '',
      isInputFocused: false
    }
  },
  methods: {
    goBack() {
      uni.navigateBack()
    },
    
    goToLogin() {
      uni.navigateTo({
        url: "/pages/login/login"
      })
    },
    
    onInputFocus() {
      this.isInputFocused = true
    },
    
    onInputBlur() {
      this.isInputFocused = false
    },
    
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
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.avatar = res.tempFilePaths[0]
        }
      })
    },
    
    async submit() {
      // 表单验证
      if (!this.nickname.trim()) {
        return this.showToast(ERROR_MESSAGES.nickname)
      }
      
      if (!this.phone.trim()) {
        return this.showToast(ERROR_MESSAGES.phone)
      }
      
      if (!this.validatePhone()) {
        return
      }
      
      if (!this.passwordHash) {
        return this.showToast('请设置密码')
      }
      
      if (!this.avatar) {
        return this.showToast(ERROR_MESSAGES.avatar)
      }
      
      // 准备表单数据
      const userInfo = {
        username: this.nickname,
        phone: this.phone,
        passwordHash: this.passwordHash,
        inviteCode: this.inviteCode,
        tryCount: 5
      }
      
      console.log('注册信息：', userInfo)
      
      // 显示加载状态
      uni.showLoading({
        title: '注册中...',
        mask: true
      })
      
      // 上传文件并注册
      this.uploadWithAvatar(userInfo, this.avatar)
    },
    
    uploadWithAvatar(data, filePath) {
      uni.uploadFile({
        url: REGISTER_API_URL,
        filePath,
        name: 'avatar',
        formData: {
          ...data
        },
        success: (res) => {
          uni.hideLoading()
          
          try {
            const result = JSON.parse(res.data)
            console.log('注册结果：', result)
            
            if (result.code === 200 || result.code === 0) {
              this.showToast(ERROR_MESSAGES.registerSuccess)
              
              // 延迟跳转，确保提示显示完整
              setTimeout(() => {
                uni.navigateTo({
                  url: "/pages/login/login"
                })
              }, 1500)
            } else {
              this.showToast(result.message || ERROR_MESSAGES.registerFail)
            }
          } catch (error) {
            this.showToast(ERROR_MESSAGES.registerFail)
            console.error('解析响应数据失败：', error)
          }
        },
        fail: (err) => {
          uni.hideLoading()
          this.showToast(ERROR_MESSAGES.network)
          console.error('上传文件失败：', err)
        }
      })
    },
    
    showToast(message) {
      uni.showToast({
        title: message,
        icon: 'none',
        duration: 2000
      })
    }
  }
}
</script>

<style scoped>
.register-page {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #4A90E2, #50E3C2);
  overflow: hidden;
}

/* 背景装饰 */
.bg-decoration {
  position: absolute;
  bottom: -300rpx;
  right: -300rpx;
  width: 600rpx;
  height: 600rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  z-index: 0;
}

.bg-decoration::before {
  content: '';
  position: absolute;
  top: -100rpx;
  left: -100rpx;
  width: 400rpx;
  height: 400rpx;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
}

/* 主内容区 */
.content-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 60rpx 40rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  z-index: 1;
}

/* 返回按钮 */
.back-button {
  position: absolute;
  top: 60rpx;
  left: 40rpx;
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  backdrop-filter: blur(10rpx);
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

/* 页面标题 */
.page-title {
  margin: 40rpx 0 60rpx 0;
  text-align: center;
}

.page-title text {
  font-size: 44rpx;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
}

/* 表单卡片 */
.form-card {
  flex: 1;
  background: #fff;
  border-radius: 30rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 30rpx 60rpx rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch;
}

/* 上传头像 */
.avatar-upload {
  display: flex;
  justify-content: center;
  margin-bottom: 60rpx;
}

.avatar {
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  border: 4rpx solid #fff;
  box-shadow: 0 10rpx 20rpx rgba(74, 144, 226, 0.15);
  object-fit: cover;
  transition: all 0.3s ease;
}

.avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 15rpx 30rpx rgba(74, 144, 226, 0.25);
}

.avatar-placeholder {
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  background-color: #f0f2f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 26rpx;
  border: 2rpx dashed #ddd;
  transition: all 0.3s ease;
}

.avatar-placeholder uni-icons {
  margin-bottom: 10rpx;
}

.avatar-placeholder:hover {
  background-color: #e6e9ed;
  border-color: #4A90E2;
  color: #4A90E2;
}

/* 表单项目 */
.form-item {
  margin-bottom: 40rpx;
  overflow: hidden;
}

.label {
  display: block;
  font-size: 28rpx;
  margin-bottom: 15rpx;
  color: #333;
  font-weight: 500;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 30rpx;
  top: 50%;
  transform: translateY(-50%);
  color: #4A90E2;
  transition: all 0.3s ease;
}

.input-field {
  flex: 1;
  height: 90rpx;
  padding: 0 30rpx 0 80rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 24rpx;
  background-color: #f9f9f9;
  font-size: 28rpx;
  transition: all 0.3s ease;
  outline: none;
}

.input-field:focus {
  border-color: #4A90E2;
  background-color: #fff;
  box-shadow: 0 0 0 2rpx rgba(74, 144, 226, 0.15);
}

.input-field:focus + .input-icon {
  color: #3A80D2;
  transform: translateY(-50%) scale(1.1);
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  height: 90rpx;
  background: linear-gradient(135deg, #4A90E2, #3A80D2);
  color: #fff;
  border-radius: 24rpx;
  font-size: 32rpx;
  font-weight: 500;
  box-shadow: 0 15rpx 30rpx rgba(74, 144, 226, 0.25);
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20rpx;
  margin-bottom: 40rpx;
  position: relative;
  overflow: hidden;
}

.submit-btn::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5rpx;
  height: 5rpx;
  background-color: rgba(255, 255, 255, 0.5);
  opacity: 0;
  border-radius: 100%;
  transform: scale(1, 1) translate(-50%);
  transform-origin: 50% 50%;
}

.submit-btn:active::after {
  transform: scale(100, 100);
  opacity: 0;
  transition: transform 0.3s ease, opacity 0.6s ease;
}

.submit-btn:hover {
  transform: translateY(-5rpx);
  box-shadow: 0 20rpx 40rpx rgba(74, 144, 226, 0.35);
}

.submit-btn:active {
  transform: translateY(0);
  box-shadow: 0 10rpx 20rpx rgba(74, 144, 226, 0.2);
}

/* 已有账号提示 */
.have-account {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 20rpx;
}

.have-account text {
  font-size: 26rpx;
  /* color: #999; */
  margin-right: 15rpx;
}

.login-link {
  background: none;
  border: none;
  padding: 0;
  color: #4A90E2;
  font-size: 28rpx;
  font-weight: 500;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
   /* background-color: rgb(74, 144, 226); */
}

/* .login-link::after {
  content: '';
  display: block;
  width: 0;
  height: 2rpx;
  background-color: #4A90E2;
  margin-top: 6rpx;
  transition: width 0.3s ease;
} */

/* .login-link:hover {
  color: #3A80D2;
} */

.login-link:hover::after {
  width: 100%;
 
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6rpx;
  height: 6rpx;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: rgba(74, 144, 226, 0.2);
  border-radius: 3rpx;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(74, 144, 226, 0.3);
}
</style>
