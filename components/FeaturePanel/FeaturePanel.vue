<template>
  <view class="feature-panel-wrapper">
    <swiper class="feature-panel" indicator-dots circular>
      <swiper-item>
        <view class="feature-section">
          <view class="feature-section-title">长按角色头像可编辑/删除</view>
          <scroll-view 
            class="role-scroll-container" 
            scroll-y 
            :show-scrollbar="false"
            :enable-back-to-top="false"
          >
            <view class="feature-grid role-grid">
              <view
                class="feature-item"
                v-for="(item, index) in guestList"
                :key="item.id || `role-${index}`"
                @click="handleRoleClick(item, index)"
                @longpress="handleRoleLongPress(item, index)"
              >
                <view class="feature-icon role" :class="{ active: isRoleActive(item, index) }">
                  <image 
                    :src="item.url || ''" 
                    mode="aspectFill"
                    @error="handleImageError"
                  />
                </view>
                <text class="feature-text role">{{ item.text || '未命名' }}</text>
                <text class="feature-subtext" v-if="item.desc">{{ item.desc }}</text>
                <!-- 标识"我"的特殊标记 -->
                <text class="role-badge" v-if="index === 0">我</text>
              </view>
              <view class="feature-item add-role" @click="$emit('add-role')" v-if="showAddRole">
                <view class="feature-icon add">
                  <text>+</text>
                </view>
                <text class="feature-text">添加角色</text>
              </view>
            </view>
          </scroll-view>
        </view>
      </swiper-item>
      <swiper-item v-for="(page, pageIndex) in featurePages" :key="`feature-${pageIndex}`">
        <view class="feature-section">
          <view class="feature-section-title">功能面板</view>
          <view class="feature-grid action-grid">
            <view
              v-for="item in page"
              :key="item.name"
              class="feature-item-fun"
              @click="$emit('select-feature', item.name)"
            >
              <view class="feature-icon-fun">
                <image :src="item.icon" />
              </view>
              <text class="feature-text">{{ item.label }}</text>
            </view>
          </view>
        </view>
      </swiper-item>
    </swiper>
    
    <!-- 角色操作菜单 -->
    <uni-popup ref="roleMenuPopup" background-color="rgba(0,0,0,0.5)">
      <view class="role-menu-popup">
        <view class="role-menu-item" @click="handleEditRole" v-if="selectedRoleIndex !== null">
          <text class="menu-icon">✏️</text>
          <text class="menu-text">编辑角色</text>
        </view>
        <view 
          class="role-menu-item danger" 
          @click="handleDeleteRole" 
          v-if="selectedRoleIndex !== null && selectedRoleIndex !== 0"
        >
          <text class="menu-icon">🗑️</text>
          <text class="menu-text">删除角色</text>
        </view>
        <view class="role-menu-item cancel" @click="closeRoleMenu">
          <text class="menu-text">取消</text>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
export default {
  name: 'FeaturePanel',
  props: {
    guestList: {
      type: Array,
      default: () => [],
      validator: (list) => {
        // 确保第一个角色存在且是"我"
        return list.length === 0 || (list[0] && list[0].isMe !== false);
      }
    },
    featurePages: {
      type: Array,
      default: () => []
    },
    currentRoleIndex: {
      type: Number,
      default: 0,
      validator: (value) => value >= 0
    },
    showAddRole: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      selectedRoleIndex: null, // 当前选中的角色索引（用于编辑/删除）
      selectedRole: null // 当前选中的角色对象
    };
  },
  methods: {
    handleRoleClick(item, index) {
      console.log("======item====",item);
      
      // 边界检查
      if (index < 0 || index >= this.guestList.length) {
        console.warn('角色索引超出范围:', index);
        return;
      }
      // 传递角色ID（如果存在）或索引
      this.$emit('change-role', {
        index,
        id: item.id,
        role: item
      });
    },
    
    // 长按角色显示操作菜单
    handleRoleLongPress(item, index) {
      this.selectedRoleIndex = index;
      this.selectedRole = item;
      this.$refs.roleMenuPopup.open('bottom');
    },
    
    // 关闭菜单
    closeRoleMenu() {
      this.$refs.roleMenuPopup.close();
      this.selectedRoleIndex = null;
      this.selectedRole = null;
    },
    
    // 编辑角色
    handleEditRole() {
      if (this.selectedRoleIndex === null) return;
      
      this.$emit('edit-role', {
        index: this.selectedRoleIndex,
        id: this.selectedRole.id,
        role: this.selectedRole
      });
      
      this.closeRoleMenu();
    },
    
    // 删除角色
    handleDeleteRole() {
      if (this.selectedRoleIndex === null || this.selectedRoleIndex === 0) {
        uni.showToast({
          title: '不能删除"我"',
          icon: 'none'
        });
        return;
      }
      
      // 确认删除
      uni.showModal({
        title: '确认删除',
        content: `确定要删除角色"${this.selectedRole.text || '未命名'}"吗？`,
        success: (res) => {
          if (res.confirm) {
            this.$emit('delete-role', {
              index: this.selectedRoleIndex,
              id: this.selectedRole.id,
              role: this.selectedRole
            });
          }
          this.closeRoleMenu();
        }
      });
    },
    
    isRoleActive(item, index) {
      // 直接使用索引比较，最简单可靠
      return index === this.currentRoleIndex;
    },
    handleImageError(e) {
      // 图片加载失败处理
      console.warn('角色头像加载失败:', e);
      // 可以设置默认头像
      if (e.target) {
        e.target.src = '/static/default-avatar.png';
      }
    }
  }
};
</script>

<style scoped>
.feature-panel-wrapper {
  position: relative;
}

.feature-panel {
  height: 360rpx;
}

.feature-section {
  width: 100%;
  padding:0 24rpx;
  box-sizing: border-box;
}

.feature-section-title {
  font-size: 26rpx;
  font-weight: 600;
  color: #6b7280;
  margin-bottom: 20rpx;
  padding-left: 6rpx;
}

/* 角色滚动容器 */
.role-scroll-container {
  max-height: 300rpx; /* 限制最大高度，留出标题空间 */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch; /* iOS 平滑滚动 */
}

.feature-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
 
}

.role-grid {
  gap: 24rpx;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.feature-icon.role {
  width: 120rpx;
  height: 120rpx;
  border-radius: 32rpx;
  background: linear-gradient(145deg, #f9fafb, #eef2ff);
  padding: 8rpx;
  box-shadow: 0 12rpx 30rpx rgba(99, 102, 241, 0.15);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-icon.role image {
  width: 100%;
  height: 100%;
  border-radius: 28rpx;
}

.feature-icon.role.active {
  box-shadow: 0 20rpx 40rpx rgba(59, 130, 246, 0.25);
  transform: translateY(-6rpx);
}

.feature-text.role {
  font-weight: 600;
}

.feature-subtext {
  font-size: 22rpx;
  color: #9ca3af;
}

.add-role .feature-icon.add {
  width: 120rpx;
  height: 120rpx;
  border-radius: 32rpx;
  background: linear-gradient(135deg, #e0e7ff, #f5f3ff);
  color: #7c3aed;
  font-size: 48rpx;
  border: 2rpx dashed #c4b5fd;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-grid {
  justify-content: flex-start;
}

.feature-item-fun {
  width: 25%;
  margin-top: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.feature-icon-fun {
  width: 96rpx;
  height: 96rpx;
  border-radius: 24rpx;
  background: linear-gradient(145deg, #f3f4f6, #ffffff);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 2rpx 6rpx rgba(255, 255, 255, 0.6), 0 12rpx 24rpx rgba(15, 23, 42, 0.08);
}

.feature-icon-fun image {
  width: 60rpx;
  height: 60rpx;
}

.feature-text {
  font-size: 24rpx;
  color: #333;
  text-align: center;
}

.feature-item {
  position: relative;
}

.role-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #3b82f6;
  color: white;
  font-size: 18rpx;
  padding: 2rpx 8rpx;
  border-radius: 8rpx;
  transform: translate(20%, -20%);
  z-index: 1;
}

/* 角色操作菜单样式 */
.role-menu-popup {
  background-color: white;
  border-radius: 24rpx 24rpx 0 0;
  padding: 20rpx 0;
  min-width: 300rpx;
}

.role-menu-item {
  display: flex;
  align-items: center;
  padding: 24rpx 32rpx;
  border-bottom: 1rpx solid #f0f0f0;
  transition: background-color 0.2s;
}

.role-menu-item:active {
  background-color: #f5f5f5;
}

.role-menu-item.danger {
  color: #ef4444;
}

.role-menu-item.cancel {
  justify-content: center;
  border-bottom: none;
  margin-top: 10rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.menu-icon {
  font-size: 32rpx;
  margin-right: 16rpx;
}

.menu-text {
  font-size: 28rpx;
  color: #333;
}

.role-menu-item.danger .menu-text {
  color: #ef4444;
}
</style>

