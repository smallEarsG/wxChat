<template>
  <view>
    <!-- 文件信息编辑弹窗 -->
    <uni-popup ref="popup" type="center">
      <view class="popup-content">
        <view class="form-header">
          <text class="title">文件信息</text>
          <view class="close-btn" @click="$refs.popup.close()">
            <uni-icons type="close" size="24" color="#666" />
          </view>
        </view>
        
        <view class="form-body">
          <!-- 文件类型选择 -->
          <view class="form-item">
            <text class="form-label">文件类型</text>
            <view class="input-wrapper">
              <uni-icons type="list" size="18" color="#999" class="input-icon" />
              <picker :value="fileTypeIndex" :range="fileTypes" @change="onFileTypeChange" class="picker-input">
                <view class="picker-display">
                  {{ formData.fileType || '请选择文件类型' }}
                  <uni-icons type="right" size="16" color="#999" />
                </view>
              </picker>
            </view>
          </view>
          
          <!-- 文件名称 -->
          <view class="form-item">
            <text class="form-label">文件名称</text>
            <view class="input-wrapper">
              <uni-icons type="paperplane" size="18" color="#999" class="input-icon" />
              <input 
                v-model="formData.fileName" 
                class="form-input" 
                placeholder="请输入文件名称"
                :class="{ 'input-error': errorFields.fileName }"
              />
            </view>
            <view class="error-message" v-if="errorFields.fileName">
              文件名称不能为空
            </view>
          </view>
          
          <!-- 文件大小 -->
          <view class="form-item">
            <text class="form-label">文件大小</text>
            <view class="input-wrapper size-wrapper">
              <uni-icons type="folder-add" size="18" color="#999" class="input-icon" />
              <input 
                v-model="formData.fileSize" 
                type="digit"
                class="form-input size-input" 
                placeholder="请输入大小"
                :class="{ 'input-error': errorFields.fileSize }"
              />
              <picker :value="sizeUnitIndex" :range="sizeUnits" @change="onSizeUnitChange" class="unit-picker">
                <view class="unit-display">
                  {{ formData.sizeUnit }}
                  <uni-icons type="down" size="12" color="#999" />
                </view>
              </picker>
            </view>
            <view class="error-message" v-if="errorFields.fileSize">
              文件大小不能为空
            </view>
          </view>
		  
		  <view class="form-item">
		              <text class="form-label">是否为电脑文件</text>
		              <view class="switch-wrapper">
		                <uni-icons type="laptop" size="18" color="#999" class="input-icon" />
		                <switch 
		                  :checked="formData.isCop" 
		                  @change="onIsCopChange" 
		                  color="#007aff"
		                  class="form-switch"
		                />
		                <text class="switch-label">{{ formData.isCop ? '是' : '否' }}</text>
		              </view>
		            </view>
        </view>
        
        <view class="form-footer">
          <button class="btn-cancel" @click="$refs.popup.close()">取消</button>
          <button class="btn-submit" @click="submit">确定</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
export default {
  name: 'FileEditPopup',
  props: {
    fileTypes: {
      type: Array,
      default: () => ['文档', '图片', '视频', '音频', '压缩包', '其他']
    }
  },
  data() {
    return {
      formData: {
        fileType: '文档',
        fileName: '',
        fileSize: '',
        sizeUnit: 'MB',
		isCop:false,
      },
      errorFields: {},
      fileTypeIndex: 0,
      sizeUnitIndex: 1,
      sizeUnits: ['K','KB', 'MB', 'GB'],
	 
    };
  },
  methods: {
	
    open() {
      // 重置表单数据
      this.formData = {
        fileType: '文档',
        fileName: '',
        fileSize: '',
        sizeUnit: 'MB',
		isCop:false
      };
      this.errorFields = {};
      this.fileTypeIndex = 0;
      this.sizeUnitIndex = 1;
      this.$refs.popup.open('center');
    },
    onIsCopChange(e) {
          this.formData.isCop = e.detail.value;
    },
    onFileTypeChange(e) {
      this.fileTypeIndex = e.detail.value;
      this.formData.fileType = this.fileTypes[e.detail.value];
    },
    
    onSizeUnitChange(e) {
      this.sizeUnitIndex = e.detail.value;
      this.formData.sizeUnit = this.sizeUnits[e.detail.value];
    },
    
    validateForm() {
      let isValid = true;
      this.errorFields = {};
      
      if (!this.formData.fileName || this.formData.fileName.trim() === '') {
        this.errorFields.fileName = true;
        isValid = false;
      }
      
      if (!this.formData.fileSize || this.formData.fileSize.toString().trim() === '') {
        this.errorFields.fileSize = true;
        isValid = false;
      }
      
      return isValid;
    },
    
    submit() {
      if (this.validateForm()) {
        const fileData = {
          ...this.formData,
          displaySize: `${this.formData.fileSize}${this.formData.sizeUnit}`
        };
		console.log(fileData);
        this.$emit('submit', fileData);
        this.$refs.popup.close();
      } else {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        });
      }
    }
  }
};
</script>

<style scoped>
	/* 开关样式 */
	.switch-wrapper {
	  display: flex;
	  align-items: center;
	  padding: 24rpx 24rpx 24rpx 68rpx;
	  border: 1rpx solid #e6e6e6;
	  border-radius: 16rpx;
	  height: 88rpx;
	  box-sizing: border-box;
	}
	
	.form-switch {
	  margin-right: 20rpx;
	}
	
	.switch-label {
	  font-size: 28rpx;
	  color: #333;
	}
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
  max-height: 600rpx;
  overflow-y: auto;
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
  z-index: 1;
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

/* Picker 样式 */
.picker-input {
  width: 100%;
}

.picker-display {
  border: 1rpx solid #e6e6e6;
  border-radius: 16rpx;
  padding: 24rpx 24rpx 24rpx 68rpx;
  height: 88rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 28rpx;
  color: #333;
}

/* 文件大小输入框特殊布局 */
.size-wrapper {
  display: flex;
  align-items: center;
}

.size-input {
  flex: 1;
  margin-right: 20rpx;
}

.unit-picker {
  flex-shrink: 0;
}

.unit-display {
  border: 1rpx solid #e6e6e6;
  border-radius: 16rpx;
  padding: 24rpx 30rpx;
  height: 88rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #333;
  min-width: 140rpx;
  background-color: #f9f9f9;
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


