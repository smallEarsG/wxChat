<template>
	<view>
		<uni-popup ref="popup" type="center">
			<view class="popup-content">
				<view class="form-header">
					<text class="title">编辑消息</text>
					<view class="close-btn" @click="$refs.popup.close()">
						<uni-icons type="close" size="24" color="#666" />
					</view>
				</view>
				
				<view class="form-body">
					<view class="form-item">
						<text class="label">头像</text>
						<view class="avatar-box" @click="chooseImage">
							<image 
								:src="info.avatarUrl" 
								class="avatar" 
								v-if="info.avatarUrl" 
								mode="aspectFill" 
							/>
							<text v-else class="avatar-placeholder">
								<uni-icons type="camera" size="20" color="#999" />
								<text class="placeholder-text">点击上传</text>
							</text>
						</view>
					</view>

					<view class="form-item">
						<text class="label">昵称</text>
						<view class="input-wrapper">
							<uni-icons type="person" size="18" color="#999" class="input-icon" />
							<input 
								v-model="info.name" 
								class="input" 
								placeholder="请输入昵称" 
								placeholder-class="placeholder"
							/>
						</view>
					</view>

					<view class="form-item">
						<text class="label">时间</text>
						<view class="input-wrapper">
							<uni-icons type="time" size="18" color="#999" class="input-icon" />
							<input 
								v-model="info.createdAt" 
								class="input" 
								placeholder="请输入时间" 
								placeholder-class="placeholder"
							/>
						</view>
					</view>
					
					<view class="form-item">
						<text class="label">未读消息条数</text>
						<view class="input-wrapper">
							<uni-icons type="message" size="18" color="#999" class="input-icon" />
							<input 
								v-model="info.chatIndex" 
								class="input" 
								type="number" 
								placeholder="请输入未读条数" 
								placeholder-class="placeholder"
							/>
						</view>
					</view>
					
					<view class="form-item">
						<text class="label">备注</text>
						<view class="input-wrapper">
							<uni-icons type="edit" size="18" color="#999" class="input-icon" />
							<input 
								v-model="info.description" 
								class="input" 
								placeholder="请输入备注" 
								placeholder-class="placeholder"
							/>
						</view>
					</view>
				</view>
				
				<view class="form-footer">
					<button class="btn-cancel" @click="$refs.popup.close()">取消</button>
					<button class="btn-submit" @click="submit">提交</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
export default {
	name: 'ProMsgEditPopup',
	watch: {
		msgInfo(newVal, oldVal) {
			this.info = newVal
			console.log(this.info);
		}
	},
	data() {
		return {
			info: {
				avatarUrl: '',
				name: '',
				createdAt: '8:12',
				chatIndex: 0,
				description: ''
			}
		};
	},
	methods: {
		open(it) {
			this.info = it
			this.$refs.popup.open('center');
		},
		chooseImage() {
			uni.chooseImage({
				count: 1,
				success: (res) => {
					this.info.avatarUrl = res.tempFilePaths[0];
				}
			});
		},
		submit() {
			if (!this.info.name.trim()) {
				return uni.showToast({
					title: '昵称不能为空',
					icon: 'none'
				});
			}
			this.$emit('submit', {
				...this.info
			});
			this.$refs.popup.close();
		}
	}
};
</script>

<style scoped>
/* 弹窗整体样式 */
.popup-content {
	width: 680rpx;
	background-color: #fff;
	border-radius: 24rpx;
	overflow: hidden;
	box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
}

/* 表单头部 */
.form-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx 40rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.title {
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

.close-btn:hover {
	background-color: #f5f5f5;
}

/* 表单主体 */
.form-body {
	padding: 40rpx;
}

.form-item {
	margin-bottom: 36rpx;
}

.label {
	font-size: 28rpx;
	margin-bottom: 16rpx;
	display: block;
	color: #666;
}

/* 头像上传区域 */
.avatar-box {
	width: 140rpx;
	height: 140rpx;
	background: #f8f8f8;
	border-radius: 50%;
	overflow: hidden;
	display: flex;
	align-items: center;
	justify-content: center;
	border: 2rpx dashed #e0e0e0;
	transition: all 0.2s;
}

.avatar-box:hover {
	border-color: #007aff;
}

.avatar {
	width: 100%;
	height: 100%;
	border-radius: 50%;
}

.avatar-placeholder {
	color: #999;
	font-size: 24rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.placeholder-text {
	margin-top: 8rpx;
}

/* 输入框样式 */
.input-wrapper {
	position: relative;
}

.input-icon {
	position: absolute;
	left: 24rpx;
	top: 50%;
	transform: translateY(-50%);
}

.input {
	border: 1rpx solid #e6e6e6;
	border-radius: 16rpx;
	padding: 24rpx 24rpx 24rpx 68rpx;
	width: 100%;
	font-size: 28rpx;
	height: 88rpx;
	box-sizing: border-box;
	transition: border-color 0.2s;
}

.input:focus {
	border-color: #007aff;
	outline: none;
}

.placeholder {
	color: #bbb;
}

/* 表单底部按钮 */
.form-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30rpx 40rpx;
	border-top: 1rpx solid #f0f0f0;
}

.btn-cancel, .btn-submit {
	flex: 1;
	padding: 20rpx;
	text-align: center;
	border-radius: 16rpx;
	font-size: 30rpx;
	transition: all 0.2s;
}

.btn-cancel {
	color: #666;
	background-color: #f5f5f5;
	margin-right: 20rpx;
}

.btn-cancel:hover {
	background-color: #f0f0f0;
}

.btn-submit {
	color: #fff;
	background-color: #007aff;
}

.btn-submit:hover {
	background-color: #0062cc;
}

.btn-submit:active {
	background-color: #0052a8;
}
</style>
