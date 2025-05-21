<template>
	<view class="container">
		<!-- 自定义顶部栏 -->
		<view class="custom-header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="left" @click="goBack">
				<image class="backimg" src="../../static/left.png" />
			</view>
			<view class="title">对外收款</view>
			<view class="right" @click="toggleMenu">
				<uni-icons type="more-filled" size="25"  style="color: aliceblue;"/>
			</view>
		</view>

		<view class="content">
			<!-- 功能菜单 -->
			<view class="menu" v-if="showMenu">
				<view class="menu-item" @click="openEditForm">编辑</view>
			</view>
			<view class="msgBox">
				<!-- 收款通知：可左滑删除 -->
				<uni-swipe-action>
					<block v-for="(infrom ,i) in informList">
					<uni-swipe-action-item v-if="infrom.typeIndex==0"  :options="deleteOptions" @click="deleteRecord(i)">
						<view class="histrayTime">{{infrom.time}}</view>
						<view class="card">
							<view class="card-header">
								<view class="card-title"> 收款通知</view>
								<view class="more">	<uni-icons type="more-filled" size="16"></uni-icons></view>
							</view>
							<view class="amountBox">
								<view class="status">已收款至企业账户</view>
								<view class="amount">¥{{ infrom.amount }}</view>
							</view>
							<view class="info-row">
								<text class="label">付款客户：</text>
								<view class="value">客户<text style="color: #AFE2B7;">@{{ infrom.customer }}</text>
								</view>
							</view>
							<view class="info-row">
								<text class="label">收款方式：</text>
								<view class="value">{{ infrom.orderType }}</view>
							</view>
							<view class="info-row">
								<text class="label">收款账户：</text>
								<view class="value">{{ infrom.account }}</view>
							</view>
							<view class="info-row">
								<text class="label">收款成员：</text>
								<view class="value">{{ infrom.member }}</view>
							</view>
							<view class="info-row" v-if="infrom.desc">
								<text class="label">收款说明：</text>
								<view class="value">{{ infrom.desc }}</view>
							</view>
							<view class="info-row">
								<text class="label">收款汇总：</text>
								<view class="value">今日成员收款1笔，供{{ infrom.amount }}元</view>
							</view>
						</view>
						<view class="info-box" @click="deleteRecord(i)" >
							<view class="info-box_title">收款记录</view>
							<view class="info-box_icon">
								<image class="icon-right" src="../../static/icon-right.png"></image>
							</view>
						</view>
					</uni-swipe-action-item>
					<uni-swipe-action-item v-if="infrom.typeIndex==1" :options="deleteOptions" @click="deleteRecord(i)">
						<view class="histrayTime">{{infrom.time}}</view>
						<view class="card">
							<view class="card-header">
								<view class="card-title">提现通知</view>
							</view>
							<view class="info-row">
								<text class="label">提现状态：</text>
								<view class="value">{{ infrom.state }}</view>
							</view>
							<view class="info-row">
								<text class="label">提现商户号：</text>
								<view class="value">{{ infrom.shopId }}</view>
							</view>
							<view class="info-row">
								<text class="label">提现金额：</text>
								<view class="value">￥{{ infrom.amount }}</view>
							</view>
							<view class="info-row">
								<text class="label">到账账户：</text>
								<view class="value">{{ infrom.account }}</view>
							</view>
							<view class="info-row">
								<text class="label">到账时间：</text>
								<view class="value">{{ infrom.withdrawTime }}</view>
							</view>
						</view>
						<view class="info-box" @click="deleteRecord(i)">
							<view class="info-box_title">查看详情</view>
							<view class="info-box_icon">
								<image class="icon-right" src="../../static/icon-right.png"></image>
							</view>
						</view>
					</uni-swipe-action-item>
					</block>
				</uni-swipe-action>

			</view>

			<!-- 弹窗表单 -->
			<uni-popup ref="popupForm" type="center">
				<view class="popup">
					<text class="popup-title">编辑通知</text>

					<!-- 选择通知类型 -->
					<picker @change="onTypeChange" :value="formData.typeIndex" :range="typeOptions">
						<view class="picker">通知类型：{{ typeOptions[selectedTypeIndex] }}</view>
					</picker>

					<!-- 选择时间 -->
					
					<view >
						<text>展示时间：</text>
						<input class="input" v-model="formData.time"  placeholder="请输入展示时间" />
					</view>
					<view class="">
						<text>收款金额：</text>
						<input class="input" v-model="formData.amount"  placeholder="请输入收款金额" />
					</view>
					<view class="">
						<text>收款账号：</text>
						<input class="input" v-model="formData.account"  placeholder="请输入收款账号" />
					</view>
					<!-- 动态输入项 -->
					<view class="form-section">
						<!-- 收款通知 -->
						<block v-if="selectedTypeIndex=== 0">
							<view>
								<text>付款形式：</text>
								<input class="input" v-model="formData.orderType" placeholder="请输入转账形式" />
							</view>
							<view>
								<text>付款客户：</text>
								<input class="input" v-model="formData.customer"  placeholder="请输入付款客户" />
							</view>
							<view>
								<text>收款成员：</text>
								<input class="input" v-model="formData.member"  placeholder="请输入收款成员" />
							</view>
							<view>
								<text>汇款说明：</text>
								<input class="input" v-model="formData.desc"  placeholder="请输入汇款说明" />
							</view>
						</block>

						<!-- 提现通知 -->
						<block v-if="selectedTypeIndex === 1">
						<view class="">
							<text>提现状态：</text>
							<input class="input" v-model="formData.state"  placeholder="请输入提现状态" />
						</view>
						<view class="">
							<text>提现商户号：</text>
							<input class="input" v-model="formData.shopId"  placeholder="请输入体现商户" />
						</view>
						<view >
							<text>到账时间：</text>
							<input class="input" v-model="formData.withdrawTime" placeholder="请输入到账时间" />
						</view>
						</block>
					</view>

					<!-- 保存按钮 -->
					<button class="btn-save" @click="saveForm">保存</button>
				</view>
			</uni-popup>

		</view>
	</view>
</template>

<script>
	export default {


		data() {
			return {
				statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
				showMenu: false,
				selectedTypeIndex: 0,
				typeOptions: ['收款通知', '提现通知'],
				deleteOptions: [{
					text: '删除',
					style: {
						backgroundColor: '#FF3B30',
						color: '#fff'
					}
				}],
				informList: [{
						typeIndex: 0,
						time: "12:29",
						orderType: "对外汇款",
						amount: '398.00',
						customer: '微信',
						member: "开发者团队@小七",
						desc: "点击汇款记录删除消息 ",
						account: "建设银行（尾号**25）",
						receiveTime: '2025-03-25 22:46'
					},
					{
						typeIndex: 1,
						time: "点击顶部三个点进行编辑(提示)",
						state: "提现成功",
						shopId: "33084273482349",
						amount: '398.00',
						account: "建设银行（尾号**25）",
						withdrawTime: '2025-03-26 02:09'
					},
				],
				formData: {
				
				}
			};
		},
		methods: {
		
			// 返回上一页
			goBack() {
				uni.navigateBack();
			},

			// 展开或关闭功能菜单
			toggleMenu() {
				this.showMenu = !this.showMenu;
			},

			// 打开编辑表单
			openEditForm() {
				this.showMenu = false;
				this.resetForm();
				this.$refs.popupForm.open('center');
			},

			// 重置表单
			resetForm() {
				this.formData = {
				
				};
				this.selectedTypeIndex = 0;
			},

			// 选择通知类型
			onTypeChange(e) {
				this.selectedTypeIndex = e.detail.value;
			},

			// 选择时间
			onDateChange(e) {
				this.formData.time = e.detail.value;
			},

			// 删除通知
			deleteRecord(indexToRemove) {
				console.log(indexToRemove);
			if (indexToRemove > -1 && indexToRemove < this.informList.length) {
			    this.informList.splice(indexToRemove, 1);
			}
				uni.showToast({
					title: '删除成功',
					icon: 'success'
				});
			},

			// 保存表单数据
			saveForm() {
				
				if (!this.formData.time || !this.formData.amount) {
					uni.showToast({
						title: '请填写完整信息',
						icon: 'none'
					});
					return;
				}
				this.formData.typeIndex = this.selectedTypeIndex
				console.log(this.formData);
				this.informList.push(this.formData)
				console.log(this.informList);
				// if (this.selectedTypeIndex === 0) {
				// 	// 更新收款通知信息
				// 	this.recordInfo = {
				// 		amount: parseFloat(this.formData.amount).toFixed(2),
				// 		customer: '客户 @ 微信',
				// 		receiveTime: this.formData.time
				// 	};
				// } else {
				// 	// 更新提现通知信息
				// 	this.withdrawalInfo = {
				// 		amount: parseFloat(this.formData.amount).toFixed(2),
				// 		account: this.formData.account || '尾号0240',
				// 		withdrawTime: this.formData.time
				// 	};
				// }

				uni.showToast({
					title: '保存成功',
					icon: 'success'
				});
				this.$refs.popupForm.close(); // 关闭弹窗
			},

			// 查看收款记录
			viewRecords() {
				uni.showToast({
					title: '跳转到收款记录...',
					icon: 'none'
				});
			}
		}
	};
</script>

<style>
	.container {
		display: flex;
		flex-direction: column;
		background-color: #ededed;
		overflow: hidden;
		height: 100vh;

	}

	.content {
		flex: 1;
		overflow: hidden;

	}

	.msgBox::-webkit-scrollbar {
		display: none;
	}

	/* 自定义顶部栏 */
	.custom-header {
		
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 100rpx;
		padding: 0 30rpx;
		background-color: #4475C9;
		border-bottom: 2rpx solid #e0e0e0;
	}

	.left,
	.right {
		font-size: 32rpx;
		color: #333;
	}

	.title {
		font-size: 32rpx;
		font-weight: 600;
		color: white;
	}

	.backimg {
		width: 50rpx;
		height: 50rpx;
	}

	.nav-icon_more {
		width: 40rpx;
		height: 8rpx;
	}

	/* 菜单样式 */
	.menu {
		position: absolute;
		top: 100rpx;
		right: 30rpx;
		width: 200rpx;
		background-color: #fff;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
		border-radius: 8rpx;
		z-index: 999;

	}

	.menu-item {
		padding: 24rpx;
		font-size: 32rpx;
		border-bottom: 2rpx solid #f0f0f0;
	}

	.menu-item:last-child {
		border-bottom: none;
	}

	.msgBox {
		display: flex;
		/* overflow: hidden; */
		flex-direction: column;
		align-items: center;
		/* height: calc(100% - 100rpx); */
		height: 100%;
		overflow: auto;

	}

	.histrayTime {
		margin-top: 15rpx;
		text-align: center;
		color: #999;
		font-size: 24rpx;
	}

	/* 卡片样式 */
	.card {
		background-color: white;
		margin-top: 20rpx;
		padding: 30rpx;
		border-radius: 10rpx;
		border-bottom-right-radius: 0;
		border-bottom-left-radius: 0;
		box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
		box-sizing: border-box;
		width: 680rpx;

	}

	.card-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 20rpx;
		align-items: center;

	}

	.card-title {
		font-size: 32rpx;
		font-weight: 600;
	}

	.status {
		font-size: 28rpx;
		color: #969696;
	}

	.amountBox {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.amount {
		font-size: 70rpx;
		/* font-weight: bold; */
		color: #000;
		/* margin: 10rpx; */
		margin-bottom: 30rpx;
	}

	.info-row {
		display: flex;
		/* justify-content: space-between; */
		margin-bottom: 16rpx;
		font-size: 30rpx;
	}

	.label {
		/* width:200rpx; */
		color: #969696;
	}

	.value {
		/* font-size: 32rpx; */
		color: #000;
	}

	.info-box {
		background-color: white;
		border-top: 2rpx solid #f5f5f5;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-sizing: border-box;
		padding: 28rpx 20rpx;
		margin-bottom: 20rpx;
	}

	.info-box_title {
		font-size: 32rpx;
		/* font-weight: bold; */
	}

	.icon-right {
		width: 30rpx;
		height: 30rpx;
	}

	/* 弹窗表单 */
	.popup {
		width: 80vw;
		background-color: white;
		padding: 40rpx;
		border-radius: 20rpx;
	}

	.popup-title {
		font-size: 36rpx;
		margin-bottom: 40rpx;
	}

	.picker {
		padding: 20rpx;
		background-color: #f0f0f0;
		margin-bottom: 30rpx;
	}

	.input {
		width: 100%;
		padding: 20rpx;
		border-radius: 10rpx;
		border: 2rpx solid #ccc;
	}

	.btn-save {
		background-color: #007AFF;
		color: white;
		padding: 24rpx;
		border-radius: 10rpx;
		margin-top: 20rpx;
	}
</style>
