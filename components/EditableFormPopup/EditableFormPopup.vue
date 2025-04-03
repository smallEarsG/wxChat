<template>
  <view>
    <!-- 弹出表单 -->
    <uni-popup ref="popup" type="center">
      <view class="popup-content">
        <view v-for="(label, key) in fieldLabels" :key="key" class="form-item">
          <text class="form-label">{{ label }}</text>
          <input v-model="formData[key]" class="form-input" />
        </view>
        <button @click="submit">提交</button>
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
      handler(newVal) {
        this.formData = { ...newVal };
      }
    }
  },
  methods: {
    open() {
      this.$refs.popup.open('center');
    },
    submit() {
      for (const key in this.fieldLabels) {
        if (!this.formData[key] || this.formData[key].toString().trim() === '') {
          uni.showToast({
            title: `${this.fieldLabels[key]}不能为空`,
            icon: 'none'
          });
          return;
        }
      }
      this.$emit('submit', { ...this.formData });
      this.$refs.popup.close();
    }
  }
};
</script>

<style scoped>
.popup-content {
  background-color: #fff;
  padding: 20rpx;
  border-radius: 12rpx;
  width: 600rpx;
}
.form-item {
  margin-bottom: 20rpx;
}
.form-label {
  display: block;
  margin-bottom: 10rpx;
  font-size: 28rpx;
  color: #333;
}
.form-input {
  border: 1px solid #ccc;
  border-radius: 8rpx;
  padding: 10rpx;
  width: 100%;
}
</style>
