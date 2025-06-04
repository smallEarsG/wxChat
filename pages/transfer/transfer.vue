<template>
	<view class="container">
		<view class="nav" @click="goBack" :style="{ paddingTop: statusBarHeight + 'px' }">
			<uni-icons class="close" type="closeempty" color="#000" size="22"></uni-icons>
		</view>
		<view class="content">


			<view class="order">
				<view class="order_top">
					<view class="avatar">
						<image :src="info.url||'/static/paySe.png'"></image>
					</view>
					<view class="name">
						扫二维码付款-{{info.transferName}}
					</view>
					<view class="num" @click="exitInfo">
						<view class="sub" />
						{{info.num}}
					</view>
					<view class="line" />
				</view>

				<view class="order_info">

					<view class="item">
						<view class="left">
							当前状态
						</view>
						<view class="right">
							支付成功
						</view>
					</view>
					<view class="item">
						<view class="left">
							转账说明
						</view>
						<view class="right">
							微信转账
						</view>
					</view>
					<view class="item">
						<view class="left">
							转账时间
						</view>
						<view class="right">
							{{info.time}}
						</view>
					</view>
					<view class="item">
						<view class="left">
							收款时间
						</view>
						<view class="right">
							{{info.otherTime}}
						</view>
					</view>
					<view class="item">
						<view class="left">
							收款方式
						</view>
						<view class="right rightIcon">
							零钱通 <image class="gthIcon" src="/static/gthIcon.png"></image>
						</view>
					</view>
					
					<view class="item">
						<view class="left">
							转账单号
						</view>
						<view class="right">
							{{info.orderNumber}}
						</view>
					</view>

				</view>


			</view>
			<view class="serivce">
				<view class="se_title">
					账单服务
				</view>
				<view class="serivce_line">
					<view class="serivce_bx">
						<view class="se_item">
							<view class="se_icon ">
								<image class="wticon" src="/static/wticon.png" mode=""></image>
							</view>
							对订单有疑惑
						</view>
						<view class="se_item">
							<view class="se_icon ">
								<image class="chatIcon" src="/static/chatIcon.png" mode=""></image>
							</view>
							定位到聊天位置
						</view>
					</view>
					<view class="serivce_bx">
						<view class="se_item">
							<view class="se_icon ">
								<image class="startIcon" src="/static/startIcon.png" mode=""></image>
							</view>
							申请转账电子凭证
						</view>
						<view class="se_item">
							<view class="se_icon ">
								<image class="transferIcon" src="/static/transferIcon.png" mode=""></image>
							</view>
							查看往来转账
						</view>
					</view>
				</view>
				
			</view>
		 

			<view class="footer">
				本服务由财付通提供
			</view>
		</view>
	<EditableFormPopup ref="orderPopup" :value="info" :fieldLabels="infoKey" @submit="onOrderSubmit" />
	</view>
</template>

<script>
	export default {
		data() {
			return {
				statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
				info: {
					"url":"",
					"time": "2025年6月3日 21:23:40",
					"orderNumber": "1000050001202506030822269810799",
					"otherTime": "2025年6月3日 21:42:26",
					"transferName": "转给莴笋批发223档口",
					"num": '88.00'
				},
				infoKey:{
					"time": "转账时间",
					"orderNumber": '订单编号',
					"otherTime":'收款时间',
					"transferName":'用户名',
					"num": '金额'
				}
			}
		},
		onLoad(options) {

			console.log(decodeURIComponent(options.info));
			const temp = JSON.parse(decodeURIComponent(options.info))
			this.info = {
				...this.info,
				...temp
			}
			console.log(this.info.name);
		},
		methods: {
			onOrderSubmit(data){
				this.info = {...data}
			},
			exitInfo(){
				this.$refs.orderPopup.open()
			},
			goBack() {
				uni.navigateBack();
			},
		}
	}
</script>

<style scoped>
	.gthIcon{
		width: 30rpx;
		height: 30rpx;
		margin-left: 20rpx;
	}
	.rightIcon{
		display: flex;
		align-items: center;
	}
	.footer {
		width: 100%;
		flex: 1;
		font-size: 24rpx;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		flex-direction: column;
		color: #a2a2a2;
		min-height: 170rpx;
		padding-bottom: 60rpx;
		/* position: absolute;
	bottom: 0rpx; */
	}

	.serivce {
		margin-top: 20rpx;
		background-color: #fff;
		padding: 0 40rpx;
		box-sizing: border-box;
	}
	.serivce_line{
		border-top: 1px solid #eaeaea;
	}
	.serivce_bx {
		display: flex;
		align-items: center;
		margin: 35rpx 0;
		box-sizing: border-box;
	}

	.se_title {
		font-size: 26rpx;
		padding-top: 30rpx;
		padding-bottom: 35rpx;
		font-weight: 500;
		box-sizing: border-box;
	}

	.se_item {
		font-size: 26rpx;
		color: #5c6e96;
		flex: 1;
		display: flex;
		align-items: center;
		/* margin: 0 40rpx; */
	}

	.se_icon {}

	.cordIcon {
		width: 38rpx;
		height: 38rpx;
		position: relative;
		top: 4rpx;
		margin-right: 10rpx;
	}

	.skIcon {
		width: 36rpx;
		height: 36rpx;
		position: relative;
		top: 4rpx;
		margin-right: 10rpx;
	}

	.wticon {
		width: 30rpx;
		height: 30rpx;
		margin-right: 14rpx;
		position: relative;
		top: 6rpx;
	}
	.startIcon{
		width: 32rpx;
		height: 32rpx;
		margin-right: 14rpx;
		position: relative;
		top: 6rpx;
	}
	.chatIcon{
		width: 32rpx;
		height: 32rpx;
		margin-right: 14rpx;
		position: relative;
		top: 6rpx;
	}
	.transferIcon{
		width: 32rpx;
		height: 32rpx;
		margin-right: 14rpx;
		position: relative;
		top: 6rpx;
	}
	.order_info {
		margin-top: 40rpx;
		padding-bottom: 60rpx;
	}

	.sub {
		height: 8rpx;
		width: 26rpx;
		background-color: #000
	}

	.num {
		display: flex;
		align-items: center;
		margin-top: 40rpx;
		font-weight: 600;
		font-size: 56rpx;

	}

	.name {
		margin-top: 30rpx;
		font-size: 32rpx;
	}

	.left {
		color: #9b9b9b;
		width: 80px;
	}

	.item {
		flex: 1;
		display: flex;
		font-size: 28rpx;
		margin-bottom: 20rpx;
	}

	.order_info {
		display: flex;
		flex-direction: column;
	}

	.line {
		margin-top: 92rpx;
		width: 100%;
		height: 1px;
		background-color: #eaeaea;
	}

	.avatar {
		width: 92rpx;
		height: 92rpx;
		overflow: hidden;
		margin-top: 90rpx;
	}

	.avatar image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.order_top {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.order {
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		background-color: #fff;
		padding: 0 40rpx;
	}

	.close {
		/* background-color: aqua; */
		/* padding-top: 160px; */
		padding-left: 20rpx;
		position: relative;
		top: 30rpx;
		transform: scale(0.8);
	}

	.nav {
		background-color: #fff;
	}

	.container {
		background-color: #eaeaea;
		display: flex;
		flex-direction: column;
		height: 100vh;
	}

	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		/* position: relative; */
	}
</style>