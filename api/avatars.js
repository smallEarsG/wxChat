import { requestJSON, Filerequest, request } from '@/utils/request.js'

/**
 * 创建头像记录
 * @param {Object} data - 头像数据
 * @param {Long} data.userId - 用户ID
 * @param {String} data.module - 归属模块（如：user / group / chat / shop / wechat）
 * @param {String} data.avatarUrl - 头像URL
 * @param {String} data.name - 名称（可选）
 * @returns {Promise}
 */
export const createAvatar = (data) => 
  requestJSON({ url: '/avatars', method: 'POST', data })

/**
 * 获取头像列表
 * @param {Long} userId - 用户ID
 * @param {String} module - 归属模块（如：user / group / chat / shop / wechat）
 * @returns {Promise} 返回头像列表数组
 */
export const getAvatarList = (userId, module) => 
  request({ url: `/avatars?userId=${userId}&module=${module}`, method: 'GET' })

/**
 * 删除头像记录
 * @param {Long} id - 头像记录ID
 * @returns {Promise}
 */
export const deleteAvatar = (id) => 
  request({ url: `/avatars/${id}`, method: 'DELETE' })

/**
 * 上传头像图片并创建记录
 * @param {String} filePath - 图片文件路径
 * @param {Long} userId - 用户ID
 * @param {String} module - 归属模块（如：user / group / chat / shop）
 * @param {String} name - 名称（可选）
 * @returns {Promise} 返回包含 avatarUrl 的对象
 */
export const uploadAvatar = async (filePath, userId, module = 'user', name = '') => {
  try {
    // 先上传图片文件，获取文件URL
    // 这里假设使用现有的文件上传接口，如果后端有专门的头像上传接口，可以修改
    const uploadResult = await Filerequest(filePath, userId);
    
    // 获取上传后的文件URL
    // 根据实际返回格式调整，可能是 uploadResult.data, uploadResult.url, 或 uploadResult 本身
    let avatarUrl = '';
    if (typeof uploadResult === 'string') {
      avatarUrl = uploadResult;
    } else if (uploadResult.data) {
      avatarUrl = uploadResult.data;
    } else if (uploadResult.url) {
      avatarUrl = uploadResult.url;
    } else if (uploadResult.fileUrl) {
      avatarUrl = uploadResult.fileUrl;
    } else {
      // 如果返回的是完整URL对象，尝试直接使用
      avatarUrl = uploadResult;
    }
    
    // 如果 avatarUrl 仍然是对象，转换为字符串
    if (typeof avatarUrl === 'object') {
      avatarUrl = JSON.stringify(avatarUrl);
    }
    
    // 创建头像记录
    const avatarData = {
      userId: userId,
      module: module,
      avatarUrl: avatarUrl,
      name: name || ''
    };
    
    const result = await createAvatar(avatarData);
    
    // 返回头像URL（优先使用接口返回的avatarUrl）
    return {
      avatarUrl: result.avatarUrl || avatarUrl,
      id: result.id,
      data: result
    };
  } catch (error) {
    console.error('上传头像失败:', error);
    throw error;
  }
}
