<template>
	<view class="bill-preview container" :class="{ 'preview-mode': previewMode }">
		<view class="nav" v-if="!previewMode" @click="goBack" :style="{ paddingTop: statusBarHeight + 'px' }">
			<uni-icons class="close" type="closeempty" color="#000" size="22"></uni-icons>
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
							支付时间
						</view>
						<view class="right">
							{{info.time}}
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

					<view class="item" v-if="info.shopNumber!=''" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">
							商户单号
						</view>
						<view class="right">
							{{info.shopNumber}}
						</view>
					</view>
					<view class="item" v-if="info.BoNumber!=''&&                                                                             info.BoNumber !=null" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">
							经营单号
						</view>
						<view class="right">
							{{info.BoNumber}}
						</view>
					</view>
				</view>
			</view>
			<view class="serivce" :style="{ paddingLeft: info.padd + 'rpx', paddingRight: info.padd + 'rpx' }">
				<view class="se_title" :style="{ fontSize: (26 * fontScale) + 'rpx' }">
					账单服务
				</view>
			
				<view class="serivce_bx">
						<view class="se_item" :style="{ fontSize: (26 * fontScale) + 'rpx' }">
							<view class="se_icon ">
								<image class="wticon" src="/static/wticon.png" mode=""></image>
							</view>
							对订单有疑惑
						</view>
					<view class="se_item" v-if="info.showService !== false">
						<view class="se_icon ">
							<image class="skIcon" src="/static/skIcon.png" mode=""></image>
						</view>
						发起群收款
					</view>
				</view>
			</view>
			<view class="serivce" :style="{ paddingLeft: info.padd + 'rpx', paddingRight: info.padd + 'rpx' }">
				<view class="se_title">
					收款方服务
				</view>
				<view class="serivce_bx">
					<view class="se_item">
						<view class="se_icon ">
							<image class="cordIcon" src="/static/cordIcon.png" mode=""></image>
						</view>
						收款方名片
					</view>
					<view class="se_item">
			
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
	export default {
		name: 'ThirdpartyMerchantBill',
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
