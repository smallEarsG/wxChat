<template>
  <view>
    <uni-popup ref="popup" :type="popupType">
      <view class="popup-content">
        <view class="form-header">
          <text class="title">编辑工作台</text>
          <view class="close-btn" @click="close">
            <uni-icons type="close" size="24" color="#666" />
          </view>
        </view>

        <view class="form-body">
          <view
            v-for="(label, key) in fieldLabels"
            :key="key"
            class="form-item"
          >
            <text class="form-label">{{ label }}</text>
            <input
              v-model="formData[key]"
              class="form-input"
              :placeholder="`请输入${label}`"
              type="text"
            />
          </view>

          <view class="form-item">
            <text class="form-label">统一字体粗细</text>
            <view class="weight-row">
              <text class="weight-label">font-weight</text>
              <text class="weight-value">{{ formData.fontWeight }}</text>
            </view>
            <slider
              :value="formData.fontWeight"
              min="100"
              max="900"
              step="100"
              show-value
              activeColor="#007aff"
              backgroundColor="#e6e6e6"
              @change="handleWeightChange"
            />
          </view>

          <view class="form-item" v-if="fieldLabels.fontSize">
            <text class="form-label">{{ fieldLabels.fontSize }}</text>
            <view class="weight-row">
              <text class="weight-label">font-size</text>
              <text class="weight-value">{{ formData.fontSize }}rpx</text>
            </view>
            <slider
              :value="formData.fontSize"
              min="24"
              max="100"
              step="2"
              show-value
              activeColor="#007aff"
              backgroundColor="#e6e6e6"
              @change="handleFontSizeChange"
            />
          </view>
        </view>

        <view class="form-footer">
          <button class="btn-cancel" @click="close">取消</button>
          <button class="btn-submit" @click="submit">提交</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
export default {
  name: 'WorkbenchEditPopup',
  props: {
    value: {
      type: Object,
      required: true
    },
    fieldLabels: {
      type: Object,
      required: true
    },
    popupType: {
      type: String,
      default: 'center'
    }
  },
  data() {
    return {
      formData: {}
    };
  },
  watch: {
    value: {
      immediate: true,
      deep: true,
      handler(newVal) {
        this.formData = this.buildFormData(newVal);
      }
    }
  },
  methods: {
    buildFormData(source = {}) {
      const nextData = { ...source };

      Object.keys(this.fieldLabels).forEach((key) => {
        if (!nextData.hasOwnProperty(key)) {
          nextData[key] = '';
        }
      });

      nextData.fontWeight = this.normalizeWeight(
        nextData.fontWeight || nextData.t1FontWeight || nextData.t2FontWeight || nextData.t3FontWeight
      );

      nextData.fontSize = this.normalizeSize(nextData.fontSize);

      return nextData;
    },
    normalizeWeight(value) {
      const numericValue = Number(value);

      if (isNaN(numericValue)) {
        return 600;
      }

      const safeValue = Math.min(900, Math.max(100, numericValue));
      return Math.round(safeValue / 100) * 100;
    },
    normalizeSize(value) {
      const numericValue = Number(value);
      if (isNaN(numericValue)) {
        return 48;
      }
      return Math.min(100, Math.max(24, numericValue));
    },
    handleWeightChange(event) {
      const rawValue = event && event.detail ? event.detail.value : 600;
      this.$set(this.formData, 'fontWeight', this.normalizeWeight(rawValue));
    },
    handleFontSizeChange(event) {
      const rawValue = event && event.detail ? event.detail.value : 48;
      this.$set(this.formData, 'fontSize', this.normalizeSize(rawValue));
    },
    open() {
      this.formData = this.buildFormData(this.value);
      this.$refs.popup.open(this.popupType);
    },
    close() {
      this.$refs.popup.close();
    },
    submit() {
      this.$emit('submit', { ...this.formData });
      this.close();
    }
  }
};
</script>

<style scoped>
.popup-content {
  width: 680rpx;
  background-color: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

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
}

.form-body {
  padding: 40rpx;
  flex: 1;
  overflow-y: auto;
}

.form-item {
  margin-bottom: 40rpx;
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

.form-input {
  width: 100%;
  height: 88rpx;
  padding: 0 24rpx;
  box-sizing: border-box;
  border: 1rpx solid #e6e6e6;
  border-radius: 16rpx;
  font-size: 28rpx;
}

.weight-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20rpx 0 8rpx;
}

.weight-label,
.weight-value {
  font-size: 24rpx;
  color: #666;
}

.form-footer {
  display: flex;
  padding: 30rpx 40rpx;
  border-top: 1rpx solid #f0f0f0;
}

.btn-cancel,
.btn-submit {
  flex: 1;
  padding: 20rpx;
  text-align: center;
  border-radius: 16rpx;
  font-size: 30rpx;
}

.btn-cancel {
  margin-right: 20rpx;
  color: #666;
  background-color: #f5f5f5;
}

.btn-submit {
  color: #fff;
  background-color: #007aff;
}
</style>
