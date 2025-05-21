<template>
  <view class="container">
    <!-- Logo 区域 -->
    <view class="logo-box">
      <image class="logo" src="/static/logo.png" mode="aspectFit" />
    </view>

    <!-- 登录表单 -->
    <view class="login-box">
      <input
        class="input"
        type="text"
        placeholder="请输入手机号"
        v-model="phone"
        @blur="validatePhone"
      />
      <input class="input" type="password" placeholder="请输入密码" v-model="password" />
      <view class="btnBox">
      	<button class="btn" @click="login">登录</button>
      	<button class="btn btn_right" @click="register">注册</button>
      </view>
    </view>
  </view>
</template>

<script>
import { login } from '@/api/index.js'

export default {
  data() {
    return {
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
	register(){
		uni.navigateTo({
			url:"/pages/RegisterPage/RegisterPage"
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
		const userInfo = {phone: this.phone, passwordHash:this.password}
        const res = await login(userInfo);
		console.log(res);
        if (res.code === 200) {
          // 保存 token
          uni.setStorageSync('token', res.data.currentToken);
		  uni.setStorageSync('userId', res.data.id)
          uni.showToast({
            title: '登录成功',
            icon: 'success'
          });
          // 跳转到首页
          uni.switchTab({
            url: '/pages/index/index'
          });
        } else {
          uni.showToast({
            title: res.message || '登录失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('登录失败', error);
      }
    }
  }
};
</script>

<style>
/* 页面布局样式 */
.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* height: 100vh; */
  background-color: #f5f5f5;
 position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
}

/* Logo 区域样式 */
.logo-box {
  margin-bottom: 20px;
  box-sizing: border-box;
}
.logo {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 登录框样式 */
.login-box {
  width: 80%;
  padding: 20px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}
.input {
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-sizing: border-box;
  height: 100rpx;
}
.btn {
  width: 40%;
  padding: 12px;
  background-color: #007AFF;
  color: #fff;
  border-radius: 5px;
  /* margin-right: 20rpx; */
  box-sizing: border-box;
}
.btn_right{
	/* margin-top: 20rpx; */
	color: #333;
	background-color: #f5f5f5;
}
.btnBox{
	display: flex;
	align-items: center;
	justify-content: space-between;
}
</style>
