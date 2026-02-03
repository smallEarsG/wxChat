<template>
	<view class="container">
		<!-- 全局水印层 -->
		<WatermarkLayer />
		<view class="custom-header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="nav_left" @click="goBack">
				<uni-icons type="left" size="24"></uni-icons>
			</view>
			<view class="nav_title">账单详情</view>
		
		</view>
		<view class="content">
			<view class="info">
				<view class="bg" />
				<view class="avatar" @click="changeRole">
					<image :src="info.avatar||'/static/zfb/dd.jpg'"></image>
					
				</view>
				<view class="name">
					{{info.name}}
					<uni-icons type="right" style="margin-left: 6upx;" size="13" color="#878787"></uni-icons>
				</view>
				<view class="money" @click="exitInfo">
					<view class="sub"/>
					{{info.money}}
				</view>
				<view class="transaction">
					<text v-if="!info.showAutoDeduction">交易成功</text>
					<text v-else>自动扣款成功</text>
				</view>
				<view class="orderInfo">
					<view v-if="info.showAutoDeduction" style="width: 100%;">
						<view class="info-item autoItme">
							<view class="left">自动扣款管理</view>
							<view class="right autoRight"> 滴滴出行免密支付</view>
						</view>
						<view class="item-line" />
					</view>
					<view class="info-item">
						<view class="left">支付时间</view>
						<view class="right">{{info.createTime}}</view>
					</view>
					<view class="info-item">
						<view class="left">付款方式</view>
						<view class="right" style="display: flex; align-items: center;">{{info.payFun}} <uni-icons type="right" style="margin-left: 10upx;" size="13" color="#878787"></uni-icons></view>
					</view>
					<view class="info-item">
						<view class="left">商品说明</view>
						<view class="right">{{info.desc}}</view>
					</view>
					<view class="info-item" v-if="info.rideTime">
						<view class="left">乘车时间</view>
						<view class="right">{{info.rideTime}}</view>
					</view>
					<view class="info-item" v-if="info.showReward">
						<view class="left">支付奖励</view>
						<view class="right jfbg" > <image style="width: 34upx;margin-right: 10upx;"  src="/static/zfb/jf.png" mode="widthFix"></image>立即领取{{info.points}}积分 </view>
					</view>
					<view class="info-item" v-if="info.serviceProvider">
						<view class="left">收款方全称</view>
						<view class="right">{{info.serviceProvider}}</view>
					</view>
					<view class="info-item">
						<view class="left">服务详情</view>
					</view>
					<view class="blue-tip serverInfo" @click="openServerInfoEdit">
						<view class="blue-tip-left">
							<image style="width: 50upx; border-radius: 50%;margin-right: 14upx;" :src="serverInfo.icon" mode="widthFix"></image> {{serverInfo.name}}
						</view>
						<view class="blue-tip-right">
							进入小程序 <uni-icons type="right" size="12" style="font-weight: 400;" color="#878787;"></uni-icons>
						</view>
					</view>
					<!-- <view class="info-item">
						<view class="left">推荐服务</view>
					</view>
					<view class="blue-tip"  style="padding-top: 36upx;padding-bottom: 36upx;">
						打车开发票，一键自动同步 <uni-icons type="right" size="12" style="font-weight: 400;" color="#0f5086"></uni-icons>
					</view> -->
					<view class="moreBtn" v-if="!OrderNum" @click="showOrderNum">
						更多  <uni-icons type="down" style="margin-left: 10upx;" size="13" color="#878787"></uni-icons>
					</view>
					<view class="info-item" v-if="OrderNum">
						<view class="left">订单号</view>
						<view class="right">{{info.orderNumber}}</view>
					</view>
					<view class="info-item" v-if="OrderNum">
						<view class="left">商家订单号</view>
						<view class="right">{{info.shopNumber}}</view>
					</view>
				</view>
			</view>
			<view class="Bill">
				<view class="title">
					账单管理
				</view>
				<view class="yellow-tip">
					为您统计了最近的花费趋势，去看看分析吧~
					<!-- <view style="display: flex; align-items: center;">
						<image style="width: 100upx;margin-right: 10upx;" src="/static/zfb/c_icon.png" mode="widthFix"></image> 你因为这笔消费解锁了“市内交通”贴纸
					</view> -->
					<uni-icons type="right" color="#b88f43" size="12"></uni-icons>
				</view>
				<view class="bill-item" @click="openBillEdit">
					<view class="bill-item-left">账单分类</view>
					<view class="bill-item-right">
						{{ billData.category || '其他' }} <uni-icons type="right" style="margin-left: 10upx;" color="#878787" size="12"></uni-icons>
					</view>
				</view>
				<view class="bill-item" @click="openBillEdit">
					<view class="bill-item-left">标签和备注</view>
					<view class="bill-item-right">
						{{ billData.tags || '添加' }}
						 <uni-icons type="right" style="margin-left: 10upx;" color="#878787" size="12"></uni-icons>
					</view>
				</view>
				<view class="bill-item" @click="openBillEdit">
					<view class="bill-item-left">计入收支</view>
					<view class="bill-item-right">
						<switch :checked="billData.isIncome" style="transform:scale(0.6)"/>
					</view>
				</view>
				<view class="line"/>
				<view class="blue_line" >
					<view class="line-item-line">
						<view class="line-content">
							<image class="alipayIcon" src="/static/alipay/alipay_0.png" mode="widthFix" />
							联系商家
						</view>
						<view class="line-content">
								<image class="alipayIcon" src="/static/alipay/alipay_1.png" mode="widthFix" />
								查看来往记录
						</view>
					</view>
					<view class="line-item-line">
						<!-- <view class="line-content">
								<image class="alipayIcon" src="/static/alipay/alipay_3.png" mode="widthFix" />
							往来流水证明
						</view> -->
						<view class="line-content">
								<image class="alipayIcon" src="/static/alipay/alipay_4.png" mode="widthFix" />
							申请电子回单
						</view>
						<view class="line-content">
								<image class="alipayIcon" src="/static/alipay/alipay_5.png" mode="widthFix" />
							对次订单有疑惑
						</view>
					</view>
					<view class="line-item-line">
					
						<!-- <view class="line-content">
								<image class="alipayIcon" src="/static/alipay/alipay_6.png" mode="widthFix" />
							转账凭证
						</view> -->
					</view>
				</view>
			</view>
		
		</view>
		<!-- <view class="foor">
			<view class="btn">再转一笔</view>
		</view> -->
		<uni-popup ref="popup" type="bottom" background-color="#fff" border-radius="10px">
			<view class="roleList">
				
				<view class="list_rl">
					<uni-swipe-action v-if="roleList.length>0">
						<uni-swipe-action-item v-for="(item,index) in roleList" :right-options="options2" :auto-close="false"
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
					<button @click="openAddPopup">添加角色</button>
				</view>
			</view>
		</uni-popup>
		<EditableFormPopup ref="orderPopup" :value="info" :fieldLabels="infoKey" @submit="onOrderSubmit" />
		<ProfileEditPopup ref="cradPopup" module="alipay" @submit="onCradSubmitz"></ProfileEditPopup>
		<BillEditPopup ref="billEditPopup" :value="billData" @submit="onBillEditSubmit" />
		<ServerInfoEditPopup ref="serverInfoEditPopup" @submit="onServerInfoSubmit" />
	</view>
</template>

<script>
	import BillEditPopup from "../../components/BillEditPopup/BillEditPopup.vue"
	import ServerInfoEditPopup from "../../components/ServerInfoEditPopup/ServerInfoEditPopup.vue"
	import { getBillById, createBill, updateBill, getAvatarList, uploadAvatar, createAvatar, deleteAvatar } from "@/api"
	export default {
		components: {
			BillEditPopup,
			ServerInfoEditPopup
		},
		async onLoad(options){
			// 优先根据 billId 从云端加载账单详情
			const rawId = options && (options.billId || options.id);
			if (rawId !== undefined && rawId !== null && rawId !== '') {
				this.id = String(rawId);
				try {
					const res = await getBillById(this.id);
					const bill = res && res.data ? res.data : res;
					if (bill && bill.billDetail) {
						const detail = typeof bill.billDetail === 'string'
							? JSON.parse(bill.billDetail)
							: bill.billDetail;
						this.info = { ...this.info, ...(detail || {}) };
					}
				} catch (e) {
					uni.showToast({ title: '账单不存在', icon: 'none' });
					setTimeout(() => uni.navigateBack(), 300);
					return;
				}
			} else if (options && options.info) {
				// 兼容旧逻辑：直接通过路由参数传入 info
				const temp = JSON.parse(decodeURIComponent(options.info))
				this.info = {
					...this.info,
					...temp,
			
				}
			}
			const list = uni.getStorageSync('roleList')
			if (list) this.roleList = list
			this.loadAvatarList()
		},
		data() {
			return {
				id: null,
				options2: [{
						text: '删除',
						style: {
							backgroundColor: '#F56C6C'
						}
					}
				
				],
				statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
				roleList: [],
				info:{
					avatar:'',
					name:'测试',
					money:'1880.00',
					createTime:'2025-6-25 16:59:17',
					rideTime:'2025-6-25 16:59:17',
					points:15,
					serviceProvider:'滴滴出行科技有限公司',
					showReward:false,
					showAutoDeduction:false,
					payFun:'余额宝',
					desc:'转账',
					herAccount:'阿里云计算有限公司',
					orderNumber:'2025042420004001110087',
					shopNumber:'HBX2000400111008'
				},
				infoKey:{
					name:'转账用户',
					money:'金额',
					createTime:'创建时间',
					rideTime:'乘车时间',
					points:'积分数量',
					serviceProvider:'服务方全称',
					showReward:'显示支付奖励',
					showAutoDeduction:'显示自动扣款',
					payFun:'付款方式',
					desc:'备注',
					herAccount:'对方账号',
					orderNumber:'订单号',
					shopNumber:'商家订单号'
				},
				billData: {
					category: '其他',
					tags: '',
					isIncome: false
				},
				serverInfo: {
					icon: '/static/zfb/dd.jpg',
					name: '滴滴打车'
				},
				OrderNum:false
				
			}
		},
		methods: {
			// 从云端加载头像列表（alipay 模块）
			async loadAvatarList() {
				try {
					const userId = uni.getStorageSync('userId');
					if (!userId) {
						this.roleList = [];
						return;
					}
					const result = await getAvatarList(userId, 'alipay');
					let avatarList = [];
					if (result && result.data && Array.isArray(result.data)) {
						avatarList = result.data;
					} else if (Array.isArray(result)) {
						avatarList = result;
					}
					this.roleList = avatarList.map(item => ({
						avatar: item.avatarUrl || item.avatar,
						nickname: item.name || '',
						description: item.description || '@支付宝',
						id: item.id
					}));
				} catch (e) {
					console.error('加载头像列表失败:', e);
					this.roleList = [];
				}
			},
			showOrderNum(){
				this.OrderNum = true
			},
			openAddPopup() {
				this.$refs.cradPopup.open()
			},
			goBack() {
				uni.navigateBack();
			},
			async bindClick(index) {
				const item = this.roleList[index];
				if (!item) return;
				
				if (item.id) {
					try {
						uni.showLoading({ title: '删除中...', mask: true });
						await deleteAvatar(item.id);
						await this.loadAvatarList();
						uni.hideLoading();
						uni.showToast({
							title: '删除成功',
							icon: 'success'
						});
					} catch (error) {
						console.error('删除头像失败:', error);
						uni.hideLoading();
						uni.showToast({
							title: error.message || '删除失败，请重试',
							icon: 'none'
						});
					}
				} else {
					this.roleList.splice(index, 1);
					this.saveRoleList();
					uni.showToast({
						title: '删除成功',
						icon: 'success'
					});
				}
			},
			async changeRl(url) {
				// 如为本地路径，先上传头像到云端
				const isLocalPath = url && !url.startsWith('http://') && !url.startsWith('https://');
				if (isLocalPath) {
					try {
						uni.showLoading({ title: '上传头像中...', mask: true });
						const userId = uni.getStorageSync('userId');
						if (!userId) throw new Error('用户未登录');
						const result = await uploadAvatar(url, userId, 'alipay', this.info.name || '');
						url = result.avatarUrl;
					} catch (error) {
						console.error('上传头像失败:', error);
						uni.showToast({
							title: '上传头像失败',
							icon: 'none'
						});
					} finally {
						uni.hideLoading();
					}
				}
				
				this.info.avatar = url;
				this.saveBillToServer();
			},
			onOrderSubmit(data) {
				const baseImg = this.info.avatar
				this.info = {
					...this.info,
					...data
				}
				this.info.avatar = baseImg
				this.saveBillToServer()
			},
			// 保存到账单服务（create 或 update）
			async saveBillToServer() {
				try {
					const userId = uni.getStorageSync('userId');
					if (!userId) {
						console.warn('用户未登录，跳过保存账单');
						return;
					}
					
					const billDetail = JSON.stringify(this.info);
					
					if (this.id === null || this.id === undefined) {
						// 模板五：billType = 5
						const billData = {
							platform: 'alipay',
							billType: 5,
							billDetail,
							createUserId: userId,
							remark: this.info.desc || this.info.name || ''
						};
						const result = await createBill(billData);
						if (result && result.data && result.data.id) {
							this.id = result.data.id;
						}
					} else {
						const updateData = {
							billDetail
						};
						await updateBill(this.id, updateData);
					}
				} catch (e) {
					console.error('保存账单失败:', e);
				}
			},
			exitInfo() {
				this.$refs.orderPopup.open()
			},
			changeRole() {
				if (this.roleList.length > 0) {
					this.$refs.popup.open('center')
				} else {
					this.$refs.cradPopup.open()
				}
			},
			saveRoleList() {
				uni.setStorage({
					key: 'roleList',
					data: this.roleList
				})
			},
			async onCradSubmitz(data) {
				try {
					uni.showLoading({ title: '保存中...', mask: true });
					
					const userId = uni.getStorageSync('userId');
					if (!userId) {
						throw new Error('用户未登录');
					}
					
					// 如果头像是本地路径，先上传到云端
					let avatarUrl = data.avatar;
					const isLocalPath = avatarUrl && !avatarUrl.startsWith('http://') && !avatarUrl.startsWith('https://');
					
					if (isLocalPath) {
						const uploadResult = await uploadAvatar(avatarUrl, userId, 'alipay', data.nickname || this.info.name || '');
						avatarUrl = uploadResult.avatarUrl;
					}
					
					// 创建头像记录到云端
					await createAvatar({
						userId: userId,
						module: 'alipay',
						avatarUrl: avatarUrl,
						name: data.nickname || this.info.name || ''
					});
					
					// 刷新头像列表
					await this.loadAvatarList();
					
					// 更新当前账单的头像
					this.info.avatar = avatarUrl;
					await this.saveBillToServer();
					
					uni.hideLoading();
					uni.showToast({
						title: '保存成功',
						icon: 'success'
					});
				} catch (error) {
					console.error('保存头像失败:', error);
					uni.hideLoading();
					uni.showToast({
						title: error.message || '保存失败，请重试',
						icon: 'none'
					});
				}
			},
			
			openBillEdit() {
				this.$refs.billEditPopup.open();
			},
			
			onBillEditSubmit(data) {
				console.log('账单编辑提交:', data);
				this.billData = { ...this.billData, ...data };
				uni.showToast({
					title: '保存成功',
					icon: 'success'
				});
			},
			
			openServerInfoEdit() {
				this.$refs.serverInfoEditPopup.open(this.serverInfo);
			},
			
			onServerInfoSubmit(data) {
				console.log('服务详情编辑提交:', data);
				this.serverInfo = { ...this.serverInfo, ...data };
				uni.showToast({
					title: '保存成功',
					icon: 'success'
				});
			},
		}
	}
</script>

<style>
	.autoItme{
	/* s */
		padding-bottom: 30upx;
		
	}
	.autoRight{
		margin-left: 30upx;
		color: #25397f;
		
	}
	.blue-tip-right{
		color:#878787 ;
		font-weight: normal;
		font-size: 24upx;
	}
	.blue-tip-left{
		display: flex;
		align-items: center;
		font-size: 24upx;
		font-weight: normal;
		color: #333;
		/* justify-content: center; */
	}
	.serverInfo {
		cursor: pointer;
		transition: background-color 0.2s;
	}
	.serverInfo:active {
		background-color: #e8ecf5;
	}
	/* 顶部栏 - 固定在顶部 */
	.custom-header {
		display: flex;
		/* justify-content: space-between; */
		align-items: center;
		height: 100rpx;
		padding: 0 30rpx;
		/* border-bottom: 2rpx solid #e0e0e0; */
	
	}
	.nav_left{
		
	}
	.nav_title {
		display: flex;
		flex-direction: column;
		align-items: center;
		/* font-weight: 500; */
		font-size: 38upx;
		margin-left: 30upx;
	}
	.jfbg{
		display: flex; 
		color: #eb6621;
		/* align-items: center; */
		background-color: #fff0dc;
		/* width: 200upx !important; */
		flex: none !important;
		padding: 8upx 20upx;
		border-radius:60upx
		
	}
	.moreBtn{
		margin-top: 20upx;
		color: #878787;
		font-size: 28upx;
	}
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
	.btn{
		background-color:#007aff;
		color: #fff;
		font-size: 36upx;
		text-align: center;
		height: 80upx;
		font-weight: 500;
		line-height: 80upx;
	}
	.foor{
		padding: 20upx;
		padding-bottom: 40upx;
		background-color: #fff;
	}
	.alipayIcon{
		width: 38upx;
		margin-right: 17upx;
	}
	.line-content{
		display: flex;
		flex: 1;
		color: #25397f;
		align-items: center;
	}
	.line-item-line{
		padding:  30upx 0;
		display: flex;
		align-items: center;
		font-size: 28upx;
	}
	.blue_line{
		display: flex;
		flex-direction: column;
		
	}
	.line{
		width: 100%;
		height: 1px;
		background-color: #878787;
		transform: scaleY(0.1);
		margin-top: 20upx;
	}
	.bill-item-right{
		color: #878787;
	}
	.bill-item{
		display: flex;
		justify-content: space-between;
		padding: 20upx 0 ;
		font-size: 28upx;
		margin-top: 20upx;
		cursor: pointer;
		transition: background-color 0.2s;
	}
	
	.bill-item:active {
		background-color: #f5f5f5;
		border-radius: 8upx;
	}
	.title{
		font-size: 30upx;
		font-weight: bold;
		padding: 20upx 0;
	}
	.Bill{
		display: flex;
		background-color: #fff;
		flex-direction: column;
		padding: 20upx;
		margin-top: 20upx;
		overflow:hidden;
		border-radius: 20upx;
		margin-bottom: 30upx;
	}
	.yellow-tip,
	.blue-tip {
		display: flex;
		justify-content: space-between;
		width: 100%;
		padding-top : 26upx ;
		padding-bottom: 26upx;
		padding-left:30upx;
		padding-right: 20upx;
		box-sizing: border-box;
		align-items: center;
		background-color: #f6f7fb;
		/* padding: 20upx 30upx; */
		border-radius: 14upx;
		font-size: 26upx;
		font-weight: 600;
		color: #25397f;
		/* background-color: red; */
	}
	.yellow-tip{
		font-size: 26upx;
		font-weight: 400;
		background-color: #fbf8f1;
		color: #b88f43;
	}
	.left{
		width: 170upx;
		color: #878787;
	}
	.right{
		flex: 1;
		word-wrap: break-word;
		overflow-wrap: break-word;
		overflow: auto;
	}
	.info-item {
		padding: 20upx 0upx;
		display: flex;
		/* justify-content: space-between; */
		/* background-color: antiquewhite; */
		width: 100%;
		font-size: 28upx;
	}

	.orderInfo {
		margin-top: 30upx;
		position: relative;
		z-index: 1;
		display: flex;
		align-items: center;
		flex-direction: column;
		padding: 0 30upx;
		width: 100%;
		/* background-color: aqua; */
		box-sizing: border-box;
	}
	.item-line{
		width: 100%;
		height: 1px;
		background-color: #9d9d9d;
		transform: scaleY(0.09);
	}
	.transaction {
		position: relative;
		z-index: 1;
		margin: 25upx 0 ;
		font-size: 30upx;
	}

	.money {
		position: relative;
		z-index: 1;
		font-size: 58upx;
		font-family: 'WeChat Sans Std';
		/* font-weight: 500; */
		display: flex;
		align-items: center;
	}
	.sub{
		width: 20upx;
		height: 8upx;
		background-color: black;
		margin-right: 6upx;
	}

	.name {
		position: relative;
		z-index: 1;
		font-size: 30upx;
		padding: 25upx 0;
		display: flex;
		align-items: center;
		
	}

	.bg {
		background-color: #fff;
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		top: 35upx;
		z-index: 0;
	}

	.avatar {
		width: 92rpx;
		height: 92rpx;
		overflow: hidden;
		border-radius: 50%;
	}

	.avatar image {
		width: 100%;
		height: 100%;
	}

	.info {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		background-color: #fff;
		padding:40upx 0 ;
		border-radius: 20upx;
		overflow: hidden;
		padding-bottom: 30upx;
	}
	.content{
		padding: 20upx;
		flex: 1;
		overflow: auto;
	}
	.container {
		height: 100vh;
		background-color: #eaeaea;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		position: relative;
		
	}
</style>