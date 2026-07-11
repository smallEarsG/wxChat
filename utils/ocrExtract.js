export function extractInfoWithRegex(data = []) {
	const info = {
		name: '请输入机构名称',
		money: '+100.00',
		time: '',
		otherTime: '',
		payment: '',
		orderNumber: '',
		currentState: '',
		shop: '',
		merchantName: '',
		institution: '',
		shopNumber: '',
		desc: '',
		payDesc: ''
	}

	data.forEach((item, index) => {
		const words = item.words

		const nameMatch = words.match(/扫二维码付款-([^-]+)/)
		if (nameMatch) {
			info.name = nameMatch[1]
			info.money = data[index + 1]?.words
		}

		const transferNameMatch = words.match(/转账-([^-]+)/)
		if (transferNameMatch) {
			info.name = transferNameMatch[1]
			info.money = data[index + 1]?.words
		}

		const payment = words.match(/支付方式/)
		if (payment) info.payment = data[index + 1]?.words

		const payDesc = words.match(/支付说明/)
		if (payDesc) info.payDesc = data[index + 1]?.words

		const sdesc = words.match(/收款方备注/)
		if (sdesc) info.desc = data[index + 1]?.words

		const zdesc = words.match(/转账说明/)
		if (zdesc) info.desc = data[index + 1]?.words

		const shop = words.match(/商品/)
		if (shop) info.shop = data[index + 1]?.words

		const merchantName = words.match(/商户全称/)
		if (merchantName) info.merchantName = data[index + 1]?.words

		const institution = words.match(/收单机构/)
		if (institution) info.institution = data[index + 1]?.words

		const currentState = words.match(/当前状态/)
		if (currentState) info.currentState = data[index + 1]?.words

		const timeMatch = words.match(/\d{4}年\d{1,2}月\d{1,2}日\d{1,2}[:：]\d{2}[:：]\d{2}/)
		const temp = words.match(/\d{4}年\d{1,2}月\d{1,2}日/)
		if (timeMatch || temp) {
			let tempTime = ''
			if (timeMatch) {
				tempTime = timeMatch[0]
			} else {
				tempTime = temp + ' ' + data[index + 1]?.words
			}
			if (info.time !== '') {
				info.otherTime = tempTime
			} else {
				info.time = tempTime
			}
		}

		const orderMatch = words.match(/\d{16,32}/)
		if (orderMatch && /转账单号/.test(data[index - 1]?.words)) {
			if (orderMatch[0].length < 31) {
				info.orderNumber = orderMatch[0] + data[index + 1]?.words
			} else {
				info.orderNumber = orderMatch[0]
			}
		} else if (orderMatch && /交易单号/.test(data[index - 1]?.words)) {
			if (orderMatch[0].length < 28) {
				info.orderNumber = orderMatch[0] + data[index + 1]?.words
			} else {
				info.orderNumber = orderMatch[0]
			}
		} else if (orderMatch && /商户单号/.test(data[index - 1]?.words)) {
			if (orderMatch[0].length < 28) {
				info.shopNumber = orderMatch[0] + data[index + 1]?.words
			} else {
				info.shopNumber = orderMatch[0]
			}
		}
	})

	if (info.time) {
		info.time = info.time.replace(/日(\d)/, '日 $1').replace(/：/g, ':')
	}

	if (info.otherTime) {
		info.otherTime = info.otherTime.replace(/日(\d)/, '日 $1').replace(/：/g, ':')
	}

	return info
}
