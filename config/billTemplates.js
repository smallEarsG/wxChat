import { BILL_TYPE } from './billType.js'

export const TEMPLATE_CATEGORIES = Object.freeze({
	transfer: { key: 'transfer', label: '转账类' },
	qr: { key: 'qr', label: '扫码类' },
	merchant: { key: 'merchant', label: '商户类' },
	barcode: { key: 'barcode', label: '条形码/小程序' },
	custom: { key: 'custom', label: '自定义' }
})

export const BARCODE_FORMATS = Object.freeze({
	auto: { key: 'auto', label: '自动匹配', templateKey: 'barcode32' },
	barcode16: { key: 'barcode16', label: '16 位', templateKey: 'barcode16' },
	barcode32: { key: 'barcode32', label: '32 位', templateKey: 'barcode32' },
	barcode34: { key: 'barcode34', label: '34 位', templateKey: 'barcode34' }
})

export const BILL_TEMPLATE_MAP = Object.freeze({
	transfer: {
		key: 'transfer',
		route: '/pages/transfer/transfer',
		billType: BILL_TYPE.TRANSFER,
		title: '转账付款',
		description: '适合转账详情演示',
		category: 'transfer',
		previewComponent: 'TransferBill',
		legacyIndex: 0
	},
	qrReceive: {
		key: 'qrReceive',
		route: '/pages/codePayChild/codePayChild',
		billType: BILL_TYPE.QR_RECEIVE,
		title: '扫码收款',
		description: '适合扫码收款详情',
		category: 'qr',
		previewComponent: 'CodePayChildBill',
		legacyIndex: 1
	},
	qrPay: {
		key: 'qrPay',
		route: '/pages/codePayChild2/codePayChild2',
		billType: BILL_TYPE.QR_PAY,
		title: '扫码付款',
		description: '适合扫码付款详情',
		category: 'qr',
		previewComponent: 'CodePayChild2Bill',
		legacyIndex: 6
	},
	thirdParty: {
		key: 'thirdParty',
		route: '/pages/ThirdpartyPayment/ThirdpartyPayment',
		billType: BILL_TYPE.THIRD_PARTY,
		title: '商户付款',
		description: '适合普通商户付款详情',
		category: 'merchant',
		previewComponent: 'ThirdpartyPaymentBill',
		legacyIndex: 2
	},
	thirdPartyTel: {
		key: 'thirdPartyTel',
		route: '/pages/ThirdpartyPaymentTel/ThirdpartyPaymentTel',
		billType: BILL_TYPE.THIRD_PARTY,
		title: '商户付款（带电话）',
		description: '适合展示商户电话信息',
		category: 'merchant',
		previewComponent: 'ThirdpartyPaymentTelBill',
		legacyIndex: 10
	},
	thirdPartyMerchant: {
		key: 'thirdPartyMerchant',
		route: '/pages/ThirdpartyMerchant/ThirdpartyMerchant',
		billType: BILL_TYPE.THIRD_PARTY_MERCHANT,
		title: '商家详情付款',
		description: '适合商家详情页演示',
		category: 'merchant',
		previewComponent: 'ThirdpartyMerchantBill',
		legacyIndex: 9
	},
	barcodeBill: {
		key: 'barcodeBill',
		route: '/pages/barcodeThirdpartyPayment32/barcodeThirdpartyPayment32',
		billType: BILL_TYPE.BARCODE_32,
		title: '条形码账单',
		description: '支持 16/32/34 位条形码格式',
		category: 'barcode',
		previewComponent: 'BarcodeThirdpartyPayment32Bill',
		hasBarcodeFormat: true,
		legacyIndex: 5
	},
	barcode16: {
		key: 'barcode16',
		route: '/pages/barcodeThirdpartyPayment/barcodeThirdpartyPayment',
		billType: BILL_TYPE.BARCODE_16,
		title: '条形码账单',
		description: '16 位条形码格式',
		category: 'barcode',
		previewComponent: 'BarcodeThirdpartyPaymentBill',
		hiddenInGallery: true,
		legacyIndex: 4
	},
	barcode32: {
		key: 'barcode32',
		route: '/pages/barcodeThirdpartyPayment32/barcodeThirdpartyPayment32',
		billType: BILL_TYPE.BARCODE_32,
		title: '条形码账单',
		description: '32 位条形码格式',
		category: 'barcode',
		previewComponent: 'BarcodeThirdpartyPayment32Bill',
		hiddenInGallery: true,
		legacyIndex: 5
	},
	barcode34: {
		key: 'barcode34',
		route: '/pages/barcodeThirdpartyPayment34/barcodeThirdpartyPayment34',
		billType: BILL_TYPE.BARCODE_34,
		title: '条形码账单',
		description: '34 位条形码格式',
		category: 'barcode',
		previewComponent: 'BarcodeThirdpartyPayment34Bill',
		hiddenInGallery: true,
		legacyIndex: 7
	},
	miniProgram: {
		key: 'miniProgram',
		route: '/pages/miniThirdpartyPayment/miniThirdpartyPayment',
		billType: BILL_TYPE.MINI_PROGRAM,
		title: '小程序付款',
		description: '适合小程序付款详情',
		category: 'barcode',
		previewComponent: 'MiniThirdpartyPaymentBill',
		legacyIndex: 3
	},
	miniProgramBarcode: {
		key: 'miniProgramBarcode',
		route: '/pages/miniThirdpartyPaymentCode/miniThirdpartyPaymentCode',
		billType: BILL_TYPE.MINI_PROGRAM_BARCODE,
		title: '小程序条形码付款',
		description: '小程序与条形码组合账单',
		category: 'barcode',
		previewComponent: 'MiniThirdpartyPaymentCodeBill',
		legacyIndex: 8
	}
})

export const GALLERY_TEMPLATES = Object.values(BILL_TEMPLATE_MAP).filter(item => !item.hiddenInGallery)

export const BILL_TYPE_ROUTE_MAP = Object.freeze(
	Object.values(BILL_TEMPLATE_MAP).reduce((map, template) => {
		if (!map[template.billType] || template.key === 'thirdParty') {
			map[template.billType] = template.route
		}
		return map
	}, {
		[BILL_TYPE.THIRD_PARTY_MERCHANT]: '/pages/ThirdpartyMerchant/ThirdpartyMerchant',
		[BILL_TYPE.MINI_PROGRAM_BARCODE]: '/pages/miniThirdpartyPaymentCode/miniThirdpartyPaymentCode',
		[BILL_TYPE.CUSTOM]: '/pages/custom-template-page/custom-template-page'
	})
)

export function getTemplateByKey(templateKey) {
	return BILL_TEMPLATE_MAP[templateKey] || null
}

export function getTemplateByLegacyIndex(index) {
	return Object.values(BILL_TEMPLATE_MAP).find(item => item.legacyIndex === index) || null
}

export function getTemplateByBillType(billType) {
	const typeNum = typeof billType === 'number' ? billType : parseInt(String(billType || ''), 10)
	return Object.values(BILL_TEMPLATE_MAP).find(item => item.billType === typeNum) || null
}

export function resolveBarcodeTemplateKey(formatKey = 'auto') {
	const format = BARCODE_FORMATS[formatKey] || BARCODE_FORMATS.auto
	return format.templateKey
}
