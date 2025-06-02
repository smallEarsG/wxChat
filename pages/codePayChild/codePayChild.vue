<template>
	<view>
		<view class="close" @click="goBack" :style="{ paddingTop: statusBarHeight + 'px' }">
			<uni-icons type="closeempty" size="30"></uni-icons>
		</view>
		<view class="order">
			<view class="order_top">
				<view class="avatar">
					<image src="/static/icon-transfer.png"></image>
				</view>
				<view class="name">
					扫二维码付款-{{info.name}}
				</view>
				<view class="num">
					<view class="sub" />
					{{info.num}}
				</view>

			</view>
			<view class="line" />
			<view class="order_info">
				<view class="item">
					<view class="left">
						当前状态
					</view>
					<view class="right">
						支付成功
					</view>
				</view>
				<view class="item">
					<view class="left">
						收款方备注
					</view>
					<view class="right">
						二维码收款
					</view>
				</view>
				<view class="item">
					<view class="left">
						收款方式
					</view>
					<view class="right">
						零钱
					</view>
				</view>
				<view class="item">
					<view class="left">
						转账时间
					</view>
					<view class="right">
						{{info.time}}
					</view>
				</view>
				<view class="item">
					<view class="left">
						转账单号
					</view>
					<view class="right">
						{{info.orderNumber}}
					</view>
				</view>

			</view>
			<view class="serivce">
				<view class="se_title">
					账单服务
				</view>
				<view class="serivce_bx">
					<view class="se_item">
						<view class="se_icon">
							
						</view>
						对订单有疑惑
					</view>
					<view class="se_item">
						<view class="se_icon">
							
						</view>
						发起群收款
					</view>
				</view>
			</view>
			<view class="serivce">
				<view class="se_title">
					账单服务
				</view>
				<view class="serivce_bx">
					<view class="se_item">
						<view class="se_icon">
							
						</view>
						收款方名片
					</view>
					
				</view>
			</view>
			<view class="footer">
				本服务由财付通提供
			</view>
		</view>
	</view>
</template>

<script>
	import {
		login
	} from '../../api';

	export default {
		data() {
			return {
				statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
				info: {
					"time": "2025年6月2日12：06：02",
					"name": "给为理想而奋斗",
					"orderNumber": "10001071012025060201715277560518",
					"num": '88.88'
				}
			}
		},
		onLoad(options) {

			// 	console.log( decodeURIComponent(options.info));
			// 	this.info = JSON.parse( decodeURIComponent(options.info))
			// 	console.log(this.info.name);
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
		}
	}
</script>

<style>

</style>