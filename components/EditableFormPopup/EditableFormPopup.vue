<template>
  <view>
    <!-- 弹出表单 -->
    <uni-popup ref="popup" type="center">
      <view class="popup-content">
        <view class="form-header">
          <text class="title">编辑信息</text>
          <view class="close-btn" @click="$refs.popup.close()">
            <uni-icons type="close" size="24" color="#666" />
          </view>
        </view>
        
        <view class="form-body">
          <view v-for="(label, key) in fieldLabels" :key="key" class="form-item">
            <text class="form-label">{{ label }}</text>
            <view class="input-wrapper">
              <uni-icons 
                :type="getIconType(key)" 
                size="18" 
                color="#999" 
                class="input-icon" 
              />
              <input 
                v-model="formData[key]" 
                class="form-input" 
                :placeholder="`请输入${label}`"
                :placeholder-class="errorFields[key] ? 'placeholder-error' : 'placeholder'"
                :class="{ 'input-error': errorFields[key] }"
              />
              <view class="error-message" v-if="errorFields[key]">
                {{ label }}不能为空
              </view>
            </view>
          </view>
        </view>
        
        <view class="form-footer">
          <button class="btn-cancel" @click="$refs.popup.close()">取消</button>
          <button class="btn-submit" @click="submit">提交</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
export default {
  name: 'EditableFormPopup',
  props: {
    // 接收原始对象
    value: {
      type: Object,
      required: true
    },
    // key => 中文名
    fieldLabels: {
      type: Object,
      required: true
    },
    // 字段图标映射
    fieldIcons: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      formData: {},
      errorFields: {}
    };
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        this.formData = { ...newVal };
        this.errorFields = {};
      }
    }
  },
  methods: {
    open() {
      this.$refs.popup.open('center');
    },
    getIconType(key) {
      // 默认图标映射
      const defaultIcons = {
        name: 'person',
        nickname: 'person',
        username: 'person',
        avatar: 'image',
        email: 'mail',
        phone: 'phone',
        address: 'location',
        time: 'time',
        date: 'calendar',
        message: 'message',
        note: 'edit',
        description: 'edit'
      };
      
      // 优先使用传入的图标映射
      return this.fieldIcons[key] || defaultIcons[key] || 'info';
    },
    validateForm() {
      let isValid = true;
      this.errorFields = {};
      
	  // 去掉过滤
      // for (const key in this.fieldLabels) {
      //   if (!this.formData[key] || this.formData[key].toString().trim() === '') {
      //     this.errorFields[key] = true;
      //     isValid = false;
      //   }
      // }
      
      return isValid;
    },
    submit() {
      if (this.validateForm()) {
        this.$emit('submit', { ...this.formData });
        this.$refs.popup.close();
      } else {
        // 显示第一个错误消息
        const firstErrorKey = Object.keys(this.errorFields)[0];
        if (firstErrorKey) {
          uni.showToast({
            title: `${this.fieldLabels[firstErrorKey]}不能为空`,
            icon: 'none'
          });
        }
      }
    }
  }
};
</script>

<style scoped>
/* 弹窗整体样式 */
.popup-content {
  width: 680rpx;
  background-color: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
  padding: 0;
}

/* 表单头部 */
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 40rpx;
  height: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #f5f5f5;
}

/* 表单主体 */
.form-body {
  padding: 40rpx;
}

.form-item {
  margin-bottom: 36rpx;
}

.form-label {
  font-size: 28rpx;
  margin-bottom: 16rpx;
  display: block;
  color: #666;
}

/* 输入框样式 */
.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 24rpx;
  top: 50%;
  transform: translateY(-50%);
}

.form-input {
  border: 1rpx solid #e6e6e6;
  border-radius: 16rpx;
  padding: 24rpx 24rpx 24rpx 68rpx;
  width: 100%;
  font-size: 28rpx;
  height: 88rpx;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #007aff;
  outline: none;
}

/* 错误状态样式 */
.input-error {
  border-color: #ff5252;
}

.error-message {
  color: #ff5252;
  font-size: 24rpx;
  margin-top: 10rpx;
  padding-left: 68rpx;
}

.placeholder {
  color: #bbb;
}

.placeholder-error {
  color: #ff5252;
}

/* 表单底部按钮 */
.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 40rpx;
  border-top: 1rpx solid #f0f0f0;
}

.btn-cancel, .btn-submit {
  flex: 1;
  padding: 20rpx;
  text-align: center;
  border-radius: 16rpx;
  font-size: 30rpx;
  transition: all 0.2s;
}

.btn-cancel {
  color: #666;
  background-color: #f5f5f5;
  margin-right: 20rpx;
}

.btn-cancel:hover {
  background-color: #f0f0f0;
}

.btn-submit {
  color: #fff;
  background-color: #007aff;
}

.btn-submit:hover {
  background-color: #0062cc;
}

.btn-submit:active {
  background-color: #0052a8;
}
</style>
    