﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿﻿<template>

	<view class="chat-page" :style="{ '--global-font-size': currentFontSize + 'px', '--font-scale': Number(scale) || 1 }">
		<!-- 全局水印层 -->
		<WatermarkLayer />
		<!-- 顶部栏 -->
		<view v-if="!isIos" class="nav-bar" :style="{ paddingTop: statusBarHeight + 'px' }">
			<view class="back" @click="goBack">
				<image class="backimg" src="../../static/qiw/black_leftIcon.png" mode="widthFix"></image>
			</view>
			<view class="title-ios">
				<view class="nikeName" :style="{ fontSize: rpx(34),fontWeight:'500' }">
					{{guestInfo.name || "企业微信工坊"}}
				</view>
				<view class="desc" :style="{ fontSize: rpx(24),color: '#4bc768' }">{{guestInfo.description}}</view>
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
				<view class="msgConut">
					<view
						class="msgView"
						:class="{ more_red: emailIndexMsg > 99, msgView_hidden: !hasEmailIndexMsg }"
						:style="{ fontSize: rpx(28) }"
					>
						{{ hasEmailIndexMsg ? emailIndexText : '' }}
					</view>
				</view>
				<!-- <view class="nav-icon_phone" style="margin-right: 26upx;" /> -->
				
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
				:style="chatBodyStyle" :scroll-y="!isDragging" :show-scrollbar="false" @scroll="onScroll">
				<!-- 首屏自动滚动时的加载遮罩（仅首次且确实需要滚动才显示） -->
				<view v-if="chatBodyLoading" class="chat-body-load">
					<view class="chat-body-load__inner">加载中...</view>
				</view>
				<view v-if="activeMsgIndex !== -1" class="overlay" @click="closePopupMenu" @touchmove.stop.prevent=""></view>
				<view class="wxs-bridge"
					:wxsDragData="wxsDragData"
					:change:wxsDragData="dragHandler.updateDragData"
					:scrollTop="scrollPosition"
					:change:scrollTop="dragHandler.onScrollTopChange"
				></view>
				<!-- 上方占位符 -->
				<view v-if="topPlaceholderHeight > 0" :style="{ height: topPlaceholderHeight + 'px' }"></view>
				<!-- -->
				<view v-if="isSortingMode" class="sorting-tip-bar">
					<view class="sort-actions">
						<view class="action-btn" @click="restoreDefaultSort">恢复默认</view>
						<!-- <view class="action-btn" @click="undoSort">撤销</view> -->
					</view>
					<text class="sort-tip">按住把手拖动</text>
					<view class="finish-btn" @click="exitSortingMode">完成</view>
				</view>
				
				<!-- -->
				<view v-if="isDragging && draggingItem" class="floating-msg-item" :style="{ top: dragY + 'px', height: dragItemHeight + 'px' }">
					<!-- -->
					<!-- 时间 -->
					<view v-if="draggingItem.type == 'tips'" class="msg-time cell">
						{{draggingItem.content}}
					</view>
					
					<!-- -->
					<view v-else-if="draggingItem.contentType == 'tips'" class="msg-tips cell">
						<view class="tips-content">
							{{ getTipsText(draggingItem) }}<text v-if="getTipsActionText(draggingItem)" class="blueTxt"> {{ getTipsActionText(draggingItem) }}</text>
						</view>
					</view>
					
					<view class="orderBox cell" v-else-if="draggingItem.contentType == 'order'">
						<view class="msg right">
							<image class="avatar" mode="aspectFill" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<view>
								<ExternalPayCard :orderInfo="draggingItem.content" :fontScale="Number(componentScale) || 1" />
							</view>
						</view>
					</view>
					
					<!-- 转账 -->
					<view v-else-if="draggingItem.contentType == 'transfer'" class="cell">
						<view class="msg left" v-if="draggingItem.location == 0">
							<view class="avatar" @click.stop="openCustomerDetail">
								<image mode="aspectFill" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<TransferCard :class="!draggingItem.content.st?'tfCardLeft':'tfCardLeftBg'" :state="draggingItem.content.st"
								:fontScale="Number(componentScale) || 1"
								:name="draggingItem.content.name" :amount="draggingItem.content.amount"></TransferCard>
						</view>
						<view class="msg right" v-else>
							<image class="avatar" mode="aspectFill" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<TransferCard :class="!draggingItem.content.st?'tfCardRight':'tfCardRightBg'"
								:fontScale="Number(componentScale) || 1"
								:state="draggingItem.content.st" :name="draggingItem.content.name" :amount="draggingItem.content.amount">
							</TransferCard>
						</view>
					</view>
					
					<!-- 收款 -->
					<view v-else-if="draggingItem.contentType == 'wxtf'" class="cell">
						<view class="msg left" v-if="draggingItem.location == 0">
							<view class="avatar" @click.stop="openCustomerDetail">
								<image mode="aspectFill" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<ChTf class="tfCardLeftBg" :fontScale="Number(componentScale) || 1" :name="draggingItem.content.name" :amount="draggingItem.content.amount"></ChTf>
						</view>
						<view class="msg right" v-else>
							<image class="avatar" mode="aspectFill" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<ChTf class="tfCardRightBg" :fontScale="Number(componentScale) || 1" :name="draggingItem.content.name" :amount="draggingItem.content.amount"></ChTf>
						</view>
					</view>
					
					<!-- 图片photo -->
					<view v-else-if="draggingItem.contentType == 'photo'" class="cell">
						<view class="msg left" v-if="draggingItem.location == 0">
							<view class="avatar" @click.stop="openCustomerDetail">
								<image mode="aspectFill" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<view class="photo-container leftp" :style="getImageContainerStyle(dragStartIndex)">
								<image :src="draggingItem.content.avatar" class="phote" mode="aspectFit" :style="getImageStyle(dragStartIndex)" />
							</view>
						</view>
						<view class="msg right" v-else>
							<image class="avatar" mode="aspectFill" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<view class="photo-container rightp" :style="getImageContainerStyle(dragStartIndex)">
								<image :src="draggingItem.content.avatar" class="phote" mode="aspectFit" :style="getImageStyle(dragStartIndex)" />
							</view>
						</view>
					</view>
					
					<!-- 红包 -->
					<view v-else-if="draggingItem.contentType == 'redBag'" class="cell">
						<view class="msg left" v-if="draggingItem.location == 0">
							<view class="avatar" @click.stop="openCustomerDetail">
								<image mode="aspectFill" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<RedBag :class="draggingItem.content?'redbagLeft':'redbagLeftBg'" :fontScale="Number(componentScale) || 1" :location="draggingItem.location"
								:name="guestInfo.name  + (guestInfo.description||'')" :state="draggingItem.content"></RedBag>
						</view>
						<view class="msg right" v-else>
							<image class="avatar" mode="aspectFill" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<RedBag :class="draggingItem.content?'redbagRight':'redbagRightBg'" :fontScale="Number(componentScale) || 1" :location="draggingItem.location"
								:name="guestInfo.name + (guestInfo.description||'')" :state="draggingItem.content"></RedBag>
						</view>
					</view>
					
					<!-- 文件 -->
					<view v-else-if="draggingItem.contentType == 'file'" class="cell">
						<view class="msg left" v-if="draggingItem.location == 0">
							<view class="avatar" @click.stop="openCustomerDetail">
								<image mode="widthFix" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<chatFlie class="cardLeft" :fontScale="Number(componentScale) || 1" :content="draggingItem.content">
							</chatFlie>
						</view>
						<view class="msg right" v-else>
							<image class="avatar" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<chatFlie class="cardRight" :fontScale="Number(componentScale) || 1" :content="draggingItem.content">
							</chatFlie>
						</view>
					</view>
					
					<!-- 语音 -->
					<view v-else-if="draggingItem.contentType == 'yuyin'" class="cell">
						<view class="msg left " v-if="draggingItem.location == 0">
							<image class="avatar" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							<view class="bubble"
								style="padding-top: 10rpx;display: flex;align-items: center;padding-bottom: 10rpx;">
								<view class="yuyinBox"
									:style="{ fontSize: rpx(34), width: (114 + Math.floor((draggingItem.content.time - 1) / 2) * 10) + 'rpx' }">
									<image style="margin-right: 16rpx;" class="yuyinIcon" src="/static/yuyin_0.png"
										mode="widthFix"></image>
									{{draggingItem.content.time}}"
								</view>
							</view>
						</view>
						<view class="msg right" v-else>
							<image class="avatar" mode="aspectFill" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<view class="bubble"
								style="padding-top: 10rpx;display: flex;align-items: center;padding-bottom: 10rpx;">
								<view class="yuyinBox"
									:style="{  fontSize: rpx(34), width: (114 + Math.floor((draggingItem.content.time - 1) / 2) * 10) + 'rpx' }"
									style="justify-content: flex-end;">
									{{draggingItem.content.time}}"
									<image style="margin-left: 16rpx;text-align: right;" class="yuyinIcon"
										src="/static/yuyin_1.png" mode="widthFix"></image>
								</view>
							</view>
						</view>
					</view>
					
					<!-- 名片 -->
					<view v-else-if="draggingItem.contentType == 'crad'" class="cell">
						<view class="msg left" v-if="draggingItem.location == 0">
							<view class="avatar" @click.stop="openCustomerDetail">
								<image mode="widthFix" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<WxCard class="cardLeft" :fontScale="Number(componentScale) || 1" :nickname="draggingItem.content.nickname" :avatar="draggingItem.content.avatar">
							</WxCard>
						</view>
						<view class="msg right" v-else>
								<image class="avatar" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<WxCard class="cardRight" :fontScale="Number(componentScale) || 1" :nickname="draggingItem.content.nickname" :avatar="draggingItem.content.avatar">
							</WxCard>
						</view>
					</view>
					
					<!-- 鑱婂ぉ -->
					<view v-else-if="draggingItem.contentType == 'chat'" class="cell">
						<view class="msg left" v-if="draggingItem.location == 0">
							<view class="avatar" @click.stop="openCustomerDetail">
								<image mode="aspectFill" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<view class="bubble" :style="{ fontSize: rpx(34) }">
								<view class="bubble-stack">
									<QuotedMessagePreview
										v-if="draggingItem.quote"
										:quote="draggingItem.quote"
										:location="draggingItem.quote.fromLocation"
										:parseMessage="parseMessage"
										:getEmojiUrl="getEmojiUrl"
										:fontScale="Number(componentScale) || 1"
									/>
									<view>
										<template v-for="(part, partIndex) in draggingItemParsedContent">
											<text v-if="part.type === 'text'" :key="'text-' + partIndex"
												class="msg-text">{{ part.content }}</text>
											<text v-else-if="part.type === 'url'" :key="'url-' + partIndex"
												class="msg-url">{{ part.content }}</text>
											<text v-else-if="part.type === 'email'" :key="'email-' + partIndex"
												class="msg-email">{{ part.content }}</text>
											<text v-else-if="part.type === 'number'" :key="'number-' + partIndex"
												class="msg-number">{{ part.content }}</text>
											<image v-else-if="part.type === 'emoji'" :key="'emoji-' + partIndex"
												:src="getEmojiUrl(part.index,draggingItem.location)" class="emoji-inline"
												:style="{ width: rpx(40), height: rpx(40) }" />
										</template>
									</view>
								</view>
							</view>
						</view>
						<view class="msg right" v-else>
							<image class="avatar" mode="aspectFill" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<view class="bubble" :style="{ fontSize: rpx(34) }">
								<view class="bubble-stack">
									<QuotedMessagePreview
										v-if="draggingItem.quote"
										:quote="draggingItem.quote"
										:location="draggingItem.quote.fromLocation"
										:parseMessage="parseMessage"
										:getEmojiUrl="getEmojiUrl"
										:fontScale="Number(componentScale) || 1"
									/>
									<view>
										<template v-for="(part, partIndex) in draggingItemParsedContent">
											<text v-if="part.type === 'text'" :key="'text-' + partIndex"
												class="msg-text">{{ part.content }}</text>
											<text v-else-if="part.type === 'url'" :key="'url-' + partIndex"
												class="msg-url">{{ part.content }}</text>
											<text v-else-if="part.type === 'email'" :key="'email-' + partIndex"
												class="msg-email">{{ part.content }}</text>
											<text v-else-if="part.type === 'number'" :key="'number-' + partIndex"
												class="msg-number">{{ part.content }}</text>
											<image v-else-if="part.type === 'emoji'" :key="'emoji-' + partIndex"
												:src="getEmojiUrl(part.index,draggingItem.location)" class="emoji-inline"
												:style="{ width: rpx(40), height: rpx(40) }" />
										</template>
									</view>
								</view>
							</view>
						</view>
					</view>
					
					<!-- 视频电话 -->
					<view v-else-if="draggingItem.contentType == 'video'" class="cell">
						<view class="msg left" v-if="draggingItem.location == 0">
							<view class="avatar" @click.stop="openCustomerDetail">
								<image mode="aspectFill" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<view class="bubble" :style="{ fontSize: rpx(34) }">
								<view class="videobox">
									<image src="/static/qiw/video.png" :class="isIos?'videobox-ios':'videobox-and'"
										mode="widthFix" :style="{ width: rpx(50),marginRight: rpx(12)}"></image>
									通话时长
									<text>{{draggingItem.content}}</text>
								</view>
							</view>
						</view>
						<view class="msg right" v-else>
							<image class="avatar" mode="aspectFill" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<view class="bubble" :style="{ fontSize: rpx(34) }">
								<view>
									<view class="videobox">
										通话时长
										<text>{{draggingItem.content}}</text>
										<image :class="isIos?'videobox-ios':'videobox-and'" style="margin-left: 16upx;"
											src="/static/qiw/video2.png" mode="widthFix"
											:style="{ width: rpx(50),marginLeft: rpx(12)}"></image>
									</view>
								</view>
							</view>
						</view>
					</view>
					
					<!-- 语音通话 -->
					<view v-else-if="draggingItem.contentType == 'phone'" class="cell">
						<view class="msg left" v-if="draggingItem.location == 0">
							<view class="avatar" @click.stop="openCustomerDetail">
								<image mode="aspectFill" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<view class="bubble" :style="{ fontSize: rpx(34) }">
								<view class="videobox">
									<image src="/static/chat/phone_hs.png" :class="isIos?'videobox-ios':'videobox-and'"
										mode="widthFix" :style="{ width: rpx(60),marginRight: rpx(8)}"></image>
									<template v-if="draggingItem.content === '已取消'">
										已取消
									</template>
									<template v-else-if="draggingItem.content === '未接听'">
										对方未接听
									</template>
									<template v-else-if="draggingItem.content === '对方已取消'">
										对方已取消
									</template>
									<template v-else>
										通话时长
										<text>{{draggingItem.content}}</text>
									</template>
								</view>
							</view>
						</view>
						<view class="msg right" v-else>
							<image class="avatar" mode="aspectFill" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<view class="bubble" :style="{ fontSize: rpx(34) }">
								<view>
									<view class="videobox">
										<template v-if="draggingItem.content === '已取消'">
											已取消
										</template>
										<template v-else>
											通话时长
											<text>{{draggingItem.content}}</text>
										</template>
										<image :class="isIos?'videobox-ios':'videobox-and'" style="margin-left: 16upx;"
											src="/static/chat/phone_ls.png" mode="widthFix"
											:style="{ width: rpx(60),marginLeft: rpx(10)}"></image>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>

				<!-- 可见消息列表 -->
				<view v-for="msgData in visibleMessageList" :key="msgData.index"
					:data-index="msgData.index" 
					class="msg-item-wrapper"
					:class="{ 'dragging-placeholder': isDragging && dragStartIndex === msgData.index, 'sorting-mode': isSortingMode }"
					:style="getItemStyle(msgData.index)"
					@touchstart="dragHandler.onWrapperTouchStart"
					@touchmove="dragHandler.onTouchMove"
					@touchend="dragHandler.onTouchEnd"
					@longpress="onMsgLongPress($event, msgData.index)"
					>
					
					<!-- 拖拽把手 -->
					<view v-if="isSortingMode" class="drag-handle"
						:data-index="msgData.index"
						@touchstart="dragHandler.onHandleTouchStart"
						@click.stop=""
					>
						<text class="handle-icon">≡</text>
					</view>


					<!-- 时间 -->
					<view @longpress="showPopupMenu($event, msgData.index)" :style="{ fontSize: rpx(24) }"
						v-if="msgData.item.type == 'tips'" class="msg-time cell">
						{{msgData.item.content}}
					</view>
					<!-- -->
					<view @longpress="showPopupMenu($event, msgData.index)" :style="{ fontSize: rpx(25) }"
						v-else-if="msgData.item.contentType == 'tips'" class="msg-tips cell">
						<view class="tips-content">
							{{ getTipsText(msgData.item) }}<text v-if="getTipsActionText(msgData.item)" class="blueTxt"> {{ getTipsActionText(msgData.item) }}</text>
						</view>
					</view>
					<view class="orderBox cell" @longpress="showPopupMenu($event, msgData.index)"
						v-else-if="msgData.item.contentType == 'order'">
						<view class="msg right">
							<image class="avatar" mode="aspectFill" lazy-load
								:src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<view>
								<ExternalPayCard :orderInfo="msgData.item.content" :fontScale="Number(componentScale) || 1" />
								<!-- <view v-if="item.content.gusetName" class="order-tips" :style="{ fontSize: rpx(24) }">
									你收到了{{item.content.gusetName}}的付款<text class="blueTxt"> 查看</text>
								</view> -->
							</view>
						</view>

					</view>
					<!-- 转账 -->
					<view v-else-if="msgData.item.contentType == 'transfer'" @longpress="showPopupMenu($event, msgData.index)" class="cell">
						<view class="msg left" @longpress="showPopupMenu($event, msgData.index)" @click="goReceipt(msgData.item)"
							v-if="msgData.item.location == 0">
							<view class="avatar" @click.stop="openCustomerDetail">
								<image mode="aspectFill" lazy-load :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<TransferCard :class="!msgData.item.content.st?'tfCardLeft':'tfCardLeftBg'" :state="msgData.item.content.st"
								:fontScale="Number(componentScale) || 1"
								:name="msgData.item.content.name" :amount="msgData.item.content.amount"></TransferCard>
						</view>
						<view class="msg right" @longpress="showPopupMenu($event, msgData.index)" @click="goReceipt(msgData.item)" v-else>
							<image class="avatar" mode="aspectFill" lazy-load
								:src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<TransferCard :class="!msgData.item.content.st?'tfCardRight':'tfCardRightBg'"
								:fontScale="Number(componentScale) || 1"
								:state="msgData.item.content.st" :name="msgData.item.content.name" :amount="msgData.item.content.amount">
							</TransferCard>

						</view>
					</view>
					<!-- 收款 -->
					<view v-else-if="msgData.item.contentType == 'wxtf'" @longpress="showPopupMenu($event, msgData.index)" class="cell">
						<view class="msg left" @longpress="showPopupMenu($event, msgData.index)" @click="goCollection(msgData.item)"
							v-if="msgData.item.location == 0">
							<view class="avatar" @click.stop="openCustomerDetail">
								<image mode="aspectFill" lazy-load :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<ChTf class="tfCardLeftBg" :fontScale="Number(componentScale) || 1" :name="msgData.item.content.name" :amount="msgData.item.content.amount"></ChTf>
						</view>
						<view class="msg right" @longpress="showPopupMenu($event, msgData.index)" @click="goCollection(msgData.item)"
							v-else>

							<image class="avatar" mode="aspectFill" lazy-load
								:src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<ChTf class="tfCardRightBg" :fontScale="Number(componentScale) || 1" :name="msgData.item.content.name" :amount="msgData.item.content.amount"></ChTf>
						</view>
					</view>
					<!-- 图片photo -->

					<view v-else-if="msgData.item.contentType == 'photo'" @longpress="showPopupMenu($event, msgData.index)" class="cell">
						<view class="msg left" v-if="msgData.item.location == 0" @longpress="showPopupMenu($event, msgData.index)">
							<view class="avatar" @click.stop="openCustomerDetail">
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
						<view class="msg left" @longpress="showPopupMenu($event, msgData.index)" v-if="msgData.item.location == 0">
							<view class="avatar" @click.stop="openCustomerDetail">
								<image mode="aspectFill" lazy-load :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<RedBag :class="msgData.item.content?'redbagLeft':'redbagLeftBg'" :fontScale="Number(componentScale) || 1" :location="msgData.item.location"
								:name="guestInfo.name  + (guestInfo.description||'')" :state="msgData.item.content"></RedBag>

						</view>
						<view class="msg right" @longpress="showPopupMenu($event, msgData.index)" v-else>

							<image class="avatar" mode="aspectFill" lazy-load
								:src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<RedBag :class="msgData.item.content?'redbagRight':'redbagRightBg'" :fontScale="Number(componentScale) || 1" :location="msgData.item.location"
								:name="guestInfo.name + (guestInfo.description||'')" :state="msgData.item.content"></RedBag>

						</view>
					</view>
					<!-- 文件 -->
					<view v-else-if="msgData.item.contentType == 'file'" @longpress="showPopupMenu($event, msgData.index)" class="cell">

						<view class="msg left" @longpress="showPopupMenu($event, msgData.index)" v-if="msgData.item.location == 0">
							<view class="avatar" @click.stop="openCustomerDetail">
								<image mode="widthFix" lazy-load :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<chatFlie class="cardLeft" :fontScale="Number(componentScale) || 1" :content="msgData.item.content">
							</chatFlie>
						</view>
						<view class="msg right" @longpress="showPopupMenu($event, msgData.index)" v-else>
							<image class="avatar" lazy-load :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<chatFlie class="cardRight" :fontScale="Number(componentScale) || 1" :content="msgData.item.content">
							</chatFlie>
						</view>
					</view>
					<!-- 语音 -->
					<view v-else-if="msgData.item.contentType == 'yuyin'" class="cell">
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

						<view class="msg left" @longpress="showPopupMenu($event, msgData.index)" v-if="msgData.item.location == 0">
							<view class="avatar" @click.stop="openCustomerDetail">
								<image mode="widthFix" lazy-load :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<WxCard class="cardLeft" :fontScale="Number(componentScale) || 1" :nickname="msgData.item.content.nickname" :avatar="msgData.item.content.avatar">
							</WxCard>
						</view>
						<view class="msg right" @longpress="showPopupMenu($event, msgData.index)" v-else>
							<image class="avatar" mode="widthFix" lazy-load
								:src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<WxCard class="cardRight" :fontScale="Number(componentScale) || 1" :nickname="msgData.item.content.nickname" :avatar="msgData.item.content.avatar">
							</WxCard>
						</view>
					</view>
					<!-- -->
					<view v-else-if="msgData.item.contentType == 'chat'" @longpress="showPopupMenu($event, msgData.index)" class="cell">
						<!-- 聊天内容 -->
						<view class="msg left" @longpress="showPopupMenu($event, msgData.index)" v-if="msgData.item.location == 0">
							<view class="avatar" @click.stop="openCustomerDetail">
								<image mode="aspectFill" lazy-load :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<view class="bubble" :style="{ fontSize: rpx(34) }">
								<view class="bubble-stack">
									<QuotedMessagePreview
										v-if="msgData.item.quote"
										:quote="msgData.item.quote"
										:location="msgData.item.quote.fromLocation"
										:parseMessage="parseMessage"
										:getEmojiUrl="getEmojiUrl"
										:fontScale="Number(componentScale) || 1"
									/>
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

						<view class="msg right" @longpress="showPopupMenu($event, msgData.index)" v-else>


							<image class="avatar" mode="aspectFill" lazy-load
								:src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<view class="bubble" :style="{ fontSize: rpx(34) }">
								<view class="bubble-stack">
									<QuotedMessagePreview
										v-if="msgData.item.quote"
										:quote="msgData.item.quote"
										:location="msgData.item.quote.fromLocation"
										:parseMessage="parseMessage"
										:getEmojiUrl="getEmojiUrl"
										:fontScale="Number(componentScale) || 1"
									/>
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


					</view>
					<!-- 视频电话 -->
					<view v-else-if="msgData.item.contentType == 'video'" @longpress="showPopupMenu($event, msgData.index)" class="cell">

						<view class="msg left" @longpress="showPopupMenu($event, msgData.index)" v-if="msgData.item.location == 0">
							<view class="avatar" @click.stop="openCustomerDetail">
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
					
					<!-- 语音通话 -->
					<view v-else-if="msgData.item.contentType == 'phone'" @longpress="showPopupMenu($event, msgData.index)" class="cell">
					
						<view class="msg left" @longpress="showPopupMenu($event, msgData.index)" v-if="msgData.item.location == 0">
							<view class="avatar" @click.stop="openCustomerDetail">
								<image mode="aspectFill" lazy-load :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<view class="bubble" :style="{ fontSize: rpx(34) }">
								<view class="videobox">
									<image src="/static/chat/phone_hs.png" :class="isIos?'videobox-ios':'videobox-and'"
										mode="widthFix" :style="{ width: rpx(56),marginRight: rpx(6)}"></image>
									<template v-if="msgData.item.content === '已取消'">
											已取消
										</template>
										<template v-else-if="msgData.item.content === '未接听'">
											对方未接听
										</template>
										<template v-else-if="msgData.item.content === '对方已取消'">
											对方已取消
										</template>
										<template v-else>
											通话时长
											<text>{{msgData.item.content}}</text>
										</template>
								</view>
							</view>
						</view>
					
						<view class="msg right" @longpress="showPopupMenu($event, msgData.index)" v-else>
							<image class="avatar" mode="aspectFill" lazy-load
								:src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<view class="bubble" :style="{ fontSize: rpx(34) }">
								<view>
									<view class="videobox">
										<template v-if="msgData.item.content === '已取消'">
											已取消
										</template>
										<template v-else-if="msgData.item.content === '未接听'">
											对方未接听
										</template>
										<template v-else-if="msgData.item.content === '对方已取消'">
											对方已取消
										</template>
										<template v-else>
											通话时长
											<text>{{msgData.item.content}}</text>
										</template>
									<image :class="isIos?'videobox-ios':'videobox-and'" style="margin-left: 16upx;"
										src="/static/chat/phone_ls.png" mode="widthFix"
										:style="{ width: rpx(56),marginLeft: rpx(12)}"></image>
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
				<view v-if="quoteDraft" class="quote-draft">
					<QuotedMessagePreview
						:quote="quoteDraft"
						:location="quoteDraft.fromLocation"
						:parseMessage="parseMessage"
						:getEmojiUrl="getEmojiUrl"
						:fontScale="Number(componentScale) || 1"
					/>
					<view class="quote-draft__close" @click="clearQuoteDraft">
						<uni-icons type="close" size="18" color="#999"></uni-icons>
					</view>
				</view>
				<view class="chat-input" :style="{marginBottom: keyboardHeight+'px'}">
					<image class="icon" :style="{ width: rpx(60), height: rpx(60) }" src="/static/icon-voice.png"
						@click="addYuyin"></image>
					<view class="input-box" :style="{  height: rpx(70) }"><textarea class="input"
							:adjustPosition="false" v-model="inputValue" @confirm="onEnterKey" />
					</view>
					<image class="icon_face" :style="{ width: rpx(60), height: rpx(60) }" src="/static/icon-face.png"
						@click="changeEmoji">
					</image>
					<image class="icon_plus" :style="{ width: rpx(68), height: rpx(68) }" v-if="inputValue.length == 0"
						src="/static/icon-plus.png" @click="togglePopupBox"></image>
					<button class="send" @click="onEnterKey" v-if="inputValue.length>0"> 发送</button>
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
				<uni-popup ref="timePopup" type="center">
					<view class="time-select-popup">
						<view class="time-select-title">选择时间</view>
						<view class="time-select-body">
							<picker mode="date" :value="timePickerDate" @change="onTimePickerDateChange">
								<view class="time-select-row">
									<text class="time-select-label">日期</text>
									<text class="time-select-value">{{ formatDateDisplay(timePickerDate) }}</text>
								</view>
							</picker>
							<picker mode="time" :value="timePickerTime" @change="onTimePickerTimeChange">
								<view class="time-select-row">
									<text class="time-select-label">时间</text>
									<text class="time-select-value">{{ formatPickerTimeDisplay(timePickerTime) }}</text>
								</view>
							</picker>
							<view class="time-select-row">
								<text class="time-select-label">是否是24小时制</text>
								<switch :checked="timeUse24Hour" @change="onTimeUse24HourChange" />
							</view>
						</view>
						<view class="time-select-footer">
							<button class="time-select-btn time-select-cancel" @click="closeTimePicker">取消</button>
							<button class="time-select-btn time-select-confirm" @click="confirmTimeSelection">确定</button>
						</view>
					</view>
				</uni-popup>
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
				<EditableFormPopup ref="videoPopup" popupType="bottom" :value="timeInfo" :fieldLabels="timeKey" @submit="onVideoSubmit" />
				<!-- 语音通话 -->
				<EditableFormPopup ref="phonePopup" popupType="bottom" :value="timeInfo" :fieldLabels="timeKey" @submit="onPhoneSubmit" />
				<!-- 背景修改 -->
				<UploadImage ref="bgPopup" @submit="onBgSubmit"></UploadImage>
				<!-- 文件信息编辑 -->
				<FileEditPopup ref="filePopup" :fileTypes="fileTypes" @submit="onFileSubmit" />
				<!-- tips提示 -->
				<EditableFormPopup ref="tipsPopup" :value="tipsInfo" :fieldLabels="tipsKey"
					@submit="onTipsSubmit" />
				<uni-popup ref="tipsTypePopup" type="bottom">
					<view class="calltype-sheet">
						<view class="calltype-item" @click="onSelectTipsType('payment')">收款提示</view>
						<view class="calltype-item" @click="onSelectTipsType('revoke_other')">对方撤回提示</view>
						<view class="calltype-item" @click="onSelectTipsType('revoke_self')">我方撤回提示</view>
						<view class="calltype-item" @click="onSelectTipsType('add_contact')">添加好友提示</view>
						<view class="calltype-cancel" @click="closeTipsTypePopup">取消</view>
					</view>
				</uni-popup>
				<!-- yuyin -->
				<EditableFormPopup ref="yuyinPopup" :value="yuyinInfo" :fieldLabels="yuyinKey"
					@submit="onYuyinSubmit" />
				<uni-popup ref="callTypePopup" type="bottom">
					<view class="calltype-sheet">
						<view class="calltype-item" @click="onSelectCallType('video')">视频通话</view>
						<view class="calltype-item" @click="onSelectCallType('phone')">语音通话</view>
						<view class="calltype-cancel" @click="closeCallTypePopup">取消</view>
					</view>
				</uni-popup>
				<!-- 通话状态选择弹窗 -->
				<uni-popup ref="callStatusPopup" type="bottom">
					<view class="calltype-sheet">
						<view class="calltype-item" @click="onInsertCallStatus('未接听')">对方未接听</view>
						<view class="calltype-item" @click="onInsertCallStatus('对方已取消')">对方已取消</view>
						<view class="calltype-item" @click="onInsertCallStatus('已取消')">我方已取消</view>
						<view class="calltype-cancel" @click="closeCallStatusPopup">取消</view>
					</view>
				</uni-popup>
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
		<!-- -->
		<MessagePopupMenu
			:visible="activeMsgIndex !== -1"
			:styleObject="popupStyle"
			:actions="currentMenuActions"
			:messageIndex="activeMsgIndex"
			@action="handleMenuAction"
		/>
		<uni-popup ref="menuPopup" background-color="#fff">
			<view class="menu" :style="{ paddingTop: statusBarHeight + 'px' }">
				<button type="primary" plain="true" @click="openBgPopup">修改聊天背景</button>
				<!-- 滑块组件 -->
				<view class="fontChange">
					<view class="">
						字体调节
					</view>
					<slider :value="scale" :min="0.7" :max="1.5" :step="0.02" @changing="onScaleChange" @change="onScaleChange" />
				</view>
				<view class="fontChange">
					<view class="">
						组件缩放
					</view>
					<slider :value="componentScale" :min="0.7" :max="1.5" :step="0.02" @changing="onComponentScaleChange" @change="onComponentScaleChange" />
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

<script module="dragHandler" lang="wxs">
	var startY = 0;
	var itemRects = []; // 存储绝对坐标 { absTop, height, dataset }
	var isDragging = false;
	var dragStartIndex = -1;
	var placeholderIndex = -1;
	var dragItemHeight = 0;
	var dragOffsetY = 0;
	var initialScrollTop = 0;
	var currentScrollTop = 0;
    var containerTop = 0;
	var itemsCache = null;
	var floatingItemCache = null;
	var lastAutoScrollCall = 0;
	var AUTO_SCROLL_THROTTLE = 16;
    
    // 防抖相关
    var lastSwapTime = 0;
    var SWAP_COOLDOWN = 50; // ms
	function updateDragData(newValue, oldValue, ownerInstance, instance) {
		if (!newValue) return;
		
		if (newValue.isDragging) {
			isDragging = true;
			dragStartIndex = newValue.dragStartIndex;
			placeholderIndex = newValue.dragStartIndex;
			initialScrollTop = newValue.initialScrollTop || initialScrollTop || 0;
            containerTop = newValue.containerTop || containerTop || 0;
            if (currentScrollTop === 0 && initialScrollTop !== 0) {
			    currentScrollTop = initialScrollTop;
            }
            if (newValue.scrollTop !== undefined) {
                currentScrollTop = newValue.scrollTop;
            }
            
            // 处理 rects，转换为绝对坐标（相对于内容顶部）
            // itemAbsTop = rect.top (viewport) - containerTop (viewport) + initialScrollTop
            if (newValue.rects) {
                itemRects = [];
                for (var i = 0; i < newValue.rects.length; i++) {
                    var r = newValue.rects[i];
                    itemRects.push({
                        absTop: r.top - containerTop + initialScrollTop,
                        height: r.height,
                        dataset: r.dataset,
                        top: r.top // 保留原始 top 用于调试或回退
                    });
                }
            }
			
			// 立即隐藏原位置的 item
			var items = itemsCache || ownerInstance.selectAllComponents('.msg-item-wrapper');
			itemsCache = items;
			for (var i = 0; i < items.length; i++) {
				var item = items[i];
				if (item.getDataset().index == dragStartIndex) {
					item.setStyle({ opacity: 0, visibility: 'hidden' });
				} else {
                    item.setStyle({ 
                        opacity: 1, 
                        visibility: 'visible',
                        transform: 'translate3d(0,0,0)',
                        transition: 'transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)' 
                    });
                }
			}
			
			// 计算 dragItemHeight 和 dragOffsetY
			for (var i = 0; i < itemRects.length; i++) {
				if (itemRects[i].dataset && itemRects[i].dataset.index === dragStartIndex) {
					dragItemHeight = itemRects[i].height;
                    
                    if (startY !== 0) {

                        var currentVisualTop = itemRects[i].absTop - currentScrollTop + containerTop;
                        dragOffsetY = startY - currentVisualTop;
                    } else {
                         dragOffsetY = dragItemHeight / 2;
                    }
					break;
				}
			}
		} else {
            if (newValue.isDragging === false) {
    			isDragging = false;
    			dragStartIndex = -1;
    			placeholderIndex = -1;
    			
    			var items = itemsCache || ownerInstance.selectAllComponents('.msg-item-wrapper');
    			for (var i = 0; i < items.length; i++) {
    				items[i].setStyle({
    					transform: 'translate3d(0,0,0)',
                        opacity: 1,
                        visibility: 'visible',
                        transition: '' // 移除 transition
    				});
    			}
				itemsCache = null;
				floatingItemCache = null;
				lastAutoScrollCall = 0;
            }
		}
	}
    
    function onScrollTopChange(newValue, oldValue, ownerInstance, instance) {
        currentScrollTop = newValue;
    }
    
    function onWrapperTouchStart(event, ownerInstance) {
        var touch = event.touches[0];
        if (touch) {
            startY = touch.clientY;
        }
    }
    
    function onHandleTouchStart(event, ownerInstance) {
        var instance = event.instance;
        var dataset = instance.getDataset();
        var index = dataset.index;
        
        if (index !== undefined) {
             var touch = event.touches[0];
             if (touch) {
                 startY = touch.clientY;
             }
             ownerInstance.callMethod('startDrag', index);
             
             // 等待 Vue 层更新状态后，再计算 offset
             ownerInstance.setTimeout(function() {
                 if (itemRects.length > 0) {
                     for (var i = 0; i < itemRects.length; i++) {
                        if (itemRects[i].dataset && itemRects[i].dataset.index === index) {
                            var currentVisualTop = itemRects[i].absTop - currentScrollTop + containerTop;
                            dragOffsetY = startY - currentVisualTop;
                            dragItemHeight = itemRects[i].height;
                            break;
                        }
                     }
                 } else {
                     dragOffsetY = 50; // 默认偏移
                 }
             }, 10);
        }
    }
	
	function onTouchMove(event, ownerInstance) {
		if (!isDragging) return;
		
		var touch = event.touches[0];
		if (!touch) return;
		
		var touchY = touch.clientY; // Viewport Y
        
		var now = Date.now();
		if (now - lastAutoScrollCall >= AUTO_SCROLL_THROTTLE) {
			ownerInstance.callMethod('handleWxsAutoScroll', { touchY: touchY });
			lastAutoScrollCall = now;
		}
		
        if (dragOffsetY === 0 && dragItemHeight > 0) {
             dragOffsetY = dragItemHeight / 2;
        }
        
        // 1. 移动浮动项（Visual - Viewport Relative）
		var targetVisualTop = touchY - dragOffsetY;
		var floatingItem = floatingItemCache || ownerInstance.selectComponent('.floating-msg-item');
		floatingItemCache = floatingItem;
		if (floatingItem) {
			floatingItem.setStyle({
				top: targetVisualTop + 'px'
			});
		}
		
		// 2. 计算交换（Absolute Coordinates Logic）
        // 当前手指对应的绝对位置中心
        // touchAbsY = touchY - containerTop + currentScrollTop
        // dragCenterAbsY = (touchY - dragOffsetY) - containerTop + currentScrollTop + dragItemHeight/2
        var dragTopAbsY = targetVisualTop - containerTop + currentScrollTop;
        var dragCenterAbsY = dragTopAbsY + dragItemHeight / 2;
        
        // 找到 placeholder 对应的 itemRects 索引
        // 我们假设 itemRects[k] 对应 visibleMessageList[k]
        
        // 找到 placeholderIndex 目前在哪
        var currentPlaceholderRectIndex = -1;
        for (var i = 0; i < itemRects.length; i++) {
            if (itemRects[i].dataset.index === placeholderIndex) {
                currentPlaceholderRectIndex = i;
                break;
            }
        }
        
        if (currentPlaceholderRectIndex === -1) return;
        
        var swapTargetIndex = -1;
        
        // 改进策略：越过中线交换（Cross Midline）
        for (var i = 0; i < itemRects.length; i++) {
            var rect = itemRects[i];
            var rectIndex = rect.dataset.index;
            
            // 跳过自己
            if (rectIndex === placeholderIndex) continue;
            
            var rectCenter = rect.absTop + rect.height / 2;
            // 如果 placeholder 在 i 之前 (placeholderIndex < rectIndex)
            
            // 如果 placeholder 在 i 之后 (placeholderIndex > rectIndex)
            
            if (dragCenterAbsY > rect.absTop && dragCenterAbsY < (rect.absTop + rect.height)) {
                // 钀藉湪 rect i 的范围内
                if (placeholderIndex < rectIndex) {
                     if (dragCenterAbsY > rectCenter) {
                         swapTargetIndex = rectIndex;
                     }
                } else {
                    if (dragCenterAbsY < rectCenter) {
                        swapTargetIndex = rectIndex;
                    }
                }
            }
        }
        
        if (swapTargetIndex !== -1 && swapTargetIndex !== placeholderIndex) {
            var now = Date.now();
            if (now - lastSwapTime > SWAP_COOLDOWN) {
                placeholderIndex = swapTargetIndex;
                lastSwapTime = now;
                ownerInstance.callMethod('wxsVibrate');
                updateListTransforms(ownerInstance);
            }
        }
	}
	
	function updateListTransforms(ownerInstance) {
		var items = itemsCache || ownerInstance.selectAllComponents('.msg-item-wrapper');
		itemsCache = items;
		
		for (var i = 0; i < items.length; i++) {
			var item = items[i];
			var index = item.getDataset().index;
			
			if (index == dragStartIndex) {
				item.setStyle({ opacity: 0, visibility: 'hidden' });
				continue;
			}
			
			var transform = 'translate3d(0,0,0)';
			
			if (dragStartIndex < placeholderIndex) {
				if (index > dragStartIndex && index <= placeholderIndex) {
					transform = 'translate3d(0, -' + dragItemHeight + 'px, 0)';
				}
			}
			else if (dragStartIndex > placeholderIndex) {
				if (index >= placeholderIndex && index < dragStartIndex) {
					transform = 'translate3d(0, ' + dragItemHeight + 'px, 0)';
				}
			}
			
			item.setStyle({
				opacity: 1,
				visibility: 'visible',
				transform: transform,
				transition: 'transform 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)' // 确保动画平滑
			});
		}
	}
	
	function onTouchEnd(event, ownerInstance) {
		if (!isDragging) return;
        finishDrag(ownerInstance);
        var floatingItem = ownerInstance.selectComponent('.floating-msg-item');
        if (floatingItem) {
            floatingItem.setStyle({
                opacity: 0,
                transition: 'opacity 0.1s'
            });
        }
	}
    
    function finishDrag(ownerInstance) {
        ownerInstance.callMethod('onWxsDragEnd', {
			from: dragStartIndex,
			to: placeholderIndex
		});
		isDragging = false;
		dragOffsetY = 0;
		itemsCache = null;
		floatingItemCache = null;
		lastAutoScrollCall = 0;
    }

	module.exports = {
        onWrapperTouchStart: onWrapperTouchStart,
        onHandleTouchStart: onHandleTouchStart,
		onTouchMove: onTouchMove,
		onTouchEnd: onTouchEnd,
		updateDragData: updateDragData,
        onScrollTopChange: onScrollTopChange
	}
</script>

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
	import QuotedMessagePreview from '../../components/QuotedMessagePreview/QuotedMessagePreview.vue';
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
			MessagePopupMenu,
			QuotedMessagePreview
		},
		onLoad(options) {

			if (options.guestInfo) {
				try {
					const rawGuestInfo = options.guestInfo;
					let parsedGuestInfo;
					try {
						parsedGuestInfo = JSON.parse(decodeURIComponent(rawGuestInfo));
					} catch (_) {
						parsedGuestInfo = JSON.parse(rawGuestInfo);
					}
					this.guestInfo = parsedGuestInfo;
					this.massageList = JSON.parse(this.guestInfo.content || '[]') || [];
				} catch (e) {
					console.error('guestInfo 参数解析失败', e, options.guestInfo);
					this.massageList = [];
					this.updateMsg();
				}
			}
			const emailIndex = Number(options && options.emailIndexMsg);
			this.emailIndexMsg = Number.isFinite(emailIndex) && emailIndex > 0 ? emailIndex : 0;
			// 获取账号信息
			const userId = uni.getStorageSync('userId')
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
			this.loadWatermarkSettings();

			this.$forceUpdate()


		},
		onUnload() {
			if (this.scrollTimer) {
				clearTimeout(this.scrollTimer);
				this.scrollTimer = null;
			}
			if (this.measureTimer) {
				clearTimeout(this.measureTimer);
				this.measureTimer = null;
			}
			if (this.autoScrollTimer) {
				clearInterval(this.autoScrollTimer);
				this.autoScrollTimer = null;
			}
			if (this.longPressTimer) {
				clearTimeout(this.longPressTimer);
				this.longPressTimer = null;
			}
			
			// 移除键盘高度监听器
			uni.offKeyboardHeightChange();
			this.resetDragState();
			// this.messageParseCache.clear();
			// this.itemHeightCache.clear();
		},
		data() {
			return {
				isIos: false,
				showChatToolBar: true,
				currentFontSize: 16, // 榛樿瀛椾綋澶у皬
				scrollTop: 0,
				chatBodyLoading: false,
				_hasInitialAutoScroll: false,
				contentbg: "null",
				componentScale: (() => {
					const raw = Number(uni.getStorageSync('chat_component_scale'));
					if (!Number.isNaN(raw) && raw > 0) return raw;
					return 1;
				})(),


				keyboardHeight: 0,
				userInfo: {},

				guestInfo: {},
				emailIndexMsg: 0,
				isMe: false,
				openPopup: false,
				inputValue: "",
				quoteDraft: null,

				massageList: [{
					type: "content",
					contentType: "yuyin",
					location: 1,
					content: {
						time: 12
					}
				}],
				// 虚拟滚动相关
				useVirtualScroll: false,
				virtualScrollEnabled: true, // 是否启用虚拟滚动（消息数量超过阈值时启用）
				virtualScrollThreshold: 50, // 启用虚拟滚动的消息数量阈值
				visibleStartIndex: 0, // 可见区域起始索引
				visibleEndIndex: 0, // 可见区域结束索引
				scrollBuffer: 5, // 缓冲区消息数量（上下各保留5条）
				estimatedItemHeight: 100, // 估算的每条消息高度（px）
				containerHeight: 0, // 容器高度
				scrollPosition: 0, // 当前滚动位置
				scrollTimer: null, // 滚动节流定时器
				measureTimer: null,
				topPlaceholderHeightPx: 0,
				bottomPlaceholderHeightPx: 0,
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
				timePickerDate: "",
				timePickerTime: "",
				timeUse24Hour: false,
				tipsInfo: {
					gusetName: "",
					tipType: "payment"
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
				messageMenuActions: {
					// 时间消息
					tips: [
						{ icon: 'close', label: '删除', method: 'deleteMessage_1' },
						{ icon: 'chatbubble', label: '消息插入', method: 'addMsg' },
						{ icon: 'chat', label: '时间编辑', method: 'changeMsg' },
						{ icon: 'wallet', label: '插入收款', method: 'insertOrder' },
						{ icon: 'info', label: '插入转账', method: 'insertTransfer' },
						{ icon: 'info', label: '插入文件', method: 'insertFile' },
						{ icon: 'info', label: '插入红包', method: 'insertRedBag' },
						{ icon: 'phone', label: '插入通话状态', method: 'openCallStatusPopup' }
					],
					tipsContent: [
						{ icon: 'close', label: '删除', method: 'deleteMessage_1' },
						{ icon: 'chatbubble', label: '消息插入', method: 'addMsg' },
						{ icon: 'chat', label: '编辑', method: 'editTips' },
						{ icon: 'info', label: '插入收款', method: 'insertOrder' },
						{ icon: 'info', label: '插入转账', method: 'insertTransfer' },
						{ icon: 'info', label: '插入文件', method: 'insertFile' },
						{ icon: 'info', label: '插入红包', method: 'insertRedBag' },
						{ icon: 'phone', label: '插入通话状态', method: 'openCallStatusPopup' }
					],
					tipsSimple: [
						{ icon: 'close', label: '删除', method: 'deleteMessage_1' },
						{ icon: 'chatbubble', label: '消息插入', method: 'addMsg' },
						{ icon: 'info', label: '插入收款', method: 'insertOrder' },
						{ icon: 'info', label: '插入转账', method: 'insertTransfer' },
						{ icon: 'info', label: '插入文件', method: 'insertFile' },
						{ icon: 'info', label: '插入红包', method: 'insertRedBag' },
						{ icon: 'phone', label: '插入通话状态', method: 'openCallStatusPopup' }
					],
					order: [
						{ icon: 'close', label: '删除', method: 'deleteMessage_1' },
						{ icon: 'info', label: '插入时间', method: 'insertTime' },
						{ icon: 'person', label: '切换角色', method: 'toggleRole' },
						{ icon: 'chatbubble', label: '消息插入', method: 'addMsg' },
						{ icon: 'info', label: '插入收款', method: 'insertOrder' },
						{ icon: 'info', label: '插入转账', method: 'insertTransfer' },
						{ icon: 'info', label: '插入文件', method: 'insertFile' },
						{ icon: 'info', label: '插入红包', method: 'insertRedBag' },
						{ icon: 'phone', label: '插入通话状态', method: 'openCallStatusPopup' }
					],
					transfer: [
						{ icon: 'close', label: '删除', method: 'deleteMessage_1' },
						{ icon: 'info', label: '插入时间', method: 'insertTime' },
						{ icon: 'person', label: '切换角色', method: 'toggleRole' },
						{ icon: 'chatbubble', label: '消息插入', method: 'addMsg' },
						{ icon: 'info', label: '收款', method: 'resTransfer' },
						{ icon: 'info', label: '插入收款', method: 'insertOrder' },
						{ icon: 'info', label: '插入转账', method: 'insertTransfer' },
						{ icon: 'info', label: '插入文件', method: 'insertFile' },
						{ icon: 'info', label: '插入红包', method: 'insertRedBag' },
						{ icon: 'phone', label: '插入通话状态', method: 'openCallStatusPopup' }
					],
					// 鑱婂ぉ消息
					chat: [
						{ icon: 'close', label: '删除', method: 'deleteMessage_1' },
						{ icon: 'info', label: '插入时间', method: 'insertTime' },
						{ icon: 'person', label: '切换角色', method: 'toggleRole' },
						{ icon: 'chat', label: '消息编辑', method: 'changeMsg' },
						{ icon: 'chatbubble', label: '消息插入', method: 'addMsg' },
						{ icon: 'info', label: '插入收款', method: 'insertOrder' },
						{ icon: 'info', label: '插入转账', method: 'insertTransfer' },
						{ icon: 'info', label: '插入文件', method: 'insertFile' },
						{ icon: 'info', label: '插入红包', method: 'insertRedBag' },
						{ icon: 'phone', label: '插入通话状态', method: 'openCallStatusPopup' }
					],
					// 收款消息
					wxtf: [
						{ icon: 'close', label: '删除', method: 'deleteMessage_1' },
						{ icon: 'info', label: '插入时间', method: 'insertTime' },
						{ icon: 'person', label: '切换角色', method: 'toggleRole' },
						{ icon: 'chatbubble', label: '消息插入', method: 'addMsg' },
						{ icon: 'info', label: '插入收款', method: 'insertOrder' },
						{ icon: 'info', label: '插入转账', method: 'insertTransfer' },
						{ icon: 'folder', label: '插入文件', method: 'insertFile' },
						{ icon: 'info', label: '插入红包', method: 'insertRedBag' },
						{ icon: 'phone', label: '插入通话状态', method: 'openCallStatusPopup' }
					],
					// 视频电话消息
					video: [
						{ icon: 'close', label: '删除', method: 'deleteMessage_1', triggerOnTouchStart: true },
						{ icon: 'info', label: '插入时间', method: 'insertTime' },
						{ icon: 'person', label: '切换角色', method: 'toggleRole' },
						{ icon: 'chatbubble', label: '消息插入', method: 'addMsg' },
						{ icon: 'chat', label: '消息编辑', method: 'changeMsg' },
						{ icon: 'info', label: '插入收款', method: 'insertOrder' },
						{ icon: 'info', label: '插入转账', method: 'insertTransfer' },
						{ icon: 'folder', label: '插入文件', method: 'insertFile' },
						{ icon: 'info', label: '插入红包', method: 'insertRedBag' },
						{ icon: 'phone', label: '插入通话状态', method: 'openCallStatusPopup' }
					],
					yuyin: [
						{ icon: 'close', label: '删除', method: 'deleteMessage_1' },
						{ icon: 'info', label: '插入时间', method: 'insertTime' },
						{ icon: 'person', label: '切换角色', method: 'toggleRole' },
						{ icon: 'chatbubble', label: '消息插入', method: 'addMsg' },
						{ icon: 'info', label: '插入收款', method: 'insertOrder' },
						{ icon: 'info', label: '插入转账', method: 'insertTransfer' },
						{ icon: 'folder', label: '插入文件', method: 'insertFile' },
						{ icon: 'info', label: '插入红包', method: 'insertRedBag' },
						{ icon: 'phone', label: '插入通话状态', method: 'openCallStatusPopup' }
					],
					// 名片消息
					crad: [
						{ icon: 'close', label: '删除', method: 'deleteMessage_1' },
						{ icon: 'info', label: '插入时间', method: 'insertTime' },
						{ icon: 'person', label: '切换角色', method: 'toggleRole' },
						{ icon: 'chatbubble', label: '消息插入', method: 'addMsg' },
						{ icon: 'info', label: '插入收款', method: 'insertOrder' },
						{ icon: 'info', label: '插入转账', method: 'insertTransfer' },
						{ icon: 'info', label: '插入文件', method: 'insertFile' },
						{ icon: 'info', label: '插入红包', method: 'insertRedBag' },
						{ icon: 'phone', label: '插入通话状态', method: 'openCallStatusPopup' }
					],
					redBag: [
						{ icon: 'close', label: '删除', method: 'deleteMessage_1' },
						{ icon: 'info', label: '插入时间', method: 'insertTime' },
						{ icon: 'person', label: '切换角色', method: 'toggleRole' },
						{ icon: 'chatbubble', label: '消息插入', method: 'addMsg' },
						{ icon: 'info', label: '插入红包', method: 'insertRedBag' },
						{ icon: 'info', label: '插入收款', method: 'insertOrder' },
						{ icon: 'info', label: '插入转账', method: 'insertTransfer' },
						{ icon: 'info', label: '插入文件', method: 'insertFile' },
						{ icon: 'info', label: '插入红包', method: 'insertRedBag' },
						{ icon: 'phone', label: '插入通话状态', method: 'openCallStatusPopup' }
					],
					// 文件消息
					file: [
						{ icon: 'close', label: '删除', method: 'deleteMessage_1' },
						{ icon: 'info', label: '插入时间', method: 'insertTime' },
						{ icon: 'person', label: '切换角色', method: 'toggleRole' },
						{ icon: 'chatbubble', label: '消息插入', method: 'addMsg' },
						{ icon: 'info', label: '插入文件', method: 'insertFile' },
						{ icon: 'info', label: '插入收款', method: 'insertOrder' },
						{ icon: 'info', label: '插入转账', method: 'insertTransfer' },
						{ icon: 'info', label: '插入文件', method: 'insertFile' },
						{ icon: 'info', label: '插入红包', method: 'insertRedBag' },
						{ icon: 'phone', label: '插入通话状态', method: 'openCallStatusPopup' }
					],
					// 默认配置（用于其他类型）
					default: [
						{ icon: 'close', label: '删除', method: 'deleteMessage_1' },
						{ icon: 'info', label: '插入时间', method: 'insertTime' },
						{ icon: 'person', label: '切换角色', method: 'toggleRole' },
						{ icon: 'chatbubble', label: '消息插入', method: 'addMsg' },
						{ icon: 'info', label: '插入收款', method: 'insertOrder' },
						{ icon: 'info', label: '插入转账', method: 'insertTransfer' },
						{ icon: 'info', label: '插入文件', method: 'insertFile' },
						{ icon: 'info', label: '插入红包', method: 'insertRedBag' },
						{ icon: 'phone', label: '插入通话状态', method: 'openCallStatusPopup' }

					]
				},
				timePopupVisible: false,
				currentTime: '',




				// 弹出菜单相关
				activeMsgIndex: -1,
				currentActionIndex: -1,
				enableLongPressPopup: true, // 控制长按弹框功能
				enableLongPressDrag: false, // 控制长按拖拽功能
				
				// 拖拽相关
				dragStartIndex: -1, // 拖拽开始的消息索引（在数据源中的索引）
				dragOverIndex: -1, // 拖拽悬停的消息索引（已废弃，使用placeholderIndex）
				isDragging: false, // 是否正在拖拽
				isSortingMode: false, // 是否处于排序模式
				draggingItem: null, // 当前拖拽的消息对象（用于浮动显示）
				draggingItemParsedContent: [], // 缓存拖拽项的解析内容
				dragItemHeight: 0, // 拖拽项的高度
				dragY: 0, // 浮动项的Y坐标
				placeholderIndex: -1, // 占位符当前索引（视觉上的位置）
				dragOffsetY: 0, // 手指相对item顶部的偏移
				dragStartY: 0, // 拖拽开始的Y坐标
				longPressTimer: null, // 长按定时器
				autoScrollTimer: null, // 自动滚动定时器
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
						label: "提示",
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
					},
					{
						name: "phone",
						label: "语音通话",
						icon: "/static/tell.png"
					},
					{
						name: "callStatus",
						label: "通话状态",
						icon: "/static/tell.png"
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
				imageSizes: {},
				// WXS 交互数据
				wxsDragData: {
					isDragging: false,
					dragStartIndex: -1,
					rects: [],
					initialScrollTop: 0,
					scrollTop: 0
				},
				originalMessageList: [], // 备份原始列表
				// cachedItemRects: [], // 移至非响应式数据
				// initialScrollTop: 0 // 移至非响应式数据
				// 消息解析缓存
				messageParseCache: new Map(), // 缓存 parseMessage 结果
				itemHeightCache: new Map() // key: index, value: height
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
			hasEmailIndexMsg() {
				return Number(this.emailIndexMsg) > 0;
			},
			emailIndexText() {
				const count = Number(this.emailIndexMsg) || 0;
				return count > 99 ? '99+' : String(count);
			},
			visibleMessageList() {
				if (!this.useVirtualScroll) {
					return this.massageList.map((item, index) => ({ item, index, isVisible: true }));
				}
				if (!this.virtualScrollEnabled || this.massageList.length <= this.virtualScrollThreshold) {
					return this.massageList.map((item, index) => ({ item, index, isVisible: true }));
				}

				if (!this.visibleEndIndex || this.visibleEndIndex <= 0) {
					const safeContainerHeight = this.containerHeight || 600;
					const visibleCount = Math.ceil(safeContainerHeight / this.estimatedItemHeight) + this.scrollBuffer * 4;
					const start = Math.max(0, this.massageList.length - visibleCount);
					const end = this.massageList.length;
					return this.massageList.slice(start, end).map((item, relativeIndex) => ({
						item,
						index: start + relativeIndex,
						isVisible: true
					}));
				}
				
				// 计算可见范围
				const start = Math.max(0, this.visibleStartIndex - this.scrollBuffer);
				const end = Math.min(this.massageList.length, this.visibleEndIndex + this.scrollBuffer);
				return this.massageList.slice(start, end).map((item, relativeIndex) => ({
					item,
					index: start + relativeIndex,
					isVisible: true
				}));
			},
			// 计算上方占位符高度
			topPlaceholderHeight() {
				if (!this.useVirtualScroll) return 0;
				if (!this.virtualScrollEnabled || this.massageList.length <= this.virtualScrollThreshold) {
					return 0;
				}
				if (!this.visibleEndIndex || this.visibleEndIndex <= 0) return 0;
				return this.topPlaceholderHeightPx || (this.visibleStartIndex * this.estimatedItemHeight);
			},
			// 计算下方占位符高度
			bottomPlaceholderHeight() {
				if (!this.useVirtualScroll) return 0;
				if (!this.virtualScrollEnabled || this.massageList.length <= this.virtualScrollThreshold) {
					return 0;
				}
				if (!this.visibleEndIndex || this.visibleEndIndex <= 0) return 0;
				const remaining = this.massageList.length - this.visibleEndIndex;
				return this.bottomPlaceholderHeightPx || (remaining * this.estimatedItemHeight);
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
			currentMenuActions() {
				if (this.activeMsgIndex !== -1 && this.massageList[this.activeMsgIndex]) {
					return this.getMessageMenuActions(this.massageList[this.activeMsgIndex]);
				}
				return [];
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
			this.cachedItemRects = [];
			this.initialScrollTop = 0;
			this.initVirtualScroll();
			this.scrollToBottom({ initial: true });
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
				this.saveWatermarkSettings();

				this.closeWatermarkSettings();
			},
			loadWatermarkSettings() {
				try {
					const savedSettings = uni.getStorageSync('watermarkSettings');
					if (savedSettings) {
						let settings = savedSettings;
						if (typeof savedSettings === 'string') {
							settings = JSON.parse(savedSettings);
						}
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
							console.log('已加载本地水印设置', settings);
						}
					}
				} catch (error) {
					console.error('读取水印设置失败:', error);
					console.log('使用默认水印设置');
				}
			},
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
			// 计算图片显示尺寸（参数为upx单位）
			calculateImageSize(originalWidth, originalHeight, imageKey) {
				const maxWidth = 270; // upx
				const maxHeight = 300; // upx
				const minWidth = 80; // upx
				const minHeight = 80; // upx

				let displayWidth = originalWidth;
				let displayHeight = originalHeight;
				if (displayWidth > maxWidth || displayHeight > maxHeight) {
					const widthRatio = maxWidth / displayWidth;
					const heightRatio = maxHeight / displayHeight;
					const ratio = Math.min(widthRatio, heightRatio);
					displayWidth = displayWidth * ratio;
					displayHeight = displayHeight * ratio;
				}
				if (displayWidth < minWidth && displayHeight < minHeight) {
					const widthRatio = minWidth / displayWidth;
					const heightRatio = minHeight / displayHeight;
					const ratio = Math.max(widthRatio, heightRatio);
					displayWidth = displayWidth * ratio;
					displayHeight = displayHeight * ratio;
				}
				displayWidth = Math.max(minWidth, Math.min(maxWidth, displayWidth));
				displayHeight = Math.max(minHeight, Math.min(maxHeight, displayHeight));
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
					// uni-app 中，设计稿基准为 750px
					const systemInfo = uni.getSystemInfoSync();
					const screenWidth = systemInfo.windowWidth || 375; // 设备屏幕宽度（px）
					const designWidth = 750; // 设计稿宽度（upx）

					// 将像素转换为 upx
					const upxWidth = (width / screenWidth) * designWidth;
					const upxHeight = (height / screenWidth) * designWidth;

					// 计算显示尺寸
					const size = this.calculateImageSize(upxWidth, upxHeight, imageKey);
					const actualHeightPx = (size.height / designWidth) * screenWidth;
					this.itemHeightCache.set(index, actualHeightPx + 20); // 20px 是消息的 padding/margin

					// 强制更新视图
					this.$forceUpdate();

					this.$nextTick(() => {
						setTimeout(() => {
							uni.createSelectorQuery().select('.chat-body')
								.fields({
									size: true,
									scrollOffset: true
								}, res => {
									if (!res) return;
									if (this.virtualScrollEnabled) {
										this.updateVisibleRange(res.scrollTop || this.scrollPosition || 0);
									}
									const distanceToBottom = res.scrollHeight - (res.scrollTop + res.height);
									if (distanceToBottom < 120) {
										this.scrollToBottom();
									}
								})
								.exec();
						}, 30);
					});
				} catch (error) {
					console.error('处理图片加载事件失败:', error);
				}
			},

			// 获取图片容器样式
			getImageContainerStyle(index) {
				const imageKey = `image_${index}`;
				const size = this.imageSizes[imageKey];
				const scale = Number(this.componentScale) || 1

				const baseStyle = {
					overflow: 'hidden'
				};

				if (size && size.width && size.height) {
					const borderRadius = Math.max(8, Math.min(15, size.height / 2)) * scale;
					return {
						...baseStyle,
						borderRadius: borderRadius + 'rpx',
						width: (size.width * scale) + 'upx',
						height: (size.height * scale) + 'upx',
						maxWidth: (270 * scale) + 'upx',
						maxHeight: (300 * scale) + 'upx',
						minWidth: (80 * scale) + 'upx',
						minHeight: (80 * scale) + 'upx'
					};
				}
				// 如果还没有计算尺寸，则返回默认值
				return {
					...baseStyle,
					borderRadius: (15 * scale) + 'rpx',
					width: (120 * scale) + 'upx',
					height: 'auto',
					maxWidth: (270 * scale) + 'upx',
					maxHeight: (300 * scale) + 'upx',
					minWidth: (80 * scale) + 'upx',
					minHeight: (80 * scale) + 'upx'
				};
			},

			// 获取图片样式
			getImageStyle(index) {
				const imageKey = `image_${index}`;
				const size = this.imageSizes[imageKey];
				const scale = Number(this.componentScale) || 1

				const baseStyle = {
					width: '100%',
					height: '100%',
					display: 'block'
				};

				if (size && size.width && size.height) {
					const borderRadius = Math.max(8, Math.min(15, size.height / 2)) * scale;
					return {
						...baseStyle,
						borderRadius: borderRadius + 'rpx'
					};
				}
				// 如果还没有计算尺寸，则返回默认值
				return {
					...baseStyle,
					borderRadius: (15 * scale) + 'rpx',
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
				const scale = Number(e.detail.value)
				if (Number.isNaN(scale)) return
				this.$store.commit('setScale', scale)
			},
			onComponentScaleChange(e) {
				const scale = Number(e.detail.value)
				if (Number.isNaN(scale)) return
				this.componentScale = scale
				uni.setStorageSync('chat_component_scale', scale)
			},
			onChatToolBarToggle(e) {
				this.showChatToolBar = e.detail.value
			},
			onScroll(e) {
				if (!this.useVirtualScroll) return;
				if (!this.virtualScrollEnabled || this.massageList.length <= this.virtualScrollThreshold) {
					return;
				}
				
				const scrollTop = e.detail.scrollTop;
				this.scrollPosition = scrollTop;
				clearTimeout(this.scrollTimer);
				this.scrollTimer = setTimeout(() => {
					this.updateVisibleRange(scrollTop);
				}, 50);

				clearTimeout(this.measureTimer);
				this.measureTimer = setTimeout(() => {
					this.measureVisibleItemHeights();
				}, 120);
			},
			
			// 鏇存柊鍙区域范围
			updateVisibleRange(scrollTop) {
				if (!this.useVirtualScroll) {
					this.virtualScrollEnabled = false;
					this.visibleStartIndex = 0;
					this.visibleEndIndex = this.massageList.length;
					this.topPlaceholderHeightPx = 0;
					this.bottomPlaceholderHeightPx = 0;
					return;
				}
				if (this.isDragging) return;

				const listLen = this.massageList.length;
				if (!listLen) {
					this.visibleStartIndex = 0;
					this.visibleEndIndex = 0;
					this.topPlaceholderHeightPx = 0;
					this.bottomPlaceholderHeightPx = 0;
					return;
				}
				let startIndex = 0;
				let heightBeforeStartIndex = 0;
				if (this.itemHeightCache.size > 0) {
					let accumulatedHeight = 0;
					let found = false;
					for (let i = 0; i < listLen; i++) {
						const itemHeight = this.itemHeightCache.get(i) || this.estimatedItemHeight;
						if (accumulatedHeight + itemHeight > scrollTop) {
							startIndex = i;
							heightBeforeStartIndex = accumulatedHeight;
							found = true;
							break;
						}
						accumulatedHeight += itemHeight;
					}
					if (!found) {
						const lastHeight = this.itemHeightCache.get(listLen - 1) || this.estimatedItemHeight;
						startIndex = listLen - 1;
						heightBeforeStartIndex = Math.max(0, accumulatedHeight - lastHeight);
					}
				} else {
					startIndex = Math.floor(scrollTop / this.estimatedItemHeight);
					heightBeforeStartIndex = startIndex * this.estimatedItemHeight;
				}

				if (startIndex >= listLen) startIndex = listLen - 1;
				if (startIndex < 0) startIndex = 0;

				let visibleCount = Math.ceil(this.containerHeight / this.estimatedItemHeight) + this.scrollBuffer * 2;
				if (!Number.isFinite(visibleCount) || visibleCount <= 0) visibleCount = this.scrollBuffer * 4 + 10;

				let visibleStart = Math.max(0, startIndex - this.scrollBuffer);
				let visibleEnd = Math.min(listLen, startIndex + visibleCount);

				if (visibleEnd <= visibleStart) {
					visibleStart = Math.max(0, Math.min(visibleStart, listLen - 1));
					visibleEnd = Math.min(listLen, visibleStart + visibleCount);
				}

				this.visibleStartIndex = visibleStart;
				this.visibleEndIndex = visibleEnd;

				let topHeight = 0;
				if (this.itemHeightCache.size > 0) {
					topHeight = heightBeforeStartIndex;
					for (let i = visibleStart; i < startIndex; i++) {
						topHeight -= (this.itemHeightCache.get(i) || this.estimatedItemHeight);
					}
					if (!Number.isFinite(topHeight) || topHeight < 0) topHeight = 0;
				} else {
					topHeight = visibleStart * this.estimatedItemHeight;
				}

				let heightBeforeVisibleEnd = topHeight;
				for (let i = visibleStart; i < visibleEnd; i++) {
					heightBeforeVisibleEnd += (this.itemHeightCache.get(i) || this.estimatedItemHeight);
				}

				let totalHeight = listLen * this.estimatedItemHeight;
				if (this.itemHeightCache.size > 0) {
					for (const [idx, h] of this.itemHeightCache.entries()) {
						if (idx >= 0 && idx < listLen) totalHeight += (h - this.estimatedItemHeight);
					}
				}

				this.topPlaceholderHeightPx = topHeight;
				this.bottomPlaceholderHeightPx = Math.max(0, totalHeight - heightBeforeVisibleEnd);
			},

			measureVisibleItemHeights() {
				if (!this.useVirtualScroll) return;
				if (!this.virtualScrollEnabled || this.massageList.length <= this.virtualScrollThreshold) return;
				if (this.isDragging) return;

				const listLen = this.massageList.length;
				if (!listLen) return;

				const query = uni.createSelectorQuery().in(this);
				query.selectAll('.msg-item-wrapper')
					.fields({
						size: true,
						dataset: true
					}, (nodes) => {
						if (!nodes || !nodes.length) return;

						let changed = false;
						for (let i = 0; i < nodes.length; i++) {
							const node = nodes[i] || {};
							const h = node.height;
							if (!h || h <= 0) continue;

							const datasetIndex = node.dataset && (node.dataset.index !== undefined ? node.dataset.index : node.dataset['index']);
							let idx = Number(datasetIndex);
							if (!Number.isFinite(idx)) {
								const fallback = this.visibleMessageList[i] && this.visibleMessageList[i].index;
								idx = Number(fallback);
							}
							if (!Number.isFinite(idx) || idx < 0 || idx >= listLen) continue;

							const prev = this.itemHeightCache.get(idx);
							if (prev !== h) {
								this.itemHeightCache.set(idx, h);
								changed = true;
							}
						}

						if (changed) {
							this.updateVisibleRange(this.scrollPosition || 0);
						}
					})
					.exec();
			},

			invalidateVirtualScrollCaches() {
				if (this.messageParseCache && typeof this.messageParseCache.clear === 'function') {
					this.messageParseCache.clear();
				}
				if (this.itemHeightCache && typeof this.itemHeightCache.clear === 'function') {
					this.itemHeightCache.clear();
				}

				if (!this.useVirtualScroll) {
					this.virtualScrollEnabled = false;
					this.visibleStartIndex = 0;
					this.visibleEndIndex = this.massageList.length;
					this.topPlaceholderHeightPx = 0;
					this.bottomPlaceholderHeightPx = 0;
					return;
				}

				this.$nextTick(() => {
					if (this.massageList.length <= this.virtualScrollThreshold) {
						this.virtualScrollEnabled = false;
						this.visibleStartIndex = 0;
						this.visibleEndIndex = this.massageList.length;
						this.topPlaceholderHeightPx = 0;
						this.bottomPlaceholderHeightPx = 0;
						return;
					}

					if (!this.virtualScrollEnabled) this.virtualScrollEnabled = true;

					if (!this.containerHeight) {
						this.initVirtualScroll();
						return;
					}

					this.updateVisibleRange(this.scrollPosition || 0);
				});
			},
			initVirtualScroll() {
				if (!this.useVirtualScroll) {
					this.virtualScrollEnabled = false;
					this.visibleStartIndex = 0;
					this.visibleEndIndex = this.massageList.length;
					this.topPlaceholderHeightPx = 0;
					this.bottomPlaceholderHeightPx = 0;
					return;
				}
				if (this.massageList.length <= this.virtualScrollThreshold) {
					this.virtualScrollEnabled = false;
					this.visibleStartIndex = 0;
					this.visibleEndIndex = this.massageList.length;
					this.topPlaceholderHeightPx = 0;
					this.bottomPlaceholderHeightPx = 0;
					return;
				}
				
				this.virtualScrollEnabled = true;
				
				// 获取容器高度
				this.$nextTick(() => {
					uni.createSelectorQuery().select('.chat-body')
						.boundingClientRect((res) => {
							if (!res || !res.height) {
								this._initVirtualScrollRetry = (this._initVirtualScrollRetry || 0) + 1;
								if (this._initVirtualScrollRetry < 20) {
									setTimeout(() => this.initVirtualScroll(), 16);
								}
								return;
							}

							this._initVirtualScrollRetry = 0;
							this.containerHeight = res.height;
							this.visibleEndIndex = this.massageList.length;
							this.visibleStartIndex = Math.max(0, this.massageList.length - Math.ceil(this.containerHeight / this.estimatedItemHeight) - this.scrollBuffer * 2);
							this.topPlaceholderHeightPx = this.visibleStartIndex * this.estimatedItemHeight;
							this.bottomPlaceholderHeightPx = (this.massageList.length - this.visibleEndIndex) * this.estimatedItemHeight;
						})
						.exec();
				});
			},
			
			scrollToBottom(opts = {}) {
				this.$nextTick(() => {
					setTimeout(() => {
						uni.createSelectorQuery().select('.chat-body')
							.fields({
								size: true, // 获取元素尺寸
								scrollOffset: true // 获取滚动位置和内容尺寸
							}, res => {
								if (!res) return;
								if (res.height) {
									this.containerHeight = res.height;
								}
								const threshold = 10; // 容差值，单位px
								const shouldScroll = res.scrollHeight > res.height + threshold;
								if (opts.initial && !this._hasInitialAutoScroll && shouldScroll) {
									this.chatBodyLoading = true;
								}

								if (shouldScroll) {
									this.scrollTop = res.scrollHeight;
									if (this.virtualScrollEnabled) {
										this.visibleEndIndex = this.massageList.length;
										this.visibleStartIndex = Math.max(0, this.massageList.length - Math.ceil(this.containerHeight / this.estimatedItemHeight) - this.scrollBuffer * 2);
									}
									if (opts.initial && !this._hasInitialAutoScroll) {
										this._hasInitialAutoScroll = true;
										setTimeout(() => {
											this.chatBodyLoading = false;
										}, 60);
									}
								} else {
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
				this.updateMsg()
			},
			goReceipt(item) {
				// console.log(item);
				uni.navigateTo({
					url: "/pages/receipt/receipt?info=" + encodeURIComponent(JSON.stringify(item.content))
				})
			},
			goCollection(item) {
				uni.navigateTo({
					url: "/pages/collectionSuccess/collectionSuccess?info=" + encodeURIComponent(JSON.stringify(
						item.content))
				})
			},
			openCustomerDetail() {
				uni.navigateTo({
					url: "/pages/customerDetail/customerDetail?info=" + encodeURIComponent(JSON.stringify(this.guestInfo || {}))
				});
			},
			clearQuoteDraft() {
				this.quoteDraft = null;
			},
			startQuote(index) {
				const item = this.massageList[index];
				if (!item) return;
				this.quoteDraft = this.buildQuoteSnapshot(item);
			},
			buildQuoteSnapshot(item) {
				const fromLocation = item.location === 1 ? 1 : 0;
				const fromName = fromLocation === 1 ? '我' : (this.guestInfo.name || '');
				const contentType = item.contentType || item.type || '';
				let previewText = '';
				let previewImage = '';
				
				if (item.type === 'tips') {
					previewText = String(item.content || '');
				} else {
					switch (contentType) {
						case 'chat':
							previewText = String(item.content || '');
							break;
						case 'photo':
							previewText = '[图片]';
							previewImage = item.content && (item.content.avatar || item.content.url) ? (item.content.avatar || item.content.url) : '';
							break;
						case 'file':
							previewText = `[文件] ${(item.content && item.content.fileName) ? item.content.fileName : ''}`.trim();
							break;
						case 'order':
							previewText = `[对外收款] ${(item.content && item.content.shopName) ? ('收款给' + item.content.shopName) : ''}`.trim();
							break;
						case 'transfer':
							previewText = `[转账] ${(item.content && item.content.amount) ? ('¥' + item.content.amount) : ''}`.trim();
							break;
						case 'wxtf':
							previewText = `[收款] ${(item.content && item.content.amount) ? ('¥' + item.content.amount) : ''}`.trim();
							break;
						case 'redBag':
							previewText = '[红包]';
							break;
						case 'crad':
							previewText = `[名片] ${(item.content && item.content.nickname) ? item.content.nickname : ''}`.trim();
							break;
						case 'yuyin':
							previewText = `[语音] ${(item.content && item.content.time) ? (item.content.time + '"') : ''}`.trim();
							break;
						case 'video':
							previewText = `[视频通话] ${(item.content !== undefined && item.content !== null) ? String(item.content) : ''}`.trim();
							break;
						case 'phone':
							if (String(item.content || '') === '已取消') {
								previewText = '[语音通话] 已取消';
							} else if (String(item.content || '') === '未接听') {
								previewText = '[语音通话] 对方未接听';
							} else if (String(item.content || '') === '对方已取消') {
								previewText = '[语音通话] 对方已取消';
							} else {
								previewText = `[语音通话] 通话时长${(item.content !== undefined && item.content !== null) ? String(item.content) : ''}`.trim();
							}
							break;
						default:
							previewText = `[${contentType || '消息'}]`;
					}
				}
				
				if (!previewText) previewText = '[消息]';
				
				const snapshot = {
					fromName,
					fromLocation,
					contentType,
					previewText
				};
				if (previewImage) snapshot.previewImage = previewImage;
				return snapshot;
			},
			updateMsg() {
				this.guestInfo.content = JSON.stringify(this.massageList)

				updateConversation(this.guestInfo.conversationId, this.guestInfo)
					.catch(err => {
						console.error('更新消息失败:', err);
						uni.showToast({
							title: '保存失败，请重试',
							icon: 'none',
							duration: 2000
						});
					});
			},
			deleteMessage_1(index) {
				this.massageList.splice(index, 1);
				this.activeMsgIndex = -1; // 清除激活状态
				this.popupVisible = false;
				this.invalidateVirtualScrollCaches();
				this.updateMsg()
			},


			showPopupMenu(e, index) {
				if (!this.enableLongPressPopup || this.enableLongPressDrag) {
					return;
				}
				const touch = e.touches?.[0] || {};
				const clientX = touch.clientX || 0;
				const clientY = touch.clientY || 0;

				// 获取窗口尺寸
				const systemInfo = uni.getSystemInfoSync();
				const windowWidth = systemInfo.windowWidth;
				const windowHeight = systemInfo.windowHeight;
				const maxMenuWidth = windowWidth * 0.9;
				const estimatedItemWidth = 100; // px
				// 获取当前消息的菜单项数量
				const currentMsg = this.massageList[index];
				const menuActions = this.getMessageMenuActions(currentMsg);
				const itemCount = menuActions.length;
				const estimatedMenuWidth = Math.min(
					itemCount * estimatedItemWidth + 40, // 40px 是 padding
					maxMenuWidth
				);
				let left = clientX;
				if (left + estimatedMenuWidth > windowWidth - 10) {
					left = windowWidth - estimatedMenuWidth - 10;
				}
				if (left < 10) {
					left = 10;
				}
				// 触摸点下方预留一些间距，比如 20px
				let top = clientY + 20;
				const estimatedMenuHeight = Math.ceil(itemCount / Math.floor(maxMenuWidth / estimatedItemWidth)) * 100 + 30; // 估算高度
				if (top + estimatedMenuHeight > windowHeight - 20) {
					// 如果底部放不下，尝试放在上方
					const topAbove = clientY - estimatedMenuHeight - 20;
					if (topAbove > 10 || (clientY > windowHeight / 2)) {
						top = topAbove;
					} else {
						top = windowHeight - estimatedMenuHeight - 10;
					}
				}
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
			getMessageMenuActions(item) {
				let actions = this.messageMenuActions.default;
				if (item.type === 'tips') {
					actions = this.messageMenuActions.tips;
				} else if (item.contentType === 'tips') {
					const tipType = item?.content?.tipType || 'payment';
					actions = tipType === 'payment' ? this.messageMenuActions.tipsContent : this.messageMenuActions.tipsSimple;
				} else if (item.contentType === 'order') {
					actions = this.messageMenuActions.order;
				} else if (item.contentType === 'transfer') {
					actions = this.messageMenuActions.transfer;
				} else if (item.contentType === 'chat') {
					actions = this.messageMenuActions.chat;
				} else if (item.contentType === 'wxtf') {
					actions = this.messageMenuActions.wxtf;
				} else if (item.contentType === 'video') {
					actions = this.messageMenuActions.video;
				} else if (item.contentType === 'yuyin') {
					actions = this.messageMenuActions.yuyin;
				} else if (item.contentType === 'crad') {
					actions = this.messageMenuActions.crad;
				} else if (item.contentType === 'redBag') {
					actions = this.messageMenuActions.redBag;
				} else if (item.contentType === 'file') {
					actions = this.messageMenuActions.file;
				}
				
				const quoteAction = { icon: 'compose', label: '引用', method: 'startQuote' };
				if (Array.isArray(actions) && !actions.some(a => a && a.method === 'startQuote')) {
					return [quoteAction, ...actions];
				}
				return actions;
			},
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
			getTipsText(messageItem) {
				const content = (messageItem && messageItem.content) || {};
				const tipType = content.tipType || 'payment';
				if (tipType === 'revoke_other') {
					return content.text || `${this.guestInfo.name || '对方'}撤回了一条消息`;
				}
				if (tipType === 'revoke_self') {
					return content.text || '你撤回了一条消息';
				}
				if (tipType === 'add_contact') {
					return `你已添加了${content.friendName || '好友'}，现在可以开始聊天了`;
				}
				return `你收到了${content.gusetName || ''}的付款`;
			},
			getTipsActionText(messageItem) {
				const content = (messageItem && messageItem.content) || {};
				const tipType = content.tipType || 'payment';
				if (tipType === 'revoke_self') {
					return '重新编辑';
				}
				if (tipType === 'revoke_other') {
					return '';
				}
				if (tipType === 'add_contact') {
					return '';
				}
				return '查看';
			},
			closeTipsTypePopup() {
				this.$refs.tipsTypePopup && this.$refs.tipsTypePopup.close();
			},
			onSelectTipsType(type) {
				this.closeTipsTypePopup();
				if (type === 'payment') {
					this.editMsgIndex = -1;
					this.tipsInfo = {
						gusetName: '',
						tipType: 'payment'
					};
					this.tipsKey = {
						gusetName: "付款人名称"
					};
					this.$refs.tipsPopup.open();
					return;
				}
				if (type === 'add_contact') {
					this.editMsgIndex = -1;
					this.tipsInfo = {
						friendName: '',
						tipType: 'add_contact'
					};
					this.tipsKey = {
						friendName: "好友名称"
					};
					this.$refs.tipsPopup.open();
					return;
				}
				this.addPresetTips(type);
			},
			addPresetTips(type) {
				const location = this.isMe ? 1 : 0;
				let content;
				if (type === 'revoke_other') {
					content = {
						tipType: 'revoke_other',
						text: `${this.guestInfo.name || '对方'}撤回了一条消息`
					};
				} else if (type === 'revoke_self') {
					content = {
						tipType: 'revoke_self',
						text: '你撤回了一条消息'
					};
				} else if (type === 'add_contact') {
					content = {
						tipType: 'add_contact',
						text: `你已添加了${this.guestInfo.name || '对方'}，现在可以开始聊天了`
					};
				}
				if (!content) return;
				const tipsInfo = {
					type: 'content',
					contentType: 'tips',
					location,
					content
				};
				if (this.currentActionIndex !== undefined && this.currentActionIndex !== -1) {
					this.massageList.splice(this.currentActionIndex, 0, tipsInfo);
					this.invalidateVirtualScrollCaches();
					this.currentActionIndex = -1;
				} else {
					this.massageList.push(tipsInfo);
				}
				this.updateMsg();
			},
			async getUserInfo(userId) {
				try {
					const res = await getUserInfo(userId)
					this.userInfo = res.data
				} catch (err) {
					console.error('获取用户信息失败:', err);
					uni.showToast({
						title: '获取用户信息失败',
						icon: 'none'
					});
				}
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
			onPhoneSubmit(data) {
				const location = this.isMe ? 1 : 0;
				const phoneInfo = {
					type: "content",
					contentType: "phone",
					location,
					content: data.time
				}
				this.massageList.push(phoneInfo)
				this.updateMsg()
			},
			async addVideo() {
				this.$refs.callTypePopup && this.$refs.callTypePopup.open()
			},
			closeCallTypePopup() {
				this.$refs.callTypePopup && this.$refs.callTypePopup.close()
			},
			// 打开通话状态选择弹窗
			openCallStatusPopup(index) {
				this.currentActionIndex = index;
				this.$refs.callStatusPopup && this.$refs.callStatusPopup.open()
			},
			closeCallStatusPopup() {
				this.$refs.callStatusPopup && this.$refs.callStatusPopup.close()
			},
			// 插入通话状态消息
			onInsertCallStatus(status) {
				this.closeCallStatusPopup();
				const location = status === '已取消' ? 1 : 0; // 我方取消显示在右侧，其他显示在左侧
				const phoneInfo = {
					type: "content",
					contentType: "phone",
					location,
					content: status
				};

				if (this.currentActionIndex !== undefined && this.currentActionIndex !== -1) {
					this.massageList.splice(this.currentActionIndex, 0, phoneInfo);
					this.invalidateVirtualScrollCaches();
					this.currentActionIndex = -1;
				} else {
					this.massageList.push(phoneInfo);
				}
				this.updateMsg();
				this.activeMsgIndex = -1;
			},
			onSelectCallType(type) {
				this.closeCallTypePopup()
				if (type === 'video') {
					this.$refs.videoPopup && this.$refs.videoPopup.open()
					return
				}
				if (type === 'phone') {
					this.$refs.phonePopup && this.$refs.phonePopup.open()
				}
			},

			async onCradSubmitz(data) {
				try {
					// console.log("======",dataavatar)
					// const res = await uploadImage(data.avatar, this.guestInfo.userId)
					
					const temp = data
					// temp.avatar = res.data
					const location = this.isMe ? 1 : 0;
					const transferInfo = {
						type: "content", // tips, content
						contentType: "crad", //order , chat ,link
						location, // 1 表示我方
						content: temp
					};

					this.massageList.push(transferInfo);
					this.updateMsg()
				} catch (err) {
					console.error('上传名片头像失败:', err);
					uni.showToast({
						title: '上传失败，请重试',
						icon: 'none'
					});
				}
			},
			onBgSubmit(data) {
				this.contentbg = data.avatar
			},
			async onPhotoSubmit(data) {
				try {
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
					this.massageList.push(photoInfo);
					this.updateMsg()
				} catch (err) {
					console.error('上传图片失败:', err);
					uni.showToast({
						title: '上传失败，请重试',
						icon: 'none'
					});
				}
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
				if (this.currentActionIndex !== undefined && this.currentActionIndex !== -1) {
					this.massageList.splice(this.currentActionIndex, 0, transferInfo);
					this.invalidateVirtualScrollCaches();
					this.currentActionIndex = -1;
				} else {
					this.massageList.push(transferInfo);
				}
				this.updateMsg()
			},
			async onCradSubmit(data) {
				try {
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

					this.massageList.push(transferInfo);
					this.updateMsg()
				} catch (err) {
					console.error('上传名片头像失败:', err);
					uni.showToast({
						title: '上传失败，请重试',
						icon: 'none'
					});
				}
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
				if (this.currentActionIndex !== undefined && this.currentActionIndex !== -1) {
					this.massageList.splice(this.currentActionIndex, 0, orderInfo);
					this.invalidateVirtualScrollCaches();
					this.currentActionIndex = -1;
				} else {
					this.massageList.push(orderInfo);
				}
				this.updateMsg()
			},
			onTipsSubmit(data) {
				if (data.tipType === 'add_contact') {
					if (this.editMsgIndex !== -1 && this.editMsgIndex < this.massageList.length) {
						this.massageList[this.editMsgIndex].content.friendName = data.friendName || "";
						this.massageList[this.editMsgIndex].content.tipType = 'add_contact';
						this.editMsgIndex = -1;
						this.updateMsg();
						uni.showToast({
							title: '提示已更新',
							icon: 'success'
						});
						return;
					}
					
					const location = this.isMe ? 1 : 0;
					const tipsInfo = {
						type: "content",
						contentType: "tips",
						location,
						content: {
							friendName: data.friendName || "",
							tipType: 'add_contact'
						}
					};
					if (this.currentActionIndex !== undefined && this.currentActionIndex !== -1) {
						this.massageList.splice(this.currentActionIndex, 0, tipsInfo);
						this.invalidateVirtualScrollCaches();
						this.currentActionIndex = -1;
					} else {
						this.massageList.push(tipsInfo);
					}
					this.updateMsg();
					return;
				}
				
				if (this.editMsgIndex !== -1 && this.editMsgIndex < this.massageList.length) {
					this.massageList[this.editMsgIndex].content.gusetName = data.gusetName || "";
					this.massageList[this.editMsgIndex].content.tipType = 'payment';
					this.editMsgIndex = -1;
					this.updateMsg();
					uni.showToast({
						title: '提示已更新',
						icon: 'success'
					});
					return;
				}
				
				// 鏂板妯″紡
				const location = this.isMe ? 1 : 0;
				const tipsInfo = {
					type: "content",
					contentType: "tips",
					location,
					content: {
						gusetName: data.gusetName || "",
						tipType: 'payment'
					}
				};
				if (this.currentActionIndex !== undefined && this.currentActionIndex !== -1) {
					this.massageList.splice(this.currentActionIndex, 0, tipsInfo);
					this.invalidateVirtualScrollCaches();
					this.currentActionIndex = -1;
				} else {
					this.massageList.push(tipsInfo);
				}
				this.updateMsg();
			},
			editTips(index) {
				const tipType = this.massageList[index]?.content?.tipType || 'payment';
				if (tipType !== 'payment' && tipType !== 'add_contact') {
					uni.showToast({
						title: '该提示类型不支持编辑',
						icon: 'none'
					});
					this.activeMsgIndex = -1;
					return;
				}
				this.editMsgIndex = index;
				if (tipType === 'add_contact') {
					this.tipsInfo.friendName = this.massageList[index].content.friendName || "";
					this.tipsInfo.tipType = 'add_contact';
					this.tipsKey = {
						friendName: "好友名称"
					};
				} else {
					this.tipsInfo.gusetName = this.massageList[index].content.gusetName || "";
					this.tipsInfo.tipType = 'payment';
					this.tipsKey = {
						gusetName: "付款人名称"
					};
				}
				this.$refs.tipsPopup.open();
				this.activeMsgIndex = -1;
			},
			onTimeSubmit(data) {
				const timeInfo = {
					type: "tips",
					contentType: "chat",
					content: data.time
				}
				if (this.currentActionIndex !== undefined && this.currentActionIndex !== -1) {
					this.massageList.splice(this.currentActionIndex, 0, timeInfo);
					this.invalidateVirtualScrollCaches();
					this.currentActionIndex = -1;
				} else {
					this.massageList.push(timeInfo);
				}

				this.updateMsg()
			},



			onSwitchChange(e) {
				this.isMe = !this.isMe;
			},

			onLongPressPopupChange(e) {
				const newValue = e.detail.value;
				if (newValue && this.enableLongPressDrag) {
					this.enableLongPressDrag = false;
				}
				
				this.enableLongPressPopup = newValue;
				if (!this.enableLongPressPopup) {
					this.activeMsgIndex = -1;
					this.popupVisible = false;
				}
				uni.showToast({
					title: this.enableLongPressPopup ? '已开启长按弹框' : '已关闭长按弹框',
					icon: 'none',
					duration: 1500
				});
			},
			
			onLongPressDragChange(e) {
				const newValue = e.detail.value;
				if (newValue && this.enableLongPressPopup) {
					this.enableLongPressPopup = false;
					this.activeMsgIndex = -1;
					this.popupVisible = false;
				}
				
				this.enableLongPressDrag = newValue;
				uni.showToast({
					title: this.enableLongPressDrag ? '已开启长按拖拽' : '已关闭长按拖拽',
					icon: 'none',
					duration: 1500
				});
			},
			onSelect(type) {
				// 处理选择事件
				switch (type) {
					case "order":
						this.$refs.orderPopup.open()
						break;
					case "time":
						this.currentActionIndex = -1;
						this.openTimePicker();
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
						this.closePopupMenu();
						this.$refs.tipsTypePopup.open();
						break;
					case "phone":
						this.$refs.phonePopup.open()
						break;
					case "callStatus":
						this.currentActionIndex = -1;
						this.$refs.callStatusPopup.open()
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
						isCop: data.isCop || false // 娣诲姞 isCop 灞炴€?
					}
				};
				if (this.currentActionIndex !== undefined && this.currentActionIndex !== -1) {
					this.massageList.splice(this.currentActionIndex, 0, fileInfo);
					this.invalidateVirtualScrollCaches();
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
				this.addMsgcomm(this.inputValue)
				this.inputValue = '';
				this.scrollToBottom()
			},
			addMsgcomm(inputValue) {
				if (inputValue.trim()) {
					const location = this.isMe ? 1 : 0
					const msgInfo = {
						type: "content",
						contentType: "chat",
						location,
						content: inputValue
					}
					if (this.currentActionIndex !== undefined && this.currentActionIndex !== -1) {
						this.massageList.splice(this.currentActionIndex, 0, msgInfo);
						this.invalidateVirtualScrollCaches();
						this.currentActionIndex = -1;
					} else {
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
				currentMsg.location = currentMsg.location === 1 ? 0 : 1;

				// 更新消息
				this.updateMsg();
				uni.showToast({
					title: currentMsg.location === 1 ? '已切换为自己' : '已切换为客户',
					icon: 'none'
				});

				// 关闭菜单
				this.activeMsgIndex = -1;
				this.popupVisible = false;
			},

			// 消息插入功能 
			addMsg(index) {

				this.currentActionIndex = this.activeMsgIndex;
				this.$refs.msgPopup.open();
				this.activeMsgIndex = -1;
			},

			// 消息编辑功能 
			changeMsg(index) {
				this.editMsgIndex = this.activeMsgIndex;
				this.$refs.editMsgPopup.open(this.massageList[this.editMsgIndex].content);
				this.activeMsgIndex = -1;
			},

			insertTime(index) {
				this.currentActionIndex = index;
				this.openTimePicker();
			},
			openTimePicker() {
				const now = new Date();
				const year = now.getFullYear();
				const month = String(now.getMonth() + 1).padStart(2, '0');
				const day = String(now.getDate()).padStart(2, '0');
				const hour = String(now.getHours()).padStart(2, '0');
				const minute = String(now.getMinutes()).padStart(2, '0');
				this.timePickerDate = `${year}-${month}-${day}`;
				this.timePickerTime = `${hour}:${minute}`;
				this.$refs.timePopup && this.$refs.timePopup.open();
				this.activeMsgIndex = -1;
			},
			closeTimePicker() {
				this.$refs.timePopup && this.$refs.timePopup.close();
			},
			onTimePickerDateChange(e) {
				this.timePickerDate = e.detail.value;
			},
			onTimePickerTimeChange(e) {
				this.timePickerTime = e.detail.value;
			},
			onTimeUse24HourChange(e) {
				this.timeUse24Hour = !!e.detail.value;
			},
			formatDateDisplay(dateStr) {
				if (!dateStr) return '';
				const [year, month, day] = dateStr.split('-');
				if (!year || !month || !day) return dateStr;
				return `${Number(month)}月${Number(day)}日`;
			},
			format24HourTime(hour, minute) {
				if (!Number.isInteger(hour) || !Number.isInteger(minute)) return '';
				if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return '';
				return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
			},
			formatMeridiemTime(hour, minute) {
				if (!Number.isInteger(hour) || !Number.isInteger(minute)) return '';
				if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return '';
				const period = hour < 12 ? '上午' : '下午';
				const hour12 = hour % 12 === 0 ? 12 : hour % 12;
				return `${period} ${hour12}:${String(minute).padStart(2, '0')}`;
			},
			formatTimeByMode(hour, minute) {
				return this.timeUse24Hour ? this.format24HourTime(hour, minute) : this.formatMeridiemTime(hour, minute);
			},
			formatPickerTimeDisplay(timeStr) {
				if (!timeStr) return '';
				const [hour, minute] = timeStr.split(':').map(Number);
				const text = this.formatTimeByMode(hour, minute);
				return text || timeStr;
			},
			formatWeekday(date) {
				if (!(date instanceof Date) || Number.isNaN(date.getTime())) return '';
				const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
				return weekdays[date.getDay()] || '';
			},
			formatSelectedTimeText(dateStr, timeStr) {
				if (!dateStr || !timeStr) return '';
				const [year, month, day] = dateStr.split('-').map(Number);
				const [hour, minute] = timeStr.split(':').map(Number);
				const selected = new Date(year, month - 1, day, hour, minute, 0);
				if (Number.isNaN(selected.getTime())) return '';

				const now = new Date();
				const timeText = this.formatTimeByMode(selected.getHours(), selected.getMinutes());
				if (!timeText) return '';
				const isSameDay = selected.getFullYear() === now.getFullYear() &&
					selected.getMonth() === now.getMonth() &&
					selected.getDate() === now.getDate();
				if (isSameDay) {
					return timeText;
				}

				const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
				const startOfSelectedDay = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
				const dayDiff = Math.floor((startOfToday - startOfSelectedDay) / (24 * 60 * 60 * 1000));
				if (dayDiff === 1) {
					return `昨天 ${timeText}`;
				}
				if (dayDiff >= 2 && dayDiff <= 5) {
					const weekdayText = this.formatWeekday(selected);
					if (weekdayText) {
						return `${weekdayText} ${timeText}`;
					}
				}

				const monthText = selected.getMonth() + 1;
				const dayText = selected.getDate();
				if (selected.getFullYear() === now.getFullYear()) {
					return `${monthText}月${dayText}日 ${timeText}`;
				}
				return `${selected.getFullYear()}年${monthText}月${dayText}日 ${timeText}`;
			},
			confirmTimeSelection() {
				const formatted = this.formatSelectedTimeText(this.timePickerDate, this.timePickerTime);
				if (!formatted) {
					uni.showToast({
						title: '请选择有效时间',
						icon: 'none'
					});
					return;
				}
				this.onTimeSubmit({ time: formatted });
				this.closeTimePicker();
			},
			insertOrder(index) {
				this.currentActionIndex = index;
				this.$refs.orderPopup.open();
			},
			insertTransfer(index) {
				this.currentActionIndex = index;
				this.$refs.transferPopup.open();
			},
			insertRedBag(index) {
				this.currentActionIndex = index;
				const location = this.isMe ? 1 : 0;
				const redBagInfo = {
					type: "content",
					contentType: "redBag",
					location,
					content: true
				};
				
				if (this.currentActionIndex !== undefined && this.currentActionIndex !== -1) {
					this.massageList.splice(this.currentActionIndex, 0, redBagInfo);
					this.invalidateVirtualScrollCaches();
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

			// 消息插入提交 (妯′豢wxChat)
			addMsgSubmit(data) {
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
				if (this.quoteDraft) {
					msgInfo.quote = this.quoteDraft;
				}

				if (this.currentActionIndex !== -1) {
					this.massageList.splice(this.currentActionIndex, 0, msgInfo);
					this.invalidateVirtualScrollCaches();
				} else {
					this.massageList.push(msgInfo);
				}
				this.updateMsg();
				this.quoteDraft = null;
			},

			// 消息编辑提交 (妯′豢wxChat)
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

			// 表情相关鏂规硶
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
				if (this.messageParseCache.has(msg)) {
					return this.messageParseCache.get(msg);
				}

				const result = [];
				// 浼樺厛绾э細琛ㄦ儏 > URL > 閭 > 鏁板瓧
				const combinedRegex = /(\[emoji_(\d+)\])|(https?:\/\/[^\s]+|ftp:\/\/[^\s]+|www\.[^\s]+)|([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})|(\d{7,})/g;

				let lastIndex = 0;
				let match;

				while ((match = combinedRegex.exec(msg)) !== null) {
					// 添加匹配之前的文本
					if (match.index > lastIndex) {
						const textBefore = msg.substring(lastIndex, match.index);
						if (textBefore) {
							this.parseTextForEmailAndNumber(textBefore, result);
						}
					}
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

				// 添加剩余文本
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
				if (this.messageParseCache.size > 100) {
					const firstKey = this.messageParseCache.keys().next().value;
					this.messageParseCache.delete(firstKey);
				}
				this.messageParseCache.set(msg, result);

				return result;
			},
			parseTextForEmailAndNumber(text, result) {
				if (!text) return;

				const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
				const numberRegex = /\d{7,}/g;
				const matches = [];
				let match;
				emailRegex.lastIndex = 0; // 重置正则
				while ((match = emailRegex.exec(text)) !== null) {
					matches.push({
						type: 'email',
						content: match[0],
						index: match.index,
						length: match[0].length
					});
				}
				numberRegex.lastIndex = 0; // 重置正则
				while ((match = numberRegex.exec(text)) !== null) {
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

					// 添加匹配内容
					result.push({
						type: current.type,
						content: current.content
					});

					lastIndex = current.index + current.length;
				}
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
			getContentTypeLabel(item) {
				const map = {
					tips: '提示',
					order: '订单',
					transfer: '转账',
					photo: '图片',
					redBag: '红包',
					file: '文件',
					yuyin: '语音',
					crad: '名片',
					video: '视频'
				};
				return map[item.contentType] || '未知消息';
			},

			getItemStyle(index) {
				if (!this.isDragging) return {};
				if (index === this.dragStartIndex) {
					return { opacity: 0, visibility: 'hidden' };
				}
				
				const style = {
					transition: 'transform 0.2s ease'
				};
				// 向下拖拽：dragStartIndex < placeholderIndex
				// index 鍦?(dragStartIndex, placeholderIndex] 涔嬮棿 -> 涓婄Щ
				if (this.dragStartIndex < this.placeholderIndex) {
					if (index > this.dragStartIndex && index <= this.placeholderIndex) {
						style.transform = `translateY(-${this.dragItemHeight}px)`;
					}
				}
				// 向上拖拽：dragStartIndex > placeholderIndex
				// index 鍦?[placeholderIndex, dragStartIndex) 涔嬮棿 -> 涓嬬Щ
				else if (this.dragStartIndex > this.placeholderIndex) {
					if (index >= this.placeholderIndex && index < this.dragStartIndex) {
						style.transform = `translateY(${this.dragItemHeight}px)`;
					}
				}
				
				return style;
			},

			exitSortingMode() {
				this.isSortingMode = false;
				this.originalMessageList = []; // 娓呯┖备份
				this.resetDragState();
			},
			
			restoreDefaultSort() {
				if (this.originalMessageList.length > 0) {
					this.massageList = JSON.parse(JSON.stringify(this.originalMessageList));
					this.invalidateVirtualScrollCaches();
					this.updateMsg();
					uni.showToast({
						title: '已恢复默认',
						icon: 'none'
					});
					this.resetDragState();
					
					// 重新测量位置
					this.$nextTick(() => {
						const query = uni.createSelectorQuery().in(this);
						query.selectAll('.msg-item-wrapper').boundingClientRect((rects) => {
							if (rects && rects.length > 0) {
								this.cachedItemRects = rects;
								this.wxsDragData = {
									...this.wxsDragData,
									rects: rects
								};
							}
						}).exec();
					});
				}
			},
			
			// WXS 调用：处理自动滚动
			handleWxsAutoScroll(data) {
				const { touchY } = data;
				this.checkAutoScroll(touchY);
			},

			onMsgLongPress(e, index) {
				if (!this.enableLongPressDrag) {
					this.showPopupMenu(e, index);
					return;
				}

				// 如果正在拖拽，先强制结束当前拖拽
				if (this.isDragging) {
					const oldDragStartIndex = this.dragStartIndex;
					if (this.dragStartIndex !== this.placeholderIndex && this.placeholderIndex !== -1 && this.dragStartIndex !== -1) {
						this.moveMessage(this.dragStartIndex, this.placeholderIndex);
					}
					
					// 强制结束当前拖拽
					this.forceEndDrag();
					if (oldDragStartIndex === index) {
						return;
					}
					this.$nextTick(() => {
						this.touchStartTime = Date.now();
						if (e.touches && e.touches[0]) {
							this.dragStartY = e.touches[0].clientY;
						}
						if (this.isSortingMode) {
							this.startNewDrag(e, index);
						} else {
							this.enterSortingMode(e, index);
						}
					});
					return;
				}
				if (!this.isDragging) {
					this.touchStartTime = Date.now();
					if (e.touches && e.touches[0]) {
						this.dragStartY = e.touches[0].clientY;
					}
					this.enterSortingMode(e, index);
				}
			},
			
			// WXS 回调: 震动
			wxsVibrate() {
				try { uni.vibrateShort({ type: 'light' }); } catch(e) {}
			},
			
			// WXS 鍥炶皟: 拖拽结束
			onWxsDragEnd(data) {
				const { from, to } = data;
				if (from !== to && to !== -1 && from !== -1) {
					this.moveMessage(from, to);
				}
				this.isDragging = false;
				this.draggingItem = null;
				this.dragStartIndex = -1;
				this.placeholderIndex = -1;
				if (this.autoScrollTimer) {
					clearInterval(this.autoScrollTimer);
					this.autoScrollTimer = null;
				}
				this.wxsDragData = {
					...this.wxsDragData,
					isDragging: false,
					dragStartIndex: -1
				};
				// 这很重要，因为列表顺序可能已经改变
				if (this.isSortingMode) {
					this.$nextTick(() => {
						// 使用 requestAnimationFrame 优化性能，减少延迟
						if (typeof requestAnimationFrame !== 'undefined') {
							requestAnimationFrame(() => {
								this.updateItemRects();
							});
						} else {
							setTimeout(() => {
								this.updateItemRects();
							}, 16); // 约一帧的时间
						}
					});
				}
			},
			updateItemRects() {
				const query = uni.createSelectorQuery().in(this);
				query.select('.chat-body').boundingClientRect(containerRect => {
					const itemQuery = uni.createSelectorQuery().in(this);
					itemQuery.selectAll('.msg-item-wrapper').boundingClientRect((rects) => {
						if (rects && rects.length > 0) {
							this.cachedItemRects = rects;
							this.wxsDragData = {
								...this.wxsDragData,
								rects: rects,
								containerTop: containerRect ? containerRect.top : 0
							};
						}
					}).exec();
				}).exec();
			},
			startDrag(index) {
				if (!this.isSortingMode) return;
				if (this.isDragging) return;
				
				this.startNewDrag(null, index);
			},
			startNewDrag(e, index) {
				if (this.isDragging) return;
				
				this.dragStartIndex = index;
				this.placeholderIndex = index;
				this.isDragging = true;
				this.draggingItem = this.massageList[index];
				
				if (this.draggingItem.contentType === 'chat') {
					this.draggingItemParsedContent = this.parseMessage(this.draggingItem.content);
				} else {
					this.draggingItemParsedContent = [];
				}
				
				try { uni.vibrateShort({ type: 'light' }); } catch (e) {}
				this.initialScrollTop = this.scrollPosition;
				if (this.cachedItemRects && this.cachedItemRects.length > 0) {
					// 立即更新 WXS 数据，使用缓存的 rects
					const query = uni.createSelectorQuery().in(this);
					query.select('.chat-body').boundingClientRect(containerRect => {
						this.wxsDragData = {
							isDragging: true,
							dragStartIndex: index,
							rects: this.cachedItemRects,
							initialScrollTop: this.initialScrollTop,
							containerTop: containerRect ? containerRect.top : 0,
							scrollTop: this.scrollPosition
						};
						
						// 获取当前项的高度
						const relativeIndex = this.visibleMessageList.findIndex(item => item.index === index);
						if (relativeIndex !== -1 && this.cachedItemRects[relativeIndex]) {
							const rect = this.cachedItemRects[relativeIndex];
							this.dragItemHeight = rect.height;
							this.dragY = rect.top; 
						}
					}).exec();
				}
				const query = uni.createSelectorQuery().in(this);
				query.select('.chat-body').boundingClientRect(containerRect => {
					const itemQuery = uni.createSelectorQuery().in(this);
					itemQuery.selectAll('.msg-item-wrapper').boundingClientRect((rects) => {
						if (rects && rects.length > 0) {
							this.cachedItemRects = rects;
							
							// 更新 WXS 数据（使用最新测量的 rects）
							this.wxsDragData = {
								isDragging: true,
								dragStartIndex: index,
								rects: rects,
								initialScrollTop: this.initialScrollTop,
								containerTop: containerRect ? containerRect.top : 0,
								scrollTop: this.scrollPosition
							};
							
							// 获取当前项的高度
							const relativeIndex = this.visibleMessageList.findIndex(item => item.index === index);
							if (relativeIndex !== -1 && rects[relativeIndex]) {
								const rect = rects[relativeIndex];
								this.dragItemHeight = rect.height;
								this.dragY = rect.top; 
							}
						}
					}).exec();
				}).exec();
			},

			enterSortingMode(e, index) {
				if (this.isDragging) return;
				
				this.isSortingMode = true;
				if (this.originalMessageList.length === 0) {
					this.originalMessageList = JSON.parse(JSON.stringify(this.massageList));
				}
				
				this.dragStartIndex = index;
				this.placeholderIndex = index;
				this.isDragging = true;
				this.draggingItem = this.massageList[index];
				if (this.draggingItem.contentType === 'chat') {
					this.draggingItemParsedContent = this.parseMessage(this.draggingItem.content);
				} else {
					this.draggingItemParsedContent = [];
				}
				
				// 震动反馈
				try { uni.vibrateShort(); } catch (e) {}
				this.initialScrollTop = this.scrollPosition;
				const query = uni.createSelectorQuery().in(this);
				// 获取容器位置
				query.select('.chat-body').boundingClientRect(containerRect => {
					const itemQuery = uni.createSelectorQuery().in(this);
					itemQuery.selectAll('.msg-item-wrapper').boundingClientRect((rects) => {
						if (rects && rects.length > 0) {
							this.cachedItemRects = rects;
							this.wxsDragData = {
								isDragging: true,
								dragStartIndex: index,
								rects: rects,
								initialScrollTop: this.initialScrollTop,
								containerTop: containerRect ? containerRect.top : 0
							};
							const relativeIndex = this.visibleMessageList.findIndex(item => item.index === index);
							if (relativeIndex !== -1 && rects[relativeIndex]) {
								const rect = rects[relativeIndex];
								this.dragItemHeight = rect.height;
								this.dragY = rect.top; 
							}
						}
					}).exec();
				}).exec();
			},
			
			// 废弃 Vue 层的 Touch 方法，改用 WXS
			onMsgTouchStart(e, index) {},
			onMsgTouchMove(e, index) {},
			onMsgTouchEnd(e, index) {},
			
			checkAutoScroll(touchY) {
				const systemInfo = uni.getSystemInfoSync();
				const windowHeight = systemInfo.windowHeight;
				const threshold = 60;
				const maxSpeed = 10;
				
				if (this.autoScrollTimer) {
					clearInterval(this.autoScrollTimer);
					this.autoScrollTimer = null;
				}
				
				let step = 0;
				if (touchY < threshold + 80) { // 顶部区域 (+80 考虑导航栏)
					// 向上滚动
					const dist = Math.max(0, (threshold + 80) - touchY);
					step = -Math.ceil((dist / threshold) * maxSpeed);
				} else if (touchY > windowHeight - threshold) {
					// 向下滚动
					const dist = Math.max(0, touchY - (windowHeight - threshold));
					step = Math.ceil((dist / threshold) * maxSpeed);
				}
				
				if (step !== 0) {
					this.autoScrollTimer = setInterval(() => {
						this.scrollTop += step;
						this.scrollPosition = this.scrollTop;
					}, 16);
				}
			},
			
			updatePlaceholderIndex(touchY) {
				if (!this.cachedItemRects || this.cachedItemRects.length === 0) return;
				
				// 计算滚动偏差
				const scrollDelta = this.scrollPosition - this.initialScrollTop;
				
				// 遍历 rects 寻找命中项
				// 当前每个 item 的视觉位置 = rect.top - scrollDelta + (visualShift)
				// visualShift 取决于 item 是否在 dragStartIndex 和 placeholderIndex 之间
				
				let newPlaceholder = this.dragStartIndex;
				
				for (let i = 0; i < this.cachedItemRects.length; i++) {
					const rect = this.cachedItemRects[i];
					// 修正为当前视口位置
					const currentTop = rect.top - scrollDelta;
					const center = currentTop + rect.height / 2;
					if (touchY > currentTop && touchY < currentTop + rect.height) {
						// 更精确的逻辑
						// 如果当前 placeholder 在 i 之前，且 touchY > center -> placeholder 移到 i 之后
						// 如果当前 placeholder 在 i 之后，且 touchY < center -> placeholder 移到 i 之前
					}
				}
				let minDistance = Infinity;
				let targetIndex = -1;
				
				for (let i = 0; i < this.cachedItemRects.length; i++) {
					const rect = this.cachedItemRects[i];
					const currentTop = rect.top - scrollDelta;
					const center = currentTop + rect.height / 2;
					
					const dist = Math.abs(touchY - center);
					if (dist < minDistance) {
						minDistance = dist;
						// 假设 rects 顺序对应 visibleMessageList
						if (this.visibleMessageList[i]) {
							targetIndex = this.visibleMessageList[i].index;
						}
					}
				}
				
				if (targetIndex !== -1 && targetIndex !== this.placeholderIndex) {
					// 触发触感反馈
					if (this.placeholderIndex !== -1) {
						try { uni.vibrateShort({ type: 'light' }); } catch(e) {}
					}
					this.placeholderIndex = targetIndex;
				}
			},
			
			onMsgTouchEnd(e, index) {
				if (this.longPressTimer) {
					clearTimeout(this.longPressTimer);
					this.longPressTimer = null;
				}
				if (this.autoScrollTimer) {
					clearInterval(this.autoScrollTimer);
					this.autoScrollTimer = null;
				}
				
				if (!this.isDragging) return;
				
				// 提交移动
				if (this.dragStartIndex !== this.placeholderIndex && this.placeholderIndex !== -1) {
					this.moveMessage(this.dragStartIndex, this.placeholderIndex);
				}
				this.isDragging = false;
				this.draggingItem = null;
				this.dragStartIndex = -1;
				this.placeholderIndex = -1;
				this.cachedItemRects = [];
			},
			
			resetDragState() {
				this.dragStartIndex = -1;
				this.placeholderIndex = -1;
				this.isDragging = false;
				this.draggingItem = null;
				this.cachedItemRects = [];
				if (this.autoScrollTimer) {
					clearInterval(this.autoScrollTimer);
					this.autoScrollTimer = null;
				}
			},
			
			// 强制结束拖拽（立即清理所有状态）
			forceEndDrag() {
				this.isDragging = false;
				this.draggingItem = null;
				this.dragStartIndex = -1;
				this.placeholderIndex = -1;
				this.wxsDragData = {
					...this.wxsDragData,
					isDragging: false,
					dragStartIndex: -1
				};
				if (this.autoScrollTimer) {
					clearInterval(this.autoScrollTimer);
					this.autoScrollTimer = null;
				}
			},
			
			// 移动消息位置
			moveMessage(fromIndex, toIndex) {
				if (fromIndex === toIndex) return;
				
				const newList = [...this.massageList];
				const [item] = newList.splice(fromIndex, 1);
				newList.splice(toIndex, 0, item);
				
				this.massageList = newList;
				this.invalidateVirtualScrollCaches();
				this.updateMsg();
				
				uni.showToast({
					title: '排序完成',
					icon: 'none'
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
	.msgConut {
		/* width: 56rpx;
		height: 44rpx; */
		display: flex;
		align-items: center;
		justify-content: center;
		/* margin-left: 8rpx; */
	}
	.msgView{
		background-color: #d6d7dc;
		color: #000;
		border-radius: 30rpx;
		/* width: 50rpx; */
		padding: 2rpx 10rpx;
		height: 45rpx;
		min-width: 45rpx;
		font-weight: 500;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		overflow: hidden;
	}
	.msgView.more_red {
		/* min-width: 50rpx; */
		/* border-radius: 20rpx; */
	}
	.msgView_hidden {
		visibility: hidden;
	}
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
	
	.calltype-sheet {
		background-color: #fff;
		border-top-left-radius: 24rpx;
		border-top-right-radius: 24rpx;
		overflow: hidden;
		padding-bottom: env(safe-area-inset-bottom);
	}
	
	.calltype-item {
		padding: 28rpx 32rpx;
		font-size: 30rpx;
		color: #111827;
		text-align: center;
		border-bottom: 1rpx solid #f0f0f0;
	}
	
	.calltype-cancel {
		padding: 28rpx 32rpx;
		font-size: 30rpx;
		color: #6b7280;
		text-align: center;
		background-color: #f7f7f7;
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

	.cardRight::after,
	.cardLeft::after,
	.cardLeft_f::after,
	.tfCardLeftBg::after,
	.tfCardLeft::after,
	.redbagLeftBg::after,
	.redbagLeft::after,
	.tfCardRightBg::after,
	.tfCardRight::after,
	.redbagRightBg::after,
	.redbagRight::after,
	
	.file-card-left::after,
	.file-card-right::after {
		content: "";
		position: absolute;
		top:20upx;
		width: 0;
		height: 0;
		border-top: 12px solid transparent;
		border-bottom: 12px solid transparent;
	}
	
	.msg.right .bubble::after,
	.msg.left .bubble::after{
		content: "";
		position: absolute;
		top: calc(18upx * var(--font-scale, 1));
		width: 0;
		height: 0;
		border-top: 12px solid transparent;
		border-bottom: 12px solid transparent;
	}
	.cardLeft::after,
	.cardLeft_f::after,
	.tfCardLeftBg::after,
	.tfCardLeft::after,
	.redbagLeftBg::after,
	.redbagLeft::after,
	.msg.left .bubble::after,
	.file-card-left::after {
		left: -11upx;
		border-right: 12px solid #fff;
	}

	.cardRight::after,
	.tfCardRightBg::after,
	.tfCardRight::after,
	.redbagRightBg::after,
	.redbagRight::after,
	.msg.right .bubble::after,
	.file-card-right::after {
		right: -11upx;
		border-left: 12px solid #fff;
	}

	.cardLeft_f::after {
		left: -11px;
	}

	.tfCardLeftBg::after {
		border-right-color: #fce1c3;
	}

	.tfCardLeft::after {
		border-right-color: #f99d3b;
	}

	.redbagLeftBg::after {
		border-right-color: #f69e94;
	}

	.redbagLeft::after {
		border-right-color: #ff624f;
	}

	.tfCardRightBg::after {
		border-left-color: #fce1c3;
	}

	.tfCardRight::after {
		border-left-color: #f99d3b;
	}

	.redbagRightBg::after {
		border-left-color: #f69e94;
	}

	.redbagRight::after {
		border-left-color: #ff624f;
	}

	.msg.right .bubble::after {
		border-left-color: #CDE5FD;
	}

	.file-card-left::after {
		border-right-color: #fff;
	}

	.file-card-right::after {
		border-left-color: #fff;
	}

	.redbagLeftBg,
	.redbagLeft,
	.tfCardLeftBg,
	.tfCardLeft,
	.cardLeft {
		margin-left: 14upx;
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
		/* */
	}

	/* 美化后的弹出菜单 */
	.popup-menu {
		pointer-events: auto;
		/* 鑿滃崟鍙偣鍑?*/
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

	/* */
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

	/* 鑱婂ぉ鍐呭 */
	.chat-body {
		flex: 1;
		padding: 0 20upx;
		/* */
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
		padding: 0 30rpx;
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
		/* 璁╅暱涓插瓧绗︽崲琛?*/
		/* */
		overflow-wrap: anywhere;
		/* */
		white-space: pre-wrap;
		/* 淇濈暀绌虹櫧骞跺厑璁告崲琛?*/
	}

	.msg-text {
		word-break: break-all;
		overflow-wrap: anywhere;
		white-space: pre-wrap;
		color: #333;
		/* */
	}

	.msg-url {
		word-break: break-all;
		overflow-wrap: anywhere;
		white-space: pre-wrap;
		color: #007AFF;
		/* 缃戠粶鍦板潃鏄剧ず钃濊壊 */
	}

	.msg-email {
		word-break: break-all;
		overflow-wrap: anywhere;
		white-space: pre-wrap;
		color: #3175d8;
		/* 閭鏄剧ず钃濊壊 */
	}

	.msg-number {
		word-break: break-all;
		overflow-wrap: anywhere;
		white-space: pre-wrap;
		color: #3175d8;
		/* */
	}

	.msg.right .bubble {
		background-color: #CDE5FD;
		margin-right: 14upx;
	}

	.msg.left .bubble {
		margin-left: 14upx;
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
		/* 闃叉鏀剁缉 */
		/* max-height: calc(100vh - 80upx); */
		padding-bottom: env(safe-area-inset-bottom);
		/* 闃叉鍐呭琚尅锛屼絾鑳屾櫙鐓ф牱閾哄埌搴?*/
		/* 鍑忓幓 nav-bar 鐨勯珮搴?*/
		background-color: #f5f5f5;
	}
	
	.quote-draft {
		position: relative;
		margin: 10upx 20upx 0;
	}
	
	.quote-draft .quote-preview {
		margin-bottom: 0;
	}
	
	.quote-draft__close {
		position: absolute;
		right: 6upx;
		top: 6upx;
		padding: 8upx;
	}
	
	.bubble-stack {
		display: flex;
		flex-direction: column;
	}

	/* 杈撳叆妗?*/
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

	.input-box {
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
		/* 娣诲姞杩囨浮鏁堟灉 */
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

	

	.file-card-right {
		margin-right: 14upx;
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

	.wxs-bridge {
		position: fixed;
		width: 0;
		height: 0;
		opacity: 0;
		pointer-events: none;
	}

	/* 拖拽相关样式 */
	.msg-item-wrapper {
		position: relative;
		transition: transform 0.2s ease, opacity 0.2s ease;
		will-change: transform; /* */
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
	
	/* 排序模式相关样式 */
	.sorting-tip-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 100upx;
		background: rgba(0, 0, 0, 0.85);
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 30upx;
		z-index: 10000;
		padding-bottom: env(safe-area-inset-bottom);
		font-size: 28upx;
		backdrop-filter: blur(10px);
	}
	
	.sort-actions {
		display: flex;
		gap: 20upx;
	}
	
	.action-btn {
		padding: 10upx 20upx;
		background: rgba(255,255,255,0.2);
		border-radius: 8upx;
		font-size: 24upx;
	}
	
	.sort-tip {
		font-size: 24upx;
		color: #ccc;
	}
	
	.finish-btn {
		background: #007aff;
		padding: 10upx 30upx;
		border-radius: 30upx;
		font-size: 26upx;
		font-weight: 500;
	}
	
	.floating-msg-item {
		position: fixed;
		left: 20upx; /* */
		right: 20upx;
		z-index: 9999;
		pointer-events: none;
		transform: scale(1.05) translateZ(0); /* */
		opacity: 0.95; 
		will-change: top, transform;
		/* box-shadow: 0 10upx 40upx rgba(0,0,0,0.3); */
		filter: drop-shadow(0 10upx 20upx rgba(0,0,0,0.25));
		/* border-radius: 16upx; */
	}
	
	/* 拖拽把手样式 */
	.drag-handle {
		position: absolute;
		right: 0;
		top: 0;
		bottom: 0;
		width: 80upx;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1001; /* 姣斿唴瀹归珮 */
		background: rgba(255, 255, 255, 0.5); /* */
		backdrop-filter: blur(2px);
	}
	
	.handle-icon {
		font-size: 40upx;
		color: #999;
		font-weight: bold;
	}

	.time-select-popup {
		width: 640rpx;
		background: #fff;
		border-radius: 20rpx;
		overflow: hidden;
	}

	.time-select-title {
		text-align: center;
		font-size: 32rpx;
		font-weight: 600;
		padding: 30rpx 24rpx 20rpx;
		color: #333;
	}

	.time-select-body {
		padding: 0 24rpx 12rpx;
	}

	.time-select-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 88rpx;
		padding: 0 16rpx;
		border: 1rpx solid #ececec;
		border-radius: 14rpx;
		margin-bottom: 16rpx;
	}

	.time-select-label {
		font-size: 28rpx;
		color: #666;
	}

	.time-select-value {
		font-size: 28rpx;
		color: #333;
	}

	.time-select-footer {
		display: flex;
		padding: 20rpx 24rpx 24rpx;
		gap: 16rpx;
	}

	.time-select-btn {
		flex: 1;
		height: 82rpx;
		line-height: 82rpx;
		font-size: 30rpx;
		border-radius: 14rpx;
	}

	.time-select-cancel {
		background: #f2f2f2;
		color: #666;
	}

	.time-select-confirm {
		background: #007aff;
		color: #fff;
	}
	
	.msg-item-wrapper.sorting-mode {
		padding-right: 60upx; /* 给把手留位置 */
	}
	
	/* */
	.floating-msg-item .cell {
		width: 100%;
	}
	
	/* */
	
	.msg-item-wrapper.dragging-placeholder {
		/* */
		opacity: 0;
	}
</style>

