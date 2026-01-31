// mixins/watermarkMixin.js
import { isMemberExpired } from '@/utils/tool.js';
import { getUserInfo } from '@/api/index.js';

// 全局缓存，避免重复查询
let globalUserInfoCache = null;
let globalCacheTime = 0;

// 提供一个全局函数供外部调用更新缓存
export function updateGlobalUserInfoCache(userInfo) {
	if (userInfo) {
		globalUserInfoCache = userInfo;
		globalCacheTime = Date.now();
		// 触发全局事件，通知所有页面更新水印状态
		if (typeof uni !== 'undefined' && uni.$emit) {
			uni.$emit('userInfoUpdated', userInfo);
		}
	}
}

export default {
	data() {
		return {
			showWatermark: false,
			watermarkUserInfo: {}
		}
	},
	mounted() {
		// 页面挂载后添加水印层到页面
		this.$nextTick(() => {
			this.updateWatermarkStatus();
		});
		// 监听全局事件，当用户信息更新时刷新水印状态
		if (typeof uni !== 'undefined' && uni.$on) {
			uni.$on('userInfoUpdated', this.handleUserInfoUpdated);
		}
	},
	beforeDestroy() {
		// 移除事件监听
		if (typeof uni !== 'undefined' && uni.$off) {
			uni.$off('userInfoUpdated', this.handleUserInfoUpdated);
		}
	},
	onShow() {
		// 判断当前页面路径
		const pages = getCurrentPages();
		const currentPage = pages[pages.length - 1];
		const isIndexPage = currentPage && currentPage.route === 'pages/index/index';
		
		if (isIndexPage) {
			// 如果是 index 页面，主动拉取用户信息
			this.fetchUserInfoAndUpdateCache();
		} else {
			// 其他页面只从缓存读取
			this.updateWatermarkStatus();
		}
	},
	methods: {
		async fetchUserInfoAndUpdateCache() {
			// 从本地存储获取用户ID
			const userId = uni.getStorageSync('userId');
			if (!userId) {
				// 没有用户ID，默认显示水印
				this.showWatermark = true;
				return;
			}
			
			try {
				const res = await getUserInfo(userId);
				if (res && res.data) {
					// 更新全局缓存
					globalUserInfoCache = res.data;
					globalCacheTime = Date.now();
					this.applyWatermarkStatus(res.data);
					// 触发全局事件，通知其他页面更新水印状态
					if (typeof uni !== 'undefined' && uni.$emit) {
						uni.$emit('userInfoUpdated', res.data);
					}
				} else {
					// 获取用户信息失败，默认显示水印
					this.showWatermark = true;
				}
			} catch (e) {
				console.error('获取用户信息失败', e);
				// 出错时默认显示水印
				this.showWatermark = true;
			}
		},
		updateWatermarkStatus() {
			// 从本地存储获取用户ID
			const userId = uni.getStorageSync('userId');
			if (!userId) {
				// 没有用户ID，默认显示水印
				this.showWatermark = true;
				return;
			}

			// 只从全局缓存读取，不主动调用 API
			if (globalUserInfoCache) {
				this.applyWatermarkStatus(globalUserInfoCache);
			} else {
				// 如果没有缓存，默认显示水印（等待 index 页面更新缓存）
				this.showWatermark = true;
			}
		},
		handleUserInfoUpdated(userInfo) {
			// 当收到用户信息更新事件时，刷新水印状态
			this.applyWatermarkStatus(userInfo);
		},
		applyWatermarkStatus(userInfo) {
			this.watermarkUserInfo = userInfo;
			// 检查用户是否为会员
			if (!userInfo.memberExpireAt) {
				// 如果没有会员信息，显示水印（即使有试用次数也显示）
				this.showWatermark = true;
			} else {
				// 有会员信息，检查是否过期
				const expired = isMemberExpired(userInfo.memberExpireAt);
				if (expired) {
					// 会员过期，显示水印（即使有试用次数也显示）
					this.showWatermark = true;
				} else {
					// 会员未过期（有效会员），不显示水印
					this.showWatermark = false;
				}
			}
		}
	}
}

