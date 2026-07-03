<template>
  <view class="recharge-popup" v-if="show">
    <view class="popup-overlay" @click="$emit('close')"></view>
    <view class="popup-container">
      <view class="popup-content">
        <view class="header-section">
          <text class="popup-title">积分充值</text>
          <text class="popup-close" @click="$emit('close')">×</text>
        </view>

        <view class="option-grid">
          <view
            v-for="item in options"
            :key="item.code"
            class="option-card"
            :class="{ active: selected === item.code, recommended: item.popular }"
            @click="selectPlan(item.code)"
          >
            <view class="option-header">
              <text class="name">￥{{ item.price }}</text>
              <text class="popular" v-if="item.popular">推荐</text>
            </view>
            <text class="points-line">充值 {{ item.basePoints }} 积分</text>
            <text class="bonus-line" v-if="item.bonusPoints">赠送 {{ item.bonusPoints }} 积分</text>
            <text class="total-line">共 {{ item.totalPoints }} 积分</text>
            <text class="highlight" v-if="item.highlight">{{ item.highlight }}</text>
          </view>
        </view>

        <button class="btn-pay" @click="pay">
          <text class="btn-text">立即充值</text>
          <text class="btn-subtext">到账 {{ getSelectedPlan().totalPoints }} 积分</text>
        </button>

        <view class="footer-note">
          <text class="note-text">以上积分含赠送部分，购买即同意相关条款</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PointsRechargeDialog',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      options: [
        { code: 'pkg_1000', price: 9.9, basePoints: 900, bonusPoints: 100, totalPoints: 1000 },
        { code: 'pkg_2300', price: 19.9, basePoints: 2000, bonusPoints: 300, totalPoints: 2300 },
        { code: 'pkg_5000', price: 39.9, basePoints: 4000, bonusPoints: 1000, totalPoints: 5000 },
        {
          code: 'pkg_10000',
          price: 69.9,
          basePoints: 7000,
          bonusPoints: 3000,
          totalPoints: 10000,
          popular: true,
          highlight: '多送3000积分，约可使用333次'
        },
        { code: 'pkg_15000', price: 99, basePoints: 10000, bonusPoints: 5000, totalPoints: 15000 }
      ],
      selected: 'pkg_10000'
    }
  },
  methods: {
    selectPlan(code) {
      this.selected = code
    },
    getSelectedPlan() {
      return this.options.find(item => item.code === this.selected) || this.options[0]
    },
    pay() {
      this.$emit('pay', this.getSelectedPlan())
    }
  }
}
</script>

<style scoped>
.recharge-popup {
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
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
  box-sizing: border-box;
  box-shadow: 0 8rpx 40rpx rgba(0, 0, 0, 0.15);
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
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
  margin-bottom: 28rpx;
}

.option-card {
  border: 2rpx solid #e6e6e6;
  border-radius: 14rpx;
  padding: 20rpx 12rpx;
  text-align: center;
  position: relative;
  background: #fff;
}

.option-card.active {
  border-color: #ef4444;
  box-shadow: 0 6rpx 16rpx rgba(239, 68, 68, 0.15);
}

.option-card.recommended.active {
  border-color: #ef4444;
  background: linear-gradient(180deg, #fff5f5 0%, #fff 100%);
}

.option-header {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 10rpx;
  gap: 8rpx;
}

.name {
  font-size: 30rpx;
  font-weight: 700;
  color: #ef4444;
}

.popular {
  background-color: #ef4444;
  color: #fff;
  font-size: 16rpx;
  padding: 2rpx 8rpx;
  border-radius: 8rpx;
}

.points-line {
  display: block;
  font-size: 22rpx;
  color: #333;
  margin-bottom: 4rpx;
}

.bonus-line {
  display: block;
  font-size: 20rpx;
  color: #ef4444;
  margin-bottom: 4rpx;
}

.total-line {
  display: block;
  font-size: 22rpx;
  color: #666;
  font-weight: 600;
}

.highlight {
  display: block;
  margin-top: 8rpx;
  font-size: 18rpx;
  color: #ef4444;
  line-height: 1.4;
}

.btn-pay {
  width: 100%;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #fff;
  padding: 22rpx;
  border-radius: 14rpx;
  font-size: 28rpx;
  font-weight: bold;
  border: none;
  box-shadow: 0 6rpx 20rpx rgba(239, 68, 68, 0.3);
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

.footer-note {
  margin-top: 24rpx;
  text-align: center;
  padding-bottom: 10rpx;
}

.note-text {
  font-size: 20rpx;
  color: #999;
}
</style>
