<template>
	<view class="container">
		<view class="nav" @click="goBack" :style="{ paddingTop: statusBarHeight + 'px' }">
			<uni-icons class="close" type="closeempty" color="#000" size="22"></uni-icons>
			
		</view>
		
		<view class="content">
			<!-- <view class="line_b" /> -->

			<view class="order">
				
				<view class="order_top">
					<view class="avatar">
						<image src="/static/paySe.png"></image>
					</view>
					<view class="name">
						扫二维码付款-{{info.name}}
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
							收款方备注
						</view>
						<view class="right">
							二维码收款
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
							转账时间
						</view>
						<view class="right">
							{{info.time}}
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

				<view class="serivce_bx">
					<view class="se_item">
						<view class="se_icon ">
							<image class="wticon" src="/static/wticon.png" mode=""></image>
						</view>
						对订单有疑惑
					</view>
					<view class="se_item">
						<view class="se_icon ">
							<image class="skIcon" src="/static/skIcon.png" mode=""></image>
						</view>
						发起群收款
					</view>
				</view>
			</view>
			<view class="serivce">
				<view class="se_title">
					账单服务
				</view>
				<view class="serivce_bx">
					<view class="se_item">
						<view class="se_icon ">
							<image class="cordIcon" src="/static/cordIcon.png" mode=""></image>
						</view>
						收款方名片
					</view>
					<view class="se_item">

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
					"time": "2025年6月2日12：06：02",
					"name": "给为理想而奋斗",
					"orderNumber": "10001071012025060201715277560518",
					"num": '88.00'
				},
				infoKey:{
					"time": "时间",
					"name": "名字",
					"orderNumber": "单号",
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
			saveTflist() {
			  // 获取现有列表
			  let list = uni.getStorageSync('tfList') || [];
			  
			  // 查找订单号匹配的元素
			  const index = list.findIndex(item => {
			    return item.info.orderNumber === this.info.orderNumber;
			  });
			  
			  // 如果不存在，添加新元素
			  if (index < 0) {
			    list.push({
			      type: 1,
			      info: this.info
			    });
			  } 
			  // 如果存在，更新原有元素的info部分
			  else {
			    list[index].info = this.info;
			  }
			  
			  // 保存更新后的列表（修正参数传递方式）
			  uni.setStorageSync('tfList', list);
			},
			onOrderSubmit(data){
				this.info = {...data}
				this.saveTflist()
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

	.serivce_bx {
		border-top: 1px solid #eaeaea;
		display: flex;
		align-items: center;
		padding: 35rpx 0;
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
		font-weight: 500;
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
	.line_b{
		width: 100%;
		height: 1px;
		background-color: #fafafa;
		transform: scaleY(0.01);
	}
	.line {
		margin-top: 92rpx;
		width: 100%;
		height: 1px;
		background-color: #efefef;
		transform: scaleY(0.6);
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
		height: 86rpx;
		/* background-color: #5c6e96; */
		background-color: #fff;
		/* overflow: hidden; */
		
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