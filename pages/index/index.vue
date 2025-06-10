<template>
    <view class="container">
        <!-- 顶部标题区域 -->
       

        <!-- 卡片式按钮区域 -->
        <view class="w-full max-w-4xl grid-container">
            <!-- 企业聊天 -->
            <view class="card" @click="goToChat">
                <view class="icon-container bg-blue-100">
                    <text class="text-blue-600 text-2xl font-bold">💬</text>
                </view>
                <text class="card-title">企业聊天</text>
                <text class="card-subtitle">快速生成企业自定义聊天记录</text>
            </view>

            <!-- 微信聊天 -->
            <view class="card" @click="goToWxChat">
                <view class="icon-container bg-green-100">
                    <text class="text-green-600 text-2xl font-bold">👥</text>
                </view>
                <text class="card-title">微信聊天</text>
                <text class="card-subtitle">快速生成微信自定义聊天记录</text>
            </view>

            <!-- 微信群聊 -->
            <view class="card" @click="goToWxChatGroup">
                <view class="icon-container bg-purple-100">
                    <text class="text-purple-600 text-2xl font-bold">👨‍👩‍👧‍👦</text>
                </view>
                <text class="card-title">微信群聊</text>
                <text class="card-subtitle">自定义群聊信息，恶搞专用</text>
            </view>

            <!-- 企业转账记录 -->
            <view class="card" @click="goToRecords">
                <view class="icon-container bg-orange-100">
                    <text class="text-orange-600 text-2xl font-bold">💸</text>
                </view>
                <text class="card-title">企业转账记录</text>
                <text class="card-subtitle">企业收款转账记录，快速建立信任背书</text>
            </view>

            <!-- 微信支付记录 -->
            <view class="card" @click="goToWxChatPay">
                <view class="icon-container bg-red-100">
                    <text class="text-red-600 text-2xl font-bold">💰</text>
                </view>
                <text class="card-title">微信支付记录</text>
                <text class="card-subtitle">快速生成微信支付交易历史截图，装逼利器</text>
            </view>

            <!-- 获客助手 -->
            <view class="card" @click="gotoGuset">
                <view class="icon-container bg-teal-100">
                    <text class="text-teal-600 text-2xl font-bold">🎯</text>
                </view>
                <text class="card-title">获客助手</text>
                <text class="card-subtitle">手动编辑获客数量，使用情况</text>
            </view>

            <!-- 付款记录 -->
            <view class="card" @click="gotoCodePay">
                <view class="icon-container bg-indigo-100">
                    <text class="text-indigo-600 text-2xl font-bold">📄</text>
                </view>
                <text class="card-title">微信付款记录</text>
                <text class="card-subtitle">快速扫描生成付款记录，自动录入订单号，以假乱真，自定义金额和时间</text>
            </view>
			<!-- 定制功能 -->
            <view class="card" >
                <view class="icon-container bg-pink-100">
                    <text class="text-pink-600 text-2xl font-bold">⚙️</text>
                </view>
                <text class="card-title">支持定制功能</text>
                <text class="card-subtitle">可通过个人主页联系管理员个性化定制您的应用功能 </text>
            </view>
        </view>
		<view class="w-full max-w-4xl mb-8">
		    <!-- <text class="title-text">功能管理中心 </text> -->
		    <text class="subtitle-text">免责声明，仅供娱乐，切莫违法</text>
		</view>
        <!-- 弹窗组件 -->
        <!-- <ProfileEditPopup ref="filePopup" @submit="onSubmit"></ProfileEditPopup> -->
     
        <pfePopup ref="wxChatGroupPopup" @submit="onSubmitWxGroup"></pfePopup>
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
			updateUseFeature(this.guestInfo.id)
			uni.navigateTo({
				url:'/pages/chatList/chatList'
			})
			
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
				updateUseFeature(this.guestInfo.id)
				uni.navigateTo({
					url:'/pages/wxChatList/wxChatList'
				})
				// this.$refs.wxChatPopup.open()
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
			
				updateUseFeature(this.guestInfo.id)
				uni.navigateTo({
					url: '/pages/wxChatGroup/wxChatGroup?guestInfo=' + encodeURIComponent(JSON.stringify(data))
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
			
			gotoGuset(){
				uni.navigateTo({
					url: '/pages/getGuset/getGuset'
				});
			},
			gotoCodePay(){
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
				updateUseFeature(this.guestInfo.id)
				uni.navigateTo({
					url: '/pages/codePay/codePay'
				});
			}
		}
	};
</script>

<style>
/* 基础样式 */
.container {
    background-color: #f9fafb;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding-top: 40rpx;
    padding-bottom: 100rpx;
    padding-left: 20rpx;
    padding-right: 20rpx;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

/* 文本样式 */
.title-text {
    font-size: clamp(75rpx, 3vw, 125rpx);
    font-weight: bold;
    color: #1f2937;
}

.subtitle-text {
    color: #6b7280;
    margin-top: 35rpx;
    display: block;
    font-size: 35rpx;
	margin-bottom: 35rpx;
}

/* 网格容器 */
.grid-container {
    width: 100%;
    max-width: 2000rpx;
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 30rpx;
}

/* 响应式设计 */
@media (min-width: 640rpx) {
    .grid-container {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (min-width: 1024rpx) {
    .grid-container {
        grid-template-columns: repeat(3, 1fr);
    }
}

/* 卡片样式 */
.card {
    background-color: white;
    border-radius: 30rpx;
    box-shadow: 0 10rpx 20rpx rgba(0, 0, 0, 0.05);
    padding: 30rpx;
    cursor: pointer;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.card:hover {
    transform: translateY(-10rpx);
    box-shadow: 0 20rpx 30rpx rgba(0, 0, 0, 0.1);
}

/* 图标容器 */
.icon-container {
    width: 70rpx;
    height: 70rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20rpx;
    transition: background-color 0.3s ease;
}

.card:hover .icon-container.bg-blue-100 {
    background-color: #dbeafe;
}

.card:hover .icon-container.bg-green-100 {
    background-color: #dcfce7;
}

.card:hover .icon-container.bg-purple-100 {
    background-color: #ede9fe;
}

.card:hover .icon-container.bg-orange-100 {
    background-color: #ffedd5;
}

.card:hover .icon-container.bg-red-100 {
    background-color: #fee2e2;
}

.card:hover .icon-container.bg-teal-100 {
    background-color: #ccfbf1;
}

.card:hover .icon-container.bg-indigo-100 {
    background-color: #e0e7ff;
}

.card:hover .icon-container.bg-pink-100 {
    background-color: #fce7f3;
}

/* 卡片文本 */
.card-title {
    display: block;
    font-size: 40rpx;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 10rpx;
}

.card-subtitle {
    color: #6b7280;
    font-size: 30rpx;
}

/* 按钮样式 */
.btn {
    background: linear-gradient(135deg, #007AFF 0%, #0051cc 100%);
    border: none;
    border-radius: 25rpx;
    padding: 25rpx;
    font-weight: 500;
    transition: all 0.2s ease;
    box-shadow: 0 20rpx 30rpx -5rpx rgba(0, 122, 255, 0.2);
    color: white;
    text-align: center;
}

.btn:hover {
    background: linear-gradient(135deg, #0066cc 0%, #004080 100%);
    box-shadow: 0 50rpx 75rpx -15rpx rgba(0, 122, 255, 0.3);
}
</style>    