<template>
	<view class="container">
		<!-- 全局水印层 -->
		<WatermarkLayer />
		
		<MiniThirdpartyPaymentCodeBill 
			:info="info" 
			@goBack="goBack"
			@changeRole="changeRole"
			@exitInfo="exitInfo"
		/>
		
		<uni-popup ref="popup" type="bottom" background-color="#fff" border-radius="10px">
			<view class="roleList">
				<!-- <view class=""  v-for="itme in roleList" >
				<uni-list-chat :avatar-circle="true" :title="itme.nickname" :avatar="itme.avatar"
												:note="itme.description"></uni-list-chat>
				</view> -->
				<view class="list_rl">
					<uni-swipe-action v-if="roleList.length>0">
						<uni-swipe-action-item v-for="(item ,index) in roleList" :right-options="options2" :auto-close="false"
							@click="bindClick(index)">

							<view class="content-box" @click="changeRl(item.avatar)">
								<uni-list-chat :avatar-circle="true" :title="item.nickname" :avatar="item.avatar"
									:note="item.description" :clickable="true"
									@click="changeRl(item.avatar)"></uni-list-chat>
							</view>
						</uni-swipe-action-item>

					</uni-swipe-action>
				</view>
				<view class="">
					<button class="btn" @click="openAddPopup">添加角色</button>
				</view>
			</view>
		</uni-popup>
		<EditableFormPopup ref="orderPopup" :value="info" :fieldLabels="infoKey" @submit="onOrderSubmit" />
		<ProfileEditPopup ref="cradPopup" @submit="onCradSubmitz"></ProfileEditPopup>
		<BillTemplateGuide template-key="miniProgramBarcode" />
	</view>
</template>

<script>
	import {
		eadLocalFileToBase64,
		generateBarcodeBase64
	} from "../../utils/tool.js"
	import MiniThirdpartyPaymentCodeBill from '@/components/bill-preview/MiniThirdpartyPaymentCodeBill.vue'
	import BillTemplateGuide from '@/components/BillTemplateGuide/BillTemplateGuide.vue'
	
	export default {
		components: {
			MiniThirdpartyPaymentCodeBill,
			BillTemplateGuide
		},
		data() {
			return {
				options2: [{
						text: '删除',
						style: {
							backgroundColor: '#F56C6C'
						}
					}

				],
				statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
				roleList: [],
				info: {
					"url": "",
					"name": "给为理想而奋斗",
					"money": "-0.01",
					"time": "2025年6月13日 16:19:30",
					"orderNumber": "1000050001202506130129831495334",
					"otherTime": "2025年6月13日 16:20:17",
					"payment": "零钱通",
					"currentState": "对方已收款",
					"desc": "由互联网清算有限公司提供付款清算服务",
					"shop": '商品', // 商品
					"merchantName": '商户名称', // 商户名称
					"institution": '收款机构', //收款机构
					"shopNumber": ' RBKKA803344066075287552', // 商单号
					"desc2": "由互联网清算有限公司提供付款清算服务",
					"miniName":"小七商行收款",
					"padd":60,
					"order":false,
					"fontSize":100
				},
				infoKey: {
					"time": "付款时间",
					"otherTime": '收款时间', //
					"name": "名字",
					"orderNumber": "交易单号",
					"money": '金额',
					"currentState": '支付状态',
					"payment": '支付方式',
					"shop": '商品', // 商品
					"merchantName": '商户名称', // 商户名称
					"institution": '收款机构', //收款机构
					"shopNumber": ' 商户单号', // 商单号
					"desc":"收款机构备注",
					"desc2":"支付方式备注",
					"miniName":"收款小程序",
					"padd":"边距",
					"order":"全部账单",
					"fontSize":"字体大小"
				}
			}
		},
		onLoad(options) {

			console.log(decodeURIComponent(options.info));
			const temp = JSON.parse(decodeURIComponent(options.info))
			this.info = {
				...this.info,
				...temp,
				
			}
			
			console.log(this.info.name);
			// 读取本地角色
			const list = uni.getStorageSync('roleList')
			if (list) this.roleList = list
		},
		methods: {
		
			saveRoleList() {
				uni.setStorage({
					key: 'roleList',
					data: this.roleList
				})
			},
			changeRl(url) {
				this.info.url = url
			},
			openAddPopup() {
				this.$refs.cradPopup.open()
			},

			bindClick(index) {
				this.roleList.splice(index, 1)
				uni.showToast({
					title: '删除成功',
					icon: 'none'
				})
				this.saveRoleList()
			},
			changeRole() {
				if (this.roleList.length > 0) {
					this.$refs.popup.open('center')
				} else {
					this.$refs.cradPopup.open()
				}
			},
			async onCradSubmitz(data) {
				// 头像在 ProfileEditPopup 内已处理，这里直接使用返回的地址
				this.roleList.push({
					...data,
					avatar: data.avatar
				})
				this.saveRoleList()
				this.info.url = data.avatar
			},
			onOrderSubmit(data) {
				const baseImg = this.info.url
				this.info = {
					...this.info,
					...data
				}
				this.info.url = baseImg
			},
			exitInfo() {
				this.$refs.orderPopup.open()
			},
			goBack() {
				uni.navigateBack();
			},
		}
	}
</script>

<style scoped>
	.list_rl {
		flex: 1;
		overflow: auto;
	}

	.roleList {
		display: flex;
		flex-direction: column;
		width: 600rpx;
		height: 800rpx;
	}
	
	.container {
		background-color: #eaeaea;
		display: flex;
		flex-direction: column;
		/* height: 100vh; */
	}
</style>
