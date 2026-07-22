<template>
  <view>
    <uni-popup ref="popup" type="center" :is-mask-click="!submitting">
      <view class="popup-content">
        <view class="form-header">
          <view class="header-text">
            <view class="title-row">
              <text class="title-icon">✍️</text>
              <text class="title">AI 续写</text>
            </view>
            <text class="subtitle">基于当前对话上下文，智能续写后续聊天</text>
          </view>
          <view class="close-btn" @click="closePopup" @tap="closePopup">
            <uni-icons type="close" size="22" color="#666" />
          </view>
        </view>

        <scroll-view class="form-body" scroll-y>
          <view class="form-section">
            <text class="section-title">故事走向<text class="required">*</text></text>
            <view class="input-wrapper">
              <textarea
                v-model="formData.storyDirection"
                class="form-textarea form-textarea-no-icon"
                placeholder="描述后续剧情走向，如：客户继续追问价格，我方给出方案…"
                placeholder-class="placeholder"
                :maxlength="300"
              />
            </view>
          </view>

          <view class="form-section">
            <text class="section-title">走向预设</text>
            <view class="scene-chips">
              <view
                v-for="preset in directionPresets"
                :key="preset"
                class="scene-chip"
                @click="applyDirectionPreset(preset)"
                @tap="applyDirectionPreset(preset)"
              >
                {{ preset }}
              </view>
            </view>
          </view>

          <view class="form-section">
            <text class="section-title">对话风格</text>
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

          <view class="form-section">
            <text class="section-title">续写设置</text>
            <view class="form-item">
              <text class="form-label">续写消息条数</text>
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
                  :class="{ disabled: formData.messageCount >= 50 }"
                  @click="adjustMessageCount(1)"
                  @tap="adjustMessageCount(1)"
                >
                  <text>+</text>
                </view>
              </view>
              <text class="stepper-hint">默认 15 条，范围 1–50</text>
            </view>
          </view>
        </scroll-view>

        <view class="form-footer">
          <view class="points-badge">
            <text class="points-icon">💎</text>
            <text class="points-text">本次消耗 {{ pointsCost }} 积分</text>
          </view>
          <view class="footer-actions">
            <button class="btn-cancel" :disabled="submitting" @click="closePopup">取消</button>
            <button class="btn-submit" :disabled="submitting" :loading="submitting" @click="submit">
              {{ submitting ? '续写中…' : '✍️ AI 续写' }}
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
          <text class="success-text">续写成功</text>
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
import { continueConversationByAgent } from '@/api/agentConversations.js'
import { getUserInfo } from '@/api/index.js'

const STYLE_PRESETS = ['自然友好', '专业正式', '热情活泼', '简洁直接']
const DIRECTION_PRESETS = ['继续跟进', '客户询价', '推进成交', '售后反馈', '转介绍', '缓和收尾']
const PROGRESS_STEPS = [
  { key: 'prepare', label: '准备中' },
  { key: 'generate', label: 'AI 续写' },
  { key: 'done', label: '完成' }
]
const GENERATE_SUB_TEXTS = [
  '正在分析对话上下文…',
  '正在续写后续消息…',
  '正在校验消息格式…'
]

function calculateAiContinuePointsCost(messageCount) {
  const count = Number(messageCount) || 15
  return Math.max(5, Math.ceil(count * 20 / 35))
}

export default {
  name: 'AgentContinuePopup',
  data() {
    return {
      stylePresets: STYLE_PRESETS,
      directionPresets: DIRECTION_PRESETS,
      progressSteps: PROGRESS_STEPS,
      userId: '',
      conversationId: '',
      customerName: '',
      formData: {
        storyDirection: '',
        style: '自然友好',
        messageCount: 15
      },
      submitting: false,
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
    pointsCost() {
      return calculateAiContinuePointsCost(this.formData.messageCount)
    },
    progressTitle() {
      if (this.progressSucceeded) return '续写完成'
      if (this.progressFailed) return '续写失败'
      return 'AI 正在续写对话'
    }
  },
  beforeDestroy() {
    this.clearSubTextTimer()
  },
  methods: {
    open({ guestInfo = {}, massageList = [] } = {}) {
      this.userId = uni.getStorageSync('userId')
      this.conversationId = guestInfo.conversationId || ''
      this.customerName = guestInfo.name || ''
      this.messageListLength = Array.isArray(massageList) ? massageList.length : 0
      this.resetForm()
      this.$refs.popup?.open('center')
    },

    resetForm() {
      this.formData = {
        storyDirection: '',
        style: '自然友好',
        messageCount: 15
      }
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

    applyDirectionPreset(preset) {
      const current = (this.formData.storyDirection || '').trim()
      if (!current) {
        this.formData.storyDirection = preset
        return
      }
      if (current.includes(preset)) {
        return
      }
      this.formData.storyDirection = `${current}，${preset}`
    },

    applyStylePreset(preset) {
      this.formData.style = preset
    },

    adjustMessageCount(delta) {
      const next = Number(this.formData.messageCount) + delta
      if (next < 1 || next > 50) return
      this.formData.messageCount = next
    },

    validateForm() {
      const storyDirection = (this.formData.storyDirection || '').trim()
      if (!storyDirection) {
        return '请填写故事走向'
      }
      let count = Number(this.formData.messageCount)
      if (Number.isNaN(count) || count < 1) {
        count = 15
      }
      if (count > 50) {
        return '续写消息条数不能超过50'
      }
      this.formData.messageCount = count
      if (!this.conversationId) {
        return '当前会话信息缺失'
      }
      return ''
    },

    buildRequestPayload() {
      return {
        ownerUserId: this.userId,
        conversationId: this.conversationId,
        storyDirection: this.formData.storyDirection.trim(),
        style: (this.formData.style || '自然友好').trim(),
        messageCount: Number(this.formData.messageCount) || 15
      }
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
      if (points < this.pointsCost) {
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
      if (!this.lastSubmitPayload) {
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
        this.updateProgress(0, '正在校验参数…', 10)
        await this.delay(200)

        let payload = this.lastSubmitPayload
        if (!isRetry || !payload) {
          const validationError = this.validateForm()
          if (validationError) {
            throw new Error(validationError)
          }
          payload = this.buildRequestPayload()
          this.lastSubmitPayload = payload
        }

        this.updateProgress(1, '正在续写后续对话…', 50)
        this.startGenerateSubTextRotation()
        const continueRes = await continueConversationByAgent(payload)
        this.clearSubTextTimer()

        if (continueRes.code !== 200) {
          if (this.isInsufficientPointsMessage(continueRes.message, continueRes.code)) {
            this.failProgress('积分不足，请充值后重试', true)
            return
          }
          throw new Error(continueRes.message || 'AI续写失败')
        }

        const messages = continueRes.data?.messages
        if (!Array.isArray(messages) || messages.length === 0) {
          throw new Error('AI续写返回消息为空')
        }

        this.updateProgress(2, '续写完成', 100)
        this.progressSucceeded = true
        await this.delay(800)

        this.closeProgress()
        this.$refs.popup?.close()
        this.resetForm()
        this.$emit('success', messages)
      } catch (error) {
        this.clearSubTextTimer()
        const message = error?.message || error?.data?.message || 'AI续写失败'
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

.form-item {
  margin-bottom: 24rpx;
}

.form-label {
  font-size: 26rpx;
  margin-bottom: 12rpx;
  display: block;
  color: #666;
}

.input-wrapper {
  position: relative;
}

.form-input {
  border: 1rpx solid #e6e6e6;
  border-radius: 16rpx;
  padding: 24rpx;
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
  min-height: 160rpx;
  box-sizing: border-box;
  background: #fff;
}

.form-textarea-no-icon {
  padding-left: 24rpx;
}

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

.scene-chip:active {
  opacity: 0.8;
}

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
  font-size: 20rpx;
  color: #999;
  text-align: center;
}

.step-bar-item.done .step-bar-label,
.step-bar-item.active .step-bar-label {
  color: #007aff;
}

.step-bar-item.error .step-bar-label {
  color: #f56c6c;
}

.progress-sub-wrap {
  margin-top: 24rpx;
  min-height: 48rpx;
}

.progress-sub-wrap.is-error .progress-sub-text {
  color: #f56c6c;
}

.progress-sub-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
}

.progress-sub-dots {
  display: flex;
  gap: 6rpx;
}

.dot {
  width: 8rpx;
  height: 8rpx;
  border-radius: 50%;
  background: #007aff;
  animation: dot-bounce 1.2s infinite ease-in-out;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
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

.progress-sub-text {
  font-size: 24rpx;
  color: #666;
  text-align: center;
}

.progress-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 28rpx;
}

.progress-actions .btn-cancel,
.progress-actions .btn-submit {
  flex: 1;
}
</style>
