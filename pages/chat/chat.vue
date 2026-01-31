<template>

	<view class="chat-page" :style="{ '--global-font-size': currentFontSize + 'px' }">
		<!-- 全局水印层 -->
		<WatermarkLayer />
		<!-- 顶部栏 -->
		<view v-if="!isIos" class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="back" @click="goBack">
				<image class="backimg" src="../../static/qiw/black_leftIcon.png" mode="widthFix"></image>
			</view>
			<view class="title">
				<view class="nikeName" :style="{ fontSize: rpx(36) }">
					{{guestInfo.name || "企业微信工坊"}}
				</view>
				<view class="desc" :style="{ fontSize: rpx(24) }">{{guestInfo.description}}</view>

			</view>
			<view class="icons">
				<image @click="addVideo" class="nav-icon_phone" mode="widthFix" src="/static/icon-phone.png"></image>
				<image @click="openMenu" class="nav-icon_more" src="/static/qiw/more.png"></image>
			</view>
		</view>
		<!-- isIos -->
		<view v-else class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="back" @click="goBack">
				<uni-icons type="left" color="#000" size="24"></uni-icons>
				<view class="nav-icon_phone" style="margin-right: 26upx;" />

				<!-- <image class="backimg-ios" mode="widthFix" src="/static/left.png"></image> -->
			</view>
			<view class="title-ios">
				<view class="nikeName" :style="{ fontSize: rpx(34),fontWeight:'500' }">
					{{guestInfo.name || "企业微信工坊"}}
				</view>
				<view class="desc" :style="{ fontSize: rpx(24),color: '#4bc768' }">{{guestInfo.description}}</view>
			</view>
			<view class="icons">
				<image @click="addVideo" class="nav-icon_phone" mode="widthFix" src="/static/icon-phone.png"></image>
				<uni-icons @click="openMenu" style="margin-left: 20rpx;" type="more-filled" size="24"></uni-icons>
				<!-- <uni-icons type="more-filled" @click="openMenu" class="nav-icon_more-ios" color="#fff" size="24"></uni-icons> -->
			</view>
		</view>

		<view class="chat-content">


			<scroll-view class="chat-body" :class="{'scroll-auto': activeMsgIndex!== -1}" :scroll-top="scrollTop"
				:style="chatBodyStyle" scroll-y :show-scrollbar="false" @scroll="onScroll">
				<!-- 首屏自动滚动时的加载遮罩（仅首次且确实需要滚动才显示） -->
				<view v-if="chatBodyLoading" class="chat-body-load">
					<view class="chat-body-load__inner">加载中...</view>
				</view>
				<view v-if="activeMsgIndex !== -1" class="overlay" @click="closePopupMenu"></view>
				<!-- 上方占位符 -->
				<view v-if="topPlaceholderHeight > 0" :style="{ height: topPlaceholderHeight + 'px' }"></view>
				<!-- 可见消息列表 -->
				<view v-for="msgData in visibleMessageList" :key="msgData.index"
					:data-index="msgData.index" 
					:class="['msg-item-wrapper', { 'dragging': isDragging && dragStartIndex === msgData.index, 'drag-over': dragOverIndex === msgData.index }]"
					@touchstart="onMsgTouchStart($event, msgData.index)"
					@touchmove="onMsgTouchMove($event, msgData.index)"
					@touchend="onMsgTouchEnd($event, msgData.index)">

					<!-- 时间 -->
					<view @longpress="showPopupMenu($event, msgData.index)" :style="{ fontSize: rpx(24) }"
						v-if="msgData.item.type == 'tips'" class="msg-time cell">
						<MessagePopupMenu
							:visible="activeMsgIndex === msgData.index"
							:styleObject="popupStyle"
							:actions="getMessageMenuActions(msgData.item)"
							:messageIndex="msgData.index"
							@action="handleMenuAction"
						/>
						{{msgData.item.content}}
					</view>
					<!-- tips提示 -->
					<view @longpress="showPopupMenu($event, msgData.index)" :style="{ fontSize: rpx(24) }"
						v-else-if="msgData.item.contentType == 'tips'" class="msg-tips cell">
						<MessagePopupMenu
							:visible="activeMsgIndex === msgData.index"
							:styleObject="popupStyle"
							:actions="getMessageMenuActions(msgData.item)"
							:messageIndex="msgData.index"
							@action="handleMenuAction"
						/>
						<view class="tips-content">
							你收到了{{msgData.item.content.gusetName}}的付款<text class="blueTxt"> 查看</text>
						</view>
					</view>
					<view class="orderBox cell" @longpress="showPopupMenu($event, msgData.index)"
						v-else-if="msgData.item.contentType == 'order'">
						<MessagePopupMenu
							:visible="activeMsgIndex === msgData.index"
							:styleObject="popupStyle"
							:actions="getMessageMenuActions(msgData.item)"
							:messageIndex="msgData.index"
							@action="handleMenuAction"
						/>
						<view class="msg right">
							<image class="avatar" mode="aspectFill" lazy-load
								:src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<view>
								<ExternalPayCard :orderInfo="msgData.item.content" />
								<!-- <view v-if="item.content.gusetName" class="order-tips" :style="{ fontSize: rpx(24) }">
									你收到了{{item.content.gusetName}}的付款<text class="blueTxt"> 查看</text>
								</view> -->
							</view>
						</view>

					</view>
					<!-- 转账 -->
					<view v-else-if="msgData.item.contentType == 'transfer'" @longpress="showPopupMenu($event, msgData.index)" class="cell">
						<MessagePopupMenu
							:visible="activeMsgIndex === msgData.index"
							:styleObject="popupStyle"
							:actions="getMessageMenuActions(msgData.item)"
							:messageIndex="msgData.index"
							@action="handleMenuAction"
						/>
						<view class="msg left" @longpress="showPopupMenu($event, msgData.index)" @click="goReceipt(msgData.item)"
							v-if="msgData.item.location == 0">
							<view class="avatar">
								<image mode="aspectFill" lazy-load :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<TransferCard :class="!msgData.item.content.st?'tfCardLeft':'tfCardLeftBg'" :state="msgData.item.content.st"
								:name="msgData.item.content.name" :amount="msgData.item.content.amount"></TransferCard>
						</view>
						<view class="msg right" @longpress="showPopupMenu($event, msgData.index)" @click="goReceipt(msgData.item)" v-else>
							<image class="avatar" mode="aspectFill" lazy-load
								:src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<TransferCard :class="!msgData.item.content.st?'tfCardRight':'tfCardRightBg'"
								:state="msgData.item.content.st" :name="msgData.item.content.name" :amount="msgData.item.content.amount">
							</TransferCard>

						</view>
					</view>
					<!-- 收款 -->
					<view v-else-if="msgData.item.contentType == 'wxtf'" @longpress="showPopupMenu($event, msgData.index)" class="cell">
						<MessagePopupMenu
							:visible="activeMsgIndex === msgData.index"
							:styleObject="popupStyle"
							:actions="getMessageMenuActions(msgData.item)"
							:messageIndex="msgData.index"
							@action="handleMenuAction"
						/>
						<view class="msg left" @longpress="showPopupMenu($event, msgData.index)" @click="goCollection(msgData.item)"
							v-if="msgData.item.location == 0">
							<view class="avatar">
								<image mode="aspectFill" lazy-load :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<ChTf class="tfCardLeftBg" :name="msgData.item.content.name" :amount="msgData.item.content.amount"></ChTf>
						</view>
						<view class="msg right" @longpress="showPopupMenu($event, msgData.index)" @click="goCollection(msgData.item)"
							v-else>

							<image class="avatar" mode="aspectFill" lazy-load
								:src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<ChTf class="tfCardRightBg" :name="msgData.item.content.name" :amount="msgData.item.content.amount"></ChTf>
						</view>
					</view>
					<!-- 图片photo -->

					<view v-else-if="msgData.item.contentType == 'photo'" @longpress="showPopupMenu($event, msgData.index)" class="cell">
						<MessagePopupMenu
							:visible="activeMsgIndex === msgData.index"
							:styleObject="popupStyle"
							:actions="getMessageMenuActions(msgData.item)"
							:messageIndex="msgData.index"
							@action="handleMenuAction"
						/>
						<view class="msg left" v-if="msgData.item.location == 0" @longpress="showPopupMenu($event, msgData.index)">
							<view class="avatar">
								<image mode="aspectFill" lazy-load :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<view class="photo-container leftp" :style="getImageContainerStyle(msgData.index)">
								<image :src="msgData.item.content.avatar" class="phote" mode="aspectFit" lazy-load
									:style="getImageStyle(msgData.index)" @load="onImageLoad($event, msgData.index)" />
							</view>
						</view>

						<view class="msg right" @longpress="showPopupMenu($event, msgData.index)" v-else>
							<image class="avatar" mode="aspectFill" lazy-load
								:src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<view class="photo-container rightp" :style="getImageContainerStyle(msgData.index)">
								<image :src="msgData.item.content.avatar" class="phote" mode="aspectFit" lazy-load
									:style="getImageStyle(msgData.index)" @load="onImageLoad($event, msgData.index)" />
							</view>
						</view>
					</view>
					<!-- 红包 -->
					<view v-else-if="msgData.item.contentType == 'redBag'" @click="getRB(msgData.index)" class="cell">
						<MessagePopupMenu
							:visible="activeMsgIndex === msgData.index"
							:styleObject="popupStyle"
							:actions="getMessageMenuActions(msgData.item)"
							:messageIndex="msgData.index"
							@action="handleMenuAction"
						/>
						<view class="msg left" @longpress="showPopupMenu($event, msgData.index)" v-if="msgData.item.location == 0">
							<view class="avatar">
								<image mode="aspectFill" lazy-load :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<RedBag :class="msgData.item.content?'redbagLeft':'redbagLeftBg'" :location="msgData.item.location"
								:name="guestInfo.name  + (guestInfo.description||'')" :state="msgData.item.content"></RedBag>

						</view>
						<view class="msg right" @longpress="showPopupMenu($event, msgData.index)" v-else>

							<image class="avatar" mode="aspectFill" lazy-load
								:src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<RedBag :class="msgData.item.content?'redbagRight':'redbagRightBg'" :location="msgData.item.location"
								:name="guestInfo.name + (guestInfo.description||'')" :state="msgData.item.content"></RedBag>

						</view>
					</view>
					<!-- 文件 -->
					<view v-else-if="msgData.item.contentType == 'file'" @longpress="showPopupMenu($event, msgData.index)" class="cell">
						<MessagePopupMenu
							:visible="activeMsgIndex === msgData.index"
							:styleObject="popupStyle"
							:actions="getMessageMenuActions(msgData.item)"
							:messageIndex="msgData.index"
							@action="handleMenuAction"
						/>

						<view class="msg left" @longpress="showPopupMenu($event, msgData.index)" v-if="msgData.item.location == 0">
							<view class="avatar">
								<image mode="widthFix" lazy-load :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<chatFlie class="cardLeft" :content="msgData.item.content">
							</chatFlie>
						</view>
						<view class="msg right" @longpress="showPopupMenu($event, msgData.index)" v-else>
							<image class="avatar" lazy-load :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<chatFlie class="cardRight" :content="msgData.item.content">
							</chatFlie>
						</view>
					</view>
					<!-- 语音 -->
					<view v-else-if="msgData.item.contentType == 'yuyin'" class="cell">
						<MessagePopupMenu
							:visible="activeMsgIndex === msgData.index"
							:styleObject="popupStyle"
							:actions="getMessageMenuActions(msgData.item)"
							:messageIndex="msgData.index"
							@action="handleMenuAction"
						/>
						<view class="msg left " @longpress="showPopupMenu($event, msgData.index)" v-if="msgData.item.location == 0">
							<image class="avatar" lazy-load :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							<view class="bubble"
								style="padding-top: 10rpx;display: flex;align-items: center;padding-bottom: 10rpx;">
								<view class="yuyinBox"
									:style="{ fontSize: rpx(34), width: (114 + Math.floor((msgData.item.content.time - 1) / 2) * 10) + 'rpx' }">
									<image style="margin-right: 16rpx;" class="yuyinIcon" src="/static/yuyin_0.png"
										mode="widthFix"></image>
									{{msgData.item.content.time}}"
								</view>

							</view>
						</view>
						<view class="msg right" @longpress="showPopupMenu($event, msgData.index)" v-else>
							<image class="avatar" lazy-load :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<view class="bubble"
								style="padding-top: 10rpx;display: flex;align-items: center;padding-bottom: 10rpx;">
								<view class="yuyinBox"
									:style="{  fontSize: rpx(34), width: (114 + Math.floor((msgData.item.content.time - 1) / 2) * 10) + 'rpx' }"
									style="justify-content: flex-end;">
									{{msgData.item.content.time}}"
									<image style="margin-left: 16rpx;text-align: right;" class="yuyinIcon"
										src="/static/yuyin_1.png" mode="widthFix"></image>
								</view>
							</view>
						</view>
					</view>
					<!-- 名片 -->
					<view v-else-if="msgData.item.contentType == 'crad'" @longpress="showPopupMenu($event, msgData.index)" class="cell">
						<MessagePopupMenu
							:visible="activeMsgIndex === msgData.index"
							:styleObject="popupStyle"
							:actions="getMessageMenuActions(msgData.item)"
							:messageIndex="msgData.index"
							@action="handleMenuAction"
						/>

						<view class="msg left" @longpress="showPopupMenu($event, msgData.index)" v-if="msgData.item.location == 0">
							<view class="avatar">
								<image mode="widthFix" lazy-load :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<WxCard class="cardLeft" :nickname="msgData.item.content.nickname" :avatar="msgData.item.content.avatar">
							</WxCard>
						</view>
						<view class="msg right" @longpress="showPopupMenu($event, msgData.index)" v-else>
							<image class="avatar" mode="widthFix" lazy-load
								:src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<WxCard class="cardRight" :nickname="msgData.item.content.nickname" :avatar="msgData.item.content.avatar">
							</WxCard>
						</view>
					</view>
					<!-- l、聊天 -->
					<view v-else-if="msgData.item.contentType == 'chat'" @longpress="showPopupMenu($event, msgData.index)" class="cell">
						<MessagePopupMenu
							:visible="activeMsgIndex === msgData.index"
							:styleObject="popupStyle"
							:actions="getMessageMenuActions(msgData.item)"
							:messageIndex="msgData.index"
							@action="handleMenuAction"
						/>
						<!-- 聊天内容 -->
						<view class="msg left" @longpress="showPopupMenu($event, msgData.index)" v-if="msgData.item.location == 0">
							<view class="avatar">
								<image mode="aspectFill" lazy-load :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<view class="bubble" :style="{ fontSize: rpx(34) }">
								<view>
									<template v-for="(part, partIndex) in parseMessage(msgData.item.content)">
										<text v-if="part.type === 'text'" :key="'text-' + partIndex"
											class="msg-text">{{ part.content }}</text>
										<text v-else-if="part.type === 'url'" :key="'url-' + partIndex"
											class="msg-url">{{ part.content }}</text>
										<text v-else-if="part.type === 'email'" :key="'email-' + partIndex"
											class="msg-email">{{ part.content }}</text>
										<text v-else-if="part.type === 'number'" :key="'number-' + partIndex"
											class="msg-number">{{ part.content }}</text>
										<image v-else-if="part.type === 'emoji'" :key="'emoji-' + partIndex"
											:src="getEmojiUrl(part.index,msgData.item.location)" class="emoji-inline"
											:style="{ width: rpx(40), height: rpx(40) }" />
									</template>
								</view>

							</view>
						</view>

						<view class="msg right" @longpress="showPopupMenu($event, msgData.index)" v-else>


							<image class="avatar" mode="aspectFill" lazy-load
								:src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<view class="bubble" :style="{ fontSize: rpx(34) }">
								<view>
									<template v-for="(part, partIndex) in parseMessage(msgData.item.content)">
										<text v-if="part.type === 'text'" :key="'text-' + partIndex"
											class="msg-text">{{ part.content }}</text>
										<text v-else-if="part.type === 'url'" :key="'url-' + partIndex"
											class="msg-url">{{ part.content }}</text>
										<text v-else-if="part.type === 'email'" :key="'email-' + partIndex"
											class="msg-email">{{ part.content }}</text>
										<text v-else-if="part.type === 'number'" :key="'number-' + partIndex"
											class="msg-number">{{ part.content }}</text>
										<image v-else-if="part.type === 'emoji'" :key="'emoji-' + partIndex"
											:src="getEmojiUrl(part.index,msgData.item.location)" class="emoji-inline"
											:style="{ width: rpx(40), height: rpx(40) }" />
									</template>

								</view>
							</view>
						</view>


					</view>
					<!-- 视频电话 -->
					<view v-else-if="msgData.item.contentType == 'video'" @longpress="showPopupMenu($event, msgData.index)" class="cell">
						<MessagePopupMenu
							:visible="activeMsgIndex === msgData.index"
							:styleObject="popupStyle"
							:actions="getMessageMenuActions(msgData.item)"
							:messageIndex="msgData.index"
							@action="handleMenuAction"
						/>

						<view class="msg left" @longpress="showPopupMenu($event, msgData.index)" v-if="msgData.item.location == 0">
							<view class="avatar">
								<image mode="aspectFill" lazy-load :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<view class="bubble" :style="{ fontSize: rpx(34) }">
								<view class="videobox">

									<image src="/static/qiw/video.png" :class="isIos?'videobox-ios':'videobox-and'"
										mode="widthFix" :style="{ width: rpx(50),marginRight: rpx(12)}"></image>
									通话时长
									<text>{{msgData.item.content}}</text>
								</view>

							</view>
						</view>

						<view class="msg right" @longpress="showPopupMenu($event, msgData.index)" v-else>

							<image class="avatar" mode="aspectFill" lazy-load
								:src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<view class="bubble" :style="{ fontSize: rpx(34) }">
								<view>
									<view class="videobox">
										通话时长
										<text>{{msgData.item.content}}</text>
										<image :class="isIos?'videobox-ios':'videobox-and'" style="margin-left: 16upx;"
											src="/static/qiw/video2.png" mode="widthFix"
											:style="{ width: rpx(50),marginLeft: rpx(12)}"></image>
									</view>

								</view>
							</view>
						</view>


					</view>

					<!-- <image src="/static/emoji/emoji_1_blue.png"></image> -->
				</view>
				<!-- 下方占位符 -->
				<view v-if="bottomPlaceholderHeight > 0" :style="{ height: bottomPlaceholderHeight + 'px' }"></view>
			</scroll-view>

			<!-- 底部输入栏 -->
			<view class="fun_box">
				<ChatToolBar v-if="showChatToolBar" @click="togglePopupBox" />
				<view class="chat-input" :style="{marginBottom: keyboardHeight+'px'}">
					<image class="icon" :style="{ width: rpx(60), height: rpx(60) }" src="/static/icon-voice.png"
						@click="addYuyin"></image>
					<view class="input—box" :style="{  height: rpx(70) }"><textarea class="input"
							:adjustPosition="false" v-model="inputValue" @confirm="onEnterKey" />
					</view>
					<image class="icon_face" :style="{ width: rpx(60), height: rpx(60) }" src="/static/icon-face.png"
						@click="changeEmoji">
					</image>
					<image class="icon_plus" :style="{ width: rpx(68), height: rpx(68) }" v-if="inputValue.length == 0"
						src="/static/icon-plus.png" @click="togglePopupBox"></image>
					<button class="send" @click="onEnterKey" v-if="inputValue.length>0"> 发送 </button>
				</view>
				<view class="emoji-picker" v-show="emoji">
					<view v-for="index in total" :key="index" class="emoji-item" @click="addEmojiToInput(index)">
						<image :src="getEmojiUrl(index)" class="emoji-img" />
					</view>
				</view>
				<!-- 抽屉 -->
				<view class="popup_box" v-show="openPopup">
					<swiper class="drawer-swiper" indicator-dots circular>
						<swiper-item>
							<view class="feature-section">
								<view class="feature-section-title">快捷设置</view>
								<view class="feature-grid control-grid">
									<view class="control-card">
										<view class="control-content">
											<text class="control-title">角色切换</text>
											<text class="control-desc">当前：{{isMe?"我":"客户"}}</text>
										</view>
										<switch :checked="isMe" @change="onSwitchChange" />
									</view>
									<view class="control-card">
										<view class="control-content">
											<text class="control-title">长按弹框</text>
											<text class="control-desc">{{enableLongPressPopup?"已开启":"已关闭"}}</text>
										</view>
										<switch :checked="enableLongPressPopup" @change="onLongPressPopupChange" />
									</view>
									<view class="control-card">
										<view class="control-content">
											<text class="control-title">长按拖拽消息</text>
											<text class="control-desc">{{enableLongPressDrag?"已开启":"已关闭"}}</text>
										</view>
										<switch :checked="enableLongPressDrag" @change="onLongPressDragChange" />
									</view>
								</view>
							</view>
						</swiper-item>
						<swiper-item v-for="(page, i) in featurePages" :key="i">
							<view class="feature-section">
								<view class="feature-section-title">功能面板</view>
								<view class="feature-grid action-grid">
									<view v-for="item in page" :key="item.name" class="feature-item"
										@click="onSelect(item.name)">
										<view class="feature-icon">
											<image :src="item.icon" />
										</view>
										<text class="feature-text">{{ item.label }}</text>
									</view>
								</view>
							</view>
						</swiper-item>
					</swiper>
				</view>
				<!-- 定义弹出层 -->
				<EditableFormPopup ref="orderPopup" :value="orderInfo" :fieldLabels="orderKey"
					@submit="onOrderSubmit" />
				<EditableFormPopup ref="timePopup" :value="timeInfo" :fieldLabels="timeKey" @submit="onTimeSubmit" />
				<!-- 转账 -->
				<EditableFormPopup ref="transferPopup" :value="transfer" :fieldLabels="transferKey"
					@submit="onTransferSubmit" />
				<!-- 名片 -->
				<ProfileEditPopup ref="cradPopup" @submit="onCradSubmitz"></ProfileEditPopup>
				<!-- <EditableFormPopup ref="cradPopup" :value="crad" :fieldLabels="cradKey" @submit="onCradSubmitz" /> -->
				<!-- 图片 -->
				<UploadImage ref="photoPopup" @submit="onPhotoSubmit"></UploadImage>
				<!-- 消息插入弹窗 (支持表情包) -->
				<MessageInsertPopup ref="msgPopup" @submit="addMsgSubmit" />
				<!-- 消息编辑弹窗 -->
				<MessageEditPopup ref="editMsgPopup" @submit="onEditMsgSubmit" />

				<!-- 时间编辑 -->
				<EditableFormPopup ref="videoPopup" :value="timeInfo" :fieldLabels="timeKey" @submit="onVideoSubmit" />
				<!-- 背景修改 -->
				<UploadImage ref="bgPopup" @submit="onBgSubmit"></UploadImage>
				<!-- 文件信息编辑 -->
				<FileEditPopup ref="filePopup" :fileTypes="fileTypes" @submit="onFileSubmit" />
				<!-- tips提示 -->
				<EditableFormPopup ref="tipsPopup" :value="tipsInfo" :fieldLabels="tipsKey"
					@submit="onTipsSubmit" />
				<!-- yuyin -->
				<EditableFormPopup ref="yuyinPopup" :value="yuyinInfo" :fieldLabels="yuyinKey"
					@submit="onYuyinSubmit" />
				<!-- 水印设置 -->
				<uni-popup ref="watermarkPopup" type="center">
					<view class="watermark-popup">
						<view class="wm-header">水印设置</view>
						<view class="wm-body">
							<view class="wm-row">
								<text class="wm-label">是否显示</text>
								<switch :checked="watermarkForm.visible" color="#007aff" @click.stop=""
									@change="onWatermarkVisibleChange" />
							</view>
							<view class="wm-row">
								<text class="wm-label">文字内容</text>
								<input class="wm-input" v-model="watermarkForm.text" placeholder="请输入水印文字" />
							</view>
							<view class="wm-row wm-slider-row">
								<text class="wm-label">字体大小</text>
								<view class="wm-slider">
									<slider :value="watermarkForm.fontSize" min="12" max="32" step="1"
										@change="onWatermarkFontSizeChange" @changing="onWatermarkFontSizeChange" />
									<text class="wm-hint">{{ watermarkForm.fontSize }}px</text>
								</view>
							</view>
							<view class="wm-row wm-slider-row">
								<text class="wm-label">排列密度</text>
								<view class="wm-slider">
									<slider :value="watermarkForm.spacing" min="60" max="240" step="10"
										@change="onWatermarkSpacingChange" @changing="onWatermarkSpacingChange" />
									<text class="wm-hint">{{ watermarkForm.spacing }}px</text>
								</view>
							</view>
						</view>
						<view class="wm-actions">
							<button class="wm-btn cancel" @click="closeWatermarkSettings">取消</button>
							<button class="wm-btn confirm" @click="applyWatermarkSettings">确定</button>
						</view>
					</view>
				</uni-popup>
			</view>
		</view>
		<uni-popup ref="menuPopup" background-color="#fff">
			<view class="menu" :style="{ paddingTop: statusBarHeight + 'px' }">
				<button type="primary" plain="true" @click="openBgPopup">修改背景</button>
				<!-- 滑块组件 -->
				<view class="fontChange">
					<view class="">
						字体调节
					</view>
					<slider :value="scale" :min="0.7" :max="1.5" :step="0.02" @changing="onScaleChange" />
				</view>
				<view class="toolbar-toggle">
					<text>快捷栏显示</text>
					<switch :checked="showChatToolBar" @change="onChatToolBarToggle" />
				</view>
				<view class="watermark-settings-entry">
					<button type="default" plain="true" @click="openWatermarkSettings">水印设置</button>
				</view>
			</view>
		</uni-popup>
	</view>
</template>

<script>
	import ExternalPayCard from '../../components/ExternalPayCard/ExternalPayCard.vue'; // 路径根据你存放的位置调整
	import EditableFormPopup from '../../components/EditableFormPopup/EditableFormPopup.vue';
	import ChatToolBar from '../../components/ChatToolBar/ChatToolBar.vue'
	import TransferCardVue from '../../components/TransferCard/TransferCard.vue';
	import UploadImage from '../../components/UploadImage/UploadImage.vue';
	import WxCard from '../../components/WxCard/WxCard.vue';
	import ChTf from '../../components/ChTf/ChTf.vue';
	import RedBag from '../../components/RedBag/RedBag.vue';
	import ProMsgEditPopup from '../../components/ProMsgEditPopup/ProMsgEditPopup.vue';
	import MessageEditPopup from '../../components/MessageEditPopup/MessageEditPopup.vue';
	import MessageInsertPopup from '../../components/MessageInsertPopup/MessageInsertPopup.vue';
	import FileEditPopup from '../../components/FileEditPopup/FileEditPopup.vue';
	import scaleMixin from '@/mixins/scaleMixin.js'
	import {
		setScale
	} from '@/utils/scale.js'
	import chatFlie from '../../components/chatFlie/chatFlie.vue';
	import MessagePopupMenu from '../../components/MessagePopupMenu/MessagePopupMenu.vue';
	import {
		getUserInfo,
		login
	} from '@/api/index.js'
	import {
		uploadImage,
		updateConversation
	} from '@/api/conversations.js'
	export default {
		mixins: [scaleMixin],
		components: {
			ExternalPayCard,
			EditableFormPopup,
			ChatToolBar,
			TransferCardVue,
			WxCard,
			ChTf,
			RedBag,
			ProMsgEditPopup,
			MessageEditPopup,
			MessageInsertPopup,
			FileEditPopup,
			chatFlie,
			MessagePopupMenu
		},
		onLoad(options) {

			if (options.guestInfo) {
				try {
					const rawGuestInfo = options.guestInfo;
					let parsedGuestInfo;
					try {
						parsedGuestInfo = JSON.parse(decodeURIComponent(rawGuestInfo));
					} catch (_) {
						// 兼容已经被解码或未编码的场景
						parsedGuestInfo = JSON.parse(rawGuestInfo);
					}
					this.guestInfo = parsedGuestInfo;
					console.log(this.guestInfo);
					this.massageList = JSON.parse(this.guestInfo.content || '[]') || [];
					// 初始化虚拟滚动
					this.$nextTick(() => {
						this.initVirtualScroll();
					});
				} catch (e) {
					console.error('guestInfo 参数解析失败', e, options.guestInfo);
					this.massageList = [];
					this.updateMsg();
				}
			}
			// 获取账号信息
			const userId = uni.getStorageSync('userId')
			console.log(userId);
			this.getUserInfo(userId)
			this.isIos = uni.getSystemInfoSync().platform === 'ios'
			if (!this.isIos) {
				this.keyboardHeight = 10
			}
			uni.onKeyboardHeightChange(res => {
				if (res.height == 0) {
					// console.log();)
					this.keyboardHeight = this.isIos ? 0 : 10;
				} else {
					this.emoji = false
					this.openPopup = false
					const safeAreaBottom = this.getSafeAreaInsetBottom();
					this.keyboardHeight = res.height - safeAreaBottom;
				}
			});

			// 读取本地存储的水印设置
			this.loadWatermarkSettings();

			this.$forceUpdate()


		},
		data() {
			return {
				isIos: false,
				showChatToolBar: true,
				currentFontSize: 16, // 默认字体大小
				scrollTop: 0,
				chatBodyLoading: false,
				_hasInitialAutoScroll: false,
				contentbg: "null",


				keyboardHeight: 0,
				userInfo: {},

				guestInfo: {},
				isMe: false,
				openPopup: false,
				inputValue: "",

				massageList: [{
					type: "content",
					contentType: "yuyin",
					location: 1,
					content: {
						time: 12
					}
				}],
				// 虚拟滚动相关
				virtualScrollEnabled: true, // 是否启用虚拟滚动（消息数量超过阈值时启用）
				virtualScrollThreshold: 50, // 启用虚拟滚动的消息数量阈值
				visibleStartIndex: 0, // 可见区域起始索引
				visibleEndIndex: 0, // 可见区域结束索引
				scrollBuffer: 5, // 缓冲区消息数量（上下各保留5条）
				estimatedItemHeight: 100, // 估算的每条消息高度（px）
				containerHeight: 0, // 容器高度
				scrollPosition: 0, // 当前滚动位置
				scrollTimer: null, // 滚动节流定时器
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
				tipsInfo: {
					gusetName: ""
				},
				tipsKey: {
					gusetName: "付款人名称"
				},

				// 消息编辑相关数据
				editMsgIndex: -1, // 编辑的消息索引

				transfer: {
					name: "",
					amount: ""
				},
				transferKey: {
					name: "用户名",
					amount: "转账金额"
				},
				crad: {
					name: "",
				},
				cradKey: {
					name: "用户名",
				},
				// 弹出菜单相关数据
				popupStyle: {},
				popupVisible: false,
				menuItems: [{
						name: 'delete',
						label: '删除',
						icon: '/static/icon-delete.png'
					},
					{
						name: 'insertTime',
						label: '插入时间',
						icon: '/static/icon-time.png'
					},
					{
						name: 'toggleRole',
						label: '切换角色',
						icon: '/static/icon-contacts.png'
					}
				],
				// 不同消息类型的菜单配置
				messageMenuActions: {
					// 时间消息
					tips: [
						{ icon: 'close', label: '删除', method: 'deleteMessage_1' },
						{ icon: 'chatbubble', label: '消息插入', method: 'addMsg' },
						{ icon: 'chat', label: '时间编辑', method: 'changeMsg' },
						{ icon: 'wallet', label: '插入收款', method: 'insertOrder' },
						{ icon: 'wallet', label: '插入转账', method: 'insertTransfer' },
						{ icon: 'folder', label: '插入文件', method: 'insertFile' },
						{ icon: 'wallet', label: '插入红包', method: 'insertRedBag' }
					],
					// 提示消息
					tipsContent: [
						{ icon: 'close', label: '删除', method: 'deleteMessage_1' },
						{ icon: 'chatbubble', label: '消息插入', method: 'addMsg' },
						{ icon: 'chat', label: '编辑', method: 'editTips' },
						{ icon: 'wallet', label: '插入收款', method: 'insertOrder' },
						{ icon: 'wallet', label: '插入转账', method: 'insertTransfer' },
						{ icon: 'folder', label: '插入文件', method: 'insertFile' },
						{ icon: 'wallet', label: '插入红包', method: 'insertRedBag' }
					],
					// 订单消息
					order: [
						{ icon: 'close', label: '删除', method: 'deleteMessage_1' },
						{ icon: 'info', label: '插入时间', method: 'insertTime' },
						{ icon: 'person', label: '切换角色', method: 'toggleRole' },
						{ icon: 'chatbubble', label: '消息插入', method: 'addMsg' },
						{ icon: 'wallet', label: '插入收款', method: 'insertOrder' },
						{ icon: 'wallet', label: '插入转账', method: 'insertTransfer' },
						{ icon: 'folder', label: '插入文件', method: 'insertFile' },
						{ icon: 'wallet', label: '插入红包', method: 'insertRedBag' }
					],
					// 转账消息
					transfer: [
						{ icon: 'close', label: '删除', method: 'deleteMessage_1' },
						{ icon: 'info', label: '插入时间', method: 'insertTime' },
						{ icon: 'person', label: '切换角色', method: 'toggleRole' },
						{ icon: 'chatbubble', label: '消息插入', method: 'addMsg' },
						{ icon: 'wallet', label: '收款', method: 'resTransfer' },
						{ icon: 'wallet', label: '插入收款', method: 'insertOrder' },
						{ icon: 'wallet', label: '插入转账', method: 'insertTransfer' },
						{ icon: 'folder', label: '插入文件', method: 'insertFile' },
						{ icon: 'wallet', label: '插入红包', method: 'insertRedBag' }
					],
					// 聊天消息
					chat: [
						{ icon: 'close', label: '删除', method: 'deleteMessage_1' },
						{ icon: 'info', label: '插入时间', method: 'insertTime' },
						{ icon: 'person', label: '切换角色', method: 'toggleRole' },
						{ icon: 'chat', label: '消息编辑', method: 'changeMsg' },
						{ icon: 'chatbubble', label: '消息插入', method: 'addMsg' },
						{ icon: 'wallet', label: '插入收款', method: 'insertOrder' },
						{ icon: 'wallet', label: '插入转账', method: 'insertTransfer' },
						{ icon: 'folder', label: '插入文件', method: 'insertFile' },
						{ icon: 'wallet', label: '插入红包', method: 'insertRedBag' }
					],
					// 收款消息
					wxtf: [
						{ icon: 'close', label: '删除', method: 'deleteMessage_1' },
						{ icon: 'info', label: '插入时间', method: 'insertTime' },
						{ icon: 'person', label: '切换角色', method: 'toggleRole' },
						{ icon: 'chatbubble', label: '消息插入', method: 'addMsg' },
						{ icon: 'wallet', label: '插入收款', method: 'insertOrder' },
						{ icon: 'wallet', label: '插入转账', method: 'insertTransfer' },
						{ icon: 'folder', label: '插入文件', method: 'insertFile' },
						{ icon: 'wallet', label: '插入红包', method: 'insertRedBag' }
					],
					// 视频电话消息
					video: [
						{ icon: 'close', label: '删除', method: 'deleteMessage_1', triggerOnTouchStart: true },
						{ icon: 'info', label: '插入时间', method: 'insertTime' },
						{ icon: 'person', label: '切换角色', method: 'toggleRole' },
						{ icon: 'chatbubble', label: '消息插入', method: 'addMsg' },
						{ icon: 'chat', label: '消息编辑', method: 'changeMsg' },
						{ icon: 'wallet', label: '插入收款', method: 'insertOrder' },
						{ icon: 'wallet', label: '插入转账', method: 'insertTransfer' },
						{ icon: 'folder', label: '插入文件', method: 'insertFile' },
						{ icon: 'wallet', label: '插入红包', method: 'insertRedBag' }
					],
					// 语音消息
					yuyin: [
						{ icon: 'close', label: '删除', method: 'deleteMessage_1' },
						{ icon: 'info', label: '插入时间', method: 'insertTime' },
						{ icon: 'person', label: '切换角色', method: 'toggleRole' },
						{ icon: 'chatbubble', label: '消息插入', method: 'addMsg' },
						{ icon: 'wallet', label: '插入收款', method: 'insertOrder' },
						{ icon: 'wallet', label: '插入转账', method: 'insertTransfer' },
						{ icon: 'folder', label: '插入文件', method: 'insertFile' },
						{ icon: 'wallet', label: '插入红包', method: 'insertRedBag' }
					],
					// 名片消息
					crad: [
						{ icon: 'close', label: '删除', method: 'deleteMessage_1' },
						{ icon: 'info', label: '插入时间', method: 'insertTime' },
						{ icon: 'person', label: '切换角色', method: 'toggleRole' },
						{ icon: 'chatbubble', label: '消息插入', method: 'addMsg' },
						{ icon: 'wallet', label: '插入收款', method: 'insertOrder' },
						{ icon: 'wallet', label: '插入转账', method: 'insertTransfer' },
						{ icon: 'folder', label: '插入文件', method: 'insertFile' },
						{ icon: 'wallet', label: '插入红包', method: 'insertRedBag' }
					],
					// 红包消息
					redBag: [
						{ icon: 'close', label: '删除', method: 'deleteMessage_1' },
						{ icon: 'info', label: '插入时间', method: 'insertTime' },
						{ icon: 'person', label: '切换角色', method: 'toggleRole' },
						{ icon: 'chatbubble', label: '消息插入', method: 'addMsg' },
						{ icon: 'wallet', label: '插入红包', method: 'insertRedBag' },
						{ icon: 'wallet', label: '插入收款', method: 'insertOrder' },
						{ icon: 'wallet', label: '插入转账', method: 'insertTransfer' },
						{ icon: 'folder', label: '插入文件', method: 'insertFile' },
						{ icon: 'wallet', label: '插入红包', method: 'insertRedBag' }
					],
					// 文件消息
					file: [
						{ icon: 'close', label: '删除', method: 'deleteMessage_1' },
						{ icon: 'info', label: '插入时间', method: 'insertTime' },
						{ icon: 'person', label: '切换角色', method: 'toggleRole' },
						{ icon: 'chatbubble', label: '消息插入', method: 'addMsg' },
						{ icon: 'folder', label: '插入文件', method: 'insertFile' },
						{ icon: 'wallet', label: '插入收款', method: 'insertOrder' },
						{ icon: 'wallet', label: '插入转账', method: 'insertTransfer' },
						{ icon: 'folder', label: '插入文件', method: 'insertFile' },
						{ icon: 'wallet', label: '插入红包', method: 'insertRedBag' }
					],
					// 默认配置（用于其他类型）
					default: [
						{ icon: 'close', label: '删除', method: 'deleteMessage_1' },
						{ icon: 'info', label: '插入时间', method: 'insertTime' },
						{ icon: 'person', label: '切换角色', method: 'toggleRole' },
						{ icon: 'chatbubble', label: '消息插入', method: 'addMsg' },
						{ icon: 'wallet', label: '插入收款', method: 'insertOrder' },
						{ icon: 'wallet', label: '插入转账', method: 'insertTransfer' },
						{ icon: 'folder', label: '插入文件', method: 'insertFile' },
						{ icon: 'wallet', label: '插入红包', method: 'insertRedBag' }

					]
				},
				// 新增数据属性
				timePopupVisible: false,
				currentTime: '',




				// 弹出菜单相关
				activeMsgIndex: -1,
				currentActionIndex: -1,
				enableLongPressPopup: true, // 控制长按弹框功能
				enableLongPressDrag: false, // 控制长按拖拽功能
				
				// 拖拽相关
				dragStartIndex: -1, // 拖拽开始的消息索引
				dragOverIndex: -1, // 拖拽悬停的消息索引
				isDragging: false, // 是否正在拖拽
				dragStartY: 0, // 拖拽开始的Y坐标
				longPressTimer: null, // 长按定时器
				touchStartTime: 0, // 触摸开始时间

				// 表情相关
				emoji: false,
				total: 0,

				// 功能列表
				featureList: [{
						name: "order",
						label: "对外收款",
						icon: "/static/icon-order.png"
					},
					
					{
						name: "tips",
						label: "对外收款提示",
						icon: "/static/icon-time.png"
					},
					{
						name: "time",
						label: "时间",
						icon: "/static/icon-time.png"
					},
					{
						name: "transfer",
						label: "转账",
						icon: "/static/icon-transfer.png"
					},
					{
						name: "photo",
						label: "图片",
						icon: "/static/icon-photo.png"
					},
					{
						name: "contact",
						label: "名片",
						icon: "/static/icon-contacts.png"
					},
					{
						name: "redBag",
						label: "红包",
						icon: "/static/redBag.png"
					},
					{
						name: "file",
						label: "文件",
						icon: "/static/qiw/fs_.png"
					}
				],

				// 文件相关数据
				fileInfo: {
					fileType: "文档",
					fileName: "",
					fileSize: ""
				},
				fileTypes: ["文件", "图片", "PDF", "EXCEL表格", "文档", "其他"],
				watermarkVisible: false,
				watermarkText: '测试水印',
				watermarkSpacing: 180,
				watermarkFontSize: 16,
				watermarkForm: {
					visible: false,
					text: '测试水印',
					spacing: 180,
					fontSize: 16
				},
				// 存储每张图片的显示尺寸
				imageSizes: {}
			};
		},
		computed: {
			featurePages() {
				const pageSize = 6;
				const pages = [];
				for (let i = 0; i < this.featureList.length; i += pageSize) {
					pages.push(this.featureList.slice(i, i + pageSize));
				}
				return pages;
			},
			// 虚拟滚动：计算可见的消息列表
			visibleMessageList() {
				// 如果消息数量少于阈值或未启用虚拟滚动，返回全部消息
				if (!this.virtualScrollEnabled || this.massageList.length <= this.virtualScrollThreshold) {
					return this.massageList.map((item, index) => ({ item, index, isVisible: true }));
				}
				
				// 计算可见范围
				const start = Math.max(0, this.visibleStartIndex - this.scrollBuffer);
				const end = Math.min(this.massageList.length, this.visibleEndIndex + this.scrollBuffer);
				
				// 返回可见消息及其原始索引
				return this.massageList.slice(start, end).map((item, relativeIndex) => ({
					item,
					index: start + relativeIndex,
					isVisible: true
				}));
			},
			// 计算上方占位符高度
			topPlaceholderHeight() {
				if (!this.virtualScrollEnabled || this.massageList.length <= this.virtualScrollThreshold) {
					return 0;
				}
				return this.visibleStartIndex * this.estimatedItemHeight;
			},
			// 计算下方占位符高度
			bottomPlaceholderHeight() {
				if (!this.virtualScrollEnabled || this.massageList.length <= this.virtualScrollThreshold) {
					return 0;
				}
				const remaining = this.massageList.length - this.visibleEndIndex;
				return remaining * this.estimatedItemHeight;
			},
			watermarkPattern() {
				const text = (this.watermarkText || '').trim() || ' ';
				const spacing = Math.max(60, Number(this.watermarkSpacing) || 180);
				const fontSize = Number(this.watermarkFontSize) || 16;
				const height = Math.max(40, Math.round(spacing * 0.7));
				const svg =
					`<svg width="${spacing}" height="${height}" xmlns="http://www.w3.org/2000/svg"><text x="50%" y="50%" font-size="${fontSize}" fill="rgba(0,0,0,0.12)" text-anchor="middle" dominant-baseline="middle" transform="rotate(-20 ${spacing / 2} ${height / 2})" font-family="-apple-system, BlinkMacSystemFont, PingFang SC, Helvetica Neue, Microsoft YaHei, Roboto, Noto Sans CJK SC, sans-serif">${text}</text></svg>`;
				return `data:image/svg+xml,${encodeURIComponent(svg)}`;
			},
			chatBodyStyle() {
				const style = {};
				const backgrounds = [];
				const sizes = [];
				const repeats = [];
				const positions = [];

				const hasCustomBackground = this.contentbg && this.contentbg !== 'null';

				if (this.watermarkVisible) {
					backgrounds.push(`url("${this.watermarkPattern}")`);
					sizes.push(
						`${Math.max(60, Number(this.watermarkSpacing) || 180)}px ${Math.max(40, Math.round((Number(this.watermarkSpacing) || 180) * 0.7))}px`
						);
					repeats.push('repeat');
					positions.push('0 0');
				}

				if (hasCustomBackground) {
					backgrounds.push(`url("${this.contentbg}")`);
					sizes.push('100% 100%');
					repeats.push('no-repeat');
					positions.push('center center');
				}

				if (backgrounds.length) {
					style.backgroundImage = backgrounds.join(', ');
					style.backgroundSize = sizes.join(', ');
					style.backgroundRepeat = repeats.join(', ');
					style.backgroundPosition = positions.join(', ');
				}

				return style;
			}
		},
		mounted() {
			// 初始化虚拟滚动
			this.initVirtualScroll();
			this.scrollToBottom({ initial: true });
			// 初始化表情总数
			this.total = 331; // 根据static/emoji文件夹中的表情数量
		},
		methods: {
			openWatermarkSettings() {
				this.watermarkForm = {
					visible: this.watermarkVisible,
					text: this.watermarkText,
					spacing: this.watermarkSpacing,
					fontSize: this.watermarkFontSize
				};
				this.$refs.watermarkPopup.open();
				this.$refs.menuPopup.close();
			},
			closeWatermarkSettings() {
				this.$refs.watermarkPopup.close();
			},
			onWatermarkVisibleChange(event) {
				this.watermarkForm.visible = event.detail.value;
			},
			onWatermarkSpacingChange(event) {
				const raw = event?.detail?.value;
				if (typeof raw === 'number') {
					this.watermarkForm.spacing = raw;
				}
			},
			onWatermarkFontSizeChange(event) {
				const raw = event?.detail?.value;
				if (typeof raw === 'number') {
					this.watermarkForm.fontSize = raw;
				}
			},
			applyWatermarkSettings() {
				this.watermarkVisible = this.watermarkForm.visible;
				this.watermarkText = this.watermarkForm.text;
				this.watermarkSpacing = this.watermarkForm.spacing;
				this.watermarkFontSize = this.watermarkForm.fontSize;

				// 保存水印设置到本地存储
				this.saveWatermarkSettings();

				this.closeWatermarkSettings();
			},

			// 读取本地存储的水印设置
			loadWatermarkSettings() {
				try {
					const savedSettings = uni.getStorageSync('watermarkSettings');
					if (savedSettings) {
						// 处理不同的存储格式（可能是字符串或对象）
						let settings = savedSettings;
						if (typeof savedSettings === 'string') {
							settings = JSON.parse(savedSettings);
						}

						// 如果本地有保存的设置，则使用保存的值
						if (settings && typeof settings === 'object') {
							if (settings.visible !== undefined) {
								this.watermarkVisible = settings.visible;
							}
							if (settings.text !== undefined && settings.text !== '') {
								this.watermarkText = settings.text;
							}
							if (settings.spacing !== undefined) {
								this.watermarkSpacing = Number(settings.spacing) || 180;
							}
							if (settings.fontSize !== undefined) {
								this.watermarkFontSize = Number(settings.fontSize) || 16;
							}
							console.log('已加载本地水印设置:', settings);
						}
					}
				} catch (error) {
					console.error('读取水印设置失败:', error);
					// 如果读取失败，使用默认值
					console.log('使用默认水印设置');
				}
			},

			// 保存水印设置到本地存储
			saveWatermarkSettings() {
				try {
					const settings = {
						visible: this.watermarkVisible,
						text: this.watermarkText,
						spacing: this.watermarkSpacing,
						fontSize: this.watermarkFontSize
					};
					uni.setStorageSync('watermarkSettings', JSON.stringify(settings));
					console.log('已保存水印设置到本地:', settings);
				} catch (error) {
					console.error('保存水印设置失败:', error);
					uni.showToast({
						title: '保存设置失败',
						icon: 'none'
					});
				}
			},
			// 计算图片显示尺寸（参数为 upx 单位）
			calculateImageSize(originalWidth, originalHeight, imageKey) {
				const maxWidth = 270; // upx
				const maxHeight = 300; // upx
				const minWidth = 80; // upx
				const minHeight = 80; // upx

				let displayWidth = originalWidth;
				let displayHeight = originalHeight;

				// 如果宽或高超出最大限制，则按比例缩小
				if (displayWidth > maxWidth || displayHeight > maxHeight) {
					const widthRatio = maxWidth / displayWidth;
					const heightRatio = maxHeight / displayHeight;
					const ratio = Math.min(widthRatio, heightRatio);
					displayWidth = displayWidth * ratio;
					displayHeight = displayHeight * ratio;
				}

				// 如果宽和高同时小于最小限制，则按比例放大
				if (displayWidth < minWidth && displayHeight < minHeight) {
					const widthRatio = minWidth / displayWidth;
					const heightRatio = minHeight / displayHeight;
					const ratio = Math.max(widthRatio, heightRatio);
					displayWidth = displayWidth * ratio;
					displayHeight = displayHeight * ratio;
				}

				// 确保最终尺寸在限制范围内
				displayWidth = Math.max(minWidth, Math.min(maxWidth, displayWidth));
				displayHeight = Math.max(minHeight, Math.min(maxHeight, displayHeight));

				// 存储计算后的尺寸
				if (imageKey) {
					this.$set(this.imageSizes, imageKey, {
						width: displayWidth,
						height: displayHeight
					});
				}

				return {
					width: displayWidth,
					height: displayHeight
				};
			},

			// 图片加载完成事件处理
			onImageLoad(event, index) {
				try {
					const imageKey = `image_${index}`;
					const {
						width,
						height
					} = event.detail || {};

					// 验证尺寸有效性
					if (!width || !height || width <= 0 || height <= 0) {
						console.warn('图片尺寸无效', {
							width,
							height,
							index
						});
						return;
					}

					// 将像素单位转换为 upx
					// uni-app 中，设计稿基准为 750px
					// 转换公式：upx = (px / screenWidth) * designWidth
					const systemInfo = uni.getSystemInfoSync();
					const screenWidth = systemInfo.windowWidth || 375; // 设备屏幕宽度（px）
					const designWidth = 750; // 设计稿宽度（upx）

					// 将像素转换为 upx
					const upxWidth = (width / screenWidth) * designWidth;
					const upxHeight = (height / screenWidth) * designWidth;

					// 计算显示尺寸
					this.calculateImageSize(upxWidth, upxHeight, imageKey);

					// 强制更新视图
					this.$forceUpdate();
				} catch (error) {
					console.error('处理图片加载事件失败:', error);
				}
			},

			// 获取图片容器样式
			getImageContainerStyle(index) {
				const imageKey = `image_${index}`;
				const size = this.imageSizes[imageKey];

				const baseStyle = {
					overflow: 'hidden'
				};

				if (size && size.width && size.height) {
					// 动态计算 border-radius，确保不超过高度的一半，最小值为 8rpx
					const borderRadius = Math.max(8, Math.min(15, size.height / 2));
					return {
						...baseStyle,
						borderRadius: borderRadius + 'rpx',
						width: size.width + 'upx',
						height: size.height + 'upx',
						maxWidth: '270upx',
						maxHeight: '300upx',
						minWidth: '80upx',
						minHeight: '80upx'
					};
				}
				// 如果还没有计算尺寸，返回默认值
				return {
					...baseStyle,
					borderRadius: '15rpx',
					width: '120upx',
					height: 'auto',
					maxWidth: '270upx',
					maxHeight: '300upx',
					minWidth: '80upx',
					minHeight: '80upx'
				};
			},

			// 获取图片样式
			getImageStyle(index) {
				const imageKey = `image_${index}`;
				const size = this.imageSizes[imageKey];

				const baseStyle = {
					width: '100%',
					height: '100%',
					display: 'block'
				};

				if (size && size.width && size.height) {
					// 动态计算 border-radius，确保不超过高度的一半，最小值为 8rpx
					const borderRadius = Math.max(8, Math.min(15, size.height / 2));
					return {
						...baseStyle,
						borderRadius: borderRadius + 'rpx'
					};
				}
				// 如果还没有计算尺寸，返回默认值
				return {
					...baseStyle,
					borderRadius: '15rpx',
					height: 'auto'
				};
			},

			onYuyinSubmit(data) {
				const location = this.isMe ? 1 : 0;
				const transferInfo = {
					type: "content", // tips, content
					contentType: "yuyin", //order , chat ,link
					location, // 1 表示我方
					content: {
						time: parseInt(data.time)
					}
				};
				console.log(data);
				this.massageList.push(transferInfo);
				this.updateMsg()
			},
			addYuyin() {
				this.$refs.yuyinPopup.open();
			},
			onScaleChange(e) {
				const scale = e.detail.value
				// setScale(this.scale)
				this.$store.commit('setScale', scale)
			},
			onChatToolBarToggle(e) {
				this.showChatToolBar = e.detail.value
			},
			// 滚动事件处理（虚拟滚动）
			onScroll(e) {
				if (!this.virtualScrollEnabled || this.massageList.length <= this.virtualScrollThreshold) {
					return;
				}
				
				const scrollTop = e.detail.scrollTop;
				this.scrollPosition = scrollTop;
				
				// 使用节流优化性能
				clearTimeout(this.scrollTimer);
				this.scrollTimer = setTimeout(() => {
					this.updateVisibleRange(scrollTop);
				}, 50);
			},
			
			// 更新可见区域范围
			updateVisibleRange(scrollTop) {
				// 计算可见区域的起始和结束索引
				const startIndex = Math.floor(scrollTop / this.estimatedItemHeight);
				const visibleCount = Math.ceil(this.containerHeight / this.estimatedItemHeight) + this.scrollBuffer * 2;
				
				this.visibleStartIndex = Math.max(0, startIndex - this.scrollBuffer);
				this.visibleEndIndex = Math.min(this.massageList.length, startIndex + visibleCount);
			},
			
			// 初始化虚拟滚动
			initVirtualScroll() {
				if (this.massageList.length <= this.virtualScrollThreshold) {
					this.virtualScrollEnabled = false;
					return;
				}
				
				this.virtualScrollEnabled = true;
				
				// 获取容器高度
				this.$nextTick(() => {
					uni.createSelectorQuery().select('.chat-body')
						.boundingClientRect((res) => {
							if (res) {
								this.containerHeight = res.height;
								// 初始化可见范围（默认显示最后的消息）
								this.visibleEndIndex = this.massageList.length;
								this.visibleStartIndex = Math.max(0, this.massageList.length - Math.ceil(this.containerHeight / this.estimatedItemHeight) - this.scrollBuffer * 2);
							}
						})
						.exec();
				});
			},
			
			scrollToBottom(opts = {}) {
				// 确保DOM更新完成
				this.$nextTick(() => {
					// 使用定时器延迟执行，确保DOM完全渲染
					setTimeout(() => {
						uni.createSelectorQuery().select('.chat-body')
							.fields({
								size: true, // 获取元素尺寸
								scrollOffset: true // 获取滚动位置和内容尺寸
							}, res => {
								if (!res) return;
								
								console.log('内容总高度:', res.scrollHeight);
								console.log('可视区域高度:', res.height);
								console.log('当前滚动位置:', res.scrollTop);
								
								// 更新容器高度（用于虚拟滚动）
								if (res.height) {
									this.containerHeight = res.height;
								}
								
								// 只有当内容高度明显超过可视区域高度时（容差10px），才滚动到底部
								const threshold = 10; // 容差值，单位px
								const shouldScroll = res.scrollHeight > res.height + threshold;

								// 刚进入页面且确实需要滚动时，在 chat-body 显示 load
								if (opts.initial && !this._hasInitialAutoScroll && shouldScroll) {
									this.chatBodyLoading = true;
								}

								if (shouldScroll) {
									console.log('滚动到底部');
									this.scrollTop = res.scrollHeight;
									
									// 如果是虚拟滚动，更新可见范围到底部
									if (this.virtualScrollEnabled) {
										this.visibleEndIndex = this.massageList.length;
										this.visibleStartIndex = Math.max(0, this.massageList.length - Math.ceil(this.containerHeight / this.estimatedItemHeight) - this.scrollBuffer * 2);
									}

									// 首屏滚动完成后关闭 load
									if (opts.initial && !this._hasInitialAutoScroll) {
										this._hasInitialAutoScroll = true;
										setTimeout(() => {
											this.chatBodyLoading = false;
										}, 60);
									}
								} else {
									console.log('内容未超出，不滚动');
									// 不需要滚动也标记首屏已处理，避免后续误触发
									if (opts.initial && !this._hasInitialAutoScroll) {
										this._hasInitialAutoScroll = true;
										this.chatBodyLoading = false;
									}
								}
							})
							.exec();
					}, 100)
				});
			},
			openBgPopup() {
				this.$refs.bgPopup.open()
				this.$refs.menuPopup.close()
			},
			openMenu() {
				this.$refs.menuPopup.open('top')
			},
			getRB(i) {

				this.massageList[i].content = !this.massageList[i].content
				this.updateMsg()
			},
			resTransfer(i) {
				if (this.massageList[i].content.st) return;
				const temp = JSON.parse(JSON.stringify(this.massageList[i]))
				this.massageList[i].content.st = true
				temp.contentType = 'wxtf'
				temp.location = this.isMe ? 0 : 1;
				this.massageList.push(temp)
				// 删掉 i 位置的数据 在 i这里插入两条
				this.updateMsg()
			},
			goReceipt(item) {
				// console.log(item);
				uni.navigateTo({
					url: "/pages/receipt/receipt?info=" + encodeURIComponent(JSON.stringify(item.content))
				})
			},
			goCollection(item) {
				console.log("---");
				uni.navigateTo({
					url: "/pages/collectionSuccess/collectionSuccess?info=" + encodeURIComponent(JSON.stringify(
						item.content))
				})
			},
			updateMsg() {
				this.guestInfo.content = JSON.stringify(this.massageList)

				updateConversation(this.guestInfo.conversationId, this.guestInfo)
			},
			deleteMessage_1(index) {
				console.log(index);
				this.massageList.splice(index, 1);
				this.activeMsgIndex = -1; // 清除激活状态
				this.popupVisible = false;
				this.updateMsg()
			},


			showPopupMenu(e, index) {
				// 如果长按弹框功能被关闭，或者长按拖拽功能已开启，则不显示弹框
				if (!this.enableLongPressPopup || this.enableLongPressDrag) {
					return;
				}

				// 获取触摸坐标，适配弹出菜单位置
				const touch = e.touches?.[0] || {};
				const clientX = touch.clientX || 0;
				const clientY = touch.clientY || 0;

				// 获取窗口尺寸
				const systemInfo = uni.getSystemInfoSync();
				const windowWidth = systemInfo.windowWidth;
				const windowHeight = systemInfo.windowHeight;

				// 菜单最大宽度为视口的90%
				const maxMenuWidth = windowWidth * 0.9;
				// 估算每个菜单项的宽度（图标+文字+padding）
				const estimatedItemWidth = 100; // px
				// 获取当前消息的菜单项数量
				const currentMsg = this.massageList[index];
				const menuActions = this.getMessageMenuActions(currentMsg);
				const itemCount = menuActions.length;
				
				// 估算菜单实际宽度（考虑换行）
				// 如果菜单项总宽度超过最大宽度，会换行，实际宽度就是最大宽度
				const estimatedMenuWidth = Math.min(
					itemCount * estimatedItemWidth + 40, // 40px 是 padding
					maxMenuWidth
				);

				// 计算菜单位置，确保不超出屏幕
				// 优先以触摸点为中心，但如果会超出边界则调整
				let left = clientX - estimatedMenuWidth / 2;
				
				// 确保不超出左边界
				if (left < 10) {
					left = 10;
				}
				
				// 确保不超出右边界
				if (left + estimatedMenuWidth > windowWidth - 10) {
					left = windowWidth - estimatedMenuWidth - 10;
				}

				// 计算顶部位置，确保不超出视口
				let top = clientY - 80;
				const estimatedMenuHeight = Math.ceil(itemCount / Math.floor(maxMenuWidth / estimatedItemWidth)) * 100 + 30; // 估算高度
				
				// 如果菜单会超出底部，则显示在触摸点上方
				if (top + estimatedMenuHeight > windowHeight - 20) {
					top = clientY - estimatedMenuHeight - 20;
				}
				
				// 确保不超出顶部
				if (top < 10) {
					top = 10;
				}

				// 设置菜单样式
				this.popupStyle = {
					left: `${left}px`,
					top: `${top}px`,
					opacity: 0,
					transform: 'scale(0.8)',
					transition: 'all 0.2s ease-out',
					maxWidth: `${maxMenuWidth}px`
				};

				// 延迟设置可见性，以便动画效果生效
				this.activeMsgIndex = index;
				this.popupVisible = true;

				// 触发重绘后设置最终样式
				setTimeout(() => {
					this.popupStyle = {
						...this.popupStyle,
						opacity: 1,
						transform: 'scale(1)'
					};
				}, 10);
			},
			closePopupMenu() {
				console.log("0000");
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
					this.popupVisible = false;
				}, 200);
			},
			// 获取消息类型的菜单配置
			getMessageMenuActions(item) {
				if (item.type === 'tips') {
					return this.messageMenuActions.tips;
				} else if (item.contentType === 'tips') {
					return this.messageMenuActions.tipsContent;
				} else if (item.contentType === 'order') {
					return this.messageMenuActions.order;
				} else if (item.contentType === 'transfer') {
					return this.messageMenuActions.transfer;
				} else if (item.contentType === 'chat') {
					return this.messageMenuActions.chat;
				} else if (item.contentType === 'wxtf') {
					return this.messageMenuActions.wxtf;
				} else if (item.contentType === 'video') {
					return this.messageMenuActions.video;
				} else if (item.contentType === 'yuyin') {
					return this.messageMenuActions.yuyin;
				} else if (item.contentType === 'crad') {
					return this.messageMenuActions.crad;
				} else if (item.contentType === 'redBag') {
					return this.messageMenuActions.redBag;
				} else if (item.contentType === 'file') {
					return this.messageMenuActions.file;
				}
				return this.messageMenuActions.default;
			},
			// 统一处理菜单项点击
			handleMenuAction({ action, index }) {
				const method = this[action];
				if (typeof method === 'function') {
					method(index);
				} else {
					console.warn(`方法 ${action} 不存在`);
				}
				// 关闭菜单
				this.closePopupMenu();
			},
			async getUserInfo(userId) {
				console.log("执行用户信息获取", userId);
				const res = await getUserInfo(userId)
				console.log(res);
				this.userInfo = res.data

			},
			onVideoSubmit(data) {
				const location = this.isMe ? 1 : 0;
				const transferInfo = {
					type: "content", // tips, content
					contentType: "video", //order , chat ,link
					location, // 1 表示我方
					content: data.time
				}

				// console.log(data);
				this.massageList.push(transferInfo)
				this.updateMsg()
			},
			async addVideo() {
				this.$refs.videoPopup.open()

			},

			async onCradSubmitz(data) {
				console.log(data);
				const res = await uploadImage(data.avatar, this.guestInfo.userId)
				const temp = data
				temp.avatar = res.data
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
			onBgSubmit(data) {
				this.contentbg = data.avatar
			},
			async onPhotoSubmit(data) {
				console.log(data.avatar);
				const res = await uploadImage(data.avatar, this.guestInfo.userId)

				const location = this.isMe ? 1 : 0;
				const photoInfo = {
					type: "content", // tips, content
					contentType: "photo", //order , chat ,link
					location, // 1 表示我方
					content: {
						avatar: res.data
					}
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
				
				// 如果有当前操作的索引，将转账插入到该消息上方
				if (this.currentActionIndex !== undefined && this.currentActionIndex !== -1) {
					this.massageList.splice(this.currentActionIndex, 0, transferInfo);
					this.currentActionIndex = -1;
				} else {
					this.massageList.push(transferInfo);
				}
				this.updateMsg()
			},
			async onCradSubmit(data) {
				console.log(data);
				const res = await uploadImage(data.avatar, this.guestInfo.userId)
				const temp = data
				temp.avatar = res.data
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
			onOrderSubmit(data) {
				const location = this.isMe ? 1 : 0
				console.log(data);
				const orderInfo = {
					type: "content", // tips, content
					contentType: "order", //order , chat ,link
					location, // 1 表示我方
					content: data
				}

				// 如果有当前操作的索引，将订单插入到该消息上方
				if (this.currentActionIndex !== undefined && this.currentActionIndex !== -1) {
					this.massageList.splice(this.currentActionIndex, 0, orderInfo);
					this.currentActionIndex = -1;
				} else {
					this.massageList.push(orderInfo);
				}
				this.updateMsg()
			},
			onTipsSubmit(data) {
				// 如果是编辑模式
				if (this.editMsgIndex !== -1 && this.editMsgIndex < this.massageList.length) {
					this.massageList[this.editMsgIndex].content.gusetName = data.gusetName || "";
					this.editMsgIndex = -1;
					this.updateMsg();
					uni.showToast({
						title: '提示已更新',
						icon: 'success'
					});
					return;
				}
				
				// 新增模式
				const location = this.isMe ? 1 : 0;
				const tipsInfo = {
					type: "content",
					contentType: "tips",
					location,
					content: {
						gusetName: data.gusetName || ""
					}
				};
				
				// 如果有当前操作的索引，将tips插入到该消息上方
				if (this.currentActionIndex !== undefined && this.currentActionIndex !== -1) {
					this.massageList.splice(this.currentActionIndex, 0, tipsInfo);
					this.currentActionIndex = -1;
				} else {
					this.massageList.push(tipsInfo);
				}
				this.updateMsg();
			},
			editTips(index) {
				this.editMsgIndex = index;
				this.tipsInfo.gusetName = this.massageList[index].content.gusetName || "";
				this.$refs.tipsPopup.open();
				this.activeMsgIndex = -1;
			},
			onTimeSubmit(data) {
				const timeInfo = {
					type: "tips",
					contentType: "chat",
					content: data.time
				}

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



			onSwitchChange(e) {
				console.log(e);
				this.isMe = !this.isMe;
				console.log("当前开关状态：", this.isMe);
			},

			onLongPressPopupChange(e) {
				console.log(e);
				const newValue = e.detail.value;
				
				// 如果开启长按弹框，则关闭长按拖拽
				if (newValue && this.enableLongPressDrag) {
					this.enableLongPressDrag = false;
				}
				
				this.enableLongPressPopup = newValue;
				console.log("长按弹框功能状态：", this.enableLongPressPopup);

				// 如果关闭长按弹框功能，同时关闭当前显示的弹框
				if (!this.enableLongPressPopup) {
					this.activeMsgIndex = -1;
					this.popupVisible = false;
				}

				// 显示状态提示
				uni.showToast({
					title: this.enableLongPressPopup ? '已开启长按弹框' : '已关闭长按弹框',
					icon: 'none',
					duration: 1500
				});
			},
			
			onLongPressDragChange(e) {
				console.log(e);
				const newValue = e.detail.value;
				
				// 如果开启长按拖拽，则关闭长按弹框
				if (newValue && this.enableLongPressPopup) {
					this.enableLongPressPopup = false;
					// 关闭当前显示的弹框
					this.activeMsgIndex = -1;
					this.popupVisible = false;
				}
				
				this.enableLongPressDrag = newValue;
				console.log("长按拖拽功能状态：", this.enableLongPressDrag);

				// 显示状态提示
				uni.showToast({
					title: this.enableLongPressDrag ? '已开启长按拖拽' : '已关闭长按拖拽',
					icon: 'none',
					duration: 1500
				});
			},
			onSelect(type) {
				// 处理选择事件
				console.log('Selected:', type);
				// const key = type
				switch (type) {
					case "order":
						this.$refs.orderPopup.open()
						break;
					case "time":
						this.$refs.timePopup.open()
						break;
					case "transfer":
						this.$refs.transferPopup.open()
						break;
					case "photo":
						this.$refs.photoPopup.open()
						break;
					case "contact":
						this.$refs.cradPopup.open()
						break;
					case "redBag":
						this.addRedBag()
						break
					case "file":
						this.$refs.filePopup.open()
						break;
					case "tips":
						this.editMsgIndex = -1; // 重置编辑索引，确保是新增模式
						this.tipsInfo.gusetName = ""; // 清空内容
						this.$refs.tipsPopup.open()
						break;
					default:
						uni.showToast({
							title: '请联系管理员开通',
							icon: 'none'
						})
						break;
				}

			},
			addRedBag() {
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
						isCop: data.isCop || false // 添加 isCop 属性
					}
				};
				
				// 如果有当前操作的索引，将文件插入到该消息上方
				if (this.currentActionIndex !== undefined && this.currentActionIndex !== -1) {
					this.massageList.splice(this.currentActionIndex, 0, fileInfo);
					this.currentActionIndex = -1;
				} else {
					this.massageList.push(fileInfo);
				}
				this.updateMsg();
				uni.showToast({
					title: '文件添加成功',
					icon: 'success'
				});
			},
			onEnterKey() {
				console.log(this.inputValue);
				this.addMsgcomm(this.inputValue)
				this.inputValue = '';
				this.scrollToBottom()
			},
			addMsgcomm(inputValue) {
				if (inputValue.trim()) {
					console.log('用户输入内容:', inputValue);
					// 这里可以添加发送消息的逻辑
					const location = this.isMe ? 1 : 0
					const msgInfo = {
						type: "content",
						contentType: "chat",
						location,
						content: inputValue
					}

					// 如果有当前操作的索引，将时间插入到该消息上方
					if (this.currentActionIndex !== undefined && this.currentActionIndex !== -1) {
						this.massageList.splice(this.currentActionIndex, 0, msgInfo);
						// 插入后重置索引
						this.currentActionIndex = -1;
					} else {
						// 否则默认添加到末尾
						this.massageList.push(msgInfo);
					}
					// 清空输入框

					this.updateMsg()
				}
			},


			// 新增角色切换功能
			toggleRole(index) {
				// 获取当前消息
				const currentMsg = this.massageList[index];

				// 切换消息角色（1变0，0变1）
				currentMsg.location = currentMsg.location === 1 ? 0 : 1;

				// 更新消息
				this.updateMsg();

				// 显示切换成功提示
				uni.showToast({
					title: currentMsg.location === 1 ? '已切换为自己' : '已切换为客户',
					icon: 'none'
				});

				// 关闭菜单
				this.activeMsgIndex = -1;
				this.popupVisible = false;
			},

			// 消息插入功能 (模仿wxChat)
			addMsg(index) {

				this.currentActionIndex = this.activeMsgIndex;
				this.$refs.msgPopup.open();
				this.activeMsgIndex = -1;
			},

			// 消息编辑功能 (模仿wxChat)
			changeMsg(index) {
				this.editMsgIndex = this.activeMsgIndex;
				// 打开消息编辑弹窗，传入当前消息内容
				this.$refs.editMsgPopup.open(this.massageList[this.editMsgIndex].content);
				this.activeMsgIndex = -1;
			},

			insertTime(index) {
				this.currentActionIndex = index;
				this.$refs.timePopup.open();
			},
			
			// 插入对外收款
			insertOrder(index) {
				this.currentActionIndex = index;
				this.$refs.orderPopup.open();
			},
			
			// 插入转账
			insertTransfer(index) {
				this.currentActionIndex = index;
				this.$refs.transferPopup.open();
			},
			
			// 插入红包
			insertRedBag(index) {
				this.currentActionIndex = index;
				// 直接插入红包，不需要弹窗
				const location = this.isMe ? 1 : 0;
				const redBagInfo = {
					type: "content",
					contentType: "redBag",
					location,
					content: true
				};
				
				if (this.currentActionIndex !== undefined && this.currentActionIndex !== -1) {
					this.massageList.splice(this.currentActionIndex, 0, redBagInfo);
					this.currentActionIndex = -1;
				} else {
					this.massageList.push(redBagInfo);
				}
				this.updateMsg();
				this.activeMsgIndex = -1;
			},
			
			// 插入文件
			insertFile(index) {
				this.currentActionIndex = index;
				this.$refs.filePopup.open();
			},

			// 消息插入提交 (模仿wxChat)
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
					this.massageList.splice(this.currentActionIndex, 0, msgInfo);
				} else {
					this.massageList.push(msgInfo);
				}
				this.updateMsg();
			},

			// 消息编辑提交 (模仿wxChat)
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

			// 表情相关方法
			changeEmoji() {
				this.emoji = !this.emoji;
				this.openPopup = false;
			},

			togglePopupBox() {
				this.openPopup = !this.openPopup;
				this.emoji = false;
			},

			addEmojiToInput(index) {
				this.inputValue += `[emoji_${index}]`;
			},

			parseMessage(msg) {
				if (!msg) return [{
					type: 'text',
					content: ''
				}];

				const result = [];
				// 创建一个包含所有需要匹配的模式的正则表达式
				// 优先级：表情 > URL > 邮箱 > 数字
				// 注意：邮箱正则要放在数字正则之前，避免邮箱中的数字被单独匹配
				const combinedRegex = /(\[emoji_(\d+)\])|(https?:\/\/[^\s]+|ftp:\/\/[^\s]+|www\.[^\s]+)|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})|(\d{7,})/g;

				let lastIndex = 0;
				let match;

				while ((match = combinedRegex.exec(msg)) !== null) {
					// 添加匹配之前的文本
					if (match.index > lastIndex) {
						const textBefore = msg.substring(lastIndex, match.index);
						// 对文本部分也需要检查邮箱和数字（因为正则可能没有完全覆盖所有情况）
						if (textBefore) {
							this.parseTextForEmailAndNumber(textBefore, result);
						}
					}

					// 判断匹配到的类型
					if (match[1]) { // 是表情
						result.push({
							type: 'emoji',
							index: parseInt(match[2])
						});
					} else if (match[3]) { // 是网络地址
						result.push({
							type: 'url',
							content: match[3]
						});
					} else if (match[4]) { // 是邮箱
						result.push({
							type: 'email',
							content: match[4]
						});
					} else if (match[5]) { // 是7位及以上数字
						result.push({
							type: 'number',
							content: match[5]
						});
					}

					lastIndex = combinedRegex.lastIndex;
				}

				// 添加剩余的文本
				if (lastIndex < msg.length) {
					const remainingText = msg.substring(lastIndex);
					if (remainingText) {
						this.parseTextForEmailAndNumber(remainingText, result);
					}
				}

				// 如果结果为空，至少返回一个文本节点
				if (result.length === 0) {
					result.push({
						type: 'text',
						content: msg
					});
				}

				return result;
			},

			// 辅助函数：解析文本中的邮箱和数字（用于处理正则未匹配到的部分）
			parseTextForEmailAndNumber(text, result) {
				if (!text) return;

				const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
				const numberRegex = /\d{7,}/g;

				// 找到所有邮箱和数字的位置
				const matches = [];
				let match;

				// 收集所有邮箱匹配
				emailRegex.lastIndex = 0; // 重置正则
				while ((match = emailRegex.exec(text)) !== null) {
					matches.push({
						type: 'email',
						content: match[0],
						index: match.index,
						length: match[0].length
					});
				}

				// 收集所有数字匹配
				numberRegex.lastIndex = 0; // 重置正则
				while ((match = numberRegex.exec(text)) !== null) {
					// 检查是否在邮箱中（邮箱中可能包含数字，但不应该单独匹配）
					const isInEmail = matches.some(m => 
						match.index >= m.index && match.index < m.index + m.length
					);
					if (!isInEmail) {
						matches.push({
							type: 'number',
							content: match[0],
							index: match.index,
							length: match[0].length
						});
					}
				}

				// 按位置排序
				matches.sort((a, b) => a.index - b.index);

				// 处理重叠和相邻的匹配
				let lastIndex = 0;
				for (let i = 0; i < matches.length; i++) {
					const current = matches[i];
					
					// 添加匹配之前的文本
					if (current.index > lastIndex) {
						result.push({
							type: 'text',
							content: text.substring(lastIndex, current.index)
						});
					}

					// 添加匹配的内容
					result.push({
						type: current.type,
						content: current.content
					});

					lastIndex = current.index + current.length;
				}

				// 添加剩余的文本（如果没有匹配项，则添加整个文本）
				if (lastIndex < text.length) {
					result.push({
						type: 'text',
						content: text.substring(lastIndex)
					});
				} else if (matches.length === 0) {
					// 如果没有匹配项，添加整个文本
					result.push({
						type: 'text',
						content: text
					});
				}
			},

			getEmojiUrl(index, location = 0) {
				return location === 0 ?
					`/static/emoji/emoji_${index}.png` :
					`/static/emoji/emoji_${index}_blue.png`;
			},

			// 获取安全区域底部高度
			getSafeAreaInsetBottom() {
				const systemInfo = uni.getSystemInfoSync();
				return systemInfo.safeAreaInsets ? systemInfo.safeAreaInsets.bottom : 0;
			},
			
			// 拖拽相关方法
			onMsgTouchStart(e, index) {
				if (!this.enableLongPressDrag) return;
				
				this.touchStartTime = Date.now();
				this.dragStartIndex = index;
				if (e.touches && e.touches[0]) {
					this.dragStartY = e.touches[0].clientY;
				}
				
				// 清除之前的定时器
				if (this.longPressTimer) {
					clearTimeout(this.longPressTimer);
				}
				
				// 保存事件对象用于后续使用
				const touchEvent = e;
				
				// 设置长按定时器（500ms后开始拖拽）
				this.longPressTimer = setTimeout(() => {
					this.startDrag(touchEvent, index);
				}, 500);
			},
			
			onMsgTouchMove(e, index) {
				if (!this.enableLongPressDrag) {
					// 如果拖拽功能被关闭，重置所有状态
					if (this.isDragging || this.dragOverIndex !== -1) {
						this.dragStartIndex = -1;
						this.dragOverIndex = -1;
						this.isDragging = false;
						this.$forceUpdate();
					}
					return;
				}
				
				// 如果移动距离超过10px，取消长按定时器
				if (this.longPressTimer && e.touches && e.touches[0]) {
					const currentY = e.touches[0].clientY;
					const moveY = Math.abs(currentY - this.dragStartY);
					if (moveY > 10) {
						clearTimeout(this.longPressTimer);
						this.longPressTimer = null;
					}
				}
				
				// 如果正在拖拽，更新位置
				if (this.isDragging) {
					this.updateDragPosition(e);
				}
			},
			
			onMsgTouchEnd(e, index) {
				if (!this.enableLongPressDrag) {
					// 即使拖拽功能未开启，也要重置状态
					this.dragStartIndex = -1;
					this.dragOverIndex = -1;
					this.isDragging = false;
					return;
				}
				
				// 清除长按定时器
				if (this.longPressTimer) {
					clearTimeout(this.longPressTimer);
					this.longPressTimer = null;
				}
				
				// 如果正在拖拽，结束拖拽（注意：不要在这里重置 dragStartIndex，让 endDrag 来处理）
				if (this.isDragging) {
					this.endDrag(e);
				} else {
					// 如果没有开始拖拽，直接重置所有状态
					this.dragStartIndex = -1;
					this.dragOverIndex = -1;
					this.isDragging = false;
					this.$forceUpdate();
				}
			},
			
			startDrag(e, index) {
				if (!this.enableLongPressDrag) return;
				if (this.dragStartIndex !== index) return; // 确保是同一个消息项
				
				this.isDragging = true;
				
				// 震动反馈
				try {
					uni.vibrateShort({
						type: 'medium'
					});
				} catch (e) {
					// 某些平台可能不支持震动
				}
				
				this.$forceUpdate();
			},
			
			updateDragPosition(e) {
				if (!this.isDragging || this.dragStartIndex === -1) return;
				if (!e.touches || !e.touches[0]) return;
				
				const touch = e.touches[0];
				const currentY = touch.clientY;
				
				// 使用 nextTick 确保 DOM 已更新
				this.$nextTick(() => {
					const query = uni.createSelectorQuery().in(this);
					query.selectAll('.msg-item-wrapper').boundingClientRect((rects) => {
						if (rects && rects.length > 0) {
							let newDragOverIndex = -1;
							
							// 找到当前触摸位置对应的消息索引
							for (let i = 0; i < rects.length; i++) {
								const rect = rects[i];
								// 检查触摸点是否在当前消息项范围内
								if (currentY >= rect.top && currentY <= rect.bottom) {
									// 判断是在消息的上半部分还是下半部分
									const rectCenter = rect.top + rect.height / 2;
									if (currentY < rectCenter) {
										// 在上半部分，插入到当前位置之前
										newDragOverIndex = i;
									} else {
										// 在下半部分，插入到当前位置之后
										newDragOverIndex = i + 1;
									}
									break;
								}
							}
							
							// 如果没找到，尝试找到最近的消息项
							if (newDragOverIndex < 0) {
								let minDistance = Infinity;
								for (let i = 0; i < rects.length; i++) {
									const rect = rects[i];
									const rectCenter = rect.top + rect.height / 2;
									const distance = Math.abs(currentY - rectCenter);
									if (distance < minDistance) {
										minDistance = distance;
										if (currentY < rectCenter) {
											newDragOverIndex = i;
										} else {
											newDragOverIndex = i + 1;
										}
									}
								}
							}
							
							// 限制范围
							if (newDragOverIndex > this.massageList.length - 1) {
								newDragOverIndex = this.massageList.length - 1;
							}
							if (newDragOverIndex < 0) {
								newDragOverIndex = 0;
							}
							
							// 不能是拖拽开始的位置
							if (newDragOverIndex === this.dragStartIndex) {
								newDragOverIndex = -1;
							}
							
							// 更新拖拽悬停索引
							if (this.dragOverIndex !== newDragOverIndex) {
								this.dragOverIndex = newDragOverIndex;
								this.$forceUpdate();
							}
						}
					}).exec();
				});
			},
			
			endDrag(e) {
				if (!this.isDragging || this.dragStartIndex === -1) {
					// 重置状态
					this.dragStartIndex = -1;
					this.dragOverIndex = -1;
					this.isDragging = false;
					this.$forceUpdate();
					return;
				}
				
				const fromIndex = this.dragStartIndex;
				let targetIndex = -1;
				
				// 优先使用 dragOverIndex（在拖拽过程中已计算好的目标位置）
				if (this.dragOverIndex >= 0 && this.dragOverIndex !== fromIndex) {
					targetIndex = this.dragOverIndex;
				} else {
					// 如果 dragOverIndex 无效，尝试通过最终触摸位置计算
					const touch = e.changedTouches ? e.changedTouches[0] : null;
					if (touch) {
						const currentY = touch.clientY;
						
						this.$nextTick(() => {
							const query = uni.createSelectorQuery().in(this);
							query.selectAll('.msg-item-wrapper').boundingClientRect((rects) => {
								if (rects && rects.length > 0) {
									// 找到目标位置
									for (let i = 0; i < rects.length; i++) {
										const rect = rects[i];
										if (currentY >= rect.top && currentY <= rect.bottom) {
											const rectCenter = rect.top + rect.height / 2;
											if (currentY < rectCenter) {
												targetIndex = i;
											} else {
												targetIndex = i + 1;
											}
											break;
										}
									}
									
									// 限制范围
									if (targetIndex > this.massageList.length - 1) {
										targetIndex = this.massageList.length - 1;
									}
									if (targetIndex < 0) {
										targetIndex = 0;
									}
									
									// 执行移动
									if (targetIndex !== fromIndex && targetIndex >= 0 && targetIndex < this.massageList.length) {
										this.moveMessage(fromIndex, targetIndex);
									}
								}
								
								// 重置拖拽状态
								this.dragStartIndex = -1;
								this.dragOverIndex = -1;
								this.isDragging = false;
								this.$forceUpdate();
							}).exec();
						});
						return; // 异步执行，提前返回
					}
				}
				
				// 如果已有有效的 targetIndex，直接执行移动
				if (targetIndex >= 0 && targetIndex !== fromIndex && targetIndex < this.massageList.length) {
					this.moveMessage(fromIndex, targetIndex);
				}
				
				// 重置拖拽状态（确保在所有情况下都重置）
				this.dragStartIndex = -1;
				this.dragOverIndex = -1;
				this.isDragging = false;
				
				// 使用 nextTick 确保状态更新后立即刷新视图
				this.$nextTick(() => {
					this.$forceUpdate();
				});
			},
			
			// 移动消息位置
			moveMessage(fromIndex, toIndex) {
				if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
					console.log('移动消息：索引相同或无效', { fromIndex, toIndex });
					return;
				}
				
				// 限制 toIndex 范围
				if (toIndex >= this.massageList.length) {
					toIndex = this.massageList.length - 1;
				}
				if (toIndex < 0) {
					toIndex = 0;
				}
				
				if (fromIndex >= this.massageList.length) {
					console.log('移动消息：fromIndex 超出范围', { fromIndex, length: this.massageList.length });
					return;
				}
				
				console.log('移动消息', { fromIndex, toIndex, length: this.massageList.length });
				
				// 调整目标索引：如果从前面移动到后面，需要减1（因为删除后索引会前移）
				let adjustedToIndex = toIndex;
				if (fromIndex < toIndex) {
					adjustedToIndex = toIndex - 1;
				}
				
				// 确保调整后的索引有效
				if (adjustedToIndex < 0) adjustedToIndex = 0;
				if (adjustedToIndex >= this.massageList.length) adjustedToIndex = this.massageList.length - 1;
				
				// 如果调整后索引相同，不移动
				if (adjustedToIndex === fromIndex) {
					console.log('移动消息：调整后索引相同，不移动', { fromIndex, toIndex, adjustedToIndex });
					return;
				}
				
				// 创建新数组来移动元素
				const newList = [...this.massageList];
				const [item] = newList.splice(fromIndex, 1);
				newList.splice(adjustedToIndex, 0, item);
				
				// 更新列表
				this.massageList = newList;
				this.updateMsg();
				
				// 强制更新视图
				this.$nextTick(() => {
					this.$forceUpdate();
				});
				
				uni.showToast({
					title: '消息已移动',
					icon: 'success',
					duration: 1000
				});
			}
		}
	};
</script>
<style>
	:deep(.scroll-auto .uni-scroll-view) {
		-webkit-overflow-scrolling: auto !important;
	}
</style>
<style scoped>
	.toolbar-toggle {
		display: flex;
		margin-top: 20rpx;
		justify-content: space-between;
	}

	.yuyinBox {
		display: flex;
		align-items: center;
		max-width: 300rpx !important;
	}

	.yuyinIcon {
		width: 34rpx;
		/* height: 39rpx; */
	}

	.fontChange {
		margin-top: 20upx;
		border: 1px solid #007aff;
		padding: 10upx;
		border-radius: 16upx;

	}

	/* 字体调节 */
	.chat-page {
		font-size: var(--global-font-size, 16px);
	}

	.menu {
		padding: 40upx;
	}

	.watermark-settings-entry {
		margin-top: 20upx;
	}

	.watermark-settings-entry button {
		width: 100%;
	}

	.watermark-popup {
		width: 600rpx;
		background-color: #fff;
		border-radius: 24rpx;
		overflow: hidden;
		box-shadow: 0 20rpx 50rpx rgba(0, 0, 0, 0.15);
	}

	.wm-header {
		padding: 32rpx 36rpx;
		font-size: 32rpx;
		font-weight: 600;
		color: #111827;
		border-bottom: 1rpx solid #f0f0f0;
	}

	.wm-body {
		padding: 30rpx 36rpx;
		display: flex;
		flex-direction: column;
		gap: 24rpx;
	}

	.wm-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 24rpx;
	}

	.wm-row.wm-slider-row {
		flex-direction: column;
		align-items: flex-start;
	}

	.wm-label {
		font-size: 28rpx;
		color: #374151;
	}

	.wm-input {
		flex: 1;
		height: 70rpx;
		padding: 0 20rpx;
		border: 1rpx solid #e5e7eb;
		border-radius: 12rpx;
		font-size: 28rpx;
		box-sizing: border-box;
	}

	.wm-slider {
		width: 100%;
	}

	.wm-slider slider {
		width: 100%;
	}

	.wm-hint {
		margin-top: 12rpx;
		font-size: 24rpx;
		color: #6b7280;
	}

	.wm-actions {
		display: flex;
		justify-content: flex-end;
		gap: 20rpx;
		padding: 24rpx 36rpx;
		border-top: 1rpx solid #f0f0f0;
	}

	.wm-btn {
		flex: 1;
		height: 80rpx;
		line-height: 80rpx;
		border-radius: 16rpx;
		font-size: 28rpx;
	}

	.wm-btn.cancel {
		background-color: #f3f4f6;
		color: #374151;
	}

	.wm-btn.confirm {
		background-color: #007aff;
		color: #fff;
	}

	.videobox {
		display: flex;
		/* text-align: center; */
		align-items: center;

	}

	.videobox image {
		position: relative;

	}

	.videobox-ios {
		top: 2upx;
	}

	.videobox-and {
		top: -2upx;
	}

	.emoji-inline {
		width: 40upx;
		height: 40upx;
		vertical-align: middle;
		margin: 0 1px;
		position: relative;
		top: -6upx;

	}

	.emoji-picker {
		background-color: #fff;
		height: 360upx;
		overflow: auto;
		display: flex;
		flex-wrap: wrap;
		padding: 5px;
	}

	.emoji-item {
		width: 80upx;
		height: 76upx;
		margin: 18upx;
		overflow: hidden;
	}

	.emoji-img {
		width: 32px;
		height: 32px;
	}

	.cardRight::after {
		content: "";
		position: absolute;
		top: 28upx;
		right: -10upx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-left: 6px solid #fff;
	}

	.cardLeft::after {
		content: "";
		position: absolute;
		top: 28upx;
		left: -10upx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-right: 6px solid #fff;
	}

	.cardLeft_f::after {
		content: "";
		position: absolute;
		top: 28upx;
		left: -10upx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-right: 6px solid #fff;
	}

	.redbagLeftBg,
	.redbagLeft,
	.tfCardLeftBg,
	.tfCardLeft,
	.cardLeft {
		margin-left: 14upx;
	}

	.tfCardLeftBg::after {
		content: "";
		position: absolute;
		top: 28upx;
		left: -10upx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-right: 6px solid #fce1c3
	}

	.tfCardLeft::after {
		content: "";
		position: absolute;
		top: 28upx;
		left: -10upx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-right: 6px solid #f99d3b;
	}

	.redbagLeftBg::after {
		content: "";
		position: absolute;
		top: 28upx;
		left: -10upx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-right: 6px solid #f69e94
	}

	.redbagLeft::after {
		content: "";
		position: absolute;
		top: 28upx;
		left: -10upx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-right: 6px solid #ff624f;
	}

	.tfCardRightBg::after {
		content: "";
		position: absolute;
		top: 28upx;
		right: -10upx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-left: 6px solid #fce1c3;
	}

	.tfCardRight::after {
		content: "";
		position: absolute;
		top: 28upx;
		right: -10upx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-left: 6px solid #f99d3b;
	}


	.redbagRightBg::after {
		content: "";
		position: absolute;
		top: 28upx;
		right: -10upx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-left: 6px solid #f69e94;
	}

	.redbagRight::after {
		content: "";
		position: absolute;
		top: 28upx;
		right: -10upx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-left: 6px solid #ff624f;
	}

	.redbagRight,
	.redbagRightBg,
	.tfCardRightBg,
	.tfCardRight,
	.cardRight {
		margin-right: 14upx;
	}


	.send {
		background-color: blue;
		color: #fff;
		height: 60upx;
		line-height: 60upx;
		font-size: 30upx;
		text-align: center;
	}

	.cell {
		position: relative;
	}

	.overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 9998;
		/* background-color: rgba(0, 0, 0, 0.05); */
		/* background-color: green; */
		pointer-events: auto;
		/* 确保能捕获事件 */
	}

	/* 美化后的弹出菜单 */
	.popup-menu {
		pointer-events: auto;
		/* 菜单可点击 */
		position: fixed;
		background-color: rgba(0, 0, 0, 0.85);
		color: white;
		border-radius: 12upx;
		padding: 15upx 20upx;
		z-index: 9999;
		display: flex;
		flex-direction: row;
		justify-content: space-around;
		overflow: hidden;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
		backdrop-filter: blur(8px);
		transform-origin: center;
		max-width: 600upx;
	}

	.menu-item {
		padding: 15upx 25upx;
		font-size: 28upx;
		display: flex;
		flex-direction: column;
		align-items: center;
		white-space: nowrap;
		cursor: pointer;
		transition: all 0.2s ease;
		border-radius: 10upx;
		min-width: 80upx;
	}

	.menu-item:hover {
		background-color: rgba(255, 255, 255, 0.1);
		transform: translateY(-2upx);
	}

	.menu-item:active {
		transform: scale(0.95);
	}

	.menu-item image {
		width: 40upx;
		height: 40upx;
		margin-bottom: 10upx;
	}

	.menu-item text {
		font-size: 24upx;
	}

	.chat-page {
		display: flex;
		flex-direction: column;
		/* height: calc(100vh - 514upx); */
		height: 100vh;
		background-color: #ecedf1;
		overflow: hidden;

	}

	.chat-body ::-webkit-scrollbar {
		display: none;
	}

	.chat-content {
		display: flex;
		flex-direction: column;

		height: 100%;
		overflow: hidden;
	}

	.backimg {
		width: 42rpx;
		/* height: 48rpx; */
		position: relative;
		/* top: 2upx; */
		margin-left: 16upx;
	}

	.backimg-ios {
		width: 58upx;
	}

	/* 顶部栏 */
	.nav-bar {

		height: 100upx;
		background-color: #ecedf1;
		color: black;
		display: flex;
		align-items: center;
		padding: 10upx 20upx;
		justify-content: space-between;
		box-sizing: content-box;

	}

	.title {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		flex: 1;
		/* background: red; */
		/* text-align: left; */
		justify-content: center;
	}

	.title-ios {
		display: flex;
		flex-direction: column;
		justify-content: center;
		/* flex: 1; */
		align-items: center;
		/* margin-: 20upx; */
	}

	.desc {
		color: #656a70;
		font-size: 24upx;
		/* margin-top: 2upx; */
	}

	.nikeName {

		font-size: 36upx;

		/* font-weight: 600; */
	}

	.nikeName-ios {
		font-size: 36upx;
		font-weight: 500;
		color: #000;
	}

	.back {
		font-size: 32upx;
		margin-right: 32upx;
		display: flex;
	}

	.icons {
		display: flex;
		gap: 20upx;
		align-items: center;
	}

	.nav-icon_more {
		width: 40upx;
		height: 40upx;
		margin-left: 10upx;
	}

	.nav-icon_more-ios {
		margin-left: 30upx;
		margin-right: 16upx;
		/* width: 40upx; */
	}

	.nav-icon_phone {
		width: 54upx;
		/* height: 42upx; */
		position: relative;
		top: -4rpx;

	}

	/* 聊天内容 */
	.chat-body {
		flex: 1;
		padding: 0 20upx;
		/* 修正 padding 属性 */
		box-sizing: border-box;
		/* max-height: calc(100vh - 80upx - 100upx); */

		overflow-y: auto;
		position: relative;

		background-size: 100% 100%;

	}

	.chat-body-load {
		position: absolute;
		left: 0;
		top: 0;
		right: 0;
		bottom: 0;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.65);
		backdrop-filter: blur(4px);
	}

	.chat-body-load__inner {
		padding: 14upx 20upx;
		border-radius: 12upx;
		background: rgba(0, 0, 0, 0.55);
		color: #fff;
		font-size: 26upx;
	}

	.msg-time {
		text-align: center;
		color: #999;
		font-size: 24upx;
		margin: 30upx 0;
	}

	.msg-tips {
		text-align: center;
		color: #999;
		font-size: 24upx;
		margin: 30upx 0;
	}

	.tips-content {
		text-align: center;
		color: #999;
	}

	.order-tips {
		text-align: center;
		color: #999;
		font-size: 24rpx;
		margin: 20rpx 0;
	}

	.blueTxt {
		color: #468dd4;
		margin-left: 10rpx;
	}

	.msg {
		display: flex;
		margin-top: 14upx;
		padding-bottom: 16upx;
	}

	.msg.left {
		flex-direction: row;
	}

	.msg.right {
		flex-direction: row-reverse;
	}

	.avatar {
		width: 80upx;
		height: 80upx;
		border-radius: 10upx;
		margin: 0 10upx;
		overflow: hidden;
	}

	.avatar image {
		width: 100%;
		height: 100%;
	}

	.bubble {
		max-width: 480upx;
		padding: 20upx 20upx;
		font-size: 34upx;
		border-radius: 16upx;
		background-color: #ffffff;
		line-height: 1.3;
		position: relative;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		word-break: break-all;
		/* 让长串字符换行 */
		/* 兼容性辅助 */
		overflow-wrap: anywhere;
		/* 允许任意换行点断行 */
		white-space: pre-wrap;
		/* 保留空白并允许换行 */
	}

	.msg-text {
		word-break: break-all;
		overflow-wrap: anywhere;
		white-space: pre-wrap;
		color: #333;
		/* 非链接地址显示黑色 */
	}

	.msg-url {
		word-break: break-all;
		overflow-wrap: anywhere;
		white-space: pre-wrap;
		color: #007AFF;
		/* 网络地址显示蓝色 */
	}

	.msg-email {
		word-break: break-all;
		overflow-wrap: anywhere;
		white-space: pre-wrap;
		color: #3175d8;
		/* 邮箱显示蓝色 */
	}

	.msg-number {
		word-break: break-all;
		overflow-wrap: anywhere;
		white-space: pre-wrap;
		color: #3175d8;
		/* 7位及以上数字显示蓝色 */
	}

	.msg.right .bubble {
		background-color: #CDE5FD;
		margin-right: 14upx;
	}

	.msg.left .bubble {
		margin-left: 14upx;
	}

	.msg.right .bubble::after {
		content: "";
		position: absolute;
		top: 28upx;
		right: -10upx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-left: 6px solid #CDE5FD;
	}

	.msg.left .bubble::after {
		content: "";
		position: absolute;
		top: 28upx;
		left: -10upx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-right: 6px solid white;
	}

	/* 链接样式 */
	.link {
		color: #3086ff;
		margin-top: 10upx;
		display: inline-block;
	}

	.fun_box {

		display: flex;
		flex-direction: column;
		flex-shrink: 0;
		/* 防止收缩 */
		/* max-height: calc(100vh - 80upx); */
		padding-bottom: env(safe-area-inset-bottom);
		/* 防止内容被挡，但背景照样铺到底 */
		/* 减去 nav-bar 的高度 */
		background-color: #f5f5f5;
	}

	/* 输入框 */
	.chat-input {
		/* height: 120upx; */
		/* padding: 20upx; */
		background-color: #f5f5f5;
		display: flex;
		align-items: center;
		margin-top: 14upx;
		padding: 10upx 20upx;
		gap: 20upx;
		box-sizing: border-box;
	}

	.input {
		width: 100%;
		border-radius: 35upx;
		height: 100%;
		padding-top: 24upx;
		font-size: 28upx;
	}

	.input—box {
		flex: 1;
		height: 80upx;
		background-color: white;
		padding: 0 10upx;
		margin-left: -16upx;
		overflow: hidden;
		border-radius: 10upx;
	}

	.icon {
		width: 60upx;
		height: 60upx;
		margin-right: 10upx;
	}

	.icon_face {
		width: 60upx;
		height: 60upx;
		/* margin-left: 10upx; */
	}

	.icon_plus {
		width: 68upx;
		height: 68upx;
		/* margin-left: 10upx; */
	}

	.phote {
		border-radius: 20rpx;
		overflow: hidden;
		display: block;
		width: 100%;
		height: 100%;
	}

	.photo-container {
		display: inline-block;
		border-radius: 15rpx;
		overflow: hidden !important;
		position: relative;
		vertical-align: top;
	}

	.rightp {
		margin-right: 14upx;
	}

	.leftp {
		margin-left: 14upx;
	}


	.drawer {
		background-color: #fff;

		border-top-left-radius: 20upx;
		border-top-right-radius: 20upx;
		display: flex;
		justify-content: space-around;
		transition: height 0.3s ease;
		/* 添加过渡效果 */
	}

	.drawer-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 20upx;
	}

	.drawer-icon {
		width: 80upx;
		height: 80upx;
		margin-bottom: 10upx;
	}

	.popup_box {
		background: linear-gradient(to bottom, #ffffff 0%, #f9f9f9 100%);
		padding: 30upx 0 20upx 0;
		border-top-left-radius: 24upx;
		border-top-right-radius: 24upx;
		transition: all 0.3s ease-in-out;
		box-shadow: 0 -4upx 20upx rgba(0, 0, 0, 0.08);
	}

	.drawer-swiper {
		height: 420upx;
	}

	.feature-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		padding: 0 20upx;
		height: 100%;
		align-content: flex-start;
	}

	.feature-item {
		width: 29.33%;
		height: 160upx;
		margin-top: 10upx;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		transition: all 0.3s ease;
		cursor: pointer;
	}

	.feature-item:active {
		transform: scale(0.95);
		opacity: 0.7;
	}

	.feature-icon {
		width: 100upx;
		height: 100upx;
		margin-bottom: 12upx;
		transition: transform 0.2s ease;
	}

	.feature-item:active .feature-icon {
		transform: scale(0.9);
	}

	.feature-text {
		font-size: 26upx;
		color: #333;
		font-weight: 400;
		text-align: center;
	}

	.feature-section {
		width: 100%;
		padding: 0 24rpx;
		box-sizing: border-box;
	}

	.feature-section-title {
		font-size: 26rpx;
		font-weight: 600;
		color: #6b7280;
		margin-bottom: 20rpx;
		padding-left: 6rpx;
	}

	.feature-grid {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-start;
		gap: 24rpx;
	}

	.control-grid .control-card {
		width: 100%;
		background: linear-gradient(145deg, #f9fafb, #ffffff);
		border-radius: 24rpx;
		padding: 24rpx 28rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-shadow: 0 12rpx 30rpx rgba(15, 23, 42, 0.08);
	}

	.control-content {
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.control-title {
		font-size: 28rpx;
		font-weight: 600;
		color: #111827;
	}

	.control-desc {
		font-size: 24rpx;
		color: #6b7280;
	}

	.action-grid .feature-item {
		width: 25%;
		margin-top: 20rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12rpx;
	}

	.action-grid .feature-icon {
		width: 96rpx;
		height: 96rpx;
		border-radius: 24rpx;
		background: linear-gradient(145deg, #f3f4f6, #ffffff);
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: inset 0 2rpx 6rpx rgba(255, 255, 255, 0.6), 0 12rpx 24rpx rgba(15, 23, 42, 0.08);
	}

	.action-grid .feature-icon image {
		width: 56rpx;
		height: 56rpx;
	}

	/* 文件卡片样式 */
	.file-card {
		display: flex;
		align-items: center;
		background-color: #fff;
		border-radius: 12upx;
		padding: 24upx;
		max-width: 480upx;
		box-shadow: 0 2upx 8upx rgba(0, 0, 0, 0.05);
		position: relative;
	}

	.file-card-left {
		margin-left: 14upx;
	}

	.file-card-left::after {
		content: "";
		position: absolute;
		top: 28upx;
		left: -10upx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-right: 6px solid #fff;
	}

	.file-card-right {
		margin-right: 14upx;
	}

	.file-card-right::after {
		content: "";
		position: absolute;
		top: 28upx;
		right: -10upx;
		width: 0;
		height: 0;
		border-top: 6px solid transparent;
		border-bottom: 6px solid transparent;
		border-left: 6px solid #fff;
	}

	.file-icon {
		width: 80upx;
		height: 80upx;
		background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
		border-radius: 12upx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20upx;
		flex-shrink: 0;
	}

	.file-info {
		flex: 1;
		overflow: hidden;
	}

	.file-name {
		font-size: 28upx;
		color: #333;
		font-weight: 500;
		margin-bottom: 12upx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.file-meta {
		display: flex;
		align-items: center;
		font-size: 24upx;
		color: #999;
	}

	.file-type {
		margin-right: 20upx;
		padding: 4upx 12upx;
		background-color: #f0f0f0;
		border-radius: 6upx;
		font-size: 22upx;
	}

	.file-size {
		color: #666;
	}

	/* 拖拽相关样式 */
	.msg-item-wrapper {
		position: relative;
		transition: transform 0.2s ease, opacity 0.2s ease;
	}

	.msg-item-wrapper.dragging {
		opacity: 0.5;
		transform: scale(0.95);
		z-index: 1000;
	}

	.msg-item-wrapper.drag-over {
		border-top: 2px solid #3175d8;
		margin-top: -2px;
	}

	.msg-item-wrapper.dragging .msg,
	.msg-item-wrapper.dragging .msg-time,
	.msg-item-wrapper.dragging .orderBox,
	.msg-item-wrapper.dragging .cell {
		pointer-events: none;
	}
</style>