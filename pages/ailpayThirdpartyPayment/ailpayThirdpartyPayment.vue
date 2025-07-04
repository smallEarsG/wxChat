<template>
	<view class="container">
		<view class="custom-header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav_left" @click="goBack">
				<uni-icons type="left" size="24"></uni-icons>
			</view>
			<view class="nav_title">账单详情</view>
		
		</view>
		<view class="content">
			<view class="info">
				<view class="bg" />
				<view class="avatar" @click="changeRole">
					<image :src="info.avatar||'/static/paySe.png'"></image>
				</view>
				<view class="name">
					{{info.name}}
					<!-- <uni-icons type="right" style="margin-left: 6upx;" size="13" color="#878787"></uni-icons> -->
				</view>
				<view class="money" @click="exitInfo">
					<view class="sub"/>
					{{info.money}}
				</view>
				<view class="transaction">
					交易成功
				</view>
				<view class="orderInfo">
					<view class="info-item">
						<view class="left">支付时间</view>
						<view class="right">{{info.createTime}}</view>
					</view>
					<view class="info-item">
						<view class="left">付款方式</view>
						<view class="right" style="display: flex; align-items: center;">{{info.payFun}} <uni-icons type="right" style="margin-left: 10upx;" size="13" color="#878787"></uni-icons></view>
					</view>
					<view class="info-item">
						<view class="left">商品说明</view>
						<view class="right">{{info.desc}}</view>
					</view>
					<view class="info-item">
						<view class="left">支付奖励</view>
						<view class="right" style="display: flex; align-items: center;">已领取15积分 <uni-icons type="right" style="margin-left: 10upx;" size="13" color="#878787"></uni-icons></view>
					</view>
					<view class="info-item">
						<view class="left">收款方全称</view>
						<view class="right">{{info.herAccount}}</view>
					</view>
				
<!-- 					<view class="blue-tip">
						恭喜你有6元转账保障福利待领取! <uni-icons type="right" size="12" style="font-weight: 400;" color="#0f5086"></uni-icons>
					</view> -->
					<view class="info-item">
						<view class="left">订单号</view>
						<view class="right">{{info.orderNumber}}</view>
					</view>
					<view class="info-item">
						<view class="left">商家订单号</view>
						<view class="right">{{info.shopNumber}}</view>
					</view>
				</view>
			</view>
			<view class="Bill">
				<view class="title">
					账单管理
				</view>
				<!-- <view class="yellow-tip">
					本月转账红包是最大支出类目，看看花在哪里了 <uni-icons type="right" color="#b88f43" size="12"></uni-icons>
				</view> -->
				<view class="bill-item">
					<view class="bill-item-left">账单分类</view>
					<view class="bill-item-right">
						其他 <uni-icons type="right" style="margin-left: 10upx;" color="#878787" size="12"></uni-icons>
					</view>
				</view>
				<view class="bill-item">
					<view class="bill-item-left">标签和备注</view>
					<view class="bill-item-right">
						添加
						 <uni-icons type="right" style="margin-left: 10upx;" color="#878787" size="12"></uni-icons>
					</view>
				</view>
				<view class="bill-item">
					<view class="bill-item-left">记入收入</view>
					<view class="bill-item-right"><switch  style="transform:scale(0.6)"/></view>
				</view>
				<view class="line"/>
				<view class="blue_line" >
					<view class="line-item-line">
						<view class="line-content">
							<image class="alipayIcon" src="/static/alipay/alipay_0.png" mode="widthFix" />
							联系商家
						</view>
						<view class="line-content">
								<image class="alipayIcon" src="/static/alipay/alipay_1.png" mode="widthFix" />
								查看来往记录
						</view>
					</view>
					<view class="line-item-line">
						<view class="line-content">
								<image class="alipayIcon" src="/static/alipay/alipay_3.png" mode="widthFix" />
							往来流水证明
						</view>
						<view class="line-content">
								<image class="alipayIcon" src="/static/alipay/alipay_4.png" mode="widthFix" />
							申请电子回单
						</view>
					</view>
					<view class="line-item-line">
						<view class="line-content">
								<image class="alipayIcon" src="/static/alipay/alipay_5.png" mode="widthFix" />
							对次订单有疑惑
						</view>
						<!-- <view class="line-content">
								<image class="alipayIcon" src="/static/alipay/alipay_6.png" mode="widthFix" />
							转账凭证
						</view> -->
					</view>
				</view>
			</view>
		
		</view>
		<!-- <view class="foor">
			<view class="btn">再转一笔</view>
		</view> -->
		<uni-popup ref="popup" type="bottom" background-color="#fff" border-radius="10px">
			<view class="roleList">
				
				<view class="list_rl">
					<uni-swipe-action v-if="roleList.length>0">
						<uni-swipe-action-item v-for="(item,index) in roleList" :right-options="options2" :auto-close="false"
							@click="bindClick(index)">
		
							<view class="content-box" @click="changeRl(item.avatar)">
								<uni-list-chat :avatar-circle="true" :title="item.nickname" :avatar="item.avatar"
									:note="item.description" :clickable="true"
									@click="changeRl(item.avatar)"></uni-list-chat>
							</view>
						</uni-swipe-action-item>
		
					</uni-swipe-action>
				</view>
				<view class="">
					<button @click="openAddPopup">添加角色</button>
				</view>
			</view>
		</uni-popup>
		<EditableFormPopup ref="orderPopup" :value="info" :fieldLabels="infoKey" @submit="onOrderSubmit" />
		<ProfileEditPopup ref="cradPopup" @submit="onCradSubmitz"></ProfileEditPopup>
	</view>
</template>

<script>
	import {
		eadLocalFileToBase64,
		generateBarcodeBase64
	} from "../../utils/tool.js"
	export default {
		onLoad(options){
			if (options.info) {
				const temp = JSON.parse(decodeURIComponent(options.info))
				this.info = {
					...this.info,
					...temp,
			
				}
			}
			const list = uni.getStorageSync('roleList')
			if (list) this.roleList = list
		},
		data() {
			return {
				options2: [{
						text: '删除',
						style: {
							backgroundColor: '#F56C6C'
						}
					}
				
				],
				statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
				roleList: [],
				info:{
					avatar:'',
					name:'测试',
					money:'1880.00',
					createTime:'2025-6-25 16:59:17',
					payFun:'余额宝',
					desc:'转账',
					herAccount:'阿里云计算有限公司',
					orderNumber:'2025042420004001110087',
					shopNumber:'HBX2000400111008'
				},
				infoKey:{
					name:'转账用户',
					money:'金额',
					createTime:'创建时间',
					payFun:'付款方式',
					desc:'备注',
					herAccount:'对方账号',
					orderNumber:'订单号',
					shopNumber:'商家订单号'
				}
				
			}
		},
		methods: {
			openAddPopup() {
				this.$refs.cradPopup.open()
			},
			goBack() {
				uni.navigateBack();
			},
			bindClick(index) {
				this.roleList.splice(index, 1)
				uni.showToast({
					title: '删除成功',
					icon: 'none'
				})
				this.saveRoleList()
			},
			changeRl(url) {
				
				this.info.avatar = url
				// this.saveTflist()
			},
			onOrderSubmit(data) {
				console.log(data);
				const baseImg = this.info.url
				this.info = {
					...this.info,
					...data
				}
				this.info.avatar = baseImg
				// this.saveTflist()
			},
			exitInfo() {
				this.$refs.orderPopup.open()
			},
			changeRole() {
				if (this.roleList.length > 0) {
					this.$refs.popup.open('center')
				} else {
					this.$refs.cradPopup.open()
				}
			},
			saveRoleList() {
				uni.setStorage({
					key: 'roleList',
					data: this.roleList
				})
			},
			async onCradSubmitz(data) {
				console.log(data);
				const baseImg = await eadLocalFileToBase64(data.avatar)
			
				this.roleList.push({
					...data,
					avatar: baseImg
				})
				this.saveRoleList()
				this.info.avatar = baseImg
				this.saveTflist()
			},
		}
	}
</script>

<style>
	/* 顶部栏 - 固定在顶部 */
	.custom-header {
		display: flex;
		/* justify-content: space-between; */
		align-items: center;
		height: 100rpx;
		padding: 0 30rpx;
		/* border-bottom: 2rpx solid #e0e0e0; */
	
	}
	.nav_left{
		
	}
	.nav_title {
		display: flex;
		flex-direction: column;
		align-items: center;
		/* font-weight: 500; */
		font-size: 38upx;
		margin-left: 30upx;
	}
	.list_rl {
		flex: 1;
		overflow: auto;
	}
	.roleList {
		display: flex;
		flex-direction: column;
		width: 600rpx;
		height: 800rpx;
	}
	.btn{
		background-color:#007aff;
		color: #fff;
		font-size: 36upx;
		text-align: center;
		height: 80upx;
		font-weight: 500;
		line-height: 80upx;
	}
	.foor{
		padding: 20upx;
		padding-bottom: 40upx;
		background-color: #fff;
	}
	.alipayIcon{
		width: 38upx;
		margin-right: 17upx;
	}
	.line-content{
		display: flex;
		flex: 1;
		color: #25397f;
		align-items: center;
	}
	.line-item-line{
		padding:  30upx 0;
		display: flex;
		align-items: center;
		font-size: 28upx;
	}
	.blue_line{
		display: flex;
		flex-direction: column;
		
	}
	.line{
		width: 100%;
		height: 1px;
		background-color: #878787;
		transform: scaleY(0.1);
		margin-top: 20upx;
	}
	.bill-item-right{
		color: #878787;
	}
	.bill-item{
		display: flex;
		justify-content: space-between;
		padding: 20upx 0 ;
		font-size: 28upx;
		margin-top: 20upx;
	}
	.title{
		font-size: 30upx;
		font-weight: bold;
		padding: 20upx 0;
	}
	.Bill{
		display: flex;
		background-color: #fff;
		flex-direction: column;
		padding: 20upx;
		margin-top: 20upx;
		overflow:hidden;
		border-radius: 20upx;
		margin-bottom: 30upx;
	}
	.yellow-tip,
	.blue-tip {
		display: flex;
		justify-content: space-between;
		width: 100%;
		padding-top : 26upx ;
		padding-bottom: 26upx;
		padding-left:30upx;
		padding-right: 20upx;
		box-sizing: border-box;
		align-items: center;
		background-color: #f6f7fb;
		/* padding: 20upx 30upx; */
		border-radius: 14upx;
		font-size: 26upx;
		font-weight: 600;
		color: #25397f;
		/* background-color: red; */
	}
	.yellow-tip{
		font-size: 26upx;
		font-weight: 400;
		background-color: #fbf8f1;
		color: #b88f43;
	}
	.left{
		width: 170upx;
		color: #878787;
	}
	.right{
		flex: 1;
		word-wrap: break-word;
		overflow-wrap: break-word;
		overflow: auto;
	}
	.info-item {
		padding: 20upx 0upx;
		display: flex;
		/* justify-content: space-between; */
		/* background-color: antiquewhite; */
		width: 100%;
		font-size: 28upx;
	}

	.orderInfo {
		margin-top: 30upx;
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		flex-direction: column;
		padding: 0 30upx;
		width: 100%;
		/* background-color: aqua; */
		box-sizing: border-box;
		/* padding-bottom: 10upx;s */
		/* flex:1 */
	}

	.transaction {
		position: relative;
		z-index: 1;
		margin: 25upx 0 ;
		font-size: 30upx;
	}

	.money {
		position: relative;
		z-index: 1;
		font-size: 58upx;
		font-family: 'WeChat Sans Std';
		/* font-weight: 500; */
		display: flex;
		align-items: center;
	}
	.sub{
		width: 20upx;
		height: 8upx;
		background-color: black;
		margin-right: 6upx;
	}

	.name {
		position: relative;
		z-index: 1;
		font-size: 30upx;
		padding: 25upx 0;
		display: flex;
		align-items: center;
		
	}

	.bg {
		background-color: #fff;
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		top: 35upx;
		z-index: 0;
	}

	.avatar {
		width: 92rpx;
		height: 92rpx;
		overflow: hidden;
		border-radius: 50%;
	}

	.avatar image {
		width: 100%;
		height: 100%;
	}

	.info {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: #fff;
		padding:40upx 0 ;
		border-radius: 20upx;
		overflow: hidden;
		padding-bottom: 30upx;
	}
	.content{
		padding: 20upx;
		flex: 1;
		overflow: auto;
	}
	.container {
		height: 100vh;
		background-color: #eaeaea;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		position: relative;
		
	}
</style>