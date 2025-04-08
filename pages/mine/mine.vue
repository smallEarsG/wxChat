<template>
  <view class="container">
    <!-- 头像区域 -->
    <view class="avatar-box" @click="changeAvatar">
      <image :src="userInfo.avatar" class="avatar" />
    </view>

    <!-- 用户信息区域 -->
    <view class="info-box">
      <view class="row">
        <text class="label">昵称：</text>
        <text class="value" @click="editNickname">{{ userInfo.username }}</text>
      </view>
      <view class="row">
        <text class="label">会员等级：</text>
        <text class="value">{{ userInfo.isMember?"会员":"普通" }}<button class="btn-withdraw" @click="Recharge">充值</button></text>
      </view>
      <view class="row">
        <text class="label">会员过期时间：</text>
        <text class="value">{{ userInfo.memberExpireAt }}</text>
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
        <text class="label">积分：</text>
        <text class="value">{{ userInfo.points }}</text>
        <button class="btn-withdraw" @click="withdrawPoints">提现</button>
      </view>
    </view>

    <!-- 退出登录按钮 -->
    <button class="btn-logout" @click="logout">退出登录</button>
  </view>
</template>

<script>
	import { getUserInfo,updateUserInfo ,logout,withdraw,getPayMember,activateMember} from '@/api/index.js'
export default {
  data() {
    return {
      userInfo: {
        avatar: '/static/avatar-default.png', // 默认头像
        nickname: '小主',
        level: 'VIP1',
        expireDate: '2025-12-31', // 默认会员到期时间
        freeUsage: 5, // 默认免费使用次数
        invitationCode: 'ABC123', // 邀请码
        points: 100 // 积分
      }
    };
  },
   onLoad(){
 	  const userId = uni.getStorageSync('userId')
 	    this.getUserInfo(userId)  
   },
   methods: {
	 async  Recharge(){
		 const srt =  await  getPayMember(this.userInfo.id)
		 console.log(srt);
		 const res = await activateMember(this.userInfo.id)
		 console.log(res);
	  },
    // 从后端获取用户信息
	async getUserInfo(userId){
		  const res = await getUserInfo(userId)
		
		  console.log(res);
		   let  avatar 
		   if (res.data.avatar) {
		   	 avatar = 'http://106.15.137.235/'+res.data.avatar
		   }
		  this.userInfo = res.data
		 this.userInfo.avatar = avatar
		},
  

    // 更改头像
    changeAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          this.uploadAvatar(tempFilePath);
        }
      });
    },

    // 模拟上传头像
    uploadAvatar(filePath) {
      uni.showLoading({ title: '上传中...' });
      setTimeout(() => {
        this.userInfo.avatar = filePath; // 模拟更改头像
        uni.hideLoading();
        uni.showToast({
          title: '头像更新成功',
          icon: 'success'
        });
      }, 1000);
    },

    // 修改昵称
    editNickname() {
      uni.showModal({
        title: '修改昵称',
        editable: true,
        placeholderText: '请输入新的昵称',
        success: (res) => {
          if (res.confirm && res.content) {
            this.userInfo.nickname = res.content;
            uni.showToast({
              title: '昵称更新成功',
              icon: 'success'
            });
          }
        }
      });
    },

    // 积分提现
    withdrawPoints() {
      uni.showModal({
        title: '积分提现',
        content: `您当前有 ${this.userInfo.points} 积分，确定要全部提现吗？`,
        success: async (res) => {
          if (res.confirm) {
			uni.showLoading({ title: '提现中...' });
            // 模拟提现操作
			const form = {
				points:this.userInfo.points,
				userId :this.userInfo.id,
				alipayAccount:"vdoecw6799@sandbox.com",
				realName:"vdoecw6799"
			}
			 const svl =  await withdraw(form)
			 console.log(svl);
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
}
.label {
  font-size: 14px;
  color: #666;
}
.value {
  font-size: 16px;
  color: #333;
}
.value:hover {
  color: #007AFF;
}

/* 提现按钮 */
.btn-withdraw {
  background-color: #007AFF;
  color: #fff;
  border-radius: 5px;
  padding: 5px 10px;
  font-size: 14px;
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