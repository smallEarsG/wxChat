<template>
  <view class="container">
    <WatermarkLayer />
    
    <view class="custom-header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="left" @click="goBack">
        <uni-icons type="left" color="#000" size="24"></uni-icons>
      </view>
      <view class="right">
        <uni-icons type="more-filled" size="24" color="#333"></uni-icons>
      </view>
    </view>

    <view class="content">
      <view class="success-icon">
        <view class="check-circle">
          <image src="/static/images/user-checked.png" mode="widthFix" style="width:120rpx;"></image>
        </view>
      </view>

      <view class="recipient-info" @click="openEditModal">
        <text class="recipient-text">{{ billData.recipient }}已收款</text>
        <!-- <uni-icons type="compose" size="20" color="#999"></uni-icons> -->
      </view>

      <view class="amount-section" @click="openEditModal">
        <image src="/static/images/money.png" mode="widthFix" class="money"></image>
        <text class="amount-value">{{ billData.amount }}</text>
        <!-- <uni-icons type="compose" size="20" color="#999" style="margin-left: 16rpx;"></uni-icons> -->
      </view>

      <view class="line"></view>

      <view class="time-info">
        <view class="time-row" @click="openEditModal">
          <text class="time-label">转账时间</text>
          <text class="time-value">{{ billData.transferTime }}</text>
        </view>
        <view class="time-row" @click="openEditModal">
          <text class="time-label">收款时间</text>
          <text class="time-value">{{ billData.receiveTime }}</text>
        </view>
      </view>
    </view>

    <view class="detail-link" @click="goToDetail">
      <text class="link-text">账单详情</text>
    </view>

    <view class="edit-modal-mask" v-if="showModal">
      <view class="edit-modal-overlay" @click="closeEditModal"></view>
      <view class="edit-modal-container">
        <view class="edit-modal">
          <view class="modal-header">
            <text class="modal-title">编辑账单</text>
            <uni-icons type="close" size="24" @click="closeEditModal"></uni-icons>
          </view>
          <view class="modal-body">
            <view class="form-item">
              <text class="form-label">收款人</text>
              <input 
                class="form-input" 
                :value="editForm.recipient" 
                @input="onInputChange('recipient', $event)"
                placeholder="请输入收款人" 
              />
            </view>
            <view class="form-item">
              <text class="form-label">金额</text>
              <input 
                class="form-input" 
                :value="editForm.amount" 
                @input="onInputChange('amount', $event)"
                type="digit" 
                placeholder="请输入金额" 
              />
            </view>
            <view class="form-item">
              <text class="form-label">转账时间</text>
              <input 
                class="form-input" 
                :value="editForm.transferTime" 
                @input="onInputChange('transferTime', $event)"
                placeholder="请输入转账时间" 
              />
            </view>
            <view class="form-item">
              <text class="form-label">收款时间</text>
              <input 
                class="form-input" 
                :value="editForm.receiveTime" 
                @input="onInputChange('receiveTime', $event)"
                placeholder="请输入收款时间" 
              />
            </view>
          </view>
          <view class="modal-footer">
            <button class="btn-cancel" @click="closeEditModal">取消</button>
            <button class="btn-confirm" @click="saveEdit">保存</button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
      billData: {
        recipient: '钧凝商砼生产调度唐光兴',
        amount: '23100.00',
        transferTime: '2026年06月02日 17:27:40',
        receiveTime: '2026年06月02日 17:29:22'
      },
      editForm: {
        recipient: '',
        amount: '',
        transferTime: '',
        receiveTime: ''
      },
      showModal: false
    };
  },
  methods: {
    goBack() {
      uni.navigateBack();
    },
    goToDetail() {
      uni.showToast({
        title: '查看账单详情',
        icon: 'none'
      });
    },
    openEditModal() {
      this.editForm = {
        recipient: this.billData.recipient,
        amount: this.billData.amount,
        transferTime: this.billData.transferTime,
        receiveTime: this.billData.receiveTime
      };
      this.showModal = true;
    },
    closeEditModal() {
      this.showModal = false;
    },
    onInputChange(field, event) {
      this.editForm[field] = event.detail.value;
    },
    saveEdit() {
      if (!this.editForm.recipient || !this.editForm.amount) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        });
        return;
      }
      this.billData = {
        ...this.editForm
      };
      this.showModal = false;
      uni.showToast({
        title: '保存成功',
        icon: 'success'
      });
    }
  }
};
</script>

<style>
	.line{
		width: 100%;
		height: 1px;
		background-color: #f5f5f5;
		transform: scaleY(.8);
		margin-bottom: 40rpx;
	}
.container {
  display: flex;
  flex-direction: column;
  background-color: #ffffff;
  min-height: 100vh;
  position: relative;
}

.custom-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100rpx;
  padding: 0 30rpx;
  background-color: #ffffff;
}

.left, .right {
  width: 80rpx;
  height: 80rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.backimg {
  width: 40rpx;
  height: 40rpx;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80rpx 50rpx;
}

.success-icon {
  margin-bottom: 40rpx;
}

.check-circle {
  border-radius: 50%;
  background-color: #07C160;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 40rpx;
  overflow: hidden;
}

.recipient-info {
  margin-bottom: 30rpx;
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.recipient-text {
  font-size: 32rpx;
  color: #333333;
  text-align: center;
}

.amount-section {
  display: flex;
  align-items: baseline;
  margin-bottom: 60rpx;
  font-family:'WeChat Sans SS';
  position: relative;
}
.money{
	width: 40rpx;
	top: -15rpx;
	margin-right: 10rpx;
}

.amount-symbol {
  font-size: 96rpx;
  font-weight: 800;
  color: #000000;
  margin-right: 8rpx;
}

.amount-value {
  font-size: 96rpx;
  font-weight:500;
  color: #000000;
  font-family:"WeChat Sans Std";
}

.divider {
  width: 100%;
  height: 20rpx;
  background-color: #f5f5f5;
  margin-bottom: 40rpx;
}

.time-info {
  width: 100%;
  padding: 0 20rpx;
  margin-bottom: 60rpx;
}

.time-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20rpx ;
}

.time-row:first-child {
  /* border-bottom: 1rpx solid #f0f0f0; */
}

.time-label {
  font-size: 28rpx;
  color: #999999;
}

.time-value {
  font-size: 28rpx;
  color: #000;
}

.detail-link {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding-bottom: 70rpx;
  width: 100%;
  text-align: center;
  justify-content: center;
}

.link-text {
  font-size: 30rpx;
  color:#5d6897;
  text-align: center;
}

.edit-modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.edit-modal-container {
  position: relative;
  z-index: 1001;
  width: 640rpx;
  max-height: 80vh;
  background-color: #ffffff;
  border-radius: 24rpx;
  overflow: hidden;
}

.edit-modal {
  width: 100%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.modal-body {
  padding: 30rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.form-input {
  width: 100%;
  padding: 20rpx;
  border: 1rpx solid #e0e0e0;
  border-radius: 12rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  height:80rpx
}

.modal-footer {
  display: flex;
  gap: 20rpx;
  padding: 30rpx;
  border-top: 1rpx solid #f0f0f0;
}

.btn-cancel, .btn-confirm {
  flex: 1;
  padding: 24rpx;
  border-radius: 12rpx;
  font-size: 30rpx;
  border: none;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #666;
}

.btn-confirm {
  background-color: #07C160;
  color: #ffffff;
}
</style>
