<template>
	<view class="container">
		<!-- 全局水印层 -->
		<WatermarkLayer />
		
		<!-- 内容区域 -->
		<view class="content">
			<uni-swipe-action>
				<uni-swipe-action-item v-for="(item,index) in list" :key="index" :right-options="options"
					:auto-close="false" @click="bindClick(index)">
					
					<view class="content-box">
						<uni-list-chat 
							:avatar-circle="true" 
							:title="item.info.transferName || item.info.name" 
							:avatar="item.info.url || '/static/paySe.png'"
							:note="formatNote(item.info)" 
							:clickable="true" 
							@click="goPage(item)">
						</uni-list-chat>
					</view>
				</uni-swipe-action-item>
			</uni-swipe-action>
			
			<!-- 空状态提示 -->
			<view class="empty-state" v-if="list.length === 0">
				<uni-icons type="chatbubble" size="60" color="#ccc" />
				<text class="empty-text">暂无记录</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
				options: [{
						text: '删除',
						style: {
							backgroundColor: '#F56C6C'
						}
					}
				],
				list: []
			};
		},
		onLoad(){
			this.loadRecords();
		},
		onShow(){
			// 页面显示时重新加载记录
			this.loadRecords();
		},
		methods: {
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
			// 加载记录
			loadRecords() {
				try {
					let allList = this.getTfListFromFile();
					
					console.log('原始存储数据:', allList);
					
					// 如果存储的是字符串，需要解析
					if (typeof allList === 'string') {
						try {
							allList = JSON.parse(allList);
						} catch (e) {
							console.error('解析存储数据失败:', e);
							allList = [];
						}
					}
					
					// 确保是数组
					if (!Array.isArray(allList)) {
						console.warn('存储数据不是数组，重置为空数组');
						allList = [];
					}
					
					console.log('解析后的完整列表:', allList);
					console.log('列表长度:', allList.length);
					
					// 只显示 type 为 2 的记录（支付宝记录）
					this.list = allList.filter(item => {
						const isType2 = item && item.type === 2;
						if (isType2) {
							console.log('找到支付宝记录:', item);
						}
						return isType2;
					});
					
					console.log('过滤后的支付宝记录数量:', this.list.length);
					
					// 按时间倒序排列（最新的在前）
					this.list.sort((a, b) => {
						const timeA = a.info?.createTime || a.info?.time || '';
						const timeB = b.info?.createTime || b.info?.time || '';
						return timeB.localeCompare(timeA);
					});
					
					console.log('最终支付宝记录列表:', this.list);
				} catch (error) {
					console.error('加载记录失败:', error);
					this.list = [];
				}
			},
			
			// 删除记录
			bindClick(index){
				uni.showModal({
					title: '提示',
					content: '确定要删除这条记录吗？',
					success: (res) => {
						if (res.confirm) {
							// 从当前列表删除
							const deletedItem = this.list[index];
							this.list.splice(index, 1);
							
							// 从完整列表中删除
							let allList = this.getTfListFromFile();
							if (typeof allList === 'string') {
								try {
									allList = JSON.parse(allList);
								} catch (e) {
									allList = [];
								}
							}
							
							if (!Array.isArray(allList)) {
								allList = [];
							}
							
							// 找到并删除对应的记录
							const allIndex = allList.findIndex(item => 
								item.type === 2 && 
								item.info && 
								(item.info.orderNumber === deletedItem.info?.orderNumber || 
								 item.info.shopNumber === deletedItem.info?.shopNumber)
							);
							
							if (allIndex >= 0) {
								allList.splice(allIndex, 1);
								this.saveTfListToFile(allList);
							}
							
							uni.showToast({
								title: '删除成功',
								icon: 'success'
							});
						}
					}
				});
			},
			
			// 格式化备注信息
			formatNote(info) {
				if (!info) return '';
				const parts = [];
				if (info.money) {
					parts.push(`金额: ¥${info.money}`);
				}
				if (info.createTime || info.time) {
					parts.push(`时间: ${info.createTime || info.time}`);
				}
				return parts.join(' | ') || '第三方支付';
			},
			
			// 跳转到编辑页面
			goPage(item) {
				const { type, info } = item;
				
				// 路由映射配置
				const routeMap = {
					0: '/pages/transfer/transfer',
					1: '/pages/codePayChild/codePayChild',
					2: '/pages/ThirdpartyPayment/ThirdpartyPayment', // 支付宝第三方支付
					3: '/pages/miniThirdpartyPayment/miniThirdpartyPayment',
					4: '/pages/barcodeThirdpartyPayment/barcodeThirdpartyPayment',
					5: '/pages/barcodeThirdpartyPayment32/barcodeThirdpartyPayment32',
					6: '/pages/codePayChild2/codePayChild2',
					7: '/pages/barcodeThirdpartyPayment34/barcodeThirdpartyPayment34',
					8: '/pages/miniThirdpartyPaymentCode/miniThirdpartyPaymentCode',
				};
			
				// 获取目标路由，type 2 对应第三方支付页面
				const targetRoute = routeMap[type] || routeMap[2];
				
				// 构建完整URL
				const url = `${targetRoute}?info=${encodeURIComponent(JSON.stringify(info))}`;
				
				// 导航到目标页面
				uni.navigateTo({ url });
			}
		}
	}
</script>

<style>
	.container {
		background-color: #fff;
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		box-sizing: border-box;
	}

	/* 内容区域 */
	.content {
		flex: 1;
		overflow-y: auto;
		background-color: #fff;
		padding-bottom: 20rpx;
	}

	.content-box {
		display: flex;
		background-color: #fff;
		height: 152rpx;
	}

	/* 空状态 */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 200rpx 0;
	}

	.empty-text {
		margin-top: 30rpx;
		font-size: 28rpx;
		color: #999;
	}
</style>

