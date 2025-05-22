<template>
	<view class="container">
		<!-- 按钮区域 -->
		<view class="btn-box">
			<button class="btn" @click="goToChat">企业聊天</button>
			<button class="btn" @click="goToWxChat">微信聊天</button>
			<button class="btn" @click="goToWxChatGroup">微信群聊</button>
			<button class="btn" @click="goToRecords">企业转账记录</button>
			<button class="btn" @click="goToWxChatPay">微信支付记录</button>
		</view>
		<ProfileEditPopup ref="filePopup" @submit="onSubmit"></ProfileEditPopup>
		<ProfileEditPopup ref="wxChatPopup" @submit="onSubmitWx"></ProfileEditPopup> 
		<ProfileEditPopup ref="wxChatGroupPopup" @submit="onSubmitWxGroup"></ProfileEditPopup>
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
	export default {
		components: {
			ProfileEditPopup
		},
		data() {
			return {
				guestInfo: {},

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
			this.getUserInfo(userId)
		},
		methods: {

			async getUserInfo(userId) {
				const res = await getUserInfo(userId)
				this.guestInfo = res.data
				console.log(res);
			},

			goToChat() {
				if (this.guestInfo.tryCount == 0) {
					if (isMemberExpired(this.guestInfo)) {
						// 试用次数用完后开始需要充值会员
						uni.showToast({
							title: '使用次数已用完请充值会员',
							icon: 'none'
						});
						return
					}
				}
				this.$refs.filePopup.open()

			},
			goToWxChat(){
				if (this.guestInfo.tryCount == 0) {
					if (isMemberExpired(this.guestInfo)) {
						// 试用次数用完后开始需要充值会员
						uni.showToast({
							title: '使用次数已用完请充值会员',
							icon: 'none'
						});
						return
					}
				}
				this.$refs.wxChatPopup.open()
			},
			goToWxChatGroup(){
				if (this.guestInfo.tryCount == 0) {
					if (isMemberExpired(this.guestInfo)) {
						// 试用次数用完后开始需要充值会员
						uni.showToast({
							title: '使用次数已用完请充值会员',
							icon: 'none'
						});
						return
					}
				}
				this.$refs.wxChatGroupPopup.open()
			},
			onSubmitWxGroup(data){
				updateUseFeature(this.guestInfo.id)
				uni.navigateTo({
					url: '/pages/wxChatGroup/wxChatGroup?guestInfo=' + encodeURIComponent(JSON.stringify(data))
				});
			},
			onSubmitWx(data) {
				updateUseFeature(this.guestInfo.id)
				uni.navigateTo({
					url: '/pages/wxChat/wxChat?guestInfo=' + encodeURIComponent(JSON.stringify(data))
				});
			},
			onSubmit(data) {
				updateUseFeature(this.guestInfo.id)
				uni.navigateTo({
					url: '/pages/chat/chat?guestInfo=' + encodeURIComponent(JSON.stringify(data))
				});
			},
			// 跳转到转账记录页面
			goToRecords() {
				if (this.guestInfo.tryCount == 0) {
					console.log(isMemberExpired(this.guestInfo));
					if (isMemberExpired(this.guestInfo)) {
						// 试用次数用完后开始需要充值会员
						uni.showToast({
							title: '使用次数已用完请充值会员',
							icon: 'none'
						});
						return
					}
				}
				// 减少使用次数
				updateUseFeature(this.guestInfo.id)
				uni.navigateTo({
					url: '/pages/records/records'
				});
			},
			goToWxChatPay() {

				if (this.guestInfo.tryCount == 0) {
					console.log(isMemberExpired(this.guestInfo));
					if (isMemberExpired(this.guestInfo)) {
						// 试用次数用完后开始需要充值会员
						uni.showToast({
							title: '使用次数已用完请充值会员',
							icon: 'none'
						});
						return
					}
				}
				// 减少使用次数
				updateUseFeature(this.guestInfo.id)

				uni.navigateTo({
					url: '/pages/weChatPay/weChatPay'
				});
			},
		}
	};
</script>

<style>
	/* 页面布局样式 */
	.container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
		flex-direction: column;
		background-color: #f5f5f5;
	}

	/* 按钮区域 */
	.btn-box {
		width: 80%;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200rpx, 1fr));
		gap: 20rpx;
		margin-top: 40rpx;
	    
	}

	.btn {
		min-width: 240rpx;
		padding: 12px;
		background-color: #007AFF;
		color: #fff;
		border-radius: 5px;
		text-align: center;
	}
</style>