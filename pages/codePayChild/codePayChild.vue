<template>
	<view class="container">
		<!-- 全局水印层 -->
		<WatermarkLayer />
		<view class="nav" @click="goBack" :style="{ paddingTop: statusBarHeight + 'px' }">
			<uni-icons class="close" type="closeempty" color="#000" size="22"></uni-icons>
			<view class="allOrder" v-if="info.order" :style="{ fontSize: (36 * fontScale) + 'rpx' }">全部账单</view>
		</view>

		<view class="content">
		
			<view class="order" :style="{ paddingLeft: info.padd + 'rpx', paddingRight: info.padd + 'rpx' }">

				<view class="order_top">
					<view class="avatar" @click="changeRole">
						<image :src="info.url||'/static/paySe.png'"></image>
					</view>
					<view class="name" :style="{ fontSize: (32 * fontScale) + 'rpx' }">
						二维码收款-{{info.name}}
					</view>
					<view class="num" @click="exitInfo" :style="{ fontSize: (56 * fontScale) + 'rpx' }">
						{{info.money}}
					</view>
					<view class="line" />
				</view>

				<view class="order_info">

					<view class="item" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">
							当前状态
						</view>
						<view class="right">
							{{info.currentState}}
						</view>
					</view>
					<view class="item" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">
							收款方备注
						</view>
						<view class="right">
							{{info.desc}}
						</view>
					</view>
					<view class="item" v-if="info.payment" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">
							收款方式
						</view>
						<view class="right rightIcon">
							{{info.payment}}
							<uni-icons
							
							v-if=" info.payment == '零钱通'"
							  type="info" 
							  size="18" 
							  color="#999" 
							  
							  class="input-icon gthIcon" 
							/>
							
						</view>
					</view>

					<view class="item" v-if="info.otherTime" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">
							收款时间
						</view>
						<view class="right">
							{{info.otherTime}}
						</view>
					</view>
					<view class="item" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">
							转账单号
						</view>
						<view class="right">
							{{info.orderNumber}}
						</view>
					</view>

				</view>


			</view>
		
			<view class="footer" :style="{ fontSize: (24 * fontScale) + 'rpx' }">
				本服务由财付通提供
			</view>
		</view>
		<uni-popup ref="popup" type="bottom" background-color="#fff" border-radius="10px">
			<view class="roleList">
		
				<view class="list_rl">
					<uni-swipe-action v-if="roleList.length>0">
						<uni-swipe-action-item v-for="(item,index) in roleList" :right-options="options2" :auto-close="false"
							@click="bindClick(index)">
							<view class="content-box" @click="changeRl(item.avatar)">
								<uni-list-chat :avatar-circle="true" :title="item.nickname" :avatar="item.avatar"
									:note="item.description" :clickable="true"
									@click="changeRl(item.avatar)"></uni-list-chat>
							</view>
						</uni-swipe-action-item>

					</uni-swipe-action>
				</view>
				<view class="">
					<button class="btn" @click="openAddPopup">添加角色</button>
				</view>
			</view>
		</uni-popup>
		<EditableFormPopup ref="orderPopup" :value="info" :fieldLabels="infoKey" @submit="onOrderSubmit" />
		<ProfileEditPopup ref="cradPopup" @submit="onCradSubmitz"></ProfileEditPopup>
	</view>
</template>

<script>
	import {
		eadLocalFileToBase64
	} from "../../utils/tool.js"
	import { uploadAvatar, getAvatarList, createAvatar, deleteAvatar, createBill } from '@/api/index.js'
	
	export default {
		data() {
			return {
				options2: [{
						text: '删除',
						style: {
							backgroundColor: '#F56C6C'
						}
					}
				
				],
				statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
				roleList: [],
				id:null,
				info: {
					"url": "",
					"name": "转给G",
					"money": "-0.01",
					"time": "2025年6月13日 16:19:30",
					"orderNumber": "1000050001202506130129831495334",
					"otherTime": "2025年6月13日 16:20:17",
					"payment": "零钱通",
					"currentState": "对方已收钱",
					"desc": "转账时间",
					"padd":60,
					"order":false,
					"fontSize":100
				
				},
				infoKey: {
					"time": "付款时间",
					"otherTime": '收款时间', //
					"name": "名字",
					"orderNumber": "单号",
					"money": '金额',
					"currentState": '支付状态',
					"payment": '支付方式',
					"desc": "备注",
					"padd":"边距",
					"order":"全部账单",
					"fontSize":"字体大小",
				}
			}
		},
		computed: {
			fontScale() {
				return this.info.fontSize / 100;
			}
		},
		onLoad(options) {
		if(options.info){
			const temp = JSON.parse(decodeURIComponent(options.info))
			this.info = {
				...this.info,
				...temp
			}
		}	
			// 从云端获取头像列表
			this.loadAvatarList()
		},
		methods: {
			// 从云端加载头像列表
			async loadAvatarList() {
				
				try {
					const userId = uni.getStorageSync('userId');
					if (!userId) {
						uni.showToast({
							title: '用户未登录',
							icon: 'none'
						});
						this.roleList = [];
						return;
					}
					
					// 从云端获取头像列表
					const result = await getAvatarList(userId, 'wechat');
					// 处理返回的数据格式
					let avatarList = [];
					if (result && result.data && Array.isArray(result.data)) {
						avatarList = result.data;
					} else if (Array.isArray(result)) {
						avatarList = result;
					}
					
					console.log(result.data,"===result=====",avatarList);
					// 转换为 roleList 格式
					this.roleList = avatarList.map(item => ({
						
						avatar: item.avatarUrl || item.avatar,
						nickname: item.name || '',
						description: item.description || '@微信',
						id: item.id
					}));
				} catch (error) {
					console.error('加载头像列表失败:', error);
					uni.showToast({
						title: '加载头像列表失败',
						icon: 'none'
					});
					this.roleList = [];
				}
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
			openAddPopup(){
				this.$refs.cradPopup.open()
			},
			async bindClick(index) {
				// 获取要删除的头像项
				const item = this.roleList[index];
				if (!item) {
					return;
				}
				
				// 如果有 id，调用删除接口
				if (item.id) {
					try {
						uni.showLoading({ title: '删除中...', mask: true });
						await deleteAvatar(item.id);
						uni.hideLoading();
						
						// 删除成功后刷新列表
						await this.loadAvatarList();
						
						uni.showToast({
							title: '删除成功',
							icon: 'success'
						});
					} catch (error) {
						console.error('删除头像失败:', error);
						uni.hideLoading();
						uni.showToast({
							title: error.message || '删除失败，请重试',
							icon: 'none'
						});
					}
				} else {
					// 如果没有 id，可能是旧数据，直接从列表中移除
					this.roleList.splice(index, 1);
					uni.showToast({
						title: '删除成功',
						icon: 'success'
					});
				}
			},
			async changeRl(url){
				// console.log(url);
				// 如果头像不是网络地址（是本地路径），需要先上传到云端
				const isLocalPath = url && !url.startsWith('http://') && !url.startsWith('https://');
				
				if (isLocalPath) {
					try {
						uni.showLoading({ title: '上传头像中...', mask: true });
						
						const userId = uni.getStorageSync('userId');
						if (!userId) {
							throw new Error('用户未登录');
						}
						
						// 上传头像到云端
						const result = await uploadAvatar(url, userId, 'wechat', this.info.name || '');
						url = result.avatarUrl;
						
						uni.hideLoading();
					} catch (error) {
						console.error('上传头像失败:', error);
						uni.hideLoading();
						uni.showToast({
							title: error.message || '上传头像失败，请重试',
							icon: 'none'
						});
						return;
					}
				}
				
				this.info.url = url
				this.saveTflist()
			},
			async onCradSubmitz(data) {
				console.log("=======", data);
				
				// 头像一定是云端的，直接使用
				const avatarUrl = data.avatar;
				
				// 将当前使用的头像保存到云端
				try {
					const userId = uni.getStorageSync('userId');
					if (!userId) {
						throw new Error('用户未登录');
					}
					
					await createAvatar({
						userId: userId,
						module: 'wechat',
						avatarUrl: avatarUrl,
						name: data.nickname || this.info.name || ''
					});
					
					// 重新加载云端列表以确保数据同步
					await this.loadAvatarList();
				} catch (error) {
					console.error('保存头像到云端失败:', error);
					uni.showToast({
						title: error.message || '保存头像失败，请重试',
						icon: 'none'
					});
					return;
				}
				
				this.info.url = avatarUrl;
				this.saveTflist();
			},
			changeRole() {
				if (this.roleList.length > 0) {
					this.$refs.popup.open('center')
				} else {
					this.$refs.cradPopup.open()
				}
			},
			async saveTflist() {
				// 如果 id 为 null，调用创建账单接口
				if (this.id === null || this.id === undefined) {
					try {
						const userId = uni.getStorageSync('userId');
						if (!userId) {
							console.warn('用户未登录，跳过创建账单');
						} else {
							// 判断账单类型：根据金额正负判断是收入还是支出
							const money = parseFloat(this.info.money) || 0;
							const billType = money >= 0 ? 'income' : 'expense';
							
							// 将 info 转换为 JSON 字符串作为账单详情
							const billDetail = JSON.stringify(this.info);
							
							// 调用创建账单接口
							const billData = {
								platform: 'wechat',
								billType: billType,
								billDetail: billDetail,
								createUserId: userId,
								remark: this.info.desc || this.info.name || ''
							};
							
							const result = await createBill(billData);
							
							// 如果创建成功，保存返回的 id
							if (result && result.data && result.data.id) {
								this.id = result.data.id;
							}
							
							console.log('账单创建成功:', result);
						}
					} catch (error) {
						console.error('创建账单失败:', error);
						// 不阻止流程继续，仅记录错误
					}
				}
				
				// 从文件获取现有列表
				let list = this.getTfListFromFile();

				// 查找订单号匹配的元素
				const index = list.findIndex(item => {
					return item.info.orderNumber === this.info.orderNumber;
				});

				// 如果不存在，添加新元素
				if (index < 0) {
					list.push({
						type: 1,
						info: this.info,
						id: this.id
					});
				}
				// 如果存在，更新原有元素的info部分
				else {
					list[index].info = this.info;
					if (this.id) {
						list[index].id = this.id;
					}
				}

				// 保存到文件
				this.saveTfListToFile(list);
			},
			onOrderSubmit(data) {
				console.log(data);
				this.info = {
					...data
				}
				this.saveTflist()
			},
			exitInfo() {
				this.$refs.orderPopup.open()
			},
			goBack() {
				uni.navigateBack();
			},
		}
	}
</script>

<style scoped>
	.list_rl{
		flex: 1;
		overflow: auto;
	}
	.roleList {
		display: flex;
		flex-direction: column;
		width: 600rpx;
		height: 800rpx;
	}
	
	.gthIcon {
	/* 	width: 30rpx;
		height: 30rpx; */
		margin-left: 10rpx;
	}

	.rightIcon {
		display: flex;
		align-items: center;
	}

	.footer {
		width: 100%;
		flex: 1;
		font-size: 24rpx;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		flex-direction: column;
		color: #a2a2a2;
		min-height: 170rpx;
		padding-bottom: 60rpx;
		/* position: absolute;
	bottom: 0rpx; */
	}

	.serivce {
		margin-top: 20rpx;
		background-color: #fff;
		padding: 0 40rpx;
		box-sizing: border-box;
	}

	.serivce_bx {
		border-top: 1px solid #eaeaea;
		display: flex;
		align-items: center;
		padding: 35rpx 0;
		box-sizing: border-box;
	}

	.se_title {
		font-size: 26rpx;
		padding-top: 30rpx;
		padding-bottom: 35rpx;
		font-weight: 500;
		box-sizing: border-box;
	}

	.se_item {
		font-size: 26rpx;
		color: #5c6e96;
		flex: 1;
		display: flex;
		align-items: center;
		/* margin: 0 40rpx; */
	}

	.se_icon {}

	.cordIcon {
		width: 38rpx;
		height: 38rpx;
		position: relative;
		top: 4rpx;
		margin-right: 10rpx;
	}

	.skIcon {
		width: 36rpx;
		height: 36rpx;
		position: relative;
		top: 4rpx;
		margin-right: 10rpx;
	}

	.wticon {
		width: 30rpx;
		height: 30rpx;
		margin-right: 14rpx;
		position: relative;
		top: 6rpx;
	}

	.order_info {
		margin-top: 40rpx;
		padding-bottom: 60rpx;
		font-family: 'msyh';
	}

	.sub {
		height: 8rpx;
		width: 26rpx;
		background-color: #000
	}

	.num {
		font-family: 'WeChat Sans Std';
		display: flex;
		align-items: center;
		margin-top: 40rpx;
		/* font-weight: bold; */
		font-size: 56rpx;
		

	}

	.name {
		margin-top: 30rpx;
		font-size: 32rpx;
		text-align: center;
	}

	.left {
		color: #9b9b9b;
		width: 170rpx;
	}

	.item {
		flex: 1;
		display: flex;
		font-size: 28rpx;
		margin-bottom: 20rpx;
	}

	.order_info {
		display: flex;
		flex-direction: column;
	}

	.line_b {
		width: 100%;
		height: 1px;
		background-color: #fafafa;
		transform: scaleY(0.01);
	}

	.line {
		margin-top: 88rpx;
		width: 100%;
		height: 1px;
		background-color: #efefef;
		transform: scaleY(0.6);
	}

	.avatar {
		width: 94rpx;
		height: 94rpx;
		overflow: hidden;
		margin-top: 40rpx;
		border-radius: 50px;
	}

	.avatar image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
.right{
		flex:1;
		word-wrap: break-word; 
		overflow-wrap: break-word;
		overflow: auto;
	
	}
	.order_top {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.order {
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		background-color: #fff;
		padding: 0 60rpx;
	}

	.close {
		/* background-color: aqua; */
		/* padding-top: 160px; */

		padding-left: 20rpx;
		position: relative;
		top: 30rpx;
		transform: scale(0.8);
	}

	.nav {
		height: 86rpx;
		/* background-color: #5c6e96; */
		background-color: #fff;
		/* overflow: hidden; */
		position: relative;
	}
	.allOrder{
		position: absolute;
		right: 40upx;
		font-size: 36upx;
		bottom:  10upx;
	}
	.container {
		background-color: #eaeaea;
		display: flex;
		flex-direction: column;
		height: 100vh;
	}

	.content {
		flex: 1;
		display: flex;
		flex-direction: column;

		/* position: relative; */
	}
</style>