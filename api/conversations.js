import { request,Filerequest,uploadImageByPath ,request_m} from '@/utils/request.js'

export const createConversation = (data) => 
  request_m({ url: '/conversations', method: 'POST', data })

/**
 * 根据用户ID获取对话列表
 * @param {string} userId - 用户ID
 * @returns {Promise}
 */
export const getConversationsByUser = (userId,type) => 
  request({ url: `/conversations/user/${userId}?type=${type}`, method: 'GET' })

/**
 * 根据名称模糊搜索对话
 * @param {string} name - 对话名称关键词
 * @returns {Promise}
 */
export const searchConversationsByName = ( userId,name,type) => 
  request({ url: `/conversations/search?name=${name}&userId=${userId}&type=${type}`, method: 'GET'})

/**
 * 根据ID删除对话
 * @param {number} conversationId - 对话ID
 * @returns {Promise}
 */
export const deleteConversation = (conversationId) => 
  request({ url: `/conversations/${conversationId}`, method: 'DELETE' })

/**
 * 根据ID更新对话
 * @param {number} conversationId - 对话ID
 * @param {Object} data - 更新数据
 * @returns {Promise}
 */
export const updateConversation = (conversationId, data) => 
  request_m({ url: `/conversations/${conversationId}`, method: 'PUT', data })
  
  /**
   * 上传单个图片
   * @param {File} file - 图片文件
   * @returns {Promise}
   */
  export const uploadImage = (file) => {

    return uploadImageByPath(file)
  };