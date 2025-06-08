// api/index.js
import { request } from '@/utils/request.js'

export const register = (data) => request({ url: '/user/register', method: 'POST', data })
export const login = (data) => request({ url: '/user/login', method: 'POST', data })
export const getUserInfo = (userId) => request({ url: '/user/'+userId, method: 'GET' })
export const updateUserInfo = (data) => request({ url: '/user/update', method: 'PUT' })
export const updateUseFeature = (userId) => request({ url: '/user/use-feature/'+userId, method: 'GET' })
export const withdraw = (data) => request({ url: '/user/withdraw', method: 'POST', data })
export const getWithdrawRecords = (userId) => request({ url: '/user/info/'+userId, method: 'GET' })
export const getPayMember = (userId,price) => request({ url: '/user/pay/member?userId='+userId+"&priceOne="+price, method: 'GET' })
export const logout = (userId) => request({ url: '/user/logout/'+userId, method: 'POST' })
export const activateMember = (userId,time) => request({ url: '/user/activate-member/'+userId+"/"+time, method: 'POST' })






