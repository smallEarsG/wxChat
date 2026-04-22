<template>
	<view class="container">
		<!-- 全局水印层 -->
		<WatermarkLayer />
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
						<view class="card" @tap="handleCardTap(i)">
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
								<view class="value">客户<text style="color: #4bc768;">@{{ infrom.customer }}</text>
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
								<view class="value">{{ getPaymentSummaryText(infrom, i) }}</view>
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
						<view class="card" @tap="handleCardTap(i)">
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
				<view class="popup-content">
					<view class="popup-header">
						<text class="popup-title">{{ editingIndex >= 0 ? '编辑通知' : '新增通知' }}</text>
						<view class="close-btn" @click="closePopup">
							<uni-icons type="close" size="24" color="#666" />
						</view>
					</view>

					<scroll-view class="popup-body" scroll-y>
						<!-- 选择通知类型 -->
						<view class="form-item">
							<text class="form-label">通知类型</text>
							<picker @change="onTypeChange" :value="formData.typeIndex" :range="typeOptions">
								<view class="picker-wrapper">
									<text class="picker-text">{{ typeOptions[selectedTypeIndex] }}</text>
									<uni-icons type="arrowdown" size="16" color="#999" />
								</view>
							</picker>
						</view>

						<!-- 通用字段 -->
						<view class="form-item">
							<text class="form-label">展示时间</text>
							<view class="input-wrapper">
								<uni-icons type="calendar" size="18" color="#999" class="input-icon" />
								<input class="form-input" v-model="formData.time" placeholder="请输入展示时间" />
							</view>
						</view>

						<view class="form-item">
							<text class="form-label">收款金额</text>
							<view class="input-wrapper">
								<uni-icons type="wallet" size="18" color="#999" class="input-icon" />
								<input class="form-input" v-model="formData.amount" placeholder="请输入收款金额" type="digit" />
							</view>
						</view>

						<view class="form-item">
							<text class="form-label">收款账号</text>
							<view class="input-wrapper">
								<uni-icons type="contact" size="18" color="#999" class="input-icon" />
								<input class="form-input" v-model="formData.account" placeholder="请输入收款账号" />
							</view>
						</view>

						<!-- 动态输入项 -->
						<!-- 收款通知 -->
						<block v-if="selectedTypeIndex === 0">
							<view class="form-item">
								<text class="form-label">付款形式</text>
								<view class="input-wrapper">
									<uni-icons type="loop" size="18" color="#999" class="input-icon" />
									<input class="form-input" v-model="formData.orderType" placeholder="请输入转账形式" />
								</view>
							</view>

							<view class="form-item">
								<text class="form-label">付款客户</text>
								<view class="input-wrapper">
									<uni-icons type="person" size="18" color="#999" class="input-icon" />
									<input class="form-input" v-model="formData.customer" placeholder="请输入付款客户" />
								</view>
							</view>

							<view class="form-item">
								<text class="form-label">收款成员</text>
								<view class="input-wrapper">
									<uni-icons type="staff" size="18" color="#999" class="input-icon" />
									<input class="form-input" v-model="formData.member" placeholder="请输入收款成员" />
								</view>
							</view>

							<view class="form-item">
								<text class="form-label">汇款说明</text>
								<view class="input-wrapper">
									<uni-icons type="info" size="18" color="#999" class="input-icon" />
									<input class="form-input" v-model="formData.desc" placeholder="请输入汇款说明" />
								</view>
							</view>

							<!-- <view class="form-item">
								<text class="form-label">收款笔数</text>
								<view class="input-wrapper">
									<uni-icons type="list" size="18" color="#999" class="input-icon" />
									<input class="form-input" v-model="formData.count" placeholder="请输入收款笔数" type="number" />
								</view>
							</view>

							<view class="form-item">
								<text class="form-label">收款总金额</text>
								<view class="input-wrapper">
									<uni-icons type="wallet" size="18" color="#999" class="input-icon" />
									<input class="form-input" v-model="formData.totalAmount" placeholder="请输入收款总金额" type="digit" />
								</view>
							</view> -->
						</block>

						<!-- 提现通知 -->
						<block v-if="selectedTypeIndex === 1">
							<view class="form-item">
								<text class="form-label">提现状态</text>
								<view class="input-wrapper">
									<uni-icons type="checkmarkempty" size="18" color="#999" class="input-icon" />
									<input class="form-input" v-model="formData.state" placeholder="请输入提现状态" />
								</view>
							</view>

							<view class="form-item">
								<text class="form-label">提现商户号</text>
								<view class="input-wrapper">
									<uni-icons type="shop" size="18" color="#999" class="input-icon" />
									<input class="form-input" v-model="formData.shopId" placeholder="请输入提现商户号" />
								</view>
							</view>

							<view class="form-item">
								<text class="form-label">到账时间</text>
								<view class="input-wrapper">
									<uni-icons type="calendar" size="18" color="#999" class="input-icon" />
									<input class="form-input" v-model="formData.withdrawTime" placeholder="请输入到账时间" />
								</view>
							</view>
						</block>
					</scroll-view>

					<!-- 按钮组 -->
					<view class="popup-footer">
						<button class="btn-cancel" @click="closePopup">取消</button>
						<button class="btn-save" @click="saveForm">保存</button>
					</view>
				</view>
			</uni-popup>

		</view>
	</view>
</template>

<script>
	export default {
		onLoad() {
			// 从本地存储读取数据
			this.loadRecordsFromStorage();
		},
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
						receiveTime: '2025-03-25 22:46',
						count: 1,
						totalAmount: '398.00'
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
				
				},
				editingIndex: -1, // 当前正在编辑的记录索引，-1表示新增
				lastTapTime: 0, // 用于双击检测
				lastTapIndex: -1 // 上次点击的索引
			};
		},
		methods: {
			toMoneyNumber(value) {
				const num = parseFloat(value);
				return Number.isFinite(num) ? num : 0;
			},
			formatMoney(value) {
				return this.toMoneyNumber(value).toFixed(2);
			},
			getPaymentSummaryText(record, currentIndex) {
				if (Number(record.typeIndex) !== 0) return '';
				const summary = {
					count: 0,
					totalAmount: 0
				};
				this.informList.forEach((item, index) => {
					if (index > currentIndex) return;
					if (String(item.orderType || '').trim() !== '对外汇款') return;
					summary.count += 1;
					summary.totalAmount += this.toMoneyNumber(item.amount);
				});
				return `今日成员收款${summary.count}笔，共${this.formatMoney(summary.totalAmount)}元`;
			},
		
			// 返回上一页
			goBack() {
				uni.navigateBack();
			},

			// 展开或关闭功能菜单
			toggleMenu() {
				this.showMenu = !this.showMenu;
			},

			// 打开编辑表单（新增）
			openEditForm() {
				this.showMenu = false;
				this.editingIndex = -1; // 设置为新增模式
				this.resetForm();
				this.$refs.popupForm.open('center');
			},
			
			// 处理卡片点击（双击检测）
			handleCardTap(index) {
				const currentTime = Date.now();
				const timeDiff = currentTime - this.lastTapTime;
				
				// 如果是在300ms内点击了同一个卡片，认为是双击
				if (timeDiff < 300 && this.lastTapIndex === index) {
					this.editRecord(index);
					// 重置，避免连续触发
					this.lastTapTime = 0;
					this.lastTapIndex = -1;
				} else {
					// 记录点击时间和索引
					this.lastTapTime = currentTime;
					this.lastTapIndex = index;
					// 300ms后重置，避免误判
					setTimeout(() => {
						if (this.lastTapIndex === index) {
							this.lastTapTime = 0;
							this.lastTapIndex = -1;
						}
					}, 300);
				}
			},
			
			// 编辑记录（双击卡片）
			editRecord(index) {
				if (index >= 0 && index < this.informList.length) {
					this.editingIndex = index; // 设置为编辑模式
					const record = this.informList[index];
					
					// 填充表单数据
					this.formData = {
						typeIndex: record.typeIndex || 0,
						time: record.time || '',
						amount: record.amount || '0.00',
						account: record.account || '',
						orderType: record.orderType || '',
						customer: record.customer || '',
						member: record.member || '',
						desc: record.desc || '',
						count: record.count || 1,
						totalAmount: record.totalAmount || record.amount || '0.00',
						state: record.state || '',
						shopId: record.shopId || '',
						withdrawTime: record.withdrawTime || ''
					};
					
					this.selectedTypeIndex = record.typeIndex || 0;
					this.$refs.popupForm.open('center');
				}
			},

			// 重置表单
			resetForm() {
				const now = new Date();
				const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
				const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${timeStr}`;
				
				this.formData = {
					typeIndex: 0,
					time: timeStr,
					amount: '0.00',
					account: '建设银行（尾号**25）',
					orderType: '对外汇款',
					customer: '微信',
					member: '开发者团队@小七',
					desc: '',
					count: 1,
					totalAmount: '0.00',
					state: '提现成功',
					shopId: '',
					withdrawTime: dateStr
				};
				this.selectedTypeIndex = 0;
				this.editingIndex = -1; // 重置为新增模式
			},
			
			// 关闭弹窗
			closePopup() {
				this.$refs.popupForm.close();
				this.editingIndex = -1; // 重置编辑索引
			},

			// 选择通知类型
			onTypeChange(e) {
				this.selectedTypeIndex = e.detail.value;
				this.formData.typeIndex = e.detail.value;
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
				// 保存到本地存储
				this.saveRecordsToStorage();
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
				this.formData.typeIndex = this.selectedTypeIndex;
				
				// 如果是收款通知，确保有 count 和 totalAmount
				if (this.selectedTypeIndex === 0) {
					if (!this.formData.count) {
						this.formData.count = 1;
					}
					if (!this.formData.totalAmount) {
						this.formData.totalAmount = this.formData.amount;
					}
				}
				
				// 深拷贝表单数据，避免引用问题
				const newRecord = JSON.parse(JSON.stringify(this.formData));
				
				// 判断是编辑还是新增
				if (this.editingIndex >= 0 && this.editingIndex < this.informList.length) {
					// 编辑模式：更新现有记录
					this.$set(this.informList, this.editingIndex, newRecord);
					uni.showToast({
						title: '更新成功',
						icon: 'success'
					});
				} else {
					// 新增模式：添加新记录
					this.informList.push(newRecord);
					uni.showToast({
						title: '保存成功',
						icon: 'success'
					});
				}
				
				// 保存到本地存储
				this.saveRecordsToStorage();
				
				this.$refs.popupForm.close(); // 关闭弹窗
				this.editingIndex = -1; // 重置编辑索引
			},
			
			// 从本地存储读取数据
			loadRecordsFromStorage() {
				try {
					const savedRecords = uni.getStorageSync('recordsList');
					if (savedRecords) {
						const records = JSON.parse(savedRecords);
						if (Array.isArray(records) && records.length > 0) {
							this.informList = records;
							console.log('已从本地存储加载数据:', records);
						}
					}
				} catch (error) {
					console.error('读取本地存储失败:', error);
				}
			},
			
			// 保存数据到本地存储
			saveRecordsToStorage() {
				try {
					uni.setStorageSync('recordsList', JSON.stringify(this.informList));
					console.log('已保存数据到本地存储:', this.informList);
				} catch (error) {
					console.error('保存到本地存储失败:', error);
					uni.showToast({
						title: '保存失败',
						icon: 'none'
					});
				}
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
	.popup-content {
		width: 680rpx;
		background-color: #fff;
		border-radius: 24rpx;
		overflow: hidden;
		box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
		max-height: 80vh;
		display: flex;
		flex-direction: column;
	}

	.popup-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx 40rpx;
		border-bottom: 1rpx solid #f0f0f0;
		flex-shrink: 0;
	}

	.popup-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}

	.close-btn {
		width: 40rpx;
		height: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: background-color 0.2s;
	}

	.close-btn:active {
		background-color: #f5f5f5;
	}

	.popup-body {
		flex: 1;
		padding: 40rpx;
		max-height: 60vh;
		overflow-y: auto;
	}

	.form-item {
		margin-bottom: 36rpx;
		overflow: hidden;
		width: 600rpx;
	}

	.form-label {
		font-size: 28rpx;
		margin-bottom: 16rpx;
		display: block;
		color: #666;
		font-weight: 500;
	}

	.picker-wrapper {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 24rpx;
		background-color: #f5f7fa;
		border: 1rpx solid #e6e6e6;
		border-radius: 16rpx;
		transition: border-color 0.2s;
	}

	.picker-wrapper:active {
		border-color: #007aff;
		background-color: #f0f7ff;
	}

	.picker-text {
		font-size: 28rpx;
		color: #333;
	}

	.input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.input-icon {
		position: absolute;
		left: 24rpx;
		z-index: 1;
	}

	.form-input {
		border: 1rpx solid #e6e6e6;
		border-radius: 16rpx;
		padding: 24rpx 24rpx 24rpx 68rpx;
		width: 100%;
		font-size: 28rpx;
		height: 80rpx;
		box-sizing: border-box;
		transition: border-color 0.2s;
		background-color: #fff;
	}

	.form-input:focus {
		border-color: #007aff;
		outline: none;
	}

	.popup-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx 40rpx;
		border-top: 1rpx solid #f0f0f0;
		flex-shrink: 0;
		gap: 20rpx;
	}

	.btn-cancel,
	.btn-save {
		flex: 1;
		padding: 20rpx;
		text-align: center;
		border-radius: 16rpx;
		font-size: 30rpx;
		transition: all 0.2s;
		border: none;
	}

	.btn-cancel {
		color: #666;
		background-color: #f5f5f5;
	}

	.btn-cancel:active {
		background-color: #f0f0f0;
	}

	.btn-save {
		background-color: #007aff;
		color: #fff;
	}

	.btn-save:active {
		background-color: #0062cc;
	}
</style>
