<template>
	<view>
		<!-- 时间消息 -->
		<view 
			v-if="message.type === 'tips'" 
			class="msg-time cell" 
			@longpress="handleLongPress"
		>
			<view v-if="showPopup" class="popup-menu" :style="popupStyle">
				<view class="menu-item" @click="$emit('delete-message', messageIndex)">
					<uni-icons type="close" color="#999" size="25"></uni-icons>
					<text>删除</text>
				</view>
				<view class="menu-item" @click="$emit('add-message', messageIndex)">
					<uni-icons type="chatbubble" color="#999" size="25"></uni-icons>
					<text>消息插入</text>
				</view>
				<view class="menu-item" @click="$emit('edit-time', messageIndex)">
					<uni-icons type="chat" color="#999" size="25"></uni-icons>
					<text>时间编辑</text>
				</view>
			</view>
			{{ message.content }}
		</view>

		<!-- 普通文本消息 -->
		<view 
			v-else-if="message.contentType === 'text' || !message.contentType" 
			class="cell"
			@longpress="handleLongPress"
		>
			<view v-if="showPopup" class="popup-menu" :style="popupStyle">
				<view class="menu-item" @click="$emit('delete-message', messageIndex)">
					<uni-icons type="close" color="#999" size="25"></uni-icons>
					<text>删除</text>
				</view>
				<view class="menu-item" @click="$emit('toggle-role', messageIndex)">
					<uni-icons type="person" color="#999" size="25"></uni-icons>
					<text>切换角色</text>
				</view>
			</view>
			
			<view :class="['msg', message.location === 0 ? 'left' : 'right']">
				<image 
					class="avatar" 
					:src="getAvatarUrl(message.location)" 
					mode="aspectFill"
				/>
				<view class="text-content">
					<template v-for="(part, index) in parseMessage(message.content)" :key="index">
						<text v-if="part.type === 'text'">{{ part.content }}</text>
						<image 
							v-else-if="part.type === 'emoji'" 
							:src="getEmojiUrl(part.index, message.location)" 
							class="emoji-img" 
						/>
					</template>
				</view>
			</view>
		</view>

		<!-- 图片消息 -->
		<view 
			v-else-if="message.contentType === 'photo'" 
			class="cell"
			@longpress="handleLongPress"
		>
			<view v-if="showPopup" class="popup-menu" :style="popupStyle">
				<view class="menu-item" @click="$emit('delete-message', messageIndex)">删除</view>
			</view>
			
			<view :class="['msg', message.location === 0 ? 'left' : 'right']">
				<image 
					class="avatar" 
					:src="getAvatarUrl(message.location)" 
				/>
				<image 
					:src="message.content.avatar" 
					:class="['photo', message.location === 0 ? 'leftp' : 'rightp']"
				/>
			</view>
		</view>

		<!-- 转账消息 -->
		<view 
			v-else-if="message.contentType === 'transfer'" 
			class="cell"
			@longpress="handleLongPress"
			@click="$emit('transfer-action', messageIndex)"
		>
			<view v-if="showPopup" class="popup-menu" :style="popupStyle">
				<view class="menu-item" @click="$emit('delete-message', messageIndex)">删除</view>
			</view>
			
			<view :class="['msg', message.location === 0 ? 'left' : 'right']">
				<image 
					class="avatar" 
					:src="getAvatarUrl(message.location)" 
				/>
				<slot 
					name="transfer-card" 
					:message="message" 
					:message-index="messageIndex"
				>
					<!-- 默认转账卡片 -->
					<view class="transfer-card">
						{{ message.content.tip || '转账' }}: ¥{{ message.content.amount }}
					</view>
				</slot>
			</view>
		</view>

		<!-- 红包消息 -->
		<view 
			v-else-if="message.contentType === 'redBag'" 
			class="cell"
			@longpress="handleLongPress"
			@click="$emit('redbag-action', messageIndex)"
		>
			<view v-if="showPopup" class="popup-menu" :style="popupStyle">
				<view class="menu-item" @click="$emit('delete-message', messageIndex)">删除</view>
			</view>
			
			<view :class="['msg', message.location === 0 ? 'left' : 'right']">
				<image 
					class="avatar" 
					:src="getAvatarUrl(message.location)" 
				/>
				<slot 
					name="redbag-card" 
					:message="message" 
					:message-index="messageIndex"
				>
					<!-- 默认红包卡片 -->
					<view class="redbag-card">
						红包: {{ message.content.tip }}
					</view>
				</slot>
			</view>
		</view>

		<!-- 其他自定义消息类型 -->
		<view v-else class="cell" @longpress="handleLongPress">
			<view v-if="showPopup" class="popup-menu" :style="popupStyle">
				<view class="menu-item" @click="$emit('delete-message', messageIndex)">删除</view>
			</view>
			
			<slot :message="message" :message-index="messageIndex" />
		</view>
	</view>
</template>

<script>
export default {
	name: 'ChatMessage',
	props: {
		// 消息对象
		message: {
			type: Object,
			required: true
		},
		// 消息索引
		messageIndex: {
			type: Number,
			required: true
		},
		// 是否显示弹出菜单
		showPopup: {
			type: Boolean,
			default: false
		},
		// 弹出菜单样式
		popupStyle: {
			type: Object,
			default: () => ({})
		},
		// 用户头像
		userAvatar: {
			type: String,
			default: '/static/avatar-me.png'
		},
		// 对方头像
		guestAvatar: {
			type: String,
			default: '/static/avatar-other.png'
		},
		// 头像URL前缀
		avatarPrefix: {
			type: String,
			default: ''
		}
	},
	methods: {
		handleLongPress(event) {
			this.$emit('long-press', {
				event,
				messageIndex: this.messageIndex
			});
		},
		getAvatarUrl(location) {
			if (location === 0) {
				return this.guestAvatar;
			} else {
				return this.avatarPrefix + this.userAvatar;
			}
		},
		getEmojiUrl(index, location = 0) {
			return location === 0 
				? `/static/emoji/emoji_${index}.png` 
				: `/static/emoji/emoji_${index}_blue.png`;
		},
		parseMessage(msg) {
			if (!msg) return [{ type: 'text', content: '' }];
			
			const result = [];
			const regex = /\[emoji_(\d+)\]/g;
			let lastIndex = 0;
			let match;

			while ((match = regex.exec(msg)) !== null) {
				if (match.index > lastIndex) {
					result.push({
						type: 'text',
						content: msg.substring(lastIndex, match.index)
					});
				}
				result.push({
					type: 'emoji',
					index: parseInt(match[1])
				});
				lastIndex = regex.lastIndex;
			}

			if (lastIndex < msg.length) {
				result.push({
					type: 'text',
					content: msg.substring(lastIndex)
				});
			}
			
			return result;
		}
	}
}
</script>

<style scoped>
.cell {
	position: relative;
	margin: 20rpx 0;
}

.msg-time {
	text-align: center;
	color: #999;
	font-size: 24rpx;
	padding: 20rpx 0;
}

.msg {
	display: flex;
	align-items: flex-start;
	margin: 20rpx 0;
}

.msg.left {
	flex-direction: row;
}

.msg.right {
	flex-direction: row-reverse;
}

.avatar {
	width: 80rpx;
	height: 80rpx;
	border-radius: 10rpx;
	margin: 0 20rpx;
}

.text-content {
	max-width: 60%;
	padding: 20rpx;
	border-radius: 16rpx;
	background: #f0f0f0;
	word-wrap: break-word;
	display: flex;
	flex-wrap: wrap;
	align-items: center;
}

.msg.right .text-content {
	background: #95ec69;
}

.emoji-img {
	width: 40rpx;
	height: 40rpx;
	margin: 0 4rpx;
}

.photo {
	max-width: 400rpx;
	max-height: 400rpx;
	border-radius: 16rpx;
}

.popup-menu {
	position: absolute;
	background: #fff;
	border-radius: 16rpx;
	box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.1);
	z-index: 999;
	min-width: 200rpx;
}

.menu-item {
	display: flex;
	align-items: center;
	padding: 24rpx 32rpx;
	border-bottom: 1rpx solid #f5f5f5;
	font-size: 28rpx;
	color: #333;
}

.menu-item:last-child {
	border-bottom: none;
}

.menu-item:active {
	background: #f5f5f5;
}

.menu-item uni-icons {
	margin-right: 16rpx;
}

.transfer-card, .redbag-card {
	padding: 20rpx;
	border-radius: 16rpx;
	background: #f0f0f0;
	color: #333;
}
</style>
