<template>
  <view>
    <uni-popup ref="popup" type="center" :is-mask-click="!submitting">
      <view class="popup-content">
        <view class="form-header">
          <view class="header-text">
            <view class="title-row">
              <text class="title-icon">✨</text>
              <text class="title">AI 生成对话</text>
            </view>
            <text class="subtitle">基于已有对话风格，智能生成新客户会话</text>
          </view>
          <view class="close-btn" @click="closePopup" @tap="closePopup">
            <uni-icons type="close" size="22" color="#666" />
          </view>
        </view>

        <scroll-view class="form-body" scroll-y>
          <!-- 客户信息 -->
          <view class="form-section">
            <text class="section-title">客户信息</text>
            <view class="customer-card">
              <view class="avatar-preview" @click="chooseAvatar" @tap="chooseAvatar">
                <image v-if="formData.avatarUrl" :src="formData.avatarUrl" class="avatar-img" mode="aspectFill" />
                <view v-else class="avatar-placeholder">
                  <uni-icons type="camera" size="24" color="#999" />
                </view>
              </view>
              <view class="customer-info">
                <view class="input-wrapper name-input-wrap">
                  <input
                    v-model="formData.name"
                    class="form-input form-input-no-icon name-input"
                    placeholder="请输入姓名"
                    placeholder-class="placeholder"
                    maxlength="20"
                  />
                </view>
             
              </view>
			  
              <view class="random-btn" @click="randomGenerate" @tap="randomGenerate">
                <uni-icons type="reload" size="18" color="#007aff" />
                <text class="random-btn-text">随机</text>
              </view>
            </view>
          </view>

          <!-- 模仿对话 -->
          <view class="form-section" :class="{ 'has-error': sourceFieldError }">
            <text class="section-title">模仿对话<text class="required">*</text></text>
            <view v-if="selectedSource" class="selected-source-card">
              <image class="source-avatar-round" :src="selectedSource.avatarUrl" mode="aspectFill" />
              <view class="source-info">
                <text class="source-name">{{ selectedSource.name }}</text>
                <text v-if="selectedSource.description" class="source-desc">{{ selectedSource.description }}</text>
              </view>
              <view class="clear-source-btn" @click="clearSelectedSource" @tap="clearSelectedSource">
                <uni-icons type="closeempty" size="20" color="#999" />
              </view>
            </view>
            <template v-else>
              <view class="input-wrapper">
                <uni-icons type="search" size="18" color="#999" class="input-icon" />
                <input
                  v-model="sourceSearchKeyword"
                  class="form-input"
                  placeholder="搜索当前列表中的对话"
                  placeholder-class="placeholder"
                  @input="onSourceSearchInput"
                />
              </view>
              <view class="source-list">
                <view v-if="sourceSearching" class="source-loading">
                  <text>搜索中…</text>
                </view>
                <template v-else>
                  <view
                    v-for="item in filteredSourceList"
                    :key="item.conversationId"
                    class="source-item"
                    :class="{ active: formData.sourceConversationId === item.conversationId }"
                    @click="selectSource(item)"
                    @tap="selectSource(item)"
                  >
                    <image class="source-avatar-round" :src="item.avatarUrl" mode="aspectFill" />
                    <view class="source-info">
                      <text class="source-name">{{ item.name }}</text>
                      <text v-if="item.description" class="source-desc">{{ item.description }}</text>
                    </view>
                    <uni-icons
                      v-if="formData.sourceConversationId === item.conversationId"
                      type="checkmarkempty"
                      size="20"
                      color="#007aff"
                    />
                  </view>
                  <view v-if="filteredSourceList.length === 0" class="source-empty">
                    {{ sourceSearchKeyword ? '未找到匹配对话' : '暂无对话可选' }}
                  </view>
                </template>
              </view>
            </template>
            <text v-if="sourceFieldError" class="field-error">{{ sourceFieldError }}</text>
          </view>

          <!-- 场景与风格 -->
          <view class="form-section">
            <text class="section-title">场景与风格</text>
            <view class="form-item">
              <text class="form-label">场景类型</text>
              <view class="scene-chips">
                <view
                  v-for="item in sceneOptions"
                  :key="item.code || 'auto'"
                  class="scene-chip"
                  :class="{ active: formData.sceneType === item.code }"
                  @click="selectSceneType(item)"
                  @tap="selectSceneType(item)"
                >
                  {{ item.label }}
                </view>
              </view>
            </view>

            <view v-if="formData.sceneType === 'CUSTOM'" class="form-item custom-scene-item">
              <text class="form-label">自定义场景<text class="required">*</text></text>
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

            <view class="form-item">
              <text class="form-label">场景补充<text class="optional">（可选）</text></text>
              <view class="input-wrapper">
                <textarea
                  v-model="formData.scene"
                  class="form-textarea form-textarea-no-icon"
                  placeholder="如：老客户、关注交期、已有竞品报价…"
                  placeholder-class="placeholder"
                  :maxlength="200"
                />
              </view>
            </view>

            <view class="form-item">
              <text class="form-label">对话风格</text>
              <view class="style-presets">
                <view
                  v-for="preset in stylePresets"
                  :key="preset"
                  class="style-preset"
                  :class="{ active: formData.style === preset }"
                  @click="applyStylePreset(preset)"
                  @tap="applyStylePreset(preset)"
                >
                  {{ preset }}
                </view>
              </view>
              <view class="input-wrapper" style="margin-top: 12rpx;">
                <input
                  v-model="formData.style"
                  class="form-input form-input-no-icon"
                  placeholder="自然、友好"
                  placeholder-class="placeholder"
                  maxlength="50"
                />
              </view>
            </view>
          </view>

          <!-- 生成设置 -->
          <view class="form-section">
            <text class="section-title">生成设置</text>
            <view class="form-item">
              <text class="form-label">生成消息条数</text>
              <view class="stepper">
                <view
                  class="stepper-btn"
                  :class="{ disabled: formData.messageCount <= 1 }"
                  @click="adjustMessageCount(-1)"
                  @tap="adjustMessageCount(-1)"
                >
                  <text>−</text>
                </view>
                <text class="stepper-value">{{ formData.messageCount }} 条</text>
                <view
                  class="stepper-btn"
                  :class="{ disabled: formData.messageCount >= 100 }"
                  @click="adjustMessageCount(1)"
                  @tap="adjustMessageCount(1)"
                >
                  <text>+</text>
                </view>
              </view>
              <text class="stepper-hint">默认 35 条，范围 1–100</text>
            </view>
          </view>
        </scroll-view>

        <view class="form-footer">
          <view class="points-badge">
            <text class="points-icon">💎</text>
            <text class="points-text">本次消耗 {{ AI_POINTS_COST }} 积分</text>
          </view>
          <view class="footer-actions">
            <button class="btn-cancel" :disabled="submitting" @click="closePopup">取消</button>
            <button class="btn-submit" :disabled="submitting" :loading="submitting" @click="submit">
              {{ submitting ? '生成中…' : '✨ AI 生成' }}
            </button>
          </view>
        </view>
      </view>
    </uni-popup>

    <!-- 进度层 -->
    <uni-popup ref="progressPopup" type="center" :is-mask-click="false">
      <view class="progress-panel">
        <text class="progress-title">{{ progressTitle }}</text>

        <view v-if="progressSucceeded" class="progress-success">
          <view class="success-icon-wrap">
            <uni-icons type="checkmarkempty" size="48" color="#34c759" />
          </view>
          <text class="success-text">对话生成成功</text>
        </view>

        <template v-else>
          <view class="progress-bar-wrap">
            <view
              class="progress-bar"
              :class="{ 'is-error': progressFailed }"
              :style="{ width: progressPercent + '%' }"
            />
          </view>
          <text class="progress-percent">{{ progressPercent }}%</text>

          <view class="step-bar">
            <view
              v-for="(step, index) in progressSteps"
              :key="step.key"
              class="step-bar-item"
              :class="{
                done: index < currentStepIndex || (progressFailed && index < currentStepIndex),
                active: index === currentStepIndex && !progressFailed,
                error: progressFailed && index === currentStepIndex
              }"
            >
              <view class="step-bar-dot" />
              <text class="step-bar-label">{{ step.label }}</text>
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
            <button
              v-if="isInsufficientPointsError"
              class="btn-submit btn-full"
              @click="goRechargeForInsufficientPoints"
            >
              去充值
            </button>
            <template v-else>
              <button class="btn-cancel" @click="closeProgress">关闭</button>
              <button class="btn-submit" @click="retrySubmit">重试</button>
            </template>
          </view>
        </template>
      </view>
    </uni-popup>
  </view>
</template>

<script>
import { uploadImage, searchConversationsByName } from '@/api/conversations.js'
import { createConversationByAgent } from '@/api/agentConversations.js'
import { getUserInfo } from '@/api/index.js'
import { getUUid } from '@/utils/tool.js'
import { debounce } from '@/utils/commonUtils.js'

const AI_POINTS_COST = 20

const SCENE_OPTIONS = [
  { code: '', label: '自动识别' },
  { code: 'INQUIRY', label: '询价' },
  { code: 'QUOTATION', label: '报价' },
  { code: 'DEAL_CLOSING', label: '成交' },
  { code: 'SERVICE_FEEDBACK', label: '客服反馈' },
  { code: 'CUSTOM', label: '自定义' }
]

const STYLE_PRESETS = ['自然友好', '专业正式', '热情活泼', '简洁直接']

const PROGRESS_STEPS = [
  { key: 'prepare', label: '准备中' },
  { key: 'generate', label: 'AI 生成' },
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
      AI_POINTS_COST,
      sceneOptions: SCENE_OPTIONS,
      stylePresets: STYLE_PRESETS,
      conversationList: [],
      formData: {
        avatarUrl: '',
        name: '',
        sourceConversationId: '',
        sceneType: '',
        customScene: '',
        scene: '',
        style: '自然友好',
        messageCount: 35
      },
      sourceSearchKeyword: '',
      filteredSourceList: [],
      selectedSource: null,
      sourceSearching: false,
      sourceFieldError: '',
      searchRequestId: 0,
      userId: '',
      submitting: false,
      progressSteps: PROGRESS_STEPS,
      currentStepIndex: 0,
      progressPercent: 0,
      progressSubText: '',
      progressFailed: false,
      progressSucceeded: false,
      progressErrorMessage: '',
      isInsufficientPointsError: false,
      subTextTimer: null,
      subTextIndex: 0,
      lastSubmitPayload: null
    }
  },
  computed: {
    progressTitle() {
      if (this.progressSucceeded) return '生成完成'
      if (this.progressFailed) return '生成失败'
      return 'AI 正在生成对话'
    }
  },
  created() {
    this.debouncedSourceSearch = debounce(this.performSourceSearch, 300)
  },
  beforeDestroy() {
    this.clearSubTextTimer()
  },
  methods: {
    open(conversationList = []) {
      this.userId = uni.getStorageSync('userId')
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
        style: '自然友好',
        messageCount: 35
      }
      this.sourceSearchKeyword = ''
      this.selectedSource = null
      this.sourceSearching = false
      this.sourceFieldError = ''
      this.submitting = false
      this.progressFailed = false
      this.progressSucceeded = false
      this.progressErrorMessage = ''
      this.isInsufficientPointsError = false
      this.lastSubmitPayload = null
    },

    closePopup() {
      if (this.submitting) return
      this.$refs.popup?.close()
      this.resetForm()
    },

    selectSceneType(item) {
      this.formData.sceneType = item.code
    },

    applyStylePreset(preset) {
      this.formData.style = preset
    },

    adjustMessageCount(delta) {
      const next = Number(this.formData.messageCount) + delta
      if (next < 1 || next > 100) return
      this.formData.messageCount = next
    },

    onSourceSearchInput() {
      this.debouncedSourceSearch()
    },

    performSourceSearch() {
      const keyword = (this.sourceSearchKeyword || '').trim().toLowerCase()
      if (!keyword) {
        this.filteredSourceList = [...this.conversationList]
        this.sourceSearching = false
        return
      }
      const localMatches = this.conversationList.filter(item => {
        const name = (item.name || '').toLowerCase()
        const desc = (item.description || '').toLowerCase()
        return name.includes(keyword) || desc.includes(keyword)
      })
      if (localMatches.length > 0) {
        this.filteredSourceList = localMatches
        this.sourceSearching = false
        return
      }
      this.searchRemoteSources(keyword)
    },

    async searchRemoteSources(keyword) {
      const requestId = ++this.searchRequestId
      this.sourceSearching = true
      try {
        const res = await searchConversationsByName(this.userId, keyword, 'chat')
        if (requestId !== this.searchRequestId) return
        if (res.code === 200 && Array.isArray(res.data)) {
          this.filteredSourceList = res.data
        } else {
          this.filteredSourceList = []
        }
      } catch (error) {
        if (requestId !== this.searchRequestId) return
        this.filteredSourceList = []
      } finally {
        if (requestId === this.searchRequestId) {
          this.sourceSearching = false
        }
      }
    },

    selectSource(item) {
      this.selectedSource = item
      this.formData.sourceConversationId = item.conversationId
      this.sourceFieldError = ''
    },

    clearSelectedSource() {
      this.selectedSource = null
      this.formData.sourceConversationId = ''
      this.filteredSourceList = [...this.conversationList]
    },

    chooseAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.formData.avatarUrl = res.tempFilePaths[0]
        },
        fail: () => {
          uni.showToast({ title: '选择头像失败', icon: 'none' })
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
        this.sourceFieldError = '请选择要模仿的对话'
        return '请选择要模仿的对话'
      }
      this.sourceFieldError = ''
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
        style: (this.formData.style || '自然友好').trim(),
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

    updateProgress(stepIndex, subText = '', percent) {
      this.currentStepIndex = stepIndex
      if (typeof percent === 'number') {
        this.progressPercent = percent
      } else {
        this.progressPercent = Math.round((stepIndex / (this.progressSteps.length - 1)) * 100)
      }
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
      this.progressSucceeded = false
      this.progressErrorMessage = ''
      this.isInsufficientPointsError = false
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

    failProgress(message, isInsufficientPoints = false) {
      this.clearSubTextTimer()
      this.progressFailed = true
      this.isInsufficientPointsError = isInsufficientPoints
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
      uni.switchTab({ url: '/pages/mine/mine' })
    },

    async checkPointsBeforeSubmit() {
      this.userId = uni.getStorageSync('userId')
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
      this.isInsufficientPointsError = false
      this.progressErrorMessage = ''
      this.submitting = true
      this.openProgress()
      this.runSubmitFlow(true)
    },

    async runSubmitFlow(isRetry = false) {
      try {
        this.updateProgress(0, '正在校验表单参数…', 10)
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
          this.updateProgress(0, '正在上传头像…', 25)
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
          this.updateProgress(0, '头像已就绪，跳过上传', 30)
          await this.delay(200)
        }

        this.updateProgress(1, '正在分析客户画像并生成对话…', 50)
        this.startGenerateSubTextRotation()
        const createRes = await createConversationByAgent(payload)
        this.clearSubTextTimer()

        if (createRes.code !== 200) {
          if (this.isInsufficientPointsMessage(createRes.message, createRes.code)) {
            this.failProgress('积分不足，请充值后重试', true)
            return
          }
          throw new Error(createRes.message || 'AI对话创建失败')
        }

        this.updateProgress(2, '生成完成', 100)
        this.progressSucceeded = true
        await this.delay(800)

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
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 28rpx 32rpx 24rpx;
  background: linear-gradient(135deg, #f8f9ff 0%, #ffffff 100%);
  border-bottom: 1rpx solid #f0f0f0;
  flex-shrink: 0;
}

.header-text {
  flex: 1;
  padding-right: 16rpx;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.title-icon {
  font-size: 32rpx;
}

.title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
}

.subtitle {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #999;
  line-height: 1.4;
}

.close-btn {
  width: 88rpx;
  height: 88rpx;
  margin: -20rpx -20rpx 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
}

.close-btn:active {
  background-color: rgba(0, 0, 0, 0.05);
}

.form-body {
  padding: 24rpx 32rpx;
  max-height: 56vh;
  box-sizing: border-box;
}

.form-section {
  margin-bottom: 32rpx;
}

.form-section.has-error .source-list,
.form-section.has-error .input-wrapper .form-input {
  border-color: #f56c6c;
}

.section-title {
  display: block;
  font-size: 26rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 16rpx;
}

.required {
  color: #f56c6c;
  margin-left: 4rpx;
}

.optional {
  font-size: 22rpx;
  font-weight: 400;
  color: #bbb;
  margin-left: 4rpx;
}

.form-item {
  margin-bottom: 24rpx;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-label {
  font-size: 26rpx;
  margin-bottom: 12rpx;
  display: block;
  color: #666;
}

.field-error {
  display: block;
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #f56c6c;
}

/* 客户卡片 */
.customer-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx;
  background: #f8f9fb;
  border-radius: 16rpx;
  border: 1rpx solid #eef0f3;
}

.avatar-preview {
  width: 96rpx;
  height: 96rpx;
  border: 2rpx dashed #d9dce3;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  background: #fff;
}

.avatar-preview:active {
  border-color: #007aff;
}

.avatar-img {
  width: 100%;
  height: 100%;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.customer-info {
  flex: 1;
  min-width: 0;
}

.name-input-wrap {
  margin-bottom: 0;
}

.name-input {
  height: 72rpx;
  background: #fff;
}

.avatar-hint {
  display: block;
  margin-top: 6rpx;
  font-size: 20rpx;
  color: #bbb;
}

.random-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 14rpx 20rpx;
  background-color: #fff;
  border: 1rpx solid #e6e6e6;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.random-btn:active {
  background-color: #e8ecf0;
  transform: scale(0.96);
}

.random-btn-text {
  font-size: 20rpx;
  color: #007aff;
  margin-top: 4rpx;
}

/* 输入框 */
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
  background: #fff;
  transition: border-color 0.2s;
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
  background: #fff;
}

.form-textarea-no-icon {
  padding-left: 24rpx;
}

.custom-scene-item {
  animation: fade-slide-in 0.25s ease;
}

@keyframes fade-slide-in {
  from {
    opacity: 0;
    transform: translateY(-8rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 场景 chips */
.scene-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.scene-chip {
  padding: 12rpx 24rpx;
  font-size: 24rpx;
  color: #666;
  background: #f5f7fa;
  border: 1rpx solid #e6e6e6;
  border-radius: 32rpx;
}

.scene-chip.active {
  color: #007aff;
  border-color: #007aff;
  background: rgba(0, 122, 255, 0.08);
}

.scene-chip:active {
  opacity: 0.8;
}

/* 风格预设 */
.style-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.style-preset {
  padding: 10rpx 20rpx;
  font-size: 22rpx;
  color: #666;
  background: #f5f7fa;
  border: 1rpx solid #e6e6e6;
  border-radius: 24rpx;
}

.style-preset.active {
  color: #007aff;
  border-color: #007aff;
  background: rgba(0, 122, 255, 0.08);
}

/* 步进器 */
.stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 32rpx;
  padding: 16rpx 0;
}

.stepper-btn {
  width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border: 1rpx solid #e6e6e6;
  border-radius: 50%;
  font-size: 36rpx;
  color: #333;
}

.stepper-btn:active:not(.disabled) {
  background: #e8ecf0;
}

.stepper-btn.disabled {
  opacity: 0.35;
}

.stepper-value {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  min-width: 120rpx;
  text-align: center;
}

.stepper-hint {
  display: block;
  text-align: center;
  font-size: 22rpx;
  color: #bbb;
  margin-top: 4rpx;
}

/* 模仿对话 */
.selected-source-card {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background: rgba(0, 122, 255, 0.06);
  border: 1rpx solid rgba(0, 122, 255, 0.2);
  border-left: 6rpx solid #007aff;
  border-radius: 12rpx;
}

.source-avatar-round {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
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
  font-weight: 500;
}

.source-desc {
  font-size: 22rpx;
  color: #999;
  display: block;
  margin-top: 4rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.clear-source-btn {
  width: 88rpx;
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.source-list {
  margin-top: 12rpx;
  max-height: 320rpx;
  border: 1rpx solid #f0f0f0;
  border-radius: 12rpx;
  overflow: hidden;
}

.source-item {
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.source-item:last-child {
  border-bottom: none;
}

.source-item.active {
  background-color: rgba(0, 122, 255, 0.08);
}

.source-item:active {
  background-color: rgba(0, 122, 255, 0.12);
}

.source-loading,
.source-empty {
  padding: 32rpx;
  text-align: center;
  font-size: 26rpx;
  color: #999;
}

/* 底部 */
.form-footer {
  display: flex;
  flex-direction: column;
  padding: 20rpx 32rpx 32rpx;
  gap: 16rpx;
  border-top: 1rpx solid #f0f0f0;
  flex-shrink: 0;
}

.points-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8rpx;
  padding: 10rpx 24rpx;
  background: linear-gradient(135deg, rgba(88, 86, 214, 0.08) 0%, rgba(0, 122, 255, 0.08) 100%);
  border-radius: 32rpx;
  align-self: center;
}

.points-icon {
  font-size: 24rpx;
}

.points-text {
  font-size: 24rpx;
  color: #5856d6;
  font-weight: 500;
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #666;
}

.btn-cancel:active {
  background-color: #ebebeb;
}

.btn-submit {
  background: linear-gradient(135deg, #007aff 0%, #5856d6 100%);
  color: #fff;
}

.btn-submit:active {
  opacity: 0.9;
}

.btn-submit[disabled] {
  opacity: 0.6;
}

.btn-full {
  width: 100%;
}

/* 进度层 */
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

.progress-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20rpx 0 10rpx;
}

.success-icon-wrap {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: rgba(52, 199, 89, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20rpx;
}

.success-text {
  font-size: 28rpx;
  color: #34c759;
  font-weight: 500;
}

.progress-bar-wrap {
  height: 12rpx;
  background: #f0f0f0;
  border-radius: 6rpx;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #007aff 0%, #5856d6 100%);
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.progress-bar.is-error {
  background: #f56c6c;
}

.progress-percent {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: #666;
  margin: 12rpx 0 28rpx;
}

/* 横向步骤条 */
.step-bar {
  display: flex;
  justify-content: space-between;
  padding: 0 8rpx;
}

.step-bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  position: relative;
}

.step-bar-item:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 12rpx;
  left: 60%;
  width: 80%;
  height: 2rpx;
  background: #e0e0e0;
  z-index: 0;
}

.step-bar-item.done:not(:last-child)::after {
  background: #007aff;
}

.step-bar-dot {
  width: 24rpx;
  height: 24rpx;
  border-radius: 50%;
  background: #ddd;
  margin-bottom: 10rpx;
  position: relative;
  z-index: 1;
}

.step-bar-item.done .step-bar-dot,
.step-bar-item.active .step-bar-dot {
  background: #007aff;
}

.step-bar-item.active .step-bar-dot {
  box-shadow: 0 0 0 6rpx rgba(0, 122, 255, 0.2);
}

.step-bar-item.error .step-bar-dot {
  background: #f56c6c;
  box-shadow: 0 0 0 6rpx rgba(245, 108, 108, 0.2);
}

.step-bar-label {
  font-size: 22rpx;
  color: #999;
  text-align: center;
}

.step-bar-item.done .step-bar-label,
.step-bar-item.active .step-bar-label {
  color: #333;
}

.step-bar-item.error .step-bar-label {
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
