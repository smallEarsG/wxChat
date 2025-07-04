<template>
	<view class="container">
		<view class="custom-header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="left" @click="goBack">
				<image class="backimg" src="../../static/listIcon.png" />
			</view>
			<view class="title">
				消息
				<image class="computedIcon" src="/static/computedIcon.png"></image>
			</view>
			<view class="right">
				<view @click="goQuery" style="padding: 2rpx;overflow: hidden;box-sizing: border-box;">
					<image class="nav-icon_more" src="/static/searchWihte.png"></image>
					<!-- <uni-icons type="search" color="#fff" size="25" @click="addMsgbox()"></uni-icons> -->
				</view>
				<uni-icons type="plus" color="#fff" size="28" @click="addMsgbox()"></uni-icons>
			</view>
		</view>
		<view class="content">
			<view class="contentMenu">
				<view class="menu_item">
					<image class="msgIcon" src="/static/msgIcon.png" mode=""></image>
					<text class="txt">全部</text>
					<image class="downIcon" src="/static/downIcon.png" mode=""></image>
				</view>
				<view class="yline" />
				<view class="menu_item">
					<image class="todayIcon" src="/static/todayIcon.png" mode=""></image>
					<text class="txt">日程</text>
				</view>
				<view class="yline" />
				<view class="menu_item">
					<image class="huiyiIcon" src="/static/huiyiIcon.png" mode=""></image>
					<text class="txt">会议</text>
				</view>

			</view>
			<view style="margin: 0 20rpx; margin-bottom: 1px;">
				<view class="xline" />
			</view>
			<view class="roleList">
				<uni-swipe-action>
					<uni-swipe-action-item msgsclass="wipe"  v-for="item in msgList" :right-options="options" :auto-close="false"
						@click="bindClick(item,$event)">

						<view class="content-box" @click="goChat(item)">

							<view class="msg_img">

								<view class="msgIndex" v-if="item.chatIndex>0"
									:class="item.chatIndex>100?'more_red':''">
									{{(item.chatIndex)>100?'99+':item.chatIndex}}
								</view>
								<image class="msg_avater" :src="item.avatarUrl"></image>
							</view>
							<view class="msg_info">
								<view class="msg_box">
									<view class="msg_top">
										<view class="msg_title">{{item.name}} <text
												class="title_desc">{{item.description}}</text></view>
										<view class="msg_time">{{item.createdAt}}</view>
									</view>
									<view class="msg_desc">
										{{msgDeal(item.content)}}
									</view>
								</view>
							</view>
							
						</view>
					</uni-swipe-action-item>
				</uni-swipe-action>
			</view>
			<view class="footer_btn">
				<view class="foot_item">
					<view class="totalIndex" v-if="totalChatIndex>0" :class="totalChatIndex>99 ? 'more_red':''">
						{{totalChatIndex>99?'99+':totalChatIndex}}
					</view>
					<image class="qwMsgIcon" src="/static/qiw/qwMsgIcon_b.png"></image>
					<view class="btn_txt">
						消息
					</view>
				</view>
				<view class="foot_item" @click="openIndexPopup(1)">
					<view class="totalIndex" v-if="emailIndexMsg>0" :class="emailIndexMsg>99 ? 'more_red':''">
						{{emailIndexMsg>99?'99+':emailIndexMsg}}
					</view>
					<image class="qw_email" src="/static/qiw/qw_email.png"></image>
					<view class="btn_txt">
						邮件
					</view>
				</view>
				<view class="foot_item" @click="openIndexPopup(2)">
					<view class="totalIndex" v-if="wordIndexMsg>0" :class="wordIndexMsg>99 ? 'more_red':''">
						{{wordIndexMsg>99?'99+':wordIndexMsg}}
					</view>
					<image class="qw_word" src="/static/qiw/qw_word.png"></image>
					<view class="btn_txt">
						文档
					</view>
				</view>
				<view class="foot_item">
					
					<image class="qw_con" src="/static/qiw/qw_con.png"></image>
					<view class="btn_txt">
						工作台
					</view>
				</view>
				<view class="foot_item" @click="openIndexPopup(3)">
					<view class="totalIndex" v-if="addIndexMsg>0" :class="addIndexMsg>99 ? 'more_red':''">
						{{addIndexMsg>99?'99+':addIndexMsg}}
					</view>
					<image class="qx_tonxun" src="/static/qiw/qx_tonxun.png"></image>
					<view class="btn_txt">
						通讯录
					</view>
				</view>
			</view>
		</view>
		<EditableFormPopup ref="indexPopup" :value="indexInfo" :fieldLabels="indexKey" @submit="onIndexSubmit" />
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
				selectItem:-1,
				indexInfo:{
					index:0
				},
				indexKey:{index:'消息条数'},
				addIndexMsg:0,
				wordIndexMsg:0,
				emailIndexMsg:0,
				statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
				msgList: [],
				msgInfo: {
					avatar: '',
					name: '',
					createdAt: '上午 8:16',
					type: 'chat',
					chatIndex: 0,
					description: ''
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
		computed: {
			totalChatIndex() {
				return this.msgList.reduce((sum, item) => {
					const chatIndex = Number(item.chatIndex || 0);
					return sum + chatIndex;
				}, 0);
			}
		},
		methods: {
			parseCreatedAt(str) {
			  const now = new Date();
			  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			
			  if (/^上午|下午/.test(str)) {
			    const isPM = str.startsWith('下午');
			    const time = str.replace(/上午|下午/, '').trim();
			    let [hour, minute] = time.split(':').map(Number);
			    if (isPM && hour < 12) hour += 12;
			    return new Date(today.getFullYear(), today.getMonth(), today.getDate(), hour, minute);
			  }
			
			  if (str === '昨天') {
			    const yesterday = new Date(today);
			    yesterday.setDate(today.getDate() - 1);
			    return yesterday;
			  }
			
			  if (str === '前天') {
			    const dayBefore = new Date(today);
			    dayBefore.setDate(today.getDate() - 2);
			    return dayBefore;
			  }
			
			  if (/^\d+月\d+日$/.test(str)) {
			    const [month, day] = str.match(/\d+/g).map(Number);
			    return new Date(now.getFullYear(), month - 1, day);
			  }
			
			  if (/^\d+年\d+月\d+日$/.test(str)) {
			    const [year, month, day] = str.match(/\d+/g).map(Number);
			    return new Date(year, month - 1, day);
			  }
			
			  // 默认处理失败时返回最早时间，确保放最前
			  return new Date(0);
			},
			openIndexPopup(index){
				this.selectItem = index
				this.$refs.indexPopup.open()
				
			},
			onIndexSubmit(data){
				console.log(data);
				switch(this.selectItem){
					case 1 :
						this.emailIndexMsg = data.index;
						break;
					case 2 : 
						this.wordIndexMsg = data.index
						break;
					case 3 :
						this.addIndexMsg = data.index
						break;
				}
				// this.addIndexMsg = data.index
				this.selectItem = -1
			},
			msgDeal(content) {
				let showText = '';
				try {
					// 解析JSON内容
					const msgAry = JSON.parse(content);
					console.log(msgAry);

					// 从后向前遍历消息数组
					for (let i = msgAry.length - 1; i >= 0; i--) {
						const el = msgAry[i];

						// 根据内容类型设置显示文本
						switch (el.contentType) {
							case 'chat':
							 if( el.type !== 'tips'){
								 // console.log(el.content,"====");
								 showText = el.content;
								}
								 // showText = el.content;
								break;
							case 'order':
								showText = '[订单]';
								break;
							case 'crad': // 修正拼写错误
								showText = '[名片]';
								break;
							case 'transfer':
								showText = '[转账]';
								break;
							case 'photo':
								showText = '[图片]';
								break;
							default:
								// showText = `[未知类型:${el.contentType}]`;
								console.log("图片");
						}

						// 只要找到任何一种有效类型就跳出循环
						if (showText) break;
					}
				} catch (error) {
					console.error('JSON解析错误:', error);
					showText = '';
				}
				return showText;
			},
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
			},
			async getMessageList() {

				const res = await getConversationsByUser(this.userId, 'chat')
				
				this.msgList = res.data.sort((a, b) => this.parseCreatedAt(b.createdAt) - this.parseCreatedAt(a.createdAt));
			},
			goQuery() {
				uni.navigateTo({
					url: '/pages/queryMsg/queryMsg'
				})
			},
			goChat(item) {
				console.log(item);
				uni.navigateTo({
					url: '/pages/chat/chat?guestInfo=' + encodeURIComponent(JSON.stringify(item))
				});
			},
			addMsgbox() {

				this.$refs.wxChatPopup.open({
					avatarUrl: '',
					name: '',
					createdAt: '上午 8:15',
					type: 'chat',
					chatIndex: 0,
					description: '@微信'
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
				const conversationId = data.conversationId ? data.conversationId : getUUid()
				let imgUrl
				if (this.hasHttp(data.avatarUrl)) {
					imgUrl = data.avatarUrl
				} else {
					console.log(11);
					const res = await uploadImage(data.avatarUrl, conversationId)
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
					conversationId,
					userId: this.userId,
					name: data.name,
					avatarUrl: imgUrl,
					content: data.content,
					createdAt: data.createdAt,
					type: 'chat',
					chatIndex: data.chatIndex,
					description: data.description
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
		overflow-y: auto;
		background-color: #fff;
		flex: 1;
		/* padding-bottom: 122rpx; */
		box-sizing: border-box;
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
		width: 48rpx;
		height: 48rpx;
		margin-right: 36rpx;
		/* margin-top: 4rpx; */
		position: relative;
		top: 7rpx;
		left: 4rpx;
	}

	.left,
	.right {
		font-size: 32rpx;
		color: #fff;
		display: flex;
		/* align-items: center; */
	}

	.title {
		font-size: 37rpx;
		/* font-weight: 700; */
		/* color: white; */
		padding-left: 80rpx;
		display: flex;
		align-items: center;
	}

	.computedIcon {
		width: 38rpx;
		height: 38rpx;
	}

	.backimg {
		width: 42rpx;
		height: 42rpx;
	}

	.custom-header {
		/* width: 100%; */
		color: #fff;
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 100rpx;
		padding: 0 30rpx;
		background-color: #4475C9;
		/* background-color: #eaeaea; */
		/* border-bottom: 2rpx solid #e0e0e0; */
	}

	.contentMenu {
		display: flex;
		align-items: center;
		color: #6c6f74;
	}

	.menu_item {
		flex: 1;
		overflow: hidden;
		display: flex;
		align-items: center;
		height: 90rpx;
		justify-content: center;
		font-size: 28rpx;
	}

	.msgIcon {
		width: 36rpx;
		height: 36rpx;
		margin-right: 16rpx;
	}

	.downIcon {
		width: 20rpx;
		height: 20rpx;
		margin-left: 6rpx;
		position: relative;
		top: -2rpx;
	}

	.todayIcon {
		width: 34rpx;
		height: 34rpx;
		margin-right: 16rpx;
	}

	.huiyiIcon {
		width: 40rpx;
		height: 40rpx;
		margin-right: 16rpx;
	}

	.yline {
		height: 30rpx;
		width: 2rpx;
		background-color: #999;
		transform: scaleX(0.1);
	}

	.xline {
		width: 100%;
		height: 2rpx;
		background-color: #999;
		transform: scaleY(0.1);
		/* margin-bottom: 20rpx; */
	}

	.content-box {
		display: flex;
		/* background-color: #4475C9; */
		/* border: #4475C9 1px solid; */
		height: 152rpx;
		
	}
	.roleList{
		padding-bottom: 120rpx;
		/* flex:1 */
	}
	/* .msgswipe{
		padding-bottom: 120rpx;
	} */

	.msg_img {
		position: relative;
		padding: 20rpx;
		padding-right: 10rpx;
		box-sizing: border-box;
		/* display:flex;
		align-items: center;
		justify-content: center; */
	}

	.msgIndex {
		position: absolute;
		background-color: #ee4c25;
		z-index: 1;
		right: -12rpx;
		top: 4rpx;
		color: #fffffd;
		font-size: 20rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 34rpx;
		width: 34rpx;
		overflow: hidden;
		border-radius: 50%;

	}

	.more_red {
		width: 50rpx !important;
		border-radius: 20rpx !important;
	}

	.msg_avater {
		width: 100rpx;
		height: 100rpx;
		border-radius: 20rpx;
	}

	.msg_info {
		padding: 0 20rpx;
		height: 100%;
		/* background-color: rebeccapurple; */
		flex: 1;
		position: relative;
		display: flex;
		align-items: center;
	}

	.msg_box {
		display: flex;
		flex-direction: column;
		/* align-items: center; */
		justify-content: center;
		width: 100%;
	}

	.msg_top {
		/* margin-top: 20rpx; */
		display: flex;
		justify-content: space-between;
		align-items: center;

	}

	.msg_title {
		font-size: 32rpx;
		/* display: flex; */
	}

	.title_desc {
		color: #4bc768;
		font-size: 26rpx;
		margin-left: 8rpx;
		/* display: block; */
		/* line-height: 30rpx; */
	}

	.msg_time {
		font-size: 24rpx;
		color: #cecfd1;
	}

	.msg_desc {
		margin: 10rpx 0;
		font-size: 26rpx;
		color: #9b9fa3;
		white-space: nowrap;
		/* 禁止换行 */
		/* overflow: hidden; */
		/* 超出部分隐藏 */
		height: 30rpx;


	}

	.footer_btn {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 122rpx;
		background-color: #fafbfd;
		display: flex;
		color: #53585c;
		z-index: 2;
		padding-bottom: env(safe-area-inset-bottom); /* 防止内容被挡，但背景照样铺到底 */
	}

	.foot_item {
		position: relative;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		flex: 1;
		align-items: center;
		justify-content: center;
		font-size: 22rpx;
		margin-top: 10rpx;
	}

	.qwMsgIcon {
		height: 48rpx;
		width: 48rpx;
		margin-bottom: 10rpx;
	}

	.qw_email {
		height: 48rpx;
		width: 48rpx;
		margin-bottom: 10rpx;
	}

	.qw_word {
		height: 48rpx;
		width: 48rpx;
		margin-bottom: 10rpx;
	}

	.qw_con {
		height: 48rpx;
		width: 48rpx;
		margin-bottom: 10rpx;
	}

	.qx_tonxun {
		height: 48rpx;
		width: 48rpx;
	}

	.totalIndex {
		position: absolute;
		background-color: #ee4c25;
		z-index: 1;
		right: 28rpx;
		top: 8rpx;
		color: #fffffd;
		font-size: 20rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 36rpx;
		width: 36rpx;
		overflow: hidden;
		border-radius: 50%;
	}

</style>