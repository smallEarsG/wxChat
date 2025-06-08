<template>
	<view class="container">
		<view class="custom-header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="left" @click="goBack">
				<!-- <image class="backimg" src="../../static/left.png" /> -->
				<!-- <uni-icons type="left" size="25"></uni-icons> -->
				<view class="circle" />
				<view class="circle" />
			</view>
			<view class="title">微信(44)</view>
			<view class="right">
				<view @click="goQuery" style="padding: 2rpx;overflow: hidden;box-sizing: border-box;">
					<image class="nav-icon_more" src="/static/search.png"></image>
				</view>
				<uni-icons type="plus" size="25" @click="addMsgbox()"></uni-icons>
			</view>
		</view>
		<view class="content">
			<view class="roleList">
				<uni-swipe-action>
					<uni-swipe-action-item v-for="item in msgList" :right-options="options" :auto-close="false"
						@click="bindClick(item,$event)">

						<view class="content-box">
							<uni-list-chat :title="item.name" :avatar="item.avatarUrl" :note="'[图片]'"
								:time="item.createdAt" @click="goChat(item)" :clickable="true"></uni-list-chat>
						</view>
					</uni-swipe-action-item>
				</uni-swipe-action>
			</view>
		</view>
		<ProMsgEditPopup ref="wxChatPopup" :msgInfo="msgInfo" @submit="onSubmitWx"></ProMsgEditPopup>
	</view>
</template>

<script>
	import {
		getConversationsByUser,
		uploadImage,
		createConversation,
		deleteConversation,
		updateConversation
	} from '@/api/conversations.js'
	import {
		getUUid
	} from '@/utils/tool.js'
	export default {
		data() {
			return {
				statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
				msgList: [],
				msgInfo: {
					avatar: '',
					name: '',
					createdAt: '8:16',
				},
				userId: uni.getStorageSync('userId'),
				options: [{
						text: '修改',
						style: {
							backgroundColor: 'green'
						},

					},
					{
						text: '删除',
						style: {
							backgroundColor: '#F56C6C'
						},

					}
				],
			}
		},
		onShow() {
			this.getMessageList()
		},
		methods: {
			handleEdit(it) {
				// this.msgInfo = it
				this.$refs.wxChatPopup.open(it)
				// 修改逻辑...
			},

			// 处理删除操作
			async handleDelete(it) {
				const res = await deleteConversation(it.conversationId)
				console.log(res);
				if (res.code !== 200) {
					uni.showToast({
						title: '删除失败',
						icon: 'none'
					});
				}
				this.getMessageList()
				// 删除逻辑...
			},

			bindClick(it, e) {
				e.index === 0 ? this.handleEdit(it) : this.handleDelete(it)
				console.log(it);
			},
			async getMessageList() {

				const res = await getConversationsByUser(this.userId)
				this.msgList = res.data
			},
			goQuery() {
				uni.navigateTo({
					url: '/pages/wxQueryMsg/wxQueryMsg'
				})
			},
			goChat(item) {
				console.log(item);
				uni.navigateTo({
					url: '/pages/wxChat/wxChat?guestInfo=' + encodeURIComponent(JSON.stringify(item))
				});
			},
			addMsgbox() {
			
				this.$refs.wxChatPopup.open({
					avatarUrl: '',
					name: '',
					createdAt: '8:15',
				})
			},
			hasHttp(str) {
				// 正则说明：
				// ^ 表示字符串开头
				// (https?) 匹配 http 或 https（? 表示可选 s）
				// :\/\/ 匹配协议后的冒号和双斜杠
				// i 表示忽略大小写
				const regex = /^https?:\/\/.+/i;
				return regex.test(str);
			},
			async onSubmitWx(data) {
				let imgUrl
				if (this.hasHttp(data.avatarUrl)) {
					imgUrl = data.avatarUrl
				} else {
					console.log(11);
					const res = await uploadImage(data.avatarUrl)
					if (res.code !== 200) {
						uni.showToast({
							title: '图片上传失败',
							icon: 'none'
						});
						return
					}
					imgUrl = res.data
				}

				const temp = {
					conversationId: data.conversationId ? data.conversationId : getUUid(),
					userId: this.userId,
					name: data.name,
					avatarUrl: imgUrl,
					content: '',
					createdAt: data.createdAt
				}
				
				// console.log(data.conversationId);
				if (data.conversationId) {
					const rul = await updateConversation(temp.conversationId, temp)
					if (rul.code === 200) {
						this.getMessageList()
						uni.showToast({
							title: '修改成功',
							icon: 'none'
						});
					} else {
						uni.showToast({
							title: '修改失败',
							icon: 'none'
						});
					}

				} else {
					console.log(temp);
					const rul = await createConversation(temp)
					console.log(rul);
					if (rul.code === 200) {
						this.getMessageList()
					} else {
						uni.showToast({
							title: '对话添加失败',
							icon: 'none'
						});
					}
				}
				// updateUseFeature(this.guestInfo.id)
			
			},
			goBack() {
				uni.navigateBack();
			},
		}
	}
</script>

<style>
	.content {
		overflow: auto;
		background-color: #fff;
		flex: 1;
	}

	.container {
		background-color: #fff;
		height: 100vh;
		display: flex;
		/* width: 100vw; */
		flex-direction: column;
	}

	.circle {
		margin-top: 10rpx;
		background-color: black;
		border-radius: 50%;
		height: 10rpx;
		width: 10rpx;
		margin-left: 10rpx;
	}

	.nav-icon_more {
		width: 44rpx;
		height: 44rpx;
		margin-right: 30rpx;
		/* margin-top: 4rpx; */
		position: relative;
		top: 4rpx;
		left: 4rpx;
	}

	.left,
	.right {
		font-size: 32rpx;
		color: #333;
		display: flex;
		/* align-items: center; */
	}

	.title {
		font-size: 34rpx;
		/* font-weight: 700; */
		/* color: white; */
		padding-left: 80rpx;
	}

	.custom-header {
		/* width: 100%; */
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 100rpx;
		padding: 0 30rpx;
		/* background-color: #4475C9; */
		background-color: #eaeaea;
		/* border-bottom: 2rpx solid #e0e0e0; */
	}
</style>