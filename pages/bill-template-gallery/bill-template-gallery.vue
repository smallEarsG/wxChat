<template>
	<view class="container">
		<WatermarkLayer />

		<view class="header">
			<view class="back-btn" @click="goBack">
				<uni-icons type="arrowleft" size="30" color="#333" />
			</view>
			<text class="page-title">模板库</text>
			<view class="spacer"></view>
		</view>

		<view class="search-bar">
			<uni-search-bar v-model="searchText" placeholder="搜索模板" cancelButton="none" @input="onSearch" />
		</view>

		<scroll-view scroll-x class="filter-scroll">
			<view class="filter-list">
				<view
					class="filter-item"
					:class="{ active: activeFilter === 'all' }"
					@click="activeFilter = 'all'"
				>全部</view>
				<view
					class="filter-item"
					:class="{ active: activeFilter === 'recent' }"
					@click="activeFilter = 'recent'"
				>最近使用</view>
				<view
					class="filter-item"
					:class="{ active: activeFilter === 'favorite' }"
					@click="activeFilter = 'favorite'"
				>我的收藏</view>
				<view
					v-for="category in categories"
					:key="category.key"
					class="filter-item"
					:class="{ active: activeFilter === category.key }"
					@click="activeFilter = category.key"
				>{{ category.label }}</view>
			</view>
		</scroll-view>

		<scroll-view scroll-y class="content">
			<view v-if="fromRecognition" class="tip-banner">
				<text>识别完成，请选择要使用的模板</text>
			</view>

			<BillTemplateCard
				v-for="template in filteredTemplates"
				:key="template.key"
				:template="template"
				:isRecent="recentTemplates.includes(template.key)"
				:isFavorite="favoriteTemplates.includes(template.key)"
				@use="onUseTemplate"
				@toggle-favorite="onToggleFavorite"
			/>

			<view class="empty-state" v-if="filteredTemplates.length === 0">
				<text>未找到匹配的模板</text>
			</view>
		</scroll-view>

		<uni-popup ref="barcodePopup" type="bottom" background-color="#fff">
			<view class="barcode-popup">
				<view class="popup-title">条形码格式</view>
				<view
					v-for="format in barcodeFormats"
					:key="format.key"
					class="format-item"
					@click="selectBarcodeFormat(format.key)"
				>
					<text>{{ format.label }}</text>
					<uni-icons v-if="selectedBarcodeFormat === format.key" type="checkmarkempty" size="20" color="#4A90E2" />
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
import BillTemplateCard from '@/components/bill-template/BillTemplateCard.vue'
import {
	GALLERY_TEMPLATES,
	TEMPLATE_CATEGORIES,
	BARCODE_FORMATS
} from '@/config/billTemplates.js'
import {
	getRecentTemplates,
	getFavoriteTemplates,
	toggleFavoriteTemplate,
	navigateToBillTemplate
} from '@/utils/billNavigation.js'

export default {
	components: { BillTemplateCard },
	data() {
		return {
			searchText: '',
			activeFilter: 'all',
			fromRecognition: false,
			extractedInfo: null,
			recentTemplates: [],
			favoriteTemplates: [],
			pendingTemplateKey: '',
			selectedBarcodeFormat: 'auto',
			barcodeFormats: Object.values(BARCODE_FORMATS),
			categories: Object.values(TEMPLATE_CATEGORIES).filter(item => item.key !== 'custom')
		}
	},
	computed: {
		filteredTemplates() {
			let templates = [...GALLERY_TEMPLATES]

			if (this.activeFilter === 'recent') {
				templates = templates.filter(item => this.recentTemplates.includes(item.key))
			} else if (this.activeFilter === 'favorite') {
				templates = templates.filter(item => this.favoriteTemplates.includes(item.key))
			} else if (this.activeFilter !== 'all') {
				templates = templates.filter(item => item.category === this.activeFilter)
			}

			if (this.searchText.trim()) {
				const keyword = this.searchText.trim().toLowerCase()
				templates = templates.filter(item =>
					item.title.toLowerCase().includes(keyword) ||
					item.description.toLowerCase().includes(keyword)
				)
			}

			return templates
		}
	},
	onLoad(options) {
		this.fromRecognition = options.from === 'recognition'
		if (options.category) {
			this.activeFilter = options.category
		}
		if (options.info) {
			try {
				this.extractedInfo = JSON.parse(decodeURIComponent(options.info))
			} catch (e) {
				this.extractedInfo = null
			}
		}
		this.refreshMeta()
	},
	onShow() {
		this.refreshMeta()
	},
	methods: {
		refreshMeta() {
			this.recentTemplates = getRecentTemplates()
			this.favoriteTemplates = getFavoriteTemplates()
		},
		onSearch(value) {
			this.searchText = typeof value === 'string' ? value : this.searchText
		},
		onToggleFavorite(templateKey) {
			toggleFavoriteTemplate(templateKey)
			this.refreshMeta()
		},
		onUseTemplate(templateKey) {
			if (templateKey === 'barcodeBill') {
				this.pendingTemplateKey = templateKey
				this.$refs.barcodePopup.open()
				return
			}
			this.openTemplate(templateKey)
		},
		selectBarcodeFormat(formatKey) {
			this.selectedBarcodeFormat = formatKey
			this.$refs.barcodePopup.close()
			this.openTemplate(this.pendingTemplateKey || 'barcodeBill', formatKey)
		},
		openTemplate(templateKey, barcodeFormat = 'auto') {
			navigateToBillTemplate(templateKey, {
				extractedInfo: this.extractedInfo,
				barcodeFormat,
				createBillOnNavigate: !!this.extractedInfo
			})
		},
		goBack() {
			uni.navigateBack()
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
	box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.back-btn, .spacer {
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
	padding: 24rpx;
	box-sizing: border-box;
}

.tip-banner {
	padding: 20rpx 24rpx;
	margin-bottom: 20rpx;
	background: rgba(74, 144, 226, 0.1);
	border-radius: 16rpx;
	font-size: 24rpx;
	color: #4A90E2;
}

.empty-state {
	text-align: center;
	padding: 120rpx 0;
	color: #999;
	font-size: 28rpx;
}

.barcode-popup {
	padding: 30rpx;
}

.popup-title {
	font-size: 32rpx;
	font-weight: 600;
	margin-bottom: 20rpx;
}

.format-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 28rpx 10rpx;
	border-bottom: 1rpx solid #f0f0f0;
	font-size: 28rpx;
}
</style>
