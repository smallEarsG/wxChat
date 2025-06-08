<template>
	<view class="container">
		
		<!-- 头像区域 -->
		<view class="avatar-box" @click="changeAvatar">
			<image :src="'http://106.15.137.235:8080/upload/'+userInfo.avatar" class="avatar" />
		</view>

		<!-- 用户信息区域 -->
		<view class="info-box">
			<view class="row">
				<text class="label">昵称：</text>
				<text class="value" @click="editNickname">{{ userInfo.username }}</text>
			</view>
			<view class="row">
				<text class="label">会员等级：</text>
				<view class="value chongzhi">
					<view>{{_isMemberExpired(userInfo)?"普通":"会员" }}</view><button class="btn-withdraw"
						@click="Recharge">充值</button>
				</view>
			</view>
			<view class="row">
				<text class="label">会员过期时间：</text>
				<text class="value">{{ userInfo.memberExpireAt?formatDate(userInfo.memberExpireAt):"--" }}</text>
			</view>
			<view class="row">
				<text class="label">剩余免费使用次数：</text>
				<text class="value">{{ userInfo.tryCount }} 次</text>
			</view>
			<view class="row">
				<text class="label">邀请码：</text>
				<text class="value">{{ userInfo.inviteCode }}</text>
			</view>
			<view class="row">
				<text class="label">管理员（微信同号）：</text>
				<text class="value">18216263971</text>
			</view>
			<view class="row tixian">
				<view class="">
					<text class="label">积分：</text>
					<text class="value">{{ userInfo.points }}</text>
				</view>
				<view class="">
					<button class="btn-withdraw" @click="withdrawPoints">提现</button>
				</view>
			</view>
		</view>

		<!-- 退出登录按钮 -->
		<button class="btn-logout" @click="logout">退出登录</button>
		<VipRechargeDialog ref="vipRecharge"  :show="payShow" @pay="pay" @close="Recharge"></VipRechargeDialog>
	</view>
</template>

<script>
	import {
		getUserInfo,
		updateUserInfo,
		logout,
		withdraw,
		getPayMember,
		activateMember
	} from '@/api/index.js'
	import VipRechargeDialog from '../../components/VipRechargeDialog/VipRechargeDialog.vue';
	import { isMemberExpired } from '@/utils/tool.js'
	import { BASE_URL } from '@/utils/request.js' 
	export default {
		components:{
			VipRechargeDialog
		},
		data() {
			return {
				payShow:false,
				userInfo: {
					// avatar: '/static/avatar-default.png', // 默认头像
					// nickname: '小主',
					// level: 'VIP1',
					// expireDate: '2025-12-31', // 默认会员到期时间
					// freeUsage: 5, // 默认免费使用次数
					// invitationCode: 'ABC123', // 邀请码
					// points: 100 // 积分
				}
			};
		},
		onShow(){
			
			const userId = uni.getStorageSync('userId')
			this.getUserInfo(userId)
		},
		methods: {
			 async pay(data){
				console.log(data);
			    let srt  // 订单信息 
				if(data === "year"){
					srt = await getPayMember(this.userInfo.id,108.00)
				}else{
					srt = await getPayMember(this.userInfo.id,9.90)
				}
			
				
				console.log(srt);
				// 验证返回数据的有效性
				if (!srt || !srt.data || typeof srt.data !== 'string') {
					console.error('支付订单信息无效', srt);
					uni.showToast({
						title: '获取支付信息失败',
						icon: 'none'
					});
					return;
				}
				
				// 试用次数用完后开始需要充值会员
				uni.requestPayment({
					provider: 'alipay',
					orderInfo: srt.data, // 来自后端接口返回的字符串
					success: async (res) => {
						uni.showToast({
							title: '支付成功'
						});
						// 你可以在这里刷新用户会员状态
						const resl = await activateMember(this.userInfo.id,data)
						// 跟新页面
						this.getUserInfo(this.userInfo.id)
						this.Recharge()
					},
					fail: function(err) {
						console.log('支付失败', err);
						uni.showToast({
							title: '支付失败',
							icon: 'none'
						});
					}
				});
				
			},
			_isMemberExpired(at){
				return isMemberExpired(at)
			},
			formatDate(dateString) {
				if (dateString == '--')return '--'
				const date = new Date(dateString);
				const year = date.getFullYear().toString(); // 获取年份的最后两位
				const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 获取月份，确保是两位
				const day = date.getDate().toString().padStart(2, '0'); // 获取日期，确保是两位

				return `${year}-${month}-${day}`; // 格式化为 yy-mm-dd
			},
			 Recharge() {
				// this.$refs.vipRecharge.open()
				this.payShow = !this.payShow 
			},
			// 从后端获取用户信息
			async getUserInfo(userId) {
				console.log("执行用户信息获取");
				const res = await getUserInfo(userId)
				
				console.log(userId,"==",res);
				
				this.userInfo = res.data
				
			},


			// 更改头像
			changeAvatar() {
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						const tempFilePath = res.tempFilePaths[0];
						// this.uploadAvatar(tempFilePath);
						this.updateUserWithAvatar({},tempFilePath)
					}
				});
			},

			// 模拟上传头像
			// uploadAvatar(filePath) {
				// uni.showLoading({
				// 	title: '上传中...'
				// });
				
				
				// setTimeout(() => {
				// 	this.userInfo.avatar = filePath; // 模拟更改头像
				// 	uni.hideLoading();
				// 	uni.showToast({
				// 		title: '头像更新成功',
				// 		icon: 'success'
				// 	});
				// }, 1000);
			// },
			 updateUserWithAvatar( formData, filePath) {
			
			
			  if (filePath) {
			    // 如果选择了头像，使用 uploadFile 上传头像 + 表单数据
			    uni.uploadFile({
			      url: `${BASE_URL}/user/update/${this.userInfo.id}`,
			      filePath, // 本地头像路径
			      name: 'avatar', // 对应后端 MultipartFile 参数名
			      formData,
			      success: (res) => {
			        this.handleResponse(res);
			      },
			      fail: (err) => {
			        console.error('上传失败：', err);
			        uni.showToast({ title: '网络异常', icon: 'none' });
			      }
			    });
			  } else {
			    // 如果没有头像，只提交普通表单字段
			    uni.request({
			      url: `${BASE_URL}/user/update/${this.userInfo.id}`,
			      method: 'POST',
			      header: {
			        'Content-Type': 'application/x-www-form-urlencoded'
			      },
			      data: formData,
			      success: (res) => {
			        this.handleResponse(res);
			      },
			      fail: (err) => {
			        console.error('请求失败：', err);
			        uni.showToast({ title: '网络异常', icon: 'none' });
			      }
			    });
			  }
			
			
			},

  // 响应处理封装
			  handleResponse(res) {
				  console.log("修改结果",res);
			    let result;
			    try {
			      result = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
			    } catch (e) {
			      uni.showToast({ title: '解析失败', icon: 'none' });
			      return;
			    }
			
			    if (result.code === 200 || result.code === 0) {
			      uni.showToast({ title: '更新成功', icon: 'success' });
			    } else {
			      uni.showToast({ title: result.message || '更新失败', icon: 'none' });
			    }
				this.getUserInfo(this.userInfo.id)
			  },
			// 修改昵称
			editNickname() {
				uni.showModal({
					title: '修改昵称',
					editable: true,
					placeholderText: '请输入新的昵称',
					success: (res) => {
						if (res.confirm && res.content) {
							// this.userInfo.nickname = res.content;
							this.updateUserWithAvatar({username: res.content})
							// uni.showToast({
							// 	title: '昵称更新成功',
							// 	icon: 'success'
							// });
						}
					}
				});
			},

			// 积分提现
			withdrawPoints() {
				if(this.userInfo.points   )
				uni.showModal({
					title: '积分提现',
					content: `您当前有 ${this.userInfo.points} 积分，确定要全部提现吗？`,
					success: async (res) => {
						if (res.confirm) {
							uni.showLoading({
								title: '提现中...'
							});
							// 模拟提现操作
							const form = {
								points: this.userInfo.points,
								userId: this.userInfo.id,
								alipayAccount: "18216267971",
								realName: "郭治金"
							}
							console.log("svl");
							const svl = await withdraw(form)
							console.log("svl",svl);
							uni.hideLoading();

						}
					}
				});
			},

			// 退出登录
			logout() {
				uni.showModal({
					title: '确认退出',
					content: '您确定要退出登录吗？',
					success: (res) => {
						if (res.confirm) {
							// 清除 token
							uni.removeStorageSync('token');
							logout(this.userInfo.id)
							uni.reLaunch({
								url: '/pages/login/login'
							});
						}
					}
				});
			}
		}
	};
</script>

<style>
	/* 页面布局 */
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-top: 50px;
		background-color: #f5f5f5;
		position: absolute;
		top: 0;
		right: 0;
		left: 0;
		bottom: 0;
	}

	/* 头像区域 */
	.avatar-box {
		width: 120px;
		height: 120px;
		border-radius: 50%;
		overflow: hidden;
		margin-bottom: 20px;
		border: 2px solid #ddd;
	}

	.avatar {
		width: 100%;
		height: 100%;
	}

	/* 用户信息区域 */
	.info-box {
		width: 80%;
		background-color: #fff;
		padding: 15px;
		border-radius: 10px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 15px;
		align-items: center;
	}

	.label {
		font-size: 14px;
		color: #666;
	}

	.value {
		font-size: 16px;
		color: #333;

		/* background-color: #FF3B30; */
	}

	.chongzhi {
		display: flex;
		/* width: 200rpx; */
		text-align: center;
		align-items: center;
	}

	/* .value:hover {
  color: #007AFF;
} */


	/* 提现按钮 */
	.btn-withdraw {
		background-color: #007AFF;
		color: #fff;
		border-radius: 5rpx;
		padding: 8rpx 20rpx;
		margin-left: 10rpx;
		font-size: 22rpx;
	}

	.tixian {
		width: 100%;
		/* display: flex; */
		justify-content: space-between;
		/* background-color: #007AFF; */
	}

	/* 退出登录按钮 */
	.btn-logout {
		width: 80%;
		padding: 12px;
		margin-top: 20px;
		background-color: #FF3B30;
		color: #fff;
		border-radius: 5px;
		text-align: center;
	}
</style>