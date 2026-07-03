import { request, requestJSON } from '@/utils/request.js'

export const createConversationByAgent = (data) =>
  requestJSON({ url: '/conversations/ai/create', method: 'POST', data })

export const getAgentCustomerProfile = ({ ownerUserId, targetUserId, targetUserName }) => {
  const query = [
    `ownerUserId=${encodeURIComponent(ownerUserId || '')}`,
    `targetUserId=${encodeURIComponent(targetUserId || '')}`
  ]
  if (targetUserName) {
    query.push(`targetUserName=${encodeURIComponent(targetUserName)}`)
  }
  return request({ url: `/conversations/ai/profile?${query.join('&')}`, method: 'GET' })
}
