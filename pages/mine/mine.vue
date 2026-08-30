<template>
  <view class="container" :style="{ paddingTop: statusBarHeight + 'px' }">
    <!-- 全局水印层 -->
    <WatermarkLayer />
    <!-- 背景区域（与用户信息衔接设计） -->
    <view class="header-bg">
      <!-- 渐变底色 -->
      <view class="bg-base"></view>
      <!-- 装饰光效 -->
      <view class="bg-light light-1"></view>
      <view class="bg-light light-2"></view>
      <!-- 底部过渡区 -->
      <view class="bg-transition"></view>
    </view>
    
    <!-- 用户信息主区域（与背景融合） -->
    <view class="user-main-section">
      <!-- 头像区域 -->
      <view class="avatar-container">
        <view class="avatar-glow"></view>
        <view class="avatar-box" @click="changeAvatar">
          <image 
            :src="avatarUrl" 
            class="avatar" 
            mode="aspectFill"
          />
          <view class="avatar-edit">
            <uni-icons type="camera" size="26" color="#fff" />
          </view>
        </view>
      </view>
      <!-- 用户信息区 -->
      <view class="user-info-container">
        <view class="username-wrapper" @click="editNickname">
          <text class="username">{{ userInfo.username || '未设置昵称' }}</text>
          <uni-icons type="edit" size="18" color="#fff" class="username-edit" />
        </view>
        
        <view class="member-status">
          <view class="member-tag" :class="{ 'vip-tag': !_isMemberExpired(userInfo.memberExpireAt) }">
            {{ _isMemberExpired(userInfo.memberExpireAt) ? "普通用户" : "VIP会员" }}
            <uni-icons 
              v-if="!_isMemberExpired(userInfo.memberExpireAt)" 
              type="star" 
              size="16" 
              color="#fff" 
              class="vip-star" 
            />
          </view>
          <text class="expire-date">
            {{ userInfo.memberExpireAt ? "到期时间: " + formatDate(userInfo.memberExpireAt) : "--" }}
          </text>
        </view>
      </view>
    </view>
    
  
    
    <!-- 主要信息区域 -->
    <view class="info-section">
      <!-- 分享下载卡片 -->
      <view class="share-card" @click="copyDownloadLink">
        <view class="share-content">
          <view class="share-icon-box">
            <uni-icons type="download" size="32" color="#fff" />
          </view>
          <view class="share-text">
            <text class="share-title">分享下载链接</text>
            <text class="share-desc">点击复制下载地址</text>
          </view>
        </view>
        <view class="share-arrow">
          <uni-icons type="right" size="20" color="#c0c0c0" />
        </view>
      </view>

      <view class="points-card" @click="openPointsRecharge">
        <view class="points-content">
          <view class="points-icon-box">
            <uni-icons type="wallet" size="36" color="#fff" />
          </view>
          <view class="points-text">
            <text class="points-label">我的积分</text>
            <text class="points-value">{{ displayPoints }}</text>
          </view>
        </view>
        <view class="points-recharge-hint">
          <text class="points-hint-text">去充值</text>
          <uni-icons type="right" size="16" color="rgba(255,255,255,0.85)" />
        </view>
      </view>

      <view class="info-card contact-service-card">
        <view class="card-header">
          <span class="header-dot"></span>
          在线客服
        </view>
        <text class="contact-desc">问题与建议反馈、页面定制开发请联系</text>
        <text class="contact-desc">（24小时内进行反馈和处理）</text>
        <view class="contact-item-row" @click="copyPhoneNumber('3305242034')">
          <uni-icons type="chatboxes" size="22" color="#7c3aed" class="contact-row-icon" />
          <text class="contact-row-text">QQ: 3305242034</text>
          <text class="contact-row-hint">点击复制</text>
        </view>
        <view class="contact-item-row" @click="copyPhoneNumber(contactWechat)">
          <uni-icons type="weixin" size="22" color="#07c160" class="contact-row-icon" />
          <text class="contact-row-text">微信: {{ contactWechat }}</text>
          <text class="contact-row-hint">点击复制</text>
        </view>
        <view class="version-section">
          <view class="version-row">
            <text class="version-label">当前版本</text>
            <text class="version-value">{{ currentAppVersion }}</text>
          </view>
          <view class="version-row">
            <text class="version-label">最新版本</text>
            <text class="version-value">{{ latestVersion }}</text>
          </view>
          <button v-if="hasNewVersion" class="btn-download" @click="openDownloadUrl">
            <uni-icons type="download" size="20" color="#fff" />
            <text>下载新版本</text>
          </button>
        </view>
      </view>
      
      <view class="action-card">
        <button class="btn-withdraw" @click="openPointsRecharge" @longpress="openMockPayMenu">
          <uni-icons type="arrowdown" size="22" />
          积分充值
        </button>
        <button class="btn-recharge" @click="Recharge">
          <uni-icons type="plus" size="22" />
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
    <PointsRechargeDialog :show="pointsPayShow" @pay="payPoints" @close="closePointsRecharge" />
  </view>
</template>

<script>
import {
  getUserInfo,
  updateUserProfile,
  updateUserInfo,
  logout,
  withdraw,
  getPayMember,
  getPayPoints,
  confirmPayOrder,
  mockPayMember,
  mockPayPoints,
  getAppVersion
} from '@/api/index.js'
import VipRechargeDialog from '../../components/VipRechargeDialog/VipRechargeDialog.vue';
import PointsRechargeDialog from '../../components/PointsRechargeDialog/PointsRechargeDialog.vue';
import { isMemberExpired } from '@/utils/tool.js'
import { deviceInfo } from '@/utils/commonUtils.js'
import { uploadImage } from '@/api/conversations.js'
import { versionManager } from '@/utils/versionManager.js'


export default {
  components:{
    VipRechargeDialog,
    PointsRechargeDialog
  },
  data() {
    return {
	  statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
      payShow: false,
      pointsPayShow: false,
      userInfo: {},
      contactWechat: 'xiaoshoumoban01',
      currentAppVersion: '--',
      latestVersion: '--',
      packageUrl: ''
    };
  },
  onShow() {
    const userId = uni.getStorageSync('userId')
    this.getUserInfo(userId)
    this.loadAppVersionInfo()
    this.loadCurrentAppVersion()
    if (uni.getStorageSync('openPointsRecharge')) {
      uni.removeStorageSync('openPointsRecharge')
      this.$nextTick(() => {
        this.openPointsRecharge()
      })
    }
  },
  computed: {
    avatarUrl() {
      const avatar = this.userInfo.avatar || ''
      if (!avatar) return ''
      if (avatar.includes('http')) return avatar
      return 'http://106.15.137.235:9090/upload' + avatar
    },
    displayPoints() {
      const points = this.userInfo.points
      return points === null || points === undefined || points === '' ? 0 : points
    },
    hasNewVersion() {
      if (this.currentAppVersion === '--' || this.latestVersion === '--') {
        return false
      }
      return versionManager.compareVersion(this.latestVersion, this.currentAppVersion) > 0
    }
  },
  methods: {
    
    // 复制下载地址功能
    copyDownloadLink() {
      const downloadLink = 'https://www.pgyer.com/77studio_1';
      uni.setClipboardData({
        data: downloadLink,
        success: () => {
          uni.showToast({ 
            title: '下载地址已复制', 
            icon: 'success' 
          });
        },
        fail: () => {
          uni.showToast({ 
            title: '复制失败', 
            icon: 'none' 
          });
        }
      });
    },
    
    copyInviteCode() {
      if (!this.userInfo.inviteCode) {
        uni.showToast({ title: '邀请码为空', icon: 'none' });
        return;
      }
      uni.setClipboardData({
        data: this.userInfo.inviteCode,
        success: () => {
          uni.showToast({ title: '邀请码已复制', icon: 'none' });
        }
      });
    },

    async loadAppVersionInfo() {
      try {
        const res = await getAppVersion()
        if (res && res.phone) {
          this.contactWechat = res.phone
        }
        if (res && res.latestVersion) {
          this.latestVersion = res.latestVersion
        }
        if (res && res.apkUrl) {
          this.packageUrl = res.apkUrl
        }
      } catch (error) {
        console.error('获取应用配置失败:', error)
      }
    },

    openDownloadUrl() {
      if (!this.packageUrl) {
        uni.showToast({ title: '暂无下载链接', icon: 'none' })
        return
      }
      if (typeof plus !== 'undefined') {
        plus.runtime.openURL(this.packageUrl)
        return
      }
      // #ifdef H5
      window.open(this.packageUrl, '_blank')
      // #endif
    },

    async loadCurrentAppVersion() {
      try {
        const version = await versionManager.getCurrentVersion()
        if (version) {
          this.currentAppVersion = version
          return
        }
        if (typeof plus !== 'undefined' && plus.runtime.version) {
          this.currentAppVersion = plus.runtime.version
        }
      } catch (error) {
        console.error('获取当前版本失败:', error)
      }
    },

    copyPhoneNumber(phoneNumber) {
      if (!phoneNumber) {
        uni.showToast({ title: '暂无联系方式', icon: 'none' })
        return
      }
      uni.setClipboardData({
        data: phoneNumber,
        success: () => {
          uni.showToast({ title: '已复制到剪贴板', icon: 'success' })
        },
        fail: () => {
          uni.showToast({ title: '复制失败', icon: 'none' })
        }
      })
    },
    
    async pay(data) {
      await this.startPayment(
        () => getPayMember(this.userInfo.id, data.price, data.type, deviceInfo.getPayPlatform()),
        () => this.Recharge()
      )
    },

    async payPoints(data) {
      await this.startPayment(
        () => getPayPoints(this.userInfo.id, data.code, deviceInfo.getPayPlatform()),
        () => this.closePointsRecharge()
      )
    },

    async startPayment(createOrder, onSuccessClose) {
      try {
        const res = await createOrder()
        const payData = res?.data
        const orderStr = typeof payData === 'string' ? payData : payData?.orderStr
        const orderNo = typeof payData === 'object' ? payData?.orderNo : null

        if (!orderStr) {
          console.error('支付订单信息无效', res)
          uni.showToast({ title: '获取支付信息失败', icon: 'none' })
          return
        }

        uni.requestPayment({
          provider: 'alipay',
          orderInfo: orderStr,
          success: async () => {
            try {
              if (orderNo) {
                await confirmPayOrder(orderNo)
              }
              await this.getUserInfo(this.userInfo.id)
              uni.showToast({ title: '支付成功', icon: 'success' })
              onSuccessClose()
            } catch (err) {
              console.error('确认充值失败', err)
              uni.showToast({ title: '充值确认失败', icon: 'none' })
            }
          },
          fail: (err) => {
            console.log('支付失败', err)
            uni.showToast({ title: '支付失败', icon: 'none' })
          }
        })
      } catch (err) {
        console.error('创建支付订单失败', err)
        uni.showToast({ title: '获取支付信息失败', icon: 'none' })
      }
    },

    _isMemberExpired(at) {
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

    openPointsRecharge() {
      this.pointsPayShow = true
    },

    closePointsRecharge() {
      this.pointsPayShow = false
    },

    openMockPayMenu() {
      const currentPlatform = deviceInfo.getPayPlatform()
      const otherPlatform = currentPlatform === 'ios' ? 'android' : 'ios'
      uni.showActionSheet({
        itemList: [
          `模拟会员充值(${currentPlatform})`,
          `模拟会员充值(${otherPlatform})`,
          `模拟积分充值(${currentPlatform})`,
          `模拟积分充值(${otherPlatform})`
        ],
        success: async (res) => {
          const userId = this.userInfo.id
          if (!userId) {
            uni.showToast({ title: '请先登录', icon: 'none' })
            return
          }
          try {
            let result
            if (res.tapIndex === 0) {
              result = await mockPayMember(userId, 'month', currentPlatform)
            } else if (res.tapIndex === 1) {
              result = await mockPayMember(userId, 'month', otherPlatform)
            } else if (res.tapIndex === 2) {
              result = await mockPayPoints(userId, 'pkg_1000', currentPlatform)
            } else if (res.tapIndex === 3) {
              result = await mockPayPoints(userId, 'pkg_1000', otherPlatform)
            }
            const data = result?.data || {}
            await this.getUserInfo(userId)
            uni.showModal({
              title: '模拟充值成功',
              content: `订单: ${data.orderNo || '-'}\n平台: ${data.platform || '-'}\n类型: ${data.orderType || '-'}`,
              showCancel: false
            })
          } catch (err) {
            console.error('模拟充值失败', err)
            uni.showToast({ title: err?.message || '模拟充值失败', icon: 'none' })
          }
        }
      })
    },
    
    async getUserInfo(userId) {
      const res = await getUserInfo(userId)
      this.userInfo = res.data
    },

    changeAvatar() {
      const userId = this.userInfo?.id || uni.getStorageSync('userId')
      if (!userId) {
        uni.showToast({ title: '用户信息异常，请重新登录', icon: 'none' })
        return
      }
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.handleAvatarUpload(res.tempFilePaths[0], userId)
        }
      })
    },

    async handleAvatarUpload(tempFilePath, userId) {
      try {
        uni.showLoading({ title: '上传中...', mask: true })
        const uploadRes = await uploadImage(tempFilePath, userId)
        if (!uploadRes || uploadRes.code !== 200 || !uploadRes.data) {
          throw new Error(uploadRes?.message || '头像上传失败')
        }
        await this.updateUserWithAvatar({ avatarUrl: uploadRes.data }, userId)
      } catch (err) {
        const message = err?.message || err?.errMsg || '头像上传失败'
        uni.showToast({ title: message, icon: 'none' })
        console.error('头像更新失败：', err)
      } finally {
        uni.hideLoading()
      }
    },

    async updateUserWithAvatar(formData, userId = this.userInfo?.id || uni.getStorageSync('userId')) {
      if (!userId) {
        uni.showToast({ title: '用户信息异常，请重新登录', icon: 'none' })
        return
      }
      try {
        const result = await updateUserProfile(userId, formData)
        if (result.code === 200 || result.code === 0) {
          uni.showToast({ title: '更新成功', icon: 'success' })
          await this.getUserInfo(userId)
        } else {
          uni.showToast({ title: result.message || '更新失败', icon: 'none' })
        }
      } catch (err) {
        const message = err?.data?.message || err?.message || '更新失败'
        uni.showToast({ title: message, icon: 'none' })
        console.error('更新用户信息失败：', err)
      }
    },
    
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
    logout() {
      uni.showModal({
        title: '确认退出',
        content: '您确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            uni.removeStorageSync('userId');
			uni.removeStorageSync('token');
            logout(this.userInfo.id)
            uni.reLaunch({ url: '/pages/login/login' });
          }
        }
      });
    }
  }
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  background-color: #f7f8fa;
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  overflow: auto;
}

/* 背景区域 - 与用户信息衔接设计 */
.header-bg {
  height: 280rpx;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;
}
/* 背景底色 */
.bg-base {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #5b46c7, #7c3aed);
}
/* 装饰光效 - 增强与用户信息的连接 */
.bg-light {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  filter: blur(60rpx);
}
.light-1 {
  width: 400rpx;
  height: 400rpx;
  top: -150rpx;
  right: -100rpx;
  animation: float 15s infinite ease-in-out;
}
.light-2 {
  width: 300rpx;
  height: 300rpx;
  bottom: -100rpx;
  left: -50rpx;
  animation: float 18s infinite ease-in-out 2s;
}
/* 底部过渡区 - 关键衔接元素 */
.bg-transition {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100rpx;
  background: linear-gradient(to bottom, transparent, #f7f8fa);
  z-index: 2;
}

/* 用户信息主区域 - 整合头像和名称 */
.user-main-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30rpx 0;
  margin-top: 80rpx; /* 调整位置与背景衔接 */
  z-index: 3;
  position: relative;
}
/* 头像容器 - 增加与背景的视觉连接 */
.avatar-container {
  position: relative;
  margin-bottom: 25rpx;
}
/* 头像光晕 - 核心衔接元素 */
.avatar-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200rpx;
  height: 200rpx;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0) 70%);
  z-index: -1;
}
.avatar-box {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  overflow: hidden;
  border: 4rpx solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  background-color: #f0f0f0;
}
.avatar-box:hover {
  transform: scale(1.05);
  box-shadow: 0 8rpx 20rpx rgba(91, 70, 199, 0.2);
}
.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
/* 头像编辑提示 */
.avatar-edit {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: #5b46c7;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.2);
  opacity: 0;
  transition: opacity 0.3s;
}
.avatar-box:hover .avatar-edit {
  opacity: 1;
}

/* 用户信息容器 - 与背景融合 */
.user-info-container {
  text-align: center;
  padding: 15rpx 30rpx;
  border-radius: 30rpx;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10rpx);
  box-shadow: 0 3rpx 10rpx rgba(0, 0, 0, 0.05);
}
/* 用户名样式 */
.username-wrapper {
  display: inline-flex;
  align-items: center;
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
  padding: 5rpx 10rpx;
  border-radius: 8rpx;
  transition: background-color 0.2s;
}
.username-wrapper:hover {
  background-color: rgba(255, 255, 255, 0.5);
}
.username-edit {
  margin-left: 8rpx;
  opacity: 0.7;
}
.username-wrapper:hover .username-edit {
  opacity: 1;
}

/* 会员状态区域 */
.member-status {
  margin-top: 10rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.member-tag {
  padding: 4rpx 18rpx;
  border-radius: 20rpx;
  font-size: 22rpx;
  margin-bottom: 8rpx;
  display: inline-flex;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.5);
  color: #666;
}
.vip-tag {
  background: linear-gradient(135deg, #9333ea, #7c3aed);
  color: #fff;
  box-shadow: 0 2rpx 8rpx rgba(124, 58, 237, 0.3);
}
.vip-star {
  margin-left: 5rpx;
  animation: starShine 1.5s infinite alternate;
}
.expire-date {
  font-size: 22rpx;
  color: #666;
  background-color: rgba(255, 255, 255, 0.3);
  padding: 2rpx 15rpx;
  border-radius: 15rpx;
}

/* 数据卡片 */
.data-cards {
  display: flex;
  justify-content: space-between;
  padding: 0 30rpx;
  margin-top: 15rpx;
  z-index: 3;
  position: relative;
}
.data-card {
  flex: 1;
  background-color: #fff;
  border-radius: 20rpx;
  padding: 30rpx 20rpx;
  margin: 0 12rpx;
  box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  position: relative;
}
.data-card:hover {
  transform: translateY(-5rpx);
  box-shadow: 0 8rpx 20rpx rgba(0, 0, 0, 0.08);
}
.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 15rpx;
}
.card-header .card-title {
  font-size: 26rpx;
  color: #666;
  margin-left: 8rpx;
}
.card-value {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}
.card-arrow {
  position: absolute;
  top: 18rpx;
  right: 18rpx;
  color: #ccc;
  font-size: 18rpx;
}

/* 个人信息区域 */
.info-section {
  padding: 25rpx 30rpx;
  margin-top: 15rpx;
  z-index: 3;
  position: relative;
}
.info-card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 25rpx;
  margin-bottom: 25rpx;
  box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.05);
}
.card-header {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 25rpx;
  padding-bottom: 15rpx;
  border-bottom: 1rpx solid #f0f0f0;
  display: flex;
  align-items: center;
}
.header-dot {
  width: 10rpx;
  height: 10rpx;
  background-color: #7c3aed;
  border-radius: 50%;
  margin-right: 12rpx;
}

/* 信息项 */
.info-item {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}
.info-item:last-child {
  border-bottom: none;
}
.item-icon {
  margin-right: 18rpx;
  color: #7c3aed;
  width: 28rpx;
  text-align: center;
}
.item-label {
  font-size: 26rpx;
  color: #666;
  flex: 1;
}
.item-value {
  font-size: 26rpx;
  color: #333;
  flex: 2;
  text-align: right;
  padding-right: 15rpx;
}
.item-operate {
  color: #999;
  transition: color 0.2s;
}
.item-operate:hover {
  color: #7c3aed;
}

.contact-service-card .card-header {
  margin-bottom: 12rpx;
}

.contact-desc {
  display: block;
  font-size: 24rpx;
  color: #888;
  line-height: 1.6;
  margin-bottom: 6rpx;
}

.contact-item-row {
  display: flex;
  align-items: center;
  padding: 22rpx 0;
  border-bottom: 1rpx solid #f5f5f5;
}

.contact-item-row:last-of-type {
  border-bottom: none;
}

.contact-row-icon {
  margin-right: 16rpx;
}

.contact-row-text {
  flex: 1;
  font-size: 28rpx;
  color: #333;
}

.contact-row-hint {
  font-size: 22rpx;
  color: #7c3aed;
}

.version-section {
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.version-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8rpx 0;
}

.version-label {
  font-size: 26rpx;
  color: #666;
}

.version-value {
  font-size: 26rpx;
  color: #333;
  font-weight: 600;
}

.btn-download {
  width: 100%;
  margin-top: 20rpx;
  padding: 20rpx;
  border-radius: 15rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10rpx;
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  color: #fff;
  border: none;
  box-shadow: 0 3rpx 8rpx rgba(109, 40, 217, 0.2);
}

.btn-download:active {
  opacity: 0.9;
  transform: scale(0.98);
}

/* 积分卡片 */
.points-card {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 25rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 8rpx 20rpx rgba(245, 158, 11, 0.35);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}
.points-card:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 12rpx rgba(245, 158, 11, 0.35);
}
.points-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 60%);
  pointer-events: none;
}
.points-content {
  display: flex;
  align-items: center;
  flex: 1;
  position: relative;
  z-index: 1;
}
.points-icon-box {
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 25rpx;
  backdrop-filter: blur(10rpx);
}
.points-text {
  display: flex;
  flex-direction: column;
}
.points-label {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 6rpx;
}
.points-value {
  font-size: 52rpx;
  font-weight: 700;
  color: #fff;
  line-height: 1.1;
  letter-spacing: 1rpx;
}
.points-recharge-hint {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
  background: rgba(255, 255, 255, 0.2);
  padding: 10rpx 20rpx;
  border-radius: 30rpx;
  backdrop-filter: blur(10rpx);
}
.points-hint-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.9);
  margin-right: 4rpx;
}

/* 分享下载卡片样式 */
.share-card {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 25rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 8rpx 20rpx rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}
.share-card:active {
  transform: scale(0.98);
  box-shadow: 0 4rpx 12rpx rgba(102, 126, 234, 0.3);
}
.share-card::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 100%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 60%);
  pointer-events: none;
}
.share-content {
  display: flex;
  align-items: center;
  flex: 1;
  position: relative;
  z-index: 1;
}
.share-icon-box {
  width: 80rpx;
  height: 80rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 25rpx;
  backdrop-filter: blur(10rpx);
}
.share-text {
  display: flex;
  flex-direction: column;
}
.share-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #fff;
  margin-bottom: 8rpx;
}
.share-desc {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}
.share-arrow {
  position: relative;
  z-index: 1;
}

/* 操作按钮 */
.action-card {
  background-color: #fff;
  border-radius: 20rpx;
  padding: 25rpx;
  box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
}
.btn-withdraw, .btn-recharge {
  flex: 1;
  padding: 20rpx;
  border-radius: 15rpx;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  font-weight: 500;
  border: none;
}
.btn-withdraw {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
  margin-right: 15rpx;
  box-shadow: 0 3rpx 8rpx rgba(220, 38, 38, 0.2);
}
.btn-withdraw:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-2rpx);
}
.btn-recharge {
  background: linear-gradient(135deg, #7c3aed, #6d28d9);
  color: #fff;
  box-shadow: 0 3rpx 8rpx rgba(109, 40, 217, 0.2);
}
.btn-recharge:hover {
  background: linear-gradient(135deg, #6d28d9, #5b21b6);
  transform: translateY(-2rpx);
}

/* 退出登录按钮 */
.logout-container {
  padding: 25rpx;
  margin: 30rpx 0 50rpx;
  display: flex;
  justify-content: center;
}
.btn-logout {
  width: 80%;
  padding: 24rpx;
  background: #fff;
  color: #666;
  border-radius: 80rpx;
  text-align: center;
  font-size: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: 1rpx solid #eee;
  box-shadow: 0 3rpx 12rpx rgba(0, 0, 0, 0.03);
}
.btn-logout:hover {
  background-color: #fafafa;
  color: #7c3aed;
  border-color: #e9d5ff;
}
.btn-logout uni-icons {
  margin-right: 12rpx;
}

/* 动画效果 */
@keyframes starShine {
  from { transform: scale(0.8); opacity: 0.8; }
  to { transform: scale(1.1); opacity: 1; }
}
@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20rpx) rotate(2deg); }
}
</style>