<template>
	<view class="container">
		<!-- 全局水印层 -->
		<WatermarkLayer />
		<!-- <CommonHeader 
			:title="info.order ? '全部账单' : ''"
			back-icon="closeempty"
			:back-icon-size="22"
			back-icon-color="#000"
			@back="goBack"
		/> -->
		<view class="nav" @click="goBack" :style="{ paddingTop: statusBarHeight + 'px' }">
			<uni-icons class="close" type="closeempty" color="#000" size="22"></uni-icons>
			<view class="allOrder" v-if="info.order" :style="{ fontSize: (36 * fontScale) + 'rpx' }">全部账单</view>
		</view>
		<view class="content">
			<view class="order" :style="{ paddingLeft: info.padd + 'rpx', paddingRight: info.padd + 'rpx' }">
				<view class="order_top">
					<view class="avatar" @click="changeRole">
						<image :src="info.url||'/static/logo.png'"></image>
					</view>
					<view class="name" :style="{ fontSize: (32 * fontScale) + 'rpx' }">
						{{info.name}}
					</view>
					<view class="num" @click="exitInfo" :style="{ fontSize: (56 * fontScale) + 'rpx' }">
						{{info.money}}
						<!-- <text class="num_txt"> {{info.num}}</text> -->
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
					
					<!-- <view class="item"  v-if="info.shop!=''" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">
							商品
						</view>
						<view class="right">
							{{info.shop}}
						</view>
					</view>
					<view class="item"  v-if="info.merchantName!=''" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">
							商户全称
						</view>
						<view class="right">
							{{info.merchantName}}
						</view>
					</view> -->
					<view class="item" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">
							收单机构
						</view>
						<view class="right">
							<view> {{info.institution}}</view>
							<view class="tips" v-if=" info.desc" :style="{ fontSize: (26 * fontScale) + 'rpx' }">
								{{info.desc}}
							</view>
						</view>
					</view>
					<view class="item" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">
							支付时间
						</view>
						<view class="right">
							{{info.time}}
						</view>
					</view>
					<view class="item" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">
							支付方式
						</view>
						<view class="right  ">
							<view class="rightIcon">
								{{info.payment}}
								<uni-icons v-if=" info.payment == '零钱通'" type="info" size="18" color="#999"
									class="input-icon gthIcon" />
							</view>
							<view class="tips" v-if=" info.desc2" :style="{ fontSize: (26 * fontScale) + 'rpx' }">
								{{info.desc2}}
								
							</view>
							<!-- <image v-if=" info.payment == '零钱通'" class="gthIcon" src="/static/gthIcon.png"></image> -->
						</view>
					</view>

					<view class="item" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">
							交易单号
						</view>
						<view class="right">
							{{info.orderNumber}}
						</view>
					</view>

					<view class="item" v-if="info.shopNumber!=''" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">
							商户单号
						</view>
						<view class="right">
							{{info.shopNumber}}
						</view>
					</view>
					<view class="item" v-if="info.BoNumber!=''&&                                                                             info.BoNumber !=null" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">
							经营单号
						</view>
						<view class="right">
							{{info.BoNumber}}
						</view>
					</view>
				</view>


			</view>
			<view class="serivce" :style="{ paddingLeft: info.padd + 'rpx', paddingRight: info.padd + 'rpx' }">
				<view class="se_title" :style="{ fontSize: (26 * fontScale) + 'rpx' }">
					账单服务
				</view>
			
				<view class="serivce_bx">
						<view class="se_item" :style="{ fontSize: (26 * fontScale) + 'rpx' }">
							<view class="se_icon ">
								<image class="wticon" src="/static/wticon.png" mode=""></image>
							</view>
							对订单有疑惑
						</view>
					<view class="se_item" v-if="isGroup" @longpress="showGroup">
						<view class="se_icon ">
							<image class="skIcon" src="/static/skIcon.png" mode=""></image>
						</view>
						发起群收款
					</view>
				</view>
			</view>
			<view class="serivce" :style="{ paddingLeft: info.padd + 'rpx', paddingRight: info.padd + 'rpx' }">
				<view class="se_title">
					收款方服务
				</view>
				<view class="serivce_bx">
					<view class="se_item">
						<view class="se_icon ">
							<image class="cordIcon" src="/static/cordIcon.png" mode=""></image>
						</view>
						收款方名片
					</view>
					<view class="se_item">
			
					</view>
				</view>
			</view>
			


			<view class="footer" :style="{ fontSize: (24 * fontScale) + 'rpx' }">
				本服务由财付通提供
			</view>
		</view>
		<uni-popup ref="popup" type="bottom" background-color="#fff" border-radius="10px">
			<view class="roleList">
				<!-- <view class=""  v-for="itme in roleList" >
				<uni-list-chat :avatar-circle="true" :title="itme.nickname" :avatar="itme.avatar"
												:note="itme.description"></uni-list-chat>
				</view> -->
				<view class="list_rl">
					<uni-swipe-action v-if="roleList.length>0">
						<uni-swipe-action-item v-for="(item,index) in roleList" :key="item.id || index" :right-options="options2" :auto-close="false"
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
import CommonHeader from "../../components/CommonHeader/CommonHeader.vue"
import { uploadAvatar, getAvatarList, createAvatar, deleteAvatar, createBill, updateBill, getBillById } from '@/api/index.js'
	export default {
		components: {
			CommonHeader
		},
		data() {
			return {
				isGroup:true,
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
					"currentState": "对方已收款",
					"desc": "由互联网清算有限公司提供付款清算服务",
					"shop": '商品', // 商品
					"merchantName": '商户名称', // 商户名称
					"institution": '收款机构', //收款机构
					"shopNumber": ' 商户单号', // 商单号
					"desc2": "由互联网清算有限公司提供付款清算服务",
					"BoNumber":"",
					"padd":60,
					"order":false,
					"fontSize":100,
					"showService": true
				},
				infoKey: {
					"time": "付款时间",
					"otherTime": '收款时间', //
					"name": "名字",
					"orderNumber": "交易单号",
					"money": '金额',
					"currentState": '支付状态',
					"payment": '支付方式',
					"shop": '商品', // 商品
					"merchantName": '商户名称', // 商户名称
					"institution": '收款机构', //收款机构
					"shopNumber": ' 商户单号', // 商单号
					"desc":"收款机构备注",
					"desc2":"支付方式备注",
					"BoNumber":"经营单号",
					"padd":"边距",
					"order":"全部账单",
					"fontSize":"字体大小",
					"showService": "显示服务模块"
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
				this.id = String(rawId);
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
			async loadAvatarList() {
				try {
					const userId = uni.getStorageSync('userId');
					if (!userId) {
						uni.showToast({ title: '用户未登录', icon: 'none' });
						this.roleList = [];
						return;
					}
					const result = await getAvatarList(userId, 'shop');
					const avatarList = (result && result.data && Array.isArray(result.data)) ? result.data : (Array.isArray(result) ? result : []);
					this.roleList = avatarList.map(item => ({
						avatar: item.avatarUrl || item.avatar,
						nickname: item.name || '',
						description: item.description || '@商户',
						id: item.id
					}));
				} catch (e) {
					console.error('加载头像列表失败:', e);
					uni.showToast({ title: '加载头像列表失败', icon: 'none' });
					this.roleList = [];
				}
			},
			async changeRl(url) {
				const isLocalPath = url && !url.startsWith('http://') && !url.startsWith('https://');
				if (isLocalPath) {
					try {
						uni.showLoading({ title: '上传头像中...', mask: true });
						const userId = uni.getStorageSync('userId');
						if (!userId) {
							throw new Error('用户未登录');
						}
						const result = await uploadAvatar(url, userId, 'shop', this.info.name || '');
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
				this.info.url = url;
				this.saveBill();
			},
			openAddPopup() {
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
			changeRole() {
				if (this.roleList.length > 0) {
					this.$refs.popup.open('center')
				} else {
					this.$refs.cradPopup.open()
				}
			},
			async onCradSubmitz(data) {
				let avatarUrl = data.avatar;
				const isLocalPath = avatarUrl && !avatarUrl.startsWith('http://') && !avatarUrl.startsWith('https://');
				if (isLocalPath) {
					try {
						uni.showLoading({ title: '上传头像中...', mask: true });
						const userId = uni.getStorageSync('userId');
						if (!userId) throw new Error('用户未登录');
						const result = await uploadAvatar(avatarUrl, userId, 'shop', data.nickname || '');
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
					await createAvatar({ userId, module: 'shop', avatarUrl, name: data.nickname || this.info.name || '' });
					await this.loadAvatarList();
				} catch (e) {
					uni.showToast({ title: e.message || '保存头像失败，请重试', icon: 'none' });
					return;
				}
				this.info.url = avatarUrl;
				this.saveBill();
			},
			onOrderSubmit(data) {
				const baseImg = this.info.url
				this.info = {
					...this.info,
					...data
				}
				this.info.url = baseImg
				this.saveBill()
			},
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
							billType: 10,
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

	.rightIcon {
		display: flex;
		align-items: center;
	}
	.tips{
		margin-top: 12rpx;
		color: #9b9b9b;
		font-size: 26rpx;
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
		font-size: 28rpx;
		padding-top: 30rpx;
		padding-bottom: 35rpx;
		/* font-weight: 500; */
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
		width: 32rpx;
		height: 32rpx;
		margin-right: 14rpx;
		position: relative;
		top: 6rpx;
	}

	.transferIcon {
		width: 34rpx;
		height: 34rpx;
		margin-right: 14rpx;
		position: relative;
		top: 6rpx;
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
		color: #878787;
		width:	170rpx;
	}
	.right{
		flex:1;
		word-wrap: break-word; 
		overflow-wrap: break-word;
		overflow: auto;
	
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
		background-color: #fff;
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
