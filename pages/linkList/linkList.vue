<template>
	<view class="container">
		<image src="/static/chat/ll_head.png" mode="widthFix"></image>
		<view class="contant">
			<image src="/static/chat/ll_select.png" mode="widthFix"></image>
			<view class="add-warp" v-for="item in list" :key="item.id" @click="goLinkInfo(item)">
				<view style="width: 70rpx;overflow: hidden;border-radius:10rpx;margin-right: 22rpx;">
					<image  src="/static/chat/h2.png" mode="widthFix"></image>
				</view>
				<view style="font-size: 32rpx;">{{ item.name }}</view>
			</view>
		</view>
		<!-- 左上返回 -->
		<view class="back-btn" @click="goBack" />
		<!-- 右上添加 -->
		<view class="add-btn" @click="openAddModal" />	
		
		<!-- 新增链接弹框 -->
		<view v-if="showAddModal" class="modal-mask">
			<view class="modal-container">
				<view class="modal-title">新增获客链接</view>
				<view class="modal-field">
					<text class="field-label">名称</text>
					<input class="field-input" v-model="newItem.name" placeholder="请输入名称" />
				</view>
				<view class="modal-field">
					<text class="field-label">链接地址</text>
					<input class="field-input" v-model="newItem.addUrl" placeholder="请输入链接地址" />
				</view>
				<view class="field-row">
					<view class="modal-field half">
						<text class="field-label">新增人数</text>
						<input class="field-input" type="number" v-model.number="newItem.addNum" placeholder="0" />
					</view>
					<view class="modal-field half">
						<text class="field-label">打开次数</text>
						<input class="field-input" type="number" v-model.number="newItem.openLink" placeholder="0" />
					</view>
				</view>
				<view class="field-row">
					<view class="modal-field half">
						<text class="field-label">上次新增人数</text>
						<input class="field-input" type="number" v-model.number="newItem.lastAddNum" placeholder="0" />
					</view>
					<view class="modal-field half">
						<text class="field-label">上次打开次数</text>
						<input class="field-input" type="number" v-model.number="newItem.lastOpenLink" placeholder="0" />
					</view>
				</view>
				<view class="modal-field">
					<text class="field-label">标签（逗号分隔）</text>
					<input class="field-input" v-model="newItemTagInput" placeholder="例如：一般,重要" />
				</view>
				<view class="modal-field">
					<text class="field-label">时间</text>
					<input class="field-input" v-model="newItem.time" placeholder="例如：1月28日" />
				</view>
				<view class="modal-field">
					<text class="field-label">欢迎语</text>
					<input class="field-input" v-model="newItem.welcomeText" placeholder="请输入欢迎语" />
				</view>
				<view class="modal-field">
					<text class="field-label">成员列表</text>
					<view v-if="newMembers && newMembers.length" class="member-list">
						<view v-for="(m, idx) in newMembers" :key="idx" class="member-item">
							<view class="member-avatar">
								<image :src="m.avatar" mode="aspectFill"></image>
							</view>
							<view class="member-name">{{ m.name }}</view>
							<view class="member-remove" @click="removeMember(idx)">删除</view>
						</view>
					</view>
					<view class="member-add-row">
						<input class="field-input member-input" v-model="newMemberName" placeholder="成员名称" />
						<view class="avatar-row">
							<view v-if="newMemberAvatar" class="avatar-preview">
								<image :src="newMemberAvatar" mode="aspectFill"></image>
							</view>
							<view class="avatar-btn" @click="chooseMemberAvatar">头像</view>
						</view>
						<view class="member-add-btn" @click="addMember">添加成员</view>
					</view>
				</view>
				<view class="modal-actions">
					<view class="btn cancel" @click="closeAddModal">取消</view>
					<view class="btn confirm" @click="submitNewItem">确定</view>
				</view>
			</view>
		</view>
		
	</view>
</template>

<script>
	export default {
		data() {
			return {
				list: [],
				defaultList: [
					{
						id: 1,
						name: '5.27外链',
						addUrl:"https://work.weixin.qq.com/ca/cawcde73cc8a009656",
						addNum:0,
						openLink:0,
						lastAddNum:0,
						lastOpenLink:0,
						tag:["一般","重要"],
						time:"1月28日",
						welcomeText:"欢迎使用5.27外链",
						member:[
							{
								avatar:"/static/chat/li_file.png",
								name:"张三",
							
							}
						]
		
					}
				],
				showAddModal: false,
				newItem: {
					name: '',
					addUrl: '',
					addNum: 0,
					openLink: 0,
					lastAddNum: 0,
					lastOpenLink: 0,
					time: '',
					welcomeText: ''
				},
				newItemTagInput: '',
				newMembers: [],
				newMemberName: '',
				newMemberAvatar: ''
			}
		},
		onShow() {
			const storageKey = 'linkList';
			try {
				const stored = uni.getStorageSync(storageKey);
				if (stored && Array.isArray(stored)) {
					this.list = stored;
				} else {
					this.list = this.defaultList;
				}
			} catch (e) {
				this.list = this.defaultList;
			}
		},
		methods: {
			goBack() {
				uni.navigateBack();
			},
			goLinkInfo(item) {
				uni.navigateTo({
					url: `/pages/linkInfo/linkInfo?id=${item.id}`
				});
			},
			openAddModal() {
				// 以第一条默认数据作为模板，打开弹框时带出默认值
				const tmpl = this.defaultList && this.defaultList.length
					? this.defaultList[0]
					: {
						name: '',
						addUrl: '',
						addNum: 0,
						openLink: 0,
						lastAddNum: 0,
						lastOpenLink: 0,
						tag: [],
						time: '',
						welcomeText: '',
						member: []
					};
				this.showAddModal = true;
				this.newItem = {
					name: tmpl.name || '',
					addUrl: tmpl.addUrl || '',
					addNum: tmpl.addNum || 0,
					openLink: tmpl.openLink || 0,
					lastAddNum: tmpl.lastAddNum || 0,
					lastOpenLink: tmpl.lastOpenLink || 0,
					time: tmpl.time || '',
					welcomeText: tmpl.welcomeText || ''
				};
				this.newItemTagInput = (tmpl.tag && tmpl.tag.length) ? tmpl.tag.join(',') : '';
				this.newMembers = tmpl.member ? JSON.parse(JSON.stringify(tmpl.member)) : [];
				this.newMemberName = '';
				this.newMemberAvatar = '';
			},
			closeAddModal() {
				this.showAddModal = false;
			},
			chooseMemberAvatar() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						if (res.tempFilePaths && res.tempFilePaths.length > 0) {
							this.newMemberAvatar = res.tempFilePaths[0];
						}
					}
				});
			},
			addMember() {
				if (!this.newMemberName) {
					uni.showToast({
						title: '请填写成员名称',
						icon: 'none'
					});
					return;
				}
				this.newMembers.push({
					avatar: this.newMemberAvatar || '/static/chat/li_file.png',
					name: this.newMemberName
				});
				this.newMemberName = '';
				this.newMemberAvatar = '';
			},
			removeMember(index) {
				this.newMembers.splice(index, 1);
			},
			submitNewItem() {
				if (!this.newItem.name) {
					uni.showToast({
						title: '请填写名称',
						icon: 'none'
					});
					return;
				}
				const id = Date.now();
				const member = this.newMembers && this.newMembers.length ? this.newMembers : [];
				const tag = this.newItemTagInput
					? this.newItemTagInput.split(',').map(t => t.trim()).filter(t => t)
					: [];
				const item = {
					id,
					name: this.newItem.name,
					addUrl: this.newItem.addUrl || '',
					addNum: this.newItem.addNum || 0,
					openLink: this.newItem.openLink || 0,
					lastAddNum: this.newItem.lastAddNum || 0,
					lastOpenLink: this.newItem.lastOpenLink || 0,
					tag,
					time: this.newItem.time || '',
					welcomeText: this.newItem.welcomeText || '',
					member
				};
				this.list.push(item);
				try {
					uni.setStorageSync('linkList', this.list);
				} catch (e) {}
				this.showAddModal = false;
			}
		}
	}
</script>

<style>
	.add-warp {
		display: flex;
		align-items: center;
		background-color:#fff;
		padding: 30rpx;
		border-radius: 16rpx;
		margin: 24rpx;
		margin-top: 1rpx;
		margin-bottom: 16rpx;
	}
	
	.contant{
		flex: 1;
		overflow: auto;
		background-color: #edf0f5;
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
	}
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
		z-index: 10;
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
</style>