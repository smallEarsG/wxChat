<template>
	<view class="container">
		<view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-bar">
				<view class="back-btn" @click="goBack">
					<uni-icons type="left" size="24" color="#fff" />
				</view>
				<text class="page-title">自定义模板</text>
				<view class="nav-placeholder" />
			</view>

			<view class="tab-bar">
				<view
					v-for="tab in tabs"
					:key="tab.key"
					class="tab-item"
					:class="{ active: activeTab === tab.key }"
					@click="activeTab = tab.key"
				>
					<text>{{ tab.label }}</text>
				</view>
			</view>
		</view>

		<scroll-view class="content" scroll-y>
			<view v-if="activeTab === 'fields'" class="tab-content">
				<TemplateBasicSettings
					:templateName="templateName"
					:showBarcode="templateConfig.showBarcode"
					:enabledFieldCount="enabledOrderFields.length"
					:enabledServiceCount="totalEnabledServiceCount"
					@update:templateName="onTemplateNameChange"
					@barcode-change="onBarcodeChange"
					@go-preview="activeTab = 'preview'"
				/>
				<TemplateFieldList
					:fields="enabledOrderFields"
					@move-up="moveFieldUp"
					@move-down="moveFieldDown"
					@edit="openFieldEditor"
					@hide="hideField"
					@add="openFieldPicker"
				/>
			</view>

			<view v-if="activeTab === 'services'" class="tab-content">
				<TemplateServiceModules
					:modules="templateConfig.serviceModules"
					:expandedIndexes="expandedModuleIndexes"
					@toggle-expand="toggleModuleExpand"
					@module-menu="showModuleMenu"
					@add-module="addServiceModule"
					@update-title="updateModuleTitle"
					@move-service-up="moveServiceUp"
					@move-service-down="moveServiceDown"
					@hide-service="hideServiceItem"
					@add-service="openServicePicker"
				/>
			</view>

			<view v-if="activeTab === 'preview'" class="tab-content">
				<TemplatePreview
					:previewInfo="currentPreviewInfo"
					:templateConfig="templateConfig"
					:previewScale="previewScale"
					:previewDataType="previewDataType"
					@update:previewScale="previewScale = $event"
					@update:previewDataType="previewDataType = $event"
				/>
			</view>

			<view class="content-spacer" />
		</scroll-view>

		<TemplateBottomActions
			:saveStatus="saveStatus"
			@reset="resetTemplate"
			@save="saveTemplate"
		/>

		<TemplateFieldPicker
			:visible="fieldPickerVisible"
			:keyword="fieldPickerKeyword"
			:filteredFields="filteredDisabledFields"
			:selectedKeys="fieldPickerSelected"
			@update:keyword="fieldPickerKeyword = $event"
			@toggle-select="toggleFieldPickerSelect"
			@close="closeFieldPicker"
			@confirm="confirmFieldPicker"
		/>

		<TemplateFieldEditor
			:visible="fieldEditorVisible"
			:label="fieldEditorLabel"
			:fieldKey="fieldEditorKey"
			@update:label="fieldEditorLabel = $event"
			@close="closeFieldEditor"
			@confirm="confirmFieldEditor"
		/>

		<TemplateServicePicker
			:visible="servicePickerVisible"
			:keyword="servicePickerKeyword"
			:filteredItems="filteredAvailableServiceItems"
			:selectedIds="servicePickerSelected"
			@update:keyword="servicePickerKeyword = $event"
			@toggle-select="toggleServicePickerSelect"
			@close="closeServicePicker"
			@confirm="confirmServicePicker"
		/>
	</view>
</template>

<script>
import TemplateBasicSettings from './components/TemplateBasicSettings.vue'
import TemplateFieldList from './components/TemplateFieldList.vue'
import TemplateFieldPicker from './components/TemplateFieldPicker.vue'
import TemplateFieldEditor from './components/TemplateFieldEditor.vue'
import TemplateServiceModules from './components/TemplateServiceModules.vue'
import TemplateServicePicker from './components/TemplateServicePicker.vue'
import TemplatePreview from './components/TemplatePreview.vue'
import TemplateBottomActions from './components/TemplateBottomActions.vue'
import {
	DEFAULT_FIELDS,
	DEFAULT_SERVICE_ITEMS,
	DEFAULT_TEMPLATE_CONFIG,
	MODULE_PRESETS,
	PREVIEW_DATA_TRANSFER,
	PREVIEW_DATA_MERCHANT
} from './constants.js'

export default {
	components: {
		TemplateBasicSettings,
		TemplateFieldList,
		TemplateFieldPicker,
		TemplateFieldEditor,
		TemplateServiceModules,
		TemplateServicePicker,
		TemplatePreview,
		TemplateBottomActions
	},
	data() {
		return {
			statusBarHeight: 0,
			templateId: null,
			templateName: '',
			templateConfig: JSON.parse(JSON.stringify(DEFAULT_TEMPLATE_CONFIG)),
			activeTab: 'fields',
			tabs: [
				{ key: 'fields', label: '字段配置' },
				{ key: 'services', label: '服务模块' },
				{ key: 'preview', label: '预览' }
			],
			saveStatus: 'idle',
			previewScale: 100,
			previewDataType: 'transfer',
			expandedModuleIndexes: [0],
			fieldPickerVisible: false,
			fieldPickerKeyword: '',
			fieldPickerSelected: [],
			fieldEditorVisible: false,
			fieldEditorKey: '',
			fieldEditorLabel: '',
			servicePickerVisible: false,
			servicePickerKeyword: '',
			servicePickerSelected: [],
			servicePickerModuleIndex: -1
		}
	},
	computed: {
		enabledOrderFields() {
			return this.templateConfig.orderInfoFields.filter(item => item.enabled)
		},
		disabledOrderFields() {
			return this.templateConfig.orderInfoFields.filter(item => !item.enabled)
		},
		filteredDisabledFields() {
			const keyword = this.fieldPickerKeyword.trim().toLowerCase()
			return this.disabledOrderFields.filter(field => {
				if (!keyword) return true
				return field.label.toLowerCase().includes(keyword) ||
					field.key.toLowerCase().includes(keyword)
			})
		},
		filteredAvailableServiceItems() {
			if (this.servicePickerModuleIndex < 0) return []
			const module = this.templateConfig.serviceModules[this.servicePickerModuleIndex]
			if (!module) return []
			const enabledIds = new Set((module.items || []).filter(item => item.enabled).map(item => item._id))
			const keyword = this.servicePickerKeyword.trim().toLowerCase()
			return DEFAULT_SERVICE_ITEMS.filter(item => {
				if (enabledIds.has(item._id)) return false
				if (!keyword) return true
				return item.label.toLowerCase().includes(keyword)
			})
		},
		totalEnabledServiceCount() {
			return this.templateConfig.serviceModules.reduce((sum, module) => {
				return sum + (module.items || []).filter(item => item.enabled).length
			}, 0)
		},
		currentPreviewInfo() {
			return this.previewDataType === 'merchant'
				? PREVIEW_DATA_MERCHANT
				: PREVIEW_DATA_TRANSFER
		}
	},
	onLoad(options) {
		const systemInfo = uni.getSystemInfoSync()
		this.statusBarHeight = systemInfo.statusBarHeight || 20

		if (options.id) {
			this.templateId = options.id
			this.loadTemplate(options.id)
		}
	},
	methods: {
		markDirty() {
			if (this.saveStatus !== 'saving') {
				this.saveStatus = 'dirty'
			}
		},
		onTemplateNameChange(value) {
			this.templateName = value
			this.markDirty()
		},
		onBarcodeChange(e) {
			this.templateConfig.showBarcode = e.detail.value
			this.markDirty()
		},
		goBack() {
			if (this.saveStatus !== 'dirty') {
				uni.navigateBack()
				return
			}

			uni.showModal({
				title: '修改尚未保存',
				content: '是否保存本次模板修改？',
				confirmText: '保存',
				cancelText: '不保存',
				success: (res) => {
					if (res.confirm) {
						this.saveTemplate().then((saved) => {
							if (saved) uni.navigateBack()
						})
					} else if (res.cancel) {
						uni.navigateBack()
					}
				}
			})
		},
		addField(fieldKey) {
			const field = this.templateConfig.orderInfoFields.find(item => item.key === fieldKey)
			if (field) {
				field.enabled = true
				this.markDirty()
			}
		},
		hideField(fieldKey) {
			const field = this.templateConfig.orderInfoFields.find(item => item.key === fieldKey)
			if (field) {
				field.enabled = false
				this.markDirty()
			}
		},
		swapFieldByKey(fieldKey, targetKey) {
			const fields = this.templateConfig.orderInfoFields
			const currentIndex = fields.findIndex(item => item.key === fieldKey)
			const targetIndex = fields.findIndex(item => item.key === targetKey)
			if (currentIndex < 0 || targetIndex < 0 || currentIndex === targetIndex) return

			const temp = fields[currentIndex]
			this.$set(fields, currentIndex, fields[targetIndex])
			this.$set(fields, targetIndex, temp)
			this.markDirty()
		},
		moveFieldUp(fieldKey) {
			const enabled = this.enabledOrderFields
			const index = enabled.findIndex(item => item.key === fieldKey)
			if (index <= 0) return
			this.swapFieldByKey(fieldKey, enabled[index - 1].key)
		},
		moveFieldDown(fieldKey) {
			const enabled = this.enabledOrderFields
			const index = enabled.findIndex(item => item.key === fieldKey)
			if (index < 0 || index >= enabled.length - 1) return
			this.swapFieldByKey(fieldKey, enabled[index + 1].key)
		},
		openFieldPicker() {
			this.fieldPickerSelected = []
			this.fieldPickerKeyword = ''
			this.fieldPickerVisible = true
		},
		closeFieldPicker() {
			this.fieldPickerVisible = false
			this.fieldPickerSelected = []
			this.fieldPickerKeyword = ''
		},
		toggleFieldPickerSelect(key) {
			const index = this.fieldPickerSelected.indexOf(key)
			if (index === -1) {
				this.fieldPickerSelected.push(key)
			} else {
				this.fieldPickerSelected.splice(index, 1)
			}
		},
		confirmFieldPicker() {
			this.fieldPickerSelected.forEach(key => this.addField(key))
			this.closeFieldPicker()
		},
		openFieldEditor(fieldKey) {
			const field = this.templateConfig.orderInfoFields.find(item => item.key === fieldKey)
			if (!field) return
			this.fieldEditorKey = field.key
			this.fieldEditorLabel = field.label
			this.fieldEditorVisible = true
		},
		closeFieldEditor() {
			this.fieldEditorVisible = false
			this.fieldEditorKey = ''
			this.fieldEditorLabel = ''
		},
		confirmFieldEditor() {
			const field = this.templateConfig.orderInfoFields.find(item => item.key === this.fieldEditorKey)
			if (field) {
				field.label = this.fieldEditorLabel.trim() || field.label
				this.markDirty()
			}
			this.closeFieldEditor()
		},
		toggleModuleExpand(moduleIndex) {
			const index = this.expandedModuleIndexes.indexOf(moduleIndex)
			if (index === -1) {
				this.expandedModuleIndexes.push(moduleIndex)
			} else {
				this.expandedModuleIndexes.splice(index, 1)
			}
		},
		updateModuleTitle(moduleIndex, title) {
			this.templateConfig.serviceModules[moduleIndex].title = title
			this.markDirty()
		},
		addServiceModule() {
			uni.showActionSheet({
				itemList: ['空白模块', '账单服务', '商户服务', '联系方式'],
				success: (res) => {
					const presetKeys = ['blank', 'bill', 'merchant', 'contact']
					const preset = MODULE_PRESETS[presetKeys[res.tapIndex]]
					this.templateConfig.serviceModules.push(JSON.parse(JSON.stringify(preset)))
					const newIndex = this.templateConfig.serviceModules.length - 1
					if (!this.expandedModuleIndexes.includes(newIndex)) {
						this.expandedModuleIndexes.push(newIndex)
					}
					this.markDirty()
				}
			})
		},
		showModuleMenu(moduleIndex) {
			uni.showActionSheet({
				itemList: ['重命名模块', '复制模块', '删除模块'],
				success: (res) => {
					if (res.tapIndex === 0) {
						if (!this.expandedModuleIndexes.includes(moduleIndex)) {
							this.expandedModuleIndexes.push(moduleIndex)
						}
					} else if (res.tapIndex === 1) {
						this.copyServiceModule(moduleIndex)
					} else if (res.tapIndex === 2) {
						this.deleteServiceModule(moduleIndex)
					}
				}
			})
		},
		copyServiceModule(moduleIndex) {
			const source = this.templateConfig.serviceModules[moduleIndex]
			this.templateConfig.serviceModules.push({
				title: `${source.title} 副本`,
				items: JSON.parse(JSON.stringify(source.items || []))
			})
			const newIndex = this.templateConfig.serviceModules.length - 1
			this.expandedModuleIndexes.push(newIndex)
			this.markDirty()
			uni.showToast({ title: '已复制模块', icon: 'success' })
		},
		deleteServiceModule(moduleIndex) {
			if (this.templateConfig.serviceModules.length <= 1) {
				uni.showToast({ title: '至少保留一个模块', icon: 'none' })
				return
			}

			uni.showModal({
				title: '删除模块',
				content: '删除后，该模块中的服务项配置也会被删除。',
				success: (res) => {
					if (!res.confirm) return
					this.templateConfig.serviceModules.splice(moduleIndex, 1)
					this.expandedModuleIndexes = this.expandedModuleIndexes
						.filter(index => index !== moduleIndex)
						.map(index => (index > moduleIndex ? index - 1 : index))
					this.markDirty()
				}
			})
		},
		swapServiceItem(moduleIndex, itemId, targetId) {
			const items = this.templateConfig.serviceModules[moduleIndex].items
			const currentIndex = items.findIndex(item => item._id === itemId)
			const targetIndex = items.findIndex(item => item._id === targetId)
			if (currentIndex < 0 || targetIndex < 0 || currentIndex === targetIndex) return

			const temp = items[currentIndex]
			this.$set(items, currentIndex, items[targetIndex])
			this.$set(items, targetIndex, temp)
			this.markDirty()
		},
		moveServiceUp(moduleIndex, itemId) {
			const enabled = (this.templateConfig.serviceModules[moduleIndex].items || []).filter(item => item.enabled)
			const index = enabled.findIndex(item => item._id === itemId)
			if (index <= 0) return
			this.swapServiceItem(moduleIndex, itemId, enabled[index - 1]._id)
		},
		moveServiceDown(moduleIndex, itemId) {
			const enabled = (this.templateConfig.serviceModules[moduleIndex].items || []).filter(item => item.enabled)
			const index = enabled.findIndex(item => item._id === itemId)
			if (index < 0 || index >= enabled.length - 1) return
			this.swapServiceItem(moduleIndex, itemId, enabled[index + 1]._id)
		},
		hideServiceItem(moduleIndex, itemId) {
			const item = this.templateConfig.serviceModules[moduleIndex].items.find(i => i._id === itemId)
			if (item) {
				item.enabled = false
				this.markDirty()
			}
		},
		openServicePicker(moduleIndex) {
			this.servicePickerModuleIndex = moduleIndex
			this.servicePickerSelected = []
			this.servicePickerKeyword = ''
			this.servicePickerVisible = true
		},
		closeServicePicker() {
			this.servicePickerVisible = false
			this.servicePickerSelected = []
			this.servicePickerKeyword = ''
			this.servicePickerModuleIndex = -1
		},
		toggleServicePickerSelect(id) {
			const index = this.servicePickerSelected.indexOf(id)
			if (index === -1) {
				this.servicePickerSelected.push(id)
			} else {
				this.servicePickerSelected.splice(index, 1)
			}
		},
		confirmServicePicker() {
			const module = this.templateConfig.serviceModules[this.servicePickerModuleIndex]
			if (!module) return

			this.servicePickerSelected.forEach(id => {
				const existing = module.items.find(item => item._id === id)
				if (existing) {
					existing.enabled = true
				} else {
					const defaultItem = DEFAULT_SERVICE_ITEMS.find(item => item._id === id)
					if (defaultItem) {
						module.items.push({ ...defaultItem, enabled: true })
					}
				}
			})
			this.markDirty()
			this.closeServicePicker()
		},
		resetTemplate() {
			uni.showModal({
				title: '恢复默认',
				content: '确定将模板恢复为默认配置吗？当前未保存的修改将丢失。',
				success: (res) => {
					if (!res.confirm) return
					this.templateConfig = JSON.parse(JSON.stringify(DEFAULT_TEMPLATE_CONFIG))
					this.expandedModuleIndexes = [0]
					this.markDirty()
				}
			})
		},
		mergeOrderInfoFields(savedFields) {
			const savedKeys = new Set((savedFields || []).map(field => field.key))
			const merged = [...(savedFields || [])]
			DEFAULT_FIELDS.forEach(def => {
				if (!savedKeys.has(def.key)) merged.push({ ...def })
			})
			return merged
		},
		loadTemplate(id) {
			try {
				const templates = uni.getStorageSync('customTemplates') || []
				const template = templates.find(item => item.id === id)
				if (template) {
					this.templateName = template.name
					const config = JSON.parse(JSON.stringify(template.config))
					config.orderInfoFields = this.mergeOrderInfoFields(config.orderInfoFields)
					this.templateConfig = config
					this.saveStatus = 'idle'
				}
			} catch (e) {
				console.error('加载模板失败', e)
			}
		},
		saveTemplate() {
			if (!this.templateName.trim()) {
				uni.showToast({ title: '请输入模板名称', icon: 'none' })
				if (this.activeTab !== 'fields') {
					this.activeTab = 'fields'
				}
				return Promise.resolve(false)
			}

			this.saveStatus = 'saving'

			try {
				let templates = uni.getStorageSync('customTemplates') || []
				const now = Date.now()
				const isEdit = !!this.templateId

				if (isEdit) {
					const index = templates.findIndex(item => item.id === this.templateId)
					if (index !== -1) {
						templates[index] = {
							...templates[index],
							name: this.templateName,
							config: JSON.parse(JSON.stringify(this.templateConfig)),
							updateTime: now
						}
					}
				} else {
					this.templateId = `template_${now}`
					templates.push({
						id: this.templateId,
						name: this.templateName,
						config: JSON.parse(JSON.stringify(this.templateConfig)),
						createTime: now,
						updateTime: now
					})
				}

				uni.setStorageSync('customTemplates', templates)
				this.createTemplateModifyRecord(isEdit)
				this.saveStatus = 'saved'
				uni.showToast({ title: '保存成功', icon: 'success' })
				return Promise.resolve(true)
			} catch (e) {
				console.error('保存模板失败', e)
				this.saveStatus = 'error'
				uni.showToast({ title: '保存失败', icon: 'none' })
				return Promise.resolve(false)
			}
		},
		createTemplateModifyRecord(isEdit) {
			try {
				const records = uni.getStorageSync('recordsList')
					? JSON.parse(uni.getStorageSync('recordsList'))
					: []
				const now = Date.now()
				const timeStr = `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`

				records.unshift({
					typeIndex: 2,
					templateId: this.templateId,
					templateName: this.templateName,
					action: isEdit ? 'update' : 'create',
					time: timeStr,
					updateTime: now
				})
				uni.setStorageSync('recordsList', JSON.stringify(records))
			} catch (e) {
				console.error('保存模板修改记录失败', e)
			}
		}
	}
}
</script>

<style scoped>
.container {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background: linear-gradient(180deg, #f5f7fa 0%, #eef0f3 100%);
}

.header {
	background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
	box-shadow: 0 8rpx 32rpx rgba(74, 144, 226, 0.3);
	z-index: 100;
}

.nav-bar {
	height: 96rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 32rpx;
}

.back-btn {
	width: 80rpx;
	height: 80rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: rgba(255, 255, 255, 0.2);
	border-radius: 50%;
}

.nav-placeholder {
	width: 80rpx;
}

.page-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #fff;
	letter-spacing: 2rpx;
}

.tab-bar {
	display: flex;
	padding: 0 24rpx 20rpx;
	gap: 12rpx;
}

.tab-item {
	flex: 1;
	text-align: center;
	padding: 16rpx 0;
	font-size: 28rpx;
	color: rgba(255, 255, 255, 0.75);
	border-radius: 32rpx;
	transition: all 0.2s ease;
}

.tab-item.active {
	color: #4A90E2;
	background: #fff;
	font-weight: 600;
}

.content {
	flex: 1;
	padding: 28rpx 24rpx 0;
	box-sizing: border-box;
}

.tab-content {
	display: flex;
	flex-direction: column;
	gap: 28rpx;
}

.content-spacer {
	height: calc(160rpx + env(safe-area-inset-bottom));
}
</style>
