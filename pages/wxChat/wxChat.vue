<template>
	<view class="chat-page" :style="{ '--global-font-size': currentFontSize + 'px' }">
		<!-- 全局水印层 -->
		<WatermarkLayer />

		<!-- 顶部栏 -->
		<view class="custom-header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="left" @click="goBack">
				<uni-icons type="left" size="25"></uni-icons>
			</view>
			<view class="title" :style="{ fontSize: rpx(32) }">{{guestInfo.name || "微信工坊"}}</view>
			<view class="right">
				<uni-icons type="more-filled" size="20" @click="openMenu"></uni-icons>
			</view>
		</view>
		<!-- 聊天内容区域 -->
		<view class="chat-content">
			<scroll-view class="chat-body" :class="{'scroll-auto': activeMsgIndex !== -1}" :style="'background-image: url('+contentbg+');'" scroll-y :show-scrollbar="false">
			
			<view v-if="activeMsgIndex !== -1" class="overlay" @click="closePopupMenu"></view>
			<!-- 聊天内容 -->
				<view v-for="(item, i) in massageList" :key="i">
					<!-- 时间 -->
					<view v-if="item.type == 'tips' && item.contentType == 'chat'" class="msg-time cell" @longpress="showPopupMenu($event, i)" :style="{ fontSize: rpx(24) }">
						{{ item.content }}
					</view>
					<!-- 撤回消息提示 -->
					<view v-else-if="item.type == 'tips' && item.contentType == 'notification' && item.notificationType == 'recall'" class="msg-time cell" @longpress="showPopupMenu($event, i)" :style="{ fontSize: rpx(24) }">
						"{{ item.content }}"撤回了一条消息
					</view>
					<!-- 领取红包提示 -->
					<view v-else-if="item.type == 'tips' && item.contentType == 'notification' && item.notificationType == 'redbag'" class="msg-time cell" style="display: flex;align-items: center;justify-content: center;" @longpress="showPopupMenu($event, i)" :style="{ fontSize: rpx(24) }">
						<image style="width: 30rpx;margin-right: 10rpx;" src="/static/images/wechat-redp-icon1.png" mode="widthFix"></image>
						{{ item.receiverName }}领取了{{ item.senderName }}的<span style="color: #f99d3b;">红包</span>
					</view>
					<!-- 其他提示消息 -->
					<view v-else-if="item.type == 'tips'" class="msg-time cell" @longpress="showPopupMenu($event, i)" :style="{ fontSize: rpx(24) }">
						<view v-if="activeMsgIndex === i" class="popup-menu" :style="popupStyle">
							<view class="menu-item" @click="deleteMessage_1(i)">
								<uni-icons type="close" color="#999" size="25"></uni-icons>
								<text>删除</text>
							</view>
							<view class="menu-item" @click="addMsg(i)">
								<uni-icons type="chatbubble" color="#999" size="25"></uni-icons>
								<text>消息插入</text>
							</view>
							<view class="menu-item" @click="changeMsg(i)">
								<uni-icons type="chat" color="#999" size="25"></uni-icons>
								<text>{{ item.contentType === 'notification' ? '提示编辑' : '时间编辑' }}</text>
							</view>
						</view>
						{{item.content}}
					</view>
					<!-- <view class="orderBox" v-else-if="item.contentType == 'order'">
						<view class="msg right">
							<image class="avatar" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<ExternalPayCard :orderInfo="item.content" @longpress="showPopupMenu($event, i)" />
						</view>
					</view> -->
					<!-- 名片 -->
					<view v-else-if="item.contentType == 'crad'" class="cell">
						<view v-if="activeMsgIndex === i" class="popup-menu" :style="popupStyle">
							<view class="menu-item" @click="deleteMessage_1(i)">
								<uni-icons type="close" color="#999" size="25"></uni-icons>
								<text>删除</text>
							</view>
							<view class="menu-item" @click="insertTime(i)">
								<uni-icons type="info" color="#999" size="25"></uni-icons>
								<text>插入时间</text>
							</view>
							<view class="menu-item" @click="toggleRole(i)">
								<uni-icons type="person" color="#999" size="25"></uni-icons>
								<text>切换角色</text>
							</view>
							<view class="menu-item" @click="addMsg(i)">
								<uni-icons type="chatbubble" color="#999" size="25"></uni-icons>
								<text>消息插入</text>
							</view>
						</view>
						<view class="msg left" @longpress="showPopupMenu($event, i)" v-if="item.location == 0">
							<image class="avatar" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							<WxWxCard class="cardLeft"  :nickname="item.content.nickname" :avatar="item.content.avatar"
								></WxWxCard>
						</view>
						<view class="msg right"  @longpress="showPopupMenu($event, i)" v-else>
							<image class="avatar" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<WxWxCard  class="cardRight" :nickname="item.content.nickname" :avatar="item.content.avatar"
							></WxWxCard>
						</view>
					</view>
					<!-- 图片photo -->
					<view v-else-if="item.contentType == 'photo'" class="cell">
						<view v-if="activeMsgIndex === i" class="popup-menu" :style="popupStyle">
							<view class="menu-item" @click="deleteMessage_1(i)">
								<uni-icons type="close" color="#999" size="25"></uni-icons>
								<text>删除</text>
							</view>
							<view class="menu-item" @click="insertTime(i)">
								<uni-icons type="info" color="#999" size="25"></uni-icons>
								<text>插入时间</text>
							</view>
							<view class="menu-item" @click="toggleRole(i)">
								<uni-icons type="person" color="#999" size="25"></uni-icons>
								<text>切换角色</text>
							</view>
							<view class="menu-item" @click="addMsg(i)">
								<uni-icons type="chatbubble" color="#999" size="25"></uni-icons>
								<text>消息插入</text>
							</view>
						</view>
						<view class="msg left"  @longpress="showPopupMenu($event, i)" v-if="item.location == 0">
							<image class="avatar" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							<image :src="item.content.avatar" class="phote leftp" mode="widthFix"
								 />
						</view>
						<view class="msg right"  @longpress="showPopupMenu($event, i)" v-else>
							<image class="avatar" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<image :src="item.content.avatar" class="phote rightp"   mode="widthFix"
								></image>
						</view>
					</view>
					<!-- 转账 -->
					<view v-else-if="item.contentType == 'transfer'" class="cell">
						<view v-if="activeMsgIndex === i" class="popup-menu" :style="popupStyle">
							<view class="menu-item" @click="deleteMessage_1(i)">
								<uni-icons type="close" color="#999" size="25"></uni-icons>
								<text>删除</text>
							</view>
							<view class="menu-item" @click="insertTime(i)">
								<uni-icons type="info" color="#999" size="25"></uni-icons>
								<text>插入时间</text>
							</view>
							<view class="menu-item" @click="toggleRole(i)">
								<uni-icons type="person" color="#999" size="25"></uni-icons>
								<text>切换角色</text>
							</view>
							<view class="menu-item" @click="addMsg(i)">
								<uni-icons type="chatbubble" color="#999" size="25"></uni-icons>
								<text>消息插入</text>
							</view>
							<view class="menu-item" @click="onTransferCardLongPress(i)">
								<uni-icons type="compose" color="#999" size="25"></uni-icons>
								<text>编辑金额</text>
							</view>
						</view>
						<view class="msg left"  @longpress="showPopupMenu($event, i)"  @click="resTransfer(i)" v-if="item.location == 0">
							<image class="avatar" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							<WxTransferCard  :class="!item.content.st?'tfCardLeft':'tfCardLeftBg'" :state="item.content.st" :name="item.content.tip" :amount="item.content.amount"
								></WxTransferCard>
						</view>
						<view class="msg right"  @longpress="showPopupMenu($event, i)"	@click="resTransfer(i)" v-else>
							<image class="avatar" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<WxTransferCard :class="!item.content.st?'tfCardRight':'tfCardRightBg'" :state="item.content.st" :name="item.content.tip" :amount="item.content.amount" :isRight="true"
							></WxTransferCard>
						</view>
					</view>
					<!-- 收款 -->
					<view v-else-if="item.contentType == 'wxtf'" class="cell">
						<view v-if="activeMsgIndex === i" class="popup-menu"  :style="popupStyle">
							<view class="menu-item" @click="deleteMessage_1(i)">
								<uni-icons type="close" color="#999" size="25"></uni-icons>
								删除</view>
							<view class="menu-item" @click="insertTime(i)">
								<uni-icons type="info" color="#999" size="25"></uni-icons>
								<text>插入时间</text>
							</view>
							<view class="menu-item" @click="toggleRole(i)">
								<uni-icons type="person" color="#999" size="25"></uni-icons>
								<text>切换角色</text>
							</view>
							<view class="menu-item" @click="addMsg(i)">
								<uni-icons type="chatbubble" color="#999" size="25"></uni-icons>
								<text>消息插入</text>
							</view>
							<view class="menu-item" @click="onTransferCardLongPress(i)">
								<uni-icons type="compose" color="#999" size="25"></uni-icons>
								<text>编辑金额</text>
							</view>
						</view>
						<view class="msg left"  @longpress="showPopupMenu($event, i)" v-if="item.location == 0">
							<image class="avatar" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							<WxTf class="tfCardLeftBg" :name="item.content.tip" :amount="item.content.amount"
								></WxTf>
						</view>
						<view class="msg right"  @longpress="showPopupMenu($event, i)" v-else>
							<image class="avatar" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<WxTf class="tfCardRightBg" :name="item.content.tip" :amount="item.content.amount"
								></WxTf>
						</view>
					</view>
				   <!-- 红包 -->
					<view v-else-if="item.contentType == 'redBag'" @click="getRB(i)" class="cell">
						<view v-if="activeMsgIndex === i" class="popup-menu"   :style="popupStyle">
							<view class="menu-item" @click="deleteMessage_1(i)">
								<uni-icons type="close" color="#999" size="25"></uni-icons>
								删除</view>
							<view class="menu-item" @click="insertTime(i)">
								<uni-icons type="info" color="#999" size="25"></uni-icons>
								<text>插入时间</text>
							</view>
							<view class="menu-item" @click="toggleRole(i)">
								<uni-icons type="person" color="#999" size="25"></uni-icons>
								<text>切换角色</text>
							</view>
							<view class="menu-item" @click="addMsg(i)">
								<uni-icons type="chatbubble" color="#999" size="25"></uni-icons>
								<text>消息插入</text>
							</view>
						</view>
						<view class="msg left"  @longpress="showPopupMenu($event, i)"  v-if="item.location == 0"  >
							<image class="avatar" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
								<WxRedBag  :class="item.content?'tfCardLeft':'tfCardLeftBg'"  :state="item.content"></WxRedBag>
							
						</view>
						<view class="msg right"   @longpress="showPopupMenu($event, i)"  v-else>
							
							<image class="avatar" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
								<WxRedBag  :class="item.content?'tfCardRight':'tfCardRightBg'" :state="item.content"></WxRedBag>
							
						</view>
					</view>
					<!-- yuyin -->
					<view v-else-if="item.contentType == 'yuyin'" class="cell">
						
						<view v-if="activeMsgIndex === i" class="popup-menu" :style="popupStyle">
							<view class="menu-item" @click="deleteMessage_1(i)">
								<uni-icons type="close" color="#999" size="25"></uni-icons>
								删除</view>
							<view class="menu-item" @click="insertTime(i)">
								<uni-icons type="info" color="#999" size="25"></uni-icons>
								<text>插入时间</text>
							</view>
							<view class="menu-item" @click="toggleRole(i)">
								<uni-icons type="person" color="#999" size="25"></uni-icons>
								<text>切换角色</text>
							</view>
							<view class="menu-item" @click="addMsg(i)">
								<uni-icons type="chatbubble" color="#999" size="25"></uni-icons>
								<text>消息插入</text>
							</view>
						</view>
						<view class="msg left " @longpress="showPopupMenu($event, i)" v-if="item.location == 0">
							<image class="avatar" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							<view class="bubble" style="padding-top: 10rpx;display: flex;align-items: center;padding-bottom: 10rpx;">
								<view class="yuyinBox" :style="{ width: (114 + Math.floor((item.content.time - 1) / 2) * 10) + 'rpx' }">
									<image style="margin-right: 16rpx;" class="yuyinIcon" src="/static/images/wechat-voice-icon1.png"></image>
									{{item.content.time}}"
								</view>
					
							</view>
						</view>
						<view class="msg right" @longpress="showPopupMenu($event, i)" v-else>
							<image class="avatar"  :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<view class="bubble" style="padding-top: 10rpx;display: flex;align-items: center;padding-bottom: 10rpx;">
								<view  class="yuyinBox" :style="{ width: (114 + Math.floor((item.content.time - 1) / 2) * 10) + 'rpx' }" style="justify-content: flex-end;">
									{{item.content.time}}"
									<image style="margin-left: 16rpx;text-align: right;" class="yuyinIcon" src="/static/images/wechat-voice-icon2.png"></image>
								</view>
							</view>
						</view>
					</view>
					<!-- 文件 -->
					<view v-else-if="item.contentType == 'file'" @longpress="showPopupMenu($event, i)" class="cell">
						<view v-if="activeMsgIndex === i" class="popup-menu" :style="popupStyle">
							<view class="menu-item" @click="deleteMessage_1(i)">
								<uni-icons type="close" color="#999" size="25"></uni-icons>
								<text>删除</text>
							</view>
							<view class="menu-item" @click="insertTime(i)">
								<uni-icons type="info" color="#999" size="25"></uni-icons>
								<text>插入时间</text>
							</view>
							<view class="menu-item" @click="toggleRole(i)">
								<uni-icons type="person" color="#999" size="25"></uni-icons>
								<text>切换角色</text>
							</view>
							<view class="menu-item" @click="addMsg(i)">
								<uni-icons type="chatbubble" color="#999" size="25"></uni-icons>
								<text>消息插入</text>
							</view>
						</view>
					
						<view class="msg left" @longpress="showPopupMenu($event, i)" v-if="item.location == 0">
						
								<image class="avatar"  :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							<chatFlie class="cardLeft" :content="item.content" >
							</chatFlie>
						</view>
						<view class="msg right" @longpress="showPopupMenu($event, i)" v-else>
							<image class="avatar"
								:src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<chatFlie class="cardRight" :content="item.content">
							</chatFlie>
						</view>
					</view>
					
					<view v-else-if="item.contentType == 'chat'" class="cell">
						<view v-if="activeMsgIndex === i" class="popup-menu" :style="popupStyle">
							<view class="menu-item" @click="deleteMessage_1(i)">
								<uni-icons type="close" color="#999" size="25"></uni-icons>
								<text>删除</text>
							</view>
							<view class="menu-item" @click="insertTime(i)">
								<uni-icons type="info" color="#999" size="25"></uni-icons>
								<text>插入时间</text>
							</view>
							<view class="menu-item" @click="toggleRole(i)">
								<uni-icons type="person" color="#999" size="25"></uni-icons>
								<text>切换角色</text>
							</view>
							<view class="menu-item" @click="addMsg(i)">
								<uni-icons type="chatbubble" color="#999" size="25"></uni-icons>
								<text>消息插入</text>
							</view>
							<view class="menu-item" @click="changeMsg(i)">
								<uni-icons type="chat" color="#999" size="25"></uni-icons>
								<text>编辑消息</text>
							</view>
						</view>
						<!-- 聊天内容 -->
						<view class="msg left " @longpress="showPopupMenu($event, i)" v-if="item.location == 0">
							<image class="avatar" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							<view class="bubble" :style="{ fontSize: rpx(32) }">
								<template v-for="(part, index) in parseMessage(item.content)">
									<text v-if="part.type === 'text'" :key="'text-' + index" class="msg-text">{{ part.content }}</text>
									<image v-else-if="part.type === 'emoji'" 
										:key="'emoji-' + index"
										:src="getEmojiUrl(part.index, item.location)" 
										class="emoji-inline" 
										:style="{ width: rpx(40), height: rpx(40) }" />
								</template>
							</view>
						</view>
						<view class="msg right" @longpress="showPopupMenu($event, i)" v-else>
							<image class="avatar" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<view class="bubble" :style="{ fontSize: rpx(32) }">
								<template v-for="(part, index) in parseMessage(item.content)">
									<text v-if="part.type === 'text'" :key="'text-' + index" class="msg-text">{{ part.content }}</text>
									<image v-else-if="part.type === 'emoji'" 
										:key="'emoji-' + index"
										:src="getEmojiUrl(part.index, item.location)" 
										class="emoji-inline" 
										:style="{ width: rpx(40), height: rpx(40) }" />
								</template>
							</view>
						</view>
					</view>
					
				</view>
			</scroll-view>
		</view>

		<!-- 底部输入栏 -->
		<view class="fun_box">
			<!-- <ChatToolBar /> -->
			<view class="chat-input" :style="{marginBottom: keyboardHeight+'px'}">
				<image class="icon" :style="{ width: rpx(60), height: rpx(60) }" src="/static/icon-voice.png" @click="addYuyin"></image>
				<view class="input—box" :style="{ height: rpx(70),position:'relative' }">
					<textarea class="input" :adjustPosition="false" v-model="inputValue" @focus="onInputFocus" @confirm="onEnterKey" placeholder-class />
					<image style="width: 32rpx;position: absolute;right: 16rpx;top: 14rpx;"  src="/static/wxchat/radio.png" mode="widthFix"></image>
				</view>
				<image class="icon_face" :style="{ width: rpx(60), height: rpx(60) }" src="/static/face_wxchat.png" @click="changeEmoji"></image>
				<image class="icon_plus" :style="{ width: rpx(68), height: rpx(68) }" v-if="inputValue.length == 0" src="/static/icon-plus.png" @click="togglePopupBox"></image>
				<button class="send" @click="onEnterKey" v-if="inputValue.length>0"> 发送 </button>
			</view>
			<!-- 表情选择器 -->
			<view class="emoji-picker" v-show="emoji">
				<view v-for="index in total" :key="index" class="emoji-item" @click="addEmojiToInput(index)">
					<image :src="getEmojiUrl(index)" class="emoji-img" />
				</view>
			</view>
			<!-- 抽屉 -->
			<view class="popup_box" v-show="openPopup">
				<swiper class="drawer-swiper" indicator-dots circular>
				<swiper-item>
					<view class="feature-grid">
						<view>
							<switch :checked="isMe" @change="onSwitchChange" />{{isMe?"我":"客户"}}
							<view style="margin-top: 20rpx;">角色切换</view>
						</view>
						<view>
							<switch :checked="enableLongPressPopup" @change="onLongPressPopupChange" />{{enableLongPressPopup?"开启":"关闭"}}
							<view style="margin-top: 20rpx;">长按弹框</view>
						</view>
					</view>
				</swiper-item>
					<swiper-item v-for="(page, i) in featurePages" :key="i">
						<view class="feature-grid">
							<view v-for="item in page" :key="item.name" class="feature-item"
								@click="onSelect(item.name)">
								<image class="feature-icon" :src="item.icon" />
								<text class="feature-text">{{ item.label }}</text>
							</view>
						</view>
					</swiper-item>
				</swiper>
			</view>
		</view>
		<!-- 定义弹出层 -->
		<EditableFormPopup ref="timePopup" :value="timeInfo" :fieldLabels="timeKey" @submit="onTimeSubmit" />
		<!-- 转账 -->
		<EditableFormPopup ref="transferPopup" :value="transfer" :fieldLabels="transferKey"
			@submit="onTransferSubmit" />
		<!-- 图片 -->
		<UploadImage ref="photoPopup" @submit="onPhotoSubmit"></UploadImage>
		<!-- 名片 -->
		<ProfileEditPopup ref="cradPopup" @submit="onCradSubmitz"></ProfileEditPopup>
		<!-- yuyin -->
		<EditableFormPopup ref="yuyinPopup" :value="yuyinInfo" :fieldLabels="yuyinKey" @submit="onYuyinSubmit" />
		<!-- 消息编辑弹窗 -->
		<MessageEditPopup ref="editMsgPopup" @submit="onEditMsgSubmit" />
		<!-- 消息插入弹窗 (支持表情包) -->
		<MessageInsertPopup ref="msgPopup" @submit="addMsgSubmit" />
		<!-- 提示消息插入弹窗 -->
		<TipInsertPopup ref="tipPopup" @submit="onTipSubmit" @edit="onTipEdit" />
		<!-- 背景修改 -->
		<UploadImage ref="bgPopup" @submit="onBgSubmit"></UploadImage>
		<!-- 文件 -->
		<FileEditPopup ref="filePopup" :fileTypes="fileTypes" @submit="onFileSubmit" />
		
		<!-- 菜单弹窗 -->
		<uni-popup ref="menuPopup" background-color="#fff">
			<view class="menu" :style="{ paddingTop: statusBarHeight + 'px' }">
				<button type="primary" plain="true" @click="openBgPopup">修改背景</button>
				<!-- 滑块组件 -->
				<view class="fontChange">
					<view class="">
						字体调节
					</view>
					<slider
						:value="scale"
						:min="0.7"
						:max="1.5"
						:step="0.02"
						@changing="onScaleChange"
					/>
				</view>
				<button @click="$refs.menuPopup.close()">关闭</button>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import ExternalPayCard from '../../components/ExternalPayCard/ExternalPayCard.vue';
	import EditableFormPopup from '../../components/EditableFormPopup/EditableFormPopup.vue';
	import WxTransferCard from '../../components/WxTransferCard/WxTransferCard.vue';
	import ChatToolBar from '../../components/ChatToolBar/ChatToolBar.vue';
	import UploadImage from '../../components/UploadImage/UploadImage.vue';
	import ProfileEditPopup from '../../components/ProfileEditPopup/ProfileEditPopup.vue';
	import WxWxCard from '../../components/WxWxCard/WxWxCard.vue';
	import WxTf from '../../components/WxTf/WxTf.vue';
	import WxRedBag from '../../components/WxRedBag/WxRedBag.vue';
	import ProMsgEditPopup from '../../components/ProMsgEditPopup/ProMsgEditPopup.vue';
	import MessageEditPopup from '../../components/MessageEditPopup/MessageEditPopup.vue';
	import MessageInsertPopup from '../../components/MessageInsertPopup/MessageInsertPopup.vue';
	import TipInsertPopup from '../../components/TipInsertPopup/TipInsertPopup.vue';
	import FileEditPopup from '../../components/FileEditPopup/FileEditPopup.vue';
	import chatFlie from '../../components/chatFlie/chatFlie.vue';
	import scaleMixin from '@/mixins/scaleMixin.js';
	import {
		getUserInfo
	} from '@/api/index.js';

	import {
		uploadImage,
		updateConversation
	} from '@/api/conversations.js'

	export default {
		mixins: [scaleMixin],
		components: {
			ExternalPayCard,
			EditableFormPopup,
			WxTransferCard,
			ChatToolBar,
			UploadImage,
			ProfileEditPopup,
			WxWxCard,
			WxTf,
			WxRedBag,
			ProMsgEditPopup,
			MessageEditPopup,
			MessageInsertPopup,
			TipInsertPopup,
			FileEditPopup,
			chatFlie
		},
		onLoad(options) {
			if (options.guestInfo) {
				try {
					this.guestInfo = JSON.parse(decodeURIComponent(options.guestInfo));
					console.log("guestInfo:",options.guestInfo);

						console.log(this.guestInfo.content);
						const parsedContent = JSON.parse(this.guestInfo.content);
						// 确保 massageList 始终是数组
						if(Array.isArray(parsedContent)){
							this.massageList = parsedContent;
						} else {
							this.massageList = [];
						}
				} catch (e) {
					console.error('guestInfo 参数解析失败', e);
					this.massageList = []
				}
			}
			// 获取账号信息
			const userId = uni.getStorageSync('userId');
			console.log(userId);
			this.getUserInfo(userId);
			this.$forceUpdate();
		},
		data() {
			return {
				keyboard:false,
				activeMsgIndex: -1, // 当前激活的消息索引
				enableLongPressPopup: true, // 控制长按弹框功能
				popupTop: 0,
				popupLeft: 0,
				popupStyle: {}, // 弹出菜单样式
				currentFontSize: 16, // 默认字体大小
				contentbg: "null", // 背景图片
				editMsgIndex: -1, // 编辑消息索引
				userInfo: {},
				statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
				chatInputBottom: 0,
				guestInfo: {},
				isMe: false,
				openPopup: false,
				inputValue: "",
				// 表情相关
				emoji: false,
				total: 331, // 表情总数
				isIos: false, // 是否为iOS系统
				keyboardHeight: 0, // 键盘高度
				featureList: [{
						name: 'time',
						label: '时间插入',
						icon: '/static/icon-time.png'
					},
					{
						name: 'photo',
						label: '照片',
						icon: '/static/icon-photo.png'
					},
					{
						name: 'camera',
						label: '拍摄',
						icon: '/static/icon-camera.png'
					},
					{
						name: 'transfer',
						label: '转账',
						icon: '/static/icon-transfer_black.png'
					},
					{
						name: 'file',
						label: '文件',
						icon: '/static/icon-file.png'
					},
					{
						name: 'contact',
						label: '名片',
						icon: '/static/icon-contacts.png'
					},
					{
						name: 'location',
						label: '位置',
						icon: '/static/icon-location.png'
					},
					{
						name: 'video',
						label: '视频通话',
						icon: '/static/icon-video.png'
					},
				{
					name: 'redBag',
					label: '红包',
					icon: '/static/redBag.png'
				},
				{
					name: 'tip',
					label: '提示插入',
					icon: '/static/icon-time.png'
				}
			],
				massageList: [
					// {
					// 	type: "tips", // tips, content
					// 	contentType: "chat", //order , chat ,link
					// 	location: 0, // 1 表示我方
					// 	content: "2024年12月24日 14:10"
					// },
					// {
					// 	type: "content", // tips, content
					// 	contentType: "chat", //order , chat ,link
					// 	location: 0, // 1 表示我方
					// 	content: "你"
					// },
					// {
					// 	type: "content", // tips, content
					// 	contentType: "chat", //order , chat ,link
					// 	location: 1, // 1 表示我方
					// 	content: "你好，欢迎来到企业微信工坊"
					// },
					// {
					// 	type: "tips", // tips, content
					// 	contentType: "chat", //order , chat ,link
					// 	location: 0, // 1 表示我方
					// 	content: "2024年12月24日 14:10"
					// },
					// {
					// 	type: "content", // tips, content
					// 	contentType: "chat", //order , chat ,link
					// 	location: 1, // 1 表示我方
					// 	content: "你好，欢迎来到企业微信工坊,这里有订单,对外汇款等功能"
					// },
					// {
					// 	type: "content", // tips, content
					// 	contentType: "crad", //order , chat ,link
					// 	location: 1, // 1 表示我方
					// 	content: {
					// 		name: "G"
					// 	}
					// },{
					// 	type: "content", // tips, content
					// 	contentType: "crad", //order , chat ,link
					// 	location: 0, // 1 表示我方
					// 	content: {
					// 		name: "G"
					// 	}
					// },
					// {
					// 	type: "content", // tips, content
					// 	contentType: "redBag", //order , chat ,link
					// 	location: 0, // 1 表示我方
					// 	content:false
					// },
					// {
					// 	type: "content", // tips, content
					// 	contentType: "wxtf", //order , chat ,link
					// 	location: 1, // 1 表示我方
					// 	content:{
					// 		amount:"100",
					// 	}
					// }
				],
				orderInfo: {
					shopName: "",
					gusetName: "",
					price: ""
				},
				orderKey: {
					shopName: "收款名称",
					gusetName: "付款人名称",
					price: "价格"
				},
				timeInfo: {
					time: ""
				},
				timeKey: {
					time: "时间"
				},
				transfer: {
					// name:"",
					amount: ""
				},
				transferKey: {
					// name:"用户名",
					amount: "转账金额"
				},
				// 文件相关数据
				fileInfo: {
					fileType: "文档",
					fileName: "",
					fileSize: ""
				},
				fileTypes: ["文件", "图片", "PDF", "EXCEL表格", "文档", "其他"],
				yuyinInfo: {
					time: ""
				},
				yuyinKey: {
					time: "时间长度"
				},
			};
		},
		computed: {
			featurePages() {
				const pageSize = 8;
				const pages = [];
				for (let i = 0; i < this.featureList.length; i += pageSize) {
					pages.push(this.featureList.slice(i, i + pageSize));
				}
				return pages;
			},
			containerStyle() {
				return {
					height: `calc(100vh - ${this.chatInputBottom}px)`
				}
			}
		},
		mounted() {
			// 初始化系统平台检测
			this.isIos = uni.getSystemInfoSync().platform === 'ios';
			if (!this.isIos) {
				this.keyboardHeight = 10;
			}
			
			// 键盘高度变化监听
			uni.onKeyboardHeightChange(res => {
				if (res.height == 0) {
					// 键盘收起
					this.keyboardHeight = this.isIos ? 0 : 10;
				} else {
					// 键盘弹起时隐藏表情选择器和功能抽屉
					this.emoji = false;
					this.openPopup = false;
					const safeAreaBottom = this.getSafeAreaInsetBottom();
					this.keyboardHeight = res.height - safeAreaBottom;
				}
			});
		},
		methods: {
			updateMsg(){
				this.guestInfo.content = JSON.stringify(this.massageList)
				updateConversation(this.guestInfo.conversationId,this.guestInfo)
			},
			getRB(i){
			
				this.massageList[i].content = !this.massageList[i].content
				this.updateMsg()
			},
			resTransfer(i) {
				if(this.massageList[i].content.st)return;
				const temp = JSON.parse(JSON.stringify(this.massageList[i]))
				this.massageList[i].content.st = true
				temp.contentType = 'wxtf'
				temp.location = this.isMe ? 0 : 1;
				this.massageList.push(temp)
				// 删掉 i 位置的数据 在 i这里插入两条
				this.updateMsg()
			},
			onTransferCardLongPress(index){
				const current = (this.massageList[index] && this.massageList[index].content && this.massageList[index].content.amount) ? String(this.massageList[index].content.amount) : '';
				uni.showModal({
					title:'编辑金额',
					editable:true,
					content: current,
					placeholderText:'请输入金额（最多两位小数）',
					success: (res)=>{
						if(res.confirm){
							const inputVal = (res.content != null ? String(res.content) : current).trim();
							const isValid = /^\d+(\.\d{1,2})?$/.test(inputVal);
							if(!isValid){
								uni.showToast({ title:'金额格式不合法', icon:'none' });
								return;
							}
							this.$set(this.massageList[index].content,'amount', inputVal);
							this.updateMsg();
						}
					}
				});
			},
			addYuyin(){
				this.$refs.yuyinPopup.open();
			},
			closePopupMenu() {
				// 添加关闭动画
				this.popupStyle = {
					...this.popupStyle,
					opacity: 0,
					transform: 'scale(0.8)',
					transition: 'all 0.2s ease-out'
				};

				// 延迟隐藏，让动画完成
				setTimeout(() => {
					this.activeMsgIndex = -1;
				}, 200);
			},
			showPopupMenu(e, index) {
				// 如果长按弹框功能被关闭，则不显示弹框
				if (!this.enableLongPressPopup) {
					return;
				}
				
				// 获取触摸坐标
				const touch = e.touches?.[0] || {};
				const { clientX, clientY } = touch;
				
				// 计算弹出菜单位置
				const left = Math.max(10, Math.min(clientX - 100, uni.getSystemInfoSync().windowWidth - 220));
				
				// 设置菜单样式
				this.popupStyle = {
					left: `${left}px`,
					top: `${clientY - 80}px`,
					opacity: 0,
					transform: 'scale(0.8)',
					transition: 'all 0.2s ease-out'
				};

				// 延迟设置可见性，以便动画效果生效
				this.activeMsgIndex = index;

				// 触发重绘后设置最终样式
				setTimeout(() => {
					this.popupStyle = {
						...this.popupStyle,
						opacity: 1,
						transform: 'scale(1)'
					};
				}, 10);
			},
			deleteMessage_1(index) {
				console.log(index);
				this.massageList.splice(index, 1);
				this.activeMsgIndex = -1; // 清除激活状态
				this.updateMsg()
			},
			onYuyinSubmit(data){
				const location = this.isMe ? 1 : 0;
				const transferInfo = {
					type: "content", // tips, content
					contentType: "yuyin", //order , chat ,link
					location, // 1 表示我方
					content: {
						time :parseInt(data.time)
					}
				};
				console.log(data);
				this.massageList.push(transferInfo);
				this.updateMsg()
			},
			async onCradSubmitz(data) {
				console.log(data);
				// const res = await uploadImage(data.avatar)
				const temp = data
				// temp.avatar = res.data
				const location = this.isMe ? 1 : 0;
				const transferInfo = {
					type: "content", // tips, content
					contentType: "crad", //order , chat ,link
					location, // 1 表示我方
					content: temp
				};
				
				// console.log(data);
				this.massageList.push(transferInfo);
				this.updateMsg()
			},
			async onPhotoSubmit(data) {
				console.log(data.avatar);
				const res = await uploadImage(data.avatar)
				
				const location = this.isMe ? 1 : 0;
				const photoInfo = {
					type: "content", // tips, content
					contentType: "photo", //order , chat ,link
					location, // 1 表示我方
					content: {avatar:res.data}
				};
				console.log(photoInfo);
				this.massageList.push(photoInfo);
				this.updateMsg()
			},
			onTransferSubmit(data) {
				const location = this.isMe ? 1 : 0;
				const transferInfo = {
					type: "content", // tips, content
					contentType: "transfer", //order , chat ,link
					location, // 1 表示我方
					content: {
						...data,
						tip: this.isMe ? "你发起了一笔转账" : "请收款"
					}
				};
				this.massageList.push(transferInfo);
				this.updateMsg()
			},
			async getUserInfo(userId) {
				console.log("执行用户信息获取", userId);
				const res = await getUserInfo(userId);
				console.log(res);
				this.userInfo = res.data;
			},
			onOrderSubmit(data) {
				const location = this.isMe ? 1 : 0;
				console.log(data);
				const orderInfo = {
					type: "content", // tips, content
					contentType: "order", //order , chat ,link
					location, // 1 表示我方
					content: data
				};
				this.massageList.push(orderInfo);
				this.updateMsg()
			},
			onTimeSubmit(data) {
				const location = this.isMe ? 1 : 0;
				console.log(data);
				const timeInfo = {
					type: "tips", // tips, content
					contentType: "chat", //order , chat ,link
					location, // 1 表示我方
					content: data.time
				};
				// 如果有当前操作的索引，将时间插入到该消息上方
				if (this.currentActionIndex !== undefined && this.currentActionIndex !== -1) {
					this.massageList.splice(this.currentActionIndex, 0, timeInfo);
					// 插入后重置索引
					this.currentActionIndex = -1;
				} else {
					// 否则默认添加到末尾
					this.massageList.push(timeInfo);
				}
				
				this.updateMsg()
			},
			goBack() {
				uni.navigateBack();
			},
			togglePopupBox() {
				this.openPopup = !this.openPopup;
				this.emoji = false;
			},
			onSwitchChange(e) {
				console.log(e);
				this.isMe = !this.isMe;
				console.log("当前开关状态：", this.isMe);
			},
			
			onLongPressPopupChange(e) {
				this.enableLongPressPopup = e.detail.value;
			},
			addRedBag(){
				const location = this.isMe ? 1 : 0;
			
				const orderInfo = {
					type: "content", // tips, content
					contentType: "redBag", //order , chat ,link
					location, // 1 表示我方
					content: true
				};
				this.massageList.push(orderInfo);
				this.updateMsg()
			},
			onSelect(type) {
				// 处理选择事件
				console.log('Selected:', type);
				// const key = type
				switch (type) {
					case "order":
						this.$refs.orderPopup.open();
						break;
					case "time":
						this.$refs.timePopup.open();
						break;
					case "transfer":
						this.$refs.transferPopup.open();
						break;
					case "photo":
						this.$refs.photoPopup.open();
						break;
					case "contact":
						this.$refs.cradPopup.open();
						break;
					case "redBag":
					    this.addRedBag()
						break
				case "file":
					this.$refs.filePopup.open()
					break;
				case "tip":
					this.$refs.tipPopup.open();
					break;
				default:
					uni.showToast({
						title: '功能开发中...',
						icon: 'none'
					});
						break;
				}
			},
			onFileSubmit(data) {
				const location = this.isMe ? 1 : 0;
				const fileInfo = {
					type: "content",
					contentType: "file",
					location,
					content: {
						fileType: data.fileType,
						fileName: data.fileName,
						fileSize: data.displaySize,
						isCop: data.isCop || false  // 添加 isCop 属性
					}
				};
				this.massageList.push(fileInfo);
				this.updateMsg();
				uni.showToast({
					title: '文件添加成功',
					icon: 'success'
				});
			},
			onEnterKey() {
				console.log(this.inputValue);
				if (this.inputValue.trim()) {
					console.log('用户输入内容:', this.inputValue);
					// 确保 massageList 是数组
					if (!Array.isArray(this.massageList)) {
						this.massageList = [];
					}
					// 这里可以添加发送消息的逻辑
					const location = this.isMe ? 1 : 0;
					this.massageList.push({
						type: "content",
						contentType: "chat",
						location,
						content: this.inputValue
					});
					// 清空输入框
					this.inputValue = '';
					this.updateMsg()
				}
			},
			
			// 字体缩放相关方法
			onScaleChange(e) {
				const scale = e.detail.value;
				this.$store.commit('setScale', scale);
			},
			
			// 菜单相关方法
			openMenu() {
				this.$refs.menuPopup.open('top');
			},
			
			openBgPopup() {
				this.$refs.bgPopup.open();
				this.$refs.menuPopup.close();
			},
			
			onBgSubmit(data) {
				this.contentbg = data.avatar;
			},
			
			// 角色切换
			toggleRole(index) {
				this.massageList[index].location = this.massageList[index].location === 0 ? 1 : 0;
				this.activeMsgIndex = -1;
				this.updateMsg();
			},
			
			// 插入时间
			insertTime(index) {
				
				this.currentActionIndex = index;
				this.$refs.timePopup.open();
				// this.currentActionIndex = this.activeMsgIndex;
				// this.$refs.timePopup.open();
				// this.activeMsgIndex = -1;
			},
			
			// 消息编辑相关
			changeMsg(index) {
				this.editMsgIndex = this.activeMsgIndex;
				const msg = this.massageList[this.editMsgIndex];
				
				// 如果是提示消息，打开提示编辑弹窗
				if (msg.type === 'tips' && msg.contentType === 'notification') {
					if (msg.notificationType === 'recall') {
						// 编辑撤回消息
						this.$refs.tipPopup.openForEdit({
							tipType: 'recall',
							recallName: msg.content
						});
					} else if (msg.notificationType === 'redbag') {
						// 编辑领取红包消息
						this.$refs.tipPopup.openForEdit({
							tipType: 'redbag',
							receiverName: msg.receiverName || '你',
							senderName: msg.senderName || 'Caleb'
						});
					}
				} else {
					// 普通消息或时间提示，使用原来的编辑方式
					this.$refs.editMsgPopup.open(msg.content);
				}
				this.activeMsgIndex = -1;
			},
			
			onEditMsgSubmit(data) {
				if (this.editMsgIndex !== -1 && data.content && data.content.trim()) {
					this.massageList[this.editMsgIndex].content = data.content;
					this.updateMsg();
					uni.showToast({
						title: '消息编辑成功',
						icon: 'success'
					});
				}
				this.editMsgIndex = -1;
			},
			
			// 消息插入
			addMsg(index) {
				this.currentActionIndex = index;
				// this.currentActionIndex = this.activeMsgIndex;
				this.$refs.msgPopup.open();
				this.activeMsgIndex = -1;
			},
			
			addMsgSubmit(data) {
				console.log(data.msg);
				this.addMsgcomm(data.msg);
			},
			
			addMsgcomm(msg) {
				const location = this.isMe ? 1 : 0;
				const msgInfo = {
					type: "content",
					contentType: "chat",
					location,
					content: msg
				};
				
				if (this.currentActionIndex !== -1) {
					this.massageList.splice(this.currentActionIndex , 0, msgInfo);
				} else {
					this.massageList.push(msgInfo);
				}
				this.updateMsg();
			},
			
			// 提示消息插入
			onTipSubmit(tipData) {
				if (this.currentActionIndex !== -1) {
					this.massageList.splice(this.currentActionIndex, 0, tipData);
				} else {
					this.massageList.push(tipData);
				}
				this.updateMsg();
			},
			
			// 提示消息编辑
			onTipEdit(tipData) {
				if (this.editMsgIndex !== -1) {
					// 更新现有消息
					Object.assign(this.massageList[this.editMsgIndex], tipData);
					this.updateMsg();
					uni.showToast({
						title: '提示消息编辑成功',
						icon: 'success'
					});
				}
				this.editMsgIndex = -1;
			},
			
			// 输入框聚焦事件
			onInputFocus() {
				// 输入框聚焦时立即隐藏表情选择器和功能抽屉
				this.emoji = false;
				this.openPopup = false;
			},
			
			// 表情相关方法
			changeEmoji() {
				this.emoji = !this.emoji;
				this.openPopup = false;
			},
			
			addEmojiToInput(index) {
				this.inputValue += `[emoji_${index}]`;
			},
			
			getEmojiUrl(index, location = 0) {
				// 我方使用 g.png 结尾的表情，其他方使用普通表情
				if (location === 1) {
					return `/static/emoji/emoji_${index}_g.png`;
				} else {
					return `/static/emoji/emoji_${index}.png`;
				}
			},
			
			// 获取安全区域底部高度
			getSafeAreaInsetBottom() {
				const systemInfo = uni.getSystemInfoSync();
				return systemInfo.safeAreaInsets ? systemInfo.safeAreaInsets.bottom : 0;
			}
		}
	};
</script>

<style scoped>
	.send{
		background-color: green;
		color: #fff;
		height: 60rpx;
		line-height: 60rpx;
		font-size: 30rpx;
		text-align: center;
	}
	.cell{
		position: relative;
	}
	.yuyinBox{
		display: flex;
		align-items: center;
		max-width: 300rpx !important;
	}
	
	.yuyinIcon{
		width: 27.2rpx;
		height: 39rpx;
	}
	.tfCardLeftBg::after{
		content: "";
		position: absolute;
		top: 28rpx;
		left: -10rpx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-right: 6px solid  #fce1c3
	}
	.tfCardRightBg::after{
		content: "";
		position: absolute;
		top: 28rpx;
		right: -10rpx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		 border-left: 6px solid #fce1c3;
	}
	.tfCardRight::after {
		content: "";
		position: absolute;
		top: 28rpx;
		right: -10rpx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-left: 6px solid #f99d3b;
	}
	.tfCardLeft::after {
		content: "";
		position: absolute;
		top: 28rpx;
		left: -10rpx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-right: 6px solid #f99d3b;
	}
	.tfCardRightBg,
	.tfCardRight,
	.cardRight{
		 margin-right: 14rpx;
	}
	.cardRight::after {
		content: "";
		position: absolute;
		top: 28rpx;
		right: -10rpx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-left: 6px solid #fff;
	}
	.tfCardLeftBg,
	.tfCardLeft,
	.cardLeft {
		 margin-left: 14rpx;
	}
	.cardLeft::after {
		content: "";
		position: absolute;
		top: 28rpx;
		left: -10rpx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-right: 6px solid #fff;
	}
	.overlay {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 1;
	}

	.popup-menu {
		position: absolute;
		background-color: #333;
		color: white;
		border-radius: 12rpx;
		padding: 10rpx 20rpx;
		z-index: 999999;
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		top: -60rpx;
		right: 50%;
	}

	.menu-item {
		padding: 10rpx 20rpx;
		font-size: 24rpx;
	}

	.chat-page {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background-color: #eaeaea;
		position: relative;
	}

	.chat-body ::-webkit-scrollbar {
		display: none;
	}

	.phote {
		width: 200rpx;
		/* height: 200rpx; */
		/* background-color: #3086ff; */
	}

	.rightp {
		margin-right: 14rpx;
	}

	.leftp {
		margin-left: 14rpx;
	}

	.chat-content {
		display: flex;
		flex-direction: column;
		height: 100%;
		overflow: hidden;
		padding-top: 4rpx;
		/* 为固定的头部留出空间 */
		padding-bottom: 20rpx;
		box-sizing: border-box;
	}

	.backimg {
		width: 50rpx;
		height: 50rpx;
	}

	/* 顶部栏 - 固定在顶部 */
	.custom-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		height: 100rpx;
		padding: 0 30rpx;
		border-bottom: 2rpx solid #e0e0e0;

	}

	.title {
		display: flex;
		flex-direction: column;
		align-items: center;
		font-weight: 500;
	}

	.desc {
		color: #e4eef0;
		font-size: 20rpx;
	}

	.nikeName {
		font-size: 34rpx;
		font-weight: 600;
	}

	.back {
		font-size: 32rpx;
		margin-right: 40rpx;
	}

	.icons {
		display: flex;
		gap: 20rpx;
		align-items: center;
	}

	.nav-icon_more {
		width: 40rpx;
		height: 8rpx;
		margin-left: 20rpx;
	}

	.nav-icon_phone {
		width: 40rpx;
		height: 40rpx;
	}

	/* 聊天内容 - 调整高度和位置 */
	.chat-body {
		flex: 1;
		padding: 10rpx 20rpx;
		box-sizing: border-box;
		max-height: calc(100vh - 100rpx - 100rpx);
		/* 减去头部和输入框的高度 */
		overflow-y: auto;
		position: relative;
		z-index: 1;
		transition: bottom 0.3s ease;
		/* 平滑过渡 */
	}

	.msg-time {
		text-align: center;
		color: #999;
		font-size: 24rpx;
		margin: 30rpx 0;
	}

	.msg {
		display: flex;
		margin-bottom: 30rpx;
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
		margin: 0 10rpx;
	}

	.bubble {
		max-width: 480rpx;
		padding: 20rpx 20rpx;
		font-size: 32rpx;
		border-radius: 16rpx;
		background-color: #ffffff;
		line-height: 1.3;
		position: relative;
		box-sizing: border-box;
	}

	.msg.right .bubble {
		background-color: #95ec69;
		margin-right: 14rpx;
	}

	.msg.left .bubble {
		margin-left: 14rpx;
	}

	.msg.right .bubble::after {
		content: "";
		position: absolute;
		top: 28rpx;
		right: -10rpx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-left: 6px solid #95ec69;
	}

	.msg.left .bubble::after {
		content: "";
		position: absolute;
		top: 28rpx;
		left: -10rpx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-right: 6px solid white;
	}

	/* 链接样式 */
	.link {
		color: #3086ff;
		margin-top: 10rpx;
		display: inline-block;
	}

	.fun_box {
		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		/* 防止收缩 */
		/* max-height: calc(100vh - 80upx); */
		padding-bottom: env(safe-area-inset-bottom); /* 防止内容被挡，但背景照样铺到底 */
		/* 减去 nav-bar 的高度 */
		background-color: #f5f5f5;
		position: relative;
		z-index: 50;
	}

	/* 输入框 */
	.chat-input {
		height: 100rpx;
		background-color: #f5f5f5;
		display: flex;
		align-items: center;
		padding: 10rpx 20rpx;
		gap: 20rpx;
		box-sizing: border-box;
		/* position: fixed;
  bottom: 0;
  left: 0;
  right: 0; */
		/* top: 100rpx; */
		z-index: 1;
	}

	.input {
		width: 100%;
		border-radius: 35rpx;
		height: 100%;
		font-size: 28rpx;
	}

	.input—box {
		flex: 1;
		height: 70rpx;
		background-color: white;
		padding: 0 20rpx;
	}

	.icon {
		width: 50rpx;
		height: 50rpx;
		margin-right: 20rpx;
	}

	.icon_face {
		width: 50rpx;
		height: 50rpx;
		margin-left: 20rpx;
	}

	.icon_plus {
		width: 58rpx;
		height: 58rpx;
		margin-left: 10rpx;
	}

	.drawer {
		background-color: #fff;
		border-top-left-radius: 20rpx;
		border-top-right-radius: 20rpx;
		display: flex;
		justify-content: space-around;
		transition: height 0.3s ease;
	}

	.drawer-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20rpx;
	}

	.drawer-icon {
		width: 80rpx;
		height: 80rpx;
		margin-bottom: 10rpx;
	}

	.popup_box {
		background-color: #f9f9f9;
		padding: 20rpx 0;
		border-top-left-radius: 20rpx;
		border-top-right-radius: 20rpx;
		transition: all 0.3s ease-in-out;
		/*  position: fixed;
  bottom: 100rpx; 
  left: 0;
  right: 0; */
	}

	.drawer-swiper {
		height: 360rpx;
	}

	.feature-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-around;
		padding: 0 20rpx;
	}

	.feature-item {
		width: 25%;
		margin-top: 20rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.feature-icon {
		width: 80rpx;
		height: 80rpx;
		margin-bottom: 10rpx;
	}

	.feature-text {
		font-size: 24rpx;
		color: #333;
	}

	/* 字体调节 */
	.chat-page {
		font-size: var(--global-font-size, 16px);
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
	}

	/* 弹出菜单样式 */
	.popup-menu {
		position: fixed;
		background-color: rgba(0, 0, 0, 0.8);
		border-radius: 16rpx;
		padding: 20rpx;
		z-index: 1000;
		display: flex;
		flex-direction: column;
		min-width: 200rpx;
		box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.3);
	}

	.menu-item {
		display: flex;
		align-items: center;
		padding: 16rpx 20rpx;
		color: #fff;
		font-size: 28rpx;
		border-radius: 12rpx;
		margin-bottom: 8rpx;
		transition: all 0.2s ease-out;
		cursor: pointer;
	}

	.menu-item:last-child {
		margin-bottom: 0;
	}

	.menu-item:hover {
		background-color: rgba(255, 255, 255, 0.1);
		transform: translateY(-2rpx);
	}

	.menu-item:active {
		transform: scale(0.95);
	}

	.menu-item text {
		margin-left: 16rpx;
		flex: 1;
	}

	/* 覆盖层 */
	.overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 999;
		background-color: transparent;
	}

	/* 菜单弹窗样式 */
	.menu {
		padding: 40rpx;
		background-color: #fff;
		border-radius: 20rpx;
		margin: 40rpx;
	}

	.fontChange {
		margin-top: 20rpx;
		border: 1px solid #007aff;
		padding: 20rpx;
		border-radius: 16rpx;
	}

	/* 表情内联样式 */
	.emoji-inline {
		vertical-align: middle;
		margin: 0 4rpx;
	}

	/* 表情选择器 */
	.emoji-picker {
		background-color: #fff;
		height: 360rpx;
		overflow: auto;
		display: flex;
		flex-wrap: wrap;
		padding: 20rpx;
		border-top: 1rpx solid #e0e0e0;
	}

	.emoji-item {
		width: 80rpx;
		height: 76rpx;
		margin: 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 8rpx;
		transition: background-color 0.2s;
	}

	.emoji-item:hover {
		background-color: #f5f5f5;
	}

	.emoji-item:active {
		background-color: #e0e0e0;
	}

	.emoji-img {
		width: 64rpx;
		height: 64rpx;
	}

	/* 滚动优化 */
	:deep(.scroll-auto .uni-scroll-view) {
		-webkit-overflow-scrolling: auto !important;
	}
</style>