<template>
  <view class="receipt-container">
    <!-- 顶部返回箭头 -->
    <view class="back-arrow" @click="goBack" :style="{ paddingTop: statusBarHeight + 'px' }">
      <uni-icons type="arrow-left" size="30"></uni-icons>
    </view>
    
    <!-- 时钟图标及待收款标题等 -->
    <image class="clock-icon" src="/static/qiw/clock.png"></image>
    <text class="status-text">待收款</text>
    
    <!-- 金额显示区域 -->
    <view @click="openEditModal('amount')">
      <view class="money-text">￥<text style="font-family: WeChat Sans Std;">{{info.amount}}</text></view>
      <uni-icons type="edit" size="24" color="#999"></uni-icons>
    </view>
    
    <text class="tip-text">收款后资金将存入企业账户</text>
    
    <!-- 商户名称显示区域 -->
    <view class="info-item edit-item" @click="openEditModal('name')">
      <text class="info-label">入账商户</text>
      <text class="info-value">{{info.name}}</text>
      <uni-icons type="edit" size="24" color="#999"></uni-icons>
    </view>
    
    <!-- 时间显示区域 -->
    <view class="info-item edit-item" @click="openEditModal('time')">
      <text class="info-label">转账时间</text>
      <text class="info-value">{{info.time}}</text>
      <uni-icons type="edit" size="24" color="#999"></uni-icons>
    </view>
    
    <!-- 收款按钮 -->
    <view class="footer">
      <button class="receipt-btn" @click="handleReceipt">收款</button>
      <text class="refund-tip">1天内未确认，将退还给对方。<text class="refund-link" @click="handleRefund">退还</text></text>
    </view>
    
    <!-- 编辑弹框 -->
    <view class="modal-mask" v-if="showModal" @click="closeModal"></view>
    <view class="modal-container" v-if="showModal">
      <view class="modal-header">
        <text>{{modalTitle}}</text>
        <uni-icons type="closeempty" size="30" @click="closeModal"></uni-icons>
      </view>
      
      <view class="modal-content">
        <!-- 金额编辑 -->
        <view v-if="editType === 'amount'">
          <input class="edit-input" type="digit" v-model="tempValue" placeholder="请输入金额">
        </view>
        
        <!-- 商户名称编辑 -->
        <view v-if="editType === 'name'">
          <input class="edit-input" v-model="tempValue" placeholder="请输入商户名称">
        </view>
        
        <!-- 时间编辑 -->
        <view v-if="editType === 'time'">
          <view class="time-picker-container">
            <picker-view class="time-picker" :indicator-style="indicatorStyle" :value="pickerValue" @change="onTimeChange">
              <picker-view-column>
                <view v-for="(hour, index) in hours" :key="index">{{hour}}时</view>
              </picker-view-column>
              <picker-view-column>
                <view v-for="(minute, index) in minutes" :key="index">{{minute}}分</view>
              </picker-view-column>
              <picker-view-column>
                <view v-for="(second, index) in seconds" :key="index">{{second}}秒</view>
              </picker-view-column>
            </picker-view>
          </view>
          
          <view class="date-picker">
            <picker mode="date" :value="tempDate" start="2000-01-01" end="2099-12-31" @change="onDateChange">
              <view class="picker">
                {{ tempDate }}
              </view>
            </picker>
          </view>
        </view>
      </view>
      
      <view class="modal-footer">
        <button class="cancel-btn" @click="closeModal">取消</button>
        <button class="confirm-btn" @click="saveEdit">确认</button>
      </view>
    </view>
  </view>
</template>

<script>
import { getCurrentTime } from '../../utils/tool.js'
export default {
  data() {
    return {
      statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
      info: {},
      showModal: false,
      editType: '',
      modalTitle: '',
      tempValue: '',
      tempDate: '',
      hours: Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0')),
      minutes: Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0')),
      seconds: Array.from({length: 60}, (_, i) => i.toString().padStart(2, '0')),
      pickerValue: [0, 0, 0],
      indicatorStyle: 'height: 50px; border-top: 1px solid #ccc; border-bottom: 1px solid #ccc;'
    };
  },
  onLoad(options) {
    console.log(options);
    const Info = JSON.parse(decodeURIComponent(options.info));
    this.info = {
      ...Info,
      time: getCurrentTime()
    };
    // 初始化时间选择器
    this.initTimePicker();
    console.log(Info, this.info);
  },
  methods: {
    goBack() {
      uni.navigateBack({
        delta: 1
      });
    },
    
    // 打开编辑弹框
    openEditModal(type) {
      this.editType = type;
      this.showModal = true;
      
      if (type === 'amount') {
        this.modalTitle = '编辑金额';
        this.tempValue = this.info.amount.toString();
      } else if (type === 'name') {
        this.modalTitle = '编辑商户名称';
        this.tempValue = this.info.name;
      } else if (type === 'time') {
        this.modalTitle = '编辑转账时间';
        const timeParts = this.info.time.split(' ');
        this.tempDate = timeParts[0];
        
        const timeStr = timeParts[1];
        const timeArray = timeStr.split(':');
        this.pickerValue = [
          parseInt(timeArray[0]),
          parseInt(timeArray[1]),
          parseInt(timeArray[2])
        ];
      }
    },
    
    // 关闭弹框
    closeModal() {
      this.showModal = false;
    },
    
    // 初始化时间选择器
      initTimePicker() {
         const now = new Date();
         
         // 如果已有时间信息，使用已有时间
         if (this.info.time) {
           // 从完整时间字符串中提取日期部分
           const timeParts = this.info.time.split(' ');
           this.tempDate = timeParts[0]; // 格式: 2025年06月14日
           
           // 提取时分秒部分
           const timeStr = timeParts[1];
           const timeArray = timeStr.split(':');
           this.pickerValue = [
             parseInt(timeArray[0]),
             parseInt(timeArray[1]),
             parseInt(timeArray[2])
           ];
         } else {
           // 没有已有时间，使用当前时间
           this.tempDate = formatDateTime(now).split(' ')[0]; // 格式: 2025年06月14日
           
           // 设置时分秒选择器初始值
           this.pickerValue = [
             now.getHours(),
             now.getMinutes(),
             now.getSeconds()
           ];
         }
       },
    // 时间选择器变化
    onTimeChange(e) {
      this.pickerValue = e.detail.value;
    },
    
    // 日期选择器变化
    onDateChange(e) {
      const [year, month, day] = e.detail.value.split('-');
           this.tempDate = `${year}年${month}月${day}日`;
    },
    
    // 保存编辑
    saveEdit() {
		 if (this.editType === 'amount') {
		        if (!this.tempValue || isNaN(Number(this.tempValue))) {
		          uni.showToast({
		            title: '请输入有效金额',
		            icon: 'none'
		          });
		          return;
		        }
		        this.info.amount = Number(this.tempValue);
		      } else if (this.editType === 'name') {
		        if (!this.tempValue.trim()) {
		          uni.showToast({
		            title: '商户名称不能为空',
		            icon: 'none'
		          });
		          return;
		        }
		        this.info.name = this.tempValue.trim();
         } else if (this.editType === 'time') {
             const selectedHour = this.hours[this.pickerValue[0]];
             const selectedMinute = this.minutes[this.pickerValue[1]];
             const selectedSecond = this.seconds[this.pickerValue[2]];
             
             // 组合完整时间，格式: 2025年06月14日 21:14:51
             this.info.time = `${this.tempDate} ${selectedHour}:${selectedMinute}:${selectedSecond}`;
           }
           
           this.showModal = false;
           this.saveToServer();
    },
    
    // 保存到服务器
    saveToServer() {
      // 模拟保存到服务器
      console.log('保存数据到服务器:', this.info);
      
      // 实际项目中应调用API
      /* 
      uni.request({
        url: 'your-api-url',
        method: 'POST',
        data: this.info,
        success: (res) => {
          if (res.data.code === 200) {
            uni.showToast({
              title: '保存成功',
              icon: 'success'
            });
          } else {
            uni.showToast({
              title: '保存失败',
              icon: 'none'
            });
          }
        },
        fail: () => {
          uni.showToast({
            title: '网络错误',
            icon: 'none'
          });
        }
      });
      */
    },
    
    // 收款逻辑
    handleReceipt() {
      uni.showToast({
        title: '收款成功',
        icon: 'success'
      });
    },
    
    // 退还逻辑
    handleRefund() {
      uni.showModal({
        title: '提示',
        content: '确定要退还该款项吗？',
        success: (res) => {
          if (res.confirm) {
            uni.showToast({
              title: '已发起退还',
              icon: 'none'
            });
          }
        }
      });
    }
  }
};
</script>

<style scoped>
.receipt-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx;
}
.back-arrow {
  align-self: flex-start;
  color: #000;
  margin-bottom: 80rpx;
}
.clock-icon {
  margin-top: 36rpx;
  width: 100rpx;
  height: 100rpx;
  margin-bottom: 60rpx;
}
.status-text {
  font-size: 34rpx;
  color: #333;
  margin-bottom: 30rpx;
}
.money-text {
  font-family: 'WeChat Sans SS';
  font-size: 98rpx;
  color: #000;
  margin-bottom: 30rpx;
 
}
.tip-text {
  font-size: 30rpx;
  color: #999;
  margin-bottom: 160rpx;
}
.info-item {
  display: flex;
  width: 100%;
  margin-bottom: 30rpx;
}
.info-label {
  width: 160rpx;
  font-size: 14px;
  color: #666;
}
.info-value {
  font-size: 14px;
  color: #333;
  text-align: left;
}
.receipt-btn {
  width: 400rpx;
  height: 88rpx;
  line-height: 88rpx;
  background-color: #277ef1;
  color: #fff;
  font-size: 36rpx;
  border-radius: 16rpx;
  margin-bottom: 40rpx;
}
.refund-tip {
  font-size: 32rpx;
  color: #999;
}
.refund-link {
  color: #277ef1;
}
.footer {
  position: absolute;
  bottom: 80rpx;
}

/* 编辑区域样式 */
.edit-item {
  display: flex;
  align-items: center;
  width: 100%;
  /* padding: 20rpx 0; */
  
}
.edit-item uni-icons {
  margin-left: 20rpx;
}

/* 弹框样式 */
.modal-mask {
  position: fixed;
  z-index: 999;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal-container {
  position: fixed;
  z-index: 1000;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 600rpx;
  background-color: #fff;
  border-radius: 16rpx;
  overflow: hidden;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid #eee;
}
.modal-header text {
  font-size: 36rpx;
  font-weight: bold;
}
.modal-content {
  padding: 40rpx;
}
.modal-footer {
  display: flex;
  border-top: 1rpx solid #eee;
}
.modal-footer button {
  flex: 1;
  height: 90rpx;
  line-height: 90rpx;
  text-align: center;
  font-size: 34rpx;
}
.cancel-btn {
  color: #666;
}
.confirm-btn {
  color: #277ef1;
  border-left: 1rpx solid #eee;
}
.edit-input {
  width: 100%;
  height: 80rpx;
  padding: 0 20rpx;
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  box-sizing: border-box;
  font-size: 32rpx;
}
.time-picker-container {
  width: 100%;
  height: 300rpx;
  margin-bottom: 40rpx;
}
.time-picker {
  width: 100%;
  height: 100%;
}
.date-picker .picker {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  padding: 0 20rpx;
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  box-sizing: border-box;
  font-size: 32rpx;
  background-color: #fff;
}
</style>