<template>
	<uni-popup ref="popup" type="bottom" background-color="#fff" border-radius="10px">
		<view class="bill-edit-popup">
			<view class="popup-header">
				<view class="header-title">账单管理</view>
				<view class="close-btn" @click="close">
					<uni-icons type="close" size="20" color="#999"></uni-icons>
				</view>
			</view>
			
			<view class="popup-content">
				<!-- 账单分类 -->
				<view class="edit-item">
					<view class="item-label">账单分类</view>
					<view class="item-content">
						<picker 
							:value="categoryIndex" 
							:range="categoryOptions" 
							range-key="name"
							@change="onCategoryChange"
						>
							<view class="picker-display">
								{{ billData.category || '其他' }}
								<uni-icons type="right" size="12" color="#878787"></uni-icons>
							</view>
						</picker>
					</view>
				</view>
				
				<!-- 标签和备注 -->
				<view class="edit-item">
					<view class="item-label">标签和备注</view>
					<view class="item-content">
						<input 
							class="tag-input" 
							v-model="billData.tags" 
							placeholder="添加标签和备注"
							@input="onTagsChange"
						/>
					</view>
				</view>
				
				<!-- 记入收入开关 -->
				<view class="edit-item">
					<view class="item-label">记入收入</view>
					<view class="item-content">
						<switch 
							:checked="billData.isIncome" 
							@change="onIncomeChange"
							style="transform:scale(0.6)"
						/>
					</view>
				</view>
			</view>
			
			<view class="popup-footer">
				<button class="cancel-btn" @click="close">取消</button>
				<button class="confirm-btn" @click="confirm">确定</button>
			</view>
		</view>
	</uni-popup>
</template>

<script>
export default {
	name: 'BillEditPopup',
	props: {
		// 账单数据
		value: {
			type: Object,
			default: () => ({
				category: '其他',
				tags: '',
				isIncome: false
			})
		}
	},
	data() {
		return {
			billData: {
				category: '其他',
				tags: '',
				isIncome: false
			},
			categoryIndex: 0,
			categoryOptions: [
				{ name: '其他', value: 'other' },
				{ name: '转账红包', value: 'transfer' },
				{ name: '餐饮', value: 'food' },
				{ name: '交通出行', value: 'transport' },
				{ name: '购物', value: 'shopping' },
				{ name: '娱乐', value: 'entertainment' },
				{ name: '医疗', value: 'medical' },
				{ name: '教育', value: 'education' },
				{ name: '住房', value: 'housing' },
				{ name: '投资', value: 'investment' }
			]
		}
	},
	watch: {
		value: {
			handler(newVal) {
				if (newVal) {
					this.billData = { ...this.billData, ...newVal };
					this.updateCategoryIndex();
				}
			},
			immediate: true,
			deep: true
		}
	},
	methods: {
		open() {
			this.$refs.popup.open();
		},
		
		close() {
			this.$refs.popup.close();
		},
		
		confirm() {
			this.$emit('submit', { ...this.billData });
			this.close();
		},
		
		onCategoryChange(e) {
			const index = e.detail.value;
			this.categoryIndex = index;
			this.billData.category = this.categoryOptions[index].name;
		},
		
		onTagsChange(e) {
			this.billData.tags = e.detail.value;
		},
		
		onIncomeChange(e) {
			this.billData.isIncome = e.detail.value;
		},
		
		updateCategoryIndex() {
			const index = this.categoryOptions.findIndex(item => item.name === this.billData.category);
			this.categoryIndex = index >= 0 ? index : 0;
		}
	}
}
</script>

<style scoped>
.bill-edit-popup {
	background-color: #fff;
	border-radius: 20upx 20upx 0 0;
	overflow: hidden;
}

.popup-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30upx;
	border-bottom: 1px solid #f0f0f0;
}

.header-title {
	font-size: 36upx;
	font-weight: 600;
	color: #333;
}

.close-btn {
	padding: 10upx;
}

.popup-content {
	padding: 30upx;
}

.edit-item {
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 30upx 0;
	border-bottom: 1px solid #f5f5f5;
}

.edit-item:last-child {
	border-bottom: none;
}

.item-label {
	font-size: 32upx;
	color: #333;
	font-weight: 500;
}

.item-content {
	flex: 1;
	display: flex;
	justify-content: flex-end;
	align-items: center;
}

.picker-display {
	display: flex;
	align-items: center;
	color: #878787;
	font-size: 28upx;
}

.tag-input {
	text-align: right;
	color: #878787;
	font-size: 28upx;
	border: none;
	outline: none;
	background: transparent;
	width: 200upx;
}

.popup-footer {
	display: flex;
	padding: 30upx;
	border-top: 1px solid #f0f0f0;
	gap: 20upx;
}

.cancel-btn, .confirm-btn {
	flex: 1;
	height: 80upx;
	border-radius: 40upx;
	font-size: 32upx;
	border: none;
}

.cancel-btn {
	background-color: #f5f5f5;
	color: #666;
}

.confirm-btn {
	background-color: #007aff;
	color: #fff;
}
</style>
