<template>
  <view class="container" :style="{ paddingTop: statusBarHeight + 'px' }">
    <!-- 背景区域（与用户信息衔接设计） -->
    <view class="header-bg">
      <!-- 渐变底色 -->
      <view class="bg-base"></view>
      <!-- 装饰光效 -->
      <view class="bg-light light-1"></view>
      <view class="bg-light light-2"></view>
      <!-- 底部过渡区 -->
      <view class="bg-transition"></view>
    </view>
    
    <!-- 用户信息主区域（与背景融合） -->
    <view class="user-main-section">
      <!-- 头像区域 -->
      <view class="avatar-container">
        <view class="avatar-glow"></view>
        <view class="avatar-box" @click="changeAvatar">
          <image 
            :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" 
            class="avatar" 
            mode="aspectFill"
          />
          <view class="avatar-edit">
            <uni-icons type="camera" size="26" color="#fff" />
          </view>
        </view>
      </view>
      
      <!-- 用户信息区 -->
      <view class="user-info-container">
        <view class="username-wrapper" @click="editNickname">
          <text class="username">{{ userInfo.username || '未设置昵称' }}</text>
          <uni-icons type="edit" size="18" color="#fff" class="username-edit" />
        </view>
        
        <view class="member-status">
          <view class="member-tag" :class="{ 'vip-tag': !_isMemberExpired(userInfo.memberExpireAt) }">
            {{ _isMemberExpired(userInfo.memberExpireAt) ? "普通用户" : "VIP会员" }}
            <uni-icons 
              v-if="!_isMemberExpired(userInfo.memberExpireAt)" 
              type="star" 
              size="16" 
              color="#fff" 
              class="vip-star" 
            />
          </view>
          <text class="expire-date">
            {{ userInfo.memberExpireAt ? "到期时间: " + formatDate(userInfo.memberExpireAt) : "--" }}
          </text>
        </view>
      </view>
    </view>
    
    <!-- 数据卡片 -->
    <view class="data-cards">
      <view class="data-card" @click="Recharge">
        <view class="card-header">
          <uni-icons type="crown" size="24" color="#FFD700" />
          <view class="card-title">会员特权</view>
        </view>
        <view class="card-value">
          <text>{{ userInfo.tryCount || 0 }} 次免费使用</text>
        </view>
        <view class="card-arrow">
          <uni-icons type="right" size="20" color="#ccc" />
        </view>
      </view>
      <view class="data-card" @click="withdrawPoints">
        <view class="card-header">
          <uni-icons type="star" size="24" color="#FF9500" />
          <view class="card-title">我的积分</view>
        </view>
        <view class="card-value">
          <text>{{ userInfo.points || 0 }} 积分</text>
        </view>
        <view class="card-arrow">
          <uni-icons type="right" size="20" color="#ccc" />
        </view>
      </view>
    </view>
    
    <!-- 主要信息区域 -->
    <view class="info-section">
      <view class="info-card">
        <view class="card-header">
          <span class="header-dot"></span>
          个人信息
        </view>
        <view class="info-item">
          <uni-icons type="code" size="24" color="#666" class="item-icon" />
          <text class="item-label">邀请码</text>
          <text class="item-value">{{ userInfo.inviteCode || '--' }}</text>
          <uni-icons type="copy" size="20" color="#ccc" class="item-operate" @click="copyInviteCode" />
        </view>
        <view class="info-item">
          <uni-icons type="phone" size="24" color="#666" class="item-icon" />
          <text class="item-label">管理员</text>
          <text class="item-value">18216263971</text>
        </view>
      </view>
      
      <view class="action-card">
        <button class="btn-withdraw" @click="withdrawPoints">
          <uni-icons type="arrowdown" size="22" />
          积分提现
        </button>
        <button class="btn-recharge" @click="Recharge">
          <uni-icons type="plus" size="22" />
          会员充值
        </button>
      </view>
    </view>
    
    <!-- 退出登录按钮 -->
    <view class="logout-container">
      <button class="btn-logout" @click="logout">
        <uni-icons type="logout" size="22" />
        <span>退出登录</span>
      </button>
    </view>
    
    <!-- 充值对话框 -->
    <VipRechargeDialog ref="vipRecharge" :show="payShow" @pay="pay" @close="Recharge" />
  </view>
</template>

<script>
import {
  getUserInfo,
  updateUserInfo,
  logout,
  withdraw,
  getPayMember,
  activateMember
} from '@/api/index.js'
import VipRechargeDialog from '../../components/VipRechargeDialog/VipRechargeDialog.vue';
import { isMemberExpired } from '@/utils/tool.js'
import { BASE_URL } from '@/utils/request.js' 


export default {
  components:{
    VipRechargeDialog
  },
  data() {
    return {
	  statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
      payShow: false,
      userInfo: {}
    };
  },
  onShow() {
    const userId = uni.getStorageSync('userId')
    this.getUserInfo(userId)
  },
  methods: {
    // 复制邀请码功能
    copyInviteCode() {
      if (!this.userInfo.inviteCode) {
        uni.showToast({ title: '邀请码为空', icon: 'none' });
        return;
      }
      uni.setClipboardData({
        data: this.userInfo.inviteCode,
        success: () => {
          uni.showToast({ title: '邀请码已复制', icon: 'none' });
        }
      });
    },
    
    async pay(data) {
      let srt = await getPayMember(this.userInfo.id, data.price)
      
      if (!srt || !srt.data || typeof srt.data !== 'string') {
        console.error('支付订单信息无效', srt);
        uni.showToast({
          title: '获取支付信息失败',
          icon: 'none'
        });
        return;
      }
      
      uni.requestPayment({
        provider: 'alipay',
        orderInfo: srt.data,
        success: async (res) => {
          uni.showToast({ title: '支付成功' });
          const resl = await activateMember(this.userInfo.id, data.type)
          this.getUserInfo(this.userInfo.id)
          this.Recharge()
        },
        fail: function(err) {
          console.log('支付失败', err);
          uni.showToast({ title: '支付失败', icon: 'none' });
        }
      });
    },
    
    _isMemberExpired(at) {
      return isMemberExpired(at)
    },
    
    formatDate(dateString) {
      if (dateString == '--') return '--'
      const date = new Date(dateString);
      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    
    Recharge() {
      this.payShow = !this.payShow 
    },
    
    async getUserInfo(userId) {
      const res = await getUserInfo(userId)
      this.userInfo = res.data
    },

    changeAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          this.updateUserWithAvatar({}, tempFilePath)
        }
      });
    },

    updateUserWithAvatar(formData, filePath) {
      if (filePath) {
        uni.uploadFile({
          url: `${BASE_URL}/user/update/${this.userInfo.id}`,
          filePath,
          name: 'avatar',
          formData,
          success: (res) => this.handleResponse(res),
          fail: (err) => {
            console.error('上传失败：', err);
            uni.showToast({ title: '网络异常', icon: 'none' });
          }
        });
      } else {
        uni.request({
          url: `${BASE_URL}/user/update/${this.userInfo.id}`,
          method: 'POST',
          header: { 'Content-Type': 'application/x-www-form-urlencoded' },
          data: formData,
          success: (res) => this.handleResponse(res),
          fail: (err) => {
            console.error('请求失败：', err);
            uni.showToast({ title: '网络异常', icon: 'none' });
          }
        });
      }
    },

    handleResponse(res) {
      let result;
      try {
        result = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
      } catch (e) {
        uni.showToast({ title: '解析失败', icon: 'none' });
        return;
      }
      
      if (result.code === 200 || result.code === 0) {
        uni.showToast({ title: '更新成功', icon: 'success' });
      } else {
        uni.showToast({ title: result.message || '更新失败', icon: 'none' });
      }
      this.getUserInfo(this.userInfo.id)
    },
    
    editNickname() {
      uni.showModal({
        title: '修改昵称',
        editable: true,
        placeholderText: '请输入新的昵称',
        success: (res) => {
          if (res.confirm && res.content) {
            this.updateUserWithAvatar({username: res.content})
          }
        }
      });
    },

    withdrawPoints() {
      if (!this.userInfo.points) {
        uni.showToast({ title: '积分不足', icon: 'none' });
        return;
      }
      
      uni.showModal({
        title: '积分提现',
        content: `您当前有 ${this.userInfo.points} 积分，确定要全部提现吗？`,
        success: async (res) => {
          if (res.confirm) {
            uni.showLoading({ title: '提现中...' });
            
            const form = {
              points: this.userInfo.points,
              userId: this.userInfo.id,
              alipayAccount: "18216267971",
              realName: "郭治金"
            }
            
            const svl = await withdraw(form)
            uni.hideLoading();
            
            if (svl.code === 200) {
              uni.showToast({ title: '提现成功', icon: 'success' });
              this.getUserInfo(this.userInfo.id);
            } else {
              uni.showToast({ title: svl.message || '提现失败', icon: 'none' });
            }
          }
        }
      });
    },

    logout() {
      uni.showModal({
        title: '确认退出',
        content: '您确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.removeStorageSync('userId');
			uni.removeStorageSync('token');
            logout(this.userInfo.id)
            uni.reLaunch({ url: '/pages/login/login' });
          }
        }
      });
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  background-color: #f7f8fa;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  overflow: auto;
}

/* 背景区域 - 与用户信息衔接设计 */
.header-bg {
  height: 280rpx;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
  overflow: hidden;
}
/* 背景底色 */
.bg-base {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #5b46c7, #7c3aed);
}
/* 装饰光效 - 增强与用户信息的连接 */
.bg-light {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  filter: blur(60rpx);
}
.light-1 {
  width: 400rpx;
  height: 400rpx;
  top: -150rpx;
  right: -100rpx;
  animation: float 15s infinite ease-in-out;
}
.light-2 {
  width: 300rpx;
  height: 300rpx;
  bottom: -100rpx;
  left: -50rpx;
  animation: float 18s infinite ease-in-out 2s;
}
/* 底部过渡区 - 关键衔接元素 */
.bg-transition {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100rpx;
  background: linear-gradient(to bottom, transparent, #f7f8fa);
  z-index: 2;
}

/* 用户信息主区域 - 整合头像和名称 */
.user-main-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30rpx 0;
  margin-top: 80rpx; /* 调整位置与背景衔接 */
  z-index: 3;
  position: relative;
}
/* 头像容器 - 增加与背景的视觉连接 */
.avatar-container {
  position: relative;
  margin-bottom: 25rpx;
}
/* 头像光晕 - 核心衔接元素 */
.avatar-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0) 70%);
  z-index: -1;
}
.avatar-box {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 4rpx solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  background-color: #f0f0f0;
}
.avatar-box:hover {
  transform: scale(1.05);
  box-shadow: 0 8rpx 20rpx rgba(91, 70, 199, 0.2);
}
.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
/* 头像编辑提示 */
.avatar-edit {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: #5b46c7;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.2);
  opacity: 0;
  transition: opacity 0.3s;
}
.avatar-box:hover .avatar-edit {
  opacity: 1;
}

/* 用户信息容器 - 与背景融合 */
.user-info-container {
  text-align: center;
  padding: 15rpx 30rpx;
  border-radius: 30rpx;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10rpx);
  box-shadow: 0 3rpx 10rpx rgba(0, 0, 0, 0.05);
}
/* 用户名样式 */
.username-wrapper {
  display: inline-flex;
  align-items: center;
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
  padding: 5rpx 10rpx;
  border-radius: 8rpx;
  transition: background-color 0.2s;
}
.username-wrapper:hover {
  background-color: rgba(255, 255, 255, 0.5);
}
.username-edit {
  margin-left: 8rpx;
  opacity: 0.7;
}
.username-wrapper:hover .username-edit {
  opacity: 1;
}

/* 会员状态区域 */
.member-status {
  margin-top: 10rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.member-tag {
  padding: 4rpx 18rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  margin-bottom: 8rpx;
  display: inline-flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.5);
  color: #666;
}
.vip-tag {
  background: linear-gradient(135deg, #9333ea, #7c3aed);
  color: #fff;
  box-shadow: 0 2rpx 8rpx rgba(124, 58, 237, 0.3);
}
.vip-star {
  margin-left: 5rpx;
  animation: starShine 1.5s infinite alternate;
}
.expire-date {
  font-size: 22rpx;
  color: #666;
  background-color: rgba(255, 255, 255, 0.3);
  padding: 2rpx 15rpx;
  border-radius: 15rpx;
}

/* 数据卡片 */
.data-cards {
  display: flex;
  justify-content: space-between;
  padding: 0 30rpx;
  margin-top: 15rpx;
  z-index: 2;
}
.data-card {
  flex: 1;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx 20rpx;
  margin: 0 12rpx;
  box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  position: relative;
}
.data-card:hover {
  transform: translateY(-5rpx);
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.08);
}
.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
}
.card-header .card-title {
  font-size: 26rpx;
  color: #666;
  margin-left: 8rpx;
}
.card-value {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}
.card-arrow {
  position: absolute;
  top: 18rpx;
  right: 18rpx;
  color: #ccc;
  font-size: 18rpx;
}

/* 个人信息区域 */
.info-section {
  padding: 25rpx 30rpx;
  margin-top: 15rpx;
  z-index: 2;
}
.info-card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 25rpx;
  margin-bottom: 25rpx;
  box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.05);
}
.card-header {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 25rpx;
  padding-bottom: 15rpx;
  border-bottom: 1rpx solid #f0f0f0;
  display: flex;
  align-items: center;
}
.header-dot {
  width: 10rpx;
  height: 10rpx;
  background-color: #7c3aed;
  border-radius: 50%;
  margin-right: 12rpx;
}

/* 信息项 */
.info-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}
.info-item:last-child {
  border-bottom: none;
}
.item-icon {
  margin-right: 18rpx;
  color: #7c3aed;
  width: 28rpx;
  text-align: center;
}
.item-label {
  font-size: 26rpx;
  color: #666;
  flex: 1;
}
.item-value {
  font-size: 26rpx;
  color: #333;
  flex: 2;
  text-align: right;
  padding-right: 15rpx;
}
.item-operate {
  color: #999;
  transition: color 0.2s;
}
.item-operate:hover {
  color: #7c3aed;
}

/* 操作按钮 */
.action-card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 25rpx;
  box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
}
.btn-withdraw, .btn-recharge {
  flex: 1;
  padding: 20rpx;
  border-radius: 15rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  font-weight: 500;
  border: none;
}
.btn-withdraw {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
  margin-right: 15rpx;
  box-shadow: 0 3rpx 8rpx rgba(220, 38, 38, 0.2);
}
.btn-withdraw:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-2rpx);
}
.btn-recharge {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  color: #fff;
  box-shadow: 0 3rpx 8rpx rgba(109, 40, 217, 0.2);
}
.btn-recharge:hover {
  background: linear-gradient(135deg, #6d28d9, #5b21b6);
  transform: translateY(-2rpx);
}

/* 退出登录按钮 */
.logout-container {
  padding: 25rpx;
  margin: 30rpx 0 50rpx;
  display: flex;
  justify-content: center;
}
.btn-logout {
  width: 80%;
  padding: 24rpx;
  background: #fff;
  color: #666;
  border-radius: 80rpx;
  text-align: center;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: 1rpx solid #eee;
  box-shadow: 0 3rpx 12rpx rgba(0, 0, 0, 0.03);
}
.btn-logout:hover {
  background-color: #fafafa;
  color: #7c3aed;
  border-color: #e9d5ff;
}
.btn-logout uni-icons {
  margin-right: 12rpx;
}

/* 动画效果 */
@keyframes starShine {
  from { transform: scale(0.8); opacity: 0.8; }
  to { transform: scale(1.1); opacity: 1; }
}
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20rpx) rotate(2deg); }
}
</style>