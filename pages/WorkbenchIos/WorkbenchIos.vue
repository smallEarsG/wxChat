<template>
	<view class="container">
		<WatermarkLayer />
		<view class="head" :style="{ paddingTop: statusBarHeight + 'px' }">
			<image src="/static/conelse/head_ios.png" mode="widthFix"></image>
		</view>
		<view class="content"   style="margin-top: -8rpx;">
			<!-- 工作台内容 -->
			<view class="workbench-banner">
				<image src="/static/conelse/a1_ios.png" mode="widthFix" style="margin-top: -4rpx;"></image>
				<button class="enterprise-info-entry" aria-label="企业信息" hover-class="none" @click.stop="goToEnterpriseInfo"></button>
			</view>
			<view style="position: relative;" role="button" aria-label="联系客户" @click="goToCurData">
				<view class="t_content">
					<view class="txt t1" :style="getWorkbenchTextStyle()">{{workbenchData.t1}}</view>
					<view class="txt t2" :style="getWorkbenchTextStyle()">{{workbenchData.t2}}</view>
					<view class="txt t3" :style="getWorkbenchTextStyle()"><text class="moneyIcon">￥</text>{{workbenchData.t3}}</view>
				</view>
				<image src="/static/conelse/ios_a2.png" mode="widthFix"></image>
			</view>
			<image src="/static/conelse/ios_a3.png" mode="widthFix" style="margin-top: 2rpx;"></image>
			<image src="/static/conelse/aa_ios.png" mode="widthFix" style="margin-top: -4rpx;"></image>
			<image src="/static/conelse/ios_a4.png" mode="widthFix"></image>
			<!-- <image src="/static/conelse/a6.png" mode="widthFix" style="margin-top: -20rpx;"></image> -->
			<image src="/static/conelse/a6_ios.png" mode="widthFix"  style="margin-top: -10rpx;"></image>
			
		</view>
		<view class="footer_btn">
			<view class="foot_item" @click="goToChatList">
				<view class="totalIndex" v-if="totalChatIndex>0" :class="totalChatIndex>99 ? 'more_red':''">
					{{totalChatIndex>99?'99+':totalChatIndex}}
				</view>
				<image class="qwMsgIcon" src="/static/qiw/qwMsgIcon.png"></image>
				<view class="btn_txt">
					消息
				</view>
			</view>
			<view class="foot_item">
				<view class="totalIndex" v-if="emailIndexMsg>0" :class="emailIndexMsg>99 ? 'more_red':''">
					{{emailIndexMsg>99?'99+':emailIndexMsg}}
				</view>
				<image class="qw_email" src="/static/qiw/qw_email.png"></image>
				<view class="btn_txt">
					邮件
				</view>
			</view>
			<view class="foot_item">
				<view class="totalIndex" v-if="wordIndexMsg>0" :class="wordIndexMsg>99 ? 'more_red':''">
					{{wordIndexMsg>99?'99+':wordIndexMsg}}
				</view>
				<image class="qw_word" src="/static/qiw/qw_word.png"></image>
				<view class="btn_txt">
					文档
				</view>
			</view>
			<view class="foot_item">
				<image class="qw_con" src="/static/qiw/qw_con_action.png"></image>
				<view class="btn_txt" style="color: #267ef0;">
					工作台
				</view>
			</view>
			<view class="foot_item">
				<view class="totalIndex" v-if="addIndexMsg>0" :class="addIndexMsg>99 ? 'more_red':''">
					{{addIndexMsg>99?'99+':addIndexMsg}}
				</view>
				<image class="qx_tonxun" src="/static/qiw/qx_tonxun.png"></image>
				<view class="btn_txt">
					通讯录
				</view>
			</view>
		</view>
		<WorkbenchEditPopup ref="workbenchPopup" :value="workbenchData" :fieldLabels="workbenchLabels" @submit="onWorkbenchSubmit" />
	</view>
</template>

<script>
	import WorkbenchEditPopup from '@/components/WorkbenchEditPopup/WorkbenchEditPopup.vue'
	import { CUSTOMER_STATS_EVENT, getCustomerStats, saveCustomerStats } from '@/utils/customerOverview.js'
	
	export default {
		components: {
			WorkbenchEditPopup
		},
		data() {
			return {
				totalChatIndex: 0,
				emailIndexMsg: 0,
				wordIndexMsg: 0,
				addIndexMsg: 0,
				statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
				workbenchData: {
					t1: '1',
					t2: '0',
					t3: '0.00',
					fontWeight: 500,
					fontSize: 48
				},
				workbenchLabels: {
					t1: '客户总数',
					t2: '今日新增客户数',
					t3: '今日收款',
					fontSize: '字体大小'
				}
			}
		},
		onLoad() {
			uni.$on(CUSTOMER_STATS_EVENT, this.applyCustomerStats)
			this.loadFooterData()
			this.loadWorkbenchData()
		},
		onShow() {
			// 每次显示时重新加载数据
			this.loadFooterData()
			this.loadWorkbenchData()
		},
		onUnload() {
			uni.$off(CUSTOMER_STATS_EVENT, this.applyCustomerStats)
		},
		methods: {
			goToCurData() {
				uni.navigateTo({
					url: '/pages/CurData/CurData',
					fail: () => {
						uni.showToast({ title: '跳转失败', icon: 'none' });
					}
				});
			},
			goToEnterpriseInfo() {
				uni.navigateTo({
					url: '/pages/enterpriseInfoVerified/enterpriseInfoVerified',
					fail: () => {
						uni.showToast({
							title: '跳转失败',
							icon: 'none'
						});
					}
				});
			},
			// 从 storage 加载底部按钮数据
			loadFooterData() {
				const footerData = uni.getStorageSync('footerData')
				if (footerData) {
					this.totalChatIndex = footerData.totalChatIndex || 0
					this.emailIndexMsg = footerData.emailIndexMsg || 0
					this.wordIndexMsg = footerData.wordIndexMsg || 0
					this.addIndexMsg = footerData.addIndexMsg || 0
				}
			},
			// 跳转到消息列表页面
			goToChatList() {
				uni.navigateTo({
					url: '/pages/chatList/chatList',
					success: () => {
						console.log('跳转到消息列表成功');
					},
					fail: (err) => {
						console.error('跳转到消息列表失败:', err);
						uni.showToast({
							title: '跳转失败',
							icon: 'none'
						});
					}
				});
			},
			// 打开编辑弹框
			openEditPopup() {
				if (this.$refs.workbenchPopup) {
					this.$refs.workbenchPopup.open();
				}
			},
			normalizeFontWeight(value) {
				const numericValue = Number(value);
				if (isNaN(numericValue)) {
					return 600;
				}
				const safeValue = Math.min(900, Math.max(100, numericValue));
				return Math.round(safeValue / 100) * 100;
			},
			normalizeFontSize(value) {
				const numericValue = Number(value);
				if (isNaN(numericValue)) {
					return 48;
				}
				return Math.min(100, Math.max(24, numericValue));
			},
			getWorkbenchTextStyle() {
				return {
					fontWeight: this.normalizeFontWeight(this.workbenchData.fontWeight),
					fontSize: this.workbenchData.fontSize + 'rpx'
				};
			},
			// 从 storage 加载工作台数据
			loadWorkbenchData() {
				let savedData = {};
				try {
					const saved = uni.getStorageSync('workbenchData');
					if (saved && typeof saved === 'object' && !Array.isArray(saved)) savedData = saved;
				} catch (error) {}
				this.workbenchData = {
					...this.workbenchData,
					fontWeight: this.normalizeFontWeight(savedData.fontWeight || savedData.t1FontWeight || savedData.t2FontWeight || savedData.t3FontWeight || this.workbenchData.fontWeight),
					fontSize: this.normalizeFontSize(savedData.fontSize || this.workbenchData.fontSize)
				};
				this.applyCustomerStats(getCustomerStats());
			},
			applyCustomerStats(stats) {
				this.workbenchData = {
					...this.workbenchData,
					t1: String(stats.totalCustomers),
					t2: String(stats.todayNewCustomers),
					t3: stats.todayIncome
				};
			},
			// 保存工作台数据到 storage
			saveWorkbenchData(data = this.workbenchData) {
				const stats = saveCustomerStats({ totalCustomers: data.t1, todayNewCustomers: data.t2, todayIncome: data.t3 });
				const saved = { ...data, t1: String(stats.totalCustomers), t2: String(stats.todayNewCustomers), t3: stats.todayIncome };
				uni.setStorageSync('workbenchData', saved);
				return saved;
			},
			// 工作台数据提交
			onWorkbenchSubmit(data) {
				console.log('工作台数据提交:', data);
				const next = {
					t1: data.t1,
					t2: data.t2,
					t3: data.t3,
					fontWeight: this.normalizeFontWeight(data.fontWeight),
					fontSize: this.normalizeFontSize(data.fontSize)
				};
				try {
					this.workbenchData = this.saveWorkbenchData(next);
				} catch (error) {
					this.loadWorkbenchData();
					uni.showToast({ title: '保存失败，请重试', icon: 'none' });
					return;
				}
				uni.showToast({
					title: '保存成功',
					icon: 'success'
				});
			}
		}
	}
</script>

<style scoped>
	.workbench-banner {
		position: relative;
	}
	/* 点击区域按图片比例定位，覆盖“管理企业”的图标和文字。 */
	.enterprise-info-entry {
		position: absolute;
		left: 3%;
		top: 18%;
		width: 24%;
		height: 37%;
		margin: 0;
		padding: 0;
		border: 0;
		border-radius: 0;
		background: transparent;
		z-index: 1;
	}
	.enterprise-info-entry::after {
		border: 0;
	}
	.t_content{
		position: absolute;
		top: 140rpx;
		width: 100%;
		/* background-color: #ee4c25; */
		z-index: 1;
		display: flex;
		justify-content: space-between;
		padding: 0 56rpx;
		box-sizing: border-box;
	}
	/* .t1{
		
		left: 108rpx;
	}
	.t2{
		left: 334rpx;
	}
	.t3{
		right: 43rpx;
	} */
	.t3{
		position: relative;
		
	}
	.moneyIcon{
		position: relative;
		top:10rpx
	}
	.txt{
		min-width: 180rpx;
		text-align: center;
		background-color:#fff;
		color: #0d0d0d;
		/* color: red; */
		font-size: 48rpx;
		
		font-family:'WeChat Sans Std' ;
		font-weight: 500;
	}
	.head{
		background-color: #dbe9ff;
	}
	image{
		width: 100%;
	}
	.container {
		width: 100%;
		/* min-height: 100vh; */
		background-color: #edf0f5;
		/* position: relative; */
		padding-bottom: 122rpx; /* 为底部按钮留出空间 */
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		flex-direction: column;
	}

	.content{
		flex: 1;
		overflow: auto;
		width: 100%;
	}
	.footer_btn {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 122rpx;
		background-color: #fafbfd;
		display: flex;
		color: #53585c;
		z-index: 2;
		padding-bottom: env(safe-area-inset-bottom); /* 防止内容被挡，但背景照样铺到底 */
	}

	.foot_item {
		position: relative;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		flex: 1;
		align-items: center;
		justify-content: center;
		font-size: 22rpx;
		margin-top: 10rpx;
	}

	.qwMsgIcon {
		height: 48rpx;
		width: 48rpx;
		margin-bottom: 10rpx;
	}

	.qw_email {
		height: 48rpx;
		width: 48rpx;
		margin-bottom: 10rpx;
	}

	.qw_word {
		height: 48rpx;
		width: 48rpx;
		margin-bottom: 10rpx;
	}

	.qw_con {
		height: 48rpx;
		width: 48rpx;
		margin-bottom: 10rpx;
	}

	.qx_tonxun {
		height: 48rpx;
		width: 48rpx;
	}

	.totalIndex {
		position: absolute;
		background-color: #ee4c25;
		z-index: 1;
		right: 30rpx;
		top: 8rpx;
		color: #fffffd;
		font-size: 20rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 36rpx;
		width: 36rpx;
		overflow: hidden;
		border-radius: 50%;
	}

	.more_red {
		width: 50rpx !important;
		border-radius: 20rpx !important;
	}

	.btn_txt {
		font-size: 22rpx;
		color: #53585c;
	}
</style>
