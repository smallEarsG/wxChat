<template>
	<view class="container" :style="{ paddingTop: statusBarHeight + 'px' }">
		<!-- 全局水印层 -->
		<WatermarkLayer />
		
		<!-- 支付成功图标 -->
		<view class="success">
			<image class="success-icon" src="/static/wxchat/kinda_wechat_pay.png" mode="widthFix"></image>
			<text class="success-text">支付成功</text>
		</view>
		
		<!-- 支付成功文字 -->
		
		
		<!-- 收款方头像和名称 -->
		<view class="receiver-info">
			<view class="avatar-container" @click="openAvatarUpload">
				<image class="avatar-image" :src="avatar" mode="aspectFill"></image>
			</view>
			<text class="receiver-name" @click="openEditModal('receiverName')">{{ receiverName }}</text>
		</view>
		
		<!-- 上传头像弹窗 -->
		<UploadImage ref="avatarPopup" @submit="onAvatarSubmit"></UploadImage>
		
		<!-- 金额显示 -->
		<view class="amount-container" @click="openEditModal('amount')">
			<text class="amount-symbol">¥</text>
			<text class="amount-value">{{ amount }}</text>
		</view>
		
		<!-- 编辑弹窗 -->
		<view class="modal-mask" v-show="showEditModal" @click="closeEditModal"></view>
		<view class="edit-modal" :class="{ 'modal-show': showEditModal }">
			<view class="modal-header">
				<text class="modal-title">编辑{{ editType === 'amount' ? '金额' : '收款方' }}</text>
				<view class="close-btn" @click="closeEditModal">
					<uni-icons type="closeempty" size="30"></uni-icons>
				</view>
			</view>
			
			<view class="modal-content">
				<view class="form-item">
					<text class="form-label">{{ editType === 'amount' ? '金额' : '收款方' }}</text>
					<input 
						class="form-input" 
						:type="editType === 'amount' ? 'digit' : 'text'"
						v-model="editValue" 
						:placeholder="editType === 'amount' ? '请输入金额' : '请输入收款方名称'"
					>
				</view>
			</view>
			
			<view class="modal-footer">
				<button class="cancel-btn" @click="closeEditModal">取消</button>
				<button class="save-btn" @click="saveEdit">保存</button>
			</view>
		</view>
		
		<!-- 完成按钮 -->
		<view class="footer">
			<view class="complete-btn" @click="goBack">完成</view>
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
				statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
				receiverName: 'Caleb (**金)',
				amount: '0.01',
				avatar: '/static/logo.png', // 默认头像
				showEditModal: false, // 是否显示编辑弹窗
				editType: '', // 编辑类型：amount 或 receiverName
				editValue: '' // 编辑的值
			};
		},
		onLoad(options) {
			// 从本地存储读取头像
			const savedAvatar = uni.getStorageSync('wxPayment_avatar');
			if (savedAvatar) {
				// 检查文件是否存在
				try {
					const fs = uni.getFileSystemManager();
					fs.accessSync(savedAvatar);
					// 文件存在，使用保存的头像
					this.avatar = savedAvatar;
				} catch (e) {
					// 文件不存在，清除存储，使用默认头像
					console.log('保存的头像文件不存在，使用默认头像');
					uni.removeStorageSync('wxPayment_avatar');
					this.avatar = '/static/logo.png';
				}
			}
			
			// 从本地存储读取金额和收款方
			const savedAmount = uni.getStorageSync('wxPayment_amount');
			if (savedAmount) {
				this.amount = savedAmount;
			}
			const savedReceiverName = uni.getStorageSync('wxPayment_receiverName');
			if (savedReceiverName) {
				this.receiverName = savedReceiverName;
			}
			
			// 从路由参数获取数据（优先级高于本地存储）
			if (options.receiverName) {
				this.receiverName = decodeURIComponent(options.receiverName);
			}
			if (options.amount) {
				this.amount = decodeURIComponent(options.amount);
			}
		},
		methods: {
			// 打开头像上传弹窗
			openAvatarUpload() {
				this.$refs.avatarPopup.open();
			},
			// 头像上传成功回调
			onAvatarSubmit(data) {
				if (data && data.avatar) {
					const tempFilePath = data.avatar;
					// 将临时文件保存为永久文件
					uni.saveFile({
						tempFilePath: tempFilePath,
						success: (saveRes) => {
							// 使用永久文件路径
							this.avatar = saveRes.savedFilePath;
							// 持久化保存头像路径
							uni.setStorageSync('wxPayment_avatar', saveRes.savedFilePath);
							uni.showToast({
								title: '头像更新成功',
								icon: 'success'
							});
						},
						fail: (err) => {
							console.error('保存头像失败:', err);
							// 如果保存失败，仍然使用临时路径（至少当前会话可用）
							this.avatar = tempFilePath;
							uni.setStorageSync('wxPayment_avatar', tempFilePath);
							uni.showToast({
								title: '保存头像失败，请重试',
								icon: 'none'
							});
						}
					});
				}
			},
			// 打开编辑弹窗
			openEditModal(type) {
				this.editType = type;
				this.editValue = type === 'amount' ? this.amount : this.receiverName;
				this.showEditModal = true;
			},
			// 关闭编辑弹窗
			closeEditModal() {
				this.showEditModal = false;
				this.editValue = '';
			},
			// 保存编辑
			saveEdit() {
				if (!this.editValue || !this.editValue.trim()) {
					uni.showToast({
						title: '请输入内容',
						icon: 'none'
					});
					return;
				}
				
				if (this.editType === 'amount') {
					this.amount = this.editValue.trim();
					// 持久化保存金额
					uni.setStorageSync('wxPayment_amount', this.amount);
				} else if (this.editType === 'receiverName') {
					this.receiverName = this.editValue.trim();
					// 持久化保存收款方
					uni.setStorageSync('wxPayment_receiverName', this.receiverName);
				}
				
				uni.showToast({
					title: '保存成功',
					icon: 'success'
				});
				this.closeEditModal();
			},
			// 返回上一页
			goBack() {
				uni.navigateBack();
			}
		}
	};
</script>

<style>
	.success{
		display: flex;
		color: #1aad19;
		align-items: center;
		margin-top: 36rpx;
	}
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		background-color: #ffffff;
		min-height: 100vh;
		/* padding-top: 100rpx; */
		box-sizing: border-box;
	}

	.success-icon {
		width: 38rpx;
	}

	.checkmark {
		color: #ffffff;
		font-size: 80rpx;
		font-weight: bold;
		line-height: 1;
	}

	.success-text {
		font-size: 32rpx;
		font-weight: 500;
		margin-left: 20rpx;
		/* margin-bottom: 80rpx; */
	}

	.receiver-info {
		margin-top: 170rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 60rpx;
	}

	.avatar-container {
		width: 90rpx;
		height: 90rpx;
		border-radius: 50%;
		/* background-color: #007aff; */
		border: 4rpx solid #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 30rpx;
		/* box-shadow: 0 4rpx 12rpx rgba(0, 122, 255, 0.2); */
		overflow: hidden;
		cursor: pointer;
	}
	
	.avatar-image {
		width: 100%;
		height: 100%;
		border-radius: 50%;
	}

	.avatar-icon {
		font-size: 50rpx;
		color: #ffffff;
	}

	.receiver-name {
		font-size: 32rpx;
		color: #333333;
		font-weight: 400;
		cursor: pointer;
	}

	.amount-container {
		display: flex;
		align-items: baseline;
		justify-content: center;
		margin-bottom: 200rpx;
		font-family: "WeChat Sans Std";
		font-size: 88rpx;
		cursor: pointer;
		/* font-family: "Bahnschrift"; */
		/* font-family: "WeChat Sans SS"; */
	}

	.amount-symbol {
		
		color: #000000;
		font-weight: 400;
		margin-right: 8rpx;
	}

	.amount-value {
		
		color: #000000;
		font-weight: 400;
		line-height: 1;
	}

	.footer {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		padding: 40rpx 60rpx;
		padding-bottom: calc(180rpx + env(safe-area-inset-bottom));
		background-color: #ffffff;
		box-sizing: border-box;
		display: flex;
		justify-content: center;
		/* text-align:; */
		
	}

	.complete-btn {
		width: 360rpx;
		height: 88rpx;
		line-height: 88rpx;
		text-align: center;
		background-color: #f0f0f0;
		color: #333333;
		border-radius: 16rpx;
		font-size: 34rpx;
		border: none;
		padding: 0;
		font-weight: 600;
	}

	.complete-btn:active {
		background-color: #e0e0e0;
	}
	
	/* 编辑弹窗样式 */
	.modal-mask {
		position: fixed;
		z-index: 998;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		transition: opacity 0.3s ease;
	}
	
	.edit-modal {
		position: fixed;
		z-index: 999;
		bottom: -100%;
		left: 0;
		width: 100%;
		background-color: #fff;
		border-radius: 30rpx 30rpx 0 0;
		transition: bottom 0.3s ease;
		max-height: 80vh;
		overflow: hidden;
	}
	
	.modal-show {
		bottom: 0;
	}
	
	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 30rpx 40rpx;
		border-bottom: 1rpx solid #eee;
	}
	
	.modal-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
	}
	
	.close-btn {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}
	
	.modal-content {
		padding: 40rpx;
	}
	
	.form-item {
		display: flex;
		align-items: center;
		padding: 30rpx 0;
		border-bottom: 1rpx solid #eee;
	}
	
	.form-label {
		width: 200rpx;
		font-size: 30rpx;
		color: #666;
	}
	
	.form-input {
		flex: 1;
		font-size: 30rpx;
		color: #333;
		height: 60rpx;
		padding: 0 20rpx;
	}
	
	.modal-footer {
		display: flex;
		justify-content: center;
		padding: 40rpx;
		border-top: 1rpx solid #eee;
		gap: 20rpx;
	}
	
	.cancel-btn, .save-btn {
		flex: 1;
		height: 88rpx;
		line-height: 88rpx;
		text-align: center;
		border-radius: 16rpx;
		font-size: 36rpx;
		border: none;
	}
	
	.cancel-btn {
		background-color: #f5f5f5;
		color: #333;
	}
	
	.save-btn {
		background-color: #277ef1;
		color: #fff;
	}
</style>
