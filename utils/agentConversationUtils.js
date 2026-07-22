export const AI_POINTS_COST = 20

export const SCENE_OPTIONS = [
  { code: '', label: '自动识别' },
  { code: 'INQUIRY', label: '询价' },
  { code: 'QUOTATION', label: '报价' },
  { code: 'DEAL_CLOSING', label: '成交' },
  { code: 'SERVICE_FEEDBACK', label: '客服反馈' },
  { code: 'CUSTOM', label: '自定义' }
]

export const STYLE_PRESETS = ['自然友好', '专业正式', '热情活泼', '简洁直接']

export const PROGRESS_STEPS = [
  { key: 'prepare', label: '准备中' },
  { key: 'generate', label: 'AI 生成' },
  { key: 'done', label: '完成' }
]

export const GENERATE_SUB_TEXTS = [
  '正在生成对话内容…',
  '正在校验消息格式…',
  '正在优化对话结构…'
]

export const BATCH_CONCURRENCY_OPTIONS = [
  { value: 1, label: '串行（慢）' },
  { value: 3, label: '3 路并行' },
  { value: 5, label: '5 路并行' }
]

export const DEFAULT_BATCH_CONCURRENCY = 3
export const MAX_BATCH_CONCURRENCY = 5

/**
 * 以有限并发执行批量任务（前端并行请求，非真多线程）
 */
export async function runWithConcurrency(totalCount, concurrency, shouldStop, taskFn, onProgress) {
  let nextIndex = 0
  let completed = 0
  const limit = Math.max(1, Math.min(concurrency, totalCount))

  async function worker() {
    while (true) {
      if (shouldStop()) break
      const index = nextIndex
      nextIndex += 1
      if (index >= totalCount) break

      const result = await taskFn(index)
      completed += 1
      onProgress(completed, totalCount)
      if (result === 'stop') break
    }
  }

  await Promise.all(Array.from({ length: limit }, () => worker()))
  return completed
}

export function hasHttp(str) {
  return /^https?:\/\/.+/i.test(str || '')
}

export function generateRandomName() {
  if (Math.random() > 0.5) {
    const surnames = ['张', '李', '王', '刘', '陈', '杨', '赵', '黄', '周', '吴']
    const names = ['伟', '芳', '娜', '敏', '静', '丽', '强', '磊', '军', '洋']
    const randomSurname = surnames[Math.floor(Math.random() * surnames.length)]
    const randomName = names[Math.floor(Math.random() * names.length)]
    return randomSurname + randomName
  }
  const nicknames = ['风轻云淡', '岁月如歌', '浅笑安然', '追光者', '小确幸', 'Rainbow', 'Sunny']
  return nicknames[Math.floor(Math.random() * nicknames.length)]
}

export function getRandomAvatar() {
  const avatarServices = [
    () => 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + Math.random().toString(36).substring(7),
    () => 'https://ui-avatars.com/api/?name=' + Math.random().toString(36).substring(7) + '&background=random&color=fff',
    () => 'https://randomuser.me/api/portraits/men/' + Math.floor(Math.random() * 99) + '.jpg',
    () => 'https://randomuser.me/api/portraits/women/' + Math.floor(Math.random() * 99) + '.jpg'
  ]
  return avatarServices[Math.floor(Math.random() * avatarServices.length)]()
}

export function getUserPointsValue(points) {
  if (points === null || points === undefined || points === '') {
    return 0
  }
  const value = Number(points)
  return Number.isNaN(value) ? 0 : value
}

export function isInsufficientPointsMessage(message, code) {
  if (code === 403) {
    return true
  }
  return typeof message === 'string' && message.includes('积分不足')
}

export function buildAgentCreatePayload(formData, userId, targetAvatarUrl) {
  const payload = {
    ownerUserId: userId,
    targetUserId: formData.sourceConversationId,
    targetUserName: (formData.name || '').trim(),
    targetAvatarUrl: targetAvatarUrl || '',
    style: (formData.style || '自然友好').trim(),
    messageCount: Number(formData.messageCount) || 35
  }
  if (formData.sceneType) {
    payload.sceneType = formData.sceneType
  }
  const customScene = (formData.customScene || '').trim()
  const scene = (formData.scene || '').trim()
  if (customScene) payload.customScene = customScene
  if (scene) payload.scene = scene
  return payload
}

export function validateAgentForm(formData, options = {}) {
  const { requireCustomerInfo = true } = options
  if (!formData.sourceConversationId) {
    return { error: '请选择要模仿的对话', sourceFieldError: '请选择要模仿的对话' }
  }
  if (requireCustomerInfo) {
    if (!formData.name || !formData.name.trim()) {
      return { error: '请输入姓名', sourceFieldError: '' }
    }
    if (!formData.avatarUrl) {
      return { error: '请选择或随机生成头像', sourceFieldError: '' }
    }
  }
  let count = Number(formData.messageCount)
  if (Number.isNaN(count) || count < 1) {
    count = 35
  }
  if (count > 100) {
    return { error: '生成消息条数不能超过100', sourceFieldError: '' }
  }
  if (formData.sceneType === 'CUSTOM') {
    const customScene = (formData.customScene || '').trim()
    const scene = (formData.scene || '').trim()
    if (!customScene && !scene) {
      return { error: '自定义场景需填写场景描述或场景补充', sourceFieldError: '' }
    }
  }
  return { error: '', sourceFieldError: '' }
}

export function createDefaultAgentFormData() {
  return {
    avatarUrl: '',
    name: '',
    sourceConversationId: '',
    sceneType: '',
    customScene: '',
    scene: '',
    style: '自然友好',
    messageCount: 35
  }
}
