<template>
  <view class="container">
    <!-- 头像区域 -->
    <view class="avatar-box" @click="changeAvatar">
      <image :src="userInfo.avatar" class="avatar" />
    </view>

    <!-- 用户信息区域 -->
    <view class="info-box">
      <view class="row">
        <text class="label">昵称：</text>
        <text class="value" @click="editNickname">{{ userInfo.nickname }}</text>
      </view>
      <view class="row">
        <text class="label">会员等级：</text>
        <text class="value">{{ userInfo.level }}</text>
      </view>
      <view class="row">
        <text class="label">会员过期时间：</text>
        <text class="value">{{ userInfo.expireDate }}</text>
      </view>
      <view class="row">
        <text class="label">剩余免费使用次数：</text>
        <text class="value">{{ userInfo.freeUsage }} 次</text>
      </view>
    </view>

    <!-- 退出登录按钮 -->
    <button class="btn-logout" @click="logout">退出登录</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      userInfo: {
        avatar: '/static/avatar-default.png', // 默认头像
        nickname: '小主',
        level: 'VIP1',
        expireDate: '2025-12-31', // 默认会员到期时间
        freeUsage: 5 // 默认免费使用次数
      }
    };
  },
  onLoad() {
    this.getUserInfo(); // 页面加载时获取用户信息
  },
  methods: {
    // 从后端获取用户信息
    async getUserInfo() {
      uni.showLoading({ title: '加载中...' });
      // 模拟从后端获取数据
      setTimeout(() => {
        // 这里可以替换成你的 API 地址
        const res = {
          success: true,
          data: {
            avatar: '/static/avatar-default.png',
            nickname: 'VIP用户',
            level: 'VIP3',
            expireDate: '2025-12-31',
            freeUsage: 8
          }
        };

        if (res.success) {
          this.userInfo = res.data;
        }
        uni.hideLoading();
      }, 1000);
    },

    // 更改头像
    changeAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          this.uploadAvatar(tempFilePath);
        }
      });
    },

    // 模拟上传头像
    uploadAvatar(filePath) {
      uni.showLoading({ title: '上传中...' });
      setTimeout(() => {
        this.userInfo.avatar = filePath; // 模拟更改头像
        uni.hideLoading();
        uni.showToast({
          title: '头像更新成功',
          icon: 'success'
        });
      }, 1000);
    },

    // 修改昵称
    editNickname() {
      uni.showModal({
        title: '修改昵称',
        editable: true,
        placeholderText: '请输入新的昵称',
        success: (res) => {
          if (res.confirm && res.content) {
            this.userInfo.nickname = res.content;
            uni.showToast({
              title: '昵称更新成功',
              icon: 'success'
            });
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
            uni.removeStorageSync('token');
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

<style>
/* 页面布局 */
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 50px;
  background-color: #f5f5f5;
  height: 100vh;
}

/* 头像区域 */
.avatar-box {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 20px;
  border: 2px solid #ddd;
}
.avatar {
  width: 100%;
  height: 100%;
}

/* 用户信息区域 */
.info-box {
  width: 80%;
  background-color: #fff;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 15px;
}
.label {
  font-size: 14px;
  color: #666;
}
.value {
  font-size: 16px;
  color: #333;
}
.value:hover {
  color: #007AFF;
}

/* 退出登录按钮 */
.btn-logout {
  width: 80%;
  padding: 12px;
  margin-top: 20px;
  background-color: #FF3B30;
  color: #fff;
  border-radius: 5px;
  text-align: center;
}
</style>
