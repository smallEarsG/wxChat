// api/groups.js
import { request, requestJSON, Filerequest, uploadImageByPath } from '@/utils/request.js'

// ========== 常量定义 ==========
export const GROUP_TYPE = {
  NORMAL: 1,           // 普通群
  ENTERPRISE: 2,       // 企业群
  ENTERPRISE_EXTERNAL: 3  // 企业对外群
}

export const MESSAGE_TYPE = {
  CHAT: 'chat',           // 文本消息
  PHOTO: 'photo',         // 图片
  YUYIN: 'yuyin',         // 语音
  VIDEO: 'video',         // 视频
  CARD: 'crad',           // 名片
  TRANSFER: 'transfer',    // 转账
  ORDER: 'order',         // 订单
  REDBAG: 'redBag',       // 红包
  WXTF: 'wxtf',          // 微信转账
  TIPS: 'tips'            // 提示消息
}

// ========== 群聊接口 ==========

/**
 * 创建群聊
 * @param {Object} data - 群聊信息
 * @returns {Promise}
 */
export const createGroup = (data) => 
  requestJSON({ url: '/groups', method: 'POST', data })

/**
 * 获取群聊详情
 * @param {number} groupId - 群聊ID
 * @returns {Promise}
 */
export const getGroupById = (groupId) => 
  request({ url: `/groups/${groupId}`, method: 'GET' })

/**
 * 更新群聊信息
 * @param {number} groupId - 群聊ID
 * @param {Object} data - 更新数据
 * @returns {Promise}
 */
export const updateGroup = (groupId, data) => 
  requestJSON({ url: `/groups/${groupId}`, method: 'PUT', data })

/**
 * 解散群聊
 * @param {number} groupId - 群聊ID
 * @returns {Promise}
 */
export const deleteGroup = (groupId) => 
  request({ url: `/groups/${groupId}`, method: 'DELETE' })

/**
 * 获取用户的群聊列表
 * @param {number} userId - 用户ID
 * @param {number} type - 群类型（可选，1-普通群，2-企业群，3-企业对外群）
 * @param {number} page - 页码
 * @param {number} pageSize - 每页数量
 * @returns {Promise}
 */
export const getGroupsByUser = (userId, type = null, page = 1, pageSize = 20) => {
  let url = `/groups/user/${userId}?page=${page}&pageSize=${pageSize}`
  if (type !== null) {
    url += `&type=${type}`
  }
  return request({ url, method: 'GET' })
}

/**
 * 搜索群聊
 * @param {string} keyword - 搜索关键词
 * @param {number} type - 群类型
 * @returns {Promise}
 */
export const searchGroups = (keyword = '', type = null) => {
  let url = `/groups/search?keyword=${keyword}`
  if (type !== null) {
    url += `&type=${type}`
  }
  return request({ url, method: 'GET' })
}

// ========== 群成员接口 ==========

/**
 * 获取群成员列表
 * @param {number} groupId - 群聊ID
 * @returns {Promise}
 */
export const getGroupMembers = (groupId) => 
  request({ url: `/groups/${groupId}/members`, method: 'GET' })

/**
 * 添加群成员（添加虚拟角色）
 * @param {number} groupId - 群聊ID
 * @param {Object} data - 成员信息
 * @returns {Promise}
 */
export const addGroupMember = (groupId, data) => 
  requestJSON({ url: `/groups/${groupId}/members`, method: 'POST', data })

/**
 * 更新群成员信息
 * @param {number} groupId - 群聊ID
 * @param {number|string} memberId - 成员ID（用户ID或角色ID）
 * @param {Object} data - 更新数据
 * @returns {Promise}
 */
export const updateGroupMember = (groupId, memberId, data) => 
  requestJSON({ url: `/groups/${groupId}/members/${memberId}`, method: 'PUT', data })

/**
 * 移除群成员
 * @param {number} groupId - 群聊ID
 * @param {number|string} memberId - 成员ID
 * @returns {Promise}
 */
export const removeGroupMember = (groupId, memberId) => 
  request({ url: `/groups/${groupId}/members/${memberId}`, method: 'DELETE' })

/**
 * 设置成员角色（管理员/普通成员）
 * @param {number} groupId - 群聊ID
 * @param {number|string} memberId - 成员ID
 * @param {Object} data - { member_role: 0|1|2 }
 * @returns {Promise}
 */
export const setMemberRole = (groupId, memberId, data) => 
  requestJSON({ url: `/groups/${groupId}/members/${memberId}/role`, method: 'PUT', data })

/**
 * 退出群聊
 * @param {number} groupId - 群聊ID
 * @param {Object} data - { user_id 或 role_id }
 * @returns {Promise}
 */
export const leaveGroup = (groupId, data) => 
  requestJSON({ url: `/groups/${groupId}/members/leave`, method: 'POST', data })

// ========== 群消息接口 ==========

/**
 * 获取群消息列表
 * @param {number} groupId - 群聊ID
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @param {string} params.beforeTime - 获取此时间之前的消息
 * @param {string} params.afterTime - 获取此时间之后的消息
 * @param {string} params.contentType - 消息类型筛选
 * @returns {Promise}
 */
export const getGroupMessages = (groupId, params = {}) => {
  const { page = 1, pageSize = 50, beforeTime = null, afterTime = null, contentType = null } = params
  let url = `/groups/${groupId}/messages?page=${page}&pageSize=${pageSize}`
  if (beforeTime) url += `&beforeTime=${beforeTime}`
  if (afterTime) url += `&afterTime=${afterTime}`
  if (contentType) url += `&contentType=${contentType}`
  return request({ url, method: 'GET' })
}

/**
 * 发送群消息
 * @param {number} groupId - 群聊ID
 * @param {Object} data - 消息数据
 * @returns {Promise}
 */
export const sendGroupMessage = (groupId, data) => 
  requestJSON({ url: `/groups/${groupId}/messages`, method: 'POST', data })

/**
 * 在指定消息之后插入一条消息
 * @param {number} groupId - 群聊ID
 * @param {number} insertAfterId - 要插入在其后的消息ID
 * @param {Object} data - 消息数据 { content, contentType, replyToId }
 * @returns {Promise}
 */
export const insertGroupMessage = (groupId, insertAfterId, data) => 
  requestJSON({ url: `/groups/${groupId}/messages/insert?insertAfterId=${insertAfterId}`, method: 'POST', data })

/**
 * 更新群消息
 * @param {number} groupId - 群聊ID
 * @param {number} messageId - 消息ID
 * @param {Object} data - 更新数据 { content, contentType, replyToId }
 * @returns {Promise}
 */
export const updateGroupMessage = (groupId, messageId, data) => 
  requestJSON({ url: `/groups/${groupId}/messages/${messageId}`, method: 'PUT', data })

/**
 * 删除群消息
 * @param {number} groupId - 群聊ID
 * @param {number} messageId - 消息ID
 * @returns {Promise}
 */
export const deleteGroupMessage = (groupId, messageId) => 
  request({ url: `/groups/${groupId}/messages/${messageId}`, method: 'DELETE' })

/**
 * 上传群消息附件（图片等）
 * @param {string} filePath - 文件路径
 * @param {number} groupId - 群聊ID
 * @returns {Promise}
 */
export const uploadGroupFile = (filePath, groupId) => {
  return Filerequest(filePath, `group_${groupId}`)
}