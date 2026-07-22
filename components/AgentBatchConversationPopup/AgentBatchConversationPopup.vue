<template>
  <view>
    <uni-popup ref="popup" type="center" :is-mask-click="!submitting">
      <view class="popup-content">
        <view class="form-header">
          <view class="header-text">
            <view class="title-row">
              <text class="title-icon">✨</text>
              <text class="title">批量 AI 生成对话</text>
            </view>
            <text class="subtitle">基于已有对话风格，批量生成多个新客户会话</text>
          </view>
          <view class="close-btn" @click="closePopup" @tap="closePopup">
            <uni-icons type="close" size="22" color="#666" />
          </view>
        </view>

        <scroll-view class="form-body" scroll-y>
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

          <view class="form-section">
            <text class="section-title">生成设置</text>
            <view class="form-item">
              <text class="form-label">每条消息条数</text>
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

            <view class="form-item">
              <text class="form-label">生成对话数量</text>
              <view class="stepper">
                <view
                  class="stepper-btn"
                  :class="{ disabled: batchCount <= 1 }"
                  @click="adjustBatchCount(-1)"
                  @tap="adjustBatchCount(-1)"
                >
                  <text>−</text>
                </view>
                <text class="stepper-value">{{ batchCount }} 个</text>
                <view
                  class="stepper-btn"
                  :class="{ disabled: batchCount >= 20 }"
                  @click="adjustBatchCount(1)"
                  @tap="adjustBatchCount(1)"
                >
                  <text>+</text>
                </view>
              </view>
              <text class="stepper-hint">默认 5 个，范围 1–20，每条自动随机姓名和头像</text>
            </view>

            <view class="form-item">
              <text class="form-label">并行路数</text>
              <view class="scene-chips">
                <view
                  v-for="item in concurrencyOptions"
                  :key="item.value"
                  class="scene-chip"
                  :class="{ active: concurrency === item.value }"
                  @click="selectConcurrency(item.value)"
                  @tap="selectConcurrency(item.value)"
                >
                  {{ item.label }}
                </view>
              </view>
              <text class="stepper-hint">多路同时请求 AI，可显著缩短总耗时（默认 3 路）</text>
            </view>
          </view>
        </scroll-view>

        <view class="form-footer">
          <view class="points-badge">
            <text class="points-icon">💎</text>
            <text class="points-text">本次消耗 {{ totalPointsCost }} 积分</text>
          </view>
          <view class="footer-actions">
            <button class="btn-cancel" :disabled="submitting" @click="closePopup">取消</button>
            <button class="btn-submit" :disabled="submitting" :loading="submitting" @click="submit">
              {{ submitting ? '生成中…' : '✨ 批量生成' }}
            </button>
          </view>
        </view>
      </view>
    </uni-popup>

    <uni-popup ref="progressPopup" type="center" :is-mask-click="false">
      <view class="progress-panel">
        <text class="progress-title">{{ progressTitle }}</text>

        <view v-if="progressSucceeded" class="progress-success">
          <view class="success-icon-wrap">
            <uni-icons type="checkmarkempty" size="48" color="#34c759" />
          </view>
          <text class="success-text">{{ progressResultText }}</text>
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
          <text class="progress-count">{{ progressCountText }}</text>

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
              <button v-if="failedToRetry > 0" class="btn-submit" @click="retryFailed">重试失败项</button>
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
import {
  AI_POINTS_COST,
  SCENE_OPTIONS,
  STYLE_PRESETS,
  hasHttp,
  generateRandomName,
  getRandomAvatar,
  getUserPointsValue,
  isInsufficientPointsMessage,
  buildAgentCreatePayload,
  validateAgentForm,
  createDefaultAgentFormData,
  BATCH_CONCURRENCY_OPTIONS,
  DEFAULT_BATCH_CONCURRENCY,
  runWithConcurrency
} from '@/utils/agentConversationUtils.js'

export default {
  name: 'AgentBatchConversationPopup',
  data() {
    return {
      AI_POINTS_COST,
      sceneOptions: SCENE_OPTIONS,
      stylePresets: STYLE_PRESETS,
      conversationList: [],
      formData: createDefaultAgentFormData(),
      batchCount: 5,
      concurrency: DEFAULT_BATCH_CONCURRENCY,
      concurrencyOptions: BATCH_CONCURRENCY_OPTIONS,
      sourceSearchKeyword: '',
      filteredSourceList: [],
      selectedSource: null,
      sourceSearching: false,
      sourceFieldError: '',
      searchRequestId: 0,
      userId: '',
      submitting: false,
      progressPercent: 0,
      progressSubText: '',
      progressFailed: false,
      progressSucceeded: false,
      progressResultText: '',
      isInsufficientPointsError: false,
      currentIndex: 0,
      completedCount: 0,
      successCount: 0,
      failCount: 0,
      failedToRetry: 0,
      shouldStop: false,
      generatingTotal: 0
    }
  },
  computed: {
    totalPointsCost() {
      return this.batchCount * AI_POINTS_COST
    },
    progressTitle() {
      if (this.progressSucceeded) return '批量生成完成'
      if (this.progressFailed) return '批量生成结束'
      return 'AI 正在批量生成'
    },
    progressCountText() {
      if (this.progressFailed || this.progressSucceeded) {
        return `成功 ${this.successCount} 条，失败 ${this.failCount} 条`
      }
      return `已完成 ${this.completedCount}/${this.generatingTotal || this.batchCount}（${this.concurrency} 路并行）`
    }
  },
  created() {
    this.debouncedSourceSearch = debounce(this.performSourceSearch, 300)
  },
  methods: {
    open(conversationList = []) {
      this.userId = uni.getStorageSync('userId')
      this.conversationList = Array.isArray(conversationList) ? conversationList : []
      this.resetForm()
      this.filteredSourceList = [...this.conversationList]
      this.$refs.popup?.open('center')
    },

    resetForm() {
      this.formData = createDefaultAgentFormData()
      this.batchCount = 5
      this.concurrency = DEFAULT_BATCH_CONCURRENCY
      this.sourceSearchKeyword = ''
      this.selectedSource = null
      this.sourceSearching = false
      this.sourceFieldError = ''
      this.submitting = false
      this.progressFailed = false
      this.progressSucceeded = false
      this.progressResultText = ''
      this.isInsufficientPointsError = false
      this.currentIndex = 0
      this.completedCount = 0
      this.successCount = 0
      this.failCount = 0
      this.failedToRetry = 0
      this.shouldStop = false
      this.progressPercent = 0
      this.progressSubText = ''
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

    adjustBatchCount(delta) {
      const next = Number(this.batchCount) + delta
      if (next < 1 || next > 20) return
      this.batchCount = next
    },

    selectConcurrency(value) {
      this.concurrency = value
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

    validateForm() {
      const result = validateAgentForm(this.formData, { requireCustomerInfo: false })
      this.sourceFieldError = result.sourceFieldError
      if (result.error) {
        return result.error
      }
      let messageCount = Number(this.formData.messageCount)
      if (Number.isNaN(messageCount) || messageCount < 1) {
        messageCount = 35
      }
      this.formData.messageCount = messageCount
      const count = Number(this.batchCount)
      if (Number.isNaN(count) || count < 1 || count > 20) {
        return '生成数量需在 1–20 之间'
      }
      this.batchCount = count
      return ''
    },

    openProgress() {
      this.progressFailed = false
      this.progressSucceeded = false
      this.progressResultText = ''
      this.isInsufficientPointsError = false
      this.currentIndex = 0
      this.completedCount = 0
      this.successCount = 0
      this.failCount = 0
      this.failedToRetry = 0
      this.shouldStop = false
      this.progressPercent = 0
      this.progressSubText = ''
      this.$refs.progressPopup?.open('center')
    },

    closeProgress() {
      this.$refs.progressPopup?.close()
      this.submitting = false
    },

    failProgress(message, isInsufficientPoints = false) {
      if (this.progressFailed && isInsufficientPoints) {
        return
      }
      this.progressFailed = true
      this.isInsufficientPointsError = isInsufficientPoints
      this.progressSubText = message
      const total = this.generatingTotal || this.batchCount
      this.progressPercent = Math.round((this.completedCount / total) * 100)
    },

    finishProgress() {
      this.progressPercent = 100
      if (this.failCount === 0) {
        this.progressSucceeded = true
        this.progressResultText = `成功生成 ${this.successCount} 条对话`
      } else if (this.successCount === 0) {
        this.progressFailed = true
        this.progressSubText = `全部失败，共 ${this.failCount} 条`
      } else {
        this.progressSucceeded = true
        this.progressResultText = `成功 ${this.successCount} 条，失败 ${this.failCount} 条`
      }
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
      const points = getUserPointsValue(res.data.points)
      if (points < this.totalPointsCost) {
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
      await this.runBatchFlow(this.batchCount)
    },

    async retryFailed() {
      if (this.failedToRetry <= 0) {
        this.closeProgress()
        return
      }
      const retryCount = this.failedToRetry
      try {
        const res = await getUserInfo(this.userId)
        if (res.code !== 200 || !res.data) {
          throw new Error(res.message || '获取用户信息失败')
        }
        const points = getUserPointsValue(res.data.points)
        if (points < retryCount * AI_POINTS_COST) {
          this.goRechargeForInsufficientPoints()
          return
        }
      } catch (error) {
        uni.showToast({
          title: error?.message || '获取积分信息失败',
          icon: 'none'
        })
        return
      }
      this.failedToRetry = 0
      this.failCount = 0
      this.shouldStop = false
      this.progressFailed = false
      this.isInsufficientPointsError = false
      this.progressSubText = ''
      this.submitting = true
      this.runBatchFlow(retryCount)
    },

    async generateOneConversation(index, totalCount) {
      if (this.shouldStop) {
        return 'stop'
      }

      try {
        const name = generateRandomName()
        let avatarUrl = getRandomAvatar()

        if (avatarUrl && !hasHttp(avatarUrl)) {
          const uploadId = getUUid()
          const uploadRes = await uploadImage(avatarUrl, uploadId)
          if (uploadRes.code !== 200) {
            throw new Error(uploadRes.message || '头像上传失败')
          }
          avatarUrl = uploadRes.data
        }

        const payload = buildAgentCreatePayload(
          { ...this.formData, name },
          this.userId,
          avatarUrl
        )

        const createRes = await createConversationByAgent(payload)

        if (createRes.code !== 200) {
          if (isInsufficientPointsMessage(createRes.message, createRes.code)) {
            if (!this.shouldStop) {
              this.shouldStop = true
              this.failCount += 1
              this.failedToRetry += 1
              this.failProgress('积分不足，已停止后续生成', true)
            }
            return 'stop'
          }
          throw new Error(createRes.message || 'AI对话创建失败')
        }

        this.successCount += 1
        return 'success'
      } catch (error) {
        const message = error?.message || error?.data?.message || 'AI对话创建失败'
        this.failCount += 1
        this.failedToRetry += 1
        this.progressSubText = `第 ${index + 1} 条失败：${message}`
        if (isInsufficientPointsMessage(message)) {
          if (!this.shouldStop) {
            this.shouldStop = true
            this.failProgress('积分不足，已停止后续生成', true)
          }
          return 'stop'
        }
        return 'fail'
      }
    },

    async runBatchFlow(totalCount) {
      this.generatingTotal = totalCount
      this.progressSubText = `已启动 ${this.concurrency} 路并行生成…`

      await runWithConcurrency(
        totalCount,
        this.concurrency,
        () => this.shouldStop,
        (index) => this.generateOneConversation(index, totalCount),
        (completed, total) => {
          this.completedCount = completed
          this.currentIndex = completed
          this.progressPercent = Math.round((completed / total) * 100)
          if (!this.shouldStop) {
            this.progressSubText = `${this.concurrency} 路并行生成中，已完成 ${completed}/${total}`
          }
        }
      )

      if (!this.shouldStop || this.successCount > 0) {
        this.finishProgress()
      }

      await this.delay(this.progressSucceeded ? 800 : 0)

      if (this.progressSucceeded) {
        this.closeProgress()
        this.$refs.popup?.close()
        this.$emit('success', {
          successCount: this.successCount,
          failCount: this.failCount
        })
        this.resetForm()
        return
      }

      if (this.progressFailed && !this.isInsufficientPointsError) {
        this.submitting = false
        return
      }

      this.submitting = false
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

.scene-chips,
.style-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.scene-chip,
.style-preset {
  padding: 12rpx 24rpx;
  font-size: 24rpx;
  color: #666;
  background: #f5f7fa;
  border: 1rpx solid #e6e6e6;
  border-radius: 32rpx;
}

.style-preset {
  padding: 10rpx 20rpx;
  font-size: 22rpx;
  border-radius: 24rpx;
}

.scene-chip.active,
.style-preset.active {
  color: #007aff;
  border-color: #007aff;
  background: rgba(0, 122, 255, 0.08);
}

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

.source-loading,
.source-empty {
  padding: 32rpx;
  text-align: center;
  font-size: 26rpx;
  color: #999;
}

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

.btn-submit {
  background: linear-gradient(135deg, #007aff 0%, #5856d6 100%);
  color: #fff;
}

.btn-submit[disabled] {
  opacity: 0.6;
}

.btn-full {
  width: 100%;
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
  text-align: center;
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

.progress-percent,
.progress-count {
  display: block;
  text-align: center;
  font-size: 24rpx;
  color: #666;
  margin: 12rpx 0 0;
}

.progress-sub-wrap {
  margin-top: 24rpx;
  padding: 18rpx 24rpx;
  background: linear-gradient(135deg, rgba(0, 122, 255, 0.1) 0%, rgba(0, 122, 255, 0.04) 100%);
  border-radius: 14rpx;
  border: 1rpx solid rgba(0, 122, 255, 0.18);
}

.progress-sub-wrap.is-error {
  background: rgba(245, 108, 108, 0.08);
  border-color: rgba(245, 108, 108, 0.22);
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
}

.progress-sub-text {
  font-size: 26rpx;
  font-weight: 500;
  color: #007aff;
  line-height: 1.5;
}

.progress-sub-wrap.is-error .progress-sub-text {
  color: #f56c6c;
  font-weight: 400;
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
