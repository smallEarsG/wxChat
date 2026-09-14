<template>
	<view class="container">
		<WatermarkLayer />

		<ProfileTransactionBill
			:info="info"
			:statusBarHeight="statusBarHeight"
			@goBack="goBack"
			@changeRole="changeRole"
			@editInfo="editInfo"
		/>

		<uni-popup ref="popup" type="bottom" background-color="#fff" border-radius="10px">
			<view class="role-list">
				<view class="role-list-content">
					<uni-swipe-action v-if="roleList.length > 0">
						<uni-swipe-action-item
							v-for="(item, index) in roleList"
							:key="item.id || index"
							:right-options="deleteOptions"
							:auto-close="false"
							@click="deleteRole(index)"
						>
							<view class="role-item" @click="selectRole(item.avatar)">
								<uni-list-chat
									:avatar-circle="true"
									:title="item.nickname"
									:avatar="item.avatar"
									:note="item.description"
									:clickable="true"
								></uni-list-chat>
							</view>
						</uni-swipe-action-item>
					</uni-swipe-action>
				</view>
				<button class="add-role-btn" @click="openAddRole">添加角色</button>
			</view>
		</uni-popup>

		<EditableFormPopup ref="orderPopup" :value="info" :fieldLabels="infoKey" @submit="onInfoSubmit" />
		<ProfileEditPopup ref="cardPopup" @submit="onRoleSubmit" />
		<BillTemplateGuide template-key="profileTransaction" />
	</view>
</template>

<script>
import {
	uploadAvatar,
	getAvatarList,
	createAvatar,
	deleteAvatar,
	createBill,
	updateBill,
	getBillById
} from '@/api/index.js'
import { BILL_TYPE } from '@/config/billType.js'
import ProfileTransactionBill from '@/components/bill-preview/ProfileTransactionBill.vue'
import BillTemplateGuide from '@/components/BillTemplateGuide/BillTemplateGuide.vue'

export default {
	components: {
		ProfileTransactionBill,
		BillTemplateGuide
	},
	data() {
		return {
			deleteOptions: [{
				text: '删除',
				style: { backgroundColor: '#F56C6C' }
			}],
			statusBarHeight: uni.getSystemInfoSync().statusBarHeight || 0,
			roleList: [],
			id: null,
			info: {
				url: '',
				name: '成师傅',
				money: '-41.00',
				currentState: '支付成功',
				institution: '财付通支付科技有限公司',
				time: '2026年09月11日 19:38:14',
				payment: '工商银行储蓄卡(0818)',
				orderNumber: '4500000333202609115080149594',
				BoNumber: '10181159622117891266880120101501',
				padd: 64,
				fontSize: 100
			},
			infoKey: {
				name: '姓名',
				money: '金额',
				currentState: '当前状态',
				institution: '收单机构',
				time: '支付时间',
				payment: '支付方式',
				orderNumber: '交易单号',
				BoNumber: '经营单号',
				padd: '左右边距',
				fontSize: '字体大小'
			}
		}
	},
	async onLoad(options) {
		const rawId = options && (options.billId || options.id)
		if (rawId !== undefined && rawId !== null && rawId !== '') {
			this.id = rawId
			try {
				const response = await getBillById(this.id)
				const bill = response && response.data ? response.data : response
				if (bill && bill.billDetail) {
					const detail = typeof bill.billDetail === 'string'
						? JSON.parse(bill.billDetail)
						: bill.billDetail
					this.info = { ...this.info, ...(detail || {}) }
				}
			} catch (error) {
				uni.showToast({ title: '账单不存在', icon: 'none' })
				setTimeout(() => uni.navigateBack(), 300)
				return
			}
		} else if (options && options.info) {
			try {
				const detail = JSON.parse(decodeURIComponent(options.info))
				this.info = { ...this.info, ...(detail || {}) }
			} catch (error) {
				uni.showToast({ title: '账单信息格式错误', icon: 'none' })
			}
		}

		this.loadAvatarList()
	},
	methods: {
		async loadAvatarList() {
			try {
				const userId = uni.getStorageSync('userId')
				if (!userId) {
					this.roleList = []
					return
				}
				const result = await getAvatarList(userId, 'wechat')
				const list = result && result.data && Array.isArray(result.data)
					? result.data
					: (Array.isArray(result) ? result : [])
				this.roleList = list.map(item => ({
					avatar: item.avatarUrl || item.avatar,
					nickname: item.name || '',
					description: item.description || '@微信',
					id: item.id
				}))
			} catch (error) {
				console.error('加载头像列表失败:', error)
				this.roleList = []
			}
		},
		async saveBill() {
			try {
				const userId = uni.getStorageSync('userId')
				if (!userId) return
				const billDetail = JSON.stringify(this.info || {})
				if (this.id === null || this.id === undefined) {
					const result = await createBill({
						platform: 'wechat',
						billType: BILL_TYPE.PROFILE_TRANSACTION,
						billDetail,
						createUserId: userId,
						remark: this.info.name || ''
					})
					if (result && result.data && result.data.id) this.id = result.data.id
				} else {
					await updateBill(this.id, { billDetail })
				}
			} catch (error) {
				console.error('保存账单失败:', error)
			}
		},
		changeRole() {
			if (this.roleList.length > 0) {
				this.$refs.popup.open('center')
			} else {
				this.$refs.cardPopup.open()
			}
		},
		openAddRole() {
			this.$refs.cardPopup.open()
		},
		async selectRole(url) {
			let avatarUrl = url
			const isLocalPath = avatarUrl && !avatarUrl.startsWith('http://') && !avatarUrl.startsWith('https://')
			if (isLocalPath) {
				try {
					uni.showLoading({ title: '上传头像中...', mask: true })
					const userId = uni.getStorageSync('userId')
					if (!userId) throw new Error('用户未登录')
					const result = await uploadAvatar(avatarUrl, userId, 'wechat', this.info.name || '')
					avatarUrl = result.avatarUrl
				} catch (error) {
					uni.showToast({ title: error.message || '上传头像失败，请重试', icon: 'none' })
					return
				} finally {
					uni.hideLoading()
				}
			}
			this.info.url = avatarUrl
			this.$refs.popup.close()
			this.saveBill()
		},
		async deleteRole(index) {
			const item = this.roleList[index]
			if (!item) return
			try {
				if (item.id) await deleteAvatar(item.id)
				await this.loadAvatarList()
				uni.showToast({ title: '删除成功', icon: 'success' })
			} catch (error) {
				uni.showToast({ title: error.message || '删除失败，请重试', icon: 'none' })
			}
		},
		async onRoleSubmit(data) {
			let avatarUrl = data.avatar
			const isLocalPath = avatarUrl && !avatarUrl.startsWith('http://') && !avatarUrl.startsWith('https://')
			try {
				const userId = uni.getStorageSync('userId')
				if (!userId) throw new Error('用户未登录')
				if (isLocalPath) {
					uni.showLoading({ title: '上传头像中...', mask: true })
					const uploadResult = await uploadAvatar(avatarUrl, userId, 'wechat', data.nickname || '')
					avatarUrl = uploadResult.avatarUrl
				}
				await createAvatar({
					userId,
					module: 'wechat',
					avatarUrl,
					name: data.nickname || this.info.name || ''
				})
				await this.loadAvatarList()
				this.info.url = avatarUrl
				this.saveBill()
			} catch (error) {
				uni.showToast({ title: error.message || '保存头像失败，请重试', icon: 'none' })
			} finally {
				uni.hideLoading()
			}
		},
		onInfoSubmit(data) {
			const avatar = this.info.url
			this.info = { ...this.info, ...data, url: avatar }
			this.saveBill()
		},
		editInfo() {
			this.$refs.orderPopup.open()
		},
		goBack() {
			uni.navigateBack()
		}
	}
}
</script>

<style scoped>
.container {
	position: absolute;
	top: 0;
	right: 0;
	bottom: 0;
	left: 0;
	overflow: hidden;
}

.role-list {
	width: 600rpx;
	height: 800rpx;
	display: flex;
	flex-direction: column;
}

.role-list-content {
	flex: 1;
	overflow: auto;
}

.role-item {
	width: 100%;
}

.add-role-btn {
	margin: 20rpx 30rpx;
}
</style>
