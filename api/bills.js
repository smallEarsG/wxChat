import { requestJSON, request } from '@/utils/request.js'

/**
 * 创建账单
 * @param {Object} data - 账单数据
 * @param {String} data.platform - 平台（wechat/alipay/jd/pdd等）
 * @param {String} data.billType - 账单类型（income/expense/refund/transfer）
 * @param {String} data.billDetail - 账单详情（JSON字符串）
 * @param {Long} data.createUserId - 创建人ID
 * @param {String} data.remark - 备注（可选）
 * @returns {Promise}
 */
export const createBill = (data) => 
  requestJSON({ url: '/erp-bill', method: 'POST', data })

/**
 * 更新账单
 * @param {Long} id - 账单ID
 * @param {Object} data - 账单数据（只更新提供的字段）
 * @param {String} data.billDetail - 账单详情（JSON字符串）
 * @param {String} data.remark - 备注（可选）
 * @param {String} data.platform - 平台（可选）
 * @param {String} data.billType - 账单类型（可选）
 * @returns {Promise}
 */
export const updateBill = (id, data) => 
  requestJSON({ url: `/erp-bill/${id}`, method: 'PUT', data })

/**
 * 查询账单列表
 * @param {Long} userId - 用户ID
 * @param {String} platform - 平台名称（如：wechat/alipay等）
 * @returns {Promise} 返回账单列表数组
 */
export const queryBillList = (userId, platform) => 
  request({ url: `/erp-bill/query?userId=${userId}&platform=${platform}`, method: 'GET' })

/**
 * 删除账单
 * @param {Long} id - 账单ID
 * @returns {Promise}
 */
export const deleteBill = (id) => 
  requestJSON({ url: `/erp-bill/${id}`, method: 'DELETE' })

/**
 * 根据ID查询账单
 * @param {Long} id - 账单ID
 * @returns {Promise}
 */
export const getBillById = (id) =>
  request({ url: `/erp-bill/${id}`, method: 'GET' })