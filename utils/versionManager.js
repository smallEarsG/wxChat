// 版本管理工具
import { REMOTE_API } from './request.js';

/**
 * 从URL中提取端口号（冒号后的四位数）
 * @param {string} url - 完整的URL字符串
 * @returns {string} - 端口号，如果未找到则返回默认值'8080'
 */
function extractPortFromUrl(url) {
	try {
		console.log("url===",url)
		// 使用正则表达式匹配冒号后的四位数端口号
		const match = url.match(/:(\d{4})/);
		
		if (match && match[1]) {
			return match[1];
		}
		// 提取失败时返回默认端口号
		console.warn('无法从URL中提取端口号，使用默认值8080');
		return '8080';
	} catch (error) {
		console.error('提取端口号失败:', error);
		// 提取失败时返回默认端口号
		return '8080';
	}
}

export class VersionManager {
	constructor(options = {}) {
		this.apiUrl = options.apiUrl || 'http://106.15.137.235:8080/api/app/version';
		this.forceUpdateHandling = options.forceUpdateHandling || 'quit'; // 'quit' | 'redirect'
		this.storageKey = 'lastVersionDialogTime'; // 存储上次弹框时间的key
		this.dialogInterval = 24 * 60 * 60 * 1000; // 30秒的毫秒数（测试用，正式环境应改为 24 * 60 * 60 * 1000）
		// 从REMOTE_API中提取端口号作为post参数，如果没有则使用传入的options.post，提取失败则默认为8080
		this.post = options.post || extractPortFromUrl(REMOTE_API);
		// 管理员手机号，可以从服务端返回的 versionInfo 中获取，也可以在这里配置默认值
		this.adminPhone = "18216263971";
	}

	/**
	 * 版本号比较
	 * @param {string} v1 版本1
	 * @param {string} v2 版本2
	 * @returns {number} 1: v1>v2, -1: v1<v2, 0: v1=v2
	 */
	compareVersion(v1, v2) {
		const v1Parts = v1.split('.');
		const v2Parts = v2.split('.');
		const len = Math.max(v1Parts.length, v2Parts.length);
		
		// 补齐版本号长度
		while (v1Parts.length < len) v1Parts.push('0');
		while (v2Parts.length < len) v2Parts.push('0');

		for (let i = 0; i < len; i++) {
			const num1 = parseInt(v1Parts[i], 10);
			const num2 = parseInt(v2Parts[i], 10);
			if (num1 > num2) return 1;
			if (num1 < num2) return -1;
		}
		return 0;
	}

	/**
	 * 检测是否为 iOS 系统
	 */
	isIOS() {
		try {
			if (typeof plus === 'undefined') {
				return false;
			}
			return plus.os.name === 'iOS';
		} catch (error) {
			console.error('检测系统平台失败:', error);
			return false;
		}
	}

	/**
	 * 获取当前应用版本
	 */
	getCurrentVersion() {
		return new Promise((resolve, reject) => {
			// 检查是否为 App 环境
			if (typeof plus === 'undefined') {
				resolve(null);
				return;
			}

			plus.runtime.getProperty(plus.runtime.appid, (wgtinfo) => {
				resolve(wgtinfo.version);
			}, (error) => {
				reject(error);
			});
		});
	}

	/**
	 * 检查服务端版本信息
	 */
	async checkServerVersion() {
		try {
			// 验证post参数
			if (!this.post || this.post.trim() === '') {
				throw new Error('post 参数不能为空');
			}

			// 构建带参数的URL
			const url = `${this.apiUrl}?post=${encodeURIComponent(this.post)}`;
			
			const response = await uni.request({
				url: url,
				method: 'GET'
			});
			
			if (response[1]?.statusCode === 200) {
				return response[1].data;
			} else if (response[1]?.statusCode === 400) {
				throw new Error(response[1].data?.error || 'post 参数不能为空');
			} else if (response[1]?.statusCode === 404) {
				throw new Error(response[1].data?.error || '未找到对应的版本信息');
			}
			throw new Error('获取版本信息失败');
		} catch (error) {
			console.error('检查版本失败:', error);
			throw error;
		}
	}

	/**
	 * 检查是否在24小时内已经弹过框
	 */
	shouldShowDialog() {
		try {
			const lastDialogTime = uni.getStorageSync(this.storageKey);
			if (!lastDialogTime) {
				// 没有记录，可以弹框
				return true;
			}
			
			const now = Date.now();
			const timeDiff = now - parseInt(lastDialogTime, 10);
			
			// 如果距离上次弹框已经超过24小时，可以弹框
			if (timeDiff >= this.dialogInterval) {
				return true;
			}
			
			// 24小时内已经弹过框，不重复弹框
			const remainingHours = Math.ceil((this.dialogInterval - timeDiff) / (60 * 60 * 1000));
			console.log(`距离上次弹框不足24小时，还需等待约 ${remainingHours} 小时`);
			return false;
		} catch (error) {
			console.error('检查弹框时间失败:', error);
			// 出错时允许弹框，避免影响正常功能
			return true;
		}
	}

	/**
	 * 记录弹框时间
	 */
	saveDialogTime() {
		try {
			const now = Date.now();
			uni.setStorageSync(this.storageKey, now.toString());
			console.log('已记录弹框时间:', new Date(now).toLocaleString());
		} catch (error) {
			console.error('保存弹框时间失败:', error);
		}
	}

	/**
	 * 显示更新对话框
	 */
	showUpdateDialog(versionInfo) {
		return new Promise((resolve) => {
			// 记录弹框时间
			this.saveDialogTime();
			
			// 将"。"字符替换成换行符
			const formatContent = (content) => {
				if (!content) return '发现新版本，是否更新？';
				return content.replace(/。/g, '\n');
			};
			
			const isIOS = this.isIOS();
			
			// iOS 系统只显示"联系管理员"按钮
			if (isIOS) {
				uni.showModal({
					title: '发现新版本',
					content: formatContent(versionInfo.updateLog),
					confirmText: '联系管理员',
					showCancel: false, // iOS 不显示取消按钮
					success: (modalRes) => {
						resolve({
							confirmed: modalRes.confirm,
							cancelled: false // iOS 没有取消按钮
						});
					}
				});
			} else {
				// 非 iOS 系统，按原逻辑显示
				uni.showModal({
					title: '发现新版本',
					content: formatContent(versionInfo.updateLog),
					confirmText: '立即更新',
					showCancel: !versionInfo.forceUpdate,
					success: (modalRes) => {
						resolve({
							confirmed: modalRes.confirm,
							cancelled: modalRes.cancel
						});
					}
				});
			}
		});
	}

	/**
	 * 复制手机号到剪贴板
	 */
	copyPhoneNumber(phoneNumber) {
		return new Promise((resolve, reject) => {
			if (!phoneNumber) {
				reject(new Error('手机号为空'));
				return;
			}
			
			uni.setClipboardData({
				data: phoneNumber,
				success: () => {
					uni.showToast({
						title: '手机号已复制',
						icon: 'success',
						duration: 2000
					});
					resolve();
				},
				fail: (err) => {
					console.error('复制手机号失败:', err);
					uni.showToast({
						title: '复制失败，请手动复制',
						icon: 'none',
						duration: 2000
					});
					reject(err);
				}
			});
		});
	}

	/**
	 * 处理更新操作
	 */
	async handleUpdate(versionInfo) {
		const isIOS = this.isIOS();
		const dialogResult = await this.showUpdateDialog(versionInfo);
		
		if (dialogResult.confirmed) {
			if (isIOS) {
				// iOS 系统：点击"联系管理员"按钮，复制手机号
				// 优先使用服务端返回的手机号，其次使用配置的默认值
				const phoneNumber = versionInfo.adminPhone || versionInfo.contactPhone || this.adminPhone;
				
				if (phoneNumber) {
					try {
						await this.copyPhoneNumber(phoneNumber);
						console.log('iOS 系统：已复制管理员手机号:', phoneNumber);
					} catch (error) {
						console.error('复制手机号失败:', error);
					}
				} else {
					uni.showToast({
						title: '未配置管理员联系方式',
						icon: 'none',
						duration: 2000
					});
					console.warn('iOS 系统：未找到管理员手机号');
				}
			} else {
				// 非 iOS 系统：使用系统浏览器打开 APK 下载链接
				plus.runtime.openURL(versionInfo.apkUrl);
			}
		} else if (versionInfo.forceUpdate && !isIOS) {
			// 强制更新时点击取消的处理（iOS 不受影响）
			if (this.forceUpdateHandling === 'quit') {
				plus.runtime.quit();
			}
			// 其他处理方式可以在这里扩展
		}
	}

	/**
	 * 执行版本检查流程
	 */
	async checkForUpdates() {
		try {
			// 检查post参数
			if (!this.post || this.post.trim() === '') {
				console.warn('版本检查跳过：post 参数未设置');
				return;
			}

			const currentVersion = await this.getCurrentVersion();
			if (!currentVersion) {
				console.log('非App环境，跳过版本检查');
				return;
			}

			// 先获取服务端版本信息，判断是否是强制更新
			const serverVersionInfo = await this.checkServerVersion();
			const serverVersion = serverVersionInfo.latestVersion;
			const isIOS = this.isIOS();
			// iOS 系统不受强制更新影响
			const isForceUpdate = isIOS ? false : (serverVersionInfo.forceUpdate === true);
			
			console.log('当前版本:', currentVersion);
			console.log('服务端版本:', serverVersion);
			console.log('系统平台:', isIOS ? 'iOS' : 'Android');
			console.log('是否强制更新:', isForceUpdate, isIOS ? '(iOS 不受强制更新影响)' : '');
			
			// 如果不是强制更新，检查是否在时间间隔内已经弹过框
			if (!isForceUpdate && !this.shouldShowDialog()) {
				console.log('24小时内已弹过版本更新框，跳过本次检查');
				return;
			}
			
			// 如果是强制更新，跳过时间间隔检查，直接处理（iOS 不受影响）
			if (isForceUpdate && !isIOS) {
				console.log('检测到强制更新，跳过时间间隔限制');
			}
			
			const compareResult = this.compareVersion(serverVersion, currentVersion);
			
			if (compareResult > 0) {
				// 有新版本，处理更新
				await this.handleUpdate(serverVersionInfo);
			} else {
				console.log('当前已是最新版本');
			}
		} catch (error) {
			console.error('版本检查过程出错:', error);
		}
	}
}

// 创建默认实例
export const versionManager = new VersionManager();

// 便捷方法
export const checkAppVersion = (post) => {
	// 如果传入了post参数，更新versionManager的post值
	if (post !== undefined && post !== null) {
		versionManager.post = post;
	}
	return versionManager.checkForUpdates();
};
