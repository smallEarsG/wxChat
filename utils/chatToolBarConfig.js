const STORAGE_KEY = 'chat_toolbar_config';

const DEFAULT_ITEMS = [
	{ id: 'qy_card', label: '企业名片', icon: '/static/chat/qy.png', custom: false },
	{ id: 'payment', label: '发起收款', icon: '/static/chat/tool_1.png', custom: false },
	{ id: 'transfer', label: '客户转账', icon: '/static/chat/tool_2.png', custom: false },
	{ id: 'quick_reply', label: '快捷回复', icon: '/static/chat/tool_3.png', custom: false },
	{ id: 'recommend_service', label: '推荐客服', icon: '/static/chat/tool_5.png', custom: false },
	{ id: 'product_catalog', label: '商品图册', icon: '/static/chat/tool_5.png', custom: false },
	{ id: 'live', label: '直播', icon: '/static/chat/tool_6.png', custom: false },
	{ id: 'customer_detail', label: '客户详情', icon: '/static/chat/tool_7.png', custom: false }
];

function cloneConfig(config) {
	return {
		visible: !!config.visible,
		items: (config.items || []).map((item) => ({
			id: item.id,
			label: item.label,
			icon: item.icon,
			custom: !!item.custom
		}))
	};
}

export function getDefaultConfig() {
	return cloneConfig({
		visible: true,
		items: DEFAULT_ITEMS
	});
}

export function loadChatToolBarConfig() {
	try {
		const saved = uni.getStorageSync(STORAGE_KEY);
		if (!saved) {
			return getDefaultConfig();
		}

		let config = saved;
		if (typeof saved === 'string') {
			config = JSON.parse(saved);
		}

		if (!config || typeof config !== 'object' || !Array.isArray(config.items) || !config.items.length) {
			return getDefaultConfig();
		}

		return cloneConfig({
			visible: config.visible !== false,
			items: config.items.filter((item) => item && item.id && item.label && item.icon)
		});
	} catch (error) {
		console.error('读取快捷栏配置失败:', error);
		return getDefaultConfig();
	}
}

export function saveChatToolBarConfig(config) {
	try {
		const payload = cloneConfig(config);
		uni.setStorageSync(STORAGE_KEY, JSON.stringify(payload));
		return payload;
	} catch (error) {
		console.error('保存快捷栏配置失败:', error);
		throw error;
	}
}
