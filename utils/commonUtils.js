// 通用工具函数集合

/**
 * 格式化时间
 * @param {Date|string|number} date 时间
 * @param {string} format 格式化字符串
 * @returns {string}
 */
export function formatTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
	const d = new Date(date);
	const year = d.getFullYear();
	const month = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	const hour = String(d.getHours()).padStart(2, '0');
	const minute = String(d.getMinutes()).padStart(2, '0');
	const second = String(d.getSeconds()).padStart(2, '0');

	return format
		.replace('YYYY', year)
		.replace('MM', month)
		.replace('DD', day)
		.replace('HH', hour)
		.replace('mm', minute)
		.replace('ss', second);
}

/**
 * 生成订单号
 * @param {string} prefix 前缀
 * @returns {string}
 */
export function generateOrderNumber(prefix = '') {
	const now = new Date();
	const year = now.getFullYear();
	const month = String(now.getMonth() + 1).padStart(2, '0');
	const day = String(now.getDate()).padStart(2, '0');
	const hour = String(now.getHours()).padStart(2, '0');
	const minute = String(now.getMinutes()).padStart(2, '0');
	const second = String(now.getSeconds()).padStart(2, '0');
	const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
	
	return `${prefix}${year}${month}${day}${hour}${minute}${second}${random}`;
}

/**
 * 深拷贝对象
 * @param {any} obj 要拷贝的对象
 * @returns {any}
 */
export function deepClone(obj) {
	if (obj === null || typeof obj !== 'object') return obj;
	if (obj instanceof Date) return new Date(obj);
	if (obj instanceof Array) return obj.map(item => deepClone(item));
	if (typeof obj === 'object') {
		const clonedObj = {};
		for (const key in obj) {
			if (obj.hasOwnProperty(key)) {
				clonedObj[key] = deepClone(obj[key]);
			}
		}
		return clonedObj;
	}
}

/**
 * 防抖函数
 * @param {Function} func 要执行的函数
 * @param {number} delay 延迟时间
 * @returns {Function}
 */
export function debounce(func, delay = 300) {
	let timeoutId;
	return function (...args) {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => func.apply(this, args), delay);
	};
}

/**
 * 节流函数
 * @param {Function} func 要执行的函数
 * @param {number} delay 间隔时间
 * @returns {Function}
 */
export function throttle(func, delay = 300) {
	let lastExecTime = 0;
	return function (...args) {
		const currentTime = Date.now();
		if (currentTime - lastExecTime >= delay) {
			lastExecTime = currentTime;
			func.apply(this, args);
		}
	};
}

/**
 * 检测设备类型
 */
export const deviceInfo = {
	// 获取系统信息
	getSystemInfo() {
		return uni.getSystemInfoSync();
	},
	
	// 是否是iOS
	isIOS() {
		return this.getSystemInfo().platform === 'ios';
	},
	
	// 是否是Android
	isAndroid() {
		return this.getSystemInfo().platform === 'android';
	},

	// 获取充值下单平台
	getPayPlatform() {
		return this.getSystemInfo().platform === 'ios' ? 'ios' : 'android';
	},
	
	// 获取状态栏高度
	getStatusBarHeight() {
		return this.getSystemInfo().statusBarHeight || 0;
	},
	
	// 获取安全区域
	getSafeArea() {
		const systemInfo = this.getSystemInfo();
		return {
			top: systemInfo.safeAreaInsets?.top || 0,
			bottom: systemInfo.safeAreaInsets?.bottom || 0,
			left: systemInfo.safeAreaInsets?.left || 0,
			right: systemInfo.safeAreaInsets?.right || 0
		};
	}
};

/**
 * 本地存储封装
 */
export const storage = {
	// 设置数据
	set(key, value) {
		try {
			const data = JSON.stringify(value);
			uni.setStorageSync(key, data);
			return true;
		} catch (error) {
			console.error('Storage set error:', error);
			return false;
		}
	},
	
	// 获取数据
	get(key, defaultValue = null) {
		try {
			const data = uni.getStorageSync(key);
			return data ? JSON.parse(data) : defaultValue;
		} catch (error) {
			console.error('Storage get error:', error);
			return defaultValue;
		}
	},
	
	// 删除数据
	remove(key) {
		try {
			uni.removeStorageSync(key);
			return true;
		} catch (error) {
			console.error('Storage remove error:', error);
			return false;
		}
	},
	
	// 清空所有数据
	clear() {
		try {
			uni.clearStorageSync();
			return true;
		} catch (error) {
			console.error('Storage clear error:', error);
			return false;
		}
	}
};

/**
 * 图片处理工具
 */
export const imageUtils = {
	// 选择图片
	chooseImage(options = {}) {
		const defaultOptions = {
			count: 1,
			sizeType: ['original', 'compressed'],
			sourceType: ['album', 'camera']
		};
		
		return new Promise((resolve, reject) => {
			uni.chooseImage({
				...defaultOptions,
				...options,
				success: resolve,
				fail: reject
			});
		});
	},
	
	// 预览图片
	previewImage(urls, current = 0) {
		uni.previewImage({
			urls: Array.isArray(urls) ? urls : [urls],
			current: current
		});
	},
	
	// 保存图片到相册
	saveImageToPhotosAlbum(filePath) {
		return new Promise((resolve, reject) => {
			uni.saveImageToPhotosAlbum({
				filePath,
				success: resolve,
				fail: reject
			});
		});
	}
};

/**
 * 弹窗工具
 */
export const toast = {
	// 成功提示
	success(title, duration = 2000) {
		uni.showToast({
			title,
			icon: 'success',
			duration
		});
	},
	
	// 失败提示
	error(title, duration = 2000) {
		uni.showToast({
			title,
			icon: 'none',
			duration
		});
	},
	
	// 加载提示
	loading(title = '加载中...') {
		uni.showLoading({ title });
	},
	
	// 隐藏加载
	hideLoading() {
		uni.hideLoading();
	},
	
	// 确认对话框
	confirm(options = {}) {
		const defaultOptions = {
			title: '提示',
			content: '确定要执行此操作吗？',
			confirmText: '确定',
			cancelText: '取消'
		};
		
		return new Promise((resolve) => {
			uni.showModal({
				...defaultOptions,
				...options,
				success: (res) => {
					resolve(res.confirm);
				}
			});
		});
	}
};

/**
 * 校验工具
 */
export const validator = {
	// 手机号校验
	isPhone(phone) {
		return /^1[3-9]\d{9}$/.test(phone);
	},
	
	// 邮箱校验
	isEmail(email) {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	},
	
	// 身份证校验
	isIdCard(idCard) {
		return /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(idCard);
	},
	
	// 非空校验
	isNotEmpty(value) {
		return value !== null && value !== undefined && value !== '';
	}
};

// 导出所有工具
export default {
	formatTime,
	generateOrderNumber,
	deepClone,
	debounce,
	throttle,
	deviceInfo,
	storage,
	imageUtils,
	toast,
	validator
};
