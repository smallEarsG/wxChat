<template>
  <view class="container" :style="{ paddingTop: statusBarHeight + 'px' }">
    <!-- 背景装饰元素 -->
    <view class="bg-decoration"></view>
    
    <!-- 主内容区 -->
    <view class="content-wrapper" >
      <!-- Logo 区域 -->
      <view class="logo-section" >
        <view class="logo-box">
          <image class="logo" src="/static/logo.png" mode="aspectFit" />
          <text class="app-name">销售模板生成器</text>
        </view>
        <text class="app-slogan">专业、高效、智能</text>
      </view>

      <!-- 登录表单 -->
      <view class="login-container">
        <view class="login-card">
          <view class="card-header">
            <text class="card-title">欢迎登录</text>
          </view>
          
          <view class="form-group">
            <view class="input-wrapper">
              <view class="input-icon-wrapper">
                <uni-icons type="phone" size="26" color="#4A90E2" class="input-icon" />
              </view>
              <input
                class="input-field"
                type="text"
                placeholder="请输入手机号"
                v-model="phone"
                @blur="validatePhone"
                placeholder-class="placeholder"
              />
            </view>
            <view class="input-wrapper">
              <view class="input-icon-wrapper">
                <uni-icons type="lock" size="26" color="#4A90E2" class="input-icon" />
              </view>
              <input 
                class="input-field" 
                type="password" 
                placeholder="请输入密码" 
                v-model="password" 
                placeholder-class="placeholder"
              />
            </view>
          </view>
          
          <view class="form-actions">
            <button class="login-btn" @click="login">
              <text>登录</text>
            </button>
            
            <!-- 注册区域 -->
            <view class="register-area">
              <text class="register-text">还没有账号？</text>
              <view class="register-link" @click="register">
                <text>立即注册</text>
                <uni-icons type="arrowright" size="20" color="#FF6B6B" class="register-icon" />
              </view>
            </view>
          </view>
        </view>
        
        <!-- 装饰元素 -->
        <view class="login-decoration"></view>
      </view>
    </view>
    
    <!-- 底部版权信息 -->
    <view class="footer">
      <text class="copyright">© 2023 销售模板生成器 版权所有</text>
    </view>
  </view>
</template>

<script>
import { login } from '@/api/index.js'

export default {
  data() {
    return {
	statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
      phone: '',
      password: ''
    };
  },
  methods: {
    // 手机号校验逻辑
    validatePhone() {
      const phoneReg = /^1[3-9]\d{9}$/; // 常见的中国大陆手机号校验
      if (!phoneReg.test(this.phone)) {
        uni.showToast({
          title: '手机号格式不正确',
          icon: 'none'
        });
        return false;
      }
      return true;
    },
    
    register() {
      uni.navigateTo({
        url: "/pages/RegisterPage/RegisterPage"
      })
    },
    
    // 登录逻辑
    async login() {
      if (!this.phone || !this.password) {
        uni.showToast({
          title: '请输入手机号和密码',
          icon: 'none'
        });
        return;
      }

      // 校验手机号格式
      if (!this.validatePhone()) {
        return;
      }

      try {
        const userInfo = {phone: this.phone, passwordHash: this.password}
        const res = await login(userInfo);
        console.log(res);
        
        if (res.code === 200) {
          // 保存 token
          uni.setStorageSync('token', res.data.currentToken);
          uni.setStorageSync('userId', res.data.id)
          
          // 显示成功提示并设置动画
          uni.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 1500
          });
          
          // 延迟跳转，确保提示显示完整
          setTimeout(() => {
            // 跳转到首页
            uni.switchTab({
              url: '/pages/index/index'
            });
          }, 1500);
        } else {
          uni.showToast({
            title: res.message || '登录失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('登录失败', error);
        uni.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    }
  }
};
</script>

<style scoped>
/* 页面布局样式 */
.container {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  background: linear-gradient(135deg, #4A90E2, #50E3C2);
  overflow: hidden;
}

/* 背景装饰元素 */
.bg-decoration {
  position: absolute;
  top: -100rpx;
  right: -100rpx;
  width: 400rpx;
  height: 400rpx;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  z-index: 0;
}

.bg-decoration::after {
  content: '';
  position: absolute;
  bottom: -200rpx;
  left: -200rpx;
  width: 300rpx;
  height: 300rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

/* 主内容区 */
.content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 700rpx;
  padding: 0 40rpx;
  margin-top: 120rpx;
  z-index: 1;
}

/* Logo 区域样式 */
.logo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 100rpx;
  text-align: center;
}

.logo-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20rpx;
}

.logo {
  width: 120rpx;
  height: 120rpx;
  object-fit: contain;
  margin-bottom: 20rpx;
  filter: drop-shadow(0 8rpx 16rpx rgba(0, 0, 0, 0.1));
}

.app-name {
  font-size: 48rpx;
  font-weight: bold;
  color: #fff;
  text-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
  letter-spacing: 2rpx;
}

.app-slogan {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 1rpx;
}

/* 登录容器 */
.login-container {
  position: relative;
  width: 100%;
}

/* 登录卡片样式 */
.login-card {
  position: relative;
  width: 100%;
  background-color: #fff;
  border-radius: 30rpx;
  box-shadow: 0 30rpx 60rpx rgba(0, 0, 0, 0.1);
  padding: 60rpx 50rpx;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  z-index: 2;
  box-sizing: border-box;
}

.login-card:hover {
  transform: translateY(-10rpx);
  box-shadow: 0 40rpx 80rpx rgba(0, 0, 0, 0.15);
}

.card-header {
  margin-bottom: 80rpx;
  text-align: center;
}

.card-title {
  font-size: 42rpx;
  font-weight: 600;
  color: #333;
  letter-spacing: 1rpx;
}

/* 表单样式 */
.form-group {
  margin-bottom: 60rpx;
}

.input-wrapper {
  position: relative;
  margin-bottom: 50rpx;
  overflow: hidden;
}

.input-icon-wrapper {
  position: absolute;
  left: 0;
  top: 0;
  width: 80rpx;
  height: 90rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(74, 144, 226, 0.05);
  border-radius: 20rpx 0 0 20rpx;
  border-right: 1rpx solid rgba(74, 144, 226, 0.1);
  overflow: hidden;
  box-sizing: border-box;
}

.input-icon {
  transition: transform 0.3s ease;
}

.input-field:focus + .input-icon-wrapper .input-icon {
  transform: scale(1.2);
}

.input-field {
  /* width: 100%; */
  flex: 1;
  height: 90rpx;
  padding: 0 30rpx 0 100rpx;
  border: 1rpx solid rgba(74, 144, 226, 0.1);
  border-radius: 20rpx;
  background-color: rgba(74, 144, 226, 0.03);
  font-size: 28rpx;
  transition: all 0.3s ease;
}

.input-field:focus {
  border-color: #4A90E2;
  background-color: #fff;
  box-shadow: 0 0 0 2rpx rgba(74, 144, 226, 0.2);
}

.placeholder {
  color: #999;
  font-size: 28rpx;
}

/* 表单操作区 */
.form-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-btn {
  width: 100%;
  height: 90rpx;
  background: linear-gradient(135deg, #4A90E2, #3A80D2);
  color: #fff;
  border-radius: 20rpx;
  font-size: 32rpx;
  font-weight: 500;
  box-shadow: 0 15rpx 30rpx rgba(74, 144, 226, 0.3);
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40rpx;
  position: relative;
  overflow: hidden;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: all 0.6s ease;
}

.login-btn:hover::before {
  left: 100%;
}

.login-btn:hover {
  transform: translateY(-5rpx);
  box-shadow: 0 20rpx 40rpx rgba(74, 144, 226, 0.4);
}

.login-btn:active {
  transform: translateY(0);
  box-shadow: 0 10rpx 20rpx rgba(74, 144, 226, 0.2);
}

/* 注册区域 */
.register-area {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: 20rpx;
}

.register-text {
  font-size: 26rpx;
  color: #666;
  margin-right: 10rpx;
}

.register-link {
  display: flex;
  align-items: center;
  background: none;
  border: none;
  padding: 0;
  color: #FF6B6B;
  font-size: 28rpx;
  font-weight: 500;
  border:none;
  transition: all 0.3s ease;
}

.register-link:hover {
  color: #FF5252;
  transform: translateX(5rpx);
}

.register-link:active {
  transform: translateX(0);
}

.register-icon {
  margin-left: 8rpx;
  transition: transform 0.3s ease;
}

.register-link:hover .register-icon {
  transform: translateX(3rpx);
}

/* 登录装饰元素 */
.login-decoration {
  position: absolute;
  bottom: -20rpx;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  height: 20rpx;
  background: rgba(74, 144, 226, 0.1);
  border-radius: 50%;
  filter: blur(10rpx);
  z-index: 1;
}

/* 底部版权信息 */
.footer {
  margin-bottom: 40rpx;
  z-index: 1;
}

.copyright {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
}
</style>
