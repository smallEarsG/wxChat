<template>
  <view class="recharge-popup" v-if="show">
    <view class="popup-content">
      <text class="popup-title">开通VIP会员</text>
      <view class="option-list">
        <view 
          v-for="item in options" 
          :key="item.type" 
          class="option-item" 
          :class="{ active: selected === item.type }"
          @click="selected = item.type"
        >
          <text class="name">{{ item.label }}</text>
          <text class="price">￥{{ item.price }}</text>
        </view>
      </view>

      <button class="btn-pay" @click="pay">立即开通</button>
      <text class="popup-close" @click="$emit('close')">×</text>
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
        { type: 'month', label: '月会员', price: 29.9 },
        { type: 'year', label: '年会员', price: 288.8 }
      ],
      selected: 'month'
    }
  },
  methods: {
    pay() {
      this.$emit('pay', this.selected);
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
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
.popup-content {
  width: 600rpx;
  background: #fff;
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  position: relative;
  box-sizing: border-box;
}
.popup-title {
  font-size: 34rpx;
  font-weight: bold;
  text-align: center;
  margin-bottom: 30rpx;
}
.option-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}
.option-item {
  border: 2rpx solid #eee;
  border-radius: 12rpx;
  padding: 20rpx;
  text-align: center;
}
.option-item.active {
  border-color: #007aff;
  background-color: #e0f0ff;
}
.name {
  font-size: 28rpx;
  display: block;
  margin-bottom: 10rpx;
}
.price {
  font-size: 26rpx;
  color: #007aff;
}
.btn-pay {
  width: 100%;
  background-color: #007aff;
  color: #fff;
  padding: 20rpx;
  border-radius: 12rpx;
  margin-top: 40rpx;
  font-size: 30rpx;
}
.popup-close {
  position: absolute;
  right: 20rpx;
  top: 20rpx;
  font-size: 40rpx;
  color: #999;
}
</style>
