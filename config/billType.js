export const BILL_TYPE = Object.freeze({
	TRANSFER: 1,
	QR_RECEIVE: 2,
	QR_PAY: 3,
	THIRD_PARTY: 4,
	MINI_PROGRAM: 5,
	BARCODE_16: 6,
	BARCODE_32: 7,
	BARCODE_34: 8,
	MINI_PROGRAM_BARCODE: 9,
	THIRD_PARTY_MERCHANT: 10,
	CUSTOM: 99
})

export const BILL_TYPE_LABELS = Object.freeze({
	[BILL_TYPE.TRANSFER]: '转账付款',
	[BILL_TYPE.QR_RECEIVE]: '扫码收款',
	[BILL_TYPE.QR_PAY]: '扫码付款',
	[BILL_TYPE.THIRD_PARTY]: '商户付款',
	[BILL_TYPE.MINI_PROGRAM]: '小程序付款',
	[BILL_TYPE.BARCODE_16]: '条形码付款',
	[BILL_TYPE.BARCODE_32]: '条形码付款',
	[BILL_TYPE.BARCODE_34]: '条形码付款',
	[BILL_TYPE.MINI_PROGRAM_BARCODE]: '小程序条形码付款',
	[BILL_TYPE.THIRD_PARTY_MERCHANT]: '商家详情付款',
	[BILL_TYPE.CUSTOM]: '自定义模板'
})

export function getBillTypeLabel(billType) {
	const typeNum = typeof billType === 'number' ? billType : parseInt(String(billType || ''), 10)
	return BILL_TYPE_LABELS[typeNum] || '付款模板'
}
