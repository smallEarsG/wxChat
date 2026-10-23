<template>
	<view class="customer-assistant">
		<view style="background-color:#3074db;position: relative;">
			<view class="back" role="button" aria-label="返回工作台" @click="goBack"></view>
			<image src="/static/cur-data/chat/h1_ios.png" mode="widthFix" style="position: relative;top:-56rpx;"></image>
		</view>
		<view class="content"  style="margin-top: -20rpx;">
			<view class="msgBox">
				<view class="contact-header">
					<image class="contact-header-icon" src="/static/cur-data/contact-header-icon.svg" mode="aspectFit" />
					<view class="contact-header-copy">
						<text class="contact-header-title">客户联系</text>
						<view class="contact-header-scale" role="button" aria-label="编辑外部联系人规模" @click="openExternalContactScaleModal">
							<text class="contact-header-scale-label">外部联系人规模：{{ externalContactScale }} 位</text>
							<text class="contact-header-arrow">›</text>
						</view>
					</view>
				</view>
			</view>
			<view style="background-color: #edf0f5;padding-bottom: 40rpx;">
				<view class="menuCrad card category-card">
					<view class="category-info">
						<view class="category-title-row">
							<view class="category-title" role="button" aria-label="编辑经营类目" @click="openCategoryModal">经营类目：{{ hasCategory ? category : '未知' }}</view>
							<view v-if="!hasCategory" class="category-help" role="button" aria-label="经营类目说明" @click.stop="showCategoryHelp">?</view>
						</view>
						<view v-if="!hasCategory" class="category-description">
							<text>经营类目是企业为客户提供的产品或服务类型。</text><text class="category-more" role="button" @click.stop="showCategoryHelp">了解更多</text>
						</view>
					</view>
					<view v-if="!hasCategory" class="category-select" role="button" @click="openCategoryModal">去选择</view>
				</view>
				<view class="cardlist">
					<view class="card" @click="openOverviewModal">
						<view class="title">
							企业全部客户概况 <image class="icon" src="/static/cur-data/conelse/v9.png" mode="widthFix"></image>
						</view>
						<view class="card-data">
							<view class="data-item">
								<view class="mum">
									{{ overview.totalCustomers }}
								</view>
								<view class="desc">
									客户总数
								</view>
							</view>
							<view class="data-item">
								<view class="mum">
									{{ overview.todayNewCustomers }}
								</view>
								<view class="desc">
									今日新增客户数
								</view>
							</view>
							<view class="data-item">
								<view class="mum">
									<image class="moneyicon" src="/static/cur-data/conelse/money.png" mode="widthFix"></image>{{ overview.todayIncome }}
								</view>
								<view class="desc">
									今日收款
								</view>
								<view class="moreAdd" v-if="overview.showMoreAdd">
									<image class="v6" src="/static/cur-data/conelse/v6.png" mode="widthFix"></image>
								</view>
							</view>
						</view>
						<view class="line_x"></view>
						<view class="card-foot">
							<view class="foot-left">
								<image class="iconv5" src="/static/cur-data/conelse/v5.png" mode="widthFix"></image>
								<view class="title">
									{{ overview.dashboardTitle }}
								</view>
							</view>
							<view class="foot-right leimu">
								{{ overview.dashboardDesc }}
									<image class="config-arrow"  src="/static/cur-data/chat/li_right_icon.png" mode="widthFix"></image>
							</view>
						</view>
					</view>
					<view class="card" @click="openWeeklyModal">
						<view class="card-foot">
							<view class="title">
								企业本周业绩
							</view>
							<view class="foot-right " >
								<image style="width: 146rpx;" src="/static/cur-data/conelse/v4.png" mode="widthFix"></image>
								<image class="config-arrow"  src="/static/cur-data/chat/li_right_icon.png" mode="widthFix"></image>
							</view>
						</view>
						<view class="card-content">
							<view class="content-item">
								<view class="title">
									线上<text class="money"> {{ weekly.onlineAmount }}</text>元
								</view>
								<view class="desc">
									{{ weekly.onlineDesc }}
								</view>
							</view>
							<view style="width: 20rpx;"/>
							<view class="content-item">
								<view class="title">
									线下<text class="money"> {{ weekly.offlineAmount }}</text>元
								</view>
								<view class="desc">
									{{ weekly.offlineDesc }}
								</view>
							</view>
						</view>
					</view>
					<image src="/static/cur-data/conelse/v3.png" mode="widthFix" style="margin-top: -12rpx;"></image>
					<view class="card" @click="openBusinessModal">
						<view class="card-foot">
							<view class="title">
								经营
							</view>
						</view>
						<view class="card-content">
							<view class="content-item">
								<image class="v1" src="/static/cur-data/conelse/v1.png" mode="widthFix"></image>
								<view class="item-title">
									{{ business.churnTitle }}
								</view>
								<view class="desc">
									{{ business.churnDesc }}
								</view>
							</view>
						<view style="width: 20rpx;"/>
							<view class="content-item">
								<image class="v1" src="/static/cur-data/conelse/v2.png" mode="widthFix"></image>
								<view class="item-title">
									{{ business.riskTitle }}
								</view>
								<view class="desc">
									{{ business.riskDesc }}
								</view>
							</view>
						</view>
					</view>
					
					<view class="card" style="padding:  30rpx  0;">
						 <view class="title member-title-row " style="margin-left: 30rpx;" @click="openAddMemberModal">
						 	成员动态
							<!-- <text class="member-add-hint" >添加</text> -->
						 </view>
						 <scroll-view class="member-scroll" scroll-x :show-scrollbar="false" enable-flex>
						 	<view class="member-scroll-inner">
						 		<view
						 			class="content-item ohter member-item"
						 			:class="idx === 0 ? 'member-first' : 'member-rest'"
						 			v-for="(m, idx) in members"
						 			:key="idx"
						 			@click="openEditMemberModal(idx)"
						 		>
						 			<image class="aimg" :src="m.avatar || '/static/cur-data/logo.png'" mode="aspectFill"></image>
						 			<view class="nickname">{{ m.name }}</view>
						 			<view class="desc ohter-d">{{ m.customerCount || 0 }}位客户</view>
						 		</view>
						 		<view class="content-item ohter member-item member-rest member-add" @click="openAddMemberModal">
						 			<view class="add-icon">+</view>
						 			<view class="nickname">添加</view>
						 		</view>
						 	</view>
						 </scroll-view>
					</view>

					<view class="card">
						<view class="card-foot">
							<view class="title">
								成员客户统计
							</view>
							<view class="addyeji">
								<image class="config-arrow"  src="/static/cur-data/chat/li_right_icon.png" mode="widthFix"></image>
							</view>
						</view>
					</view>
					
				</view>
			</view>
			
			
		
		</view>
	<view class="foot">
		<image src="/static/cur-data/conelse/v8.png" mode="widthFix"></image>
	</view>

	<!-- 编辑外部联系人规模 -->
	<view v-if="showExternalContactScaleModal" class="modal-mask" @click="closeExternalContactScaleModal">
		<view class="modal-container" @click.stop>
			<view class="modal-title">编辑外部联系人规模</view>
			<view class="modal-field">
				<text class="field-label">外部联系人规模（位）</text>
				<input class="field-input" type="number" v-model="externalContactScaleInput" aria-label="外部联系人规模" placeholder="请输入人数" :maxlength="16" />
			</view>
			<view class="modal-actions">
				<view class="btn cancel" role="button" @click="closeExternalContactScaleModal">取消</view>
				<view class="btn confirm" role="button" @click="saveExternalContactScale">保存</view>
			</view>
		</view>
	</view>

	<!-- 编辑企业全部客户概况 -->
	<view v-if="showOverviewModal" class="modal-mask" @click="closeOverviewModal">
		<view class="modal-container" @click.stop>
			<view class="modal-title">编辑客户概况</view>
			<view class="modal-field">
				<text class="field-label">客户总数</text>
				<input class="field-input" type="number" v-model.number="overviewForm.totalCustomers" placeholder="0" />
			</view>
			<view class="modal-field">
				<text class="field-label">今日新增客户数</text>
				<input class="field-input" type="number" v-model.number="overviewForm.todayNewCustomers" placeholder="0" />
			</view>
			<view class="modal-field">
				<text class="field-label">今日收款</text>
				<input class="field-input" v-model="overviewForm.todayIncome" placeholder="例如：6.00" />
			</view>
			<view class="modal-field">
				<text class="field-label">底部左侧标题</text>
				<input class="field-input" v-model="overviewForm.dashboardTitle" placeholder="生成客户仪表板" />
			</view>
			<view class="modal-field">
				<text class="field-label">底部右侧描述</text>
				<input class="field-input" v-model="overviewForm.dashboardDesc" placeholder="了解标签分布情况" />
			</view>
			<view class="modal-field">
				<view class="toggle-row">
					<text class="field-label toggle-label">显示收款角标</text>
					<switch :checked="overviewForm.showMoreAdd !== false" color="#3175da" @change="onOverviewMoreAddToggle" />
				</view>
			</view>
			<view class="modal-actions">
				<view class="btn cancel" @click="closeOverviewModal">取消</view>
				<view class="btn confirm" @click="saveOverview">保存</view>
			</view>
		</view>
	</view>

	<!-- 编辑企业本周业绩 -->
	<view v-if="showWeeklyModal" class="modal-mask" @click="closeWeeklyModal">
		<view class="modal-container" @click.stop>
			<view class="modal-title">编辑本周业绩</view>
			<view class="modal-field">
				<text class="field-label">线上金额</text>
				<input class="field-input" v-model="weeklyForm.onlineAmount" placeholder="例如：0.00" />
			</view>
			<view class="modal-field">
				<text class="field-label">线上描述</text>
				<input class="field-input" v-model="weeklyForm.onlineDesc" placeholder="昨日流失0位" />
			</view>
			<view class="modal-field">
				<text class="field-label">线下金额</text>
				<input class="field-input" v-model="weeklyForm.offlineAmount" placeholder="例如：0.00" />
			</view>
			<view class="modal-field">
				<text class="field-label">线下描述</text>
				<input class="field-input" v-model="weeklyForm.offlineDesc" placeholder="昨日风险收款管理0次" />
			</view>
			<view class="modal-actions">
				<view class="btn cancel" @click="closeWeeklyModal">取消</view>
				<view class="btn confirm" @click="saveWeekly">保存</view>
			</view>
		</view>
	</view>

	<!-- 编辑经营 -->
	<view v-if="showBusinessModal" class="modal-mask" @click="closeBusinessModal">
		<view class="modal-container" @click.stop>
			<view class="modal-title">编辑经营数据</view>
			<view class="modal-field">
				<text class="field-label">客户流失标题</text>
				<input class="field-input" v-model="businessForm.churnTitle" placeholder="客户流失情况" />
			</view>
			<view class="modal-field">
				<text class="field-label">客户流失描述</text>
				<input class="field-input" v-model="businessForm.churnDesc" placeholder="昨日流失0位" />
			</view>
			<view class="modal-field">
				<text class="field-label">收款风险标题</text>
				<input class="field-input" v-model="businessForm.riskTitle" placeholder="收款风险管理" />
			</view>
			<view class="modal-field">
				<text class="field-label">收款风险描述</text>
				<input class="field-input" v-model="businessForm.riskDesc" placeholder="昨日风险收款管理0次" />
			</view>
			<view class="modal-actions">
				<view class="btn cancel" @click="closeBusinessModal">取消</view>
				<view class="btn confirm" @click="saveBusiness">保存</view>
			</view>
		</view>
	</view>

	<!-- 编辑经营类目弹窗 -->
	<view v-if="showCategoryModal" class="modal-mask" @click="closeCategoryModal">
		<view class="modal-container" @click.stop>
			<view class="modal-title">编辑经营类目</view>
			<view class="modal-field">
				<text class="field-label">经营类目</text>
				<input class="field-input" v-model="categoryInput" aria-label="经营类目" placeholder="请输入经营类目" />
			</view>
			<view class="modal-actions">
				<view class="btn category-reset" role="button" @click="resetCategory">重置</view>
				<view class="btn cancel" @click="closeCategoryModal">取消</view>
				<view class="btn confirm" @click="saveCategory">保存</view>
			</view>
		</view>
	</view>

	<!-- 添加/编辑成员弹窗 -->
	<view v-if="showMemberModal" class="modal-mask" @click="closeMemberModal">
		<view class="modal-container" @click.stop>
			<view class="modal-title">{{ editingMemberIndex > -1 ? '编辑成员' : '添加成员' }}</view>
			<view class="modal-field">
				<text class="field-label">成员名称</text>
				<input class="field-input" v-model="memberForm.name" placeholder="请输入成员名称" />
			</view>
			<view class="modal-field">
				<text class="field-label">客户数</text>
				<input class="field-input" type="number" v-model.number="memberForm.customerCount" placeholder="0" />
			</view>
			<view class="modal-field">
				<text class="field-label">头像</text>
				<view class="avatar-row">
					<view v-if="memberForm.avatar" class="avatar-preview">
						<image :src="memberForm.avatar" mode="aspectFill"></image>
					</view>
					<view class="avatar-btn" @click="chooseMemberAvatar">选择头像</view>
				</view>
			</view>
			<view class="modal-actions">
				<view v-if="editingMemberIndex > -1" class="btn danger" @click="removeMember">删除</view>
				<view class="btn cancel" @click="closeMemberModal">取消</view>
				<view class="btn confirm" @click="saveMember">保存</view>
			</view>
		</view>
	</view>
	</view>
</template>

<script>
	import { uploadImageByPath } from '@/utils/request.js'
	import { CUSTOMER_STATS_EVENT, getCustomerStats, saveCustomerStats } from '@/utils/customerOverview.js'

	const STORAGE_KEY = 'curDataMembers'
	const CATEGORY_STORAGE_KEY = 'curDataCategory'
	const CARDS_STORAGE_KEY = 'curDataCards'
	const EXTERNAL_CONTACT_SCALE_STORAGE_KEY = 'curDataExternalContactScale'
	const DEFAULT_EXTERNAL_CONTACT_SCALE = '2000'
	const DEFAULT_CATEGORY = ''
	const DEFAULT_OVERVIEW = {
		totalCustomers: 6,
		todayNewCustomers: 0,
		todayIncome: '6.00',
		dashboardTitle: '生成客户仪表板',
		dashboardDesc: '了解标签分布情况',
		showMoreAdd: true
	}
	const DEFAULT_WEEKLY = {
		onlineAmount: '0.00',
		onlineDesc: '昨日流失0位',
		offlineAmount: '0.00',
		offlineDesc: '昨日风险收款管理0次'
	}
	const DEFAULT_BUSINESS = {
		churnTitle: '客户流失情况',
		churnDesc: '昨日流失0位',
		riskTitle: '收款风险管理',
		riskDesc: '昨日风险收款管理0次'
	}
	const DEFAULT_MEMBERS = [
		{ avatar: '/static/cur-data/logo.png', name: 'G', customerCount: 2 },
		{ avatar: '/static/cur-data/logo.png', name: '钱三', customerCount: 2 },
		{ avatar: '/static/cur-data/logo.png', name: '李四', customerCount: 2 },
		{ avatar: '/static/cur-data/logo.png', name: '王二狗', customerCount: 2 }
	]

	export default {
		data() {
			return {
				externalContactScale: DEFAULT_EXTERNAL_CONTACT_SCALE,
				externalContactScaleInput: '',
				showExternalContactScaleModal: false,
				category: DEFAULT_CATEGORY,
				showCategoryModal: false,
				categoryInput: '',
				overview: { ...DEFAULT_OVERVIEW },
				weekly: { ...DEFAULT_WEEKLY },
				business: { ...DEFAULT_BUSINESS },
				showOverviewModal: false,
				showWeeklyModal: false,
				showBusinessModal: false,
				overviewForm: {},
				weeklyForm: {},
				businessForm: {},
				members: [],
				showMemberModal: false,
				editingMemberIndex: -1,
				memberForm: {
					name: '',
					avatar: '',
					customerCount: 0
				}
			}
		},
		computed: {
			hasCategory() {
				return !!this.category
			}
		},
		onLoad() {
			uni.$on(CUSTOMER_STATS_EVENT, this.applyCustomerStats)
			this.loadExternalContactScale()
			this.loadCategory()
			this.loadCards()
			this.loadMembers()
		},
		onShow() {
			this.loadExternalContactScale()
			this.loadCategory()
			this.loadCards()
			this.loadMembers()
		},
		onUnload() {
			uni.$off(CUSTOMER_STATS_EVENT, this.applyCustomerStats)
		},
		onBackPress() {
			if (this.showExternalContactScaleModal) {
				this.closeExternalContactScaleModal()
				return true
			}
			return false
		},
		methods: {
			normalizeExternalContactScale(value) {
				if (typeof value !== 'number' && typeof value !== 'string') return null
				const text = String(value).trim()
				if (!/^\d+$/.test(text) || !Number.isSafeInteger(Number(text))) return null
				return String(Number(text))
			},
			loadExternalContactScale() {
				try {
					const value = this.normalizeExternalContactScale(uni.getStorageSync(EXTERNAL_CONTACT_SCALE_STORAGE_KEY))
					this.externalContactScale = value === null ? DEFAULT_EXTERNAL_CONTACT_SCALE : value
				} catch (error) {
					this.externalContactScale = DEFAULT_EXTERNAL_CONTACT_SCALE
				}
			},
			openExternalContactScaleModal() {
				this.externalContactScaleInput = this.externalContactScale
				this.showExternalContactScaleModal = true
			},
			closeExternalContactScaleModal() {
				this.showExternalContactScaleModal = false
			},
			saveExternalContactScale() {
				const value = this.normalizeExternalContactScale(this.externalContactScaleInput)
				if (value === null) {
					uni.showToast({ title: '请输入有效的非负整数', icon: 'none' })
					return
				}
				try {
					uni.setStorageSync(EXTERNAL_CONTACT_SCALE_STORAGE_KEY, value)
				} catch (error) {
					uni.showToast({ title: '保存失败，请重试', icon: 'none' })
					return
				}
				this.externalContactScale = value
				this.showExternalContactScaleModal = false
				uni.showToast({ title: '已保存', icon: 'success' })
			},
			applyCustomerStats(stats) {
				this.overview = { ...this.overview, ...stats }
			},
			loadCards() {
				const stats = getCustomerStats()
				try {
					const saved = uni.getStorageSync(CARDS_STORAGE_KEY)
					if (saved && typeof saved === 'object') {
						this.overview = { ...DEFAULT_OVERVIEW, ...(saved.overview || {}), ...stats }
						this.weekly = { ...DEFAULT_WEEKLY, ...(saved.weekly || {}) }
						this.business = { ...DEFAULT_BUSINESS, ...(saved.business || {}) }
					} else {
						this.overview = { ...DEFAULT_OVERVIEW, ...stats }
						this.weekly = { ...DEFAULT_WEEKLY }
						this.business = { ...DEFAULT_BUSINESS }
						this.persistCards()
					}
				} catch (e) {
					this.overview = { ...DEFAULT_OVERVIEW, ...stats }
					this.weekly = { ...DEFAULT_WEEKLY }
					this.business = { ...DEFAULT_BUSINESS }
				}
			},
			persistCards() {
				try {
					const saved = uni.getStorageSync(CARDS_STORAGE_KEY)
					const previous = saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {}
					const previousOverview = previous.overview && typeof previous.overview === 'object' && !Array.isArray(previous.overview) ? previous.overview : {}
					uni.setStorageSync(CARDS_STORAGE_KEY, {
						...previous,
						overview: { ...this.overview, ...previousOverview, ...getCustomerStats() },
						weekly: this.weekly,
						business: this.business
					})
				} catch (e) {}
			},
			openOverviewModal() {
				this.overviewForm = JSON.parse(JSON.stringify(this.overview))
				this.showOverviewModal = true
			},
			closeOverviewModal() {
				this.showOverviewModal = false
			},
			onOverviewMoreAddToggle(e) {
				this.overviewForm.showMoreAdd = !!(e && e.detail && e.detail.value)
			},
			saveOverview() {
				const next = {
					...this.overviewForm,
					totalCustomers: Number(this.overviewForm.totalCustomers) || 0,
					todayNewCustomers: Number(this.overviewForm.todayNewCustomers) || 0,
					todayIncome: String(this.overviewForm.todayIncome || '0.00'),
					dashboardTitle: String(this.overviewForm.dashboardTitle || ''),
					dashboardDesc: String(this.overviewForm.dashboardDesc || ''),
					showMoreAdd: this.overviewForm.showMoreAdd !== false
				}
				try {
					const stats = saveCustomerStats(next, next)
					this.overview = { ...next, ...stats }
				} catch (error) {
					uni.showToast({ title: '保存失败，请重试', icon: 'none' })
					return
				}
				this.showOverviewModal = false
				uni.showToast({ title: '已保存', icon: 'success' })
			},
			openWeeklyModal() {
				this.weeklyForm = JSON.parse(JSON.stringify(this.weekly))
				this.showWeeklyModal = true
			},
			closeWeeklyModal() {
				this.showWeeklyModal = false
			},
			saveWeekly() {
				this.weekly = {
					onlineAmount: String(this.weeklyForm.onlineAmount || '0.00'),
					onlineDesc: String(this.weeklyForm.onlineDesc || ''),
					offlineAmount: String(this.weeklyForm.offlineAmount || '0.00'),
					offlineDesc: String(this.weeklyForm.offlineDesc || '')
				}
				this.persistCards()
				this.showWeeklyModal = false
				uni.showToast({ title: '已保存', icon: 'success' })
			},
			openBusinessModal() {
				this.businessForm = JSON.parse(JSON.stringify(this.business))
				this.showBusinessModal = true
			},
			closeBusinessModal() {
				this.showBusinessModal = false
			},
			saveBusiness() {
				this.business = {
					churnTitle: String(this.businessForm.churnTitle || ''),
					churnDesc: String(this.businessForm.churnDesc || ''),
					riskTitle: String(this.businessForm.riskTitle || ''),
					riskDesc: String(this.businessForm.riskDesc || '')
				}
				this.persistCards()
				this.showBusinessModal = false
				uni.showToast({ title: '已保存', icon: 'success' })
			},
			loadCategory() {
				try {
					const saved = uni.getStorageSync(CATEGORY_STORAGE_KEY)
					const text = typeof saved === 'string' ? saved.trim() : ''
					this.category = text === 'xxxxx五金类目' || text === '未知' ? DEFAULT_CATEGORY : text
				} catch (e) {
					this.category = DEFAULT_CATEGORY
				}
			},
			showCategoryHelp() {
				uni.showModal({
					title: '经营类目',
					content: '经营类目是企业为客户提供的产品或服务类型。',
					showCancel: false,
					confirmText: '知道了'
				})
			},
			openCategoryModal() {
				this.categoryInput = this.category
				this.showCategoryModal = true
			},
			closeCategoryModal() {
				this.showCategoryModal = false
			},
			resetCategory() {
				try {
					uni.removeStorageSync(CATEGORY_STORAGE_KEY)
				} catch (e) {
					uni.showToast({ title: '重置失败，请重试', icon: 'none' })
					return
				}
				this.category = DEFAULT_CATEGORY
				this.categoryInput = ''
				this.showCategoryModal = false
				uni.showToast({ title: '已重置', icon: 'success' })
			},
			saveCategory() {
				const text = (this.categoryInput || '').trim()
				if (!text || text === '未知') {
					uni.showToast({ title: '请输入经营类目', icon: 'none' })
					return
				}
				try {
					uni.setStorageSync(CATEGORY_STORAGE_KEY, text)
				} catch (e) {
					uni.showToast({ title: '保存失败，请重试', icon: 'none' })
					return
				}
				this.category = text
				this.showCategoryModal = false
				uni.showToast({ title: '已保存', icon: 'success' })
			},
			loadMembers() {
				try {
					const saved = uni.getStorageSync(STORAGE_KEY)
					if (Array.isArray(saved) && saved.length) {
						this.members = saved
					} else {
						this.members = JSON.parse(JSON.stringify(DEFAULT_MEMBERS))
						this.persistMembers()
					}
				} catch (e) {
					this.members = JSON.parse(JSON.stringify(DEFAULT_MEMBERS))
				}
			},
			persistMembers() {
				try {
					uni.setStorageSync(STORAGE_KEY, this.members)
				} catch (e) {}
			},
			openAddMemberModal() {
				this.editingMemberIndex = -1
				this.memberForm = { name: '', avatar: '', customerCount: 0 }
				this.showMemberModal = true
			},
			openEditMemberModal(index) {
				const m = this.members[index]
				if (!m) return
				this.editingMemberIndex = index
				this.memberForm = {
					name: m.name || '',
					avatar: m.avatar || '',
					customerCount: m.customerCount || 0
				}
				this.showMemberModal = true
			},
			closeMemberModal() {
				this.showMemberModal = false
			},
			chooseMemberAvatar() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: async (res) => {
						if (res.tempFilePaths && res.tempFilePaths.length > 0) {
							try {
								const uploadResult = await uploadImageByPath(res.tempFilePaths[0], '2026172122123456')
								if (uploadResult && uploadResult.data) {
									this.memberForm.avatar = uploadResult.data
								} else if (uploadResult && uploadResult.url) {
									this.memberForm.avatar = uploadResult.url
								} else if (uploadResult && uploadResult.fileUrl) {
									this.memberForm.avatar = uploadResult.fileUrl
								} else if (typeof uploadResult === 'string') {
									this.memberForm.avatar = uploadResult
								}
							} catch (error) {
								console.error('上传头像失败:', error)
								uni.showToast({ title: '头像上传失败', icon: 'none' })
							}
						}
					}
				})
			},
			saveMember() {
				const name = (this.memberForm.name || '').trim()
				if (!name) {
					uni.showToast({ title: '请填写成员名称', icon: 'none' })
					return
				}
				const item = {
					name,
					avatar: this.memberForm.avatar || '/static/cur-data/logo.png',
					customerCount: Number(this.memberForm.customerCount) || 0
				}
				if (this.editingMemberIndex > -1) {
					this.$set(this.members, this.editingMemberIndex, item)
				} else {
					this.members.push(item)
				}
				this.persistMembers()
				this.showMemberModal = false
				uni.showToast({ title: '已保存', icon: 'success' })
			},
			removeMember() {
				if (this.editingMemberIndex < 0) return
				uni.showModal({
					title: '确认删除',
					content: '确定删除该成员吗？',
					success: (res) => {
						if (res.confirm) {
							this.members.splice(this.editingMemberIndex, 1)
							this.persistMembers()
							this.showMemberModal = false
							uni.showToast({ title: '已删除', icon: 'success' })
						}
					}
				})
			},
			goBack() {
				if (getCurrentPages().length > 1) {
					uni.navigateBack({ delta: 1 })
					return
				}
				uni.redirectTo({ url: '/pages/WorkbenchIos/WorkbenchIos' })
			}
		}
	}
</script>

<style scoped>
	.back{
		width: 60rpx;
		height: 60rpx;
		position: absolute;
		/* background-color: red; */
		z-index: 1;
		top: 60rpx;
	}
	.foot{
		padding-bottom: env(safe-area-inset-bottom);
		background-color: #f6f8fb;
	}
	.ohter-d{
		font-size: 20rpx !important;
		margin-top:4rpx !important;
	}
	.ohter{
		justify-content: center;
		flex-direction: column;
		align-items: center;
		display: flex;
		padding:  30rpx 8rpx !important;
		
	}
	.nickname{
		margin-top:16rpx;
		font-size: 26rpx;
		font-weight: 500;
	}
	.member-title-row{
		justify-content: space-between;
	}
	.member-add-hint{
		font-size: 26rpx;
		color: #3074db;
		font-weight: 400;
	}
	.member-scroll{
		width: 100%;
		margin-top: 30rpx;
		white-space: nowrap;
	
	}
	.member-scroll-inner{
		display: inline-flex;
		flex-direction: row;
	}
	.member-item{
		flex: none;
		flex-shrink: 0;
		width: 140rpx;
		min-width: 140rpx;
		margin-right: 0;
	}
	.member-first{
		margin-left: 28rpx;
	}
	.member-rest{
		margin-left: 18rpx;
	}
	.member-add{
		justify-content: center;
	}
	.add-icon{
		width: 50rpx;
		height: 50rpx;
		border-radius: 15rpx;
		background-color: #edf0f5;
		color: #84878c;
		font-size: 40rpx;
		line-height: 50rpx;
		text-align: center;
	}
	.aimg{
		width: 50rpx;
		height: 50rpx;
		overflow: hidden;
		border-radius: 15rpx;
	}
	.item-title{
		font-size: 30rpx;
		color: #000;
		margin-top: 4rpx;
		display: flex;
		align-items: center;
	}
	.content-item{
		background-color: #f8f8f9;
		padding: 24rpx;
		border-radius: 16rpx;
		overflow: hidden;
		flex: 1;
	}
	.card-content{
		display: flex;
		margin-top: 30rpx;
		justify-content: space-between;
	}
	.money{
		font-family:"WeChat Sans Std";
		margin: 0 10rpx;
	}
	.v1{
		width: 40rpx;
	}
	.line_x{
		width: 90%;
		margin: 36rpx;
		height: 1px;
		transform: scaleY(0.08);
		background-color: #84878c;
	}
.config-arrow{
width: 18rpx;
margin-left: 15rpx;
}
.foot-right{
	
}
.iconv5{
	width: 40rpx;
	margin-right: 10rpx;
}
.foot-right,
.foot-left{
	display: flex;
	align-items: center;
}
.card-foot{
	display: flex;
	justify-content: space-between;
	align-items: center;
}
.v6{
	width: 176rpx;
	margin-top: 16rpx;
}
.desc{
  font-size: 26rpx;
  color: #84878c;
  margin-top: 10rpx;
}
.moneyicon{
	width: 22rpx;
	margin-right: 4rpx;
	position: relative;
	top: 6rpx;
}
.mum{
	font-size: 52rpx;
	font-family:"WeChat Sans Std";
	display: flex;
}
.data-item{
	display: flex;
	flex-direction: column;
	align-items: center;
	
}
.card-data{
	display: flex;
	justify-content: space-around;
	align-items: flex-start;

	margin-top:60rpx;
}
.leimu{
	color: #84878c;
	font-size: 28rpx;
}
.icon{
	width: 32rpx;
	margin-left: 10rpx;
}
.title{
	font-weight: 500;
	display: flex;
	align-items: center;
	
}
image{
	width: 100%;
	height: 100%;
}
.customer-assistant::-webkit-scrollbar {
		display: none;
	}
	.customer-assistant{
		height: 100vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		width: 100%;
		
		
	}
	.content::-webkit-scrollbar {
		display: none;
	}
	.content {
		box-sizing: border-box;
		position: relative;
		flex: 1;
		overflow: scroll;
		background-color: #3074db;
		
		/* padding-bottom: 120rpx; */
		/* overflow: auto; */
		/* overflow: hidden; */
	}
	
	.msgBox{
		background-color: #3074db;
		padding-bottom: 80rpx;
	}
	.contact-header {
		display: flex;
		align-items: center;
		gap: 20rpx;
		height: 80rpx;
		padding: 0 46rpx;
		box-sizing: border-box;
	}
	.contact-header-icon {
		width: 76rpx;
		height: 76rpx;
		flex-shrink: 0;
	}
	.contact-header-copy {
		flex: 1;
		min-width: 0;
	}
	.contact-header-title {
		display: block;
		color: #fff;
		font-size: 32rpx;
		font-weight: 500;
		line-height: 42rpx;
	}
	.contact-header-scale {
		display: flex;
		align-items: center;
		min-width: 0;
		color: #bdd5fc;
		font-size: 26rpx;
		line-height: 34rpx;
		cursor: pointer;
	}
	.contact-header-scale-label {
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.contact-header-arrow {
		flex-shrink: 0;
		margin-left: 8rpx;
		font-size: 32rpx;
	}
	.menuCrad{
		display: flex;
		
		position: relative;
		top: -50rpx;
	}
	.category-card{
		align-items: center;
		gap: 24rpx;
	}
	.category-info{
		flex: 1;
		min-width: 0;
	}
	.category-title-row{
		display: flex;
		align-items: center;
		gap: 10rpx;
	}
	.category-title{
		min-width: 0;
		color: #171717;
		font-size: 30rpx;
		font-weight: 600;
		line-height: 42rpx;
		overflow-wrap: anywhere;
	}
	.category-help{
		flex-shrink: 0;
		width: 25rpx;
		height: 25rpx;
		border: 2rpx solid #fa6962;
		border-radius: 50%;
		color: #fa6962;
		font-size: 23rpx;
		font-weight: 500;
		line-height: 25rpx;
		text-align: center;
	}
	.category-description{
		margin-top: 6rpx;
		color: #969696;
		font-size: 26rpx;
		line-height: 36rpx;
	}
	.category-more{
		margin-left: 10rpx;
		color: #287ee9;
	}
	.category-select{
		flex-shrink: 0;
		padding: 10rpx 24rpx;
		border-radius: 7rpx;
		background-color: #287ee9;
		color: #fff;
		font-size: 30rpx;
		line-height: 42rpx;
	}
	.card{
		background-color: #fff;
		padding: 30rpx;
		border-radius: 20rpx;
		overflow: hidden;
		margin:  0  30rpx;
		margin-bottom: 20rpx;
		/* display:flex; */
		
	}
	.cardlist{
		position: relative;
		top: -50rpx;
	}
	.modal-mask{
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		background-color: rgba(0,0,0,0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 100;
	}
	.modal-container{
		width: 80%;
		background-color: #fff;
		border-radius: 16rpx;
		padding: 32rpx;
		box-sizing: border-box;
		max-height: 80vh;
		overflow: auto;
	}
	.modal-title{
		font-size: 32rpx;
		font-weight: 600;
		margin-bottom: 24rpx;
		text-align: center;
	}
	.modal-field{
		margin-bottom: 24rpx;
	}
	.field-label{
		font-size: 28rpx;
		color: #666;
		margin-bottom: 8rpx;
		display: block;
	}
	.field-input{
		border: 1rpx solid #e5e5e5;
		border-radius: 8rpx;
		padding: 16rpx 20rpx;
		font-size: 28rpx;
		background-color: #f8f8f8;
	}
	.toggle-row{
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	.toggle-label{
		margin-bottom: 0;
	}
	.avatar-row{
		display: flex;
		align-items: center;
	}
	.avatar-preview{
		width: 80rpx;
		height: 80rpx;
		border-radius: 10rpx;
		overflow: hidden;
		margin-right: 20rpx;
	}
	.avatar-preview image{
		width: 100%;
		height: 100%;
	}
	.avatar-btn{
		font-size: 26rpx;
		color: #3175da;
		padding: 12rpx 20rpx;
		border-radius: 8rpx;
		border: 1rpx solid #3175da;
	}
	.modal-actions{
		margin-top: 24rpx;
		display: flex;
		justify-content: flex-end;
		flex-wrap: wrap;
		gap: 16rpx;
	}
	.btn{
		min-width: 120rpx;
		text-align: center;
		padding: 16rpx 0;
		border-radius: 8rpx;
		font-size: 28rpx;
	}
	.btn.cancel{
		background-color: #f5f5f5;
		color: #666;
	}
	.btn.category-reset{
		margin-right: auto;
		background-color: #eef4ff;
		color: #3175da;
	}
	.btn.confirm{
		background-color: #3175da;
		color: #fff;
	}
	.btn.danger{
		background-color: #fff;
		color: #ff4d4f;
		border: 1rpx solid #ff4d4f;
		margin-right: auto;
	}
</style>
