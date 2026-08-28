export const DEFAULT_FIELDS = [
	{ key: 'currentState', label: '当前状态', enabled: true },
	{ key: 'time', label: '支付时间', enabled: true },
	{ key: 'otherTime', label: '收款时间', enabled: false },
	{ key: 'shop', label: '商品', enabled: false },
	{ key: 'merchantName', label: '商户全称', enabled: false },
	{ key: 'institution', label: '收单机构', enabled: true },
	{ key: 'desc', label: '收单机构备注', enabled: false },
	{ key: 'payment', label: '支付方式', enabled: true },
	{ key: 'desc2', label: '支付方式备注', enabled: false },
	{ key: 'payDesc', label: '支付说明', enabled: false },
	{ key: 'orderNumber', label: '交易单号', enabled: true },
	{ key: 'shopNumber', label: '商户单号', enabled: true },
	{ key: 'BoNumber', label: '经营单号', enabled: false },
	{ key: 'miniName', label: '商家小程序', enabled: false },
	{ key: 'message', label: '留言/备注', enabled: false },
	{ key: 'remark', label: '备注信息', enabled: false },
	{ key: 'payeeRemark', label: '收款方备注', enabled: false },
	{ key: 'transferTime', label: '转账时间', enabled: false },
	{ key: 'transferOrderNumber', label: '转账单号', enabled: false }
]

export const DEFAULT_SERVICE_ITEMS = [
	{ _id: 's1', label: '对订单有疑惑', enabled: true, icon: '/static/wticon.png', iconClass: 'wticon' },
	{ _id: 's2', label: '发起群收款', enabled: true, icon: '/static/qiw/tpicon_1.png', iconClass: 'chatIcon' },
	{ _id: 's3', label: '收款方名片', enabled: true, icon: '/static/cordIcon.png', iconClass: 'cordIcon' },
	{ _id: 's4', label: '在此商户的交易', enabled: false, icon: '/static/qiw/tpIcon_2.png', iconClass: 'startIcon' },
	{ _id: 's5', label: '定位到聊天位置', enabled: false, icon: '/static/chatIcon.png', iconClass: 'chatIcon' },
	{ _id: 's6', label: '申请转账电子凭证', enabled: false, icon: '/static/startIcon.png', iconClass: 'startIcon' },
	{ _id: 's7', label: '查看往来转账', enabled: false, icon: '/static/transferIcon.png', iconClass: 'transferIcon' },
	{ _id: 's8', label: '商家电话', enabled: false, icon: '/static/wxchat/phone.png', iconClass: 'phoneIcon' },
	{ _id: 's9', label: '申请电子凭证', enabled: false, icon: '/static/startIcon.png', iconClass: 'startIcon' },
	{ _id: 's10', label: '向收款方留言', enabled: false, icon: '/static/msgicon1.png', iconClass: 'msgicon1' }
]

export const MODULE_PRESETS = {
	blank: { title: '新服务模块', items: [] },
	bill: {
		title: '账单服务',
		items: DEFAULT_SERVICE_ITEMS.filter(i => ['s1', 's2', 's3'].includes(i._id)).map(i => ({ ...i, enabled: true }))
	},
	merchant: {
		title: '商户服务',
		items: DEFAULT_SERVICE_ITEMS.filter(i => ['s4', 's5', 's6'].includes(i._id)).map(i => ({ ...i, enabled: true }))
	},
	contact: {
		title: '联系方式',
		items: DEFAULT_SERVICE_ITEMS.filter(i => ['s8', 's10'].includes(i._id)).map(i => ({ ...i, enabled: true }))
	},
	miniProgram: {
		title: '账单服务',
		items: DEFAULT_SERVICE_ITEMS.filter(i => ['s1', 's2', 's4'].includes(i._id)).map(i => ({ ...i, enabled: true }))
	}
}

const MINI_PROGRAM_ENABLED_FIELD_KEYS = [
	'currentState', 'time', 'shop', 'merchantName', 'institution',
	'payment', 'orderNumber', 'shopNumber', 'miniName'
]

export const MINI_PROGRAM_TEMPLATE_CONFIG = {
	orderInfoFields: DEFAULT_FIELDS.map(field => ({
		...field,
		enabled: MINI_PROGRAM_ENABLED_FIELD_KEYS.includes(field.key)
	})),
	serviceModules: [JSON.parse(JSON.stringify(MODULE_PRESETS.miniProgram))],
	showBarcode: false,
	showMiniProgram: true
}

export const DEFAULT_TEMPLATE_CONFIG = {
	orderInfoFields: JSON.parse(JSON.stringify(DEFAULT_FIELDS)),
	serviceModules: [{
		title: '账单服务',
		items: JSON.parse(JSON.stringify(DEFAULT_SERVICE_ITEMS.filter(i => i.enabled)))
	}],
	showBarcode: false,
	showMiniProgram: false
}

export const PREVIEW_DATA_TRANSFER = {
	url: '',
	name: '给为理想而奋斗',
	money: '-0.01',
	time: '2025年6月13日 16:19:30',
	orderNumber: '1000050001202506130129831495334',
	otherTime: '2025年6月13日 16:20:17',
	payment: '零钱通',
	currentState: '对方已收款',
	desc: '由互联网清算有限公司提供付款清算服务',
	desc2: '由互联网清算有限公司提供付款清算服务',
	shop: '商品名称',
	merchantName: '商户全称名称',
	institution: '中国农业银行股份有限公司',
	shopNumber: '20250621110113130166201789980574',
	payDesc: '这是支付说明内容',
	BoNumber: 'JY20250613001',
	miniName: '小七商行收款',
	message: '这是一条留言备注',
	remark: '备注信息内容',
	payeeRemark: '收款方备注内容',
	transferTime: '2025年6月13日 16:19:30',
	transferOrderNumber: '1000050001202506130129831495334',
	padd: 60,
	order: false,
	fontSize: 100
}

export const PREVIEW_DATA_MERCHANT = {
	...PREVIEW_DATA_TRANSFER,
	name: '小七商行',
	money: '-128.00',
	currentState: '支付成功',
	payment: '微信支付',
	shop: '精品水果礼盒',
	merchantName: '小七商行有限公司',
	order: true
}

export const PREVIEW_DATA_MINI_PROGRAM = {
	url: '',
	name: '给为理想而奋斗',
	money: '-0.01',
	time: '2025年6月13日 16:19:30',
	orderNumber: '1000050001202506130129831495334',
	otherTime: '2025年6月13日 16:20:17',
	payment: '零钱通',
	currentState: '对方已收款',
	desc: '由互联网清算有限公司提供付款清算服务',
	desc2: '由互联网清算有限公司提供付款清算服务',
	shop: '商品',
	merchantName: '商户名称',
	institution: '收款机构',
	shopNumber: ' 商户单号',
	miniName: '小七商行收款',
	padd: 60,
	order: false,
	fontSize: 100
}
