<template>
	<view class="bill-preview container" :class="{ 'preview-mode': previewMode }">
		<view class="nav" v-if="!previewMode" @click="goBack" :style="{ paddingTop: statusBarHeight + 'px' }">
			<uni-icons class="close" type="closeempty" color="#000" size="22"></uni-icons>
			<view v-if="isIos" class="nav-title">
				账单
			</view>
			<view class="allOrder" v-if="info.order" :style="{ fontSize: (36 * fontScale) + 'rpx' }">全部账单</view>
		</view>
		<view class="content">
			<view class="order" :style="{ paddingLeft: info.padd + 'rpx', paddingRight: info.padd + 'rpx' }">
				<view class="order_top">
					<view class="avatar" @click="changeRole">
						<image :src="info.url||'/static/paySe.png'"></image>
					</view>
					<view class="name" :style="{ fontSize: (32 * fontScale) + 'rpx' }">
						{{info.name}}
					</view>
					<view class="num" @click="exitInfo" :style="{ fontSize: (56 * fontScale) + 'rpx' }">
						{{info.money}}
					</view>
					<view class="line" />
				</view>

				<view class="order_info">
					<view class="item" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">
							当前状态
						</view>
						<view class="right">
							{{info.currentState}}
						</view>
					</view>
					<view class="item" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">
							支付时间
						</view>
						<view class="right">
							{{info.time}}
						</view>
					</view>
					<view class="item" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">
							商品
						</view>
						<view class="right">
							{{info.shop}}
						</view>
					</view>
					<view class="item" v-if="info.merchantName" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">
							商户全称
						</view>
						<view class="right">
							{{info.merchantName}}
						</view>
					</view>
					<view class="item" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">
							收单机构
						</view>
						<view class="right">
							<view> {{info.institution}}</view>
							<view class="tips" v-if=" info.desc" :style="{ fontSize: (26 * fontScale) + 'rpx' }">
								{{info.desc}}
							</view>
						</view>
					</view>
					<view class="item" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">
							支付方式
						</view>
						<view class="right  ">
							<view class="rightIcon">
								{{info.payment}}
								<uni-icons v-if=" info.payment == '零钱通'" type="info" size="18" color="#999"
									class="input-icon gthIcon" />
							</view>
							<view class="tips" v-if=" info.desc2" :style="{ fontSize: (26 * fontScale) + 'rpx' }">
								{{info.desc2}}
								
							</view>
						</view>
					</view>

					<view class="item" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">
							交易单号
						</view>
						<view class="right">
							{{info.orderNumber}}
						</view>
					</view>

					<view class="item">
						<view class="left">
							商户单号
						</view>
						<view class="right">
							可在支持的商户扫码退款
						</view>
					</view>
					<view class="item">
						<view class="right">
							<view class="barCodeBox">
								<BarcodeGenerator v-if="info.shopNumber != ''"  :width="'219px'" :content="info.shopNumber" />
							</view>
							<view class="codeNo">
								{{info.shopNumber || "请输入商户单号" }}
							</view>
						</view>
					</view>
				</view>
			</view>
			
			<view class="mini" style="align-items: center;"  :style="{ paddingLeft: info.padd + 'rpx', paddingRight: info.padd + 'rpx', fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left" style="color: black;">
							商家小程序
						</view>
						<view class="right_mini">
							<image class="miniapp" mode="widthFix" src="/static/qiw/miniIcon.png"></image>
							<text class="miniName">{{info.miniName}} </text>
							<uni-icons type="right" color="#9b9b9b" size="17"></uni-icons>

						</view>
			</view>
			<view class="serivce" :style="{ paddingLeft: info.padd + 'rpx', paddingRight: info.padd + 'rpx' }"> 
				<view class="se_title" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
					账单服务
				</view>
				<view class="serivce_line">
					<view class="serivce_bx">
						<view class="se_item" :style="{ fontSize: (26 * fontScale) + 'rpx' }">
							<view class="se_icon ">
								<image class="wticon" src="/static/wticon.png" mode=""></image>
							</view>
							对订单有疑惑
						</view>
						<view class="se_item" :style="{ fontSize: (26 * fontScale) + 'rpx' }">
							<view class="se_icon ">
								<image class="chatIcon" src="/static/qiw/tpicon_1.png" mode=""></image>
							</view>
							发起群收款
						</view>
					</view>
					<view class="serivce_bx">
						<view class="se_item" :style="{ fontSize: (26 * fontScale) + 'rpx' }">
							<view class="se_icon ">
								<image class="startIcon" src="/static/qiw/tpIcon_2.png" mode=""></image>
							</view>
							在此商户的交易
						</view>
					</view>
				</view>

			</view>

			<view class="footer" :style="{ fontSize: (24 * fontScale) + 'rpx' }">
				本服务由财付通提供
			</view>
		</view>
	</view>
</template>

<script>
	import BarcodeGenerator from '@/components/BarcodeGenerator/BarcodeGenerator.vue'

	export default {
		name: 'MiniThirdpartyPaymentCodeBill',
		components: {
			BarcodeGenerator
		},
		props: {
			info: {
				type: Object,
				default: () => ({})
			},
			previewMode: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
			}
		},
		computed: {
			isIos() {
				return uni.getSystemInfoSync().platform === 'ios';
			},
			fontScale() {
				return (this.info.fontSize || 100) / 100;
			}
		},
		methods: {
			goBack() {
				this.$emit('goBack');
			},
			changeRole() {
				this.$emit('changeRole');
			},
			exitInfo() {
				this.$emit('exitInfo');
			}
		}
	}
</script>

<style scoped>
	@import './bill-preview-container-common.css';
</style>
