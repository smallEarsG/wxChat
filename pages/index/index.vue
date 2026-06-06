<template>
	<view class="container">
		<!-- 全局水印层 -->
		<WatermarkLayer />
		<!-- 顶部公告栏 -->
		<view class="announcement-banner">
			<view class="announcement-content">
				<text class="announcement-icon">📢</text>
				<text class="announcement-text">免责声明：本应用仅供娱乐学习使用，切勿用于违法用途</text>
			</view>
		</view>
		
		<!-- 顶部标题区域 -->
		<view class="header-section">
			<text class="title-text">功能管理中心</text>
			<text class="subtitle-text">专业的聊天记录生成工具</text>
		</view>
		<!-- 功能卡片区域 -->
		<view class="features-section">
			<view class="section-title">
				<!-- <text class="section-title-text">核心功能</text> -->
				<text class="section-subtitle">选择您需要的功能模块</text>
			</view>
			
			<!-- 分类选择菜单 -->
			<view class="category-menu">
				<view 
					class="category-item" 
					:class="{ 'category-active': selectedCategory === 'enterprise' }"
					@click="switchCategory('enterprise')"
				>
					<text class="category-text">企业</text>
				</view>
				<view 
					class="category-item" 
					:class="{ 'category-active': selectedCategory === 'wechat' }"
					@click="switchCategory('wechat')"
				>
					<text class="category-text">微信</text>
				</view>
				<view 
					class="category-item" 
					:class="{ 'category-active': selectedCategory === 'alipay' }"
					@click="switchCategory('alipay')"
				>
					<text class="category-text">支付宝</text>
				</view>
			</view>
			
			<view class="grid-container">
				<view 
					v-for="(item, index) in filteredModules" 
					:key="index"
					class="card" 
					@click="handleModuleClick(item.handler)"
				>
					<view :class="['icon-container', item.iconBg]">
						<image v-if="item.iconImage" :src="item.iconImage" class="icon-image" mode="aspectFit"></image>
						<text v-else :class="[item.iconColor, 'text-2xl', 'font-bold']">{{ item.icon }}</text>
					</view>
					<text class="card-title">{{ item.title }}</text>
					<text class="card-subtitle">{{ item.subtitle }}</text>
				</view>
			</view>
		</view>
		
		<!-- 联系方式区域 -->
		<view class="contact-section">
			<view class="contact-card">
				<text class="contact-title">💬在线客服（微信电话同号） </text>
				<text class="contact-subtitle">问题与建议反馈、页面定制开发请联系</text>
				<text class="contact-subtitle">（24小时内进行反馈和处理）</text>
				<view class="contact-info">
					<text class="contact-item" @click="copyPhoneNumber">wx: 18216263971（点击复制）</text>
				</view>
			</view>
		</view>
		
		<!-- 底部免责声明 -->
		<view class="footer-section">
			<text class="footer-text">🛡️ 使用提醒：请合理使用本工具，遵守相关法律法规</text>
		</view>


		<pfePopup ref="wxChatGroupPopup" @submit="onSubmitWxGroup"></pfePopup>
		<pfePopup ref="ChatGroupPopup" @submit="onSubmitGroup"></pfePopup>
	</view>
</template>

<script>
	import ProfileEditPopup from "../../components/ProfileEditPopup/ProfileEditPopup.vue"

	import {
		getUserInfo,
		updateUseFeature
	} from '@/api/index.js'
	import {
		isMemberExpired
	} from '@/utils/tool.js'
	import { checkAppVersion } from '@/utils/versionManager.js'
	export default {
		components: {
			ProfileEditPopup
		},
		data() {
			return {
				guestInfo: {},
				selectedCategory: 'enterprise', // 默认选择企业类
				modules: [
					// 企业类
					{
						category: 'enterprise',
						title: '企业聊天',
						subtitle: '快速生成企业自定义聊天记录',
						icon: '💬',
						iconBg: 'bg-blue-100',
						iconColor: 'text-blue-600',
						handler: 'goToChat'
					},
					{
						category: 'enterprise',
						title: '企业群聊',
						subtitle: '自定义群聊信息，恶搞专用',
						icon: '👨‍👩‍👧‍👦',
						iconBg: 'bg-purple-100',
						iconColor: 'text-purple-600',
						handler: 'goToChatGroup'
					},
					{
						category: 'enterprise',
						title: '企业微信群聊（对外）',
						subtitle: '自定义群聊信息，恶搞专用',
						icon: '👨‍👩‍👧‍👦',
						iconBg: 'bg-purple-100',
						iconColor: 'text-purple-600',
						handler: 'goToEnterpriseWxChatGroup'
					},
					{
						category: 'enterprise',
						title: '企业转账记录',
						subtitle: '企业收款转账记录，快速建立信任背书',
						icon: '💸',
						iconBg: 'bg-orange-100',
						iconColor: 'text-orange-600',
						handler: 'goToRecords'
					},
					{
						category: 'enterprise',
						title: '企业获客助手',
						subtitle: '手动编辑获客数量，使用情况',
						icon: '🎯',
						iconBg: 'bg-teal-100',
						iconColor: 'text-teal-600',
						handler: 'gotoGuset'
					},
					{
						category: 'enterprise',
						title: '收款账单',
						subtitle: '管理企业收款账单记录',
						icon: '📑',
						iconBg: 'bg-pink-100',
						iconColor: 'text-pink-600',
						handler: 'gotoCollectionBill'
					},
					// 威信类
					{
						category: 'wechat',
						title: '威信聊天',
						subtitle: '快速生成w-x自定义聊天记录',
						icon: '👥',
						iconBg: 'bg-green-100',
						iconColor: 'text-green-600',
						handler: 'goToWxChat'
					},
					{
						category: 'wechat',
						title: '威信群聊',
						subtitle: '自定义群聊信息，恶搞专用',
						icon: '👨‍👩‍👧‍👦',
						iconBg: 'bg-purple-100',
						iconColor: 'text-purple-600',
						handler: 'goToWxChatGroup'
					},
					{
						category: 'wechat',
						title: '威信付款记录',
						subtitle: '快速扫描生成付款记录，自动录入订单号，以假乱真，自定义金额和时间',
						icon: '📄',
						iconBg: 'bg-indigo-100',
						iconColor: 'text-indigo-600',
						handler: 'gotoCodePay'
					},
					{
						category: 'wechat',
						title: '威信支付记录',
						subtitle: '快速生成w-x支付交易历史',
						icon: '💰',
						iconBg: 'bg-red-100',
						iconColor: 'text-red-600',
						handler: 'goToWxChatPay'
					},
					{
						category: 'wechat',
						title: '微信付款',
						subtitle: '快速生成微信付款记录',
						iconImage: '/static/wxchat/kinda_wechat_pay.png',
						iconBg: 'bg-green-100',
						iconColor: 'text-green-600',
						handler: 'goToWxPayment'
					},
					// 支付宝类
					{
						category: 'alipay',
						title: '付款详情',
						subtitle: '免责声明，仅供娱乐，切莫违法',
						icon: '💰',
						iconBg: 'bg-red-100',
						iconColor: 'text-red-600',
						handler: 'goToAlipay'
					},
					{
						category: 'alipay',
						title: '付款截图',
						subtitle: '生成支付宝付款截图',
						icon: '📸',
						iconBg: 'bg-red-100',
						iconColor: 'text-red-600',
						handler: 'goToPaymentScreenshot'
					}
				]
			}
		},
		computed: {
			filteredModules() {
				return this.modules.filter(item => item.category === this.selectedCategory)
			}
		},
		onShow() {
			const userId = uni.getStorageSync('userId')
			if (!userId) {
				uni.redirectTo({
					url: "/pages/login/login"
				})
			}
			// 查询用户使用次数 以及是否是VIP
			 userId && this.getUserInfo(userId)
			// 检查应用版本更新
			checkAppVersion();
		},
		methods: {
			switchCategory(category) {
				this.selectedCategory = category
			},
			handleModuleClick(handlerName) {
				if (this[handlerName] && typeof this[handlerName] === 'function') {
					this[handlerName]()
				}
			},
			async getUserInfo(userId) {
				const res = await getUserInfo(userId)

				this.guestInfo = res.data
				console.log(res);
			},

			goToChat() {
				console.log(isMemberExpired(this.guestInfo.memberExpireAt));
				if (isMemberExpired(this.guestInfo.memberExpireAt)) {
					// 试用次数用完后开始需要充值会员
					if (this.guestInfo.tryCount == 0) {
						uni.showToast({
							title: '使用次数已用完请充值会员',
							icon: 'none'
						});
						return
					} else {
						updateUseFeature(this.guestInfo.id)
					}
				}

				uni.navigateTo({
					url: '/pages/chatList/chatList'
				})

			},
			goToWxChat() {
				
				if (isMemberExpired(this.guestInfo.memberExpireAt)) {
					// 试用次数用完后开始需要充值会员
					if (this.guestInfo.tryCount == 0) {
						uni.showToast({
							title: '使用次数已用完请充值会员',
							icon: 'none'
						});
						return
					} else {
						updateUseFeature(this.guestInfo.id)
					}
				}
				uni.navigateTo({
					url: '/pages/wxChatList/wxChatList'
				})
				// this.$refs.wxChatPopup.open()
			},
			goToWxChatGroup() {

				if (isMemberExpired(this.guestInfo.memberExpireAt)) {
					// 试用次数用完后开始需要充值会员
					if (this.guestInfo.tryCount == 0) {
						uni.showToast({
							title: '使用次数已用完请充值会员',
							icon: 'none'
						});
						return
					} else {
						updateUseFeature(this.guestInfo.id)
					}
				}
				// 跳转到威信群聊列表页面
				uni.navigateTo({
					url: '/pages/wxChatGroupList/wxChatGroupList'
				});
			},
			goToChatGroup(){
				if (isMemberExpired(this.guestInfo.memberExpireAt)) {
					// 试用次数用完后开始需要充值会员
					if (this.guestInfo.tryCount == 0) {
						uni.showToast({
							title: '使用次数已用完请充值会员',
							icon: 'none'
						});
						return
					} else {
						updateUseFeature(this.guestInfo.id)
					}
				}
				// 跳转到群聊列表页面
				uni.navigateTo({
					url: '/pages/chatGroupList/chatGroupList'
				});
			},
			goToEnterpriseWxChatGroup() {
				if (isMemberExpired(this.guestInfo.memberExpireAt)) {
					// 试用次数用完后开始需要充值会员
					if (this.guestInfo.tryCount == 0) {
						uni.showToast({
							title: '使用次数已用完请充值会员',
							icon: 'none'
						});
						return
					} else {
						updateUseFeature(this.guestInfo.id)
					}
				}
				// 跳转到企业微信群聊列表页面
				uni.navigateTo({
					url: '/pages/enterpriseWxChatGroupList/enterpriseWxChatGroupList'
				});
			},
			onSubmitWxGroup(data) {
				if (isMemberExpired(this.guestInfo.memberExpireAt)) {
					// 试用次数用完后开始需要充值会员
					if (this.guestInfo.tryCount == 0) {
						uni.showToast({
							title: '使用次数已用完请充值会员',
							icon: 'none'
						});
						return
					} else {
						updateUseFeature(this.guestInfo.id)
					}
				}
				uni.navigateTo({
					url: '/pages/wxChatGroup/wxChatGroup?guestInfo=' + encodeURIComponent(JSON.stringify(data))
				});
			},
			onSubmitGroup(data){
				uni.navigateTo({
					url: '/pages/chatGrop/chatGrop?guestInfo=' + encodeURIComponent(JSON.stringify(data))
				});
			},
			onSubmit(data) {

				uni.navigateTo({
					url: '/pages/chat/chat?guestInfo=' + encodeURIComponent(JSON.stringify(data))
				});
			},
			// 跳转到转账记录页面
			goToRecords() {
				if (isMemberExpired(this.guestInfo.memberExpireAt)) {
					// 试用次数用完后开始需要充值会员
					if (this.guestInfo.tryCount == 0) {
						uni.showToast({
							title: '使用次数已用完请充值会员',
							icon: 'none'
						});
						return
					} else {
						updateUseFeature(this.guestInfo.id)
					}
				}
				uni.navigateTo({
					url: '/pages/records/records'
				});
			},
			goToWxChatPay() {

				if (isMemberExpired(this.guestInfo.memberExpireAt)) {
					// 试用次数用完后开始需要充值会员
					if (this.guestInfo.tryCount == 0) {
						uni.showToast({
							title: '使用次数已用完请充值会员',
							icon: 'none'
						});
						return
					} else {
						updateUseFeature(this.guestInfo.id)
					}
				}

				uni.navigateTo({
					url: '/pages/weChatPay/weChatPay'
				});
			},
			goToAlipay() {

				if (isMemberExpired(this.guestInfo.memberExpireAt)) {
					// 试用次数用完后开始需要充值会员
					if (this.guestInfo.tryCount == 0) {
						uni.showToast({
							title: '使用次数已用完请充值会员',
							icon: 'none'
						});
						return
					} else {
						updateUseFeature(this.guestInfo.id)
					}
				}

				uni.navigateTo({
					url: '/pages/Alipay/Alipay'
				});
			},
			goToPaymentScreenshot() {
				if (isMemberExpired(this.guestInfo.memberExpireAt)) {
					// 试用次数用完后开始需要充值会员
					if (this.guestInfo.tryCount == 0) {
						uni.showToast({
							title: '使用次数已用完请充值会员',
							icon: 'none'
						});
						return
					} else {
						updateUseFeature(this.guestInfo.id)
					}
				}

				uni.navigateTo({
					url: '/pages/PaymentScreenshot/PaymentScreenshot'
				});
			},
			gotoGuset() {
				uni.navigateTo({
					url: '/pages/getGuset/getGuset'
				});
			},
			gotoCollectionBill() {
				if (isMemberExpired(this.guestInfo.memberExpireAt)) {
					if (this.guestInfo.tryCount == 0) {
						uni.showToast({
							title: '使用次数已用完请充值会员',
							icon: 'none'
						});
						return
					} else {
						updateUseFeature(this.guestInfo.id)
					}
				}
				uni.navigateTo({
					url: '/pages/collectionBill/collectionBill'
				});
			},
			gotoCodePay() {
				if (isMemberExpired(this.guestInfo.memberExpireAt)) {
					// 试用次数用完后开始需要充值会员
					if (this.guestInfo.tryCount == 0) {
						uni.showToast({
							title: '使用次数已用完请充值会员',
							icon: 'none'
						});
						return
					} else {
						updateUseFeature(this.guestInfo.id)
					}
				}
				uni.navigateTo({
					url: '/pages/codePay/codePay'
				});
			},
			goToWxPayment() {
				if (isMemberExpired(this.guestInfo.memberExpireAt)) {
					// 试用次数用完后开始需要充值会员
					if (this.guestInfo.tryCount == 0) {
						uni.showToast({
							title: '使用次数已用完请充值会员',
							icon: 'none'
						});
						return
					} else {
						updateUseFeature(this.guestInfo.id)
					}
				}
				uni.navigateTo({
					url: '/pages/wxPayment/wxPayment'
				});
			},
			// 复制电话号码
			copyPhoneNumber() {
				const phoneNumber = '18216263971';
				uni.setClipboardData({
					data: phoneNumber,
					success: () => {
						uni.showToast({
							title: '已复制到剪贴板',
							icon: 'success',
							duration: 2000
						});
					},
					fail: () => {
						uni.showToast({
							title: '复制失败',
							icon: 'none'
						});
					}
				});
			}
		}
	};
</script>

<style>
	/* 基础样式 */
	.container {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
		position: absolute;
		box-sizing: border-box;
		width: 100%;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		overflow-x: hidden;
		
	}
	
	.container::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
		pointer-events: none;
	}

	/* 公告栏样式 */
	.announcement-banner {
		width: 100%;
		background: rgba(255, 193, 7, 0.95);
		backdrop-filter: blur(10rpx);
		padding: 20rpx 30rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
		position: relative;
		z-index: 10;
	}
	
	.announcement-content {
		display: flex;
		align-items: center;
		justify-content: center;
		max-width: 1200rpx;
		margin: 0 auto;
	}
	
	.announcement-icon {
		font-size: 32rpx;
		margin-right: 16rpx;
	}
	
	.announcement-text {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
		text-align: center;
		line-height: 1.4;
	}
	
	/* 头部区域样式 */
	.header-section {
		width: 100%;
		padding: 60rpx 40rpx 40rpx;
		text-align: center;
		position: relative;
		z-index: 5;
	}
	
	.title-text {
		font-size: 72rpx;
		font-weight: 700;
		color: white;
		text-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.3);
		margin-bottom: 20rpx;
		display: block;
	}

	.subtitle-text {
		color: rgba(255, 255, 255, 0.9);
		font-size: 32rpx;
		font-weight: 400;
		display: block;
	}
	
	/* 功能区域样式 */
	.features-section {
		width: 100%;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20rpx);
		border-radius: 40rpx 40rpx 0 0;
		padding: 50rpx 30rpx 80rpx;
		margin-top: 40rpx;
		position: relative;
		z-index: 5;
		box-shadow: 0 -10rpx 40rpx rgba(0, 0, 0, 0.1);
	}
	
	.section-title {
		text-align: center;
		margin-bottom: 60rpx;
	}
	
	.section-title-text {
		font-size: 48rpx;
		font-weight: 600;
		color: #1a202c;
		display: block;
		margin-bottom: 16rpx;
	}
	
	.section-subtitle {
		font-size: 28rpx;
		color: #718096;
		display: block;
	}

	/* 分类菜单样式 */
	.category-menu {
		display: flex;
		justify-content: center;
		gap: 20rpx;
		margin-bottom: 40rpx;
		padding: 0 20rpx;
	}

	.category-item {
		flex: 1;
		max-width: 200rpx;
		padding: 20rpx 30rpx;
		background: rgba(255, 255, 255, 0.8);
		border-radius: 50rpx;
		text-align: center;
		border: 2rpx solid rgba(102, 126, 234, 0.3);
		transition: all 0.3s ease;
		cursor: pointer;
	}

	.category-item:active {
		transform: scale(0.95);
	}

	.category-active {
		background: linear-gradient(135deg, #667eea, #764ba2);
		border-color: #667eea;
		box-shadow: 0 4rpx 20rpx rgba(102, 126, 234, 0.3);
	}

	.category-text {
		font-size: 28rpx;
		font-weight: 500;
		color: #667eea;
		transition: color 0.3s ease;
	}

	.category-active .category-text {
		color: #ffffff;
		font-weight: 600;
	}

	/* 网格容器 */
	.grid-container {
		width: 100%;
		/* max-width: 1400rpx; */
		display: grid;
		grid-template-columns: repeat(1, 1fr);
		gap: 40rpx;
		margin: 0 auto;
		overflow: hidden;
	}

	/* 响应式设计 */
	@media (min-width: 640rpx) {
		.grid-container {
			grid-template-columns: repeat(2, 1fr);
			gap: 35rpx;
		}
	}

	@media (min-width: 1024rpx) {
		.grid-container {
			grid-template-columns: repeat(3, 1fr);
			gap: 30rpx;
		}
	}

	/* 卡片样式 */
	.card {
		background: linear-gradient(145deg, #ffffff, #f0f4f8);
		border-radius: 24rpx;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.08);
		padding: 40rpx 32rpx;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		border: 1px solid rgba(255, 255, 255, 0.8);
		position: relative;
		overflow: hidden;
	}
	
	.card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 4rpx;
		background: linear-gradient(90deg, #667eea, #764ba2);
		transform: scaleX(0);
		transition: transform 0.3s ease;
	}

	.card:hover {
		transform: translateY(-8rpx) scale(1.02);
		box-shadow: 0 20rpx 40rpx rgba(0, 0, 0, 0.12);
	}
	
	.card:hover::before {
		transform: scaleX(1);
	}
	
	.card:active {
		transform: translateY(-4rpx) scale(1.01);
	}

	/* 图标容器 */
	.icon-container {
		width: 80rpx;
		height: 80rpx;
		border-radius: 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 24rpx;
		transition: all 0.3s ease;
		font-size: 40rpx;
	}
	
	.icon-image {
		width: 100%;
		height: 100%;
		border-radius: 20rpx;
	}

	/* 图标容器背景色 */
	.bg-blue-100 { background: linear-gradient(135deg, #dbeafe, #bfdbfe); }
	.bg-green-100 { background: linear-gradient(135deg, #dcfce7, #bbf7d0); }
	.bg-purple-100 { background: linear-gradient(135deg, #ede9fe, #ddd6fe); }
	.bg-orange-100 { background: linear-gradient(135deg, #ffedd5, #fed7aa); }
	.bg-red-100 { background: linear-gradient(135deg, #fee2e2, #fecaca); }
	.bg-teal-100 { background: linear-gradient(135deg, #ccfbf1, #99f6e4); }
	.bg-indigo-100 { background: linear-gradient(135deg, #e0e7ff, #c7d2fe); }
	.bg-pink-100 { background: linear-gradient(135deg, #fce7f3, #fbcfe8); }
	
	.card:hover .icon-container {
		transform: scale(1.1) rotate(5deg);
		box-shadow: 0 8rpx 25rpx rgba(0, 0, 0, 0.15);
	}

	/* 卡片文本 */
	.card-title {
		display: block;
		font-size: 36rpx;
		font-weight: 600;
		color: #2d3748;
		margin-bottom: 12rpx;
		line-height: 1.3;
	}

	.card-subtitle {
		color: #718096;
		font-size: 26rpx;
		line-height: 1.5;
		opacity: 0.9;
	}

	/* 联系方式区域样式 */
	.contact-section {
		width: 100%;
		padding: 40rpx 30rpx;
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(20rpx);
	}
	
	.contact-card {
		max-width: 600rpx;
		margin: 0 auto;
		background: linear-gradient(135deg, #667eea, #764ba2);
		border-radius: 20rpx;
		padding: 32rpx;
		text-align: center;
		box-shadow: 0 8rpx 32rpx rgba(102, 126, 234, 0.3);
		position: relative;
		overflow: hidden;
	}
	
	.contact-card::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(45deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
		pointer-events: none;
	}
	
	.contact-title {
		font-size: 32rpx;
		font-weight: 600;
		color: white;
		display: block;
		margin-bottom: 12rpx;
		position: relative;
		z-index: 1;
	}
	
	.contact-subtitle {
		font-size: 26rpx;
		color: rgba(255, 255, 255, 0.9);
		display: block;
		margin-bottom: 20rpx;
		position: relative;
		z-index: 1;
	}
	
	.contact-info {
		display: flex;
		flex-direction: column;
		gap: 8rpx;
		position: relative;
		z-index: 1;
	}
	
	.contact-item {
		font-size: 28rpx;
		color: #FFE4B5;
		font-weight: 500;
		letter-spacing: 1rpx;
		background: rgba(255, 255, 255, 0.15);
		padding: 12rpx 20rpx;
		border-radius: 12rpx;
		backdrop-filter: blur(10rpx);
		border: 1px solid rgba(255, 255, 255, 0.2);
		cursor: pointer;
		transition: all 0.3s ease;
	}
	
	.contact-item:active {
		background: rgba(255, 255, 255, 0.25);
		transform: scale(0.98);
	}

	/* 底部区域样式 */
	.footer-section {
		width: 100%;
		padding: 40rpx;
		text-align: center;
		background: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10rpx);
	}
	
	.footer-text {
		font-size: 24rpx;
		color: rgba(255, 255, 255, 0.8);
		line-height: 1.5;
	}
	
	/* 文字颜色类 */
	.text-blue-600 { color: #2563eb; }
	.text-green-600 { color: #059669; }
	.text-purple-600 { color: #7c3aed; }
	.text-orange-600 { color: #ea580c; }
	.text-red-600 { color: #dc2626; }
	.text-teal-600 { color: #0d9488; }
	.text-indigo-600 { color: #4f46e5; }
	.text-pink-600 { color: #db2777; }
</style>