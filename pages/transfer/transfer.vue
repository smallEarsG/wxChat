<template>
	<view class="container">
		<view class="nav" @click="goBack" :style="{ paddingTop: statusBarHeight + 'px' }">
			<uni-icons class="close" type="closeempty" color="#000" size="22"></uni-icons>
		</view>
		<view class="content">
			<view class="order">
				<view class="order_top">
					<view class="avatar" @click="changeRole">
						<image :src="info.url||'/static/paySe.png'"></image>
					</view>
					<view class="name">
						转账-{{info.transferName}}
					</view>
					<view class="num" @click="exitInfo">
						<view class="sub" />
						<text class="num_txt"> {{info.num}}</text>
					</view>
					<view class="line" />
				</view>

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
							转账说明
						</view>
						<view class="right">
							微信转账
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
							收款时间
						</view>
						<view class="right">
							{{info.otherTime}}
						</view>
					</view>
					<view class="item">
						<view class="left">
							收款方式
						</view>
						<view class="right rightIcon">
							零钱通 <image class="gthIcon" src="/static/gthIcon.png"></image>
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


			</view>
			<view class="serivce">
				<view class="se_title">
					账单服务
				</view>
				<view class="serivce_line">
					<view class="serivce_bx">
						<view class="se_item">
							<view class="se_icon ">
								<image class="wticon" src="/static/wticon.png" mode=""></image>
							</view>
							对订单有疑惑
						</view>
						<view class="se_item">
							<view class="se_icon ">
								<image class="chatIcon" src="/static/chatIcon.png" mode=""></image>
							</view>
							定位到聊天位置
						</view>
					</view>
					<view class="serivce_bx">
						<view class="se_item">
							<view class="se_icon ">
								<image class="startIcon" src="/static/startIcon.png" mode=""></image>
							</view>
							申请转账电子凭证
						</view>
						<view class="se_item">
							<view class="se_icon ">
								<image class="transferIcon" src="/static/transferIcon.png" mode=""></image>
							</view>
							查看往来转账
						</view>
					</view>
				</view>

			</view>


			<view class="footer">
				本服务由财付通提供
			</view>
		</view>
		<uni-popup ref="popup" type="bottom" background-color="#fff" border-radius="10px">
			<view class="roleList">
				<!-- <view class=""  v-for="itme in roleList" >
				<uni-list-chat :avatar-circle="true" :title="itme.nickname" :avatar="itme.avatar"
												:note="itme.description"></uni-list-chat>
				</view> -->
				<view class="list_rl" >
					<uni-swipe-action v-if="roleList.length>0">
						<uni-swipe-action-item v-for="item in roleList" :right-options="options2"
							:auto-close="false" @click="bindClick">
							
							<view class="content-box" @click="changeRl(item.avatar)">
								<uni-list-chat :avatar-circle="true" :title="item.nickname" :avatar="item.avatar"
									:note="item.description" :clickable="true" @click="changeRl(item.avatar)"></uni-list-chat>
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
	export default {
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
					"time": "2025年6月3日 21:23:40",
					"orderNumber": "1000050001202506030822269810799",
					"otherTime": "2025年6月3日 21:42:26",
					"transferName": "转给莴笋批发223档口",
					"num": '88.00'
				},
				infoKey: {
					"time": "转账时间",
					"orderNumber": '订单编号',
					"otherTime": '收款时间',
					"transferName": '用户名',
					"num": '金额'
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
			// 读取本地角色
			const list =  uni.getStorageSync('roleList')
			if(list) this.roleList = list
		},
		methods: {
			saveRoleList(){
				uni.setStorage({
					key: 'roleList',
					data: this.roleList
				})
			},
			saveTflist() {
			  // 获取现有列表
			  let list = uni.getStorageSync('tfList') || [];
			  
			  // 查找订单号匹配的元素
			  const index = list.findIndex(item => {
			    return item.info.orderNumber === this.info.orderNumber;
			  });
			  
			  // 如果不存在，添加新元素
			  if (index < 0) {
			    list.push({
			      type: 0,
			      info: this.info
			    });
			  } 
			  // 如果存在，更新原有元素的info部分
			  else {
			    list[index].info = this.info;
			  }
			  
			  // 保存更新后的列表（修正参数传递方式）
			  uni.setStorageSync('tfList', list);
			},
			changeRl(url){
				// console.log(url);
				this.info.url = url
				this.saveTflist()
			},
			openAddPopup(){
				this.$refs.cradPopup.open()
			},
			eadLocalFileToBase64(filePath) {
			 return new Promise((resolve, reject) => {
			     // 检查是否在5+环境中（修改此处）
			     if (typeof plus !== 'undefined') {
			       // 解析本地文件URL
			       plus.io.resolveLocalFileSystemURL(filePath, function(entry) {
			         // 获取文件对象
			         entry.file(function(file) {
			           // 创建文件读取器
			           var reader = new plus.io.FileReader();
			           
			           // 读取成功回调
			           reader.onloadend = function(e) {
			             // 获取Base64编码结果
			             var base64Data = e.target.result;
			             resolve(base64Data);
			           };
			           
			           // 读取失败回调
			           reader.onerror = function(err) {
			             reject(new Error('文件读取失败: ' + err.message));
			           };
			           
			           // 以DataURL方式读取文件（自动转换为Base64）
			           reader.readAsDataURL(file);
			         }, function(err) {
			           reject(new Error('获取文件对象失败: ' + err.message));
			         });
			       }, function(err) {
			         reject(new Error('解析文件路径失败: ' + err.message));
			       });
			     } else {
			       reject(new Error('当前环境不支持plus.io'));
			     }
			   });
			},
			bindClick(con) {
				console.log(con.index);
				this.roleList.splice(con.index, 1)
				uni.showToast({
					title: '删除成功',
					icon: 'none'
				})
			},
			changeRole() {
				if (this.roleList.length > 0) {
					this.$refs.popup.open('center')
				} else {
					this.$refs.cradPopup.open()
				}
			},
		  async onCradSubmitz(data) {
				console.log(data);
			 	const baseImg = await this.eadLocalFileToBase64(data.avatar)
			   
				this.roleList.push({...data,avatar:baseImg})
				this.saveRoleList()
				this.info.url = baseImg
				this.saveTflist()
			},
			onOrderSubmit(data) {
				console.log(data);
				const baseImg = this.info.url 
				this.info = {
					...this.info,
					...data
				}
				this.info.url = baseImg
				this.saveTflist()
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
	.list_rl{
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
		width: 30rpx;
		height: 30rpx;
		margin-left: 16rpx;
		position: relative;
		top:-4rpx ;
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
		padding: 0 40rpx;
		box-sizing: border-box;
	}

	.serivce_line {
		border-top: 1px solid #eaeaea;
	}

	.serivce_bx {
		display: flex;
		align-items: center;
		margin: 35rpx 0;
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

	.startIcon {
		width: 32rpx;
		height: 32rpx;
		margin-right: 12rpx;
		position: relative;
		top: 6rpx;
	}

	.chatIcon {
		width: 32rpx;
		height: 32rpx;
		margin-right: 14rpx;
		position: relative;
		top: 6rpx;
	}

	.transferIcon {
		width: 34rpx;
		height: 34rpx;
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
		display: flex;
		align-items: center;
		margin-top: 40rpx;
		font-weight: 500;
		font-size: 56rpx;
	}
	.num_txt{
		font-variant-numeric: tabular-nums; /* 强制使用等宽数字 */
		font-family:-apple-system, 'SF Pro Display', 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
	}
	.name {
		margin-top: 30rpx;
		font-size: 32rpx;
	}
	.left {
		color: #9b9b9b;
		width: 80px;
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

	.line {
		margin-top: 92rpx;
		width: 100%;
		height: 1px;
		background-color: #eaeaea;
	}

	.avatar {
		width: 92rpx;
		height: 92rpx;
		overflow: hidden;
		margin-top: 90rpx;
		border-radius: 50%;
	}

	.avatar image {
		width: 100%;
		height: 100%;
		object-fit:cover;
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
		padding: 0 40rpx;
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
		background-color: #fff;
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