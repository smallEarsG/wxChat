// api/index.js
import { request, REMOTE_API } from '@/utils/request.js'

function getApiPort() {
  const m = REMOTE_API.match(/:(\d+)\//)
  return m ? Number(m[1]) : 8080
}

export const register = (data) => request({ url: '/user/register', method: 'POST', data })
export const login = (data) => request({ url: '/user/login', method: 'POST', data })
export const getUserInfo = (userId) => request({ url: '/user/'+userId, method: 'GET' })
export const updateUserInfo = (data) => request({ url: '/user/update', method: 'PUT' })
export const updateUseFeature = (userId) => request({ url: '/user/use-feature/'+userId, method: 'GET' })
export const withdraw = (data) => request({ url: '/user/withdraw', method: 'POST', data })
export const getWithdrawRecords = (userId) => request({ url: '/user/info/'+userId, method: 'GET' })
export const getPayMember = (userId, price, memberType) =>
  request({ url: `/user/pay/member?userId=${userId}&priceOne=${price}&memberType=${memberType}&port=${getApiPort()}`, method: 'GET' })
export const getPayPoints = (userId, packageCode) =>
  request({ url: `/user/pay/points?userId=${userId}&packageCode=${packageCode}&port=${getApiPort()}`, method: 'GET' })
export const deductPoints = (userId, points = 20, reason = 'ai_conversation') =>
  request({
    url: `/user/points/deduct?userId=${encodeURIComponent(userId)}&points=${points}&reason=${encodeURIComponent(reason)}`,
    method: 'POST'
  })
export const queryPayStatus = (orderNo) => request({ url: `/user/pay/status/${orderNo}`, method: 'GET' })
export const confirmPayOrder = (orderNo) => request({ url: `/user/pay/confirm/${orderNo}`, method: 'POST' })
export const logout = (userId) => request({ url: '/user/logout/'+userId, method: 'POST' })
export const activateMember = (userId,time) => request({ url: '/user/activate-member/'+userId+"/"+time, method: 'POST' })
export const selectInfoFormPhone = (phone) => request({ url: '/user/phone/'+phone, method: 'GET' })

// 导出头像相关接口
export * from './avatars.js'

// 导出账单相关接口
export * from './bills.js'







