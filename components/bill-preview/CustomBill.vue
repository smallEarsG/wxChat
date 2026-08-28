<template>
	<view class="bill-preview bill-container">
		<!-- 导航栏 -->
		<view class="nav" :style="{ paddingTop: (previewMode ? 20 : statusBarHeight) + 'px' }">
			<uni-icons v-if="!previewMode" class="close guide-step-back" type="closeempty" color="#000" size="22" @click="$emit('goBack')"></uni-icons>
			<uni-icons v-else class="close" type="closeempty" color="#000" size="22"></uni-icons>
			<view v-if="isIos" class="nav-title">
				账单
			</view>
			<view class="allOrder" v-if="info.order" @click="handleMoneyClick" :style="{ fontSize: (36 * fontScale) + 'rpx' }">全部账单</view>
		</view>

		<view class="content">
			<view class="order guide-step-content" @click="handleMoneyClick" :style="{ paddingLeft: info.padd + 'rpx', paddingRight: info.padd + 'rpx' }">
				<!-- order_top 保持不变 -->
				<view class="order_top">
					<view class="avatar guide-step-avatar" @click.stop="handleAvatarClick">
						<image :src="info.url||'/static/paySe.png'"></image>
					</view>
					<view class="name" :style="{ fontSize: (32 * fontScale) + 'rpx' }">
						{{info.name}}
					</view>
					<view class="num" :style="{ fontSize: (56 * fontScale) + 'rpx' }">
						{{info.money}}
					</view>
					<view class="line" />
				</view>

				<!-- order_info 自定义字段 -->
				<view class="order_info">
					<!-- 其他字段（不含商户单号的条形码模式） -->
					<view v-for="(field, index) in config.orderInfoFields" :key="'field-' + index" 
						  class="item" 
						  v-if="field.enabled && isFieldVisible(field) && !(field.key === 'shopNumber' && showBarcodeValue) && !(field.key === 'miniName' && showMiniProgramValue)" 
						  :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">{{ field.label }}</view>
						<view class="right">
							<!-- 特殊字段处理：收单机构 -->
							<template v-if="field.key === 'institution'">
								<view>{{ info[field.key] }}</view>
								<view class="tips" v-if="info.desc" :style="{ fontSize: (26 * fontScale) + 'rpx' }">
									{{ info.desc }}
								</view>
							</template>
							<!-- 特殊字段处理：支付方式 -->
							<template v-else-if="field.key === 'payment'">
								<view class="rightIcon">
									{{ info[field.key] }}
									<uni-icons v-if="info[field.key] == '零钱通'" type="info" size="18" color="#999" class="input-icon gthIcon" />
								</view>
								<view class="tips" v-if="info.desc2" :style="{ fontSize: (26 * fontScale) + 'rpx' }">
									{{ info.desc2 }}
								</view>
							</template>
							<!-- 普通字段 -->
							<template v-else>
								{{ info[field.key] }}
							</template>
						</view>
					</view>
					<!-- 特殊字段处理：商户单号（带条形码）- 显示在最后 -->
					<template v-if="showBarcodeValue">
						<view v-for="(field, index) in config.orderInfoFields" :key="'barcode-' + index">
							<template v-if="field.key === 'shopNumber' && field.enabled">
								<view class="item" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
									<view class="left">{{ field.label }}</view>
									<view class="right">可在支持的商户扫码退款</view>
								</view>
								<view class="item barcode-item" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
									<view class="right barcode-content">
										<view class="barCodeBox">
											<BarcodeGenerator v-if="info.shopNumber != ''" :width="'300px'" :content="info.shopNumber" />
										</view>
										<view class="codeNo">{{ info.shopNumber || '请输入商户单号' }}</view>
									</view>
								</view>
							</template>
						</view>
					</template>
				</view>
			</view>

			<!-- 商家小程序区块 -->
			<view
				v-if="showMiniProgramValue"
				class="mini"
				style="align-items: center;"
				:style="{ paddingLeft: info.padd + 'rpx', paddingRight: info.padd + 'rpx', fontSize: (28 * fontScale) + 'rpx' }"
			>
				<view class="left" style="color: black;">{{ miniProgramLabel }}</view>
				<view class="right_mini">
					<image class="miniapp" mode="widthFix" src="/static/qiw/miniIcon.png"></image>
					<text class="miniName">{{ info.miniName || '请输入小程序名称' }}</text>
					<uni-icons type="right" color="#9b9b9b" size="17"></uni-icons>
				</view>
			</view>
			
			<!-- 多个 service 模块 -->
			<view v-for="(module, moduleIndex) in config.serviceModules" :key="moduleIndex" 
				  class="serivce" 
				  :style="{ paddingLeft: info.padd + 'rpx', paddingRight: info.padd + 'rpx' }">
				<view class="se_title" :style="{ fontSize: (26 * fontScale) + 'rpx' }">
					{{ module.title || '账单服务' }}
				</view>
				<view class="serivce_line">
					<view class="serivce_bx">
						<view v-for="(item, index) in module.items" :key="index" 
							  class="se_item" 
							  v-if="item.enabled"
							  :style="{ fontSize: (26 * fontScale) + 'rpx' }">
							<view class="se_icon">
								<image v-if="item.icon" :class="item.iconClass" :src="item.icon" mode=""></image>
							</view>
							{{ item.label }}
						</view>
					</view>
				</view>
			</view>

			<!-- footer 保持不变 -->
			<view class="footer" :style="{ fontSize: (24 * fontScale) + 'rpx' }">
				本服务由财付通提供
			</view>
		</view>
	</view>
</template>

<script>
	import BarcodeGenerator from '@/components/BarcodeGenerator/BarcodeGenerator.vue'
	
	export default {
		name: 'CustomBill',
		components: {
			BarcodeGenerator
		},
		props: {
			info: {
				type: Object,
				default: () => ({})
			},
			config: {
				type: Object,
				default: () => ({
					orderInfoFields: [],
					showService: true,
					serviceTitle: '账单服务',
					serviceItems: [],
					showBarcode: false,
					showMiniProgram: false
				})
			},
			previewMode: {
				type: Boolean,
				default: false
			},
			statusBarHeight: {
				type: Number,
				default: 0
			}
		},
		computed: {
			isIos() {
				return uni.getSystemInfoSync().platform === 'ios';
			},
			fontScale() {
				return (this.info.fontSize || 100) / 100;
			},
			showBarcodeValue() {
				return this.config.showBarcode === true;
			},
			showMiniProgramValue() {
				return this.config.showMiniProgram === true;
			},
			miniProgramLabel() {
				const field = (this.config.orderInfoFields || []).find(item => item.key === 'miniName');
				return field ? field.label : '商家小程序';
			}
		},
		methods: {
			isFieldVisible(field) {
				if (field.key === 'merchantName' || field.key === 'shopNumber') {
					const value = this.info[field.key]
					return value !== undefined && value !== null && String(value).trim() !== ''
				}
				return true
			},
			handleAvatarClick() {
				if (!this.previewMode) {
					this.$emit('changeRole');
				}
			},
			handleMoneyClick() {
				if (!this.previewMode) {
					this.$emit('editInfo');
				}
			}
		}
	}
</script>

<style scoped>
	@import './bill-preview-common.css';

	.bill-preview .se_title {
		font-size: 28rpx;
		font-weight: normal;
	}

	.bill-preview .barcode-item {
		justify-content: flex-end;
		padding-bottom: 20rpx;
	}

	.bill-preview .barcode-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
</style>
