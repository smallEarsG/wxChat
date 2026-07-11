import { createBill } from '@/api/index.js'
import {
	BILL_TEMPLATE_MAP,
	getTemplateByKey,
	resolveBarcodeTemplateKey
} from '@/config/billTemplates.js'

const RECENT_TEMPLATES_KEY = 'recentBillTemplates'
const FAVORITE_TEMPLATES_KEY = 'favoriteBillTemplates'

export function getRecentTemplates() {
	try {
		return uni.getStorageSync(RECENT_TEMPLATES_KEY) || []
	} catch (e) {
		return []
	}
}

export function addRecentTemplate(templateKey) {
	if (!templateKey || !BILL_TEMPLATE_MAP[templateKey]) return
	const recent = getRecentTemplates().filter(key => key !== templateKey)
	recent.unshift(templateKey)
	uni.setStorageSync(RECENT_TEMPLATES_KEY, recent.slice(0, 6))
}

export function getFavoriteTemplates() {
	try {
		return uni.getStorageSync(FAVORITE_TEMPLATES_KEY) || []
	} catch (e) {
		return []
	}
}

export function toggleFavoriteTemplate(templateKey) {
	const favorites = getFavoriteTemplates()
	const index = favorites.indexOf(templateKey)
	if (index >= 0) {
		favorites.splice(index, 1)
	} else {
		favorites.unshift(templateKey)
	}
	uni.setStorageSync(FAVORITE_TEMPLATES_KEY, favorites)
	return favorites.includes(templateKey)
}

export async function navigateToBillTemplate(templateKey, options = {}) {
	const {
		extractedInfo = null,
		barcodeFormat = 'auto',
		createBillOnNavigate = false
	} = options

	let resolvedKey = templateKey
	if (templateKey === 'barcodeBill') {
		resolvedKey = resolveBarcodeTemplateKey(barcodeFormat)
	}

	const template = getTemplateByKey(resolvedKey)
	if (!template) {
		uni.showToast({ title: '模板不存在', icon: 'none' })
		return
	}

	addRecentTemplate(template.key)

	let url = template.route

	if (extractedInfo && createBillOnNavigate) {
		try {
			const userId = uni.getStorageSync('userId')
			if (!userId) throw new Error('用户未登录')

			const billData = {
				platform: 'wechat',
				billType: template.billType,
				billDetail: JSON.stringify(extractedInfo),
				createUserId: userId,
				remark: extractedInfo.desc || extractedInfo.name || '',
				status: 'draft'
			}
			const result = await createBill(billData)
			const billId = result?.data?.id || result?.id
			url = billId
				? `${template.route}?billId=${encodeURIComponent(String(billId))}`
				: `${template.route}?info=${encodeURIComponent(JSON.stringify(extractedInfo))}`
		} catch (e) {
			url = `${template.route}?info=${encodeURIComponent(JSON.stringify(extractedInfo))}`
		}
	} else if (extractedInfo) {
		url = `${template.route}?info=${encodeURIComponent(JSON.stringify(extractedInfo))}`
	}

	uni.navigateTo({ url })
}
