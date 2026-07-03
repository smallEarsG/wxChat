<template>
  <view>
    <uni-popup ref="popup" type="center" :is-mask-click="!submitting">
      <view class="popup-content">
        <view class="form-header">
          <text class="title">AI生成对话</text>
          <view class="close-btn" @click="closePopup">
            <uni-icons type="close" size="24" color="#666" />
          </view>
        </view>

        <scroll-view class="form-body" scroll-y>
          <!-- 头像 -->
          <view class="form-item">
            <text class="form-label">头像</text>
            <view class="avatar-section">
              <view class="avatar-preview" @click="chooseAvatar">
                <image v-if="formData.avatarUrl" :src="formData.avatarUrl" class="avatar-img" mode="aspectFill" />
                <view v-else class="avatar-placeholder">
                  <uni-icons type="camera" size="24" color="#999" />
                  <text class="placeholder-text">点击选择头像</text>
                </view>
              </view>
              <view class="random-btn" @click="randomGenerate">
                <uni-icons type="reload" size="20" color="#007aff" />
                <text class="random-btn-text">随机</text>
              </view>
            </view>
          </view>

          <!-- 姓名 -->
          <view class="form-item">
            <text class="form-label">姓名</text>
            <view class="input-wrapper">
              <uni-icons type="person" size="18" color="#999" class="input-icon" />
              <input
                v-model="formData.name"
                class="form-input"
                placeholder="请输入姓名"
                placeholder-class="placeholder"
                maxlength="20"
              />
            </view>
          </view>

          <!-- 模仿对话 -->
          <view class="form-item">
            <text class="form-label">模仿对话</text>
            <view class="input-wrapper">
              <uni-icons type="search" size="18" color="#999" class="input-icon" />
              <input
                v-model="sourceSearchKeyword"
                class="form-input"
                placeholder="搜索当前列表中的对话"
                placeholder-class="placeholder"
                @input="onSourceSearch"
              />
            </view>
            <view v-if="selectedSource" class="selected-source">
              已选：{{ selectedSource.name }}
              <text class="clear-source" @click="clearSelectedSource">清除</text>
            </view>
            <scroll-view v-if="!selectedSource" class="source-list" scroll-y>
              <view
                v-for="item in filteredSourceList"
                :key="item.conversationId"
                class="source-item"
                :class="{ active: formData.sourceConversationId === item.conversationId }"
                @click="selectSource(item)"
              >
                <image class="source-avatar" :src="item.avatarUrl" mode="aspectFill" />
                <view class="source-info">
                  <text class="source-name">{{ item.name }}</text>
                  <text v-if="item.description" class="source-desc">{{ item.description }}</text>
                </view>
              </view>
              <view v-if="filteredSourceList.length === 0" class="source-empty">
                {{ sourceSearchKeyword ? '未找到匹配对话' : '暂无对话可选' }}
              </view>
            </scroll-view>
          </view>

          <!-- 场景类型 -->
          <view class="form-item">
            <text class="form-label">场景类型</text>
            <picker :range="sceneTypeLabels" :value="sceneTypeIndex" @change="onSceneTypeChange">
              <view class="picker-value">
                <text>{{ sceneTypeLabels[sceneTypeIndex] }}</text>
                <uni-icons type="bottom" size="14" color="#999" />
              </view>
            </picker>
            <text v-if="recommendedSceneLabel" class="hint-text">推荐场景：{{ recommendedSceneLabel }}</text>
          </view>

          <!-- 自定义场景 -->
          <view v-if="formData.sceneType === 'CUSTOM'" class="form-item">
            <text class="form-label">自定义场景</text>
            <view class="input-wrapper">
              <input
                v-model="formData.customScene"
                class="form-input form-input-no-icon"
                placeholder="请输入自定义场景描述"
                placeholder-class="placeholder"
                maxlength="100"
              />
            </view>
          </view>

          <!-- 场景补充 -->
          <view class="form-item">
            <text class="form-label">场景补充（可选）</text>
            <view class="input-wrapper">
              <textarea
                v-model="formData.scene"
                class="form-textarea form-textarea-no-icon"
                placeholder="补充场景细节"
                placeholder-class="placeholder"
                :maxlength="200"
              />
            </view>
          </view>

          <!-- 对话风格 -->
          <view class="form-item">
            <text class="form-label">对话风格</text>
            <view class="input-wrapper">
              <input
                v-model="formData.style"
                class="form-input form-input-no-icon"
                placeholder="自然、友好"
                placeholder-class="placeholder"
                maxlength="50"
              />
            </view>
          </view>

          <!-- 消息条数 -->
          <view class="form-item">
            <text class="form-label">生成消息条数</text>
            <view class="input-wrapper">
              <uni-icons type="chatboxes" size="18" color="#999" class="input-icon" />
              <input
                v-model.number="formData.messageCount"
                class="form-input"
                type="number"
                placeholder="默认35，最大100"
                placeholder-class="placeholder"
              />
            </view>
          </view>
        </scroll-view>

        <view class="form-footer">
          <text class="points-hint">每次生成消耗 20 积分</text>
          <view class="footer-actions">
            <button class="btn-cancel" :disabled="submitting" @click="closePopup">取消</button>
            <button class="btn-submit" :disabled="submitting" @click="submit">生成</button>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- 进度层 -->
    <uni-popup ref="progressPopup" type="center" :is-mask-click="false">
      <view class="progress-panel">
        <text class="progress-title">AI 正在生成对话</text>
        <view class="progress-bar-wrap">
          <view class="progress-bar" :style="{ width: progressPercent + '%' }" />
        </view>
        <text class="progress-percent">{{ progressPercent }}%</text>
        <view class="step-list">
          <view
            v-for="(step, index) in progressSteps"
            :key="step.key"
            class="step-item"
            :class="{
              done: index < currentStepIndex,
              active: index === currentStepIndex,
              error: progressFailed && index === currentStepIndex
            }"
          >
            <view class="step-dot" />
            <text class="step-label">{{ step.label }}</text>
          </view>
        </view>
        <view v-if="progressSubText" class="progress-sub-wrap" :class="{ 'is-error': progressFailed }">
          <view class="progress-sub-inner">
            <view v-if="!progressFailed" class="progress-sub-dots">
              <view class="dot" />
              <view class="dot" />
              <view class="dot" />
            </view>
            <text :key="progressSubText" class="progress-sub-text">{{ progressSubText }}</text>
          </view>
        </view>
        <view v-if="progressFailed" class="progress-actions">
          <button class="btn-cancel" @click="closeProgress">关闭</button>
          <button class="btn-submit" @click="retrySubmit">重试</button>
        </view>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { uploadImage, searchConversationsByName } from '@/api/conversations.js'
import { createConversationByAgent } from '@/api/agentConversations.js'
import { getUserInfo } from '@/api/index.js'
import { getUUid } from '@/utils/tool.js'

const AI_POINTS_COST = 20

const SCENE_OPTIONS = [
  { code: '', label: '自动识别' },
  { code: 'INQUIRY', label: '询价' },
  { code: 'QUOTATION', label: '报价' },
  { code: 'DEAL_CLOSING', label: '成交' },
  { code: 'SERVICE_FEEDBACK', label: '客服反馈' },
  { code: 'CUSTOM', label: '自定义' }
]

const PROGRESS_STEPS = [
  { key: 'validate', label: '校验表单' },
  { key: 'upload', label: '上传头像' },
  { key: 'profile', label: '分析客户画像' },
  { key: 'generate', label: 'AI生成并保存' },
  { key: 'done', label: '完成' }
]

const GENERATE_SUB_TEXTS = [
  '正在生成对话内容…',
  '正在校验消息格式…',
  '正在优化对话结构…'
]

export default {
  name: 'AgentConversationPopup',
  data() {
    return {
      conversationList: [],
      formData: {
        avatarUrl: '',
        name: '',
        sourceConversationId: '',
        sceneType: '',
        customScene: '',
        scene: '',
        style: '自然、友好',
        messageCount: 35
      },
      sceneTypeIndex: 0,
      sourceSearchKeyword: '',
      filteredSourceList: [],
      selectedSource: null,
      recommendedSceneLabel: '',
      userId: uni.getStorageSync('userId'),
      submitting: false,
      progressSteps: PROGRESS_STEPS,
      currentStepIndex: 0,
      progressPercent: 0,
      progressSubText: '',
      progressFailed: false,
      progressErrorMessage: '',
      subTextTimer: null,
      subTextIndex: 0,
      lastSubmitPayload: null
    }
  },
  computed: {
    sceneTypeLabels() {
      return SCENE_OPTIONS.map(item => item.label)
    }
  },
  beforeDestroy() {
    this.clearSubTextTimer()
  },
  methods: {
    open(conversationList = []) {
      this.conversationList = Array.isArray(conversationList) ? conversationList : []
      this.resetForm()
      this.formData.avatarUrl = this.getRandomAvatar()
      this.formData.name = this.generateRandomName()
      this.filteredSourceList = [...this.conversationList]
      this.$refs.popup?.open('center')
    },

    resetForm() {
      this.formData = {
        avatarUrl: '',
        name: '',
        sourceConversationId: '',
        sceneType: '',
        customScene: '',
        scene: '',
        style: '自然、友好',
        messageCount: 35
      }
      this.sceneTypeIndex = 0
      this.sourceSearchKeyword = ''
      this.selectedSource = null
      this.recommendedSceneLabel = ''
      this.submitting = false
      this.progressFailed = false
      this.progressErrorMessage = ''
      this.lastSubmitPayload = null
    },

    closePopup() {
      if (this.submitting) return
      this.$refs.popup?.close()
      this.resetForm()
    },

    onSceneTypeChange(e) {
      const index = Number(e.detail.value)
      this.sceneTypeIndex = index
      this.formData.sceneType = SCENE_OPTIONS[index].code
    },

    onSourceSearch() {
      const keyword = (this.sourceSearchKeyword || '').trim().toLowerCase()
      if (!keyword) {
        this.filteredSourceList = [...this.conversationList]
        return
      }
      const localMatches = this.conversationList.filter(item => {
        const name = (item.name || '').toLowerCase()
        const desc = (item.description || '').toLowerCase()
        return name.includes(keyword) || desc.includes(keyword)
      })
      if (localMatches.length > 0) {
        this.filteredSourceList = localMatches
        return
      }
      this.searchRemoteSources(keyword)
    },

    async searchRemoteSources(keyword) {
      try {
        const res = await searchConversationsByName(this.userId, keyword, 'chat')
        if (res.code === 200 && Array.isArray(res.data)) {
          this.filteredSourceList = res.data
        } else {
          this.filteredSourceList = []
        }
      } catch (error) {
        this.filteredSourceList = []
      }
    },

    selectSource(item) {
      this.selectedSource = item
      this.formData.sourceConversationId = item.conversationId
      this.recommendedSceneLabel = ''
    },

    clearSelectedSource() {
      this.selectedSource = null
      this.formData.sourceConversationId = ''
      this.recommendedSceneLabel = ''
    },

    chooseAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.formData.avatarUrl = res.tempFilePaths[0]
        }
      })
    },

    randomGenerate() {
      this.formData.avatarUrl = this.getRandomAvatar()
      this.formData.name = this.generateRandomName()
      uni.showToast({ title: '已随机生成', icon: 'success', duration: 1500 })
    },

    generateRandomName() {
      if (Math.random() > 0.5) {
        const surnames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴']
        const names = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋']
        const randomSurname = surnames[Math.floor(Math.random() * surnames.length)]
        const randomName = names[Math.floor(Math.random() * names.length)]
        return randomSurname + randomName
      }
      const nicknames = ['风轻云淡', '岁月如歌', '浅笑安然', '追光者', '小确幸', 'Rainbow', 'Sunny']
      return nicknames[Math.floor(Math.random() * nicknames.length)]
    },

    getRandomAvatar() {
      const avatarServices = [
        () => 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Math.random().toString(36).substring(7),
        () => 'https://ui-avatars.com/api/?name=' + Math.random().toString(36).substring(7) + '&background=random&color=fff',
        () => 'https://randomuser.me/api/portraits/men/' + Math.floor(Math.random() * 99) + '.jpg',
        () => 'https://randomuser.me/api/portraits/women/' + Math.floor(Math.random() * 99) + '.jpg'
      ]
      return avatarServices[Math.floor(Math.random() * avatarServices.length)]()
    },

    hasHttp(str) {
      return /^https?:\/\/.+/i.test(str || '')
    },

    validateForm() {
      if (!this.formData.sourceConversationId) {
        return '请选择要模仿的对话'
      }
      if (!this.formData.name || !this.formData.name.trim()) {
        return '请输入姓名'
      }
      if (!this.formData.avatarUrl) {
        return '请选择或随机生成头像'
      }
      let count = Number(this.formData.messageCount)
      if (Number.isNaN(count) || count < 1) {
        count = 35
      }
      if (count > 100) {
        return '生成消息条数不能超过100'
      }
      this.formData.messageCount = count
      if (this.formData.sceneType === 'CUSTOM') {
        const customScene = (this.formData.customScene || '').trim()
        const scene = (this.formData.scene || '').trim()
        if (!customScene && !scene) {
          return '自定义场景需填写场景描述或场景补充'
        }
      }
      return ''
    },

    buildRequestPayload(targetAvatarUrl) {
      const payload = {
        ownerUserId: this.userId,
        targetUserId: this.formData.sourceConversationId,
        targetUserName: this.formData.name.trim(),
        targetAvatarUrl: targetAvatarUrl || '',
        style: (this.formData.style || '自然、友好').trim(),
        messageCount: Number(this.formData.messageCount) || 35
      }
      if (this.formData.sceneType) {
        payload.sceneType = this.formData.sceneType
      }
      const customScene = (this.formData.customScene || '').trim()
      const scene = (this.formData.scene || '').trim()
      if (customScene) payload.customScene = customScene
      if (scene) payload.scene = scene
      return payload
    },

    updateProgress(stepIndex, subText = '') {
      this.currentStepIndex = stepIndex
      this.progressPercent = Math.round((stepIndex / (this.progressSteps.length - 1)) * 100)
      this.progressSubText = subText
    },

    startGenerateSubTextRotation() {
      this.clearSubTextTimer()
      this.subTextIndex = 0
      this.progressSubText = GENERATE_SUB_TEXTS[0]
      this.subTextTimer = setInterval(() => {
        this.subTextIndex = (this.subTextIndex + 1) % GENERATE_SUB_TEXTS.length
        this.progressSubText = GENERATE_SUB_TEXTS[this.subTextIndex]
      }, 2500)
    },

    clearSubTextTimer() {
      if (this.subTextTimer) {
        clearInterval(this.subTextTimer)
        this.subTextTimer = null
      }
    },

    openProgress() {
      this.progressFailed = false
      this.progressErrorMessage = ''
      this.currentStepIndex = 0
      this.progressPercent = 0
      this.progressSubText = ''
      this.$refs.progressPopup?.open('center')
    },

    closeProgress() {
      this.clearSubTextTimer()
      this.$refs.progressPopup?.close()
      this.submitting = false
    },

    failProgress(message) {
      this.clearSubTextTimer()
      this.progressFailed = true
      this.progressErrorMessage = message
      this.progressSubText = message
    },

    getUserPointsValue(points) {
      if (points === null || points === undefined || points === '') {
        return 0
      }
      const value = Number(points)
      return Number.isNaN(value) ? 0 : value
    },

    isInsufficientPointsMessage(message, code) {
      if (code === 403) {
        return true
      }
      return typeof message === 'string' && message.includes('积分不足')
    },

    goRechargeForInsufficientPoints() {
      uni.showToast({ title: '积分不足，请充值', icon: 'none' })
      uni.setStorageSync('openPointsRecharge', true)
      this.closeProgress()
      this.$refs.popup?.close()
      this.resetForm()
      uni.switchTab({ url: '/pages/mine/mine' })
    },

    async checkPointsBeforeSubmit() {
      const res = await getUserInfo(this.userId)
      if (res.code !== 200 || !res.data) {
        throw new Error(res.message || '获取用户信息失败')
      }
      const points = this.getUserPointsValue(res.data.points)
      if (points < AI_POINTS_COST) {
        this.goRechargeForInsufficientPoints()
        return false
      }
      return true
    },

    async submit() {
      if (this.submitting) return
      const error = this.validateForm()
      if (error) {
        uni.showToast({ title: error, icon: 'none' })
        return
      }
      try {
        const hasEnoughPoints = await this.checkPointsBeforeSubmit()
        if (!hasEnoughPoints) {
          return
        }
      } catch (error) {
        uni.showToast({
          title: error?.message || '获取积分信息失败',
          icon: 'none'
        })
        return
      }
      this.submitting = true
      this.openProgress()
      await this.runSubmitFlow()
    },

    retrySubmit() {
      if (!this.lastSubmitPayload && !this.formData.sourceConversationId) {
        this.closeProgress()
        return
      }
      this.progressFailed = false
      this.progressErrorMessage = ''
      this.submitting = true
      this.openProgress()
      this.runSubmitFlow(true)
    },

    async runSubmitFlow(isRetry = false) {
      try {
        this.updateProgress(0, '正在校验表单参数…')
        await this.delay(200)

        let payload = this.lastSubmitPayload
        const canReusePayload = isRetry
          && payload
          && payload.targetAvatarUrl
          && this.hasHttp(payload.targetAvatarUrl)

        if (!canReusePayload) {
          const validationError = this.validateForm()
          if (validationError) {
            throw new Error(validationError)
          }

          let targetAvatarUrl = this.formData.avatarUrl
          this.updateProgress(1, '正在上传头像…')
          if (targetAvatarUrl && !this.hasHttp(targetAvatarUrl)) {
            const uploadId = getUUid()
            const uploadRes = await uploadImage(targetAvatarUrl, uploadId)
            if (uploadRes.code !== 200) {
              throw new Error(uploadRes.message || '头像上传失败')
            }
            targetAvatarUrl = uploadRes.data
          }

          payload = this.buildRequestPayload(targetAvatarUrl)
          this.lastSubmitPayload = payload
        } else {
          this.updateProgress(1, '头像已就绪，跳过上传')
          await this.delay(200)
        }

        // 画像分析在 create 接口内完成，此处仅展示进度
        this.updateProgress(2, '正在分析客户画像…')
        await this.delay(600)

        this.updateProgress(3, '正在生成对话内容…')
        this.startGenerateSubTextRotation()
        const createRes = await createConversationByAgent(payload)
        this.clearSubTextTimer()

        if (createRes.code !== 200) {
          if (this.isInsufficientPointsMessage(createRes.message, createRes.code)) {
            this.goRechargeForInsufficientPoints()
            return
          }
          throw new Error(createRes.message || 'AI对话创建失败')
        }

        this.updateProgress(4, '生成完成')
        this.progressPercent = 100
        await this.delay(400)

        this.closeProgress()
        this.$refs.popup?.close()
        this.resetForm()
        this.$emit('success', createRes.data)
      } catch (error) {
        this.clearSubTextTimer()
        const message = error?.message || error?.data?.message || 'AI对话创建失败'
        this.failProgress(message)
        this.$emit('error', message)
      }
    },

    delay(ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    }
  }
}
</script>

<style scoped>
.popup-content {
  width: 680rpx;
  background-color: #fff;
  border-radius: 24rpx;
  overflow: hidden;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
  max-height: 82vh;
  display: flex;
  flex-direction: column;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
  flex-shrink: 0;
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
  padding: 30rpx 40rpx;
  max-height: 58vh;
  box-sizing: border-box;
}

.form-item {
  margin-bottom: 28rpx;
}

.form-label {
  font-size: 28rpx;
  margin-bottom: 12rpx;
  display: block;
  color: #666;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.avatar-preview {
  width: 120rpx;
  height: 120rpx;
  border: 2rpx dashed #e6e6e6;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #999;
}

.placeholder-text {
  font-size: 22rpx;
  margin-top: 8rpx;
}

.random-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16rpx 24rpx;
  background-color: #f5f7fa;
  border: 1rpx solid #e6e6e6;
  border-radius: 12rpx;
}

.random-btn-text {
  font-size: 22rpx;
  color: #007aff;
  margin-top: 4rpx;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 24rpx;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}

.form-input {
  border: 1rpx solid #e6e6e6;
  border-radius: 16rpx;
  padding: 24rpx 24rpx 24rpx 68rpx;
  width: 100%;
  font-size: 28rpx;
  height: 80rpx;
  box-sizing: border-box;
}

.form-input-no-icon {
  padding-left: 24rpx;
}

.form-textarea {
  border: 1rpx solid #e6e6e6;
  border-radius: 16rpx;
  padding: 20rpx 24rpx;
  width: 100%;
  font-size: 28rpx;
  min-height: 120rpx;
  box-sizing: border-box;
}

.form-textarea-no-icon {
  padding-left: 24rpx;
}

.picker-value {
  border: 1rpx solid #e6e6e6;
  border-radius: 16rpx;
  padding: 24rpx;
  font-size: 28rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hint-text {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #007aff;
}

.selected-source {
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #333;
}

.clear-source {
  margin-left: 16rpx;
  color: #007aff;
}

.source-list {
  margin-top: 12rpx;
  max-height: 240rpx;
  border: 1rpx solid #f0f0f0;
  border-radius: 12rpx;
}

.source-item {
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.source-item.active {
  background-color: rgba(0, 122, 255, 0.08);
}

.source-avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 8rpx;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.source-info {
  flex: 1;
  overflow: hidden;
}

.source-name {
  font-size: 28rpx;
  color: #333;
  display: block;
}

.source-desc {
  font-size: 22rpx;
  color: #999;
  display: block;
  margin-top: 4rpx;
}

.source-empty {
  padding: 24rpx;
  text-align: center;
  font-size: 26rpx;
  color: #999;
}

.form-footer {
  display: flex;
  flex-direction: column;
  padding: 24rpx 40rpx 32rpx;
  gap: 16rpx;
  border-top: 1rpx solid #f0f0f0;
}

.points-hint {
  font-size: 22rpx;
  color: #999;
  text-align: center;
}

.footer-actions {
  display: flex;
  gap: 20rpx;
}

.footer-actions .btn-cancel,
.footer-actions .btn-submit {
  flex: 1;
}

.btn-cancel,
.btn-submit {
  height: 80rpx;
  line-height: 80rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  border: none;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #666;
}

.btn-submit {
  background-color: #007aff;
  color: #fff;
}

.progress-panel {
  width: 620rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  box-sizing: border-box;
}

.progress-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  display: block;
  text-align: center;
  margin-bottom: 30rpx;
}

.progress-bar-wrap {
  height: 12rpx;
  background: #f0f0f0;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #007aff;
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.progress-percent {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: #666;
  margin: 12rpx 0 24rpx;
}

.step-list {
  margin-top: 8rpx;
}

.step-item {
  display: flex;
  align-items: center;
  padding: 12rpx 0;
}

.step-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  background: #ddd;
  margin-right: 16rpx;
  flex-shrink: 0;
}

.step-item.done .step-dot {
  background: #007aff;
}

.step-item.active .step-dot {
  background: #007aff;
  box-shadow: 0 0 0 6rpx rgba(0, 122, 255, 0.2);
}

.step-item.error .step-dot {
  background: #f56c6c;
}

.step-label {
  font-size: 26rpx;
  color: #666;
}

.step-item.active .step-label,
.step-item.done .step-label {
  color: #333;
}

.step-item.error .step-label {
  color: #f56c6c;
}

.progress-sub-wrap {
  margin-top: 24rpx;
  padding: 18rpx 24rpx;
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.1) 0%, rgba(0, 122, 255, 0.04) 100%);
  border-radius: 14rpx;
  border: 1rpx solid rgba(0, 122, 255, 0.18);
  animation: sub-pulse 2.4s ease-in-out infinite;
}

.progress-sub-wrap.is-error {
  background: rgba(245, 108, 108, 0.08);
  border-color: rgba(245, 108, 108, 0.22);
  animation: none;
}

.progress-sub-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
}

.progress-sub-dots {
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex-shrink: 0;
}

.progress-sub-dots .dot {
  width: 10rpx;
  height: 10rpx;
  border-radius: 50%;
  background: #007aff;
  animation: dot-bounce 1.2s ease-in-out infinite;
}

.progress-sub-dots .dot:nth-child(2) {
  animation-delay: 0.15s;
}

.progress-sub-dots .dot:nth-child(3) {
  animation-delay: 0.3s;
}

.progress-sub-text {
  font-size: 26rpx;
  font-weight: 500;
  color: #007aff;
  line-height: 1.5;
  animation: sub-fade-in 0.45s ease;
}

.progress-sub-wrap.is-error .progress-sub-text {
  color: #f56c6c;
  font-weight: 400;
}

@keyframes dot-bounce {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes sub-fade-in {
  from {
    opacity: 0;
    transform: translateY(6rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes sub-pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(0, 122, 255, 0);
  }
  50% {
    box-shadow: 0 0 0 6rpx rgba(0, 122, 255, 0.08);
  }
}

.progress-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 28rpx;
}

.placeholder {
  color: #bbb;
}
</style>
