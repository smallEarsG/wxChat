<template>
	<view class="container">
		<!-- 全局水印层 -->
		<WatermarkLayer />
		
		<TransferBill 
			:info="info" 
			:statusBarHeight="statusBarHeight"
			@goBack="goBack"
			@changeRole="changeRole"
			@editInfo="exitInfo"
		/>

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
	import { uploadAvatar, getAvatarList, createAvatar, deleteAvatar, createBill, updateBill, getBillById } from '@/api/index.js'
	import TransferBill from '@/components/bill-preview/TransferBill.vue'
	
	export default {
		components: {
			TransferBill
		},
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
				id: null,
				info: {
					"url": "",
					"name": "给为理想而奋斗",
					"money": "-0.01",
					"time": "2025年6月13日 16:19:30",
					"orderNumber": "1000050001202506130129831495334",
					"otherTime": "2025年6月13日 16:20:17",
					"payment": "零钱通",
					"currentState": "对方已收钱",
					"desc": "转账时间",
					"message":"留言为空则隐藏",
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
					"message":"付款方留言",
					"payment": '支付方式',
					"desc": "备注",
					"padd":"边距",
					"order":"全部账单",
					"fontSize":"字体大小"
				}
			}
		},
		computed: {
			fontScale() {
				return this.info.fontSize / 100;
			}
		},
		async onLoad(options) {
			// 支持从路由读取 billId，并优先从云端按ID查询覆盖 info
			const rawId = options && (options.billId || options.id);
			if (rawId !== undefined && rawId !== null && rawId !== '') {
				// 云端按ID查询覆盖 info：保持原始字符串，不转数字（避免长数字精度丢失/前导零丢失/字母ID被改写）
				this.id = String(rawId);
				try {
					const res = await getBillById(this.id);
					const bill = res && res.data ? res.data : res;
					if (bill && bill.billDetail) {
						const detail = typeof bill.billDetail === 'string' ? JSON.parse(bill.billDetail) : bill.billDetail;
						this.info = { ...this.info, ...(detail || {}) };
					}
				} catch (e) {
					// 404：账单不存在 -> 提示并返回
					uni.showToast({ title: '账单不存在', icon: 'none' });
					setTimeout(() => uni.navigateBack(), 300);
					return;
				}
			} else if (options && options.info) {
				// 无 billId 时才使用路由传入 info
				const temp = JSON.parse(decodeURIComponent(options.info));
				this.info = { ...this.info, ...temp };
			}
			// 从云端获取头像列表
			this.loadAvatarList();
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
			async saveTflist() {
				// 如果 id 为 null，调用创建账单接口
				if (this.id === null || this.id === undefined) {
					try {
						const userId = uni.getStorageSync('userId');
						if (!userId) {
							console.warn('用户未登录，跳过创建账单');
						} else {
							// 账单类型（数字映射）：1=转账
							const billType = 1
							
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
				} else {
					// 如果 id 存在，调用更新账单接口
					try {
						// 将 info 转换为 JSON 字符串作为账单详情（只更新账单详情）
						const billDetail = JSON.stringify(this.info);
						
						// 调用更新账单接口，只更新账单详情
						const updateData = {
							billDetail: billDetail
						};
						
						const result = await updateBill(this.id, updateData);
						
						console.log('账单更新成功:', result);
					} catch (error) {
						console.error('更新账单失败:', error);
						// 不阻止流程继续，仅记录错误
					}
				}
			},
			async changeRl(url){
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
			openAddPopup() {
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
			changeRole() {
				if (this.roleList.length > 0) {
					this.$refs.popup.open('center')
				} else {
					this.$refs.cradPopup.open()
				}
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
			onOrderSubmit(data) {
				console.log(data);
				const baseImg = this.info.url
				this.info = {
					...this.info,
					...data
				}
				this.info.url = baseImg
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
	.list_rl {
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
		/* position: relative;
		top: -4rpx; */
	}
	.right{
		flex:1;
		word-wrap: break-word; 
		overflow-wrap: break-word;
		overflow: auto;
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
		padding: 0 60rpx;
		box-sizing: border-box;
	}

	.serivce_line {
		border-top: 1px solid #eaeaea;
	}

	.serivce_bx {
		display: flex;
		align-items: center;
		margin: 35rpx 0;
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

	.startIcon {
		width: 32rpx;
		height: 32rpx;
		margin-right: 12rpx;
		position: relative;
		top: 6rpx;
	}

	.chatIcon {
		width: 28rpx;
		height: 28rpx;
		margin-right: 14rpx;
		position: relative;
		top: 6rpx;
	}

	.transferIcon {
		width: 22rpx;
		height: 22rpx;
		margin-right: 14rpx;
		position: relative;
		top: 4rpx;
	}

	.order_info {
		margin-top: 40rpx;
		padding-bottom: 60rpx;
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

	.num_txt {
		font-variant-numeric: tabular-nums;
		/* 强制使用等宽数字 */
		font-family: -apple-system, 'SF Pro Display', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
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

	.line {
		margin-top: 88rpx;
		width: 100%;
		height: 1px;
		background-color: #eaeaea;
	}

	.avatar {
		width: 92rpx;
		height: 92rpx;
		overflow: hidden;
		margin-top: 40rpx;
		border-radius: 50%;
	}

	.avatar image {
		width: 100%;
		height: 100%;
		object-fit: cover;
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
		padding: 0 50rpx;
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
		background-color: #fff;
		height: 86rpx;
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
		 overflow: auto;
		 height: 100vh;
	}

	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		/* position: relative; */
	}
</style>