<template>
	<view class="container">
		<image src="/static/chat/li_head.png" mode="widthFix"></image>
		<view class="content">
			<view style="padding: 24rpx;">
				<view class="title-row">
					<text class="title-text" :style="{ fontSize: rpx(46) }">{{ linkInfo.name }}</text>
					<image :style="{ width: rpx(38), position: 'relative', top: '-4rpx' }" src="/static/chat/li_exit.png"
						mode="widthFix"></image>
				</view>
				<view class="link-row">
					<text class="link-text" :style="{ fontSize: rpx(40) }">
						{{ linkInfo.addUrl }}
					</text>
					<view class="copy-btn" :style="{ fontSize: rpx(32), padding: rpx(16) + ' ' + rpx(28) }" @click="copyLink">
						复制
					</view>
				</view>
			</view>
			
			<view class="card usage-card">
				<view class="usage-header" @click="toggleUsageFilter">
					<view class="usage-title-row">
						<text class="usage-title" :style="{ fontSize: rpx(32) }">{{ usageFilterLabel }}</text>
						<image
							:style="{ width: rpx(26), marginLeft: rpx(8) }"
							src="/static/chat/li_down.png"
							mode="widthFix"
						/>
					</view>
				</view>
				<!-- 使用情况筛选下拉 -->
				<view v-if="showUsageFilter" class="usage-filter-pop">
					<view class="usage-filter-item" @click.stop="selectUsageFilter('today')">
						<text :style="{ fontSize: rpx(28) }">今日</text>
						<view v-if="usageFilter === 'today'" class="usage-filter-check" :style="{ fontSize: rpx(28) }">
							<image  :style="{ width: rpx(28) }" src="/static/chat/li_dui.png" mode="widthFix"></image>
						</view>
					</view>
					<view class="usage-filter-divider" />
					<view class="usage-filter-item" @click.stop="selectUsageFilter('yesterday')">
						<text :style="{ fontSize: rpx(28) }">昨日</text>
						<view v-if="usageFilter === 'yesterday'" class="usage-filter-check" :style="{ fontSize: rpx(28) }">✔</view>
					</view>
					<view class="usage-filter-divider" />
					<view class="usage-filter-item" @click.stop="selectUsageFilter('custom')">
						<text :style="{ fontSize: rpx(28) }">自定义日期</text>
						<view v-if="usageFilter === 'custom'" class="usage-filter-check" :style="{ fontSize: rpx(28) }">✔</view>
					</view>
				</view>
				<view class="usage-body">
					<view class="usage-item">
						<text class="usage-number" :style="{ fontSize: rpx(58) }">{{ displayOpenLink }}</text>
						<text class="usage-label" :style="{ fontSize: rpx(28) }">打开链接人数</text>
					</view>
					<view class="usage-item">
						<text class="usage-number" :style="{ fontSize: rpx(58) }">{{ displayAddNum }}</text>
						<text class="usage-label" :style="{ fontSize: rpx(28) }">新培客户数</text>
					</view>
				</view>
			</view>

			<!-- 配置卡片 -->
			<view class="card config-card">
				<view class="config-title" :style="{ fontSize: rpx(32) }">配置</view>

				<!-- 客户点击链接可添加的成员 -->
				<view class="config-item">
					<view class="config-item-main">
						<view class="config-label">
							<view class="" :style="{ fontSize: rpx(34) }">
								客户点击链接可添加的成员 
							</view>
							<image class="config-arrow" :style="{ width: rpx(20) }" src="/static/chat/li_right_icon.png" mode="widthFix"></image>
						</view>
						<view class="config-member-row">
							<view class="member" v-for="(m, idx) in linkInfo.member" :key="idx">
								<image class="config-avatar" :style="{ width: rpx(86), height: rpx(86) }" :src="m.avatar" mode="aspectFill"></image>
								<view class="config-member-name" :style="{ fontSize: rpx(22) }">{{ m.name }}</view>
							</view>
						</view>
					</view>
					
				</view>

				<!-- 欢迎语 -->
				<view class="config-item_">
					<view class="config-item-main">
						<text class="config-label_" :style="{ fontSize: rpx(34) }">欢迎语</text>
					</view>
					<view class="config-right">
						<text class="config-subtext" :style="{ fontSize: rpx(32) }">{{ linkInfo.welcomeText }}</text>
						<image class="config-arrow" :style="{ width: rpx(20) }" src="/static/chat/li_right_icon.png" mode="widthFix"></image>
					</view>
				</view>

				<!-- 客户标签 -->
				<view class="config-item_" :style="{ padding: rpx(29) + ' 0' }">
					<view class="config-item-main">
						<text class="config-label_" :style="{ fontSize: rpx(34) }">客户标签</text>
					</view>
					<view class="config-right">
						<text class="config-tag" :style="{ fontSize: rpx(32) }" v-for="(t, idx) in linkInfo.tag" :key="idx">{{ t }}</text>
						<image class="config-arrow" :style="{ width: rpx(20) }" src="/static/chat/li_right_icon.png" mode="widthFix"></image>
					</view>
				</view>

				<!-- 客户添加成员时需要验证 -->
				<view class="config-item_" :style="{ padding: rpx(31) + ' 0' }">
					<view class="config-item-main">
						<text class="config-label_" :style="{ fontSize: rpx(34) }">客户添加成员时需要验证</text>
					</view>
					<image :style="{ width: rpx(100) }" src="/static/chat/li_swich.png" mode="widthFix"></image>
				</view>

				<!-- 客户添加时有成员异常账号 -->
				<view class="config-item_">
					<view class="config-item-main">
						<text class="config-label_" :style="{ fontSize: rpx(34) }">客户添加时有成员异常账号</text>
					</view>
					<text class="config-right-text" :style="{ fontSize: rpx(28) }">自动跳过</text>
				</view>
			</view>
			<view class="foot_txt" :style="{ fontSize: rpx(28) }">
				{{ linkInfo.time }} 由我创建连接
			</view>
		</view>
		<!-- 左上返回 -->
		<view class="back-btn" @click="goBack" />
		<!-- 右上操作按钮 -->
		<view class="add-btn" @click="openActionSheet" />	

		<!-- 底部操作弹层：编辑 / 删除 / 字体 -->
		<view v-if="showActionSheet" class="action-sheet-mask" @click="closeActionSheet">
			<view class="action-sheet" @click.stop>
				<view class="action-sheet-item" :style="{ fontSize: rpx(32) }" @click="openEditModal">编辑</view>
				<view class="action-sheet-item" :style="{ fontSize: rpx(32) }" @click="openFontModal">字体</view>
				<view class="action-sheet-item danger" :style="{ fontSize: rpx(32) }" @click="confirmDelete">删除</view>
				<view class="action-sheet-cancel" :style="{ fontSize: rpx(32) }" @click="closeActionSheet">取消</view>
			</view>
		</view>

		<!-- 字体调节弹窗 -->
		<view v-if="showFontModal" class="modal-mask" @click="closeFontModal">
			<view class="font-modal-container" @click.stop>
				<view class="font-modal-title">字体调节</view>
				<view class="font-modal-body">
					<view class="font-slider-row">
						<text class="font-label">字体大小</text>
						<view class="font-slider-wrapper">
							<slider :value="scale" :min="0.7" :max="1.5" :step="0.02" @changing="onScaleChange" />
							<text class="font-hint">{{ Math.round(scale * 100) }}%</text>
						</view>
					</view>
				</view>
				<view class="font-modal-actions">
					<view class="btn cancel" @click="closeFontModal">确定</view>
				</view>
			</view>
		</view>

		<!-- 编辑弹框（引用新增弹框样式） -->
		<view v-if="showEditModal" class="modal-mask">
			<view class="modal-container">
				<view class="modal-title">编辑获客链接</view>
				<view class="modal-field">
					<text class="field-label">名称</text>
					<input class="field-input" v-model="editForm.name" placeholder="请输入名称" />
				</view>
				<view class="modal-field">
					<text class="field-label">链接地址</text>
					<input class="field-input" v-model="editForm.addUrl" placeholder="请输入链接地址" />
				</view>
				<view class="field-row">
					<view class="modal-field half">
						<text class="field-label">新增人数</text>
						<input class="field-input" type="number" v-model.number="editForm.addNum" placeholder="0" />
					</view>
					<view class="modal-field half">
						<text class="field-label">打开次数</text>
						<input class="field-input" type="number" v-model.number="editForm.openLink" placeholder="0" />
					</view>
				</view>
				<view class="field-row">
					<view class="modal-field half">
						<text class="field-label">上次新增人数</text>
						<input class="field-input" type="number" v-model.number="editForm.lastAddNum" placeholder="0" />
					</view>
					<view class="modal-field half">
						<text class="field-label">上次打开次数</text>
						<input class="field-input" type="number" v-model.number="editForm.lastOpenLink" placeholder="0" />
					</view>
				</view>
				<view class="modal-field">
					<text class="field-label">标签（逗号分隔）</text>
					<input class="field-input" v-model="editTagInput" placeholder="例如：一般,重要" />
				</view>
				<view class="modal-field">
					<text class="field-label">时间</text>
					<input class="field-input" v-model="editForm.time" placeholder="例如：1月28日" />
				</view>
				<view class="modal-field">
					<text class="field-label">欢迎语</text>
					<input class="field-input" v-model="editForm.welcomeText" placeholder="请输入欢迎语" />
				</view>
				<view class="modal-field">
					<text class="field-label">成员列表</text>
					<view v-if="editMembers && editMembers.length" class="member-list">
						<view v-for="(m, idx) in editMembers" :key="idx" class="member-item">
							<view class="member-avatar">
								<image :src="m.avatar" mode="aspectFill"></image>
							</view>
							<view class="member-name">{{ m.name }}</view>
							<view class="member-remove" @click="removeEditMember(idx)">删除</view>
						</view>
					</view>
					<view class="member-add-row">
						<input class="field-input member-input" v-model="editMemberName" placeholder="成员名称" />
						<view class="avatar-row">
							<view v-if="editMemberAvatar" class="avatar-preview">
								<image :src="editMemberAvatar" mode="aspectFill"></image>
							</view>
							<view class="avatar-btn" @click="chooseEditMemberAvatar">头像</view>
						</view>
						<view class="member-add-btn" @click="addEditMember">添加成员</view>
					</view>
				</view>
				<view class="modal-actions">
					<view class="btn cancel" @click="closeEditModal">取消</view>
					<view class="btn confirm" @click="submitEdit">保存</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import scaleMixin from '@/mixins/scaleMixin.js'
	
	export default {
		mixins: [scaleMixin],
		data() {
			return {
				// 用来接收从 linkList 传进来的数据
				linkInfo: {},
				showActionSheet: false,
				showEditModal: false,
				showFontModal: false,
				editForm: {
					name: '',
					addUrl: '',
					addNum: 0,
					openLink: 0,
					lastAddNum: 0,
					lastOpenLink: 0,
					time: '',
					welcomeText: ''
				},
				editTagInput: '',
				editMembers: [],
				editMemberName: '',
				editMemberAvatar: '',
				usageFilter: 'today',
				showUsageFilter: false
			}
		},
		computed: {
			usageFilterLabel() {
				const map = {
					today: '今日使用情况',
					yesterday: '昨日使用情况',
					custom: '自定义日期'
				};
				return map[this.usageFilter] || '今日使用情况';
			},
			displayOpenLink() {
				if (this.usageFilter === 'yesterday') {
					return this.linkInfo.lastOpenLink || 0;
				}
				// 今日或自定义暂时都用当前值
				return this.linkInfo.openLink || 0;
			},
			displayAddNum() {
				if (this.usageFilter === 'yesterday') {
					return this.linkInfo.lastAddNum || 0;
				}
				return this.linkInfo.addNum || 0;
			}
		},
		onLoad(options) {
			// 通过 id 从本地存储的 linkList 中找到对应数据
			const id = options && options.id ? Number(options.id) : null;
			if (!id) return;
			try {
				const list = uni.getStorageSync('linkList');
				if (Array.isArray(list)) {
					const hit = list.find(i => Number(i.id) === id);
					if (hit) {
						this.linkInfo = hit;
					}
				}
			} catch (e) {}
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			copyLink() {
				uni.setClipboardData({
					data: this.linkInfo.addUrl,
					success: () => {
						uni.showToast({
							title: '已复制链接',
							icon: 'success'
						});
					}
				});
			},
			toggleUsageFilter() {
				this.showUsageFilter = !this.showUsageFilter;
			},
			selectUsageFilter(type) {
				this.usageFilter = type;
				this.showUsageFilter = false;
			},
			openActionSheet() {
				this.showActionSheet = true;
			},
			closeActionSheet() {
				this.showActionSheet = false;
			},
			openFontModal() {
				this.closeActionSheet();
				this.showFontModal = true;
			},
			closeFontModal() {
				this.showFontModal = false;
			},
			onScaleChange(e) {
				const scale = e.detail.value;
				this.$store.commit('setScale', scale);
			},
			openEditModal() {
				this.closeActionSheet();
				this.editForm = {
					name: this.linkInfo.name,
					addUrl: this.linkInfo.addUrl,
					addNum: this.linkInfo.addNum || 0,
					openLink: this.linkInfo.openLink || 0,
					lastAddNum: this.linkInfo.lastAddNum || 0,
					lastOpenLink: this.linkInfo.lastOpenLink || 0,
					time: this.linkInfo.time || '',
					welcomeText: this.linkInfo.welcomeText
				};
				this.editTagInput = Array.isArray(this.linkInfo.tag) ? this.linkInfo.tag.join(',') : '';
				this.editMembers = Array.isArray(this.linkInfo.member) ? JSON.parse(JSON.stringify(this.linkInfo.member)) : [];
				this.editMemberName = '';
				this.editMemberAvatar = '';
				this.showEditModal = true;
			},
			closeEditModal() {
				this.showEditModal = false;
			},
			submitEdit() {
				// 计算标签和成员
				const tagArr = this.editTagInput
					? this.editTagInput.split(',').map(t => t.trim()).filter(t => t)
					: [];

				// 更新当前 linkInfo
				this.linkInfo = {
					...this.linkInfo,
					name: this.editForm.name,
					addUrl: this.editForm.addUrl,
					addNum: this.editForm.addNum || 0,
					openLink: this.editForm.openLink || 0,
					lastAddNum: this.editForm.lastAddNum || 0,
					lastOpenLink: this.editForm.lastOpenLink || 0,
					time: this.editForm.time || '',
					welcomeText: this.editForm.welcomeText,
					tag: tagArr,
					member: this.editMembers
				};

				// 同步到本地存储列表
				try {
					const list = uni.getStorageSync('linkList') || [];
					const idx = list.findIndex(i => Number(i.id) === Number(this.linkInfo.id));
					if (idx > -1) {
						list[idx] = this.linkInfo;
						uni.setStorageSync('linkList', list);
					}
				} catch (e) {}

				this.showEditModal = false;
				uni.showToast({
					title: '已保存',
					icon: 'success'
				});
			},
			chooseEditMemberAvatar() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						if (res.tempFilePaths && res.tempFilePaths.length > 0) {
							this.editMemberAvatar = res.tempFilePaths[0];
						}
					}
				});
			},
			addEditMember() {
				if (!this.editMemberName) {
					uni.showToast({
						title: '请填写成员名称',
						icon: 'none'
					});
					return;
				}
				this.editMembers.push({
					avatar: this.editMemberAvatar || '/static/chat/li_file.png',
					name: this.editMemberName
				});
				this.editMemberName = '';
				this.editMemberAvatar = '';
			},
			removeEditMember(index) {
				this.editMembers.splice(index, 1);
			},
			confirmDelete() {
				this.closeActionSheet();
				uni.showModal({
					title: '确认删除',
					content: '删除后不可恢复，是否继续？',
					confirmText: '删除',
					confirmColor: '#ff4d4f',
					success: (res) => {
						if (res.confirm) {
							this.deleteCurrent();
						}
					}
				});
			},
			deleteCurrent() {
				try {
					const list = uni.getStorageSync('linkList') || [];
					const newList = list.filter(i => Number(i.id) !== Number(this.linkInfo.id));
					uni.setStorageSync('linkList', newList);
				} catch (e) {}
				uni.showToast({
					title: '已删除',
					icon: 'success'
				});
				setTimeout(() => {
					this.goBack();
				}, 300);
			},
			toggleVerify(e) {
				this.config.needVerify = e.detail.value
			}
		}
	}
</script>

<style>
	.back-btn{
	
		top: 80rpx;
		position: absolute;
		width: 100rpx;
		height: 100rpx;
		z-index: 1;
		left: 0;
	}
	.add-btn{
		
		top: 80rpx;
		right: 0;
		position: absolute;
		width: 100rpx;
		height: 100rpx;
		z-index: 1;
	}
.usage-title-row{
	display: flex;
	align-items: center;
}
.action-sheet-mask{
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	background-color: rgba(0,0,0,0.4);
	display: flex;
	justify-content: center;
	align-items: flex-end;
	z-index: 20;
}
.action-sheet{
	width: 100%;
	background-color: #f5f5f5;
	border-top-left-radius: 24rpx;
	border-top-right-radius: 24rpx;
	padding-bottom: env(safe-area-inset-bottom);
}
.action-sheet-item{
	background-color: #fff;
	text-align: center;
	padding: 28rpx 0;
	font-size: 32rpx;
	color: #333;
	border-bottom: 1rpx solid #eee;
}
.action-sheet-item.danger{
	color: #ff4d4f;
}
.action-sheet-cancel{
	margin-top: 12rpx;
	background-color: #fff;
	text-align: center;
	padding: 28rpx 0;
	font-size: 32rpx;
	color: #333;
	border-top-left-radius: 24rpx;
	border-top-right-radius: 24rpx;
}
.edit-modal-mask{
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	background-color: rgba(0,0,0,0.4);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 30;
}
.edit-modal{
	width: 80%;
	background-color: #fff;
	border-radius: 16rpx;
	padding: 32rpx;
}
.edit-title{
	font-size: 32rpx;
	font-weight: 600;
	margin-bottom: 24rpx;
	text-align: center;
}
.edit-field{
	margin-bottom: 20rpx;
}
.edit-label{
	font-size: 28rpx;
	color: #666;
	margin-bottom: 8rpx;
	display: block;
}
.edit-input{
	border: 1rpx solid #e5e5e5;
	border-radius: 8rpx;
	padding: 16rpx 20rpx;
	font-size: 28rpx;
	background-color: #f8f8f8;
}
.edit-actions{
	margin-top: 16rpx;
	display: flex;
	justify-content: flex-end;
}
.edit-btn{
	min-width: 140rpx;
	text-align: center;
	padding: 16rpx 0;
	border-radius: 8rpx;
	font-size: 28rpx;
	margin-left: 20rpx;
}
.edit-btn.cancel{
	background-color: #f5f5f5;
	color: #666;
}
/* === 复用 linkList 弹框样式，让编辑弹框正常显示 === */
.modal-mask{
	position: fixed;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	background-color: rgba(0,0,0,0.5);
	display: flex;
	justify-content: center;
	align-items: center;
	z-index: 30;
}
.modal-container{
	width: 80%;
	background-color: #fff;
	border-radius: 16rpx;
	padding: 32rpx;
}
.modal-title{
	font-size: 32rpx;
	font-weight: 600;
	margin-bottom: 24rpx;
	text-align: center;
}
.modal-field{
	margin-bottom: 24rpx;
}
.field-label{
	font-size: 28rpx;
	color: #666;
	margin-bottom: 8rpx;
	display: block;
}
.field-input{
	border: 1rpx solid #e5e5e5;
	border-radius: 8rpx;
	padding: 16rpx 20rpx;
	font-size: 28rpx;
	background-color: #f8f8f8;
}
.field-row{
	display: flex;
	justify-content: space-between;
}
.field-row .half{
	width: 48%;
}
.member-list{
	margin-bottom: 16rpx;
}
.member-item{
	display: flex;
	align-items: center;
	margin-bottom: 12rpx;
}
.member-avatar{
	width: 60rpx;
	height: 60rpx;
	border-radius: 50%;
	overflow: hidden;
	margin-right: 16rpx;
}
.member-avatar image{
	width: 100%;
	height: 100%;
}
.member-name{
	flex: 1;
	font-size: 28rpx;
}
.member-remove{
	font-size: 24rpx;
	color: #ff4d4f;
	padding: 8rpx 16rpx;
}
.member-add-row{
	margin-top: 8rpx;
}
.member-input{
	margin-bottom: 12rpx;
}
.member-add-btn{
	margin-top: 12rpx;
	font-size: 26rpx;
	color: #3175da;
	padding: 12rpx 0;
	text-align: center;
	border-radius: 8rpx;
	border: 1rpx solid #3175da;
}
.avatar-row{
	display: flex;
	align-items: center;
}
.avatar-preview{
	width: 80rpx;
	height: 80rpx;
	border-radius: 10rpx;
	overflow: hidden;
	margin-right: 20rpx;
}
.avatar-preview image{
	width: 100%;
	height: 100%;
}
.avatar-btn{
	font-size: 26rpx;
	color: #3175da;
	padding: 12rpx 20rpx;
	border-radius: 8rpx;
	border: 1rpx solid #3175da;
}
.modal-actions{
	margin-top: 24rpx;
	display: flex;
	justify-content: flex-end;
}
.btn{
	min-width: 140rpx;
	text-align: center;
	padding: 16rpx 0;
	border-radius: 8rpx;
	font-size: 28rpx;
	margin-left: 20rpx;
}
.btn.cancel{
	background-color: #f5f5f5;
	color: #666;
}
.btn.confirm{
	background-color: #3175da;
	color: #fff;
}
.foot_txt{
	margin-top: 120rpx;
	margin-bottom: 30rpx;
	font-size: 28rpx;
	color: #999;
	text-align: center;
}
image{
	display: block;
	width: 100%;
}
.container{
	height: 100vh;
	overflow: hidden;
	position: relative;
	display: flex;
	flex-direction: column;
	background-color: #edf0f5;
}
.content{
	flex: 1;
	padding: 24rpx;
	overflow: auto;
}
.card{
	border-radius: 16rpx;
	padding: 24rpx;
	background-color: #fff;
}
.link-card{
	margin-bottom: 24rpx;
	padding-top: 8rpx;
}
.title-row{
	display: flex;
	align-items: center;
	margin-bottom: 36rpx;
}
.title-text{
	font-size: 46rpx;
	color: #333;
	margin-right: 10rpx;
	font-weight: 500;
}
.title-icon{
	margin-left: 4rpx;
}
.link-row{
	margin-top: 8rpx;
	display: flex;
	align-items: center;
	
}
.link-text{
	flex: 1;
	font-size: 40rpx;
	color: #1a1a1a;
	line-height: 1.2;
	margin-right: 36rpx;
	/* 超出自动换行，长链接也能断行 */
	word-break: break-all;
	white-space: normal;
}
.copy-btn{
	background-color: #2979ff;
	color: #fff;
	font-size: 32rpx;
	padding: 16rpx 28rpx;
	border-radius: 12rpx;
	font-weight: 600;
}
.usage-card{
	margin-top: 24rpx;
	padding-top: 18rpx;
	padding-bottom: 24rpx;
	padding-left: 36rpx;
	padding-right: 36rpx;
	position: relative;
}
.usage-header{
	display: flex;
	align-items: center;
	margin-top: 20rpx;
	margin-bottom: 50rpx;
}
.usage-title{
	font-size: 32rpx;
	color: #333;
	font-weight: 500;
}
.usage-arrow{
	font-size: 24rpx;
	color: #999;
}
.usage-body{
	display: flex;
	justify-content: space-around;
	align-items: center;
	padding: 8rpx 0 4rpx;
	margin-bottom: 40rpx;
}
.usage-item{
	text-align: center;
	min-width: 40%;
	display: flex;
	flex-direction: column;
	align-items: center;
	font-family: "WeChat Sans Std";
}
.usage-number{
	font-size: 58rpx;
	color: #000;
	font-weight: 600;
	margin-bottom: 8rpx;
}
.usage-label{
	margin-top: 4rpx;
	font-size: 28rpx;
	color: #999;
}
.usage-filter-pop{
	position: absolute;
	top: 86rpx;
	left: 36rpx;
	background-color: #fff;
	border-radius: 16rpx;
	box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.1);
	padding: 8rpx 0;
	min-width: 220rpx;
	z-index: 10;
}
.usage-filter-item{
	padding: 20rpx 32rpx;
	font-size: 28rpx;
	color: #333;
	display: flex;
	align-items: center;
	/* justify-content: space-between; */
}
.usage-filter-divider{
	height: 1rpx;
	background-color: #f0f0f0;
	margin: 0 24rpx;
}
.usage-filter-check{
	font-size: 28rpx;
	color: #2979ff;
	margin-left: 8rpx;
}

/* 配置卡片 */
.config-card{
	margin-top: 23rpx;
	padding-left: 36rpx;
	padding-right: 36rpx;
	padding-bottom:0rpx
}
.config-title{
	font-size: 32rpx;
	color: #000;
	margin-bottom: 36rpx;
	margin-top:  20rpx;
	font-weight: 500;
}
.config-item{
	padding-bottom: 20rpx;
	border-top: 1rpx solid #f0f0f0;
	display: flex;
	align-items: center;
	justify-content: space-between;
}
.config-item_{
	border-top: 1rpx solid #f0f0f0;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 40rpx 0;
}
.config-item-main{
	flex: 1;
}
.config-label{
	font-size: 34rpx;
	color: #000;
	/* font-weight: 500;s */
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin: 28rpx 0;
}
.config-label_{
	font-size: 34rpx;
	color: #000;
	/* font-weight: 500;s */
	display: flex;
	justify-content: space-between;
}
.config-member-row{
	margin-top: 20rpx;
	display: flex;
	align-items: center;
	margin-bottom: 10rpx;
/* 	justify-content: center;
	flex-direction: column; */
}
.member{
	display: flex;
	justify-content: center;
	flex-direction: column;
	margin-right: 20rpx;
}
.config-avatar{
	width: 86rpx;
	height: 86rpx;
	border-radius: 14rpx;
	/* margin-right: 18rpx; */
}
.config-member-name{
	margin-top: 14rpx;
	font-size: 22rpx;
	color: #999;
	text-align: center;
}
.config-subtext{
	/* margin-top: 12rpx; */
	display: block;
	font-size: 32rpx;
	color: #999;
}
.config-right{
	display: flex;
	align-items: center;
}
.config-tag{
	padding: 12rpx 16rpx;
	border-radius: 10rpx;
	background-color: #f5f5f5;
	font-size: 32rpx;
	color: #333;
	margin-right: 8rpx;
	font-weight: 500;
}
.config-arrow{
	width: 20rpx;
	margin-left: 8rpx;
}
.config-right-text{
	font-size: 28rpx;
	color: #999;
}

/* 字体调节弹窗样式 */
.font-modal-container{
	width: 80%;
	background-color: #fff;
	border-radius: 16rpx;
	padding: 32rpx;
}

.font-modal-title{
	font-size: 32rpx;
	font-weight: 600;
	margin-bottom: 24rpx;
	text-align: center;
}

.font-modal-body{
	padding: 20rpx 0;
}

.font-slider-row{
	display: flex;
	flex-direction: column;
	gap: 20rpx;
}

.font-label{
	font-size: 28rpx;
	color: #666;
}

.font-slider-wrapper{
	display: flex;
	flex-direction: column;
	gap: 12rpx;
}

.font-slider-wrapper slider{
	width: 100%;
}

.font-hint{
	font-size: 24rpx;
	color: #999;
	text-align: center;
}

.font-modal-actions{
	margin-top: 24rpx;
	display: flex;
	justify-content: center;
}
</style>