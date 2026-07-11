<template>
	<view class="container">
		<WatermarkLayer />

		<view class="header">
			<view class="back-btn" @click="goBack">
				<uni-icons type="arrowleft" size="30" color="#333" />
			</view>
			<text class="page-title">我的模板</text>
			<view class="add-btn" @click="createTemplate">
				<uni-icons type="plusempty" size="24" color="#4A90E2" />
			</view>
		</view>

		<view class="search-bar">
			<uni-search-bar v-model="searchText" placeholder="搜索模板" cancelButton="none" />
		</view>

		<scroll-view scroll-y class="content">
			<view class="template-item" v-for="(template, index) in filteredTemplates" :key="template.id">
				<view class="template-info" @click="useTemplate(template.id)">
					<view class="template-name">{{ template.name }}</view>
					<view class="template-time">更新于 {{ formatTime(template.updateTime) }}</view>
				</view>
				<view class="template-actions">
					<text class="action-text" @click="editTemplate(template.id)">编辑</text>
					<text class="action-text" @click="copyTemplate(template)">复制</text>
					<text class="action-text primary" @click="useTemplate(template.id)">使用</text>
					<text class="action-text danger" @click="deleteTemplate(template.id, index)">删除</text>
				</view>
			</view>

			<view class="empty-state" v-if="filteredTemplates.length === 0">
				<uni-icons type="compose" size="60" color="#ccc" />
				<text class="empty-text">暂无自定义模板</text>
				<text class="empty-link" @click="createTemplate">创建第一个模板 ></text>
			</view>
		</scroll-view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			searchText: '',
			customTemplates: []
		}
	},
	computed: {
		filteredTemplates() {
			const sorted = [...this.customTemplates].sort((a, b) => (b.updateTime || 0) - (a.updateTime || 0))
			if (!this.searchText.trim()) return sorted
			const keyword = this.searchText.trim().toLowerCase()
			return sorted.filter(item => (item.name || '').toLowerCase().includes(keyword))
		}
	},
	onShow() {
		this.loadCustomTemplates()
	},
	methods: {
		loadCustomTemplates() {
			try {
				this.customTemplates = uni.getStorageSync('customTemplates') || []
			} catch (e) {
				this.customTemplates = []
			}
		},
		formatTime(timestamp) {
			if (!timestamp) return ''
			const date = new Date(timestamp)
			const year = date.getFullYear()
			const month = String(date.getMonth() + 1).padStart(2, '0')
			const day = String(date.getDate()).padStart(2, '0')
			const hour = String(date.getHours()).padStart(2, '0')
			const minute = String(date.getMinutes()).padStart(2, '0')
			return `${year}-${month}-${day} ${hour}:${minute}`
		},
		goBack() {
			uni.navigateBack()
		},
		createTemplate() {
			uni.navigateTo({ url: '/pages/template-config/template-config' })
		},
		editTemplate(templateId) {
			uni.navigateTo({ url: `/pages/template-config/template-config?id=${templateId}` })
		},
		useTemplate(templateId) {
			uni.navigateTo({ url: `/pages/custom-template-page/custom-template-page?templateId=${templateId}` })
		},
		copyTemplate(template) {
			try {
				const templates = uni.getStorageSync('customTemplates') || []
				const copy = {
					...template,
					id: `tpl_${Date.now()}`,
					name: `${template.name}（副本）`,
					updateTime: Date.now()
				}
				templates.unshift(copy)
				uni.setStorageSync('customTemplates', templates)
				this.customTemplates = templates
				uni.showToast({ title: '复制成功', icon: 'success' })
			} catch (e) {
				uni.showToast({ title: '复制失败', icon: 'none' })
			}
		},
		deleteTemplate(templateId, index) {
			uni.showModal({
				title: '确认删除',
				content: '确定要删除这个模板吗？',
				success: (res) => {
					if (!res.confirm) return
					try {
						let templates = uni.getStorageSync('customTemplates') || []
						templates = templates.filter(t => t.id !== templateId)
						uni.setStorageSync('customTemplates', templates)
						this.customTemplates = templates
						uni.showToast({ title: '删除成功', icon: 'success' })
					} catch (e) {
						uni.showToast({ title: '删除失败', icon: 'none' })
					}
				}
			})
		}
	}
}
</script>

<style scoped>
.container {
	min-height: 100vh;
	background: #f5f7fa;
	display: flex;
	flex-direction: column;
}

.header {
	height: 100rpx;
	display: flex;
	align-items: center;
	padding: 0 30rpx;
	background: #fff;
}

.back-btn, .add-btn {
	width: 60rpx;
	height: 60rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.page-title {
	flex: 1;
	text-align: center;
	font-size: 34rpx;
	font-weight: 600;
}

.search-bar {
	background: #fff;
	padding: 0 10rpx 10rpx;
}

.content {
	flex: 1;
	padding: 24rpx;
}

.template-item {
	background: #fff;
	border-radius: 16rpx;
	padding: 24rpx;
	margin-bottom: 16rpx;
}

.template-name {
	font-size: 30rpx;
	font-weight: 600;
	color: #333;
}

.template-time {
	font-size: 24rpx;
	color: #999;
	margin-top: 8rpx;
}

.template-actions {
	display: flex;
	flex-wrap: wrap;
	gap: 20rpx;
	margin-top: 20rpx;
}

.action-text {
	font-size: 24rpx;
	color: #666;
}

.action-text.primary {
	color: #4A90E2;
}

.action-text.danger {
	color: #f56c6c;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 160rpx 0;
}

.empty-text {
	margin-top: 24rpx;
	font-size: 28rpx;
	color: #999;
}

.empty-link {
	margin-top: 16rpx;
	font-size: 28rpx;
	color: #4A90E2;
}
</style>
