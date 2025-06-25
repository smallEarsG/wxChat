<template>
	<view class="container">
		<!-- 顶部导航 -->
		<view class="header">
			<view class="back-btn" @click="goBack">
				<uni-icons type="arrowleft" size="30" color="#333" />
			</view>
			<text class="page-title">图片文字识别</text>
			<view class="spacer"></view>
		</view>

		<!-- 内容区域 -->
		<view class="content">
			<!-- 功能卡片 -->
			<view class="function-card">
				<view class="card-title">
					<text>识别类型</text>
				</view>

				<view class="card-content">
					<view class="function-item" @click="chooseImage">
						<uni-icons type="camera" size="40" color="#4A90E2" />
						<text>在线识别</text>
						<view class="tag">高精度</view>
					</view>

					<view class="function-item" @click="chooseImage" :disabled="true">
						<uni-icons type="camera-filled" size="40" color="#999" />
						<text>离线识别</text>
						<view class="tag disabled">开发中</view>
					</view>
				</view>
			</view>

			<!-- 图片预览区域 -->
			<view class="image-preview" v-if="imagePath">
				<view class="preview-wrapper">
					<image :src="imagePath" mode="aspectFit" class="preview-image" />
					<view class="overlay"></view>
					<view class="close-btn" @click="clearImage">
						<uni-icons type="close" size="30" color="#fff" />
					</view>
				</view>
			</view>

			<!-- 识别结果区域 -->
			<view class="result-card" v-if="resultList.length > 0">
				<view class="result-header">
					<text class="result-title">识别结果</text>
					<view class="result-stats">
						<text>{{ resultList.length }}行文字</text>
					</view>
				</view>

			<!-- 	<view class="result-content">
					<view class="result-item" v-for="(item, index) in resultList" :key="index">
						<text class="item-text">{{ item.words }}</text>
					</view>
				</view> -->

				<!-- 提取信息 -->
				<view class="extracted-info" v-if="extractedInfo">
					<view class="info-title">已提取信息</view>
					<view class="info-item" v-if="extractedInfo.name || extractedInfo.transferName">
						<text class="info-label">名称:</text>
						<text class="info-value">{{ extractedInfo.name || extractedInfo.transferName || '未识别' }}</text>
					</view>
					<view class="info-item" v-if="extractedInfo.time">
						<text class="info-label">时间:</text>
						<text class="info-value">{{ extractedInfo.time || '未识别' }}</text>
					</view>
					<view class="info-item" v-if="extractedInfo.orderNumber">
						<text class="info-label">单号:</text>
						<text class="info-value">{{ extractedInfo.orderNumber || '未识别' }}</text>
					</view>
				</view>
			</view>

			<!-- 操作按钮  v-if="resultList.length > 0" -->
			<view class="action-buttons">
				<button class="action-btn" @click="goCodePayChild(0)">
					<uni-icons type="moneybag" size="24" color="#fff" />
					<text>转账付款</text>
				</button>
				<button class="action-btn" @click="goCodePayChild(1)">
					<uni-icons type="scan" size="24" color="#fff" />
					<text>扫码付款</text>
				</button>

			</view>
			<view class="action-buttons">
				<button class="action-btn" @click="goCodePayChild(2)" style="margin-bottom: 20px;">
					<!-- <uni-icons type="scan" size="24" color="#fff" /> -->
					<text>第三方付款</text>
				</button>
				<button class="action-btn" @click="goCodePayChild(3)">
					<uni-icons type="moneybag" size="24" color="#fff" />
					<text>第三方小程序</text>
				</button>

			</view>
			<view class="action-buttons">
				<button class="action-btn" @click="goCodePayChild(4)">
					<text>第三方条形码(16位)</text>
				</button>
				<button class="action-btn" @click="goCodePayChild(5)">
					<text>第三方条形码(32位)</text>
				</button>

			</view>

			<button class="history-btn" type="default" @click="goMsg">
				<uni-icons type="history" size="24" color="#4A90E2" />
				<text>修改记录</text>
			</button>
		</view>

		<!-- 加载状态 -->
		<view class="loading-overlay" v-if="isLoading">
			<view class="loading-content">
				<uni-icons type="loading" size="40" color="#4A90E2" class="loading-icon" />
				<text>识别中...</text>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		login
	} from '../../api';

	export default {
		data() {
			return {
				imageBase64: '',
				imagePath: '', // 选中图片路径
				resultList: [], // 识别结果列表
				isLoading: false, // 加载状态
				extractedInfo: null, // 提取的信息
				// 百度云OCR配置（需替换为你的真实信息）
				baiduConfig: {
					apiKey: 'Rk9atFNERmi0vduxtu3zrF0x',
					secretKey: 'iylst8nEtnr5fTek3QWjuXPcruzCFJnK',
					apiUrl: 'https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic' // 高精度通用识别接口
				}
			};
		},
		methods: {
			// async onCradSubmitz(data) {
			// 	console.log(data);
			// 	const baseImg = await this.eadLocalFileToBase64(data.avatar)

			// 	this.roleList.push({
			// 		...data,
			// 		avatar: baseImg
			// 	})
			// 	this.saveRoleList()
			// 	this.info.url = baseImg
			// 	this.saveTflist()
			// },
			goBack() {
				uni.navigateBack();
			},

			goMsg() {
				uni.navigateTo({
					url: '/pages/msgList/msgList'
				});
			},

			extractInfoWithRegex(data) {
				const info = {

					name: '请输入机构名称', //名称
					money: '+100.00', // 金额
					time: '', // 转账时间
					otherTime: '', //收款时间
					payment: '', // 支付方式
					orderNumber: '', //订单编号
					// 第三方付款
					currentState: '', // 当前状态
					shop: '', // 商品
					merchantName: '', // 商户名称
					institution: '', //收款机构
					shopNumber: ' ', // 商单号
					desc: '', //备注
				};

				data.forEach((item, index) => {
					const words = item.words;

					// 二维码付款名称
					const nameMatch = words.match(/扫二维码付款-([^-]+)/);
					if (nameMatch) {
						info.name = nameMatch[1];
						info.money = data[index + 1]?.words;
					}

					// 转账付款名称
					const transferNameMatch = words.match(/转账-([^-]+)/);
					if (transferNameMatch) {
						info.name = transferNameMatch[1];
						info.money = data[index + 1]?.words;
					}

					const payment = words.match(/支付方式/);
					if (payment) info.payment = data[index + 1]?.words;

					const sdesc = words.match(/收款方备注/);
					if (sdesc) info.desc = data[index + 1]?.words;

					const zdesc = words.match(/转账说明/);
					if (zdesc) info.desc = data[index + 1]?.words;

					const shop = words.match(/商品/);
					if (shop) info.shop = data[index + 1]?.words;

					const merchantName = words.match(/商户全称/);
					if (merchantName) info.merchantName = data[index + 1]?.words;

					const institution = words.match(/收单机构/);
					if (institution) info.institution = data[index + 1]?.words;

					const currentState = words.match(/当前状态/);
					if (currentState) info.currentState = data[index + 1]?.words;
					// 时间格式匹配 转账时间和收款时间
					const timeMatch = words.match(/\d{4}年\d{1,2}月\d{1,2}日\d{1,2}[:：]\d{2}[:：]\d{2}/);
					const temp = words.match(/\d{4}年\d{1,2}月\d{1,2}日/);
					if (timeMatch || temp) {
						let tempTime = '';
						if (timeMatch) {
							tempTime = timeMatch[0];
						} else {
							tempTime = temp + ' ' + data[index + 1]?.words;
						}
						if (info.time !== '') {
							info.otherTime = tempTime;
						} else {
							info.time = tempTime;
						}
					}

					// 账单号
					const orderMatch = words.match(/\d{16,32}/);
					if (orderMatch && /转账单号/.test(data[index - 1]?.words)) {
						if (orderMatch[0].length < 31) {
							console.log("====", orderMatch[0].length);
							info.orderNumber = orderMatch[0] + data[index + 1]?.words;
						} else {
							info.orderNumber = orderMatch[0];
						}
					} else if (orderMatch && /交易单号/.test(data[index - 1]?.words)) {
						if (orderMatch[0].length < 28) {
							console.log("====", orderMatch[0].length);
							info.orderNumber = orderMatch[0] + data[index + 1]?.words;
						} else {
							info.orderNumber = orderMatch[0];
						}
					} else if (orderMatch && /商户单号/.test(data[index - 1]?.words)) {
						if (orderMatch[0].length < 28) {
							console.log("====", orderMatch[0].length);
							info.shopNumber = orderMatch[0] + data[index + 1]?.words;
						} else {
							info.shopNumber = orderMatch[0];
						}
					}
				});

				// 格式化日期
				if (info.time) {
					info.time = info.time.replace(/日(\d)/, '日 $1').replace(/：/g, ':');
				}

				if (info.otherTime) {
					info.otherTime = info.otherTime.replace(/日(\d)/, '日 $1').replace(/：/g, ':');
				}

				return info;
			},
			goCodePayChild(i) {
				// 确保信息已提取
				if (!this.extractedInfo) {
					this.extractedInfo = this.extractInfoWithRegex(this.resultList);
				}

				// 复用之前的路由映射配置
				const routeMap = {
					0: '/pages/transfer/transfer',
					1: '/pages/codePayChild/codePayChild',
					2: '/pages/ThirdpartyPayment/ThirdpartyPayment', // 原默认情况
					3: '/pages/miniThirdpartyPayment/miniThirdpartyPayment',
					4: '/pages/barcodeThirdpartyPayment/barcodeThirdpartyPayment',
					5: '/pages/barcodeThirdpartyPayment32/barcodeThirdpartyPayment32'
				};

				// 获取目标路由，默认使用第三方支付页面
				const targetRoute = routeMap[i] || routeMap[2];

				// 构建完整URL
				const url = `${targetRoute}?info=${encodeURIComponent(JSON.stringify(this.extractedInfo))}`;

				// 导航到目标页面
				uni.navigateTo({
					url
				});
			},

			// 选择图片
			chooseImage() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						this.imagePath = res.tempFilePaths[0];
						console.log("获取图片结果", res.tempFiles[0]);
						this.startOcr(); // 选中图片后立即开始识别
					},
					fail: (err) => {
						uni.showToast({
							title: '选择图片失败',
							icon: 'none'
						});
					}
				});
			},

			// 清除图片
			clearImage() {
				this.imagePath = '';
				this.resultList = [];
				this.extractedInfo = null;
			},

			// 开始 OCR 识别
			async startOcr() {
				if (!this.imagePath) return;
				this.isLoading = true;

				try {
					const accessToken = await this.getBaiduAccessToken();
					const result = await this.uploadToBaiduOCR(this.imagePath, accessToken);
					this.handleOcrResult(result);
				} catch (error) {
					console.error('识别失败:', error);
					uni.showToast({
						title: '识别失败，请重试',
						icon: 'none'
					});
				} finally {
					this.isLoading = false;
				}
			},

			// 获取百度云 AccessToken
			getBaiduAccessToken() {
				return new Promise((resolve, reject) => {
					uni.request({
						url: `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${this.baiduConfig.apiKey}&client_secret=${this.baiduConfig.secretKey}`,
						method: 'GET',
						success: (res) => {
							resolve(res.data.access_token);
						},
						fail: (err) => {
							reject(new Error('获取 Token 失败'));
						}
					});
				});
			},

			// 上传图片到百度 OCR
			uploadToBaiduOCR(imagePath, accessToken) {
				return new Promise(async (resolve, reject) => {
					try {
						// 将图片转为 Base64
						const base64Image = await this.readImageAsBase64(imagePath);

						// 发送请求
						uni.request({
							url: `${this.baiduConfig.apiUrl}?access_token=${accessToken}`,
							method: 'POST',
							header: {
								'Content-Type': 'application/x-www-form-urlencoded'
							},
							data: {
								image: base64Image,
								language_type: 'CHN_ENG',
								detect_direction: 'true'
							},
							success: (res) => {
								console.log('百度 OCR 返回:', res.data);
								if (res.statusCode === 200) {
									resolve(res.data);
								} else {
									reject(new Error(`请求失败：${res.statusCode}`));
								}
							},
							fail: (err) => {
								console.error('网络错误:', err);
								reject(err);
							}
						});
					} catch (error) {
						console.error('图片转换失败:', error);
						reject(error);
					}
				});
			},

			// 读取图片为 Base64
			async readImageAsBase64(imagePath) {
				console.log('开始转换图片为 Base64，路径:', imagePath);

				// #ifdef H5
				return new Promise((resolve, reject) => {
					const xhr = new XMLHttpRequest();
					xhr.open('GET', imagePath, true);
					xhr.responseType = 'blob';
					xhr.onload = () => {
						if (xhr.status === 200) {
							const reader = new FileReader();
							reader.onloadend = () => {
								const base64 = reader.result.split(',')[1];
								resolve(base64);
							};
							reader.readAsDataURL(xhr.response);
						} else {
							reject(new Error(`图片加载失败: ${xhr.status}`));
						}
					};
					xhr.onerror = reject;
					xhr.send();
				});
				// #endif

				// 优先使用 uni.readFile
				if (typeof uni.readFile === 'function') {
					try {
						console.log('尝试使用 uni.readFile...');
						const {
							data
						} = await uni.readFile({
							filePath: imagePath,
							encoding: 'base64'
						});
						console.log('uni.readFile 成功，Base64 长度:', data.length);
						return data.replace(/^data:image\/\w+;base64,/, '');
					} catch (err) {
						console.error('uni.readFile 失败:', err);
					}
				}

				// 使用 plus.io
				if (typeof plus !== 'undefined') {
					try {
						console.log('尝试使用 plus.io...');
						return new Promise((resolve, reject) => {
							plus.io.resolveLocalFileSystemURL(imagePath, (entry) => {
								entry.file((file) => {
									const reader = new plus.io.FileReader();
									reader.onloadend = (e) => {
										console.log('plus.io 成功，Base64 长度:', e.target
											.result.length);
										const base64 = e.target.result.split(',')[1];
										resolve(base64);
									};
									reader.onerror = (err) => {
										console.error('plus.io 读取失败:', err);
										reject(new Error(`读取文件失败: ${err.message}`));
									};
									reader.readAsDataURL(file);
								}, (err) => {
									console.error('plus.io 获取文件失败:', err);
									reject(new Error(`获取文件信息失败: ${err.message}`));
								});
							}, (err) => {
								console.error('plus.io 解析路径失败:', err);
								reject(new Error(`解析文件路径失败: ${err.message}`));
							});
						});
					} catch (err) {
						console.error('plus.io 异常:', err);
					}
				}

				// 所有方案都失败
				throw new Error('无法在当前环境读取文件，请确保使用自定义基座并配置了文件权限');
			},

			// 处理识别结果
			handleOcrResult(result) {
				console.log(result.words_result);
				this.resultList = result.words_result || [];
				this.extractedInfo = this.extractInfoWithRegex(this.resultList);

				if (this.resultList.length === 0) {
					uni.showToast({
						title: '未识别到文字',
						icon: 'none'
					});
				} else {
					uni.showToast({
						title: '识别成功',
						icon: 'success'
					});
				}
			}
		}
	};
</script>

<style scoped>
	.container {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #f8f9fa;
		display: flex;
		flex-direction: column;
	}

	/* 顶部导航 */
	.header {
		height: 100rpx;
		display: flex;
		align-items: center;
		padding: 0 30rpx;
		background-color: #fff;
		box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.05);
		position: relative;
		z-index: 10;
	}

	.back-btn {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		transition: all 0.2s ease;
	}

	.back-btn:hover {
		background-color: rgba(0, 0, 0, 0.05);
	}

	.page-title {
		flex: 1;
		text-align: center;
		font-size: 36rpx;
		font-weight: 500;
		color: #333;
	}

	.spacer {
		width: 60rpx;
		height: 60rpx;
	}

	/* 内容区域 */
	.content {
		flex: 1;
		overflow-y: auto;
		padding: 30rpx;
		-webkit-overflow-scrolling: touch;
	}

	/* 功能卡片 */
	.function-card {
		background-color: #fff;
		border-radius: 20rpx;
		box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.05);
		margin-bottom: 30rpx;
		overflow: hidden;
	}

	.card-title {
		padding: 25rpx 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.card-title text {
		font-size: 32rpx;
		font-weight: 500;
		color: #333;
	}

	.card-content {
		display: flex;
		padding: 30rpx;
	}

	.function-item {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 20rpx;
		border-radius: 15rpx;
		transition: all 0.2s ease;
		cursor: pointer;
	}

	.function-item:not(:last-child) {
		margin-right: 20rpx;
	}

	.function-item:active {
		background-color: rgba(74, 144, 226, 0.05);
	}

	.function-item uni-icons {
		margin-bottom: 15rpx;
	}

	.function-item text {
		font-size: 28rpx;
		color: #333;
	}

	.function-item.disabled uni-icons {
		color: #999;
	}

	.function-item.disabled text {
		color: #999;
	}

	.tag {
		margin-top: 10rpx;
		padding: 5rpx 15rpx;
		border-radius: 15rpx;
		font-size: 22rpx;
		color: #4A90E2;
		background-color: rgba(74, 144, 226, 0.1);
	}

	.tag.disabled {
		color: #999;
		background-color: #f5f5f5;
	}

	/* 图片预览区域 */
	.image-preview {
		margin: 30rpx 0;
		border-radius: 20rpx;
		overflow: hidden;
		position: relative;
		box-shadow: 0 5rpx 20rpx rgba(0, 0, 0, 0.1);
	}

	.preview-wrapper {
		position: relative;
		padding-bottom: 100%;
		/* 保持正方形 */
		background-color: #f0f2f5;
	}

	.preview-image {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(to top, rgba(0, 0, 0, 0.5), transparent);
	}

	.close-btn {
		position: absolute;
		top: 20rpx;
		right: 20rpx;
		width: 50rpx;
		height: 50rpx;
		background-color: rgba(0, 0, 0, 0.3);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		backdrop-filter: blur(5rpx);
		transition: all 0.2s ease;
	}

	.close-btn:active {
		background-color: rgba(0, 0, 0, 0.5);
	}

	/* 识别结果卡片 */
	.result-card {
		background-color: #fff;
		border-radius: 20rpx;
		box-shadow: 0 5rpx 15rpx rgba(0, 0, 0, 0.05);
		margin-bottom: 30rpx;
		overflow: hidden;
	}

	.result-header {
		padding: 25rpx 30rpx;
		border-bottom: 1rpx solid #f0f0f0;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.result-title {
		font-size: 32rpx;
		font-weight: 500;
		color: #333;
	}

	.result-stats {
		font-size: 24rpx;
		color: #999;
	}

	.result-content {
		padding: 30rpx;
		max-height: 600rpx;
		overflow-y: auto;
	}

	.result-item {
		margin-bottom: 20rpx;
		padding: 15rpx 20rpx;
		background-color: #f9f9f9;
		border-radius: 12rpx;
		transition: all 0.2s ease;
	}

	.result-item:hover {
		background-color: #f0f2f5;
	}

	.item-text {
		font-size: 28rpx;
		color: #333;
		line-height: 1.5;
	}

	/* 提取信息区域 */
	.extracted-info {
		padding: 25rpx 30rpx;
		background-color: #f9f9f9;
		border-top: 1rpx solid #f0f0f0;
	}

	.info-title {
		font-size: 28rpx;
		font-weight: 500;
		color: #666;
		margin-bottom: 15rpx;
	}

	.info-item {
		display: flex;
		margin-bottom: 10rpx;
		padding: 10rpx 15rpx;
		background-color: #fff;
		border-radius: 10rpx;
		box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.03);
	}

	.info-label {
		flex-basis: 150rpx;
		font-size: 26rpx;
		color: #666;
	}

	.info-value {
		flex: 1;
		font-size: 26rpx;
		color: #333;
	}

	/* 操作按钮 */
	.action-buttons {
		display: flex;
		margin-bottom: 40rpx;
	}

	.action-btn {
		flex: 1;
		height: 90rpx;
		background: linear-gradient(135deg, #4A90E2, #3A80D2);
		color: #fff;
		border-radius: 24rpx;
		font-size: 30rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 10rpx 20rpx rgba(74, 144, 226, 0.2);
		transition: all 0.2s ease;
	}

	.action-btn:active {
		transform: translateY(2rpx);
		box-shadow: 0 5rpx 10rpx rgba(74, 144, 226, 0.2);
	}

	.action-btn:first-child {
		margin-right: 20rpx;
	}

	.action-btn uni-icons {
		margin-right: 15rpx;
	}

	/* 历史记录按钮 */
	.history-btn {
		width: 100%;
		height: 90rpx;
		background-color: #fff;
		border: 1rpx solid #4A90E2;
		color: #4A90E2;
		border-radius: 24rpx;
		font-size: 30rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
	}

	.history-btn:active {
		background-color: rgba(74, 144, 226, 0.05);
	}

	.history-btn uni-icons {
		margin-right: 15rpx;
	}

	/* 加载状态 */
	.loading-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(255, 255, 255, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		backdrop-filter: blur(5rpx);
	}

	.loading-content {
		padding: 40rpx 50rpx;
		background-color: #fff;
		border-radius: 20rpx;
		box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.loading-icon {
		margin-bottom: 15rpx;
		animation: spin 1.5s linear infinite;
	}

	@keyframes spin {
		0% {
			transform: rotate(0deg);
		}

		100% {
			transform: rotate(360deg);
		}
	}

	.loading-content text {
		font-size: 30rpx;
		color: #666;
	}

	/* 滚动条样式 */
	::-webkit-scrollbar {
		width: 6rpx;
		height: 6rpx;
	}

	::-webkit-scrollbar-track {
		background: transparent;
	}

	::-webkit-scrollbar-thumb {
		background: rgba(74, 144, 226, 0.2);
		border-radius: 3rpx;
	}

	::-webkit-scrollbar-thumb:hover {
		background: rgba(74, 144, 226, 0.3);
	}
</style>