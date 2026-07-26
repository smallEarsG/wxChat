<template>
  <view class="container">
    <!-- 全局水印层 -->
    <WatermarkLayer />
    <!-- 顶部导航栏 -->
    <view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="back" @click="goBack">
        <uni-icons type="left" size="24"></uni-icons>
      </view>
      <view class="title">企业对外群聊列表</view>
      <view class="add" @click="openAddGroupDialog">
        <uni-icons type="plus" size="24"></uni-icons>
      </view>
    </view>
    
    <!-- 群聊列表 -->
    <view class="group-list">
      <uni-swipe-action>
        <uni-swipe-action-item 
          v-for="(group, index) in groupList" 
          :key="group.id"
          :right-options="swipeOptions"
          @click="handleSwipeClick($event, index)">
          <view class="group-item" @click="enterGroup(group)">
            <image class="group-avatar" :src="group.avatarUrl || group.avatar || '/static/avatar-other.png'"></image>
            <view class="group-info">
              <view class="group-name">{{ group.name }}</view>
              <view class="group-desc">{{ group.description || '暂无描述' }}</view>
            </view>
            <view class="group-time">
              {{ formatTime(group.lastMessageTime || group.createTime) }}
            </view>
          </view>
        </uni-swipe-action-item>
      </uni-swipe-action>
    </view>
    
    <!-- 空状态 -->
    <view v-if="groupList.length === 0" class="empty-state">
      <text class="empty-text">暂无群聊</text>
      <button class="create-btn" @click="openAddGroupDialog">创建群聊</button>
    </view>
    
    <!-- 新建/编辑群聊弹窗 -->
    <uni-popup ref="groupPopup" type="center">
      <view class="popup-content">
        <view class="popup-header">
          <text class="popup-title">{{ isEdit ? '编辑群聊' : '新建群聊' }}</text>
          <view class="close-btn" @click="closeGroupDialog">
            <uni-icons type="close" size="24" color="#666" />
          </view>
        </view>
        
        <view class="form-body">
          <!-- 头像上传 -->
          <view class="form-item">
            <text class="label">群聊头像</text>
            <view class="avatar-upload" @click="chooseAvatar">
              <image v-if="currentGroup.avatar || currentGroup.avatarUrl" :src="currentGroup.avatarUrl || currentGroup.avatar" class="avatar-preview"></image>
              <text v-else class="upload-text">点击上传</text>
            </view>
          </view>
          
          <!-- 群聊名称 -->
          <view class="form-item">
            <text class="label">群聊名称</text>
            <input 
              v-model="currentGroup.name" 
              class="form-input" 
              placeholder="请输入群聊名称"
              maxlength="20"
              :adjust-position="false"
              :focus="false"
              confirm-type="done"
            />
          </view>
          
          <!-- 群聊描述 -->
          <view class="form-item">
            <text class="label">群聊描述</text>
            <textarea 
              v-model="currentGroup.description" 
              class="form-textarea" 
              placeholder="请输入群聊描述（选填）"
              maxlength="50"
            />
          </view>
        </view>
        
        <view class="form-footer">
          <button class="btn-cancel" @click="closeGroupDialog">取消</button>
          <button class="btn-submit" @click="saveGroup">保存</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
  import { uploadImage } from '@/api/conversations.js'
  import {
  getGroupsByUser,
  createGroup,
  updateGroup,
  deleteGroup,
  GROUP_TYPE
} from '@/api/groups.js';

export default {
  data() {
    return {
      groupList: [],
      currentGroup: {
        id: '',
        name: '',
        avatar: '',
        avatarUrl: '',
        description: ''
      },
      isEdit: false,
      editIndex: -1,
      swipeOptions: [
        {
          text: '编辑',
          style: { backgroundColor: '#007aff' }
        },
        {
          text: '删除',
          style: { backgroundColor: '#F56C6C' }
        }
      ],
      statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
      userId: null
    };
  },
  
  async onLoad() {
    this.userId = uni.getStorageSync('userId');
    await this.loadGroupList();
  },
  
  methods: {
    // 加载当前用户的企业对外群聊列表
    async loadGroupList() {
      if (!this.userId) {
        this.groupList = []
        return
      }

      try {
        const res = await getGroupsByUser(this.userId, GROUP_TYPE.ENTERPRISE_EXTERNAL)
        if (res.code === 200 && res.data) {
          this.groupList = res.data.map(group => ({
            id: group.id,
            name: group.name || '未命名群聊',
            avatar: group.avatar || '',
            avatarUrl: this.resolveAvatarUrl(group.avatar) || '/static/avatar-other.png',
            description: group.description || '暂无描述',
            createTime: group.createTime || Date.now(),
            lastMessageTime: group.lastMessageTime || group.createTime || Date.now()
          }));
        }
      } catch (e) {
        console.error('加载企业对外群聊列表失败:', e);
        uni.showToast({
          title: '加载群聊列表失败',
          icon: 'none'
        });
      }
    },
    
    resolveAvatarUrl(avatar) {
      if (!avatar) return '';
      const s = String(avatar);
      if (
        s.startsWith('http://') ||
        s.startsWith('https://') ||
        s.startsWith('/static/') ||
        s.startsWith('data:') ||
        s.startsWith('wxfile:') ||
        s.startsWith('file:') ||
        s.startsWith('cloud://')
      ) {
        return s;
      }
      return `http://106.15.137.235:8080/upload/${s.replace(/^\/+/, '')}`;
    },

    // 打开新建群聊对话框
    openAddGroupDialog() {
      this.isEdit = false;
      this.currentGroup = {
        id: '',
        name: '',
        avatar: '',
        avatarUrl: '',
        description: ''
      };
      this.$refs.groupPopup.open();
    },
    
    // 打开编辑群聊对话框
    openEditGroupDialog(index) {
      this.isEdit = true;
      this.editIndex = index;
      this.currentGroup = { ...this.groupList[index] };
      this.$refs.groupPopup.open();
    },
    
    // 关闭对话框
    closeGroupDialog() {
      this.$refs.groupPopup.close();
    },
    
    // 选择头像并上传到云端
    async chooseAvatar() {
      uni.chooseImage({
        count: 1,
        success: async (res) => {
          const tempFilePath = res.tempFilePaths[0];
          try {
            const uploadRes = await uploadImage(tempFilePath);
            if (uploadRes && uploadRes.data) {
              this.currentGroup.avatar = uploadRes.data;
              this.currentGroup.avatarUrl = this.resolveAvatarUrl(uploadRes.data);
            } else {
              this.currentGroup.avatar = tempFilePath;
              this.currentGroup.avatarUrl = tempFilePath;
              uni.showToast({
                title: '上传头像失败',
                icon: 'none'
              });
            }
          } catch (err) {
            console.error('上传头像失败:', err);
            this.currentGroup.avatar = tempFilePath;
            this.currentGroup.avatarUrl = tempFilePath;
            uni.showToast({
              title: '上传头像失败',
              icon: 'none'
            });
          }
        }
      });
    },
    
    // 保存群聊（接口1或接口3）
    async saveGroup() {
      if (!this.currentGroup.name.trim()) {
        uni.showToast({
          title: '请输入群聊名称',
          icon: 'none'
        });
        return;
      }

      if (!this.userId) {
        uni.showToast({
          title: '请先登录',
          icon: 'none'
        })
        return
      }
      
      try {
        if (this.isEdit) {
          // 编辑群聊（接口3）
          const groupId = this.currentGroup.id;
          const updateData = {
            name: this.currentGroup.name,
            avatar: this.currentGroup.avatar,
            description: this.currentGroup.description
          };
          
          const res = await updateGroup(groupId, updateData);
          if (res.code === 200) {
            uni.showToast({
              title: '修改成功',
              icon: 'success'
            });
            await this.loadGroupList();
            this.closeGroupDialog();
          } else {
            uni.showToast({
              title: res.msg || '修改失败',
              icon: 'none'
            });
          }
        } else {
          // 新建群聊（接口1）
          const createData = {
            name: this.currentGroup.name,
            avatar: this.currentGroup.avatar || '',
            description: this.currentGroup.description || '',
            type: GROUP_TYPE.ENTERPRISE_EXTERNAL, // 企业对外群
            ownerId: this.userId  // 群主ID默认为当前用户ID
          };
          
          const res = await createGroup(createData);
          if (res.code === 200 && res.data) {
            uni.showToast({
              title: '创建成功',
              icon: 'success'
            });
            await this.loadGroupList();
            this.closeGroupDialog();
          } else {
            uni.showToast({
              title: res.msg || '创建失败',
              icon: 'none'
            });
          }
        }
      } catch (error) {
        console.error('保存群聊失败:', error);
        uni.showToast({
          title: '操作失败，请重试',
          icon: 'none'
        });
      }
    },
    
    // 删除群聊（接口4）
    async deleteGroup(index) {
      const group = this.groupList[index];
      if (!group || !group.id) {
        uni.showToast({
          title: '群聊信息错误',
          icon: 'none'
        });
        return;
      }
      
      uni.showModal({
        title: '确认删除',
        content: '删除后聊天记录将一并清空，是否确认删除？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const deleteRes = await deleteGroup(group.id);
              if (deleteRes.code === 200) {
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                });
                await this.loadGroupList();
              } else {
                uni.showToast({
                  title: deleteRes.msg || '删除失败',
                  icon: 'none'
                });
              }
            } catch (error) {
              console.error('删除群聊失败:', error);
              uni.showToast({
                title: '删除失败，请重试',
                icon: 'none'
              });
            }
          }
        }
      });
    },
    
    // 处理滑动操作
    handleSwipeClick(e, index) {
      if (e.index === 0) {
        // 编辑
        this.openEditGroupDialog(index);
      } else if (e.index === 1) {
        // 删除
        this.deleteGroup(index);
      }
    },
    
    // 进入群聊
    enterGroup(group) {
      uni.navigateTo({
        url: `/pages/enterpriseWxChatGroup/enterpriseWxChatGroup?guestInfo=${encodeURIComponent(JSON.stringify({ 
          id: group.id,
          nickname: group.name, 
          avatar: group.avatar,
          description: group.description
        }))}`
      });
    },
    
    // 格式化时间
    formatTime(timestamp) {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now - date;
      
      if (diff < 60000) return '刚刚';
      if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
      if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
      
      return `${date.getMonth() + 1}-${date.getDate()}`;
    },
    
    // 返回
    goBack() {
      uni.navigateBack();
    }
  }
};
</script>

<style scoped>
.container {
  height: 100vh;
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #e5e5e5;
}

.title {
  font-size: 36rpx;
  font-weight: 500;
}

.back, .add {
  padding: 10rpx;
}

.group-list {
  flex: 1;
  overflow-y: auto;
}

.group-item {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #f0f0f0;
}

.group-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 10rpx;
  margin-right: 20rpx;
}

.group-info {
  flex: 1;
}

.group-name {
  font-size: 32rpx;
  font-weight: 500;
  margin-bottom: 10rpx;
}

.group-desc {
  font-size: 26rpx;
  color: #999;
}

.group-time {
  font-size: 24rpx;
  color: #999;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 200rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-bottom: 40rpx;
}

.create-btn {
  background-color: #007aff;
  color: #fff;
  padding: 20rpx 60rpx;
  border-radius: 50rpx;
}

.popup-content {
  width: 700rpx;
  background-color: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  max-height: 80vh;
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.popup-title {
  font-size: 32rpx;
  font-weight: 600;
}

.form-body {
  padding: 40rpx;
  max-height: 60vh;
  overflow-y: auto;
}

.form-item {
  margin-bottom: 40rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  margin-bottom: 16rpx;
  color: #666;
}

.avatar-upload {
  width: 120rpx;
  height: 120rpx;
  background: #f0f0f0;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2rpx dashed #ccc;
}

.avatar-preview {
  width: 100%;
  height: 100%;
  border-radius: 10rpx;
}

.upload-text {
  font-size: 24rpx;
  color: #999;
}

.form-input, .form-textarea {
  width: 100%;
  border: 1rpx solid #e6e6e6;
  border-radius: 16rpx;
  padding: 24rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  min-height: 80rpx;
  line-height: 1.4;
}

.form-textarea {
  height: 140rpx;
  resize: none;
}

.form-footer {
  display: flex;
  padding: 30rpx 40rpx;
  border-top: 1rpx solid #f0f0f0;
}

.btn-cancel, .btn-submit {
  flex: 1;
  padding: 20rpx;
  text-align: center;
  border-radius: 16rpx;
  font-size: 30rpx;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #666;
  margin-right: 20rpx;
}

.btn-submit {
  background-color: #007aff;
  color: #fff;
}
</style>

