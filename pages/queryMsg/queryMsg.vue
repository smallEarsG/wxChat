<template>
	<view class="container">
		<view class="custom-header" :style="{ paddingTop: statusBarHeight + 'px' }">
			<uni-search-bar @confirm="search" :focus="true" v-model="searchValue" @blur="blur" @focus="focus" @input="search"
							@cancel="cancel" @clear="clear" >
						</uni-search-bar>
		</view>
		<view class="content">
			<view class="roleList">
				<uni-swipe-action>
					<uni-swipe-action-item v-for="item in msgList" :right-options="options" :auto-close="false"
						@click="bindClick">
		
						<view class="content-box">
							<uni-list-chat :title="item.name"
								:avatar="item.avatarUrl" :note="'[图片]'"
								:time="item.createdAt" @click="goChat(item)" :clickable="true"></uni-list-chat>
						</view>
					</uni-swipe-action-item>
				</uni-swipe-action>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		searchConversationsByName
	} from '@/api/conversations.js'
	export default {
		data() {
			return {
				statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
				searchValue:'',
				msgList:[]
			}
		},
		methods: {
			async search(v){
				if(v ==='' || v.trim() =='') {
					this.msgList = []
					return
				}
				const userId = uni.getStorageSync('userId')
				const res = await searchConversationsByName(userId,v,'chat')
				this.msgList = res.data
			},
			cancel(){
				uni.navigateBack();
			},
			goChat(item) {
				console.log(item);
				uni.navigateTo({
					url: '/pages/chat/chat?guestInfo=' + encodeURIComponent(JSON.stringify(item))
				});
			},
			
		}
	}
</script>

<style>
	.content{
		overflow: auto;
		background-color: antiquewhite;
		flex: 1;
	}
	.container{
		background-color: #fff;
		height: 100vh;
		display: flex;
		/* width: 100vw; */
		flex-direction: column;
	}

</style>
