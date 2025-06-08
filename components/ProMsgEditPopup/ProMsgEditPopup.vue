<template>
	<view>
		<uni-popup ref="popup" type="center">
			<view class="popup-content">
				<view class="form-item">
					<text class="label">头像</text>
					<view class="avatar-box" @click="chooseImage">
						<image :src="this.info.avatarUrl" class="avatar" v-if="this.info.avatarUrl" mode="aspectFill" />
						<text v-else class="avatar-placeholder">点击上传</text>
					</view>
				</view>

				<view class="form-item">
					<text class="label">昵称</text>
					<input v-model="info.name" class="input" placeholder="请输入昵称" />
				</view>

				<view class="form-item">
					<text class="label">时间</text>
					<input v-model="info.createdAt" class="input" placeholder="请输入时间" />
					<!-- <textarea v-model="description" class="textarea" placeholder="请输入简介"></textarea> -->
				</view>

				<button class="btn" @click="submit">提交</button>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	export default {
		name: 'ProMsgEditPopup',
		// msgInfo: {
		// 	type: Object,
		// 	required: true
		// },
		watch: {
			msgInfo(newVal, oldVal) {
				this.info = newVal
				console.log(this.info);
				// 当parentData变化时，重新赋值子组件参数
				// this.childData = newVal + '_processed'; // 示例处理逻辑
				// this.fetchData(newVal); // 调用其他方法
			}
		},
		data() {
			return {
				info: {
					avatarUrl: '',
					name: '',
					createdAt: '8:12',
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

						console.log(res,this.info);
						this.info.avatarUrl = res.tempFilePaths[0];
						console.log(res,this.info);
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
					// avatar: this.avatar,
					// name: this.name,
					// createdAt: this.createdAt
					...this.info
				});
				this.info = ''
				this.$refs.popup.close();
			}
		}
	};
</script>

<style scoped>
	.popup-content {
		width: 600rpx;
		background-color: #fff;
		padding: 30rpx;
		border-radius: 16rpx;
	}

	.form-item {
		margin-bottom: 30rpx;
	}

	.label {
		font-size: 28rpx;
		margin-bottom: 10rpx;
		display: block;
		color: #333;
	}

	.avatar-box {
		width: 120rpx;
		height: 120rpx;
		background: #f0f0f0;
		border-radius: 50%;
		overflow: hidden;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.avatar {
		width: 100%;
		height: 100%;
		border-radius: 50%;
	}

	.avatar-placeholder {
		color: #999;
		font-size: 24rpx;
	}

	.input {
		border: 1px solid #ccc;
		border-radius: 8rpx;
		padding: 10rpx;
		width: 100%;
		font-size: 28rpx;
	}

	.textarea {
		border: 1px solid #ccc;
		border-radius: 8rpx;
		padding: 10rpx;
		width: 100%;
		height: 120rpx;
		font-size: 28rpx;
	}

	.btn {
		background-color: #007aff;
		color: #fff;
		padding: 16rpx;
		text-align: center;
		border-radius: 8rpx;
	}
</style>