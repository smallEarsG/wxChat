<template>
	<view class="customer-assistant">
		<!-- 全局水印层 -->
		<!-- <WatermarkLayer /> -->
		<image src="/static/chat/h1.png" mode="widthFix"></image>
		
		<view class="main-warp">
		<!-- 	 <view style="background-color: #3175da;height: 10rpx;">
			 	
			 </view> -->
			 <image src="/static/chat/h9.png" mode="widthFix"></image>
			<view class="center-warp">
			
				<!-- 获客情况 -->
				<view class="usage-scenario" style="margin-top: 4rpx;">
					<view class="client-top">
						<view class="section-title">获客情况</view>
						<image class="right-icon" src="/static/chat/li_right_icon.png"></image>
					</view>
					<view class="client-main" @click="showClient">
						<view class="client-warp">
							<view class="num-text">{{clientInfo.NewAddToday}}</view>
							<view>今日新增客户</view>
						</view>
						<view class="client-warp">
							<view class="num-text">{{clientInfo.CumulativeNew}}</view>
							<view>累计新增客户</view>
						</view>
						<view class="client-warp">
							<view class="num-text num-with-icon">
								{{clientInfo.Remainder}}
								<image class="feel" src="/static/chat/h3.png" mode="widthFix"></image>
							</view>
							<view class="text-bottom">
								剩余使用量
								<image src="/static/chat/g_ionc.png" ></image>
							</view>
						</view>
					</view>
					<view style="background-color: #d6d6d6;height: 2rpx;transform: scaleY(0.1);"></view>
					<view class="client-bottom">
						<view style="font-size: 30rpx;">购买使用量</view>
						<image style="width: 220rpx;margin-right: 10rpx;" src="/static/chat/vip_buy.png" mode="widthFix"></image>
					</view>
				</view>
				<!-- 获客链接 -->
				<view class="usage-scenario" style="margin-top: 20rpx;padding-bottom: 0;">
					<view class="client-top" style="padding-top:0">
						<view class="section-title" style="margin-bottom:24rpx">获客链接</view>
						<image style="width: 30rpx;" src="/static/chat/p5.png" mode="widthFix"></image>
					</view>
					<view class="add-warp" @click="editLinkName">
						<image style="width: 70rpx;" src="/static/chat/h2.png" mode="widthFix"></image>
						<view>{{ linkDisplay.name }}</view>
					</view>
					<view class="all-warp" style="font-size: 24rpx;" @click="goLinkList">查看全部
						<view class="circle" />
		
						<text @click.stop="editLinkCount">{{ linkDisplay.count }}</text><uni-icons type="right" size="12" color="#8c8c8c" style=" margin-left:-1px ;"></uni-icons>
					</view>
				</view>
				<!-- 更多功能 -->
				<view class="usage-scenario" style="margin-top: 20rpx" >
					<view class="section-title" style="margin-top: 20rpx;margin-bottom: 14rpx;">更多功能</view>
		
					<view class="acquisition-methods more-warp">
						<!-- 第一项 -->
						<view class="method-item">
							<view class="item-right">
								<image class="left-icon share-icon" src="/static/chat/h6.png" mode="widthFix"></image>
								<text class="right_text">自动跳过成员异常账号</text>
							</view>
							<image class="right-icon" src="/static/chat/li_right_icon.png"></image>
						</view>
						<view class="skip-warp">
							<view class="skip-item" @click="editSkipCount('today')">
								今日跳过<text style=""><span >{{ skipCount.today }}</span>次</text>
							</view>
							<view class="skip-item" @click="editSkipCount('total')">
								累计跳过<text ><span >{{ skipCount.total }}</span>次</text>
							</view>
						</view>
						<!-- 第二项 -->
						<view class="method-item">
							<view class="item-right">
								<image class="left-icon" src="/static/chat/h7.png" mode="widthFix"></image>
								<text class="right_text">提升广告有效率</text>
							</view>
		
							<image class="right-icon" src="/static/chat/li_right_icon.png" ></image>
						</view>
						<!-- 第三项 -->
						<view class="method-item">
							<view class="item-right">
								<image class="left-icon" src="/static/chat/h8.png" mode="widthFix"></image>
								<text class="right_text">通过API使用</text>
							</view>
		
							<image class="right-icon" src="/static/chat/li_right_icon.png"></image>
						</view>
					</view>
				</view>
				<view class="footer-container">
					<view class="footer-link">使用指引</view>
				</view>
			</view>
		</view>
		<EditableFormPopup ref="orderPopup" :value="clientInfo" :fieldLabels="clientKey" @submit="onOrderSubmit" />
		<ProfileEditPopup ref="filePopup" @submit="onSubmit"></ProfileEditPopup>
		<!-- 左上返回 -->
		<view class="back-btn" @click="goBack" />
		
		<!-- 编辑链接名称/数量弹框 -->
		<view v-if="showLinkEditModal" class="link-edit-modal-mask" @click="closeLinkEditModal">
			<view class="link-edit-modal" @click.stop>
				<view class="link-edit-title">{{ getEditTitle() }}</view>
				<view class="link-edit-field">
					<input v-if="editLinkType === 'name'" class="link-edit-input" v-model="editLinkValue" placeholder="请输入链接名称" />
					<input v-else class="link-edit-input" type="number" v-model.number="editLinkValue" placeholder="请输入数量" />
				</view>
				<view class="link-edit-actions">
					<view class="link-edit-btn cancel" @click="closeLinkEditModal">取消</view>
					<view class="link-edit-btn confirm" @click="saveLinkEdit">确定</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import EditableFormPopup from '../../components/EditableFormPopup/EditableFormPopup.vue';
	export default {
		name: 'CustomerAssistant',
		components: {
			EditableFormPopup,
		},
		data() {
			return {
				statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
				clientInfo: {
					NewAddToday: 0,
					CumulativeNew: 50,
					Remainder: 50,
				},
				clientKey: {
					NewAddToday: '今日新增客户',
					CumulativeNew: '累计新增客户',
					Remainder: '剩余使用量',
				},
				user: {
					avatar: '/static/avatar-other.png',
					nickname: '刘薇',
					description: '@微信'
				},
				linkDisplay: {
					name: '5.27外链',
					count: 5
				},
				showLinkEditModal: false,
				editLinkType: 'name', // 'name' 或 'count'
				editLinkValue: '',
				skipCount: {
					today: 0,
					total: 0
				}
			};
		},
		onLoad() {
			// 从本地存储读取链接显示数据
			try {
				const stored = uni.getStorageSync('linkDisplay');
				if (stored && stored.name !== undefined) {
					this.linkDisplay.name = stored.name;
				}
				if (stored && stored.count !== undefined) {
					this.linkDisplay.count = stored.count;
				}
			} catch (e) {}
			// 从本地存储读取跳过次数数据
			try {
				const stored = uni.getStorageSync('skipCount');
				if (stored && stored.today !== undefined) {
					this.skipCount.today = stored.today;
				}
				if (stored && stored.total !== undefined) {
					this.skipCount.total = stored.total;
				}
			} catch (e) {}
		},
		onShow() {
			uni.setNavigationBarColor({
				frontColor:"#ffffff",
				backgroundColor:"#ffffff"
			})
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			editUser() {
				this.$refs.filePopup.open()
			},
			onSubmit(data) {
				this.user = {
					...data
				}
			},
			showClient() {
				this.$refs.orderPopup.open()
			},
			onOrderSubmit(data) {
				this.clientInfo = Object.assign({}, data)
			},
			goLinkList() {
				// uni.navigateTo({
				// 	url: '/pages/linkList/linkList'
				// })
			},
			editLinkName() {
				this.editLinkType = 'name';
				this.editLinkValue = this.linkDisplay.name;
				this.showLinkEditModal = true;
			},
			editLinkCount() {
				this.editLinkType = 'count';
				this.editLinkValue = this.linkDisplay.count;
				this.showLinkEditModal = true;
			},
			editSkipCount(type) {
				this.editLinkType = type === 'today' ? 'skipToday' : 'skipTotal';
				this.editLinkValue = type === 'today' ? this.skipCount.today : this.skipCount.total;
				this.showLinkEditModal = true;
			},
			getEditTitle() {
				const titles = {
					'name': '编辑链接名称',
					'count': '编辑链接数量',
					'skipToday': '编辑今日跳过次数',
					'skipTotal': '编辑累计跳过次数'
				};
				return titles[this.editLinkType] || '编辑';
			},
			closeLinkEditModal() {
				this.showLinkEditModal = false;
				this.editLinkValue = '';
			},
			saveLinkEdit() {
				if (this.editLinkType === 'name') {
					if (!this.editLinkValue || !this.editLinkValue.trim()) {
						uni.showToast({
							title: '请输入链接名称',
							icon: 'none'
						});
						return;
					}
					this.linkDisplay.name = this.editLinkValue.trim();
					// 保存到本地存储
					try {
						uni.setStorageSync('linkDisplay', this.linkDisplay);
					} catch (e) {}
				} else if (this.editLinkType === 'count') {
					const count = Number(this.editLinkValue);
					if (isNaN(count) || count < 0) {
						uni.showToast({
							title: '请输入有效的数量',
							icon: 'none'
						});
						return;
					}
					this.linkDisplay.count = count;
					// 保存到本地存储
					try {
						uni.setStorageSync('linkDisplay', this.linkDisplay);
					} catch (e) {}
				} else if (this.editLinkType === 'skipToday' || this.editLinkType === 'skipTotal') {
					const count = Number(this.editLinkValue);
					if (isNaN(count) || count < 0) {
						uni.showToast({
							title: '请输入有效的次数',
							icon: 'none'
						});
						return;
					}
					if (this.editLinkType === 'skipToday') {
						this.skipCount.today = count;
					} else {
						this.skipCount.total = count;
					}
					// 保存到本地存储
					try {
						uni.setStorageSync('skipCount', this.skipCount);
					} catch (e) {}
				}
				this.closeLinkEditModal();
				uni.showToast({
					title: '已保存',
					icon: 'success'
				});
			},
		},
	};
</script>

<style scoped>
	.num-with-icon{
		position: relative;
		display: inline-block;
	}
	.feel{
		position: absolute;
		left: 100%;
		top: 0;
		width: 60rpx;
		margin-left: 4rpx;
	}
	.back-btn{
		/* background-color: red; */
		top: 80rpx;
		position: absolute;
		width: 100rpx;
		height: 100rpx;
		z-index: 1;
		left: 0;
	}
	 image{
		 width: 100%;
		 display: block;
	 }
	.custom-header {

		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 100rpx;
		padding: 0 30rpx;
		background-color: #4475C9;
		/* border-bottom: 2rpx solid #e0e0e0; */
	}

	.customer-assistant::-webkit-scrollbar {
		display: none;
	}
	.customer-assistant{
		height: 100vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}
	.main-warp::-webkit-scrollbar {
		display: none;
	}

	.left,
	.right {
		font-size: 32rpx;
		color: #333;
	}

	.backimg {
		width: 50rpx;
		height: 50rpx;
	}

	.title {
		font-size: 36rpx;
		/* font-weight: 600; */
		color: white;
	}

	.circle {
		height: 4rpx;
		width: 4rpx;
		background-color: #8c8c8c;
		border-radius: 50%;
		margin: 0 10rpx;

	}

	.skip-warp {
		display: flex;
		justify-content: center;
	}

	.skip-item {
		padding: 16rpx 44rpx;
		border-radius: 8rpx;
		margin: 0px 12rpx;
		background-color: #f8f8f8;
		font-size: 28rpx;
		color: #717171;
	}

	.skip-item text {
		color: #000;
		/* font-weight: 600; */
		margin-left: 16rpx;
	}

	.all-warp {
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 30rpx;
		padding-bottom: 38rpx;
		padding-top: 22rpx;
		color: #8c8c8c;
	}

	.add-warp {
		display: flex;
		align-items: center;
		background-color: #f8f8f8;
		padding: 26rpx;
		border-radius: 16rpx;
	}

	.add-warp image {
		width: 62rpx;
		height: 62rpx;
		margin-right: 24rpx;
	}

	.client-bottom {
		padding: 16rpx 0px 0px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		/* font-weight: 500; */
	}

	.client-left {
		display: flex;
		align-items: center;
		background-color: #f7d99c;
		border-radius: 12rpx;
		padding: 14rpx 34rpx;
		font-size: 32rpx;
		font-weight: 600;
		color: #724e27;
	}

	.client-left image {
		width: 40rpx;
		height: 40rpx;
		margin-right: 10rpx;
	}

	.client-top {
		padding-top:20rpx ;
		display: flex;
		justify-content: space-between;
	}

/* 	.client-top image {
		width: 40rpx;
		height: 40rpx;
	} */

	.client-main {
		display: flex;
		padding-bottom: 64rpx;
		justify-content: space-around;
		
	}


	.client-warp {
		display: flex;
		flex-direction: column;
		align-items: center;
		color: #808080;
		font-size: 24rpx;
	}

	.text-bottom {
		display: flex;
		align-items: center;
	}

	.text-bottom image {
		width: 24rpx;
		height: 24rpx;
		margin-left: 6rpx;
	}

	

	.num-text {
		font-family: 'WeChat Sans SS', sans-serif;
		font-size: 50rpx;
		color: #000;
		font-weight: 600;
		/* margin-bottom: 10rpx; */
	}

	.section-title {
		font-size: 30rpx;

		margin-bottom: 40rpx;
	}
	
	/* 使用场景样式 */
	.scenario-container {
		position: relative;
		display: flex;
		padding: 16rpx 80rpx;
	}

	/* 	.scenario-container image {
		width: 60rpx;
		height: 40rpx;
	} */

	/* 网站卡片 */
	.website-card {

		width: 280rpx;
		position: absolute;
		top: 20rpx;
		left: 34rpx;
		border-radius: 24rpx;
		border: 2rpx solid #f5f5f5;
		box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
	}

	/* 微信用户卡片 */
	.wechat-card {
		width: 280rpx;
		top: -14rpx;
		right: 40rpx;
		position: absolute;
		background-color: #fff;
		border-radius: 24rpx;
		border: 2rpx solid #f5f5f5;
		box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
	}

	.website-url {
		/* padding-right:20rpx ;
		background-color: #fff; */
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 12rpx 20rpx;
		border-radius: 24rpx;
		font-size: 22rpx;
		color: #888;
		/* text-align: center; */
		padding: 8rpx 52rpx;
		border: 2rpx solid #e0e0e0;
		width: 130rpx;
		line-height: 26rpx;
	}

	.website-name {
		background-color: #f2fcfe;
		font-size: 26rpx;
		font-weight: bold;
		text-align: center;
		margin-top: 20rpx;
		color: #a1b0bf;
		padding: 42rpx 0px 32rpx;
	}

	.primary-button {
		text-align: center;
		background-color: #9dcbff;
		color: white;
		border: none;
		padding: 12rpx 30rpx;
		border-radius: 8rpx;
		cursor: pointer;
		font-size: 24rpx;
		margin: 0px 40rpx;
	}



	.avatar-container {
		padding-top: 20rpx;
		padding-left: 20rpx;
		/* padding: 12rpx 20rpx; */
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.avatar {
		width: 70rpx;
		height: 70rpx;
		margin-right: 16rpx;
		border-radius: 10rpx;
	}

	.user-info {
		width: 100%;
		display: flex;
		flex-direction: column;
	}

	.name {
		font-size: 28rpx;
		font-weight: bold;
		/* transform:scale(0.8); */
	}

	.description {
		font-size: 20rpx;
		color: #d09000;

		/* 黄色 */
		position: relative;

	}

	.desc {
		transform: scale(0.8);
		/* position: relative; */
		left: -18rpx;
	}

	.lineone {
		width: 70rpx;
		height: 12rpx;
		border-radius: 100rpx;
		background-color: #f8f8f8;
		margin: 0px 30rpx 24rpx;

	}

	.linetwo {
		width: 120rpx;
		height: 12rpx;
		border-radius: 20rpx;
		background-color: #f8f8f8;
		margin: 0px 24rpx 24rpx;
	}

	.success-button {
		color: #717cb7;
		border: none;
		padding: 25rpx 20rpx;
		border-radius: 8rpx;
		text-align: center;
		font-size: 28rpx;
		font-weight: 600;
		border-top: 6rpx solid #f8f8f8;
	}

	.one-icon {
		width: 26rpx;
		height: 24rpx;
	}

	.yes-icon {
		height: 26rpx;
		width: 24rpx;
	}

	.step {
		background-color: #e5fee8;
		display: flex;
		align-items: center;
		font-size: 26rpx;
		color: #73cd7e;
		padding: 16rpx 18rpx;
		border-bottom-right-radius: 24rpx;
		border-bottom-left-radius: 24rpx;
	}

	.step-number {
		display: inline-block;
		background-color: #1890ff;
		color: white;
		border-radius: 50%;
		width: 48rpx;
		height: 48rpx;
		text-align: center;
		line-height: 48rpx;
	}

	.method-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20rpx;
		font-size: 32rpx;
		padding: 30rpx 0rpx;
		border-bottom: 2rpx solid #e8e8e8;
	}

	.method-item:last-of-type {
		border-bottom: none;
		/* padding-bottom: 0rpx; */
	}

	.more-warp .method-item {
		border-bottom: none;
	}

	.item-right {
		display: flex;
		align-items: center;
		/* font-weight: 600; */
		color: #000;
	}

	/* 	.left-icon {
		width: 48rpx;
		height: 48rpx;
		margin-right: 16rpx;
	} */
	.left-icon {
		width: 40rpx;
		margin-right: 6rpx;
		/* height: 48rpx; */

	}

	.right_text {
		margin-left: 16rpx;
	}

	.share-icon {
		height: 44rpx;
	}

	.more-icon {
		width: 44rpx;
		height: 44rpx;
		margin-right: 16rpx;
	}

	.AD-icon {
		width: 54rpx;
		height: 46rpx;
		margin-right: 12rpx;
	}

	.vx-icon {
		margin-right: 12rpx;
		/* vx-icon */
		width: 54rpx;
		/* width: 48rpx; */
	}

	.right-icon {
		width: 20rpx;
		height: 20rpx;
	}

	.icon {
		font-size: 40rpx;
		margin-right: 10rpx;
	}

	.arrow {
		font-size: 40rpx;
		color: #ccc;
		margin-left: auto;
	}

	.footer-container {
		text-align: center;
		padding-top: 64rpx;
		padding-bottom: 44rpx;
		color: #3175da;
		font-size: 28rpx;
		/* font-weight: 600; */
	}

	.main-warp {
		box-sizing: border-box;
		position: relative;
		flex: 1;
		overflow: scroll;
		background-color: #edf0f5;
		/* padding-bottom: 120rpx; */
	}

	.top-warp {
		display: flex;
		align-items: center;
		padding: 50rpx 32rpx 120rpx;
		background-color: #4477c8;
		color: #d9e9fd;
		font-size: 32rpx;
	}

	.top-warp .transfer-icon {
		width: 120rpx;
		height: 80rpx;
		margin-right: 24rpx;
	}

	

	/* 使用场景样式 */
	.usage-scenario {
		background-color: #fff;
		padding: 24rpx;
		border-radius: 16rpx;
		margin: 16rpx 22rpx 0 22rpx;
		/* box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1); */
	}

	/* 编辑链接弹框样式 */
	.link-edit-modal-mask {
		position: fixed;
		left: 0;
		right: 0;
		top: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 100;
	}
	.link-edit-modal {
		width: 80%;
		background-color: #fff;
		border-radius: 16rpx;
		padding: 32rpx;
	}
	.link-edit-title {
		font-size: 32rpx;
		font-weight: 600;
		margin-bottom: 24rpx;
		text-align: center;
	}
	.link-edit-field {
		margin-bottom: 24rpx;
	}
	.link-edit-input {
		border: 1rpx solid #e5e5e5;
		border-radius: 8rpx;
		padding: 24rpx 20rpx;
		font-size: 28rpx;
		background-color: #f8f8f8;
		width: 100%;
		box-sizing: border-box;
		min-height: 80rpx;
	}
	.link-edit-actions {
		margin-top: 24rpx;
		display: flex;
		justify-content: flex-end;
	}
	.link-edit-btn {
		min-width: 140rpx;
		text-align: center;
		padding: 16rpx 0;
		border-radius: 8rpx;
		font-size: 28rpx;
		margin-left: 20rpx;
	}
	.link-edit-btn.cancel {
		background-color: #f5f5f5;
		color: #666;
	}
	.link-edit-btn.confirm {
		background-color: #3175da;
		color: #fff;
	}
</style>