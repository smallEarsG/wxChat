<template>
  <view>
    <!-- 弹出表单 -->
    <uni-popup ref="popup" type="center">
      <view class="popup-content">
        <view class="form-header">
          <text class="title">插入提示消息</text>
          <view class="close-btn" @click="closePopup">
            <uni-icons type="close" size="24" color="#666" />
          </view>
        </view>
        
        <view class="form-body">
          <!-- 提示类型选择 -->
          <view class="form-item">
            <text class="form-label">提示类型</text>
            <view class="type-selector">
              <view 
                class="type-option" 
                :class="{ active: tipType === 'recall' }"
                @click="tipType = 'recall'"
              >
                撤回消息
              </view>
              <view 
                class="type-option" 
                :class="{ active: tipType === 'redbag' }"
                @click="tipType = 'redbag'"
              >
                领取红包
              </view>
            </view>
          </view>
          
          <!-- 撤回消息编辑 -->
          <view v-if="tipType === 'recall'" class="form-item">
            <text class="form-label">撤回人名称</text>
            <view class="input-wrapper">
              <uni-icons type="person" size="18" color="#999" class="input-icon" />
              <input 
                v-model="recallName" 
                class="form-input" 
                placeholder="请输入撤回人名称"
                placeholder-class="placeholder"
                :maxlength="20"
              />
            </view>
          </view>
          
          <!-- 领取红包编辑 -->
          <view v-if="tipType === 'redbag'" class="form-item">
            <text class="form-label">领取人名称</text>
            <view class="input-wrapper">
              <uni-icons type="person" size="18" color="#999" class="input-icon" />
              <input 
                v-model="receiverName" 
                class="form-input" 
                placeholder="请输入领取人名称"
                placeholder-class="placeholder"
                :maxlength="20"
              />
            </view>
          </view>
          
          <view v-if="tipType === 'redbag'" class="form-item">
            <text class="form-label">发送人名称</text>
            <view class="input-wrapper">
              <uni-icons type="person" size="18" color="#999" class="input-icon" />
              <input 
                v-model="senderName" 
                class="form-input" 
                placeholder="请输入发送人名称"
                placeholder-class="placeholder"
                :maxlength="20"
              />
            </view>
          </view>
        </view>
        
        <view class="form-footer">
          <button class="btn-cancel" @click="closePopup">取消</button>
          <button class="btn-submit" @click="submit">{{ isEditMode ? '保存' : '插入' }}</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
export default {
  name: 'TipInsertPopup',
  data() {
    return {
      tipType: 'recall', // 'recall' 或 'redbag'
      recallName: 'Caleb',
      receiverName: '你',
      senderName: 'Caleb',
      isEditMode: false,
      editData: null
    };
  },
  methods: {
    // 打开弹窗
    open() {
      this.$refs.popup.open();
      // 重置表单
      this.tipType = 'recall';
      this.recallName = 'Caleb';
      this.receiverName = '你';
      this.senderName = 'Caleb';
      this.isEditMode = false;
      this.editIndex = -1;
    },
    
    // 打开弹窗用于编辑
    openForEdit(data) {
      this.$refs.popup.open();
      this.tipType = data.tipType || 'recall';
      this.recallName = data.recallName || 'Caleb';
      this.receiverName = data.receiverName || '你';
      this.senderName = data.senderName || 'Caleb';
      this.isEditMode = true;
      this.editData = data;
    },
    
    // 关闭弹窗
    closePopup() {
      this.$refs.popup.close();
    },
    
    // 提交
    submit() {
      let tipData = {};
      
      if (this.tipType === 'recall') {
        if (!this.recallName || !this.recallName.trim()) {
          uni.showToast({
            title: '请输入撤回人名称',
            icon: 'none'
          });
          return;
        }
        tipData = {
          type: 'tips',
          contentType: 'notification',
          notificationType: 'recall',
          content: this.recallName.trim(),
          location: 0
        };
      } else if (this.tipType === 'redbag') {
        if (!this.receiverName || !this.receiverName.trim()) {
          uni.showToast({
            title: '请输入领取人名称',
            icon: 'none'
          });
          return;
        }
        if (!this.senderName || !this.senderName.trim()) {
          uni.showToast({
            title: '请输入发送人名称',
            icon: 'none'
          });
          return;
        }
        tipData = {
          type: 'tips',
          contentType: 'notification',
          notificationType: 'redbag',
          receiverName: this.receiverName.trim(),
          senderName: this.senderName.trim(),
          location: 0
        };
      }
      
      if (this.isEditMode) {
        this.$emit('edit', tipData);
      } else {
        this.$emit('submit', tipData);
      }
      this.closePopup();
    }
  }
};
</script>

<style scoped>
.popup-content {
  width: 600rpx;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  border-bottom: 1rpx solid #eee;
}

.title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.close-btn {
  padding: 8rpx;
}

.form-body {
  padding: 32rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.form-item {
  margin-bottom: 32rpx;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.type-selector {
  display: flex;
  gap: 16rpx;
}

.type-option {
  flex: 1;
  padding: 20rpx;
  text-align: center;
  border: 2rpx solid #e5e5e5;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #666;
  background-color: #f8f8f8;
}

.type-option.active {
  border-color: #007aff;
  color: #007aff;
  background-color: #e6f3ff;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  border: 1rpx solid #e5e5e5;
  border-radius: 8rpx;
  background-color: #f8f8f8;
  padding: 0 20rpx;
}

.input-icon {
  margin-right: 12rpx;
}

.form-input {
  flex: 1;
  padding: 20rpx 0;
  font-size: 28rpx;
  color: #333;
}

.placeholder {
  color: #999;
}

.form-footer {
  display: flex;
  border-top: 1rpx solid #eee;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 28rpx 0;
  font-size: 30rpx;
  border: none;
  background-color: transparent;
}

.btn-cancel {
  color: #666;
  border-right: 1rpx solid #eee;
}

.btn-submit {
  color: #007aff;
  font-weight: 600;
}
</style>