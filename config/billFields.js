export const RECOGNITION_FIELDS = [
	{ key: 'name', label: '机构名称', type: 'text', group: 'basic' },
	{ key: 'money', label: '金额', type: 'money', group: 'basic', required: true },
	{ key: 'time', label: '支付时间', type: 'text', group: 'time' },
	{ key: 'otherTime', label: '收款时间', type: 'text', group: 'time' },
	{ key: 'payment', label: '支付方式', type: 'text', group: 'basic' },
	{ key: 'orderNumber', label: '交易单号', type: 'text', group: 'order' },
	{ key: 'shopNumber', label: '商户单号', type: 'text', group: 'order' },
	{ key: 'currentState', label: '当前状态', type: 'text', group: 'basic' },
	{ key: 'desc', label: '备注', type: 'text', group: 'remark' },
	{ key: 'payDesc', label: '付款说明', type: 'text', group: 'remark' }
]

export function getMissingFields(info = {}) {
	return RECOGNITION_FIELDS
		.filter(field => field.required || ['name', 'money', 'time', 'orderNumber', 'shopNumber', 'payment', 'otherTime', 'desc'].includes(field.key))
		.filter(field => {
			const value = info[field.key]
			return value === undefined || value === null || String(value).trim() === ''
		})
		.map(field => field.label)
}

export function countRecognizedFields(info = {}) {
	return RECOGNITION_FIELDS.filter(field => {
		const value = info[field.key]
		return value !== undefined && value !== null && String(value).trim() !== ''
	}).length
}
