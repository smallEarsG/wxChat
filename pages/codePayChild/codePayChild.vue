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
	import { uploadAvatar, getAvatarList, createAvatar, deleteAvatar, createBill, updateBill, getBillById } from '@/api/index.js'
	
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
				id: null,
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
		async onLoad(options) {
			const rawId = options && (options.billId || options.id);
			if (rawId !== undefined && rawId !== null && rawId !== '') {
				this.id = rawId
				try {
					const res = await getBillById(this.id);
					const bill = res && res.data ? res.data : res;
					if (bill && bill.billDetail) {
						const detail = typeof bill.billDetail === 'string' ? JSON.parse(bill.billDetail) : bill.billDetail;
						this.info = { ...this.info, ...(detail || {}) };
					}
				} catch (e) {
					uni.showToast({ title: '账单不存在', icon: 'none' });
					setTimeout(() => uni.navigateBack(), 300);
					return;
				}
			} else if (options && options.info) {
				const temp = JSON.parse(decodeURIComponent(options.info));
				this.info = { ...this.info, ...temp };
			}
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
			// 云端保存账单（create/update）
			async saveBill() {
				try {
					const userId = uni.getStorageSync('userId');
					if (!userId) {
						console.warn('用户未登录，跳过保存账单');
						return;
					}
					const billDetail = JSON.stringify(this.info || {});
					if (this.id === null || this.id === undefined) {
						const billData = {
							platform: 'wechat',
							billType: 2, // 二维码收款
							billDetail,
							createUserId: userId,
							remark: this.info.desc || this.info.name || ''
						};
						const result = await createBill(billData);
						if (result && result.data && result.data.id) this.id = result.data.id;
					} else {
						await updateBill(this.id, { billDetail });
					}
				} catch (e) {
					console.error('保存账单失败:', e);
				}
			},
			openAddPopup(){
				this.$refs.cradPopup.open()
			},
			async bindClick(index) {
				const item = this.roleList[index];
				if (!item) return;
				if (item.id) {
					try {
						uni.showLoading({ title: '删除中...', mask: true });
						await deleteAvatar(item.id);
						uni.hideLoading();
						await this.loadAvatarList();
						uni.showToast({ title: '删除成功', icon: 'success' });
					} catch (e) {
						uni.hideLoading();
						uni.showToast({ title: e.message || '删除失败，请重试', icon: 'none' });
					}
				} else {
					this.roleList.splice(index, 1);
					uni.showToast({ title: '删除成功', icon: 'success' });
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
				this.saveBill()
			},
			async onCradSubmitz(data) {
				let avatarUrl = data.avatar;
				const isLocalPath = avatarUrl && !avatarUrl.startsWith('http://') && !avatarUrl.startsWith('https://');
				if (isLocalPath) {
					try {
						uni.showLoading({ title: '上传头像中...', mask: true });
						const userId = uni.getStorageSync('userId');
						if (!userId) throw new Error('用户未登录');
						const result = await uploadAvatar(avatarUrl, userId, 'wechat', data.nickname || '');
						avatarUrl = result.avatarUrl;
						uni.hideLoading();
					} catch (e) {
						uni.hideLoading();
						uni.showToast({ title: e.message || '上传头像失败，请重试', icon: 'none' });
						return;
					}
				}

				try {
					const userId = uni.getStorageSync('userId');
					if (!userId) throw new Error('用户未登录');
					await createAvatar({ userId, module: 'wechat', avatarUrl, name: data.nickname || this.info.name || '' });
					await this.loadAvatarList();
				} catch (e) {
					uni.showToast({ title: e.message || '保存头像失败，请重试', icon: 'none' });
					return;
				}

				this.info.url = avatarUrl;
				this.saveBill();
			},
			changeRole() {
				if (this.roleList.length > 0) {
					this.$refs.popup.open('center')
				} else {
					this.$refs.cradPopup.open()
				}
			},
			onOrderSubmit(data) {
				this.info = {
					...data
				}
				this.saveBill()
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