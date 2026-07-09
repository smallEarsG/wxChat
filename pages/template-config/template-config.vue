<template>
	<view class="container">
		<!-- 顶部导航 -->
		<view class="header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav-bar">
				<view class="back-btn" @click="goBack">
					<uni-icons type="left" size="24" color="#333" />
				</view>
				<text class="page-title">自定义模板</text>
				<view class="save-btn" @click="saveTemplate">
					<text>保存</text>
				</view>
			</view>
		</view>

		<scroll-view class="content" scroll-y="true">
			<!-- 模板名称 -->
			<view class="section">
				<view class="section-title">模板名称</view>
				<input class="input-field" v-model="templateName" placeholder="请输入模板名称" />
			</view>

			<!-- 预览区域 -->
			<view class="section">
				<view class="section-title">模板预览</view>
				<view class="preview-wrapper">
					<CustomBill :info="previewInfo" :config="templateConfig" :previewMode="true" />
				</view>
			</view>

			<!-- order_info 字段配置 -->
			<view class="section">
				<view class="section-row">
					<text class="section-title">订单信息字段</text>
					<text class="subtitle">勾选要显示的字段，拖动排序</text>
				</view>
				<view class="field-list-single">
					<view v-for="(field, index) in templateConfig.orderInfoFields" :key="field.key" 
						  class="field-item-row"
						  :class="{ disabled: !field.enabled, dragging: dragState.type === 'field' && dragState.itemIndex === index }"
						  @touchstart="onDragStart('field', index, $event)"
						  @touchmove="onDragMove($event)"
						  @touchend="onDragEnd">
						<view class="drag-handle">
							<uni-icons type="bars" size="22" color="#999" />
						</view>
						<view class="checkbox-wrap">
							<checkbox :checked="field.enabled" @click="toggleField(index)" color="#4A90E2" />
						</view>
						<view class="field-content">
							<input :value="field.label" @input="updateFieldLabel(index, $event)" 
								   class="label-input-row" :disabled="!field.enabled" 
								   placeholder="请输入标签名称" />
							<text class="field-key-row">{{ field.key }}</text>
						</view>
					</view>
				</view>
			</view>

			<!-- 条形码选项 -->
			<view class="section">
				<view class="section-title">条形码设置</view>
				<view class="option-card" @click="toggleBarcode">
					<view class="option-content">
						<view class="option-icon" :class="{ active: templateConfig.showBarcode }">
							<uni-icons type="checkmark" size="24" />
						</view>
						<text class="option-text">显示商户单号条形码</text>
					</view>
					<switch :checked="templateConfig.showBarcode" color="#4A90E2" @click.stop />
				</view>
			</view>

			<!-- service 模块配置 -->
			<view class="section">
				<view class="section-row">
					<text class="section-title">服务模块</text>
					<view class="add-btn" @click="addServiceModule">
						<uni-icons type="plus" size="20" color="#4A90E2" />
						<text>添加模块</text>
					</view>
				</view>
				<view v-for="(module, moduleIndex) in templateConfig.serviceModules" :key="moduleIndex" class="service-module-card">
					<view class="module-header-card">
						<input class="input-field" v-model="module.title" placeholder="服务模块标题" />
						<view class="module-actions" v-if="templateConfig.serviceModules.length > 1">
							<view class="action-btn" @click="deleteServiceModule(moduleIndex)">
								<uni-icons type="trash" size="22" color="#F56C6C" />
							</view>
						</view>
					</view>
					<view class="service-items-section">
						<text class="sub-title">服务项</text>
						<view class="service-items-list">
							<view v-for="(item, index) in module.items" :key="item._id || index" 
								  class="service-item-row"
								  :class="{ dragging: dragState.type === 'service' && dragState.moduleIndex === moduleIndex && dragState.itemIndex === index }"
								  @touchstart="onDragStart('service', index, $event, moduleIndex)"
								  @touchmove="onDragMove($event)"
								  @touchend="onDragEnd">
								<view class="drag-handle">
									<uni-icons type="bars" size="22" color="#999" />
								</view>
								<view class="checkbox-wrap">
									<checkbox :checked="item.enabled" @click="toggleServiceItem(moduleIndex, index)" color="#4A90E2" />
								</view>
								<view class="field-content">
									<input :value="item.label" @input="updateServiceLabel(moduleIndex, index, $event)" 
										   class="label-input-row" :disabled="!item.enabled" 
										   placeholder="请输入服务名称" />
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	import CustomBill from '@/components/bill-preview/CustomBill.vue'

	// 默认的可用字段（参考其他模板组件补充）
	const DEFAULT_FIELDS = [
		{ key: 'currentState', label: '当前状态', enabled: true },
		{ key: 'time', label: '支付时间', enabled: true },
		{ key: 'otherTime', label: '收款时间', enabled: false },
		{ key: 'shop', label: '商品', enabled: false },
		{ key: 'merchantName', label: '商户全称', enabled: false },
		{ key: 'institution', label: '收单机构', enabled: true },
		{ key: 'desc', label: '收单机构备注', enabled: false },
		{ key: 'payment', label: '支付方式', enabled: true },
		{ key: 'desc2', label: '支付方式备注', enabled: false },
		{ key: 'payDesc', label: '支付说明', enabled: false },
		{ key: 'orderNumber', label: '交易单号', enabled: true },
		{ key: 'shopNumber', label: '商户单号', enabled: true },
		{ key: 'BoNumber', label: '经营单号', enabled: false },
		{ key: 'miniName', label: '商家小程序', enabled: false },
		{ key: 'message', label: '留言/备注', enabled: false },
		{ key: 'remark', label: '备注信息', enabled: false },
		{ key: 'payeeRemark', label: '收款方备注', enabled: false },
		{ key: 'transferTime', label: '转账时间', enabled: false },
		{ key: 'transferOrderNumber', label: '转账单号', enabled: false }
	]

	// 默认的服务项（参考其他模板组件补充）
	const DEFAULT_SERVICE_ITEMS = [
		{ _id: 's1', label: '对订单有疑惑', enabled: true, icon: '/static/wticon.png', iconClass: 'wticon' },
		{ _id: 's2', label: '发起群收款', enabled: true, icon: '/static/qiw/tpicon_1.png', iconClass: 'chatIcon' },
		{ _id: 's3', label: '收款方名片', enabled: true, icon: '/static/cordIcon.png', iconClass: 'cordIcon' },
		{ _id: 's4', label: '在此商户的交易', enabled: false, icon: '/static/qiw/tpIcon_2.png', iconClass: 'startIcon' },
		{ _id: 's5', label: '定位到聊天位置', enabled: false, icon: '/static/chatIcon.png', iconClass: 'chatIcon' },
		{ _id: 's6', label: '申请转账电子凭证', enabled: false, icon: '/static/startIcon.png', iconClass: 'startIcon' },
		{ _id: 's7', label: '查看往来转账', enabled: false, icon: '/static/transferIcon.png', iconClass: 'transferIcon' },
		{ _id: 's8', label: '商家电话', enabled: false, icon: '/static/wxchat/phone.png', iconClass: 'phoneIcon' },
		{ _id: 's9', label: '申请电子凭证', enabled: false, icon: '/static/startIcon.png', iconClass: 'startIcon' },
		{ _id: 's10', label: '向收款方留言', enabled: false, icon: '/static/msgicon1.png', iconClass: 'msgicon1' }
	]

	export default {
		components: {
			CustomBill
		},
		data() {
			return {
				statusBarHeight: 0,
				templateId: null,
				templateName: '',
				templateConfig: {
					orderInfoFields: JSON.parse(JSON.stringify(DEFAULT_FIELDS)),
					serviceModules: [{
						title: '账单服务',
						items: JSON.parse(JSON.stringify(DEFAULT_SERVICE_ITEMS))
					}],
					showBarcode: false
				},
				dragState: {
					type: null,
					moduleIndex: -1,
					itemIndex: -1,
					startY: 0,
					currentY: 0,
					isDragging: false
				},
				previewInfo: {
					url: "",
					name: "给为理想而奋斗",
					money: "-0.01",
					time: "2025年6月13日 16:19:30",
					orderNumber: "1000050001202506130129831495334",
					otherTime: "2025年6月13日 16:20:17",
					payment: "零钱通",
					currentState: "对方已收款",
					desc: "由互联网清算有限公司提供付款清算服务",
					desc2: "由互联网清算有限公司提供付款清算服务",
					shop: '商品名称',
					merchantName: '商户全称名称',
					institution: '中国农业银行股份有限公司',
					shopNumber: '20250621110113130166201789980574',
					payDesc: '这是支付说明内容',
					BoNumber: 'JY20250613001',
					miniName: '小七商行收款',
					message: '这是一条留言备注',
					remark: '备注信息内容',
					payeeRemark: '收款方备注内容',
					transferTime: '2025年6月13日 16:19:30',
					transferOrderNumber: '1000050001202506130129831495334',
					padd: 60,
					order: false,
					fontSize: 100
				}
			}
		},
		onLoad(options) {
			const systemInfo = uni.getSystemInfoSync();
			this.statusBarHeight = systemInfo.statusBarHeight || 20;

			// 如果是编辑模式，加载模板
			if (options.id) {
				this.templateId = options.id;
				this.loadTemplate(options.id);
			}
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			toggleBarcode() {
				const newValue = !this.templateConfig.showBarcode;
				this.templateConfig = JSON.parse(JSON.stringify({
					...this.templateConfig,
					showBarcode: newValue
				}));
			},
			toggleField(index) {
				this.templateConfig.orderInfoFields[index].enabled = !this.templateConfig.orderInfoFields[index].enabled;
			},
			updateFieldLabel(index, e) {
				this.templateConfig.orderInfoFields[index].label = e.detail.value;
			},
			toggleServiceItem(moduleIndex, index) {
				this.templateConfig.serviceModules[moduleIndex].items[index].enabled = !this.templateConfig.serviceModules[moduleIndex].items[index].enabled;
			},
			updateServiceLabel(moduleIndex, index, e) {
				this.templateConfig.serviceModules[moduleIndex].items[index].label = e.detail.value;
			},
			addServiceModule() {
				this.templateConfig.serviceModules.push({
					title: '新服务模块',
					items: JSON.parse(JSON.stringify(DEFAULT_SERVICE_ITEMS))
				});
			},
			deleteServiceModule(moduleIndex) {
				if (this.templateConfig.serviceModules.length > 1) {
					this.templateConfig.serviceModules.splice(moduleIndex, 1);
				}
			},
			onDragStart(type, itemIndex, event, moduleIndex = -1) {
				this.dragState = {
					type,
					moduleIndex,
					itemIndex,
					startY: event.touches[0].clientY,
					currentY: event.touches[0].clientY,
					isDragging: true
				};
			},
			onDragMove(event) {
				if (!this.dragState.isDragging) return;
				this.dragState.currentY = event.touches[0].clientY;

				const { type, moduleIndex, itemIndex } = this.dragState;
				const items = type === 'field'
					? this.templateConfig.orderInfoFields
					: this.templateConfig.serviceModules[moduleIndex].items;
				const deltaY = this.dragState.currentY - this.dragState.startY;
				const itemHeight = 80;
				const moveCount = Math.round(deltaY / itemHeight);

				if (moveCount !== 0) {
					const newIndex = itemIndex + moveCount;
					if (newIndex >= 0 && newIndex < items.length && newIndex !== itemIndex) {
						const [removed] = items.splice(itemIndex, 1);
						items.splice(newIndex, 0, removed);
						this.dragState.itemIndex = newIndex;
						this.dragState.startY = this.dragState.currentY;
					}
				}
			},
			onDragEnd() {
				this.dragState = {
					type: null,
					moduleIndex: -1,
					itemIndex: -1,
					startY: 0,
					currentY: 0,
					isDragging: false
				};
			},
			mergeOrderInfoFields(savedFields) {
				const savedKeys = new Set((savedFields || []).map(f => f.key));
				const merged = [...(savedFields || [])];
				DEFAULT_FIELDS.forEach(def => {
					if (!savedKeys.has(def.key)) merged.push({ ...def });
				});
				return merged;
			},
			loadTemplate(id) {
				try {
					const templates = uni.getStorageSync('customTemplates') || [];
					const template = templates.find(t => t.id === id);
					if (template) {
						this.templateName = template.name;
						const config = JSON.parse(JSON.stringify(template.config));
						config.orderInfoFields = this.mergeOrderInfoFields(config.orderInfoFields);
						this.templateConfig = config;
					}
				} catch (e) {
					console.error('加载模板失败', e);
				}
			},
			saveTemplate() {
				if (!this.templateName.trim()) {
					uni.showToast({ title: '请输入模板名称', icon: 'none' });
					return;
				}

				try {
					let templates = uni.getStorageSync('customTemplates') || [];
					const now = Date.now();
					const isEdit = !!this.templateId;

					if (isEdit) {
						// 编辑模式，更新现有模板
						const index = templates.findIndex(t => t.id === this.templateId);
						if (index !== -1) {
							templates[index] = {
								...templates[index],
								name: this.templateName,
								config: JSON.parse(JSON.stringify(this.templateConfig)),
								updateTime: now
							};
						}
					} else {
						// 新建模式
						this.templateId = 'template_' + now;
						const newTemplate = {
							id: this.templateId,
							name: this.templateName,
							config: JSON.parse(JSON.stringify(this.templateConfig)),
							createTime: now,
							updateTime: now
						};
						templates.push(newTemplate);
					}

					uni.setStorageSync('customTemplates', templates);
					
					// 创建模板修改记录
					this.createTemplateModifyRecord(isEdit);
					
					uni.showToast({ title: '保存成功', icon: 'success' });

					setTimeout(() => {
						uni.navigateBack();
					}, 1500);
				} catch (e) {
					console.error('保存模板失败', e);
					uni.showToast({ title: '保存失败', icon: 'none' });
				}
			},
			createTemplateModifyRecord(isEdit) {
				try {
					const records = uni.getStorageSync('recordsList') ? JSON.parse(uni.getStorageSync('recordsList')) : [];
					const now = Date.now();
					const timeStr = `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`;
					
					const modifyRecord = {
						typeIndex: 2,
						templateId: this.templateId,
						templateName: this.templateName,
						action: isEdit ? 'update' : 'create',
						time: timeStr,
						updateTime: now
					};
					
					records.unshift(modifyRecord);
					uni.setStorageSync('recordsList', JSON.stringify(records));
					console.log('模板修改记录已保存:', modifyRecord);
				} catch (e) {
					console.error('保存模板修改记录失败', e);
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
		position: sticky;
		top: 0;
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
		transition: all 0.3s ease;
	}

	.back-btn:active {
		background: rgba(255, 255, 255, 0.3);
		transform: scale(0.95);
	}

	.back-btn uni-icons {
		color: #fff !important;
		font-weight: bold;
	}

	.save-btn {
		padding: 16rpx 32rpx;
		background: rgba(255, 255, 255, 0.25);
		border-radius: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
	}

	.save-btn:active {
		background: rgba(255, 255, 255, 0.35);
		transform: scale(0.95);
	}

	.save-btn text {
		color: #fff;
		font-size: 30rpx;
		font-weight: 600;
	}

	.page-title {
		font-size: 36rpx;
		font-weight: 600;
		color: #fff;
		letter-spacing: 2rpx;
	}

	.content {
		flex: 1;
		padding: 28rpx 24rpx;
	}

	.section {
		background-color: #fff;
		border-radius: 24rpx;
		margin-bottom: 28rpx;
		padding: 32rpx;
		box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
	}

	.section-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 28rpx;
	}

	.section-row .section-title {
		margin-bottom: 0;
	}

	.section-row .subtitle {
		margin-top: 0;
	}

	.section-title {
		font-size: 34rpx;
		font-weight: 600;
		color: #1a1a1a;
		margin-bottom: 28rpx;
	}

	.subtitle {
		font-size: 24rpx;
		color: #8a8a8a;
		font-weight: 400;
	}

	.input-field {
		width: 100%;
		height: 88rpx;
		background: linear-gradient(145deg, #fafbfc, #f5f6f7);
		border-radius: 16rpx;
		padding: 0 28rpx;
		font-size: 30rpx;
		box-sizing: border-box;
		border: 2rpx solid #e8eaed;
		transition: all 0.3s ease;
	}

	.input-field:focus {
		border-color: #4A90E2;
		background: #fff;
		box-shadow: 0 0 0 6rpx rgba(74, 144, 226, 0.1);
	}

	.preview-wrapper {
		background: linear-gradient(145deg, #f5f7fa, #eff1f4);
		border-radius: 16rpx;
		padding: 24rpx;
		overflow: auto;
		max-height: 1200rpx;
		border: 2rpx dashed #d0d3d8;
	}

	.field-list-single {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}

	.field-item-row {
		display: flex;
		align-items: center;
		padding: 24rpx;
		background: linear-gradient(145deg, #fafbfc, #f5f6f7);
		border-radius: 16rpx;
		border: 2rpx solid #e8eaed;
		transition: all 0.3s ease;
	}

	.field-item-row:active {
		transform: scale(0.99);
		background: #eef1f5;
	}

	.field-item-row.disabled {
		opacity: 0.5;
	}

	.field-item-row.dragging {
		opacity: 0.9;
		background: linear-gradient(145deg, #e8f0fe, #d7e6fa);
		transform: scale(1.02);
		box-shadow: 0 8rpx 24rpx rgba(74, 144, 226, 0.2);
		z-index: 1000;
		position: relative;
		border-color: #4A90E2;
	}

	.field-item-row:active .drag-handle {
		opacity: 0.8;
	}

	.checkbox-wrap {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;
	}

	.field-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 8rpx;
	}

	.label-input-row {
		font-size: 30rpx;
		color: #333;
		font-weight: 500;
		background: transparent;
	}

	.field-key-row {
		font-size: 22rpx;
		color: #a0a0a0;
		padding: 4rpx 12rpx;
		background: rgba(0, 0, 0, 0.05);
		border-radius: 8rpx;
		width: fit-content;
	}

	.option-card {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 28rpx;
		background: linear-gradient(145deg, #fafbfc, #f5f6f7);
		border-radius: 16rpx;
		border: 2rpx solid #e8eaed;
		transition: all 0.3s ease;
	}

	.option-card:active {
		background: #eef1f5;
		transform: scale(0.99);
	}

	.option-content {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.option-icon {
		width: 48rpx;
		height: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f0f2f5;
		border-radius: 50%;
		color: #ccc;
		transition: all 0.3s ease;
	}

	.option-icon.active {
		background: #4A90E2;
		color: #fff;
	}

	.option-text {
		font-size: 30rpx;
		color: #333;
		font-weight: 500;
	}

	.add-btn {
		display: flex;
		align-items: center;
		gap: 10rpx;
		font-size: 28rpx;
		color: #4A90E2;
		padding: 12rpx 24rpx;
		background: rgba(74, 144, 226, 0.08);
		border-radius: 24rpx;
		transition: all 0.3s ease;
	}

	.add-btn:active {
		background: rgba(74, 144, 226, 0.15);
		transform: scale(0.95);
	}

	.service-module-card {
		background: linear-gradient(145deg, #fafbfc, #f5f6f7);
		border-radius: 20rpx;
		padding: 24rpx;
		margin-bottom: 24rpx;
		border: 2rpx solid #e8eaed;
	}

	.service-module-card:last-child {
		margin-bottom: 0;
	}

	.module-header-card {
		display: flex;
		align-items: center;
		gap: 16rpx;
		margin-bottom: 24rpx;
	}

	.module-header-card .input-field {
		flex: 1;
	}

	.module-actions {
		display: flex;
		gap: 12rpx;
	}

	.action-btn {
		width: 68rpx;
		height: 68rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(145deg, #fff5f5, #ffe5e5);
		border-radius: 50%;
		transition: all 0.3s ease;
	}

	.action-btn:active {
		background: linear-gradient(145deg, #ffe5e5, #ffd5d5);
		transform: scale(0.9);
	}

	.service-items-section {
		margin-top: 8rpx;
	}

	.service-items-section .sub-title {
		margin-bottom: 20rpx;
		font-size: 26rpx;
		color: #666;
		font-weight: 500;
	}

	.service-items-list {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}

	.service-item-row {
		display: flex;
		align-items: center;
		padding: 20rpx 24rpx;
		background: #fff;
		border-radius: 14rpx;
		border: 2rpx solid #f0f2f5;
		transition: all 0.25s ease;
	}

	.service-item-row:active {
		background: #fafbfc;
	}

	.service-item-row.dragging {
		opacity: 0.9;
		background: linear-gradient(145deg, #e8f0fe, #d7e6fa);
		transform: scale(1.02);
		box-shadow: 0 8rpx 24rpx rgba(74, 144, 226, 0.2);
		z-index: 1000;
		position: relative;
		border-color: #4A90E2;
	}

	.drag-handle {
		width: 56rpx;
		height: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 16rpx;
		cursor: grab;
		opacity: 0.3;
		transition: all 0.25s ease;
		border-radius: 12rpx;
	}

	.drag-handle:active {
		cursor: grabbing;
		opacity: 1;
		background: rgba(74, 144, 226, 0.1);
	}

	.service-item-row:active .drag-handle {
		opacity: 0.8;
	}

	checkbox {
		transform: scale(1.15);
	}

	switch {
		transform: scale(1);
	}
</style>
