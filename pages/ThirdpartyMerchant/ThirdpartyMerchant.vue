<template>
	<view class="container">
		<!-- 全局水印层 -->
		<WatermarkLayer />
		
		<ThirdpartyMerchantBill 
			:info="info" 
			@goBack="goBack"
			@changeRole="changeRole"
			@exitInfo="exitInfo"
		/>
		
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
import ThirdpartyMerchantBill from '@/components/bill-preview/ThirdpartyMerchantBill.vue'
import { uploadAvatar, getAvatarList, createAvatar, deleteAvatar, createBill, updateBill, getBillById } from '@/api/index.js'

	export default {
		components: {
			CommonHeader,
			ThirdpartyMerchantBill
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
	
	.container {
		background-color: #eaeaea;
		display: flex;
		flex-direction: column;
		height: 100vh;
	}
</style>
