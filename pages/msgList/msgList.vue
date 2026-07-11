<template>
	<view class="container">
		<WatermarkLayer />

		<view class="search-bar">
			<uni-search-bar v-model="searchText" placeholder="搜索名称、金额、单号" cancelButton="none" />
		</view>

		<scroll-view scroll-x class="filter-scroll">
			<view class="filter-list">
				<view
					v-for="filter in filters"
					:key="filter.key"
					class="filter-item"
					:class="{ active: activeFilter === filter.key }"
					@click="activeFilter = filter.key"
				>{{ filter.label }}</view>
			</view>
		</scroll-view>

		<view class="content">
			<template v-if="groupedList.length > 0">
				<view v-for="group in groupedList" :key="group.label" class="group-section">
					<text class="group-title">{{ group.label }}</text>
					<uni-swipe-action>
						<uni-swipe-action-item
							v-for="(item, index) in group.items"
							:key="item.info.id || index"
							:right-options="options"
							:auto-close="false"
							@click="bindClick(item.globalIndex)"
						>
							<view class="record-item" @click="goPage(item)">
								<view class="record-main">
									<text class="record-title">{{ getRecordTitle(item) }}</text>
									<text class="record-subtitle">{{ getRecordSubtitle(item) }}</text>
								</view>
								<view class="record-side">
									<text class="record-time">{{ getRecordTime(item) }}</text>
									<text class="record-action">编辑 ></text>
								</view>
							</view>
						</uni-swipe-action-item>
					</uni-swipe-action>
				</view>
			</template>

			<view class="empty-state" v-else>
				<uni-icons type="list" size="60" color="#ccc" />
				<text class="empty-text">暂无付款模板记录</text>
				<text class="empty-link" @click="goCreate">创建第一条记录 ></text>
			</view>
		</view>
	</view>
</template>

<script>
import { queryBillList, deleteBill } from '@/api/index.js'
import { getBillTypeLabel } from '@/config/billType.js'
import { BILL_TYPE_ROUTE_MAP } from '@/config/billTemplates.js'

export default {
	data() {
		return {
			searchText: '',
			activeFilter: 'all',
			list: [],
			options: [{
				text: '删除',
				style: { backgroundColor: '#F56C6C' }
			}],
			filters: [
				{ key: 'all', label: '全部' },
				{ key: 'draft', label: '草稿' },
				{ key: 'completed', label: '已完成' },
				{ key: '1', label: '转账付款' },
				{ key: '2', label: '扫码收款' },
				{ key: '3', label: '扫码付款' },
				{ key: '4', label: '商户付款' },
				{ key: '99', label: '自定义模板' }
			]
		}
	},
	computed: {
		filteredList() {
			let result = [...this.list]

			if (this.activeFilter === 'draft') {
				result = result.filter(item => item.status === 'draft')
			} else if (this.activeFilter === 'completed') {
				result = result.filter(item => item.status === 'completed')
			} else if (this.activeFilter !== 'all') {
				const typeNum = parseInt(this.activeFilter, 10)
				result = result.filter(item => Number(item.type) === typeNum)
			}

			if (this.searchText.trim()) {
				const keyword = this.searchText.trim().toLowerCase()
				result = result.filter(item => {
					const info = item.info || {}
					const fields = [
						info.name,
						info.transferName,
						info.money,
						info.num,
						info.orderNumber,
						info.shopNumber,
						info.desc,
						getBillTypeLabel(item.type)
					]
					return fields.some(field => String(field || '').toLowerCase().includes(keyword))
				})
			}

			return result.map((item, globalIndex) => ({ ...item, globalIndex }))
		},
		groupedList() {
			const groups = {}
			this.filteredList.forEach(item => {
				const label = this.getGroupLabel(item)
				if (!groups[label]) groups[label] = []
				groups[label].push(item)
			})
			return Object.keys(groups).map(label => ({ label, items: groups[label] }))
		}
	},
	async onLoad() {
		await this.loadBillList()
	},
	onShow() {
		this.loadBillList()
	},
	methods: {
		async loadBillList() {
			try {
				const userId = uni.getStorageSync('userId')
				if (!userId) {
					this.list = []
					return
				}

				const result = await queryBillList(userId, 'wechat')
				let billList = []
				if (result && result.data && Array.isArray(result.data)) {
					billList = result.data
				} else if (Array.isArray(result)) {
					billList = result
				}

				this.list = billList.map(bill => {
					let info = {}
					try {
						if (bill.billDetail) {
							info = typeof bill.billDetail === 'string' ? JSON.parse(bill.billDetail) : bill.billDetail
						}
					} catch (e) {
						info = {}
					}

					const billType = bill && bill.billType !== undefined ? bill.billType : undefined
					const typeNum = typeof billType === 'number' ? billType : parseInt(String(billType || ''), 10)

					return {
						type: Number.isFinite(typeNum) ? typeNum : 1,
						status: bill.status || 'completed',
						updateTime: bill.updateTime || bill.createTime || Date.now(),
						info: {
							...info,
							id: bill.id,
							billType
						}
					}
				})
			} catch (error) {
				console.error('加载账单列表失败:', error)
				this.list = []
			}
		},
		getGroupLabel(item) {
			const time = item.updateTime || Date.now()
			const date = new Date(time)
			const today = new Date()
			const yesterday = new Date()
			yesterday.setDate(today.getDate() - 1)

			const sameDay = (a, b) =>
				a.getFullYear() === b.getFullYear() &&
				a.getMonth() === b.getMonth() &&
				a.getDate() === b.getDate()

			if (sameDay(date, today)) return '今天'
			if (sameDay(date, yesterday)) return '昨天'
			return `${date.getMonth() + 1}月${date.getDate()}日`
		},
		getRecordTitle(item) {
			return getBillTypeLabel(item.type)
		},
		getRecordSubtitle(item) {
			const info = item.info || {}
			const name = info.transferName || info.name || '未命名'
			const money = info.money || info.num || '--'
			return `${name} · ${money}`
		},
		getRecordTime(item) {
			const time = item.updateTime || Date.now()
			const date = new Date(time)
			const hour = String(date.getHours()).padStart(2, '0')
			const minute = String(date.getMinutes()).padStart(2, '0')
			return `${hour}:${minute}`
		},
		goCreate() {
			uni.navigateTo({ url: '/pages/codePay/codePay' })
		},
		async bindClick(index) {
			const filteredItem = this.filteredList[index]
			if (!filteredItem || !filteredItem.info || !filteredItem.info.id) {
				uni.showToast({ title: '账单ID不存在', icon: 'none' })
				return
			}
			const billId = filteredItem.info.id

			uni.showModal({
				title: '确认删除',
				content: '确定要删除这条记录吗？',
				success: async (res) => {
					if (!res.confirm) return
					try {
						const result = await deleteBill(billId)
						if (result && result.code === 200) {
							this.list = this.list.filter(item => item.info.id !== billId)
							uni.showToast({ title: '删除成功', icon: 'success' })
						} else {
							uni.showToast({ title: result?.message || '删除失败', icon: 'none' })
						}
					} catch (error) {
						uni.showToast({ title: '删除失败，请重试', icon: 'none' })
					}
				}
			})
		},
		goPage(item) {
			const info = item && item.info ? item.info : null
			if (!info || !info.id) {
				uni.showToast({ title: '账单ID不存在', icon: 'none' })
				return
			}

			const billType = info.billType !== undefined ? info.billType : item.type
			const typeNum = typeof billType === 'number' ? billType : parseInt(String(billType || ''), 10)
			const targetRoute = BILL_TYPE_ROUTE_MAP[typeNum] || BILL_TYPE_ROUTE_MAP[4]
			const url = `${targetRoute}?billId=${encodeURIComponent(String(info.id))}`
			uni.navigateTo({ url })
		}
	}
}
</script>

<style>
.container {
	background-color: #f5f7fa;
	display: flex;
	flex-direction: column;
	position: absolute;
	top: 0;
	right: 0;
	left: 0;
	bottom: 0;
	overflow: hidden;
}

.search-bar {
	background: #fff;
	padding: 10rpx 10rpx 0;
}

.filter-scroll {
	background: #fff;
	white-space: nowrap;
	border-bottom: 1rpx solid #f0f0f0;
}

.filter-list {
	display: inline-flex;
	padding: 0 20rpx 16rpx;
}

.filter-item {
	display: inline-block;
	padding: 10rpx 24rpx;
	margin-right: 16rpx;
	border-radius: 30rpx;
	font-size: 24rpx;
	color: #666;
	background: #f5f7fa;
}

.filter-item.active {
	color: #fff;
	background: #4A90E2;
}

.content {
	flex: 1;
	overflow-y: auto;
	padding: 20rpx 0;
}

.group-title {
	display: block;
	padding: 10rpx 30rpx;
	font-size: 24rpx;
	color: #999;
}

.record-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 28rpx 30rpx;
	background: #fff;
	border-bottom: 1rpx solid #f5f5f5;
}

.record-main {
	flex: 1;
	min-width: 0;
}

.record-title {
	display: block;
	font-size: 30rpx;
	font-weight: 600;
	color: #333;
}

.record-subtitle {
	display: block;
	margin-top: 8rpx;
	font-size: 24rpx;
	color: #888;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.record-side {
	text-align: right;
	margin-left: 20rpx;
}

.record-time {
	display: block;
	font-size: 22rpx;
	color: #999;
}

.record-action {
	display: block;
	margin-top: 8rpx;
	font-size: 24rpx;
	color: #4A90E2;
}

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

.empty-link {
	margin-top: 16rpx;
	font-size: 28rpx;
	color: #4A90E2;
}
</style>
