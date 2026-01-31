<template>
	<view class="container">
		<view class="nav" @click="goBack" :style="{ paddingTop: statusBarHeight + 'px' }">
			<uni-icons class="close" type="closeempty" color="#000" size="22"></uni-icons>
			<view class="allOrder" v-if="info.order">全部账单</view>
		</view>
		<view class="content">
			<view class="order" :style="{ paddingLeft: info.padd + 'rpx', paddingRight: info.padd + 'rpx' }">
				<view class="order_top">
					<view class="avatar" @click="changeRole">
						<image :src="info.url||'/static/logo.png'"></image>
					</view>
					<view class="name">{{ info.name }}</view>
					<view class="num" @click="exitInfo">
						{{ info.money }}
					</view>
					<view class="line" />
				</view>

				<view class="order_info">
					<view class="item">
						<view class="left">当前状态</view>
						<view class="right">{{ info.currentState }}</view>
					</view>
					<view class="item">
						<view class="left">支付时间</view>
						<view class="right">{{ info.time }}</view>
					</view>
					<view class="item" v-if="info.shop">
						<view class="left">商品</view>
						<view class="right">{{ info.shop }}</view>
					</view>
					<view class="item" v-if="info.merchantName">
						<view class="left">商户全称</view>
						<view class="right">{{ info.merchantName }}</view>
					</view>
					<view class="item" v-if="info.orderNumber">
						<view class="left">订单号码</view>
						<view class="right">{{ info.orderNumber }}</view>
					</view>
					<view class="item" v-if="info.receiptCode">
						<view class="left">收钱码</view>
						<view class="right">{{ info.receiptCode }}</view>
					</view>
				</view>

				<!-- 条形码区域 -->
				<view class="barcode-area" v-if="showBarcode">
					<view class="barcode-container">
						<image 
							:src="'data:image/png;base64,' + barcodeBase64" 
							class="barcode-image"
							v-if="barcodeBase64"
						/>
					</view>
				</view>
			</view>
		</view>

		<!-- 底部按钮 -->
		<view class="save" @click="saveImage">
			<view class="save_btn">
				<text class="btn-text">保存图片</text>
			</view>
		</view>

		<!-- 编辑弹窗 -->
		<EditableFormPopup 
			ref="editPopup"
			:value="info"
			:field-labels="fieldLabels"
			@submit="onEditSubmit"
		/>
	</view>
</template>

<script>
import EditableFormPopup from '../EditableFormPopup/EditableFormPopup.vue';
import bwipjs from '../../utils/bwip.js';

export default {
	name: 'PaymentPage',
	components: {
		EditableFormPopup
	},
	props: {
		// 支付信息
		paymentInfo: {
			type: Object,
			required: true
		},
		// 是否显示条形码
		showBarcode: {
			type: Boolean,
			default: false
		},
		// 字段标签映射
		fieldLabels: {
			type: Object,
			default: () => ({
				name: '商户名称',
				money: '金额',
				currentState: '当前状态',
				time: '支付时间',
				shop: '商品',
				merchantName: '商户全称',
				orderNumber: '订单号码',
				receiptCode: '收钱码'
			})
		}
	},
	data() {
		return {
			statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
			info: {},
			barcodeBase64: ''
		}
	},
	watch: {
		paymentInfo: {
			immediate: true,
			handler(newVal) {
				this.info = { ...newVal };
				if (this.showBarcode && this.info.orderNumber) {
					this.generateBarcode();
				}
			}
		}
	},
	methods: {
		goBack() {
			uni.navigateBack();
		},
		changeRole() {
			this.$refs.editPopup.open();
		},
		exitInfo() {
			// 金额编辑逻辑
		},
		onEditSubmit(data) {
			this.info = { ...data };
			this.$emit('update', this.info);
			if (this.showBarcode && this.info.orderNumber) {
				this.generateBarcode();
			}
		},
		generateBarcode() {
			if (!this.info.orderNumber) return;
			
			try {
				const canvas = document.createElement('canvas');
				bwipjs.toCanvas(canvas, {
					bcid: 'code128',
					text: this.info.orderNumber,
					scale: 3,
					height: 10,
					includetext: true,
					textxalign: 'center'
				});
				this.barcodeBase64 = canvas.toDataURL().split(',')[1];
			} catch (e) {
				console.error('条形码生成失败:', e);
			}
		},
		saveImage() {
			// 保存图片到相册逻辑
			uni.showToast({
				title: '保存成功',
				icon: 'success'
			});
		}
	}
}
</script>

<style scoped>
.container {
	position: relative;
	background: #f5f5f5;
	height: 100vh;
}

.nav {
	height: 88rpx;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 40rpx;
	background: #fff;
}

.nav .close {
	width: 60rpx;
	text-align: center;
}

.allOrder {
	font-size: 32rpx;
	color: #333;
}

.content {
	flex: 1;
	padding: 40rpx;
}

.order {
	background: #fff;
	border-radius: 16rpx;
	padding: 40rpx;
	margin-bottom: 40rpx;
}

.order_top {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding-bottom: 40rpx;
}

.avatar {
	width: 120rpx;
	height: 120rpx;
	border-radius: 60rpx;
	overflow: hidden;
	margin-bottom: 20rpx;
}

.avatar image {
	width: 100%;
	height: 100%;
}

.name {
	font-size: 36rpx;
	color: #333;
	margin-bottom: 20rpx;
}

.num {
	font-size: 72rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 40rpx;
}

.line {
	width: 100%;
	height: 2rpx;
	background: #eee;
}

.order_info {
	padding-top: 40rpx;
}

.item {
	display: flex;
	justify-content: space-between;
	padding: 20rpx 0;
	border-bottom: 2rpx solid #f5f5f5;
}

.item:last-child {
	border-bottom: none;
}

.left {
	color: #666;
	font-size: 32rpx;
}

.right {
	color: #333;
	font-size: 32rpx;
	text-align: right;
	flex: 1;
	margin-left: 40rpx;
}

.barcode-area {
	margin-top: 40rpx;
	text-align: center;
}

.barcode-container {
	background: #fff;
	padding: 40rpx;
	border-radius: 16rpx;
}

.barcode-image {
	max-width: 100%;
	height: auto;
}

.save {
	position: fixed;
	bottom: 0;
	left: 0;
	right: 0;
	padding: 40rpx;
	background: #fff;
	border-top: 2rpx solid #eee;
}

.save_btn {
	background: #07c160;
	height: 88rpx;
	border-radius: 8rpx;
	display: flex;
	align-items: center;
	justify-content: center;
}

.btn-text {
	color: #fff;
	font-size: 32rpx;
}
</style>
