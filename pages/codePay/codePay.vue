<template>
	<view class="container">
		<WatermarkLayer />

		<!-- 轻量首次引导 -->
		<view class="first-time-modal" v-if="showFirstTimeModal">
			<view class="modal-overlay" @click="skipGuide"></view>
			<view class="modal-content">
				<swiper class="guide-swiper" :current="guidePage" @change="onGuideChange">
					<swiper-item v-for="(page, index) in guidePages" :key="index">
						<view class="guide-page">
							<text class="guide-step">第 {{ index + 1 }} 步</text>
							<text class="guide-text">{{ page }}</text>
						</view>
					</swiper-item>
				</swiper>
				<view class="guide-dots">
					<view
						v-for="(page, index) in guidePages"
						:key="index"
						class="dot"
						:class="{ active: guidePage === index }"
					></view>
				</view>
				<view class="modal-footer">
					<button class="skip-btn" @click="skipGuide">跳过</button>
					<button class="confirm-btn" @click="nextGuideStep">
						{{ guidePage < guidePages.length - 1 ? '下一步' : '开始使用' }}
					</button>
				</view>
			</view>
		</view>

		<view class="header">
			<view class="back-btn" @click="goBack">
				<uni-icons type="arrowleft" size="30" color="#333" />
			</view>
			<text class="page-title">付款模板</text>
			<view class="spacer"></view>
		</view>

		<scroll-view scroll-y class="content">
			<view class="guide-link" @click="openGuide">
				<text>不会使用？查看教程 ></text>
			</view>

			<view class="entry-card primary" @click="chooseImage">
				<view class="entry-icon">
					<uni-icons type="camera" size="36" color="#fff" />
				</view>
				<view class="entry-text">
					<text class="entry-title">导入图片识别</text>
					<text class="entry-desc">自动提取金额、时间和单号</text>
				</view>
				<uni-icons type="arrowright" size="20" color="#fff" />
			</view>

			<view class="entry-card" @click="goTemplateGallery">
				<view class="entry-icon secondary">
					<uni-icons type="list" size="36" color="#4A90E2" />
				</view>
				<view class="entry-text">
					<text class="entry-title dark">直接选择模板</text>
					<text class="entry-desc dark">无需图片，手动编辑内容</text>
				</view>
				<uni-icons type="arrowright" size="20" color="#999" />
			</view>

			<view class="section" v-if="recentTemplateItems.length > 0">
				<text class="section-title">最近使用</text>
				<scroll-view scroll-x class="recent-scroll">
					<view class="recent-list">
						<view
							class="recent-item"
							v-for="item in recentTemplateItems"
							:key="item.key"
							@click="openTemplate(item.key)"
						>{{ item.title }}</view>
					</view>
				</scroll-view>
			</view>

			<view class="section">
				<text class="section-title">模板分类</text>
				<view class="category-grid">
					<view
						class="category-item"
						v-for="category in categories"
						:key="category.key"
						@click="goTemplateGallery(category.key)"
					>{{ category.label }}</view>
				</view>
			</view>

			<view class="nav-row" @click="goCustomTemplates">
				<view>
					<text class="nav-title">我的模板</text>
					<text class="nav-desc">已有 {{ customTemplateCount }} 个模板</text>
				</view>
				<uni-icons type="arrowright" size="18" color="#999" />
			</view>

			<view class="nav-row" @click="goMsg">
				<view>
					<text class="nav-title">最近记录</text>
					<text class="nav-desc">查看已保存和未完成记录</text>
				</view>
				<uni-icons type="arrowright" size="18" color="#999" />
			</view>
		</scroll-view>

		<view class="loading-overlay" v-if="isLoading">
			<view class="loading-content">
				<uni-icons type="loading" size="40" color="#4A90E2" class="loading-icon" />
				<text>识别中...</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { extractInfoWithRegex } from '@/utils/ocrExtract.js'
	import { getRecentTemplates, navigateToBillTemplate } from '@/utils/billNavigation.js'
	import { TEMPLATE_CATEGORIES, getTemplateByKey } from '@/config/billTemplates.js'

	export default {
		data() {
			return {
				imagePath: '',
				resultList: [],
				isLoading: false,
				showFirstTimeModal: false,
				guidePage: 0,
				guidePages: [
					'导入图片或直接选择模板',
					'确认识别出的金额、时间和单号',
					'编辑完成后保存到记录'
				],
				recentTemplateKeys: [],
				customTemplateCount: 0,
				baiduConfig: {
					apiKey: 'Rk9atFNERmi0vduxtu3zrF0x',
					secretKey: 'iylst8nEtnr5fTek3QWjuXPcruzCFJnK',
					apiUrl: 'https://aip.baidubce.com/rest/2.0/ocr/v1/accurate_basic'
				}
			}
		},
		computed: {
			categories() {
				return Object.values(TEMPLATE_CATEGORIES).filter(item => item.key !== 'custom')
			},
			recentTemplateItems() {
				return this.recentTemplateKeys
					.map(key => getTemplateByKey(key))
					.filter(Boolean)
			}
		},
		onShow() {
			this.checkFirstTime()
			this.loadMeta()
		},
		methods: {
			loadMeta() {
				this.recentTemplateKeys = getRecentTemplates()
				try {
					const templates = uni.getStorageSync('customTemplates') || []
					this.customTemplateCount = templates.length
				} catch (e) {
					this.customTemplateCount = 0
				}
			},
			checkFirstTime() {
				const hasSeenGuide = uni.getStorageSync('codePay_hasSeenGuide')
				if (!hasSeenGuide) {
					this.showFirstTimeModal = true
					this.guidePage = 0
				}
			},
			openGuide() {
				this.showFirstTimeModal = true
				this.guidePage = 0
			},
			onGuideChange(e) {
				this.guidePage = e.detail.current
			},
			nextGuideStep() {
				if (this.guidePage < this.guidePages.length - 1) {
					this.guidePage += 1
					return
				}
				this.skipGuide()
			},
			skipGuide() {
				uni.setStorageSync('codePay_hasSeenGuide', true)
				this.showFirstTimeModal = false
			},
			goBack() {
				uni.navigateBack()
			},
			goMsg() {
				uni.navigateTo({ url: '/pages/msgList/msgList' })
			},
			goCustomTemplates() {
				uni.navigateTo({ url: '/pages/custom-templates/custom-templates' })
			},
			goTemplateGallery(category = '') {
				const query = category ? `?category=${category}` : ''
				uni.navigateTo({ url: `/pages/bill-template-gallery/bill-template-gallery${query}` })
			},
			openTemplate(templateKey) {
				navigateToBillTemplate(templateKey)
			},
			chooseImage() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						this.imagePath = res.tempFilePaths[0]
						this.startOcr()
					},
					fail: () => {
						uni.showToast({ title: '选择图片失败', icon: 'none' })
					}
				})
			},
			async startOcr() {
				if (!this.imagePath) return
				this.isLoading = true
				try {
					const accessToken = await this.getBaiduAccessToken()
					const result = await this.uploadToBaiduOCR(this.imagePath, accessToken)
					this.handleOcrResult(result)
				} catch (error) {
					console.error('识别失败:', error)
					uni.showToast({ title: '识别失败，请重试', icon: 'none' })
				} finally {
					this.isLoading = false
				}
			},
			getBaiduAccessToken() {
				return new Promise((resolve, reject) => {
					uni.request({
						url: `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${this.baiduConfig.apiKey}&client_secret=${this.baiduConfig.secretKey}`,
						method: 'GET',
						success: (res) => resolve(res.data.access_token),
						fail: () => reject(new Error('获取 Token 失败'))
					})
				})
			},
			uploadToBaiduOCR(imagePath, accessToken) {
				return new Promise(async (resolve, reject) => {
					try {
						const base64Image = await this.readImageAsBase64(imagePath)
						uni.request({
							url: `${this.baiduConfig.apiUrl}?access_token=${accessToken}`,
							method: 'POST',
							header: { 'Content-Type': 'application/x-www-form-urlencoded' },
							data: {
								image: base64Image,
								language_type: 'CHN_ENG',
								detect_direction: 'true'
							},
							success: (res) => {
								if (res.statusCode === 200) resolve(res.data)
								else reject(new Error(`请求失败：${res.statusCode}`))
							},
							fail: reject
						})
					} catch (error) {
						reject(error)
					}
				})
			},
			async readImageAsBase64(imagePath) {
				// #ifdef H5
				return new Promise((resolve, reject) => {
					const xhr = new XMLHttpRequest()
					xhr.open('GET', imagePath, true)
					xhr.responseType = 'blob'
					xhr.onload = () => {
						if (xhr.status === 200) {
							const reader = new FileReader()
							reader.onloadend = () => resolve(reader.result.split(',')[1])
							reader.readAsDataURL(xhr.response)
						} else {
							reject(new Error(`图片加载失败: ${xhr.status}`))
						}
					}
					xhr.onerror = reject
					xhr.send()
				})
				// #endif

				if (typeof uni.readFile === 'function') {
					try {
						const { data } = await uni.readFile({ filePath: imagePath, encoding: 'base64' })
						return data.replace(/^data:image\/\w+;base64,/, '')
					} catch (err) {
						console.error('uni.readFile 失败:', err)
					}
				}

				if (typeof plus !== 'undefined') {
					return new Promise((resolve, reject) => {
						plus.io.resolveLocalFileSystemURL(imagePath, (entry) => {
							entry.file((file) => {
								const reader = new plus.io.FileReader()
								reader.onloadend = (e) => resolve(e.target.result.split(',')[1])
								reader.onerror = (err) => reject(new Error(`读取文件失败: ${err.message}`))
								reader.readAsDataURL(file)
							}, reject)
						}, reject)
					})
				}

				throw new Error('无法在当前环境读取文件')
			},
			handleOcrResult(result) {
				this.resultList = result.words_result || []
				if (this.resultList.length === 0) {
					uni.showToast({ title: '未识别到文字', icon: 'none' })
					return
				}
				const extractedInfo = extractInfoWithRegex(this.resultList)
				const info = encodeURIComponent(JSON.stringify(extractedInfo))
				uni.navigateTo({
					url: `/pages/bill-recognition-result/bill-recognition-result?info=${info}`
				})
			}
		}
	}
</script>

<style scoped>
.container {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: #f8f9fa;
	display: flex;
	flex-direction: column;
	overflow: hidden;
}

.header {
	height: 100rpx;
	display: flex;
	align-items: center;
	padding: 0 30rpx;
	background-color: #fff;
	box-shadow: 0 2rpx 5rpx rgba(0, 0, 0, 0.05);
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
	font-size: 36rpx;
	font-weight: 600;
	color: #333;
}

.content {
	flex: 1;
	padding: 30rpx;
	box-sizing: border-box;
}

.guide-link {
	text-align: right;
	font-size: 24rpx;
	color: #4A90E2;
	margin-bottom: 20rpx;
}

.entry-card {
	display: flex;
	align-items: center;
	padding: 32rpx;
	border-radius: 20rpx;
	background: #fff;
	margin-bottom: 24rpx;
	box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.05);
}

.entry-card.primary {
	background: linear-gradient(135deg, #4A90E2, #3A80D2);
}

.entry-icon {
	width: 88rpx;
	height: 88rpx;
	border-radius: 20rpx;
	background: rgba(255, 255, 255, 0.2);
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 24rpx;
}

.entry-icon.secondary {
	background: rgba(74, 144, 226, 0.1);
}

.entry-text {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.entry-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #fff;
}

.entry-title.dark {
	color: #333;
}

.entry-desc {
	font-size: 24rpx;
	color: rgba(255, 255, 255, 0.85);
	margin-top: 8rpx;
}

.entry-desc.dark {
	color: #888;
}

.section {
	margin: 10rpx 0 24rpx;
}

.section-title {
	display: block;
	font-size: 28rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 16rpx;
}

.recent-scroll {
	white-space: nowrap;
}

.recent-list {
	display: inline-flex;
}

.recent-item {
	display: inline-block;
	padding: 14rpx 28rpx;
	margin-right: 16rpx;
	background: #fff;
	border-radius: 30rpx;
	font-size: 24rpx;
	color: #4A90E2;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
}

.category-grid {
	display: flex;
	flex-wrap: wrap;
	gap: 16rpx;
}

.category-item {
	width: calc(50% - 8rpx);
	padding: 28rpx 0;
	text-align: center;
	background: #fff;
	border-radius: 16rpx;
	font-size: 28rpx;
	color: #333;
	box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
}

.nav-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 28rpx;
	background: #fff;
	border-radius: 16rpx;
	margin-bottom: 16rpx;
}

.nav-title {
	display: block;
	font-size: 30rpx;
	font-weight: 600;
	color: #333;
}

.nav-desc {
	display: block;
	font-size: 24rpx;
	color: #999;
	margin-top: 8rpx;
}

.loading-overlay {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(255, 255, 255, 0.7);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 100;
}

.loading-content {
	padding: 40rpx 50rpx;
	background-color: #fff;
	border-radius: 20rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.loading-icon {
	margin-bottom: 15rpx;
	animation: spin 1.5s linear infinite;
}

@keyframes spin {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}

.first-time-modal {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 9999;
	display: flex;
	align-items: center;
	justify-content: center;
}

.modal-overlay {
	position: absolute;
	inset: 0;
	background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
	position: relative;
	width: 86%;
	max-width: 620rpx;
	background: #fff;
	border-radius: 20rpx;
	overflow: hidden;
}

.guide-swiper {
	height: 260rpx;
}

.guide-page {
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 30rpx;
}

.guide-step {
	font-size: 24rpx;
	color: #4A90E2;
	margin-bottom: 20rpx;
}

.guide-text {
	font-size: 32rpx;
	color: #333;
	text-align: center;
	line-height: 1.6;
}

.guide-dots {
	display: flex;
	justify-content: center;
	padding-bottom: 10rpx;
}

.dot {
	width: 12rpx;
	height: 12rpx;
	border-radius: 50%;
	background: #ddd;
	margin: 0 8rpx;
}

.dot.active {
	background: #4A90E2;
}

.modal-footer {
	display: flex;
	padding: 24rpx;
	border-top: 1rpx solid #f0f0f0;
}

.skip-btn,
.confirm-btn {
	flex: 1;
	height: 80rpx;
	line-height: 80rpx;
	border-radius: 16rpx;
	font-size: 28rpx;
}

.skip-btn {
	margin-right: 16rpx;
	background: #f5f7fa;
	color: #666;
}

.confirm-btn {
	background: linear-gradient(135deg, #4A90E2, #3A80D2);
	color: #fff;
}
</style>
