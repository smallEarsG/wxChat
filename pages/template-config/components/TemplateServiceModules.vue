<template>
	<view class="service-modules">
		<view class="section-header">
			<text class="section-title">服务模块</text>
			<view class="add-btn" @click="$emit('add-module')">
				<uni-icons type="plus" size="20" color="#4A90E2" />
				<text>添加模块</text>
			</view>
		</view>

		<view v-for="(module, moduleIndex) in modules" :key="moduleIndex" class="module-card">
			<view class="module-summary" @click="toggleExpand(moduleIndex)">
				<view class="module-info">
					<text class="module-title">{{ module.title || '未命名模块' }}</text>
					<text class="module-desc">已显示 {{ getEnabledItems(module).length }} 个服务项</text>
					<text v-if="!isExpanded(moduleIndex) && getEnabledItems(module).length" class="module-preview">
						{{ getEnabledItems(module).map(i => i.label).join(' · ') }}
					</text>
				</view>
				<view class="module-header-actions">
					<view class="menu-btn" @click.stop="$emit('module-menu', moduleIndex)">
						<uni-icons type="more-filled" size="20" color="#666" />
					</view>
					<uni-icons :type="isExpanded(moduleIndex) ? 'up' : 'down'" size="16" color="#999" />
				</view>
			</view>

			<view v-if="isExpanded(moduleIndex)" class="module-body">
				<input
					class="input-field"
					:value="module.title"
					placeholder="服务模块标题"
					@input="$emit('update-title', moduleIndex, $event.detail.value)"
				/>

				<text class="sub-title">当前服务项</text>
				<view v-if="getEnabledItems(module).length === 0" class="empty-tip">暂无服务项</view>

				<view class="service-items">
					<view
						v-for="(item, itemIndex) in getEnabledItems(module)"
						:key="item._id || itemIndex"
						class="service-item"
					>
						<text class="service-label">{{ item.label }}</text>
						<view class="service-actions">
							<view
								class="sort-btn"
								:class="{ disabled: itemIndex === 0 }"
								@click="$emit('move-service-up', moduleIndex, item._id)"
							>
								<uni-icons type="up" size="18" color="#666" />
							</view>
							<view
								class="sort-btn"
								:class="{ disabled: itemIndex === getEnabledItems(module).length - 1 }"
								@click="$emit('move-service-down', moduleIndex, item._id)"
							>
								<uni-icons type="down" size="18" color="#666" />
							</view>
							<view class="action-text danger" @click="$emit('hide-service', moduleIndex, item._id)">移除</view>
						</view>
					</view>
				</view>

				<view class="add-item-btn" @click="$emit('add-service', moduleIndex)">
					<uni-icons type="plus" size="18" color="#4A90E2" />
					<text>添加服务项</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
export default {
	name: 'TemplateServiceModules',
	props: {
		modules: { type: Array, default: () => [] },
		expandedIndexes: { type: Array, default: () => [0] }
	},
	methods: {
		getEnabledItems(module) {
			return (module.items || []).filter(item => item.enabled)
		},
		isExpanded(moduleIndex) {
			return this.expandedIndexes.includes(moduleIndex)
		},
		toggleExpand(moduleIndex) {
			this.$emit('toggle-expand', moduleIndex)
		}
	}
}
</script>

<style scoped>
.service-modules {
	display: flex;
	flex-direction: column;
	gap: 24rpx;
}

.section-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.section-title {
	font-size: 34rpx;
	font-weight: 600;
	color: #1a1a1a;
}

.add-btn {
	display: flex;
	align-items: center;
	gap: 8rpx;
	font-size: 28rpx;
	color: #4A90E2;
	padding: 12rpx 24rpx;
	background: rgba(74, 144, 226, 0.08);
	border-radius: 24rpx;
}

.module-card {
	background: #fff;
	border-radius: 24rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.06);
	overflow: hidden;
}

.module-summary {
	display: flex;
	align-items: flex-start;
	justify-content: space-between;
	padding: 28rpx 32rpx;
}

.module-info {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 8rpx;
}

.module-title {
	font-size: 32rpx;
	font-weight: 600;
	color: #1a1a1a;
}

.module-desc {
	font-size: 24rpx;
	color: #8a8a8a;
}

.module-preview {
	font-size: 24rpx;
	color: #666;
	margin-top: 4rpx;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.module-header-actions {
	display: flex;
	align-items: center;
	gap: 16rpx;
	padding-left: 16rpx;
}

.menu-btn {
	padding: 8rpx;
}

.module-body {
	padding: 0 32rpx 32rpx;
	border-top: 2rpx solid #f0f2f5;
}

.input-field {
	width: 100%;
	height: 80rpx;
	background: #f5f6f7;
	border-radius: 16rpx;
	padding: 0 24rpx;
	font-size: 28rpx;
	box-sizing: border-box;
	border: 2rpx solid #e8eaed;
	margin-top: 24rpx;
}

.sub-title {
	display: block;
	font-size: 26rpx;
	color: #666;
	font-weight: 500;
	margin: 28rpx 0 16rpx;
}

.empty-tip {
	font-size: 26rpx;
	color: #999;
	text-align: center;
	padding: 24rpx 0;
}

.service-items {
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.service-item {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 20rpx 24rpx;
	background: #f5f6f7;
	border-radius: 14rpx;
}

.service-label {
	flex: 1;
	font-size: 28rpx;
	color: #333;
}

.service-actions {
	display: flex;
	align-items: center;
	gap: 12rpx;
}

.sort-btn {
	width: 48rpx;
	height: 48rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	background: #fff;
	border-radius: 10rpx;
	border: 2rpx solid #e8eaed;
}

.sort-btn.disabled {
	opacity: 0.3;
}

.action-text {
	font-size: 24rpx;
	padding: 8rpx;
}

.action-text.danger {
	color: #F56C6C;
}

.add-item-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8rpx;
	margin-top: 20rpx;
	padding: 20rpx;
	font-size: 26rpx;
	color: #4A90E2;
	background: rgba(74, 144, 226, 0.08);
	border-radius: 14rpx;
	border: 2rpx dashed rgba(74, 144, 226, 0.3);
}
</style>
