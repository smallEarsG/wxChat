<template>
	<view class="container">
		<!-- 	<view class="header">
			<view class="title">付款截图</view>
		</view> -->
		<view class="content">
			<!-- 点击整块文字区域，打开编辑弹框 -->
			<view class="txt" @click="openEditPopup">
				<view class="bigMoney">
					<text class="bigMoneyIcon">￥</text>{{ textData.bigMoney }}
				</view>
				<view class="item">
					<view class="lefe">
						{{ textData.item1Left }}
					</view>
					<view class="right">
						{{ textData.item1Right }}
					</view>
				</view>
				<view class="item">
					<view class="lefe">
						{{ textData.item2Left }}
					</view>
					<view class="right">
						{{ textData.item2Right }}
					</view>
				</view>
			</view>
			<image :src="randomImage" mode="widthFix"></image>
			<view class="backBtn"  @click="goBack">
				
			</view>
		</view>
		<!-- 文本编辑弹框 -->
		<EditableFormPopup
			ref="paymentPopup"
			:value="textData"
			:fieldLabels="textLabels"
			@submit="onTextSubmit"
		/>
	</view>
</template>

<script>
	import EditableFormPopup from '@/components/EditableFormPopup/EditableFormPopup.vue'

	export default {
		components: {
			EditableFormPopup
		},
		data() {
			return {
				statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
				randomImage: '/static/zfb/1.png',
				// 付款截图上方的所有文案
				textData: {
					bigMoney: '1.00',          // 大金额
					item1Left: '无敌的肘子的店铺', // 第一行左侧
					item1Right: '￥1.00',       // 第一行右侧
					item2Left: '付款方式',       // 第二行左侧
					item2Right: '账户余额'       // 第二行右侧
				},
				// 弹框中每一项对应的标签
				textLabels: {
					bigMoney: '金额',
					item1Left: '第一行左侧文字',
					item1Right: '第一行右侧文字',
					item2Left: '第二行左侧文字',
					item2Right: '第二行右侧文字'
				}
			}
		},
		onLoad() {
			const randomIndex = Math.floor(Math.random() * 5) + 1
			this.randomImage = `/static/zfb/${randomIndex}.png`
		},
		onShow() {
			uni.setNavigationBarColor({
				frontColor:"#ffffff",
				backgroundColor:"#ffffff"
			})
		},
		methods: {
			// 打开编辑弹框
			openEditPopup() {
				if (this.$refs.paymentPopup) {
					this.$refs.paymentPopup.open()
				}
			},
			// 弹框提交回调，更新文本
			onTextSubmit(data) {
				this.textData = {
					...this.textData,
					...data
				}
			},
			// 返回上一页
			goBack() {
				uni.navigateBack({
					delta: 1
				});
			}
		}
	}
</script>

<style scoped>
	.backBtn{
		position: absolute;
		z-index: 1;
		/* background-color: #1678ff; */
		height: 120rpx;
		width: 100%;
		bottom: 50rpx;
		/* width: 200rpx; */
		
	}
	.item{
		display: flex;
		justify-content: space-between;
		/* font-family: 'ARIALN'; */
		font-weight: 600;
		margin-bottom: 16rpx;
		padding:  0 48rpx;
		font-size: 28rpx;
		
		
	}
	.container {
		position: absolute;
		top: 0;
		right: 0;
		left: 0;
		bottom: 0;
		background-color: #f5f5f5;
	}
	.bigMoneyIcon{
		position: relative;
		top: 20rpx;
		font-weight: 500;
	}
	.bigMoney{
		margin-bottom: 44rpx;
		font-size: 90rpx;
		text-align: center;
		font-family: 'WeChat Sans SS';
		font-weight: 600;
		/* background-color: #1678ff; */
	}
	.txt{
		background:linear-gradient(to bottom,#1678ff,#2c8dff);
		position: absolute;
		z-index: 1;
		margin-top: 240rpx;
		display: flex;
		flex-direction: column;
		width: 100%;
		color: #fff;
		/* padding-top:10rpx */
		/* background-color: antiquewhite; */
	}
	.content {
		width: 100%;
		position: relative;
	}

	image {
		width: 100%;
	}
</style>