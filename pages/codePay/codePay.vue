<template>
	<view class="container">
		<!-- 标题与按钮 -->
		<view class="header">
			<text class="title">图片文字识别在线</text>
			<button class="upload-btn" @click="chooseImage">
				<!-- <text class="iconfont"></text> -->
				<text>上传图片识别</text>
			</button>
		</view>
		<view class="header">
			<text class="title">图片文字识别离线</text>
			<button class="upload-btn" @click="chooseImage" :disabled="true">
				<!-- <text class="iconfont"></text> -->
				<text>上传图片识别</text>
			</button>
		</view>
		<!-- 图片预览区域 -->
		<view class="image-preview" v-if="imagePath">
			<image :src="imagePath" mode="widthFix"></image>
			<view class="close-btn" @click="clearImage">×</view>
		</view>

		<!-- 识别结果区域 -->
		<view class="result-container" v-if="resultList.length > 0">
			<view class="result-title">识别结果：</view>
			<view class="result-item" v-for="(item, index) in resultList" :key="index">
				<text class="item-index">{{ index + 1 }}.</text>
				<text class="item-text">{{ item.words }}</text>
			</view>
		</view>
		<!-- v-if="resultList.length > 0" -->
		<view class="footer_btn" v-if="resultList.length > 0">
			<button class="upload-btn" @click="goCodePayChild(0)">
				<!-- <text class="iconfont"></text> -->
				<text>转账付款</text>
			</button>
			<button class="upload-btn" @click="goCodePayChild(1)">
				<!-- <text class="iconfont"></text> -->
				<text>扫码付款</text>
			</button>
		</view>
		<!-- 加载状态 -->
		<view class="loading" v-if="isLoading">
			<text>识别中...</text>
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
				// 百度云OCR配置（需替换为你的真实信息）
				baiduConfig: {
					apiKey: 'Rk9atFNERmi0vduxtu3zrF0x',
					secretKey: 'iylst8nEtnr5fTek3QWjuXPcruzCFJnK',
					apiUrl: 'https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic' // 高精度通用识别接口
				}
			};
		},
		methods: {
			extractInfoWithRegex(data) {
				console.log(data);
				const info = {
					time: '',
					name: '',
					orderNumber: '',
					otherTime:'',
					transferName:'',
				};

				data.forEach((item, index) => {
					const words = item.words;

					// 时间格式匹配（支持年-月-日 或 时分秒）
					const timeMatch = words.match(/\d{4}年\d{1,2}月\d{1,2}日\d{1,2}[:：]\d{2}[:：]\d{2}/);
					const temp = words.match(/\d{4}年\d{1,2}月\d{1,2}日/);
					if (timeMatch || temp) {
						let tempTime = ''
						if (timeMatch) {
							tempTime = timeMatch[0];
						} else {
							tempTime = temp + ' ' + data[index + 1]?.words
						}
						if(info.time!=''){
							info.otherTime = tempTime
						}else{
							info.time = tempTime
						}
						
					}


					// 二维码付款名称（提取"扫二维码付款-"后的内容）
					const nameMatch = words.match(/扫二维码付款-([^-]+)/);
					if (nameMatch) info.name = nameMatch[1];
                    // 转账付款名称
					const transferNameMatch = words.match(/转账-([^-]+)/);
					if (transferNameMatch) info.transferName = transferNameMatch[1];
					// 账单号（匹配纯数字且长度较长的字符串）
					const orderMatch = words.match(/\d{16,32}/); // 假设账单号为16-32位数字
					console.log(orderMatch, /单号/.test(data[index - 1]?.words), index - 1);
					if (orderMatch && /单号/.test(data[index - 1]?.words)) {

						if (orderMatch[0].length < 32) {
							info.orderNumber = orderMatch[0] + data[index + 1]?.words;
						} else
							info.orderNumber = orderMatch[0];
					}
					
				});

				return info;
			},
			goCodePayChild(i) {
				const info = this.extractInfoWithRegex(this.resultList)
				const formattedDate = info.time.replace(/日(\d)/, '日 $1') // 在"日"字后面添加空格
					.replace(/：/g, ':'); // 全局替换中文冒号为英文冒号
				console.log(formattedDate);
				info.time = formattedDate
				if(info.otherTime != ''){
					const formattedDate_other = info.otherTime.replace(/日(\d)/, '日 $1') // 在"日"字后面添加空格
						.replace(/：/g, ':'); // 全局替换中文冒号为英文冒号
					info.otherTime =formattedDate_other
				}
				console.log(info);
				if(i === 1){
					uni.navigateTo({
						url: "/pages/codePayChild/codePayChild?info=" + encodeURIComponent(JSON.stringify(info))
					})
				}else{
					uni.navigateTo({
						url: "/pages/transfer/transfer?info=" + encodeURIComponent(JSON.stringify(info))
					})
				}
				
				// console.log();
			},
			// 选择图片（保持不变）
			chooseImage() {
				uni.chooseImage({
					count: 1,
					success: (res) => {
						this.imagePath = res.tempFilePaths[0];
						console.log("获取图片结果", res.tempFiles[0]);
						// this.imageBase64 = codeBase(res.tempFiles[0])

						// console.log(codeBase(res.tempFiles[0]))
						// const tempFilePath = res.tempFilePaths[0];
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

			// 清除图片（保持不变）
			clearImage() {
				this.imagePath = '';
				this.resultList = [];
			},

			// 开始 OCR 识别（修改后）
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

			// 获取百度云 AccessToken（保持不变）
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

			// 上传图片到百度 OCR（使用 uni.request + Base64）
			uploadToBaiduOCR(imagePath, accessToken) {
				return new Promise(async (resolve, reject) => {
					try {

						// 将图片转为 Base64（使用之前定义的 readImageAsBase64 函数）
						const base64Image = await this.readImageAsBase64(imagePath);

						// 使用 uni.request 发送 POST 请求，携带 Base64 编码的图片
						uni.request({
							url: `${this.baiduConfig.apiUrl}?access_token=${accessToken}`,
							method: 'POST',
							header: {
								'Content-Type': 'application/x-www-form-urlencoded' // 百度 OCR 要求的格式
							},
							data: {
								image: base64Image, // 关键：Base64 编码的图片数据
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

			// 确保 readImageAsBase64 函数正确处理 Base64 编码
			// 读取图片为 Base64（Android 专用）
			async readImageAsBase64(imagePath) {
				console.log('开始转换图片为 Base64，路径:', imagePath);
				// #ifdef H5
				// H5 环境保持不变
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

				// 方案 1：优先使用 uni.readFile（最新 API）
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
						// 继续尝试其他方案
					}
				}

				// 方案 3：使用 plus.io（5+ Runtime API，Android 原生环境）
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
			// 读取图片为 Base64（使用新 API）
			// async readImageAsBase64(imagePath) {
			// 	try {
			// 		// #ifdef H5
			// 		// H5 环境保持不变
			// 		return new Promise((resolve, reject) => {
			// 			const xhr = new XMLHttpRequest();
			// 			xhr.open('GET', imagePath, true);
			// 			xhr.responseType = 'blob';
			// 			xhr.onload = () => {
			// 				if (xhr.status === 200) {
			// 					const reader = new FileReader();
			// 					reader.onloadend = () => {
			// 						const base64 = reader.result.split(',')[1];
			// 						resolve(base64);
			// 					};
			// 					reader.readAsDataURL(xhr.response);
			// 				} else {
			// 					reject(new Error(`图片加载失败: ${xhr.status}`));
			// 				}
			// 			};
			// 			xhr.onerror = reject;
			// 			xhr.send();
			// 		});
			// 		// #endif

			// 		// #ifndef H5
			// 		// 非 H5 环境使用 uni.readFile
			// 		const fileData = await uni.readFile({
			// 			filePath: imagePath,
			// 			encoding: 'base64'
			// 		});

			// 		// 确保没有 data:URL 前缀
			// 		const pureBase64 = fileData.data.replace(/^data:image\/\w+;base64,/, '');
			// 		return pureBase64;
			// 		// #endif
			// 	} catch (error) {
			// 		console.error('读取图片失败:', error);
			// 		throw error;
			// 	}
			// },
			// 处理识别结果（保持不变）
			handleOcrResult(result) {
				console.log(result.words_result);
				this.resultList = result.words_result || [];
				if (this.resultList.length === 0) {
					uni.showToast({
						title: '未识别到文字',
						icon: 'none'
					});
				}
			}
		}
	};
</script>

<style scoped>
	.footer_btn {
		display: flex;
		align-items: center;
	}

	.container {
		padding: 30rpx;
		background-color: #f5f5f5;
		height: 100vh;
	}

	.header {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 40rpx 0;
	}

	.title {
		font-size: 40rpx;
		font-weight: bold;
		color: #333;
		margin-right: 20rpx;
	}

	.upload-btn {
		background-color: #1e90ff;
		color: white;
		padding: 15rpx 40rpx;
		border-radius: 30rpx;
		display: flex;
		align-items: center;
	}

	.upload-btn .iconfont {
		font-size: 32rpx;
		margin-right: 10rpx;
	}

	.image-preview {
		margin: 40rpx 0;
		border-radius: 15rpx;
		overflow: hidden;
		position: relative;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	}

	.image-preview image {
		width: 100%;
	}

	.close-btn {
		position: absolute;
		top: 10rpx;
		right: 10rpx;
		font-size: 36rpx;
		color: white;
		background-color: rgba(0, 0, 0, 0.5);
		width: 40rpx;
		height: 40rpx;
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		cursor: pointer;
	}

	.result-container {
		background-color: white;
		padding: 30rpx;
		border-radius: 15rpx;
		box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
	}

	.result-title {
		font-size: 34rpx;
		font-weight: 500;
		color: #666;
		margin-bottom: 20rpx;
	}

	.result-item {
		display: flex;
		align-items: flex-start;
		margin-bottom: 20rpx;
	}

	.item-index {
		font-size: 32rpx;
		color: #1e90ff;
		margin-right: 15rpx;
		min-width: 40rpx;
	}

	.item-text {
		font-size: 32rpx;
		color: #333;
		line-height: 45rpx;
	}

	.loading {
		margin-top: 30rpx;
		font-size: 32rpx;
		color: #999;
		text-align: center;
	}
</style>