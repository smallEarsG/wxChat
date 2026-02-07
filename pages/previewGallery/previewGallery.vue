<template>
	<view class="gallery-container">
		<!-- 顶部导航 -->
		<view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-bar">
				<view class="back-btn" @click="goBack">
					<uni-icons type="left" size="24" color="#333" />
				</view>
				<text class="page-title">模板预览</text>
				<view class="back-btn placeholder"></view>
			</view>
		</view>
		<!-- 提示信息 -->
		<view class="tips-wrapper">
			<uni-icons type="info" size="16" color="#ff9900"></uni-icons>
			<text class="tips-text">不需要的字段删除则隐藏</text>
		</view>
		<!-- 轮播预览区域 -->
		<view class="swiper-container">
			<swiper 
				class="preview-swiper" 
				:indicator-dots="true" 
				:autoplay="false" 
				:circular="false" 
				previous-margin="60rpx" 
				next-margin="60rpx"
				@change="onSwiperChange"
			>
				<swiper-item v-for="(item, index) in items" :key="index">
					<view class="swiper-item-content" :class="{'active': currentIndex === index}">
						<view class="card-inner">
							<template v-if="item.id === 0">
								<!-- 转账付款预览 -->
								<view class="preview-component-wrapper">
									<TransferBill :info="mockInfo[0]" :previewMode="true" />
									<view class="component-overlay"></view>
								</view>
							</template>
							<template v-else-if="item.id === 1">
								<!-- 扫码收款预览 -->
								<view class="preview-component-wrapper">
									<CodePayChildBill :info="mockInfo[1]" :previewMode="true" />
									<view class="component-overlay"></view>
								</view>
							</template>
							<template v-else-if="item.id === 2">
								<!-- 第三方付款预览 -->
								<view class="preview-component-wrapper">
									<ThirdpartyPaymentBill :info="mockInfo[2]" :previewMode="true" />
									<view class="component-overlay"></view>
								</view>
							</template>
							<template v-else-if="item.id === 3">
								<!-- 第三方小程序预览 -->
								<view class="preview-component-wrapper">
									<MiniThirdpartyPaymentBill :info="mockInfo[3]" :previewMode="true" />
									<view class="component-overlay"></view>
								</view>
							</template>
							<template v-else-if="item.id === 4">
								<!-- 第三方条形码(16位)预览 -->
								<view class="preview-component-wrapper">
									<BarcodeThirdpartyPaymentBill :info="mockInfo[4]" :previewMode="true" />
									<view class="component-overlay"></view>
								</view>
							</template>
							<template v-else-if="item.id === 5">
								<!-- 第三方条形码(32位)预览 -->
								<view class="preview-component-wrapper">
									<BarcodeThirdpartyPayment32Bill :info="mockInfo[5]" :previewMode="true" />
									<view class="component-overlay"></view>
								</view>
							</template>
							<template v-else-if="item.id === 6">
								<!-- 扫码付款预览 -->
								<view class="preview-component-wrapper">
									<CodePayChild2Bill :info="mockInfo[6]" :previewMode="true" />
									<view class="component-overlay"></view>
								</view>
							</template>
							<template v-else-if="item.id === 7">
								<!-- 第三方条形码(34位)预览 -->
								<view class="preview-component-wrapper">
									<BarcodeThirdpartyPayment34Bill :info="mockInfo[7]" :previewMode="true" />
									<view class="component-overlay"></view>
								</view>
							</template>
							<template v-else-if="item.id === 8">
								<!-- 小程序+条形码预览 -->
								<view class="preview-component-wrapper">
									<MiniThirdpartyPaymentCodeBill :info="mockInfo[8]" :previewMode="true" />
									<view class="component-overlay"></view>
								</view>
							</template>
							<template v-else-if="item.id === 9">
								<!-- 第三方商家预览 -->
								<view class="preview-component-wrapper">
									<ThirdpartyMerchantBill :info="mockInfo[9]" :previewMode="true" />
									<view class="component-overlay"></view>
								</view>
							</template>
							<template v-else>
								<view class="icon-wrapper" :style="{background: item.color}">
									<uni-icons :type="item.icon" size="50" color="#fff" />
								</view>
								<text class="item-title">{{ item.title }}</text>
								<text class="item-desc">{{ item.desc }}</text>
								<view class="preview-placeholder">
									<text>此处为{{ item.title }}预览图</text>
								</view>
							</template>
						</view>
					</view>
				</swiper-item>
			</swiper>
		</view>

		

		<!-- 底部操作区域 -->
		<view class="footer-action">
			<view class="current-info">
				<text class="info-title">{{ currentItem.title }}</text>
				<text class="info-desc">{{ currentItem.detail }}</text>
			</view>
			
			<button class="confirm-btn" @click="handleConfirm">
				<text>去制作</text>
				<uni-icons type="arrowright" size="20" color="#fff" style="margin-left: 10rpx;" />
			</button>
		</view>
	</view>
</template>

<script>
	import TransferBill from '@/components/bill-preview/TransferBill.vue'
	import CodePayChildBill from '@/components/bill-preview/CodePayChildBill.vue'
	import ThirdpartyPaymentBill from '@/components/bill-preview/ThirdpartyPaymentBill.vue'
	import MiniThirdpartyPaymentBill from '@/components/bill-preview/MiniThirdpartyPaymentBill.vue'
	import BarcodeThirdpartyPaymentBill from '@/components/bill-preview/BarcodeThirdpartyPaymentBill.vue'
	import BarcodeThirdpartyPayment32Bill from '@/components/bill-preview/BarcodeThirdpartyPayment32Bill.vue'
	import CodePayChild2Bill from '@/components/bill-preview/CodePayChild2Bill.vue'
	import BarcodeThirdpartyPayment34Bill from '@/components/bill-preview/BarcodeThirdpartyPayment34Bill.vue'
	import MiniThirdpartyPaymentCodeBill from '@/components/bill-preview/MiniThirdpartyPaymentCodeBill.vue'
	import ThirdpartyMerchantBill from '@/components/bill-preview/ThirdpartyMerchantBill.vue'

	export default {
		components: {
			TransferBill,
			CodePayChildBill,
			ThirdpartyPaymentBill,
			MiniThirdpartyPaymentBill,
			BarcodeThirdpartyPaymentBill,
			BarcodeThirdpartyPayment32Bill,
			CodePayChild2Bill,
			BarcodeThirdpartyPayment34Bill,
			MiniThirdpartyPaymentCodeBill,
			ThirdpartyMerchantBill
		},
		data() {
			return {
				statusBarHeight: 0,
				currentIndex: 0,
				mockInfo: {
					0: {
						"url": "",
						"name": "张三",
						"money": "-100.00",
						"time": "2025年6月13日 16:19:30",
						"orderNumber": "1000050001202506130129831495334",
						"otherTime": "2025年6月13日 16:20:17",
						"payment": "零钱通",
						"currentState": "对方已收钱",
						"desc": "转账时间",
						"message":"留言为空则隐藏",
						"padd":60,
						"order":false,
						"fontSize":100
					},
					1: {
						"url": "",
						"name": "转给G",
						"money": "-0.01",
						"time": "2025年6月13日 16:19:30",
						"orderNumber": "1000050001202506130129831495334",
						"otherTime": "2025年6月13日 16:20:17",
						"payment": "零钱通",
						"currentState": "对方已收钱",
						"desc": "转账时间",
						"padd":60,
						"order":false,
						"fontSize":100
					},
					2: {
						"url": "",
						"name": "给为理想而奋斗",
						"money": "-0.01",
						"time": "2025年6月13日 16:19:30",
						"orderNumber": "1000050001202506130129831495334",
						"otherTime": "2025年6月13日 16:20:17",
						"payment": "零钱通",
						"currentState": "对方已收款",
						"desc": "由互联网清算有限公司提供付款清算服务",
						"shop": '商品',
						"merchantName": '商户名称',
						"institution": '收款机构',
						"shopNumber": ' 商户单号',
						"desc2": "由互联网清算有限公司提供付款清算服务",
						"BoNumber":"",
						"padd":60,
						"order":false,
						"fontSize":100,
						"showService": true
					},
					3: {
						"url": "",
						"name": "给为理想而奋斗",
						"money": "-0.01",
						"time": "2025年6月13日 16:19:30",
						"orderNumber": "1000050001202506130129831495334",
						"otherTime": "2025年6月13日 16:20:17",
						"payment": "零钱通",
						"currentState": "对方已收款",
						"desc": "由互联网清算有限公司提供付款清算服务",
						"shop": '商品',
						"merchantName": '商户名称',
						"institution": '收款机构',
						"shopNumber": ' 商户单号',
						"desc2": "由互联网清算有限公司提供付款清算服务",
						"miniName":"小七商行收款",
						"padd":60,
						"order":false,
						"fontSize":100,
						"showService": true
					},
					4: {
						"url": "",
						"name": "给为理想而奋斗",
						"money": "-0.01",
						"time": "2025年6月13日 16:19:30",
						"orderNumber": "1000050001202506130129831495334",
						"otherTime": "2025年6月13日 16:20:17",
						"payment": "零钱通",
						"currentState": "对方已收款",
						"desc": "由互联网清算有限公司提供付款清算服务",
						"shop": '商品',
						"merchantName": '商户名称',
						"institution": '收款机构',
						"shopNumber": ' 7895004260588973',
						"desc2": "由互联网清算有限公司提供付款清算服务",
						"payDesc":'支付说明',
						"padd":60,
						"order":false,
						"fontSize":100,
						"showService": true
					},
					5: {
						"url": "",
						"name": "给为理想而奋斗",
						"money": "-0.01",
						"time": "2025年6月13日 16:19:30",
						"orderNumber": "1000050001202506130129831495334",
						"otherTime": "2025年6月13日 16:20:17",
						"payment": "分期",
						"currentState": "对方已收款",
						"desc": "由互联网清算有限公司提供付款清算服务",
						"shop": '商品',
						"merchantName": '商户名称',
						"institution": '收款机构',
						"shopNumber": ' 002225062015305809035155',
						"desc2": "由互联网清算有限公司提供付款清算服务",
						"payDesc":'支付说明',
						"padd":60,
						"order":false,
						"fontSize":100,
						"showService": true
					},
					6: {
						"url": "",
						"name": "转给G",
						"money": "-0.01",
						"time": "2025年6月13日 16:19:30",
						"orderNumber": "1000050001202506130129831495334",
						"otherTime": "2025年6月13日 16:20:17",
						"payment": "零钱通",
						"message":"",
						"currentState": "对方已收钱",
						"desc": "转账时间",
						"padd":60,
						"fontSize":100,
						"showService": true
					},
					7: {
						"url": "",
						"name": "给为理想而奋斗",
						"money": "-0.01",
						"time": "2025年6月13日 16:19:30",
						"orderNumber": "1000050001202506130129831495334",
						"otherTime": "2025年6月13日 16:20:17",
						"payment": "分期",
						"currentState": "对方已收款",
						"desc": "由互联网清算有限公司提供付款清算服务",
						"shop": '商品',
						"merchantName": '商户名称',
						"institution": '中国农业银行股份有限公司内蒙古自治区分行',
						"shopNumber": '20250621110113130166201789980574',
						"desc2": "由互联网清算有限公司提供付款清算服务",
						"padd":60,
						"order":false,
						"fontSize":100
					},
					8: {
						"url": "",
						"name": "给为理想而奋斗",
						"money": "-0.01",
						"time": "2025年6月13日 16:19:30",
						"orderNumber": "1000050001202506130129831495334",
						"otherTime": "2025年6月13日 16:20:17",
						"payment": "零钱通",
						"currentState": "对方已收款",
						"desc": "由互联网清算有限公司提供付款清算服务",
						"shop": '商品',
						"merchantName": '商户名称',
						"institution": '收款机构',
						"shopNumber": ' RBKKA803344066075287552',
						"desc2": "由互联网清算有限公司提供付款清算服务",
						"miniName":"小七商行收款",
						"padd":60,
						"order":false,
						"fontSize":100
					},
					9: {
						"url": "",
						"name": "给为理想而奋斗",
						"money": "-0.01",
						"time": "2025年6月13日 16:19:30",
						"orderNumber": "1000050001202506130129831495334",
						"otherTime": "2025年6月13日 16:20:17",
						"payment": "零钱通",
						"currentState": "对方已收款",
						"desc": "由互联网清算有限公司提供付款清算服务",
						"shop": '商品',
						"merchantName": '商户名称',
						"institution": '收款机构',
						"shopNumber": ' 商户单号',
						"desc2": "由互联网清算有限公司提供付款清算服务",
						"BoNumber":"",
						"padd":60,
						"order":false,
						"fontSize":100,
						"showService": true
					}
				},
				items: [
					{
						id: 0,
						title: '转账付款',
						desc: '微信转账界面',
						detail: '模拟微信好友之间的转账记录界面',
						icon: 'moneybag',
						color: '#4A90E2',
						route: '/pages/transfer/transfer'
					},
					{
						id: 1,
						title: '扫码收款',
						desc: '个人收款码',
						detail: '模拟微信个人收款码收款界面',
						icon: 'scan',
						color: '#50C878',
						route: '/pages/codePayChild/codePayChild'
					},
					{
						id: 2,
						title: '第三方付款',
						desc: '第三方支付',
						detail: '模拟第三方平台唤起微信支付界面',
						icon: 'shop',
						color: '#FF9500',
						route: '/pages/ThirdpartyPayment/ThirdpartyPayment'
					},
					{
						id: 3,
						title: '第三方小程序',
						desc: '小程序支付',
						detail: '模拟小程序内的支付界面',
						icon: 'smallcircle',
						color: '#9B59B6',
						route: '/pages/miniThirdpartyPayment/miniThirdpartyPayment'
					},
					{
						id: 4,
						title: '第三方条形码(16位)',
						desc: '条形码支付',
						detail: '模拟16位条形码的支付界面',
						icon: 'bars',
						color: '#34495E',
						route: '/pages/barcodeThirdpartyPayment/barcodeThirdpartyPayment'
					},
					{
						id: 5,
						title: '第三方条形码(32位)',
						desc: '长条形码支付',
						detail: '模拟32位长条形码的支付界面',
						icon: 'bars',
						color: '#2C3E50',
						route: '/pages/barcodeThirdpartyPayment32/barcodeThirdpartyPayment32'
					},
					{
						id: 6,
						title: '扫码付款',
						desc: '扫码支付',
						detail: '模拟扫描二维码付款的界面',
						icon: 'scan',
						color: '#1ABC9C',
						route: '/pages/codePayChild2/codePayChild2'
					},
					{
						id: 7,
						title: '第三方条形码(34位)',
						desc: '超长条形码',
						detail: '模拟34位超长条形码的支付界面',
						icon: 'bars',
						color: '#34495E',
						route: '/pages/barcodeThirdpartyPayment34/barcodeThirdpartyPayment34'
					},
					{
						id: 8,
						title: '小程序+条形码',
						desc: '混合支付',
						detail: '模拟小程序与条形码结合的支付界面',
						icon: 'compose',
						color: '#E74C3C',
						route: '/pages/miniThirdpartyPaymentCode/miniThirdpartyPaymentCode'
					},
					{
						id: 9,
						title: '第三方商家',
						desc: '商家支付',
						detail: '模拟第三方商家收款界面',
						icon: 'shop-filled',
						color: '#F39C12',
						route: '/pages/ThirdpartyMerchant/ThirdpartyMerchant'
					}
				]
			};
		},
		computed: {
			currentItem() {
				return this.items[this.currentIndex];
			}
		},
		onLoad() {
			const systemInfo = uni.getSystemInfoSync();
			this.statusBarHeight = systemInfo.statusBarHeight || 20;
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			onSwiperChange(e) {
				this.currentIndex = e.detail.current;
			},
			handleConfirm() {
				const item = this.currentItem;
				if (item && item.route) {
					uni.navigateTo({
						url: item.route
					});
				}
			}
		}
	}
</script>

<style scoped>
	.gallery-container {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
	}

	.header {
		background-color: rgba(255, 255, 255, 0.9);
		backdrop-filter: blur(10px);
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
		z-index: 100;
		position: sticky;
		top: 0;
	}

	.nav-bar {
		height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 20rpx;
	}

	.back-btn {
		width: 88rpx;
		height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
	}
	
	.back-btn:active {
		background-color: rgba(0, 0, 0, 0.05);
	}
	
	.placeholder {
		visibility: hidden;
	}

	.page-title {
		font-size: 34rpx;
		font-weight: 600;
		color: #333;
	}

	.swiper-container {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20rpx 0;
	}

	.preview-swiper {
		width: 100%;
		height: 100%;
	}

	.swiper-item-content {
		height: 100%;
		padding: 0 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
		transform: scale(0.9);
		opacity: 0.8;
	}

	.swiper-item-content.active {
		transform: scale(1);
		opacity: 1;
	}

	.card-inner {
		width: 100%;
		height: 88%;
		background-color: #fff;
		border-radius: 36rpx;
		box-shadow: 0 20rpx 50rpx rgba(0, 0, 0, 0.15);
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0;
		box-sizing: border-box;
		overflow: hidden;
		position: relative;
	}
	
	/* 组件预览容器 */
	.preview-component-wrapper {
		width: 153.85%;
		height: 153.85%;
		position: relative;
		overflow: hidden;
		transform: scale(0.65);
		transform-origin: center top;
		flex-shrink: 0;
	}
	
	.component-overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: transparent;
		z-index: 10;
	}
	
	/* 非组件预览时的样式 */
	.card-inner > .icon-wrapper {
		margin-top: 100rpx;
		width: 140rpx;
		height: 140rpx;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 40rpx;
		box-shadow: 0 15rpx 30rpx rgba(0, 0, 0, 0.1);
	}

	.item-title {
		font-size: 44rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 16rpx;
	}

	.item-desc {
		font-size: 28rpx;
		color: #888;
		margin-bottom: 60rpx;
		padding: 0 40rpx;
		text-align: center;
	}

	.preview-placeholder {
		width: 80%;
		height: 400rpx;
		background-color: #f8f9fa;
		border-radius: 24rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #ccc;
		font-size: 30rpx;
		border: 4rpx dashed #e0e0e0;
	}

	.tips-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		padding-bottom: 20rpx;
		opacity: 0.9;
	}

	.tips-text {
		font-size: 26rpx;
		color: #555;
		margin-left: 10rpx;
		font-weight: 500;
		letter-spacing: 1rpx;
		text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
	}

	.footer-action {
		background-color: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		padding: 30rpx 40rpx;
		padding-bottom: calc(30rpx + env(safe-area-inset-bottom));
		box-shadow: 0 -10rpx 30rpx rgba(0, 0, 0, 0.05);
		display: flex;
		align-items: center;
		justify-content: space-between;
		border-radius: 40rpx 40rpx 0 0;
	}

	.current-info {
		flex: 1;
		margin-right: 30rpx;
	}

	.info-title {
		display: block;
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		margin-bottom: 8rpx;
	}

	.info-desc {
		font-size: 26rpx;
		color: #666;
	}

	.confirm-btn {
		background: linear-gradient(135deg, #4A90E2, #007AFF);
		color: #fff;
		border-radius: 60rpx;
		padding: 0 50rpx;
		height: 100rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32rpx;
		font-weight: 500;
		box-shadow: 0 10rpx 25rpx rgba(74, 144, 226, 0.4);
		border: none;
		transition: all 0.3s;
	}

	.confirm-btn:active {
		transform: scale(0.96);
		box-shadow: 0 5rpx 15rpx rgba(74, 144, 226, 0.3);
	}
</style>
