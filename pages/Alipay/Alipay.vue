<template>
	<view class="container">
		<!-- 全局水印层 -->
		<WatermarkLayer />
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
					<text>模板一</text>
				</button>
				<button class="action-btn" @click="goCodePayChild(1)">

					<text>模板二</text>
				</button>
			

			</view>
			<view class="action-buttons">
			<button class="action-btn" @click="goCodePayChild(2)">
				<text>模板三</text>
			</button>
			<button class="action-btn" @click="goCodePayChild(3)" > 
				<text>模板四（高德）</text>
			</button>
			</view>
			<view class="action-buttons">
				<button class="action-btn" @click="goCodePayChild(4)" > 
					<text>模板五（滴滴）</text>
				</button>
				<button class="action-btn" @click="goCodePayChild(5)" >
					<text>模板六</text>
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
					url: '/pages/AlipayRecord/AlipayRecord'
				});
			},

			// 从文件读取 tfList，并迁移 localStorage 中的数据
			getTfListFromFile() {
				try {
					const fs = uni.getFileSystemManager();
					const filePath = plus.io.convertLocalFileSystemURL('_doc/data.json');
					
					let fileList = [];
					let hasFile = false;
					
					// 尝试从文件读取
					try {
						const fileContent = fs.readFileSync(filePath, 'utf8');
						if (fileContent && fileContent.trim()) {
							fileList = JSON.parse(fileContent);
							hasFile = true;
						}
					} catch (readError) {
						// 文件不存在或读取失败
						console.log('文件不存在或读取失败，准备迁移数据');
					}
					
					// 尝试从 localStorage 读取旧数据
					let storageList = [];
					try {
						const storageData = uni.getStorageSync('tfList');
						if (storageData) {
							if (typeof storageData === 'string') {
								storageList = JSON.parse(storageData);
							} else if (Array.isArray(storageData)) {
								storageList = storageData;
							}
						}
					} catch (e) {
						console.log('读取 localStorage 失败:', e);
					}
					
					// 如果文件不存在或为空，但 localStorage 有数据，则迁移
					if (!hasFile && storageList.length > 0) {
						console.log('检测到 localStorage 中有旧数据，开始迁移到文件...');
						this.saveTfListToFile(storageList);
						// 迁移完成后删除 localStorage 中的旧数据
						try {
							uni.removeStorageSync('tfList');
							console.log('已删除 localStorage 中的旧数据');
						} catch (e) {
							console.log('删除 localStorage 失败:', e);
						}
						console.log('数据迁移完成，已保存到文件');
						return storageList;
					}
					
					// 如果文件存在但 localStorage 也有数据，合并数据（去重）
					if (hasFile && storageList.length > 0) {
						console.log('检测到文件和 localStorage 都有数据，合并数据...');
						// 合并数据，以订单号为唯一标识去重
						const mergedList = [...fileList];
						storageList.forEach(storageItem => {
							if (storageItem && storageItem.info) {
								const orderNumber = storageItem.info.orderNumber || storageItem.info.shopNumber;
								if (orderNumber) {
									const exists = mergedList.some(fileItem => {
										if (fileItem && fileItem.info) {
											return (fileItem.info.orderNumber === orderNumber || 
											        fileItem.info.shopNumber === orderNumber);
										}
										return false;
									});
									if (!exists) {
										mergedList.push(storageItem);
									}
								}
							}
						});
						// 保存合并后的数据到文件
						this.saveTfListToFile(mergedList);
						// 合并完成后删除 localStorage 中的旧数据
						try {
							uni.removeStorageSync('tfList');
							console.log('已删除 localStorage 中的旧数据');
						} catch (e) {
							console.log('删除 localStorage 失败:', e);
						}
						console.log('数据合并完成');
						return mergedList;
					}
					
					// 如果文件存在，返回文件数据
					if (hasFile) {
						return fileList;
					}
					
					return [];
				} catch (error) {
					console.error('读取文件失败:', error);
					// 降级到旧存储方式
					try {
						return uni.getStorageSync('tfList') || [];
					} catch (e) {
						return [];
					}
				}
			},
			// 保存 tfList 到文件
			saveTfListToFile(list) {
				try {
					const fs = uni.getFileSystemManager();
					const filePath = plus.io.convertLocalFileSystemURL('_doc/data.json');
					
					fs.writeFile({
						filePath: filePath,
						data: JSON.stringify(list),
						encoding: 'utf8',
						success: () => {
							console.log('记录已保存到文件');
						},
						fail: (err) => {
							console.error('保存文件失败:', err);
							// 降级到旧存储方式
							try {
								uni.setStorageSync('tfList', list);
							} catch (e) {
								console.error('降级存储也失败:', e);
							}
						}
					});
				} catch (error) {
					console.error('保存文件异常:', error);
					// 降级到旧存储方式
					try {
						uni.setStorageSync('tfList', list);
					} catch (e) {
						console.error('降级存储也失败:', e);
					}
				}
			},
			// 保存识别记录到持久化存储
			async saveRecord() {
				if (!this.extractedInfo) {
					return;
				}

				try {
					// 从文件获取现有的记录列表
					let list = this.getTfListFromFile();
					
					// 如果存储的是字符串，需要解析
					if (typeof list === 'string') {
						try {
							list = JSON.parse(list);
						} catch (e) {
							list = [];
						}
					}

					// 确保 list 是数组
					if (!Array.isArray(list)) {
						list = [];
					}

					// 将图片转换为 base64（如果还没有转换）
					let imageBase64 = '';
					if (this.imagePath) {
						try {
							const base64Data = await this.readImageAsBase64(this.imagePath);
							imageBase64 = `data:image/jpeg;base64,${base64Data}`;
						} catch (error) {
							console.error('图片转换失败:', error);
							// 如果转换失败，使用空字符串
							imageBase64 = '';
						}
					}

					// 准备要保存的信息
					const infoToSave = {
						...this.extractedInfo,
						url: imageBase64 || this.extractedInfo.avatar || '',
						time: this.extractedInfo.createTime || new Date().toLocaleString('zh-CN')
					};

					// 检查是否已存在相同订单号的记录
					const orderNumber = infoToSave.orderNumber || infoToSave.shopNumber;
					let existingIndex = -1;
					
					if (orderNumber) {
						existingIndex = list.findIndex(item => {
							return item.info && (
								item.info.orderNumber === orderNumber || 
								item.info.shopNumber === orderNumber
							);
						});
					}

					// 如果存在，更新原有记录；否则添加新记录
					if (existingIndex >= 0) {
						list[existingIndex].info = infoToSave;
					} else {
						// 添加新记录，type 2 表示第三方支付（支付宝）
						list.push({
							type: 2,
							info: infoToSave
						});
					}

					// 保存到文件
					this.saveTfListToFile(list);
					
					console.log('记录已保存:', infoToSave);
					console.log('保存后的完整列表:', list);
					console.log('保存的列表长度:', list.length);
				} catch (error) {
					console.error('保存记录失败:', error);
					uni.showToast({
						title: '保存记录失败',
						icon: 'none'
					});
				}
			},

			extractInfoWithRegex(data) {
				console.log("data:", data);
				const info = {

					avatar: '',
					name: '长沙泉为依百货店（请手动修改名称）',
					money: '120.00',
					createTime:'2025-6-25 16:59:17',
					payFun: '余额宝',
					desc: '销售会员模板开通',
					herAccount: '阿里云计算有限公司',
					orderNumber:'2025042420004001110087',
					shopNumber:'HBX2000400111008'

				};

				data.forEach((item, index) => {
					const words = item.words;
					// 创建时间
					const timeMatch = words.match(/\d{4}-\d{1,2}-\d{1,2}-\d{1,2}[:：]\d{2}[:：]\d{2}/);
					const temp = words.match(/\d{4}-\d{1,2}-\d{1,2}/);
					if (timeMatch || temp) {
						let tempTime = '';
						if (timeMatch) {
							info.createTime = timeMatch[0];
						} else {
							info.createTime = temp + ' ' + data[index + 1]?.words;
						}

					}
					const name = words.match(/账单详情/);
					if (name) {
						info.name = (data[index + 1]?.words ).replace(/>/g, '');
						info.money = (data[index + 2]?.words).replace(/-/g, '');
					}
					
					const payFun = words.match(/付款方式/);
					if (payFun) info.payFun = (data[index + 1]?.words).replace(/>/g, '');

					let desc = words.match(/转账备注/) 
					let	desc2 =  words.match(/商品说明/);
					if (desc || desc2) info.desc = data[index + 1]?.words;

					let herAccount = words.match(/对方账号/) 
					let	herAccount2 =  words.match(/收款方全称/);
					if (herAccount || herAccount2) info.herAccount = data[index + 1]?.words;

					const orderNumber = words.match(/订单号/)
					const shopNumber = words.match(/商家订单号/);
					if (orderNumber && shopNumber == null) {
						console.log("=====");
						info.orderNumber = data[index + 1]?.words;
					}else 
					if (shopNumber) info.shopNumber = data[index + 1]?.words;

				});



				return info;
			},
			goCodePayChild(i) {
				// 确保信息已提取
				
				if (!this.extractedInfo) {
					this.extractedInfo = this.extractInfoWithRegex(this.resultList);
				}
				console.log(this.extractedInfo);
				console.log(this.resultList);
				// 复用之前的路由映射配置
				const routeMap = {
					0: '/pages/billDetail/billDetail',
					1: '/pages/ailpayThirdpartyPayment/ailpayThirdpartyPayment',
					2: '/pages/ailpayThirdpartyPaymentAnd/ailpayThirdpartyPaymentAnd', // 模版三
					3: '/pages/billDetail2/billDetail2',
					4: '/pages/billDetail3/billDetail3',
					5: '/pages/ailpayThirdpartyPaymentAnd6/alipayThirdpartyPaymentAnd6' // 模版六
				};

				// 获取目标路由，默认使用第三方支付页面
				const targetRoute = routeMap[i] || routeMap[2];
				if(i === 0){
					this.extractedInfo.herAccount  =this.extractedInfo.herAccount.replace(/(\D)(\d)/, '$1 $2')
				}
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
			async handleOcrResult(result) {
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
					// 识别成功后自动保存记录
					await this.saveRecord();
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