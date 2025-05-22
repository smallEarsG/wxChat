<template>
	<view class="container">
		<!-- 自定义顶部栏 -->
		<view class="custom-header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="left" @click="goBack">
				<!-- <image class="backimg" src="../../static/left.png" /> -->
				<uni-icons type="left" size="25"></uni-icons>
			</view>
			<view class="title">微信支付</view>
			<view class="right" @click="toggleMenu">
				<view style="padding: 2rpx;">
					<image class="nav-icon_more" src="/static/search.png"></image>
				</view>
				<!-- <uni-icons type="left" size="25"></uni-icons> -->
				<uni-icons type="gear" size="27"></uni-icons>
			</view>
		</view>

		<view class="content">
			<!-- 功能菜单 -->
			<!-- 	<view class="menu" v-if="showMenu">
				<view class="menu-item" @click="openEditForm">编辑</view>
			</view> -->
			<view class="msgBox" ref="msgBox" id="msgBox">
				<!-- 收款通知：可左滑删除 -->
				<uni-swipe-action>
					<block v-for="(infrom ,i) in informList"> 
						<uni-swipe-action-item  :options="deleteOptions"
							@click="deleteRecord(i)">
							<view class="histrayTime" v-if="infrom.time">{{infrom.time}}</view>
							<view class="card">
								<view class="card-header">
									<!-- v-if="infrom.typeIndex==0" -->
									<view class="card-title">  {{infrom.typeIndex ==0?"转账到银行卡已发起":"转账到银行卡到账成功"}}</view>
									<view class="more">⋯</view>
								</view>
								<view class="info-row">
									<text class="label">转账金额：</text>
									<view class="value">￥{{ infrom.amount }}</view>
								</view>
								<view class="info-row">
									<text class="label">收款方：</text>
									<view class="value">{{ infrom.member }}</view>
								</view>
								<view class="info-row">
									<text class="label">收款账户：</text>
									<view class="value">{{ infrom.account }}</view>
								</view>
								<view class="info-row">
									<text class="label">{{infrom.typeIndex ==0?"预计到账时间":"到账时间"}}：</text>
									<view class="value">{{ infrom.receiveTime }}</view>
								</view>
								<view class="info-row" v-if="infrom.desc">
									<text class="label">备注：</text>
									<view class="value">{{ infrom.desc }}</view>
								</view>

							</view>
						  <view style="background-color: white;display: flex;align-items: center;justify-content: center;">
						  		<view class="Line" />
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
			<view class="footer">

				<view class="footer_icon">
					<!-- <view style="padding: 2rpx;"> -->
						<image class="nav-icon_cicle" src="/static/cicle-keyboard.png"></image>
					<!-- </view> -->
				</view>
				<view class="footer_btn">
					<view class="leftLine" />
					<view class="order" @click="changeOrderPorp">
						我的账单
						<view class="orderProp" v-show="orderPorp">

							<!-- <view class="propBtn" @click="changeBg">设置背景</view> -->
							<view class="propBtn" @click="openEditForm">添加消息</view>
						</view>
					</view>
					<view class="leftLine" />
					<view class="serivce">
						支付服务
					</view>
				</view>
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

					<view>
						<text>展示时间：</text>
						<input class="input" v-model="formData.time" placeholder="请输入展示时间" />
					</view>
					<view class="">
						<text>收款金额：</text>
						<input class="input" v-model="formData.amount" placeholder="请输入收款金额" />
					</view>
					<view class="">
						<text>收款账号：</text>
						<input class="input" v-model="formData.account" placeholder="请输入收款账号" />
					</view>
					<view>
						<text>到账时间：</text>
						<input class="input" v-model="formData.receiveTime" placeholder="请输入到账时间" />
					</view>

					<view>
						<text>收款方：</text>
						<input class="input" v-model="formData.member" placeholder="请输入收款成员" />
					</view>
					<view>
						<text>汇款说明：</text>
						<input class="input" v-model="formData.desc" placeholder="请输入汇款说明" />
					</view>




					<!-- 保存按钮 -->
					<button class="btn-save" @click="saveForm">保存</button>
				</view>
			</uni-popup>
			<UploadImage ref="photoPopup"  @submit="onPhotoBgSubmit"></UploadImage>
		</view>
	</view>
</template>

<script>
	import UploadImage from '../../components/UploadImage/UploadImage.vue';

	export default {
	components: {
			UploadImage
		},

		data() {
			return {
				orderPorp: false,
				statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
				showMenu: false,
				selectedTypeIndex: 0,
				typeOptions: ['发起转账', '提现到账'],
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
						amount: '398.00',
						member: "开发者团队@小七",
						desc: "点击汇款记录删除消息 这里是备注消息  ",
						account: "建设银行（尾号7825）",
						receiveTime: '两小时内到账'
					},
					{
						typeIndex: 1,
						// time: "点击顶部三个点进行编辑(提示)",
						member: "开发者团队@小七",
						// shopId: "33084273482349",
						amount: '398.00',
						account: "建设银行（尾号**25）",
						receiveTime: '2025-03-26 02:09',
						desc: "点击汇款记录删除消息 这里是备注消息  "
					},
				],
				formData: {

				}
			};
		},
		methods: {
			changeBg(){
				this.$refs.photoPopup.open()
			},
			onPhotoBgSubmit(data){

				 if (data && data.avatar) {
				        try {
				          this.$refs.msgBox.style.background = `url(${data.avatar})`;
				          this.$refs.msgBox.style.backgroundSize = 'cover';
				          this.$refs.msgBox.style.backgroundRepeat = 'no-repeat';
				        } catch (error) {
				          console.error("设置背景样式时出错:", error, JSON.stringify(this.$refs.msgBox.style));
				        }
				      } else {
				        console.error("无效的背景数据:", data);
				      }
			},
			changeOrderPorp() {
				this.orderPorp = !this.orderPorp
			},
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
				
						typeIndex: 0,
						time: "下午12:29",
						amount: '398.00',
						member: "开发者团队@小七",
						desc: "点击汇款记录删除消息 这里是备注消息  ",
						account: "建设银行（尾号7825）",
						receiveTime: '两小时内到账'
					
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

				if ( !this.formData.amount) {
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
		display: flex;
		flex-direction: column;
		/* background-color: red; */
		height: 100%;
		overflow: hidden;
		position: relative;

	}

	.footer {
		height: 100rpx;
		background-color: #f7f7f7;
		width: 100%;
		position: absolute;
		bottom: 0;
		display: flex;
		padding-bottom: 20rpx;
		font-size: 30rpx;
		box-sizing: border-box;
	}

	.orderProp {
		position: absolute;
		background-color: #f7f7f7;
		/* left:90rpx ; */
		width: 100%;
		bottom: 58rpx;
		/* border: 1px solid #969696; */
	}

	.footer_icon {
		width: 90rpx;
		/* background-color: #969696; */
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.footer_btn {

		display: flex;
		flex: 1;
		background-color: #f7f7f7;
		align-items: center;
	}

	.propBtn {
		border-bottom: 1px solid #f0f0f0;
		text-align: center;
		align-items: center;
		display: flex;
		justify-content: center;
		height: 100rpx;
	}

	.order,
	.serivce {
		flex: 1;
		text-align: center;
		align-items: center;
		display: flex;
		justify-content: center;
		position: relative;
		/* border-left: 1rpx solid #e0e0e0 ; */
		box-sizing: border-box;
		/* margin-top: 20rpx; */
	}
 .leftLine{
	 margin-top: 10rpx;
	 background-color: #e0e0e0;
	 width: 1rpx;
	 height: 45rpx;
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
		/* background-color: #4475C9; */

		border-bottom: 2rpx solid #e0e0e0;
	}

	.left,
	.right {
		font-size: 32rpx;
		color: #333;
		display: flex;
		/* align-items: center; */
	}

	.title {
		font-size: 34rpx;
		/* font-weight: 700; */
		/* color: white; */
		padding-left: 80rpx;
	}

	.backimg {
		width: 50rpx;
		height: 50rpx;
	}

	.nav-icon_more {
		width: 42rpx;
		height: 42rpx;
		margin-right: 30rpx;
		/* margin-top: 4rpx; */
	}
	.nav-icon_cicle{
		width: 70rpx;
		height: 70rpx;
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
		font-size: 30rpx;
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
		/* height: 100%; */
		/* flex: 1; */
		overflow-y: auto;
		/* overflow: auto; */
		/* padding: 0 40rpx; */
		padding-bottom: 120rpx;

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
		margin-bottom: 46rpx;
		align-items: center;

	}

	.card-title {
		font-size: 30rpx;

		/* font-weight: 600; */
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
		margin-bottom: 20rpx;
		font-size: 30rpx;
	}

	.label {
		width: 240rpx;
		color: #969696;
	}

	.value {
		/* font-size: 32rpx; */
		color: #000;
		flex: 1;
	}

	.info-box {
		background-color: white;
		/* border-top: 2rpx solid #f5f5f5; */
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-sizing: border-box;
		padding: 28rpx 20rpx;
		margin-bottom: 20rpx;
		border-bottom-right-radius: 10rpx;
		border-bottom-left-radius: 10rpx;
	}
	.Line{
		width: 94%;
		height: 2rpx ;
		background-color: #f5f5f5;
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
		overflow: hidden;
		box-sizing: border-box;
	}

	.popup-title {
		font-size: 36rpx;
		margin-bottom: 40rpx;
	}

	.picker {
		padding: 20rpx;
		background-color: #f0f0f0;
		margin-bottom: 30rpx;
		box-sizing: border-box;
	}

	.input {
		width: 100%;
		padding: 20rpx;
		border-radius: 10rpx;
		border: 2rpx solid #ccc;
		box-sizing: border-box;
		height: 100rpx;
	}

	.btn-save {
		background-color: #007AFF;
		color: white;
		padding: 24rpx;
		border-radius: 10rpx;
		margin-top: 20rpx;
	}
</style>