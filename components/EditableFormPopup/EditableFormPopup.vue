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
              <!-- 表情按钮（对文本输入字段显示，且启用富文本时） -->
              <view v-if="enableRichText && isTextInput(key)" class="emoji-btn-wrapper">
                <image 
                  class="emoji-btn" 
                  src="/static/icon-face.png" 
                  @click="toggleEmoji(key)"
                />
              </view>
              <!-- 根据字段类型显示不同的输入组件 -->
              <view v-if="key === 'padd'" class="slider-container">
                <slider 
                  v-model="formData[key]" 
                  min="0" 
                  max="100" 
                  show-value
                  activeColor="#007aff"
                  backgroundColor="#e6e6e6"
                  :class="{ 'input-error': errorFields[key] }"
                  @change="handleSliderChange(key, $event)"
                />
              </view>
              <view v-else-if="key === 'order' || key === 'showReward' || key === 'showAutoDeduction' || key === 'showService'" class="switch-container">
                <switch 
                  :checked="formData[key]" 
                  color="#007aff"
                  :class="{ 'input-error': errorFields[key] }"
                  @change="handleSwitchChange(key, $event)"
                />
              </view>
              <view v-else-if="key === 'fontSize'" class="slider-container">
                <slider 
                  v-model="formData[key]" 
                  min="50" 
                  max="200" 
                  show-value
                  activeColor="#007aff"
                  backgroundColor="#e6e6e6"
                  :class="{ 'input-error': errorFields[key] }"
                  @change="handleSliderChange(key, $event)"
                />
              </view>
			  
			  <view v-else-if="key === 'orderNumber'" class="orderNumberBox">
			    <input
			      v-model="formData[key]" 
			      class="form-input" 
			      :placeholder="`请输入${label}`"
			      :placeholder-class="errorFields[key] ? 'placeholder-error' : 'placeholder'"
			      :class="{ 'input-error': errorFields[key] }"
			    /> 
				<button class="mini-btn" type="primary"  @click="createOrderNumber(key)">生成</button>
			  </view>
              <!-- 富文本模式使用 textarea，非富文本模式使用 input -->
              <textarea 
                v-else-if="enableRichText && isTextInput(key)"
                v-model="formData[key]" 
                class="form-textarea" 
                :class="{ 'textarea-with-emoji': true, 'input-error': errorFields[key] }"
                :placeholder="`请输入${label}`"
                :placeholder-class="errorFields[key] ? 'placeholder-error' : 'placeholder'"
                :auto-height="true"
                :maxlength="-1"
                :show-confirm-bar="false"
                :cursor-spacing="20"
              />
              <input
                v-else
                v-model="formData[key]" 
                class="form-input" 
                :class="{ 'input-error': errorFields[key] }"
                :placeholder="`请输入${label}`"
                :placeholder-class="errorFields[key] ? 'placeholder-error' : 'placeholder'"
                type="text"
              /> 
              <view class="error-message" v-if="errorFields[key]">
                {{ label }}不能为空
              </view>
            </view>
          </view>
        </view>
        
        <!-- 表情选择器（仅在启用富文本时显示） -->
        <view v-if="enableRichText && showEmojiPicker" class="emoji-picker-container">
          <view class="emoji-picker">
            <view 
              v-for="index in total" 
              :key="index" 
              class="emoji-item" 
              @click="addEmojiToInput(index)"
            >
              <image :src="getEmojiUrl(index)" class="emoji-img" />
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
    },
    // 是否启用富文本功能（表情等）
    enableRichText: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      formData: {},
      errorFields: {},
      showEmojiPicker: false,
      currentEmojiField: null, // 当前正在添加表情的字段
      total: 331 // 表情总数（与项目中的表情数量一致）
    };
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        // 确保数据类型正确
        this.formData = {
          ...newVal,
          padd: typeof newVal.padd === 'number' ? newVal.padd : 50,
          order: typeof newVal.order === 'boolean' ? newVal.order : false,
          showReward: newVal.hasOwnProperty('showReward') ? newVal.showReward : false,
          showAutoDeduction: newVal.hasOwnProperty('showAutoDeduction') ? newVal.showAutoDeduction : true,
          showService: newVal.hasOwnProperty('showService') ? newVal.showService : true,
          fontSize: typeof newVal.fontSize === 'number' ? newVal.fontSize : 100
        };
        this.errorFields = {};
      }
    }
  },
  methods: {
    open() {
      // 确保所有 fieldLabels 中的字段都在 formData 中
      for (const key in this.fieldLabels) {
        if (!this.formData.hasOwnProperty(key)) {
          // 根据字段类型设置默认值
          if (key === 'order' || key === 'showReward' || key === 'showAutoDeduction' || key === 'showService') {
            this.formData[key] = key === 'showService' ? true : false;
          } else if (key === 'padd') {
            this.formData[key] = 50;
          } else if (key === 'fontSize') {
            this.formData[key] = 100;
          } else {
            this.formData[key] = '';
          }
        }
      }
      this.showEmojiPicker = false; // 重置表情面板状态
      this.currentEmojiField = null; // 重置当前表情字段
      this.$refs.popup.open('center');
    },
    createOrderNumber(key) {
      try {
        const orderNumber = this.generateOrderNumber(this.formData.time ||this.formData.createTime);
        this.formData[key] = orderNumber;
      } catch (error) {
        uni.showModal({
          title: '生成失败',
          content: error.message || '生成订单号失败，请检查时间格式后重试',
          showCancel: false
        });
      }
    },
    resolveDateFromInput(datetimeStr) {
      const timeLabel = this.fieldLabels?.time || '时间';

      if (datetimeStr === undefined || datetimeStr === null || datetimeStr === '') {
        return { error: `${timeLabel}不能为空，请先输入${timeLabel}` };
      }

      const ensureValidDate = (date) => {
        if (date instanceof Date && !isNaN(date.getTime())) {
          return { date };
        }
        return { error: `${timeLabel}无效，请重新输入` };
      };

      const validateParts = (year, month, day, hour, minute, second) => {
        if (!Number.isInteger(year) || year < 1900 || year > 2100) {
          return '年份应在1900-2100之间';
        }
        if (!Number.isInteger(month) || month < 1 || month > 12) {
          return '月份应为01-12';
        }
        const maxDay = new Date(year, month, 0).getDate();
        if (!Number.isInteger(day) || day < 1 || day > maxDay) {
          return `日期应为01-${String(maxDay).padStart(2, '0')}`;
        }
        if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
          return '小时应为00-23';
        }
        if (!Number.isInteger(minute) || minute < 0 || minute > 59) {
          return '分钟应为00-59';
        }
        if (!Number.isInteger(second) || second < 0 || second > 59) {
          return '秒钟应为00-59';
        }
        return null;
      };

      if (datetimeStr instanceof Date) {
        return ensureValidDate(datetimeStr);
      }

      if (typeof datetimeStr === 'string') {
        const trimmed = datetimeStr.trim();
        if (!trimmed) {
          return { error: `${timeLabel}不能为空，请先输入${timeLabel}` };
        }

        const normalized = trimmed.replace(/-/g, '/');
        const directDate = new Date(normalized);
        if (!isNaN(directDate.getTime())) {
          return { date: directDate };
        }

        const patterns = [
          {
            regex: /^(\d{4})年(\d{1,2})月(\d{1,2})日\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?(?:\.(\d{1,3}))?$/,
            descriptor: 'YYYY年MM月DD日 HH:mm:ss'
          },
          {
            regex: /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})[ T](\d{1,2}):(\d{1,2})(?::(\d{1,2}))?(?:\.(\d{1,3}))?$/,
            descriptor: 'YYYY-MM-DD HH:mm:ss'
          }
        ];

        for (const pattern of patterns) {
          const match = trimmed.match(pattern.regex);
          if (match) {
            const year = parseInt(match[1], 10);
            const month = parseInt(match[2], 10);
            const day = parseInt(match[3], 10);
            const hour = parseInt(match[4], 10);
            const minute = parseInt(match[5], 10);
            const second = match[6] ? parseInt(match[6], 10) : 0;

            const partError = validateParts(year, month, day, hour, minute, second);
            if (partError) {
              return { error: `${timeLabel}格式错误：${partError}` };
            }

            const date = new Date(year, month - 1, day, hour, minute, second, 0);
            return ensureValidDate(date);
          }
        }

        return {
          error: `${timeLabel}格式无法识别，请使用 ${patterns[0].descriptor} 或 ${patterns[1].descriptor}`
        };
      }

      return { error: `${timeLabel}格式无法识别，请重新输入` };
    },
    generateOrderNumber(datetimeStr) {
      const { date, error } = this.resolveDateFromInput(datetimeStr);
      if (error) {
        throw new Error(error);
      }

      // 1. 随机地区前缀 (6位) - 模拟中国各地区行政代码
      const regionCodes = [
        '110000', // 北京市
        '120000', // 天津市
        '130000', // 河北省
        '140000', // 山西省
        '150000', // 内蒙古自治区
        '210000', // 辽宁省
        '220000', // 吉林省
        '230000', // 黑龙江省
        '310000', // 上海市
        '320000', // 江苏省
        '330000', // 浙江省
        '340000', // 安徽省
        '350000', // 福建省
        '360000', // 江西省
        '370000', // 山东省
        '410000', // 河南省
        '420000', // 湖北省
        '430000', // 湖南省
        '440000', // 广东省
        '450000', // 广西壮族自治区
        '460000', // 海南省
        '500000', // 重庆市
        '510000', // 四川省
        '520000', // 贵州省
        '530000', // 云南省
        '540000', // 西藏自治区
        '610000', // 陕西省
        '620000', // 甘肃省
        '630000', // 青海省
        '640000', // 宁夏回族自治区
        '650000' // 新疆维吾尔自治区
      ];
      // 随机选择一个地区代码作为前缀
      const prefix = regionCodes[Math.floor(Math.random() * regionCodes.length)];

      // 2. 业务类型标识 (4位) - 推测为产品/业务线编码
      const businessCode = '2690'; // 示例中固定值

      // 3. 日期部分 (8位) - YYYYMMDD
      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const datePart = year + month + day; // 示例中为20250623

      // 4. 随机序列号 (10位) - 确保当天唯一性
      // 生成规则模拟：前2位可能为小时相关，后8位随机
      const hour = date.getHours().toString().padStart(2, '0');
      const randomPart = hour + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

      // 5. 组合所有部分 (共28位)
      const preChecksum = prefix + businessCode + datePart + randomPart;

      // 6. 生成校验位 (最后1位)
      let sum = 0;
      for (let i = 0; i < preChecksum.length; i++) {
        sum += parseInt(preChecksum[i], 10);
      }
      const checksum = (sum % 10).toString();

      // 最终订单号
      return preChecksum + checksum;
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
        description: 'edit',
        padd: 'progress',
        order: 'switch',
        fontSize: 'font'
      };
      
      // 优先使用传入的图标映射
      return this.fieldIcons[key] || defaultIcons[key] || 'info';
    },
    handleSliderChange(key, event) {
      const rawValue = event?.detail?.value ?? event?.mp?.detail?.value ?? event?.target?.value;
      const numericValue = Number(rawValue);
      if (!isNaN(numericValue)) {
        this.formData[key] = numericValue;
      }
    },
    handleSwitchChange(key, event) {
      // 确保开关值是布尔类型，兼容不同平台的事件格式
      const value = event?.detail?.value ?? event?.mp?.detail?.value ?? event?.target?.value;
      this.formData[key] = Boolean(value);
    },
    validateForm() {
      let isValid = true;
      this.errorFields = {};
      
      // 对非开关和滑块字段进行空值校验
      // for (const key in this.fieldLabels) {
      //   if (key !== 'order' && key !== 'padd' && (!this.formData[key] || this.formData[key].toString().trim() === '')) {
      //     this.errorFields[key] = true;
      //     isValid = false;
      //   }
      // }
      
      return isValid;
    },
    isTextInput(key) {
      // 判断是否为文本输入字段（排除滑块、开关等特殊字段）
      return key !== 'padd' && 
             key !== 'order' && 
             key !== 'showReward' && 
             key !== 'showAutoDeduction' && 
             key !== 'showService' && 
             key !== 'fontSize' && 
             key !== 'orderNumber';
    },
    toggleEmoji(fieldKey) {
      // 只有在启用富文本时才允许切换表情选择器
      if (!this.enableRichText) {
        return;
      }
      if (this.showEmojiPicker && this.currentEmojiField === fieldKey) {
        // 如果当前字段的表情面板已打开，则关闭
        this.showEmojiPicker = false;
        this.currentEmojiField = null;
      } else {
        // 打开指定字段的表情面板
        this.showEmojiPicker = true;
        this.currentEmojiField = fieldKey;
      }
    },
    getEmojiUrl(index) {
      return `/static/emoji/emoji_${index}.png`;
    },
    addEmojiToInput(index) {
      // 只有在启用富文本时才允许添加表情
      if (!this.enableRichText) {
        return;
      }
      // 向当前选中的字段添加表情
      if (this.currentEmojiField && this.formData[this.currentEmojiField] !== undefined) {
        if (this.formData[this.currentEmojiField] === null) {
          this.formData[this.currentEmojiField] = '';
        }
        this.formData[this.currentEmojiField] += `[emoji_${index}]`;
      }
    },
    submit() {
      console.log('提交表单数据:', this.formData); // 调试输出
      if (this.validateForm()) {
        console.log('表单验证通过，发射提交事件'); // 调试输出
        this.showEmojiPicker = false; // 关闭表情面板
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
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

/* 表单头部 */
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
}
.orderNumberBox{
	display: flex;
	justify-content: center;
	align-items: center;
}
.title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}
.mini-btn{
	font-size: 16rpx;
	width: 120rpx;
	margin-left: 20rpx;
	/* height: 80rpx; */
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
  flex: 1;
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
  top: 28rpx;
  transform: translateY(0);
  z-index: 1;
}

.form-input {
  border: 1rpx solid #e6e6e6;
  border-radius: 16rpx;
  padding: 24rpx 24rpx 24rpx 68rpx;
  width: 100%;
  font-size: 28rpx;
  height: 88rpx;
  line-height: 40rpx;
  box-sizing: border-box;
  transition: border-color 0.2s;
  overflow-x: auto;
  overflow-y: hidden;
}

.form-input:focus {
  border-color: #007aff;
  outline: none;
}

/* 多行文本输入框样式 */
.form-textarea {
  border: 1rpx solid #e6e6e6;
  border-radius: 16rpx;
  padding: 24rpx 24rpx 24rpx 68rpx;
  width: 100%;
  font-size: 28rpx;
  min-height: 200rpx;
  box-sizing: border-box;
  transition: border-color 0.2s;
  line-height: 1.8;
  word-wrap: break-word;
  word-break: break-all;
  vertical-align: top;
}

.form-textarea:focus {
  border-color: #007aff;
  outline: none;
}

/* 滑块容器样式 */
.slider-container {
  padding: 24rpx 24rpx 24rpx 68rpx;
  height: 88rpx;
  box-sizing: border-box;
}

/* 开关容器样式 */
.switch-container {
  padding: 24rpx 24rpx 24rpx 68rpx;
  height: 88rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
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

/* 表情按钮样式 */
.emoji-btn-wrapper {
  position: absolute;
  right: 24rpx;
  top: 24rpx;
  z-index: 10;
}

.emoji-btn {
  width: 40rpx;
  height: 40rpx;
  cursor: pointer;
}

/* 带表情按钮的输入框 */
.input-with-emoji {
  padding-right: 80rpx !important;
}

.textarea-with-emoji {
  padding-right: 80rpx !important;
}

/* 表情选择器容器 */
.emoji-picker-container {
  max-height: 400rpx;
  overflow: hidden;
  border-top: 1rpx solid #f0f0f0;
}

.emoji-picker {
  background-color: #fff;
  height: 360rpx;
  overflow: auto;
  display: flex;
  flex-wrap: wrap;
  padding: 10rpx;
}

.emoji-item {
  width: 80rpx;
  height: 76rpx;
  margin: 10rpx;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.emoji-item:active {
  background-color: #f5f5f5;
  border-radius: 8rpx;
}

.emoji-img {
  width: 32px;
  height: 32px;
}
</style>    