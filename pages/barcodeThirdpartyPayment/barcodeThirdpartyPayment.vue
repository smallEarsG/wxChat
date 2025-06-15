<template>
	<view class="container">
		<view class="nav" @click="goBack" :style="{ paddingTop: statusBarHeight + 'px' }">
			<uni-icons class="close" type="closeempty" color="#000" size="22"></uni-icons>
		</view>
		<view class="content">
			<view class="order">
				<view class="order_top">
					<view class="avatar" @click="changeRole">
						<image :src="info.url||'/static/logo.png'"></image>
					</view>
					<view class="name">
						{{info.name}}
					</view>
					<view class="num" @click="exitInfo">
						{{info.money}}
						<!-- <text class="num_txt"> {{info.num}}</text> -->
					</view>
					<view class="line" />
				</view>

				<view class="order_info">
					<view class="item">
						<view class="left">
							当前状态
						</view>
						<view class="right">
							{{info.currentState}}
						</view>
					</view>
					<view class="item">
						<view class="left">
							支付时间
						</view>
						<view class="right">
							{{info.time}}
						</view>
					</view>
					<view class="item">
						<view class="left">
							商品
						</view>
						<view class="right">
							{{info.shop}}
						</view>
					</view>
					<view class="item">
						<view class="left">
							商户全称
						</view>
						<view class="right">
							{{info.merchantName}}
						</view>
					</view>
					<view class="item">
						<view class="left">
							收单机构
						</view>
						<view class="right">
							<view> {{info.institution}}</view>
							<view class="tips" v-if=" info.desc">
								{{info.desc}}
							</view>
						</view>
					</view>
					<view class="item">
						<view class="left">
							支付方式
						</view>
						<view class="right  ">
							<view class="rightIcon">
								{{info.payment}}
								<uni-icons v-if=" info.payment == '零钱通'" type="info" size="18" color="#999"
									class="input-icon gthIcon" />
							</view>
							<view class="tips" v-if=" info.desc2">
								{{info.desc2}}
								
							</view>
							<!-- <image v-if=" info.payment == '零钱通'" class="gthIcon" src="/static/gthIcon.png"></image> -->
						</view>
					</view>

					<view class="item">
						<view class="left">
							交易单号
						</view>
						<view class="right">
							{{info.orderNumber}}
						</view>
					</view>

					<view class="item">
						<view class="left">
							商户单号
						</view>
						<view class="right">
							{{info.shopNumber}}
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
								<image class="chatIcon" src="/static/qiw/tpicon_1.png" mode=""></image>
							</view>
							发起群收款
						</view>
					</view>
					<view class="serivce_bx">
						<view class="se_item">
							<view class="se_icon ">
								<image class="startIcon" src="/static/qiw/tpIcon_2.png" mode=""></image>
							</view>
							在此商户的交易
						</view>
					<!-- 	<view class="se_item">
							<view class="se_icon ">
								<image class="transferIcon" src="/static/transferIcon.png" mode=""></image>
							</view>
							查看往来转账
						</view> -->
					</view>
				</view>

			</view>


			<view class="footer">
				本服务由财付通提供
			</view>
		</view>
		<uni-popup ref="popup" type="bottom" background-color="#fff" border-radius="10px">
			<view class="roleList">
				<!-- <view class=""  v-for="itme in roleList" >
				<uni-list-chat :avatar-circle="true" :title="itme.nickname" :avatar="itme.avatar"
												:note="itme.description"></uni-list-chat>
				</view> -->
				<view class="list_rl">
					<uni-swipe-action v-if="roleList.length>0">
						<uni-swipe-action-item v-for="item in roleList" :right-options="options2" :auto-close="false"
							@click="bindClick">

							<view class="content-box" @click="changeRl(item.avatar)">
								<uni-list-chat :avatar-circle="true" :title="item.nickname" :avatar="item.avatar"
									:note="item.description" :clickable="true"
									@click="changeRl(item.avatar)"></uni-list-chat>
							</view>
						</uni-swipe-action-item>

					</uni-swipe-action>
				</view>
				<view class="">
					<button class="btn" @click="openAddPopup">添加角色</button>
				</view>
			</view>
		</uni-popup>
		<EditableFormPopup ref="orderPopup" :value="info" :fieldLabels="infoKey" @submit="onOrderSubmit" />
		<ProfileEditPopup ref="cradPopup" @submit="onCradSubmitz"></ProfileEditPopup>
	</view>
</template>

<script>
import {
		eadLocalFileToBase64
	} from "../../utils/tool.js"
	export default {
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
				info: {
					"url": "",
					"name": "给为理想而奋斗",
					"money": "-0.01",
					"time": "2025年6月13日 16:19:30",
					"orderNumber": "1000050001202506130129831495334",
					"otherTime": "2025年6月13日 16:20:17",
					"payment": "零钱通",
					"currentState": "对方已收款",
					"desc": "由互联网清算有限公司提供付款清算服务",
					"shop": '商品', // 商品
					"merchantName": '商户名称', // 商户名称
					"institution": '收款机构', //收款机构
					"shopNumber": ' 商户单号', // 商单号
					"desc2": "由互联网清算有限公司提供付款清算服务"
				},
				infoKey: {
					"time": "付款时间",
					"otherTime": '收款时间', //
					"name": "名字",
					"orderNumber": "交易单号",
					"money": '金额',
					"currentState": '支付状态',
					"payment": '支付方式',
					"shop": '商品', // 商品
					"merchantName": '商户名称', // 商户名称
					"institution": '收款机构', //收款机构
					"shopNumber": ' 商户单号', // 商单号
					"desc":"收款机构备注",
					"desc2":"支付方式备注"
				}
			}
		},
		onLoad(options) {

			console.log(decodeURIComponent(options.info));
			const temp = JSON.parse(decodeURIComponent(options.info))
			this.info = {
				...this.info,
				...temp,
				
			}
			console.log(this.info.name);
			// 读取本地角色
			const list = uni.getStorageSync('roleList')
			if (list) this.roleList = list
		},
		methods: {
			saveRoleList() {
				uni.setStorage({
					key: 'roleList',
					data: this.roleList
				})
			},
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
						type: 2,
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
			changeRl(url) {
				// console.log(url);
				this.info.url = url
				this.saveTflist()
			},
			openAddPopup() {
				this.$refs.cradPopup.open()
			},

			bindClick(con) {
				console.log(con.index);
				this.roleList.splice(con.index, 1)
				uni.showToast({
					title: '删除成功',
					icon: 'none'
				})
				this.saveRoleList()
			},
			changeRole() {
				if (this.roleList.length > 0) {
					this.$refs.popup.open('center')
				} else {
					this.$refs.cradPopup.open()
				}
			},
			async onCradSubmitz(data) {
				console.log(data);
				const baseImg = await eadLocalFileToBase64(data.avatar)

				this.roleList.push({
					...data,
					avatar: baseImg
				})
				this.saveRoleList()
				this.info.url = baseImg
				this.saveTflist()
			},
			onOrderSubmit(data) {
				console.log(data);
				const baseImg = this.info.url
				this.info = {
					...this.info,
					...data
				}
				this.info.url = baseImg
				this.saveTflist()
			},
			exitInfo() {
				this.$refs.orderPopup.open()
			},
			goBack() {
				uni.navigateBack();
			},
		}
	}
</script>

<style scoped>
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

	.gthIcon {
	/* 	width: 30rpx;
		height: 30rpx; */
		margin-left: 10rpx;
		/* position: relative;
		top: -4rpx; */
	}

	.rightIcon {
		display: flex;
		align-items: center;
	}
	.tips{
		margin-top: 12rpx;
		color: #9b9b9b;
		font-size: 26rpx;
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

	.serivce_line {
		border-top: 1px solid #eaeaea;
	}

	.serivce_bx {
		display: flex;
		align-items: center;
		margin: 35rpx 0;
		box-sizing: border-box;
	}

	.se_title {
		font-size: 28rpx;
		padding-top: 30rpx;
		padding-bottom: 35rpx;
		/* font-weight: 500; */
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

	.startIcon {
		width: 32rpx;
		height: 32rpx;
		margin-right: 12rpx;
		position: relative;
		top: 6rpx;
	}

	.chatIcon {
		width: 32rpx;
		height: 32rpx;
		margin-right: 14rpx;
		position: relative;
		top: 6rpx;
	}

	.transferIcon {
		width: 34rpx;
		height: 34rpx;
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
		font-family: 'WeChat Sans Std';
		display: flex;
		align-items: center;
		margin-top: 40rpx;
		/* font-weight: bold; */
		font-size: 56rpx;
	}

	.num_txt {
		font-variant-numeric: tabular-nums;
		/* 强制使用等宽数字 */
		font-family: -apple-system, 'SF Pro Display', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
	}

	.name {
		margin-top: 30rpx;
		font-size: 32rpx;
	}

	.left {
		color: #878787;
		width: 80px;
	}
	.right{
		flex:1;
		word-wrap: break-word; 
		overflow-wrap: break-word;
	
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
		margin-top: 88rpx;
		width: 100%;
		height: 1px;
		background-color: #eaeaea;
	}

	.avatar {
		width: 92rpx;
		height: 92rpx;
		overflow: hidden;
		margin-top: 40rpx;
		border-radius: 50%;
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