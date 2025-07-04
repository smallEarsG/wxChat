export default {
	data() {
		return {
			currentActionIndex: -1, // 添加当前操作的消息索引
			activeMsgIndex: -1, // 当前激活的消息索引
			total: 108,
			emoji: false,
			isIos: false,
			statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
			featureList: [{
					name: 'order',
					label: '订单',
					icon: '/static/icon-order.png'
				},
				{
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
				}

			],
			timeInfo: {
				time: ""
			},
			timeKey: {
				time: "时间"
			},
			editMsgInfo: {
				msg: "11"
			},
			editMsgKey: {
				msg: "编辑消息"
			},
			msgInfo: {
				msg: ""
			},
			msgKey: {
				msg: "消息"
			},
		}
	},
	computed: {
		scale() {
			return this.$store.state.scale
		},
		// 封装样式辅助函数（你也可以直接在模板用）
		rpx() {
			return (v) => `${v * this.scale}rpx`
		},
		px() {
			return (v) => `${v * this.scale}px`
		}
	},
	methods: {
		changeMsg() {
			// 保存当前编辑的消息索引
			this.editMsgIndex = this.activeMsgIndex;
		
			// 获取当前消息内容
			// this.editMsgInfo.msg =;
			this.editMsgInfo = {
				...this.editMsgInfo,
				msg: this.massageList[this.editMsgIndex].content
			}; // 更新数据
			// 打开编辑弹窗
			this.$refs.editMsgPopup.open();
		
			// 关闭弹出菜单
			this.activeMsgIndex = -1;
			this.popupVisible = false;
		},
		onEditMsgSubmit(data) {
			if (this.editMsgIndex !== -1 && data.msg.trim()) {
				// 更新消息内容
				this.massageList[this.editMsgIndex].content = data.msg;
		
				// 更新消息
				this.updateMsg&&this.updateMsg();
		
				// 显示成功提示
				uni.showToast({
					title: '消息编辑成功',
					icon: 'success'
				});
			}
		
			// 重置编辑索引
			this.editMsgIndex = -1;
		},
		addMsgSubmit(data) {
			console.log(data.msg);
			this.addMsgcomm(data.msg)
			this.$refs.bottomPopup && this.$refs.bottomPopup.close()
		},
		addMsg(index) {
			this.currentActionIndex = this.activeMsgIndex;
			this.$refs.msgPopup.open()
			this.$refs.bottomPopup && this.$refs.bottomPopup.close()
			this.activeMsgIndex = -1; // 清除激活状态
		},
		// 新增时间插入功能
		insertTime(index) {
			this.currentActionIndex = this.activeMsgIndex;
			this.$refs.timePopup.open()
			this.activeMsgIndex = -1;
			// 显示时间确认弹窗
			this.timePopupVisible = true;
			this.$refs.bottomPopup && this.$refs.bottomPopup.close()
			// this.$refs.msgPopup && this.$refs.msgPopup.close()
		},
		
		// 取消插入时间
		cancelInsertTime() {
			this.timePopupVisible = false;
			this.activeMsgIndex = -1;
			this.popupVisible = false;
		},
		getEmojiUrl(index, location = 0) {
			return location == 0 ? `/static/emoji/emoji_${index}.png` : `/static/emoji/emoji_${index}_blue.png`;
		},
		parseMessage(msg) {
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
		},
		changeEmoji() {
			this.openPopup = false
			this.emoji = !this.emoji
		},
		// 添加表情到输入框的方法
		addEmojiToInput(index) {
			// 构建表情标签，例如[smile]
			this.inputValue += `[emoji_${index}]`;
		},
		goBack() {
			uni.navigateBack();
		},
		togglePopupBox() {
			this.openPopup = !this.openPopup;
			this.emoji = false
		},
		getSafeAreaInsetBottom() {
			const systemInfo = uni.getSystemInfoSync();

			// iOS 设备且有安全区域信息
			if (systemInfo.platform === 'ios' && systemInfo.safeArea) {
				return systemInfo.screenHeight - systemInfo.safeArea.bottom;
			}

			// Android 设备通常没有安全区域问题，返回 0
			return 0;
		},
	}

}