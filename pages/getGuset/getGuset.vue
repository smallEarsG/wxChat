<template>
	<view class="customer-assistant">
		<view class="custom-header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="left" @click="goBack">
				<image class="backimg" src="../../static/left.png" />
			</view>
			<view class="title">获客助手</view>
			<view class="right">
				<uni-icons type="more-filled" size="25" style="color: aliceblue;" />
			</view>
		</view>
		<!-- 主体内容 -->
		<view class="main-warp">
			<view class="top-warp">
				<image class="transfer-icon" src="/static/transfer-icon.png"></image>
				<view>线上获客时，客户无需扫二维码，点击链接即可1步添加成员</view>
			</view>
			<view class="center-warp">
				<!-- 使用场景 -->
				<view class="usage-scenario">
					<h3 class="section-title">使用场景</h3>
					<view class="scenario-container">
						<!-- 网站卡片 -->
						<view class="website-card">
							<view class="website-url">yiwuan.com</view>
							<view style="background-color: #f2fcfe; padding-bottom: 12px ;">
								<view class="website-name">一 湾 产 品 官 网</view>
								<view class="primary-button">加好友咨询</view>
							</view>
							<view class="step " style="padding-top: 20rpx;">
								<image class="icon one-icon" src="/static/one-icon.png"></image>
								<text>各场景中点击链接</text>
							</view>
						</view>
						<!-- 微信用户 -->
						<view class="wechat-card">
							<view class="avatar-container" @click="editUser">
								<view class="">
									<image :src="user.avatar" class="avatar" />
								</view>
								<view class="user-info">
									<view class="name">{{user.nickname}}</view>
									<view class="description"><text class="desc">{{user.description}}</text></view>
								</view>
							</view>
							<view class="lineone"></view>
							<view class="linetwo"></view>
							<view class="success-button">添加到通讯录</view>
							<view class="step">
								<image class="icon yes-icon" src="/static/yes-icon.png"></image>
								<text>微信内添加好友</text>
							</view>
						</view>
					</view>

					<view class="acquisition-methods" style="margin-top: 160px;">
						<!-- 第一项 -->
						<view class="method-item">
							<view class="item-right">
								<image class="left-icon vx-icon" src="/static/vx-icon.png"></image>
								<text>从微信广告/视频号获客</text>
							</view>

							<image class="right-icon" src="/static/right-icon.png"></image>
						</view>
						<!-- 第二项 -->
						<view class="method-item">
							<view class="item-right">
								<image class="left-icon AD-icon" src="/static/AD-icon.png"></image>
								<text>从微信外短视频/搜索/内容平台获客</text>
							</view>

							<image class="right-icon" src="/static/right-icon.png"></image>
						</view>
						<!-- 第三项 -->
						<view class="method-item">
							<view class="item-right">
								<image class="left-icon more-icon" src="/static/more-icon.png"></image>
								<text>从公众号/企业App/官网/短信获客</text>
							</view>

							<image class="right-icon" src="/static/right-icon.png"></image>
						</view>
					</view>
				</view>
				<!-- 获客情况 -->
				<view class="usage-scenario">
					<view class="client-top">
						<view class="section-title">获客情况</view>
						<image src="/static/right-icon.png"></image>
					</view>
					<view class="client-main" @click="showClient">
						<view class="client-warp">
							<view class="num-text">{{clientInfo.NewAddToday}}</view>
							<view>今日新增客户</view>
						</view>
						<view class="client-warp">
							<view class="num-text">{{clientInfo.CumulativeNew}}</view>
							<view>累计新增客户</view>
						</view>
						<view class="client-warp">
							<view class="num-text">{{clientInfo.Remainder}}</view>
							<view class="text-bottom">
								剩余使用量
								<image src="/static/hit.png"></image>
							</view>
						</view>
					</view>
					<view class="client-bottom">
						<view>购买使用量</view>
						<view class="client-left">
							<image src="/static/buy.png"></image>
							前往购买
						</view>
					</view>
				</view>
				<!-- 获客链接 -->
				<view class="usage-scenario">
					<view class="client-top">
						<h3 class="section-title">获客情况</h3>
						<image src="/static/add-icon.png"></image>
					</view>
					<view class="add-warp">
						<image src="/static/link-icon.png"></image>
						<view>5.27外链</view>
					</view>
					<view class="all-warp">查看全部
						<view class="circle" />

						5<uni-icons type="right" size="13" color="#8c8c8c" style=" margin-left:-1px ;"></uni-icons>
					</view>
				</view>
				<!-- 更多功能 -->
				<view class="usage-scenario">
					<h3 class="section-title">更多功能</h3>

					<view class="acquisition-methods more-warp">
						<!-- 第一项 -->
						<view class="method-item">
							<view class="item-right">
								<image class="left-icon share-icon" src="/static/share-icon.png"></image>
								<text class="right_text">自动跳过成员异常账号</text>
							</view>
							<image class="right-icon" src="/static/right-icon.png"></image>
						</view>
						<view class="skip-warp">
							<view class="skip-item">
								今日跳过<text style="font-family: 'Bahnschrift', sans-serif;">0次</text>
							</view>
							<view class="skip-item">
								累计跳过<text style="font-family: 'Bahnschrift', sans-serif;">0次</text>
							</view>
						</view>
						<!-- 第二项 -->
						<view class="method-item">
							<view class="item-right">
								<image class="left-icon" src="/static/uploading-icon.png"></image>
								<text class="right_text">提升广告有效率</text>
							</view>

							<image class="right-icon" src="/static/right-icon.png"></image>
						</view>
						<!-- 第三项 -->
						<view class="method-item">
							<view class="item-right">
								<image class="left-icon" src="/static/api-icon.png"></image>
								<text class="right_text">通过API使用</text>
							</view>

							<image class="right-icon" src="/static/right-icon.png"></image>
						</view>
					</view>
				</view>
				<view class="footer-container">
					<view class="footer-link">使用指引</view>
				</view>
			</view>
		</view>
		<EditableFormPopup ref="orderPopup" :value="clientInfo" :fieldLabels="clientKey" @submit="onOrderSubmit" />
		<ProfileEditPopup ref="filePopup" @submit="onSubmit"></ProfileEditPopup>
	</view>
</template>

<script>
	import EditableFormPopup from '../../components/EditableFormPopup/EditableFormPopup.vue';
	export default {
		name: 'CustomerAssistant',
		components: {
			EditableFormPopup,
		},
		data() {
			return {
				statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
				clientInfo: {
					NewAddToday: 0,
					CumulativeNew: 50,
					Remainder: 0,
				},
				clientKey: {
					NewAddToday: '今日新增客户',
					CumulativeNew: '累计新增客户',
					Remainder: '剩余使用量',
				},
				user: {
					avatar: '/static/avatar-other.png',
					nickname: '刘薇',
					description: '@微信'
				}
			};
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			editUser() {
				this.$refs.filePopup.open()
			},
			onSubmit(data) {
				this.user = {
					...data
				}
			},
			showClient() {
				this.$refs.orderPopup.open()
			},
			onOrderSubmit(data) {
				this.clientInfo = Object.assign({}, data)
			},
		},
	};
</script>

<style scoped>
	.custom-header {

		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 100rpx;
		padding: 0 30rpx;
		background-color: #4475C9;
		/* border-bottom: 2rpx solid #e0e0e0; */
	}

	.customer-assistant::-webkit-scrollbar {
		display: none;
	}

	.main-warp::-webkit-scrollbar {
		display: none;
	}

	.left,
	.right {
		font-size: 32rpx;
		color: #333;
	}

	.backimg {
		width: 50rpx;
		height: 50rpx;
	}

	.title {
		font-size: 36rpx;
		/* font-weight: 600; */
		color: white;
	}

	.circle {
		height: 6rpx;
		width: 6rpx;
		background-color: #8c8c8c;

		border-radius: 50%;
		margin: 0 10rpx;

	}

	.skip-warp {
		display: flex;
		justify-content: center;
	}

	.skip-item {
		padding: 16rpx 44rpx;
		border-radius: 8rpx;
		margin: 0px 12rpx;
		background-color: #f8f8f8;
		font-size: 30rpx;
		color: #717171;
	}

	.skip-item text {
		color: #000;
		/* font-weight: 600; */
		margin-left: 16rpx;
	}

	.all-warp {
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 32rpx;
		color: #8c8c8c;
	}

	.add-warp {
		display: flex;
		align-items: center;
		background-color: #f8f8f8;
		padding: 24rpx;
		border-radius: 12rpx;
	}

	.add-warp image {
		width: 62rpx;
		height: 62rpx;
		margin-right: 24rpx;
	}

	.client-bottom {
		padding: 16rpx 0px 0px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-weight: 600;
	}

	.client-left {
		display: flex;
		align-items: center;
		background-color: #f7d99c;
		border-radius: 16rpx;
		padding: 16rpx 36rpx;
		font-size: 32rpx;
		font-weight: 600;
		color: #724e27;
	}

	.client-left image {
		width: 40rpx;
		height: 40rpx;
		margin-right: 10rpx;
	}

	.client-top {
		display: flex;
		justify-content: space-between;
	}

	.client-top image {
		width: 40rpx;
		height: 40rpx;
	}

	.client-main {
		display: flex;
		padding-bottom: 60rpx;
		justify-content: space-around;
		border-bottom: 2rpx solid #e6e6e6;
	}


	.client-warp {
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #808080;
		font-size: 28rpx;
	}

	.text-bottom {
		display: flex;
		align-items: center;
	}

	.text-bottom image {
		width: 32rpx;
		height: 32rpx;
		margin-left: 10rpx;
	}

	

	.num-text {
		font-family: 'Bahnschrift', sans-serif;
		font-size: 50rpx;
		color: #000;
		font-weight: 600;
		margin-bottom: 10rpx;
	}

	.section-title {
		font-size: 32rpx;
		/* font-weight: bold; */
		margin-bottom: 40rpx;
	}

	/* 使用场景样式 */
	.scenario-container {
		position: relative;
		display: flex;
		padding: 16rpx 80rpx;
	}

	/* 	.scenario-container image {
		width: 60rpx;
		height: 40rpx;
	} */

	/* 网站卡片 */
	.website-card {

		width: 280rpx;
		position: absolute;
		top: 20rpx;
		left: 34rpx;
		border-radius: 24rpx;
		border: 2rpx solid #f5f5f5;
		box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
	}

	/* 微信用户卡片 */
	.wechat-card {
		width: 280rpx;
		top: -14rpx;
		right: 40rpx;
		position: absolute;
		background-color: #fff;
		border-radius: 24rpx;
		border: 2rpx solid #f5f5f5;
		box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
	}

	.website-url {
		/* padding-right:20rpx ;
		background-color: #fff; */
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 12rpx 20rpx;
		border-radius: 24rpx;
		font-size: 22rpx;
		color: #888;
		/* text-align: center; */
		padding: 8rpx 52rpx;
		border: 2rpx solid #e0e0e0;
		width: 130rpx;
		line-height: 26rpx;
	}

	.website-name {
		background-color: #f2fcfe;
		font-size: 26rpx;
		font-weight: bold;
		text-align: center;
		margin-top: 20rpx;
		color: #a1b0bf;
		padding: 42rpx 0px 32rpx;
	}

	.primary-button {
		text-align: center;
		background-color: #9dcbff;
		color: white;
		border: none;
		padding: 12rpx 30rpx;
		border-radius: 8rpx;
		cursor: pointer;
		font-size: 24rpx;
		margin: 0px 40rpx;
	}



	.avatar-container {
		padding-top: 20rpx;
		padding-left: 20rpx;
		/* padding: 12rpx 20rpx; */
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.avatar {
		width: 70rpx;
		height: 70rpx;
		margin-right: 16rpx;
		border-radius: 10rpx;
	}

	.user-info {
		width: 100%;
		display: flex;
		flex-direction: column;
	}

	.name {
		font-size: 28rpx;
		font-weight: bold;
		/* transform:scale(0.8); */
	}

	.description {
		font-size: 20rpx;
		color: #d09000;

		/* 黄色 */
		position: relative;

	}

	.desc {
		transform: scale(0.8);
		/* position: relative; */
		left: -18rpx;
	}

	.lineone {
		width: 70rpx;
		height: 12rpx;
		border-radius: 100rpx;
		background-color: #f8f8f8;
		margin: 0px 30rpx 24rpx;

	}

	.linetwo {
		width: 120rpx;
		height: 12rpx;
		border-radius: 20rpx;
		background-color: #f8f8f8;
		margin: 0px 24rpx 24rpx;
	}

	.success-button {
		color: #717cb7;
		border: none;
		padding: 25rpx 20rpx;
		border-radius: 8rpx;
		text-align: center;
		font-size: 28rpx;
		font-weight: 600;
		border-top: 6rpx solid #f8f8f8;
	}

	.step .icon {
		/* width: 26rpx;
		height: 24rpx; */
	}

	.one-icon {
		width: 26rpx;
		height: 24rpx;
	}

	.yes-icon {
		height: 26rpx;
		width: 24rpx;
	}

	.step {
		background-color: #e5fee8;
		display: flex;
		align-items: center;
		font-size: 26rpx;
		color: #73cd7e;
		padding: 16rpx 18rpx;
		border-bottom-right-radius: 24rpx;
		border-bottom-left-radius: 24rpx;
	}

	.step-number {
		display: inline-block;
		background-color: #1890ff;
		color: white;
		border-radius: 50%;
		width: 48rpx;
		height: 48rpx;
		text-align: center;
		line-height: 48rpx;
	}

	.method-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20rpx;
		font-size: 34rpx;
		padding: 28rpx 0rpx;
		border-bottom: 2rpx solid #e8e8e8;
	}

	.method-item:last-of-type {
		border-bottom: none;
		padding-bottom: 0rpx;
	}

	.more-warp .method-item {
		border-bottom: none;
	}

	.item-right {
		display: flex;
		align-items: center;
		/* font-weight: 600; */
		color: #000;
	}

	/* 	.left-icon {
		width: 48rpx;
		height: 48rpx;
		margin-right: 16rpx;
	} */
	.left-icon {
		width: 48rpx;
		height: 48rpx;

	}

	.right_text {
		margin-left: 16rpx;
	}

	.share-icon {
		height: 44rpx;
	}

	.more-icon {
		width: 44rpx;
		height: 44rpx;
		margin-right: 16rpx;
	}

	.AD-icon {
		width: 54rpx;
		height: 46rpx;
		margin-right: 12rpx;
	}

	.vx-icon {
		margin-right: 12rpx;
		/* vx-icon */
		width: 54rpx;
		/* width: 48rpx; */
	}

	.right-icon {
		width: 40rpx;
		height: 40rpx;
	}

	.icon {
		font-size: 40rpx;
		margin-right: 10rpx;
	}

	.arrow {
		font-size: 40rpx;
		color: #ccc;
		margin-left: auto;
	}

	.footer-container {
		text-align: center;
		padding: 64rpx;
		color: #5e8aab;
		font-weight: 600;
	}

	.main-warp {
		box-sizing: border-box;
		position: relative;
		height: 100vh;
		overflow: scroll;
		background-color: #f3f3f3;
		padding-bottom: 120rpx;
	}

	.top-warp {
		display: flex;
		align-items: center;
		padding: 50rpx 32rpx 120rpx;
		background-color: #4477c8;
		color: #d9e9fd;
		font-size: 32rpx;
	}

	.top-warp .transfer-icon {
		width: 120rpx;
		height: 80rpx;
		margin-right: 24rpx;
	}

	.center-warp {
		position: absolute;
		top: 10%;
		width: 100%;
		box-sizing: border-box;
	}

	/* 使用场景样式 */
	.usage-scenario {
		background-color: #fff;
		padding: 24rpx;
		border-radius: 16rpx;
		margin: 40rpx 40rpx 0 40rpx;
		box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
	}
</style>