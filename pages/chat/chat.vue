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
				<!-- 排序模式提示条 -->
				<view v-if="isSortingMode" class="sorting-tip-bar">
					<view class="sort-actions">
						<view class="action-btn" @click="restoreDefaultSort">恢复默认</view>
						<!-- <view class="action-btn" @click="undoSort">撤销</view> -->
					</view>
					<text class="sort-tip">按住把手拖动</text>
					<view class="finish-btn" @click="exitSortingMode">完成</view>
				</view>
				
				<!-- 拖拽时的浮动项 (副本) -->
				<view v-if="isDragging && draggingItem" class="floating-msg-item" :style="{ top: dragY + 'px', height: dragItemHeight + 'px' }">
					<!-- 直接复用各类消息的展示结构 -->
					<!-- 时间 -->
					<view v-if="draggingItem.type == 'tips'" class="msg-time cell">
						{{draggingItem.content}}
					</view>
					
					<!-- tips提示 -->
					<view v-else-if="draggingItem.contentType == 'tips'" class="msg-tips cell">
						<view class="tips-content">
							你收到了{{draggingItem.content.gusetName}}的付款<text class="blueTxt"> 查看</text>
						</view>
					</view>
					
					<view class="orderBox cell" v-else-if="draggingItem.contentType == 'order'">
						<view class="msg right">
							<image class="avatar" mode="aspectFill" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<view>
								<ExternalPayCard :orderInfo="draggingItem.content" :fontScale="Number(scale) || 1" />
							</view>
						</view>
					</view>
					
					<!-- 转账 -->
					<view v-else-if="draggingItem.contentType == 'transfer'" class="cell">
						<view class="msg left" v-if="draggingItem.location == 0">
							<view class="avatar">
								<image mode="aspectFill" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<TransferCard :class="!draggingItem.content.st?'tfCardLeft':'tfCardLeftBg'" :state="draggingItem.content.st"
								:fontScale="Number(scale) || 1"
								:name="draggingItem.content.name" :amount="draggingItem.content.amount"></TransferCard>
						</view>
						<view class="msg right" v-else>
							<image class="avatar" mode="aspectFill" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<TransferCard :class="!draggingItem.content.st?'tfCardRight':'tfCardRightBg'"
								:fontScale="Number(scale) || 1"
								:state="draggingItem.content.st" :name="draggingItem.content.name" :amount="draggingItem.content.amount">
							</TransferCard>
						</view>
					</view>
					
					<!-- 收款 -->
					<view v-else-if="draggingItem.contentType == 'wxtf'" class="cell">
						<view class="msg left" v-if="draggingItem.location == 0">
							<view class="avatar">
								<image mode="aspectFill" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<ChTf class="tfCardLeftBg" :fontScale="Number(scale) || 1" :name="draggingItem.content.name" :amount="draggingItem.content.amount"></ChTf>
						</view>
						<view class="msg right" v-else>
							<image class="avatar" mode="aspectFill" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<ChTf class="tfCardRightBg" :fontScale="Number(scale) || 1" :name="draggingItem.content.name" :amount="draggingItem.content.amount"></ChTf>
						</view>
					</view>
					
					<!-- 图片photo -->
					<view v-else-if="draggingItem.contentType == 'photo'" class="cell">
						<view class="msg left" v-if="draggingItem.location == 0">
							<view class="avatar">
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
							<view class="avatar">
								<image mode="aspectFill" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<RedBag :class="draggingItem.content?'redbagLeft':'redbagLeftBg'" :fontScale="Number(scale) || 1" :location="draggingItem.location"
								:name="guestInfo.name  + (guestInfo.description||'')" :state="draggingItem.content"></RedBag>
						</view>
						<view class="msg right" v-else>
							<image class="avatar" mode="aspectFill" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<RedBag :class="draggingItem.content?'redbagRight':'redbagRightBg'" :fontScale="Number(scale) || 1" :location="draggingItem.location"
								:name="guestInfo.name + (guestInfo.description||'')" :state="draggingItem.content"></RedBag>
						</view>
					</view>
					
					<!-- 文件 -->
					<view v-else-if="draggingItem.contentType == 'file'" class="cell">
						<view class="msg left" v-if="draggingItem.location == 0">
							<view class="avatar">
								<image mode="widthFix" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<chatFlie class="cardLeft" :fontScale="Number(scale) || 1" :content="draggingItem.content">
							</chatFlie>
						</view>
						<view class="msg right" v-else>
							<image class="avatar" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<chatFlie class="cardRight" :fontScale="Number(scale) || 1" :content="draggingItem.content">
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
							<view class="avatar">
								<image mode="widthFix" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<WxCard class="cardLeft" :fontScale="Number(scale) || 1" :nickname="draggingItem.content.nickname" :avatar="draggingItem.content.avatar">
							</WxCard>
						</view>
						<view class="msg right" v-else>
								<image class="avatar" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<WxCard class="cardRight" :fontScale="Number(scale) || 1" :nickname="draggingItem.content.nickname" :avatar="draggingItem.content.avatar">
							</WxCard>
						</view>
					</view>
					
					<!-- 聊天 -->
					<view v-else-if="draggingItem.contentType == 'chat'" class="cell">
						<view class="msg left" v-if="draggingItem.location == 0">
							<view class="avatar">
								<image mode="aspectFill" :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<view class="bubble" :style="{ fontSize: rpx(34) }">
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
						<view class="msg right" v-else>
							<image class="avatar" mode="aspectFill" :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<view class="bubble" :style="{ fontSize: rpx(34) }">
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
					
					<!-- 视频电话 -->
					<view v-else-if="draggingItem.contentType == 'video'" class="cell">
						<view class="msg left" v-if="draggingItem.location == 0">
							<view class="avatar">
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
					<!-- tips提示 -->
					<view @longpress="showPopupMenu($event, msgData.index)" :style="{ fontSize: rpx(24) }"
						v-else-if="msgData.item.contentType == 'tips'" class="msg-tips cell">
						<view class="tips-content">
							你收到了{{msgData.item.content.gusetName}}的付款<text class="blueTxt"> 查看</text>
						</view>
					</view>
					<view class="orderBox cell" @longpress="showPopupMenu($event, msgData.index)"
						v-else-if="msgData.item.contentType == 'order'">
						<view class="msg right">
							<image class="avatar" mode="aspectFill" lazy-load
								:src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<view>
								<ExternalPayCard :orderInfo="msgData.item.content" :fontScale="Number(scale) || 1" />
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
							<view class="avatar">
								<image mode="aspectFill" lazy-load :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<TransferCard :class="!msgData.item.content.st?'tfCardLeft':'tfCardLeftBg'" :state="msgData.item.content.st"
								:fontScale="Number(scale) || 1"
								:name="msgData.item.content.name" :amount="msgData.item.content.amount"></TransferCard>
						</view>
						<view class="msg right" @longpress="showPopupMenu($event, msgData.index)" @click="goReceipt(msgData.item)" v-else>
							<image class="avatar" mode="aspectFill" lazy-load
								:src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<TransferCard :class="!msgData.item.content.st?'tfCardRight':'tfCardRightBg'"
								:fontScale="Number(scale) || 1"
								:state="msgData.item.content.st" :name="msgData.item.content.name" :amount="msgData.item.content.amount">
							</TransferCard>

						</view>
					</view>
					<!-- 收款 -->
					<view v-else-if="msgData.item.contentType == 'wxtf'" @longpress="showPopupMenu($event, msgData.index)" class="cell">
						<view class="msg left" @longpress="showPopupMenu($event, msgData.index)" @click="goCollection(msgData.item)"
							v-if="msgData.item.location == 0">
							<view class="avatar">
								<image mode="aspectFill" lazy-load :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<ChTf class="tfCardLeftBg" :fontScale="Number(scale) || 1" :name="msgData.item.content.name" :amount="msgData.item.content.amount"></ChTf>
						</view>
						<view class="msg right" @longpress="showPopupMenu($event, msgData.index)" @click="goCollection(msgData.item)"
							v-else>

							<image class="avatar" mode="aspectFill" lazy-load
								:src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<ChTf class="tfCardRightBg" :fontScale="Number(scale) || 1" :name="msgData.item.content.name" :amount="msgData.item.content.amount"></ChTf>
						</view>
					</view>
					<!-- 图片photo -->

					<view v-else-if="msgData.item.contentType == 'photo'" @longpress="showPopupMenu($event, msgData.index)" class="cell">
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
						<view class="msg left" @longpress="showPopupMenu($event, msgData.index)" v-if="msgData.item.location == 0">
							<view class="avatar">
								<image mode="aspectFill" lazy-load :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<RedBag :class="msgData.item.content?'redbagLeft':'redbagLeftBg'" :fontScale="Number(scale) || 1" :location="msgData.item.location"
								:name="guestInfo.name  + (guestInfo.description||'')" :state="msgData.item.content"></RedBag>

						</view>
						<view class="msg right" @longpress="showPopupMenu($event, msgData.index)" v-else>

							<image class="avatar" mode="aspectFill" lazy-load
								:src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<RedBag :class="msgData.item.content?'redbagRight':'redbagRightBg'" :fontScale="Number(scale) || 1" :location="msgData.item.location"
								:name="guestInfo.name + (guestInfo.description||'')" :state="msgData.item.content"></RedBag>

						</view>
					</view>
					<!-- 文件 -->
					<view v-else-if="msgData.item.contentType == 'file'" @longpress="showPopupMenu($event, msgData.index)" class="cell">

						<view class="msg left" @longpress="showPopupMenu($event, msgData.index)" v-if="msgData.item.location == 0">
							<view class="avatar">
								<image mode="widthFix" lazy-load :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<chatFlie class="cardLeft" :fontScale="Number(scale) || 1" :content="msgData.item.content">
							</chatFlie>
						</view>
						<view class="msg right" @longpress="showPopupMenu($event, msgData.index)" v-else>
							<image class="avatar" lazy-load :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<chatFlie class="cardRight" :fontScale="Number(scale) || 1" :content="msgData.item.content">
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
							<view class="avatar">
								<image mode="widthFix" lazy-load :src="guestInfo.avatarUrl || '/static/avatar-other.png'" />
							</view>
							<WxCard class="cardLeft" :fontScale="Number(scale) || 1" :nickname="msgData.item.content.nickname" :avatar="msgData.item.content.avatar">
							</WxCard>
						</view>
						<view class="msg right" @longpress="showPopupMenu($event, msgData.index)" v-else>
							<image class="avatar" mode="widthFix" lazy-load
								:src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" />
							<WxCard class="cardRight" :fontScale="Number(scale) || 1" :nickname="msgData.item.content.nickname" :avatar="msgData.item.content.avatar">
							</WxCard>
						</view>
					</view>
					<!-- l、聊天 -->
					<view v-else-if="msgData.item.contentType == 'chat'" @longpress="showPopupMenu($event, msgData.index)" class="cell">
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
		<!-- 全局长按菜单 -->
		<MessagePopupMenu
			:visible="activeMsgIndex !== -1"
			:styleObject="popupStyle"
			:actions="currentMenuActions"
			:messageIndex="activeMsgIndex"
			@action="handleMenuAction"
		/>
		<uni-popup ref="menuPopup" background-color="#fff">
			<view class="menu" :style="{ paddingTop: statusBarHeight + 'px' }">
				<button type="primary" plain="true" @click="openBgPopup">修改背景</button>
				<!-- 滑块组件 -->
				<view class="fontChange">
					<view class="">
						字体调节
					</view>
					<slider :value="scale" :min="0.7" :max="1.5" :step="0.02" @changing="onScaleChange" @change="onScaleChange" />
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
	
	// 接收 Vue 层传来的数据
	function updateDragData(newValue, oldValue, ownerInstance, instance) {
		if (!newValue) return;
		
		if (newValue.isDragging) {
			isDragging = true;
			dragStartIndex = newValue.dragStartIndex;
			placeholderIndex = newValue.dragStartIndex;
			initialScrollTop = newValue.initialScrollTop || initialScrollTop || 0;
            containerTop = newValue.containerTop || containerTop || 0;
            
            // 首次进入时同步
            if (currentScrollTop === 0 && initialScrollTop !== 0) {
			    currentScrollTop = initialScrollTop;
            }
            if (newValue.scrollTop !== undefined) {
                currentScrollTop = newValue.scrollTop;
            }
            
            // 处理 rects，转换为绝对坐标 (相对于内容顶部)
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
                     // 重置样式，确保有 transition
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
             // 先记录触摸位置
             var touch = event.touches[0];
             if (touch) {
                 startY = touch.clientY;
             }
             
             // 调用 Vue 层开始拖拽
             ownerInstance.callMethod('startDrag', index);
             
             // 等待 Vue 层更新状态后，再计算 offset
             // 这里使用 setTimeout 确保 Vue 层状态已更新
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
                     // 如果没有 rects，使用默认值
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
        
        // 1. 移动浮动项 (Visual - Viewport Relative)
		var targetVisualTop = touchY - dragOffsetY;
		var floatingItem = floatingItemCache || ownerInstance.selectComponent('.floating-msg-item');
		floatingItemCache = floatingItem;
		if (floatingItem) {
			floatingItem.setStyle({
				top: targetVisualTop + 'px'
			});
		}
		
		// 2. 计算交换 (Absolute Coordinates Logic)
        // 当前手指对应的绝对位置中心
        // touchAbsY = touchY - containerTop + currentScrollTop
        // dragCenterAbsY = (touchY - dragOffsetY) - containerTop + currentScrollTop + dragItemHeight/2
        var dragTopAbsY = targetVisualTop - containerTop + currentScrollTop;
        var dragCenterAbsY = dragTopAbsY + dragItemHeight / 2;
        
        // 找到 placeholder 对应的 itemRects 索引
        // itemRects 是按初始 DOM 顺序 (data index) 排序的?
        // 我们需要按 "当前视觉顺序" 检查
        // 但其实 itemRects 数组本身的顺序通常就是列表顺序 (0, 1, 2...)
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
        
        // 检查前一个项 (Visual Previous)
        // 注意：placeholderIndex 是数据索引。itemRects 是数据顺序。
        // 如果 placeholderIndex > 0，前一个数据项是 placeholderIndex - 1 ?
        // 不一定，如果有过滤。假设 rects 是连续的。
        // 简单策略：遍历所有 rect，看 dragCenterAbsY 落在哪个 rect 的 "前半段" 或 "后半段"
        
        // 改进策略：越过中线交换 (Cross Midline)
        // 遍历所有 rects
        for (var i = 0; i < itemRects.length; i++) {
            var rect = itemRects[i];
            var rectIndex = rect.dataset.index;
            
            // 跳过自己
            if (rectIndex === placeholderIndex) continue;
            
            var rectCenter = rect.absTop + rect.height / 2;
            
            // 判断逻辑：
            // 如果 placeholder 在 i 之前 (placeholderIndex < rectIndex)
            // 我们向下拖，当 dragCenter > rectCenter 时，交换
            // 此时 placeholder 变成 rectIndex (或者说 rectIndex 移到 placeholder 之前)
            
            // 如果 placeholder 在 i 之后 (placeholderIndex > rectIndex)
            // 我们向上拖，当 dragCenter < rectCenter 时，交换
            
            // 限制：只和相邻的交换？
            // 为了避免跳跃，我们只检查 "视觉相邻" 的项。
            // 但 "视觉相邻" 比较难判断，因为 transform 改变了视觉位置。
            // 不过 itemRects 存储的是 "Slot" (槽位)。
            // 我们只需要看 dragCenter 落在哪个 Slot 的范围内。
            
            if (dragCenterAbsY > rect.absTop && dragCenterAbsY < (rect.absTop + rect.height)) {
                // 落在 rect i 的范围内
                // 检查是否越过中线
                if (placeholderIndex < rectIndex) {
                    // 向下：必须越过中线 (dragCenter > rectCenter)
                     if (dragCenterAbsY > rectCenter) {
                         swapTargetIndex = rectIndex;
                     }
                } else {
                    // 向上：必须越过中线 (dragCenter < rectCenter)
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
        
        // 立即结束拖拽，不等待动画，减少卡顿
        finishDrag(ownerInstance);
        
        // 可选：如果需要动画效果，异步执行但不阻塞状态清理
        var floatingItem = ownerInstance.selectComponent('.floating-msg-item');
        if (floatingItem) {
            // 快速隐藏浮动项
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
					this.massageList = JSON.parse(this.guestInfo.content || '[]') || [];
				} catch (e) {
					console.error('guestInfo 参数解析失败', e, options.guestInfo);
					this.massageList = [];
					this.updateMsg();
				}
			}
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

			// 读取本地存储的水印设置
			this.loadWatermarkSettings();

			this.$forceUpdate()


		},
		onUnload() {
			// 清理所有定时器
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
			
			// 重置拖拽状态
			this.resetDragState();
			
			// 清理缓存（可选，如果内存紧张）
			// this.messageParseCache.clear();
			// this.itemHeightCache.clear();
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
				dragStartIndex: -1, // 拖拽开始的消息索引 (在数据源中的索引)
				dragOverIndex: -1, // 拖拽悬停的消息索引 (废弃，使用 placeholderIndex)
				isDragging: false, // 是否正在拖拽
				isSortingMode: false, // 是否处于排序模式
				draggingItem: null, // 当前拖拽的消息对象 (用于浮动显示)
				draggingItemParsedContent: [], // 缓存拖拽项的解析内容
				dragItemHeight: 0, // 拖拽项的高度
				dragY: 0, // 浮动项的 Y 坐标
				placeholderIndex: -1, // 占位符当前的索引 (视觉上的位置)
				dragOffsetY: 0, // 手指相对于 item 顶部的偏移
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
				// 实际消息高度缓存（用于虚拟滚动）
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
			// 虚拟滚动：计算可见的消息列表
			visibleMessageList() {
				if (!this.useVirtualScroll) {
					return this.massageList.map((item, index) => ({ item, index, isVisible: true }));
				}
				// 如果消息数量少于阈值或未启用虚拟滚动，返回全部消息
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
				
				// 返回可见消息及其原始索引
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
			// 非响应式数据初始化
			this.cachedItemRects = [];
			this.initialScrollTop = 0;
			
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
					const size = this.calculateImageSize(upxWidth, upxHeight, imageKey);
					
					// 缓存实际高度用于虚拟滚动（转换为px，复用上面的变量）
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
				const scale = Number(this.scale) || 1

				const baseStyle = {
					overflow: 'hidden'
				};

				if (size && size.width && size.height) {
					// 动态计算 border-radius，确保不超过高度的一半，最小值为 8rpx
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
				// 如果还没有计算尺寸，返回默认值
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
				const scale = Number(this.scale) || 1

				const baseStyle = {
					width: '100%',
					height: '100%',
					display: 'block'
				};

				if (size && size.width && size.height) {
					// 动态计算 border-radius，确保不超过高度的一半，最小值为 8rpx
					const borderRadius = Math.max(8, Math.min(15, size.height / 2)) * scale;
					return {
						...baseStyle,
						borderRadius: borderRadius + 'rpx'
					};
				}
				// 如果还没有计算尺寸，返回默认值
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
			onChatToolBarToggle(e) {
				this.showChatToolBar = e.detail.value
			},
			// 滚动事件处理（虚拟滚动）
			onScroll(e) {
				if (!this.useVirtualScroll) return;
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

				clearTimeout(this.measureTimer);
				this.measureTimer = setTimeout(() => {
					this.measureVisibleItemHeights();
				}, 120);
			},
			
			// 更新可见区域范围
			updateVisibleRange(scrollTop) {
				if (!this.useVirtualScroll) {
					this.virtualScrollEnabled = false;
					this.visibleStartIndex = 0;
					this.visibleEndIndex = this.massageList.length;
					this.topPlaceholderHeightPx = 0;
					this.bottomPlaceholderHeightPx = 0;
					return;
				}
				// 拖拽过程中暂停虚拟滚动更新，防止DOM节点变化导致坐标计算错误
				if (this.isDragging) return;

				const listLen = this.massageList.length;
				if (!listLen) {
					this.visibleStartIndex = 0;
					this.visibleEndIndex = 0;
					this.topPlaceholderHeightPx = 0;
					this.bottomPlaceholderHeightPx = 0;
					return;
				}

				// 使用实际高度缓存计算可见区域（如果可用）
				let startIndex = 0;
				let heightBeforeStartIndex = 0;
				if (this.itemHeightCache.size > 0) {
					// 使用实际高度累加计算
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
					// 回退到估算高度
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
			
			// 初始化虚拟滚动
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
				uni.navigateTo({
					url: "/pages/collectionSuccess/collectionSuccess?info=" + encodeURIComponent(JSON.stringify(
						item.content))
				})
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
				// 改为左对齐：以触摸点为左边界
				let left = clientX;
				
				// 确保不超出右边界
				if (left + estimatedMenuWidth > windowWidth - 10) {
					// 如果右边放不下，就靠右对齐（或者向左偏移）
					left = windowWidth - estimatedMenuWidth - 10;
				}
				
				// 确保不超出左边界（虽然以 clientX 开始通常不会，但为了保险）
				if (left < 10) {
					left = 10;
				}

				// 计算顶部位置，显示在触摸点下方
				// 触摸点下方预留一些间距，例如 20px
				let top = clientY + 20;
				const estimatedMenuHeight = Math.ceil(itemCount / Math.floor(maxMenuWidth / estimatedItemWidth)) * 100 + 30; // 估算高度
				
				// 检查底部是否溢出
				if (top + estimatedMenuHeight > windowHeight - 20) {
					// 如果底部放不下，尝试放在上方
					// 上方位置 = 触摸点 - 菜单高度 - 间距
					const topAbove = clientY - estimatedMenuHeight - 20;
					
					// 如果上方能放下，或者上方空间比下方大，就放上方
					if (topAbove > 10 || (clientY > windowHeight / 2)) {
						top = topAbove;
					} else {
						// 实在放不下，就贴底显示
						top = windowHeight - estimatedMenuHeight - 10;
					}
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
			async addVideo() {
				this.$refs.videoPopup.open()

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
				
				// 如果有当前操作的索引，将转账插入到该消息上方
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

				// 如果有当前操作的索引，将订单插入到该消息上方
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
					this.invalidateVirtualScrollCaches();
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
					this.invalidateVirtualScrollCaches();
					// 插入后重置索引
					this.currentActionIndex = -1;
				} else {
					// 否则默认添加到末尾
					this.massageList.push(timeInfo);
				}

				this.updateMsg()
			},



			onSwitchChange(e) {
				this.isMe = !this.isMe;
			},

			onLongPressPopupChange(e) {
				const newValue = e.detail.value;
				
				// 如果开启长按弹框，则关闭长按拖拽
				if (newValue && this.enableLongPressDrag) {
					this.enableLongPressDrag = false;
				}
				
				this.enableLongPressPopup = newValue;

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
				const newValue = e.detail.value;
				
				// 如果开启长按拖拽，则关闭长按弹框
				if (newValue && this.enableLongPressPopup) {
					this.enableLongPressPopup = false;
					// 关闭当前显示的弹框
					this.activeMsgIndex = -1;
					this.popupVisible = false;
				}
				
				this.enableLongPressDrag = newValue;

				// 显示状态提示
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
						this.invalidateVirtualScrollCaches();
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

			// 消息插入提交 (模仿wxChat)
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

				if (this.currentActionIndex !== -1) {
					this.massageList.splice(this.currentActionIndex, 0, msgInfo);
					this.invalidateVirtualScrollCaches();
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

				// 使用缓存避免重复解析
				if (this.messageParseCache.has(msg)) {
					return this.messageParseCache.get(msg);
				}

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

				// 缓存结果（限制缓存大小，避免内存泄漏）
				if (this.messageParseCache.size > 100) {
					// 删除最旧的缓存项
					const firstKey = this.messageParseCache.keys().next().value;
					this.messageParseCache.delete(firstKey);
				}
				this.messageParseCache.set(msg, result);

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
				
				// 被拖拽的原位置元素隐藏（占位符）
				if (index === this.dragStartIndex) {
					return { opacity: 0, visibility: 'hidden' };
				}
				
				const style = {
					transition: 'transform 0.2s ease'
				};
				
				// 计算位移
				// 向下拖拽：dragStartIndex < placeholderIndex
				// index 在 (dragStartIndex, placeholderIndex] 之间 -> 上移
				if (this.dragStartIndex < this.placeholderIndex) {
					if (index > this.dragStartIndex && index <= this.placeholderIndex) {
						style.transform = `translateY(-${this.dragItemHeight}px)`;
					}
				}
				// 向上拖拽：dragStartIndex > placeholderIndex
				// index 在 [placeholderIndex, dragStartIndex) 之间 -> 下移
				else if (this.dragStartIndex > this.placeholderIndex) {
					if (index >= this.placeholderIndex && index < this.dragStartIndex) {
						style.transform = `translateY(${this.dragItemHeight}px)`;
					}
				}
				
				return style;
			},

			exitSortingMode() {
				this.isSortingMode = false;
				this.originalMessageList = []; // 清空备份
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
				// 只有开启了长按拖拽功能才执行
				if (!this.enableLongPressDrag) {
					// 如果拖拽未开启，尝试触发普通长按菜单
					this.showPopupMenu(e, index);
					return;
				}

				// 如果正在拖拽，先强制结束当前拖拽
				if (this.isDragging) {
					// 保存旧的拖拽索引，用于判断是否是同一个消息
					const oldDragStartIndex = this.dragStartIndex;
					
					// 提交当前拖拽的移动（如果有）
					if (this.dragStartIndex !== this.placeholderIndex && this.placeholderIndex !== -1 && this.dragStartIndex !== -1) {
						this.moveMessage(this.dragStartIndex, this.placeholderIndex);
					}
					
					// 强制结束当前拖拽
					this.forceEndDrag();
					
					// 如果点击的是同一个消息，不重新开始拖拽
					if (oldDragStartIndex === index) {
						return;
					}
					
					// 立即开始新的拖拽
					this.$nextTick(() => {
						this.touchStartTime = Date.now();
						if (e.touches && e.touches[0]) {
							this.dragStartY = e.touches[0].clientY;
						}
						
						// 如果已经在排序模式，直接开始新拖拽
						if (this.isSortingMode) {
							this.startNewDrag(e, index);
						} else {
							this.enterSortingMode(e, index);
						}
					});
					return;
				}

				// 如果不在拖拽状态，正常开始
				if (!this.isDragging) {
					// 记录触摸开始 (WXS 会自动处理 touchstart，这里主要是逻辑状态)
					this.touchStartTime = Date.now();
					if (e.touches && e.touches[0]) {
						this.dragStartY = e.touches[0].clientY;
					}
					
					// 触发排序模式/拖拽
					this.enterSortingMode(e, index);
				}
			},
			
			// WXS 回调: 震动
			wxsVibrate() {
				try { uni.vibrateShort({ type: 'light' }); } catch(e) {}
			},
			
			// WXS 回调: 拖拽结束
			onWxsDragEnd(data) {
				const { from, to } = data;
				
				// 提交移动（如果有）- 先提交，再清理状态
				if (from !== to && to !== -1 && from !== -1) {
					this.moveMessage(from, to);
				}
				
				// 立即清理拖拽状态，不等待异步操作，确保可以立即响应新的长按
				this.isDragging = false;
				this.draggingItem = null;
				this.dragStartIndex = -1;
				this.placeholderIndex = -1;
				
				// 清理自动滚动
				if (this.autoScrollTimer) {
					clearInterval(this.autoScrollTimer);
					this.autoScrollTimer = null;
				}
				
				// 立即更新 WXS 状态，确保状态同步
				this.wxsDragData = {
					...this.wxsDragData,
					isDragging: false,
					dragStartIndex: -1
				};
				
				// 重新测量位置（异步执行，不阻塞状态清理）
				// 这很重要，因为列表顺序可能已经改变
				if (this.isSortingMode) {
					// 使用 $nextTick 确保 DOM 更新完成
					this.$nextTick(() => {
						// 使用 requestAnimationFrame 优化性能，减少延迟
						if (typeof requestAnimationFrame !== 'undefined') {
							requestAnimationFrame(() => {
								this.updateItemRects();
							});
						} else {
							// 兼容不支持 requestAnimationFrame 的环境
							setTimeout(() => {
								this.updateItemRects();
							}, 16); // 约一帧的时间
						}
					});
				}
			},
			
			// 更新消息项位置信息（用于拖拽）
			updateItemRects() {
				const query = uni.createSelectorQuery().in(this);
				query.select('.chat-body').boundingClientRect(containerRect => {
					const itemQuery = uni.createSelectorQuery().in(this);
					itemQuery.selectAll('.msg-item-wrapper').boundingClientRect((rects) => {
						if (rects && rects.length > 0) {
							this.cachedItemRects = rects;
							// 更新 WXS 数据，但不改变拖拽状态
							this.wxsDragData = {
								...this.wxsDragData,
								rects: rects,
								containerTop: containerRect ? containerRect.top : 0
							};
						}
					}).exec();
				}).exec();
			},

			// WXS 调用：开始拖拽 (通过把手)
			startDrag(index) {
				if (!this.isSortingMode) return;
				if (this.isDragging) return;
				
				this.startNewDrag(null, index);
			},
			
			// 开始新的拖拽（内部方法，用于统一处理拖拽开始逻辑）
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
				
				// 初始化滚动位置
				this.initialScrollTop = this.scrollPosition;
				
				// 如果已有缓存的 rects，先使用缓存，然后异步更新
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
				
				// 异步更新位置信息（确保使用最新数据）
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
				// 备份原始列表
				if (this.originalMessageList.length === 0) {
					this.originalMessageList = JSON.parse(JSON.stringify(this.massageList));
				}
				
				this.dragStartIndex = index;
				this.placeholderIndex = index;
				this.isDragging = true;
				this.draggingItem = this.massageList[index];
				
				// 预先解析消息内容
				if (this.draggingItem.contentType === 'chat') {
					this.draggingItemParsedContent = this.parseMessage(this.draggingItem.content);
				} else {
					this.draggingItemParsedContent = [];
				}
				
				// 震动反馈
				try { uni.vibrateShort(); } catch (e) {}
				
				// 初始化滚动位置
				this.initialScrollTop = this.scrollPosition;
				
				// 缓存位置信息并传递给 WXS
				const query = uni.createSelectorQuery().in(this);
				// 获取容器位置
				query.select('.chat-body').boundingClientRect(containerRect => {
					// 获取所有 item 位置
					const itemQuery = uni.createSelectorQuery().in(this);
					itemQuery.selectAll('.msg-item-wrapper').boundingClientRect((rects) => {
						if (rects && rects.length > 0) {
							this.cachedItemRects = rects;
							
							// 更新 WXS 数据，通知 WXS 开始接管
							this.wxsDragData = {
								isDragging: true,
								dragStartIndex: index,
								rects: rects,
								initialScrollTop: this.initialScrollTop,
								containerTop: containerRect ? containerRect.top : 0
							};
							
							// 获取当前项的高度 (WXS 也会计算，这里主要用于 Vue 层逻辑备用)
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
						// 同步更新 scrollPosition，确保计算平滑
						this.scrollPosition = this.scrollTop;
						
						// 滚动时也需要更新 dragY ? 
						// 不需要，dragY 是 fixed 的，相对于视口。
						// 但是 items 的位置变了（相对于视口）。
						// updatePlaceholderIndex 会用到 scrollDelta (scrollPosition - initialScrollTop)。
						// 所以更新 scrollPosition 后，下一次 updatePlaceholderIndex 就会计算正确。
					}, 16);
				}
			},
			
			updatePlaceholderIndex(touchY) {
				if (!this.cachedItemRects || this.cachedItemRects.length === 0) return;
				
				// 计算滚动偏差
				const scrollDelta = this.scrollPosition - this.initialScrollTop;
				
				// 遍历 rects 寻找命中项
				// 注意：rects 是初始快照。
				// 当前每个 item 的视觉位置 = rect.top - scrollDelta + (visualShift)
				// visualShift 取决于 item 是否在 dragStartIndex 和 placeholderIndex 之间
				// 这导致递归依赖。
				// 简化逻辑：我们只看 "原始位置" + 滚动偏差。
				// 如果手指跨过了某个 item 的 "中线"，就交换。
				
				let newPlaceholder = this.dragStartIndex;
				
				for (let i = 0; i < this.cachedItemRects.length; i++) {
					const rect = this.cachedItemRects[i];
					// 修正为当前视口位置
					const currentTop = rect.top - scrollDelta;
					const center = currentTop + rect.height / 2;
					
					// 找到当前手指所在的 item
					if (touchY > currentTop && touchY < currentTop + rect.height) {
						// 这是一个近似命中。
						// 更精确的逻辑：
						// 如果当前 placeholder 在 i 之前，且 touchY > center -> placeholder 移到 i 之后
						// 如果当前 placeholder 在 i 之后，且 touchY < center -> placeholder 移到 i 之前
					}
				}
				
				// 替代方案：直接找最近的 item
				let minDistance = Infinity;
				let targetIndex = -1;
				
				for (let i = 0; i < this.cachedItemRects.length; i++) {
					const rect = this.cachedItemRects[i];
					const currentTop = rect.top - scrollDelta;
					const center = currentTop + rect.height / 2;
					
					const dist = Math.abs(touchY - center);
					if (dist < minDistance) {
						minDistance = dist;
						// 获取该 rect 对应的真实数据索引
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
				
				// 结束拖拽状态，但保持排序模式
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
				// 立即清理所有拖拽状态
				this.isDragging = false;
				this.draggingItem = null;
				this.dragStartIndex = -1;
				this.placeholderIndex = -1;
				
				// 立即更新 WXS 状态
				this.wxsDragData = {
					...this.wxsDragData,
					isDragging: false,
					dragStartIndex: -1
				};
				
				// 清理自动滚动
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
	.msg.right .bubble::after,
	.msg.left .bubble::after,
	.file-card-left::after,
	.file-card-right::after {
		content: "";
		position: absolute;
		top: 28upx;
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
		will-change: transform; /* 开启硬件加速 */
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
		left: 20upx; /* 与 .chat-body padding 一致 */
		right: 20upx;
		z-index: 9999;
		pointer-events: none;
		transform: scale(1.05) translateZ(0); /* 开启硬件加速 */
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
		z-index: 1001; /* 比内容高 */
		background: rgba(255, 255, 255, 0.5); /* 半透明背景，可选 */
		backdrop-filter: blur(2px);
	}
	
	.handle-icon {
		font-size: 40upx;
		color: #999;
		font-weight: bold;
	}
	
	.msg-item-wrapper.sorting-mode {
		padding-right: 60upx; /* 给把手留位置 */
	}
	
	/* 让浮动项内部的 .cell 撑满宽度，保持左右对齐 */
	.floating-msg-item .cell {
		width: 100%;
	}
	
	/* 移除原来的 msg-content-clone 样式，因为我们直接复用了结构 */
	
	.msg-item-wrapper.dragging-placeholder {
		/* 占位符样式由 inline style opacity: 0 控制 */
		opacity: 0;
	}
</style>
