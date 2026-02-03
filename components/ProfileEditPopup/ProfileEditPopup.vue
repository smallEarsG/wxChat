<template>
  <view>
    <uni-popup ref="popup" type="center">
      <view class="popup-content">
        <view class="form-item">
          <text class="label">头像</text>
          <view class="avatar-section">
            <view class="avatar-box" @click="chooseImage">
              <image :src="avatar" class="avatar" v-if="avatar" mode="aspectFill" />
              <text v-else class="avatar-placeholder">点击上传</text>
            </view>
            <view class="random-btn" @click="randomGenerate">
              <text class="random-btn-text">随机</text>
            </view>
          </view>
        </view>

        <view class="form-item">
          <text class="label">昵称</text>
          <input v-model="nickname" class="input" placeholder="请输入昵称" />
        </view>

        <view class="form-item">
          <text class="label">介绍</text>
          <textarea v-model="description" class="textarea" placeholder="请输入简介"></textarea>
        </view>

        <button class="btn" @click="submit">提交</button>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { uploadAvatar } from '@/api/index.js'

export default {
  name: 'ProfileEditPopup',
  props: {
    module: {
      type: String,
      default: 'user' // 默认使用 'user'，支付宝页面可以传入 'alipay'
    }
  },
  data() {
    return {
      avatar: '',
      nickname: '',
      description: '@微信',
      isUploading: false
    };
  },
  methods: {
    // 支持外部预填（用于“添加角色”随机生成/编辑场景）
    setForm(payload = {}) {
      this.avatar = payload.avatar || '';
      this.nickname = payload.nickname || '';
      this.description = payload.description || '@微信';
    },
    open(payload = {}) {
      this.setForm(payload);
      this.$refs.popup.open('center');
    },

    // 生成随机昵称（参考 ProMsgEditPopup）
    generateRandomName() {
      const nicknames = [
        '浅笑安然', '流年似水', '清风徐来', '墨染年华', '烟雨江南', '落花有意',
        '云淡风轻', '月下独酌', '一叶知秋', '春暖花开', '夏夜微凉', '秋意浓',
        '冬日暖阳', '星辰大海', '梦里寻她', '不负韶华', '初心不改', '诗和远方',
        '小确幸', '大梦想', '追光者', '夜未央', '晨光熹微', '暮色苍茫',
        'Alice', 'Bob', 'Charlie', 'Diana', 'Ethan', 'Fiona', 'Grace', 'Henry',
        'Iris', 'Jack', 'Kate', 'Leo', 'Mia', 'Noah', 'Olivia', 'Paul',
        'Rainbow', 'Sunny', 'Moon', 'Star', 'Ocean', 'River', 'Mountain', 'Forest',
        '小可爱', '大魔王', '小仙女', '小王子', '小星星', '小太阳', '小月亮',
        '追风少年', '阳光女孩', '温柔如你', '霸气侧漏', '低调奢华', '高调炫富',
        '123456', 'abc123', 'user2024', 'test001', 'demo', 'admin', 'guest'
      ];
      return nicknames[Math.floor(Math.random() * nicknames.length)];
    },

    // 获取随机头像地址（参考 ProMsgEditPopup）
    getRandomAvatar() {
      const avatarServices = [
        () => 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Math.random().toString(36).substring(7),
        () => 'https://api.dicebear.com/7.x/personas/svg?seed=' + Math.random().toString(36).substring(7),
        () => 'https://api.dicebear.com/7.x/initials/svg?seed=' + Math.random().toString(36).substring(7),
        () => 'https://ui-avatars.com/api/?name=' + Math.random().toString(36).substring(7) + '&background=random&color=fff',
        () => 'https://picsum.photos/200/200?random=' + Date.now(),
        () => 'https://randomuser.me/api/portraits/men/' + Math.floor(Math.random() * 99) + '.jpg',
        () => 'https://randomuser.me/api/portraits/women/' + Math.floor(Math.random() * 99) + '.jpg'
      ];
      const randomService = avatarServices[Math.floor(Math.random() * avatarServices.length)];
      return randomService();
    },

    // 随机生成头像和昵称
    randomGenerate() {
      this.avatar = this.getRandomAvatar();
      this.nickname = this.generateRandomName();
      uni.showToast({
        title: '已随机生成',
        icon: 'none',
        duration: 1200
      });
    },

    chooseImage() {
      uni.chooseImage({
        count: 1,
        success: (res) => {
          this.avatar = res.tempFilePaths[0];
        }
      });
    },
    async submit() {
      if (!this.nickname.trim()) {
        return uni.showToast({ title: '昵称不能为空', icon: 'none' });
      }
      
      // 如果头像不是网络地址（是本地路径），需要先上传到云端
      let avatarUrl = this.avatar;
      
      // 判断是否为本地路径（不是 http/https 开头）
      const isLocalPath = avatarUrl && !avatarUrl.startsWith('http://') && !avatarUrl.startsWith('https://');
      
      if (isLocalPath) {
        try {
          this.isUploading = true;
          uni.showLoading({ title: '上传头像中...', mask: true });
          
          const userId = uni.getStorageSync('userId');
          if (!userId) {
            throw new Error('用户未登录');
          }
          
          // 上传头像到云端（使用 props 传入的 module）
          const result = await uploadAvatar(avatarUrl, userId, this.module, this.nickname);
          avatarUrl = result.avatarUrl;
          
          uni.hideLoading();
          this.isUploading = false;
        } catch (error) {
          console.error('上传头像失败:', error);
          uni.hideLoading();
          this.isUploading = false;
          uni.showToast({
            title: error.message || '上传头像失败，请重试',
            icon: 'none'
          });
          return;
        }
      }
      
      this.$emit('submit', {
        avatar: avatarUrl,
        nickname: this.nickname,
        description: this.description
      });
      this.$refs.popup.close();
    }
  }
};
</script>

<style scoped>
.popup-content {
  width: 600rpx;
  background-color: #fff;
  padding: 30rpx;
  border-radius: 16rpx;
}
.form-item {
  margin-bottom: 30rpx;
}
.label {
  font-size: 28rpx;
  margin-bottom: 10rpx;
  display: block;
  color: #333;
}
.avatar-box {
  width: 120rpx;
  height: 120rpx;
  background: #f0f0f0;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.avatar-section {
  display: flex;
  align-items: center;
  gap: 16rpx;
}
.random-btn {
  height: 56rpx;
  padding: 0 20rpx;
  border-radius: 12rpx;
  border: 1rpx solid rgba(0, 122, 255, 0.35);
  background: rgba(0, 122, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}
.random-btn:active {
  opacity: 0.85;
}
.random-btn-text {
  font-size: 26rpx;
  color: #007aff;
}
.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
}
.avatar-placeholder {
  color: #999;
  font-size: 24rpx;
}
.input {
  border: 1px solid #ccc;
  border-radius: 8rpx;
  padding: 10rpx;
  width: 100%;
  font-size: 28rpx;
}
.textarea {
  border: 1px solid #ccc;
  border-radius: 8rpx;
  padding: 10rpx;
  width: 100%;
  height: 120rpx;
  font-size: 28rpx;
}
.btn {
  background-color: #007aff;
  color: #fff;
  padding: 16rpx;
  text-align: center;
  border-radius: 8rpx;
}
</style>
