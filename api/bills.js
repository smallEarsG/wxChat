import { requestJSON } from '@/utils/request.js'

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
