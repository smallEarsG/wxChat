<template>
	<view class="container">
		<!-- 全局水印层 -->
		<WatermarkLayer />
		<view class="nav" @click="goBack" :style="{ paddingTop: statusBarHeight + 'px' }">
			<uni-icons class="close" type="closeempty" color="#000" size="22"></uni-icons>
			<view class="allOrder" v-if="info.order" :style="{ fontSize: (36 * fontScale) + 'rpx' }">全部账单</view>
		</view>

		<view class="content">
			<!-- <view class="line_b" /> -->

			<view class="order" :style="{ paddingLeft: info.padd + 'rpx', paddingRight: info.padd + 'rpx' }">

				<view class="order_top">
					<view class="avatar" @click="changeRole">
						<image :src="info.url||'/static/paySe.png'"></image>
					</view>
					<view class="name" :style="{ fontSize: (32 * fontScale) + 'rpx' }">
						扫二维码付款-{{info.name}}
					</view>
					<view class="num" @click="exitInfo" :style="{ fontSize: (56 * fontScale) + 'rpx' }">
						<!-- view class="sub" /> -->
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
							收款方备注
						</view>
						<view class="right">
							{{info.desc}}
						</view>
					</view>
					<view class="item" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">
							付款方留言
						</view>
						<view class="right">
							{{info.message}}
						</view>
					</view>
					<view class="item" v-if="info.payment!=''&&info.payment!=null" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">
							支付方式
						</view>
						<view class="right rightIcon">
							{{info.payment}}
							<uni-icons v-if=" info.payment == '零钱通'" type="info" size="18" color="#999"
								class="input-icon gthIcon" />
							<!-- <image v-if=" info.payment == '零钱通'" class="gthIcon" src="/static/gthIcon.png"></image> -->
						</view>
					</view>
					<view class="item" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">
							转账时间
						</view>
						<view class="right">
							{{info.time}}
						</view>
					</view>
					<view class="item" v-if="info.otherTime" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">
							收款时间
						</view>
						<view class="right">
							{{info.otherTime}}
						</view>
					</view>
					<view class="item" :style="{ fontSize: (28 * fontScale) + 'rpx' }">
						<view class="left">
							转账单号
						</view>
						<view class="right">
							{{info.orderNumber}}
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
					<view class="se_item" v-if="isGroup" @longpress="showGroup">
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
		<uni-popup ref="popup" type="bottom" background-color="#fff" border-radius="10px">
			<view class="roleList">
				<!-- <view class=""  v-for="itme in roleList" >
			<uni-list-chat :avatar-circle="true" :title="itme.nickname" :avatar="itme.avatar"
											:note="itme.description"></uni-list-chat>
			</view> -->
				<view class="list_rl">
					<uni-swipe-action v-if="roleList.length>0">
						<uni-swipe-action-item v-for="(item,index) in roleList" :right-options="options2"
							:auto-close="false" @click="bindClick(index)">

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
	</view>
</template>

<script>
	import {
		eadLocalFileToBase64
	} from "../../utils/tool.js"
	export default {
		data() {
			return {
				isGroup: true,
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
					"name": "转给G",
					"money": "-0.01",
					"time": "2025年6月13日 16:19:30",
					"orderNumber": "1000050001202506130129831495334",
					"otherTime": "2025年6月13日 16:20:17",
					"payment": "零钱通",
					"message":"留言",
					"currentState": "对方已收钱",
					"desc": "转账时间",
					"padd":60,
						"fontSize":100

				},
				infoKey: {
					"time": "付款时间",
					"otherTime": '收款时间', //
					"name": "名字",
					"orderNumber": "单号",
					"money": '金额',
					"message":"付款方留言",
					"currentState": '支付状态',
					"payment": '支付方式',
					"desc": "备注",
					"padd":"边距",
						"fontSize":"字体大小"
				}
			}
		},
		onLoad(options) {

			console.log(decodeURIComponent(options.info));
			const temp = JSON.parse(decodeURIComponent(options.info))
			this.info = {
				...this.info,
				...temp
			}
			console.log(this.info.name);
			const list = uni.getStorageSync('roleList')
			if (list) this.roleList = list
		},
		methods: {
			showGroup() {
				console.log("===1");
				this.isGroup = false
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
			changeRl(url) {
				// console.log(url);
				this.info.url = url
				this.saveTflist()
			},
			saveRoleList() {
				uni.setStorage({
					key: 'roleList',
					data: this.roleList
				})
			},

			async onCradSubmitz(data) {
				console.log(data);
				const baseImg = await eadLocalFileToBase64(data.avatar)

				this.roleList.push({
					...data,
					avatar: baseImg
				})
				this.saveRoleList()
				this.info.url = baseImg
				this.saveTflist()
			},
			changeRole() {
				if (this.roleList.length > 0) {
					this.$refs.popup.open('center')
				} else {
					this.$refs.cradPopup.open()
				}
			},
			// 从文件读取 tfList
			getTfListFromFile() {
				try {
					const fs = uni.getFileSystemManager();
					const filePath = plus.io.convertLocalFileSystemURL('_doc/data.json');
					
					try {
						const fileContent = fs.readFileSync(filePath, 'utf8');
						if (fileContent) {
							return JSON.parse(fileContent);
						}
					} catch (readError) {
						// 文件不存在或读取失败，尝试从旧存储迁移
						try {
							const oldList = uni.getStorageSync('tfList') || [];
							if (oldList.length > 0) {
								// 迁移旧数据到文件
								this.saveTfListToFile(oldList);
								return oldList;
							}
						} catch (e) {
							console.log('迁移数据失败:', e);
						}
					}
					return [];
				} catch (error) {
					console.error('读取文件失败:', error);
					// 降级到旧存储方式
					try {
						return uni.getStorageSync('tfList') || [];
					} catch (e) {
						return [];
					}
				}
			},
			// 保存 tfList 到文件
			saveTfListToFile(list) {
				try {
					const fs = uni.getFileSystemManager();
					const filePath = plus.io.convertLocalFileSystemURL('_doc/data.json');
					
					fs.writeFile({
						filePath: filePath,
						data: JSON.stringify(list),
						encoding: 'utf8',
						success: () => {
							console.log('记录已保存到文件');
						},
						fail: (err) => {
							console.error('保存文件失败:', err);
							// 降级到旧存储方式
							try {
								uni.setStorageSync('tfList', list);
							} catch (e) {
								console.error('降级存储也失败:', e);
							}
						}
					});
				} catch (error) {
					console.error('保存文件异常:', error);
					// 降级到旧存储方式
					try {
						uni.setStorageSync('tfList', list);
					} catch (e) {
						console.error('降级存储也失败:', e);
					}
				}
			},
			saveTflist() {
				// 从文件获取现有列表
				let list = this.getTfListFromFile();

				// 查找订单号匹配的元素
				const index = list.findIndex(item => {
					return item.info.orderNumber === this.info.orderNumber;
				});

				// 如果不存在，添加新元素
				if (index < 0) {
					list.push({
						type: 6,
						info: this.info
					});
				}
				// 如果存在，更新原有元素的info部分
				else {
					list[index].info = this.info;
				}

				// 保存到文件
				this.saveTfListToFile(list);
			},
			onOrderSubmit(data) {
				this.info = {
					...data
				}
				this.saveTflist()
			},
			exitInfo() {
				this.$refs.orderPopup.open()
			},
			goBack() {
				uni.navigateBack();
			},
		},
		computed: {
			fontScale() {
				return this.info.fontSize / 100;
			}
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

	.gthIcon {
		/* 	width: 30rpx;
		height: 30rpx; */
		margin-left: 10rpx;
	}

	.right {
		flex: 1;
		word-wrap: break-word;
		overflow-wrap: break-word;
		overflow: auto;

	}

	.rightIcon {
		display: flex;
		align-items: center;
	}

	.footer {
		width: 100%;
		flex: 1;
		font-size: 24rpx;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		flex-direction: column;
		color: #a2a2a2;
		min-height: 170rpx;
		padding-bottom: 60rpx;
		/* position: absolute;
	bottom: 0rpx; */
	}

	.serivce {
		margin-top: 20rpx;
		background-color: #fff;
		padding: 0 60rpx;
		box-sizing: border-box;
	}

	.serivce_bx {
		border-top: 1px solid #eaeaea;
		display: flex;
		align-items: center;
		padding: 35rpx 0;
		box-sizing: border-box;
	}

	.se_title {
		font-size: 26rpx;
		padding-top: 30rpx;
		padding-bottom: 35rpx;
		font-weight: 500;
		box-sizing: border-box;
	}

	.se_item {
		font-size: 26rpx;
		color: #5c6e96;
		flex: 1;
		display: flex;
		align-items: center;
		/* margin: 0 40rpx; */
	}

	.se_icon {}

	.cordIcon {
		width: 38rpx;
		height: 38rpx;
		position: relative;
		top: 4rpx;
		margin-right: 10rpx;
	}

	.skIcon {
		width: 36rpx;
		height: 36rpx;
		position: relative;
		top: 4rpx;
		margin-right: 10rpx;
	}

	.wticon {
		width: 30rpx;
		height: 30rpx;
		margin-right: 14rpx;
		position: relative;
		top: 6rpx;
	}

	.order_info {
		margin-top: 40rpx;
		padding-bottom: 60rpx;
	}

	.sub {
		height: 8rpx;
		width: 26rpx;
		background-color: #000
	}

	.num {
		font-family: 'WeChat Sans Std';
		display: flex;
		align-items: center;
		margin-top: 40rpx;
		/* font-weight: bold; */
		font-size: 56rpx;
		/* font-family: ; */

	}

	.name {
		margin-top: 30rpx;
		font-size: 32rpx;

		text-align: center;
	}

	.left {
		color: #9b9b9b;
		width: 170rpx;
	}

	.item {
		flex: 1;
		display: flex;
		font-size: 28rpx;
		margin-bottom: 20rpx;
	}

	.order_info {
		display: flex;
		flex-direction: column;
	}

	.line_b {
		width: 100%;
		height: 1px;
		background-color: #fafafa;
		transform: scaleY(0.01);
	}

	.line {
		margin-top: 88rpx;
		width: 100%;
		height: 1px;
		background-color: #efefef;
		transform: scaleY(0.6);
	}

	.avatar {
		width: 94rpx;
		height: 94rpx;
		overflow: hidden;
		margin-top: 40rpx;
		border-radius: 50px;
	}

	.avatar image {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.order_top {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.order {
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		background-color: #fff;
		padding: 0 60rpx;
	}

	.close {
		/* background-color: aqua; */
		/* padding-top: 160px; */

		padding-left: 20rpx;
		position: relative;
		top: 30rpx;
		transform: scale(0.8);
	}

	.nav {
		height: 86rpx;
		/* background-color: #5c6e96; */
		background-color: #fff;
		/* overflow: hidden; */
		position: relative;
	}
	.allOrder{
		position: absolute;
		right: 40upx;
		font-size: 36upx;
		bottom:  10upx;
	}
	.container {
		background-color: #eaeaea;
		display: flex;
		flex-direction: column;
		height: 100vh;
	}

	.content {
		flex: 1;
		display: flex;
		flex-direction: column;

		/* position: relative; */
	}
</style>