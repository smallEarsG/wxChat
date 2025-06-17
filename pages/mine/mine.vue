<template>
  <view class="container">
    <!-- 顶部背景 -->
    <view class="header-bg"></view>
    
    <!-- 头像区域 -->
    <view class="avatar-section">
      <view class="avatar-box" @click="changeAvatar">
        <image 
          :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" 
          class="avatar" 
          mode="aspectFill"
        />
      </view>
      <view class="user-info">
        <view class="username" @click="editNickname">
          {{ userInfo.username }}
          <uni-icons type="edit" size="18" color="#999" class="edit-icon" />
        </view>
        <view class="member-status">
          <view class="member-tag" :class="{ 'vip-tag': !_isMemberExpired(userInfo.memberExpireAt) }">
            {{ _isMemberExpired(userInfo.memberExpireAt) ? "普通用户" : "VIP会员" }}
			
          </view>
          <text class="expire-date">
            {{ userInfo.memberExpireAt ? "到期时间: " + formatDate(userInfo.memberExpireAt) : "--" }}
          </text>
        </view>
      </view>
    </view>
    
    <!-- 数据卡片 -->
    <view class="data-cards">
      <view class="data-card" @click="Recharge">
        <view class="card-title">会员特权</view>
        <view class="card-value">
          <uni-icons type="crown" size="28" color="#FFD700" />
          <text>{{ userInfo.tryCount }} 次免费使用</text>
        </view>
      </view>
      <view class="data-card" @click="withdrawPoints">
        <view class="card-title">我的积分</view>
        <view class="card-value">
          <uni-icons type="star" size="28" color="#FF9500" />
          <text>{{ userInfo.points }} 积分</text>
        </view>
      </view>
    </view>
    
    <!-- 主要信息区域 -->
    <view class="info-section">
      <view class="info-card">
        <view class="card-header">个人信息</view>
        <view class="info-item">
          <text class="item-label">邀请码</text>
          <text class="item-value">{{ userInfo.inviteCode }}</text>
        </view>
        <view class="info-item">
          <text class="item-label">管理员</text>
          <text class="item-value">18216263971</text>
        </view>
      </view>
      
      <view class="action-card">
        <button class="btn-withdraw" @click="withdrawPoints">
          <uni-icons type="arrowdown" size="20" />
          积分提现
        </button>
        <button class="btn-recharge" @click="Recharge">
          <uni-icons type="plus" size="20" />
          会员充值
        </button>
      </view>
    </view>
    
    <!-- 退出登录按钮 -->
    <view class="logout-container">
      <button class="btn-logout" @click="logout">
        <uni-icons type="logout" size="22" />
        <span>退出登录</span>
      </button>
    </view>
    
    <!-- 充值对话框 -->
    <VipRechargeDialog ref="vipRecharge" :show="payShow" @pay="pay" @close="Recharge" />
  </view>
</template>

<script>
import {
  getUserInfo,
  updateUserInfo,
  logout,
  withdraw,
  getPayMember,
  activateMember
} from '@/api/index.js'
import VipRechargeDialog from '../../components/VipRechargeDialog/VipRechargeDialog.vue';
import { isMemberExpired } from '@/utils/tool.js'
import { BASE_URL } from '@/utils/request.js' 

export default {
  components:{
    VipRechargeDialog
  },
  data() {
    return {
      payShow: false,
      userInfo: {}
    };
  },
  onShow() {
    const userId = uni.getStorageSync('userId')
    this.getUserInfo(userId)
  },
  methods: {
    async pay(data) {
      console.log(data);
      let srt;
      
      if(data === "year"){
        srt = await getPayMember(this.userInfo.id, 288.00)
      } else {
        srt = await getPayMember(this.userInfo.id, 29.90)
      }
      
      // 验证返回数据的有效性
      if (!srt || !srt.data || typeof srt.data !== 'string') {
        console.error('支付订单信息无效', srt);
        uni.showToast({
          title: '获取支付信息失败',
          icon: 'none'
        });
        return;
      }
      
      // 试用次数用完后开始需要充值会员
      uni.requestPayment({
        provider: 'alipay',
        orderInfo: srt.data,
        success: async (res) => {
          uni.showToast({
            title: '支付成功'
          });
          // 刷新用户会员状态
          const resl = await activateMember(this.userInfo.id, data)
          // 跟新页面
          this.getUserInfo(this.userInfo.id)
          this.Recharge()
        },
        fail: function(err) {
          console.log('支付失败', err);
          uni.showToast({
            title: '支付失败',
            icon: 'none'
          });
        }
      });
    },
    
    _isMemberExpired(at) {
		
		console.log(at);
      return isMemberExpired(at)
    },
    
    formatDate(dateString) {
      if (dateString == '--') return '--'
      const date = new Date(dateString);
      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');

      return `${year}-${month}-${day}`;
    },
    
    Recharge() {
      this.payShow = !this.payShow 
    },
    
    // 从后端获取用户信息
    async getUserInfo(userId) {
      console.log("执行用户信息获取");
      const res = await getUserInfo(userId)
      
      console.log(userId, "==", res);
      
      this.userInfo = res.data
    },

    // 更改头像
    changeAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          this.updateUserWithAvatar({}, tempFilePath)
        }
      });
    },

    updateUserWithAvatar(formData, filePath) {
      if (filePath) {
        // 如果选择了头像，使用 uploadFile 上传头像 + 表单数据
        uni.uploadFile({
          url: `${BASE_URL}/user/update/${this.userInfo.id}`,
          filePath,
          name: 'avatar',
          formData,
          success: (res) => {
            this.handleResponse(res);
          },
          fail: (err) => {
            console.error('上传失败：', err);
            uni.showToast({ title: '网络异常', icon: 'none' });
          }
        });
      } else {
        // 如果没有头像，只提交普通表单字段
        uni.request({
          url: `${BASE_URL}/user/update/${this.userInfo.id}`,
          method: 'POST',
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data: formData,
          success: (res) => {
            this.handleResponse(res);
          },
          fail: (err) => {
            console.error('请求失败：', err);
            uni.showToast({ title: '网络异常', icon: 'none' });
          }
        });
      }
    },

    // 响应处理封装
    handleResponse(res) {
      console.log("修改结果", res);
      let result;
      try {
        result = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
      } catch (e) {
        uni.showToast({ title: '解析失败', icon: 'none' });
        return;
      }
      
      if (result.code === 200 || result.code === 0) {
        uni.showToast({ title: '更新成功', icon: 'success' });
      } else {
        uni.showToast({ title: result.message || '更新失败', icon: 'none' });
      }
      this.getUserInfo(this.userInfo.id)
    },
    
    // 修改昵称
    editNickname() {
      uni.showModal({
        title: '修改昵称',
        editable: true,
        placeholderText: '请输入新的昵称',
        success: (res) => {
          if (res.confirm && res.content) {
            this.updateUserWithAvatar({username: res.content})
          }
        }
      });
    },

    // 积分提现
    withdrawPoints() {
      if (!this.userInfo.points) {
        uni.showToast({
          title: '积分不足',
          icon: 'none'
        });
        return;
      }
      
      uni.showModal({
        title: '积分提现',
        content: `您当前有 ${this.userInfo.points} 积分，确定要全部提现吗？`,
        success: async (res) => {
          if (res.confirm) {
            uni.showLoading({
              title: '提现中...'
            });
            
            const form = {
              points: this.userInfo.points,
              userId: this.userInfo.id,
              alipayAccount: "18216267971",
              realName: "郭治金"
            }
            
            const svl = await withdraw(form)
            console.log("svl", svl);
            
            uni.hideLoading();
            
            if (svl.code === 200) {
              uni.showToast({
                title: '提现成功',
                icon: 'success'
              });
              this.getUserInfo(this.userInfo.id);
            } else {
              uni.showToast({
                title: svl.message || '提现失败',
                icon: 'none'
              });
            }
          }
        }
      });
    },

    // 退出登录
    logout() {
      uni.showModal({
        title: '确认退出',
        content: '您确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            // 清除 token
            uni.removeStorageSync('userId');
			uni.removeStorageSync('token');
            logout(this.userInfo.id)
            uni.reLaunch({
              url: '/pages/login/login'
            });
          }
        }
      });
    }
  }
};
</script>

<style scoped>
/* 页面布局 */
.container {
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  overflow: auto;
}

/* 顶部背景 */
.header-bg {
  height: 220rpx;
  background: linear-gradient(135deg, #4A6CF7, #8A5CF7);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
  overflow: hidden;
}

/* 添加背景装饰元素 */
.header-bg::before {
  content: '';
  position: absolute;
  top: -40rpx;
  right: -40rpx;
  width: 160rpx;
  height: 160rpx;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.header-bg::after {
  content: '';
  position: absolute;
  bottom: -20rpx;
  left: -20rpx;
  width: 120rpx;
  height: 120rpx;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
}

/* 头像区域 */
.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30rpx;
  margin-top: 80rpx;
  z-index: 2;
}

.avatar-box {
  width: 180rpx;
  height: 180rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 6rpx solid #fff;
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.avatar-box:hover {
  transform: scale(1.05);
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  margin-top: 30rpx;
  text-align: center;
}

.username {
  font-size: 36rpx;
  font-weight: 600;
  color: #333;
  display: inline-flex;
  align-items: center;
}

.edit-icon {
  margin-left: 10rpx;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.username:hover .edit-icon {
  opacity: 1;
}

.member-status {
  margin-top: 15rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.member-tag {
  padding: 6rpx 20rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  margin-bottom: 10rpx;
}

.vip-tag {
  background-color: #FFD700;
  color: #333;
}

.expire-date {
  font-size: 24rpx;
  color: #666;
}

/* 数据卡片 */
.data-cards {
  display: flex;
  justify-content: space-between;
  padding: 30rpx;
  margin-top: 30rpx;
  z-index: 2;
}

.data-card {
  flex: 1;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin: 0 15rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.data-card:hover {
  transform: translateY(-4rpx);
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.12);
}

.card-title {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 15rpx;
}

.card-value {
  display: flex;
  align-items: center;
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
}

.card-value uni-icons {
  margin-right: 10rpx;
}

/* 主要信息区域 */
.info-section {
  padding: 30rpx;
  margin-top: 20rpx;
  z-index: 2;
}

.info-card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
}

.card-header {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 30rpx;
  padding-bottom: 20rpx;
  border-bottom: 1rpx solid #eee;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.info-item:last-child {
  border-bottom: none;
}

.item-label {
  font-size: 28rpx;
  color: #666;
}

.item-value {
  font-size: 28rpx;
  color: #333;
}

/* 操作卡片 */
.action-card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
}

.btn-withdraw, .btn-recharge {
  flex: 1;
  padding: 20rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-withdraw {
  background-color: #FF3B30;
  color: #fff;
  margin-right: 20rpx;
}

.btn-withdraw:hover {
  background-color: #E52D23;
}

.btn-recharge {
  background-color: #007AFF;
  color: #fff;
}

.btn-recharge:hover {
  background-color: #0062CC;
}

/* 退出登录按钮容器 */
.logout-container {
  padding: 30rpx;
  margin: 20rpx 0;
  display: flex;
  justify-content: center;
}

/* 退出登录按钮 */
.btn-logout {
  width: 80%;
  padding: 24rpx;
  background: linear-gradient(135deg, #FF3B30, #FF6B6B);
  color: #fff;
  border-radius: 100rpx;
  text-align: center;
  font-size: 30rpx;
  box-shadow: 0 10rpx 20rpx rgba(255, 59, 48, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-logout::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(
    to bottom right,
    rgba(255, 255, 255, 0.2),
    rgba(255, 255, 255, 0)
  );
  transform: rotate(30deg);
  transition: transform 0.5s ease;
}

.btn-logout:hover {
  transform: translateY(-4rpx);
  box-shadow: 0 15rpx 25rpx rgba(255, 59, 48, 0.3);
}

.btn-logout:hover::before {
  transform: rotate(30deg) translate(50%, 50%);
}

.btn-logout:active {
  transform: translateY(0);
  box-shadow: 0 5rpx 10rpx rgba(255, 59, 48, 0.2);
}

.btn-logout uni-icons {
  margin-right: 15rpx;
}

.btn-logout span {
  position: relative;
  z-index: 1;
}
</style>
