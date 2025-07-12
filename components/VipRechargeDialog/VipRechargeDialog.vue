<template>
  <view class="recharge-popup" v-if="show">
    <view class="popup-overlay" @click="$emit('close')"></view>
    <view class="popup-container">
      <view class="popup-content animate__animated animate__fadeIn">
        <view class="header-section">
          <text class="popup-title">开通VIP会员</text>
          <text class="popup-close" @click="$emit('close')">×</text>
        </view>
        
        <!-- 网格布局的选项列表 -->
        <view class="option-grid">
          <view 
            v-for="item in options" 
            :key="item.type" 
            class="option-card" 
            :class="{ active: selected === item.type }"
            @click="selectPlan(item.type)"
          >
            <view class="option-header">
              <text class="name">{{ item.label }}</text>
              <text class="popular" v-if="item.popular">热门</text>
            </view>
            <text class="price">￥{{ item.price }}</text>
            <text class="saving" v-if="item.saving">省{{ item.saving }}元</text>
            <text class="per-day" v-if="item.perDay">日均{{ item.perDay }}元</text>
          </view>
        </view>

        <button class="btn-pay" @click="pay">
          <text class="btn-text">立即开通</text>
          <text class="btn-subtext" v-if="getSelectedPlan().saving">立省{{ getSelectedPlan().saving }}元</text>
        </button>
        
        <view class="privilege-section">
          <text class="privilege-title">会员特权</text>
          <view class="privilege-list">
            <view class="privilege-item" v-for="(privilege, index) in privileges" :key="index">
              <text class="privilege-icon">✓</text>
              <text class="privilege-text">{{ privilege }}</text>
            </view>
          </view>
        </view>
        
        <view class="footer-note">
          <text class="note-text">购买即同意相关条款</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'VipRechargeDialog',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      options: [
        { type: 'day', label: '日会员', price: 6, saving: 6, perDay: '6.00' },
        { type: 'month', label: '月会员', price: 18, saving: 12, popular: true, perDay: '0.60' },
        { type: 'year', label: '年会员', price: 68, saving: 52, perDay: '0.19' },
        { type: 'forever', label: '永久会员', price: 168, saving: 131, perDay: '不限时' }
      ],
      selected: 'month',
      privileges: [
        "无广告", "高清画质", "离线下载", "专属内容", "优先更新",
        "多设备登录", "专属客服", "会员活动"
      ]
    }
  },
  methods: {
    selectPlan(type) {
      this.selected = type;
      const element = document.querySelector(`.option-card.active`);
      if (element) {
        element.classList.add('animate__animated', 'animate__pulse');
        setTimeout(() => {
          element.classList.remove('animate__animated', 'animate__pulse');
        }, 800);
      }
    },
    getSelectedPlan() {
      return this.options.find(item => item.type === this.selected);
    },
    pay() {
      const selectedPlan = this.getSelectedPlan();
      this.$emit('pay', selectedPlan);
      
      const btn = document.querySelector('.btn-pay');
      btn.classList.add('animate__animated', 'animate__tada');
      setTimeout(() => {
        btn.classList.remove('animate__animated', 'animate__tada');
      }, 500);
    }
  }
}
</script>

<style scoped>
@font-face {
  font-family: 'PingFang SC';
  src: url('https://fonts.gstatic.com/s/pingfangsc/v1/NotoSansSC-Regular.otf');
}

.recharge-popup {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  font-family: 'PingFang SC', sans-serif;
  overflow: hidden;
}

.popup-overlay {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
}

/* 居中容器 */
.popup-container {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30rpx;
  box-sizing: border-box;
}

.popup-content {
  width: 100%;
  max-width: 680rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx 24rpx;
  position: relative;
  box-sizing: border-box;
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.15);
  animation-duration: 0.3s;
  max-height: 90vh;
  overflow-y: auto;
}

.header-section {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 32rpx;
  position: relative;
  padding: 0 20rpx;
}

.popup-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
}

.popup-close {
  position: absolute;
  right: 20rpx;
  top: 0;
  font-size: 36rpx;
  color: #999;
  width: 50rpx;
  height: 50rpx;
  line-height: 50rpx;
  text-align: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.popup-close:hover {
  background-color: #f5f5f5;
}

/* 网格布局的选项列表 */
.option-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  margin-bottom: 28rpx;
}

.option-card {
  border: 2rpx solid #e6e6e6;
  border-radius: 14rpx;
  padding: 24rpx 12rpx;
  text-align: center;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.option-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4rpx;
  background-color: transparent;
  transition: all 0.3s;
}

.option-card.active {
  border-color: #007AFF;
  transform: translateY(-2rpx);
  box-shadow: 0 6rpx 16rpx rgba(0, 122, 255, 0.15);
}

.option-card.active::before {
  background-color: #007AFF;
}

.option-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 12rpx;
}

.name {
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
}

.popular {
  background-color: #FF3B30;
  color: #fff;
  font-size: 16rpx;
  padding: 2rpx 6rpx;
  border-radius: 8rpx;
  margin-left: 8rpx;
}

.price {
  font-size: 32rpx;
  color: #007AFF;
  font-weight: bold;
  margin-bottom: 8rpx;
  display: inline-block;
}

.saving {
  font-size: 18rpx;
  color: #FF3B30;
  margin-bottom: 6rpx;
  display: inline-block;
}

.per-day {
  font-size: 18rpx;
  color: #999;
}

.btn-pay {
  width: 100%;
  background: linear-gradient(135deg, #007AFF 0%, #0051FF 100%);
  color: #fff;
  padding: 22rpx;
  border-radius: 14rpx;
  font-size: 28rpx;
  font-weight: bold;
  border: none;
  box-shadow: 0 6rpx 20rpx rgba(0, 122, 255, 0.3);
  margin-top: 12rpx;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 4rpx;
}

.btn-subtext {
  font-size: 18rpx;
  opacity: 0.9;
}

.privilege-section {
  margin-top: 32rpx;
  padding-top: 24rpx;
  border-top: 1rpx solid #f0f0f0;
}

.privilege-title {
  font-size: 24rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
  display: block;
}

.privilege-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx 20rpx;
}

.privilege-item {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.privilege-icon {
  color: #4CD964;
  font-size: 22rpx;
  width: 24rpx;
  height: 24rpx;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  background-color: rgba(76, 217, 100, 0.1);
}

.privilege-text {
  font-size: 22rpx;
  color: #666;
  line-height: 1.4;
}

.footer-note {
  margin-top: 24rpx;
  text-align: center;
  padding-bottom: 10rpx;
}

.note-text {
  font-size: 20rpx;
  color: #999;
}

/* 动画效果 */
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

@keyframes tada {
  from { transform: scale3d(1, 1, 1); }
  10%, 20% { transform: scale3d(0.9, 0.9, 0.9) rotate3d(0, 0, 1, -3deg); }
  30%, 50%, 70%, 90% { transform: scale3d(1.05, 1.05, 1.05) rotate3d(0, 0, 1, 3deg); }
  40%, 60%, 80% { transform: scale3d(1.05, 1.05, 1.05) rotate3d(0, 0, 1, -3deg); }
  to { transform: scale3d(1, 1, 1); }
}

.animate__animated {
  animation-fill-mode: both;
}

.animate__fadeIn {
  animation-name: fadeIn;
}

.animate__pulse {
  animation-name: pulse;
  animation-duration: 0.8s;
}

.animate__tada {
  animation-name: tada;
  animation-duration: 0.8s;
}
</style>