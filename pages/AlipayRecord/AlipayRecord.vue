<template>
	<view class="container">
		<!-- 全局水印层 -->
		<WatermarkLayer />
		
		<!-- 内容区域 -->
		<view class="content">
			<uni-swipe-action>
				<uni-swipe-action-item v-for="(item,index) in list" :key="index" :right-options="options"
					:auto-close="false" @click="bindClick(index)">
					
					<view class="content-box">
						<uni-list-chat 
							:avatar-circle="true" 
							:title="item.info.transferName || item.info.name" 
							:avatar="item.info.url || '/static/paySe.png'"
							:note="formatNote(item.info)" 
							:clickable="true" 
							@click="goPage(item)">
						</uni-list-chat>
					</view>
				</uni-swipe-action-item>
			</uni-swipe-action>
			
			<!-- 空状态提示 -->
			<view class="empty-state" v-if="list.length === 0">
				<uni-icons type="chatbubble" size="60" color="#ccc" />
				<text class="empty-text">暂无记录</text>
			</view>
		</view>
	</view>
</template>

<script>
	import { queryBillList, deleteBill } from '@/api'
	
	export default {
		data() {
			return {
				statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
				options: [
					{
						text: '删除',
						style: {
							backgroundColor: '#F56C6C'
						}
					}
				],
				list: []
			};
		},
		onLoad() {
			this.loadBillList();
		},
		onShow() {
			// 页面显示时重新加载记录
			this.loadBillList();
		},
		methods: {
			// 从云端加载支付宝账单列表
			async loadBillList() {
				try {
					const userId = uni.getStorageSync('userId');
					if (!userId) {
						uni.showToast({
							title: '用户未登录',
							icon: 'none'
						});
						this.list = [];
						return;
					}
					
					const result = await queryBillList(userId, 'alipay');
					
					let billList = [];
					if (result && result.data && Array.isArray(result.data)) {
						billList = result.data;
					} else if (Array.isArray(result)) {
						billList = result;
					}
					
					this.list = billList.map(bill => {
						let info = {};
						try {
							if (bill.billDetail) {
								info = JSON.parse(bill.billDetail);
							}
						} catch (e) {
							console.error('解析账单详情失败:', e);
							info = {};
						}
						
						const billType = bill && bill.billType !== undefined ? bill.billType : undefined;
						const typeNum = typeof billType === 'number' ? billType : parseInt(String(billType || ''), 10);
						const safeType = Number.isFinite(typeNum) ? typeNum : 1;
						
						return {
							type: safeType,
							info: {
								...info,
								id: bill.id,
								billType: billType
							}
						};
					});
					
					// 按时间倒序（如果 info 中带有时间）
					this.list.sort((a, b) => {
						const timeA = a.info?.createTime || a.info?.time || '';
						const timeB = b.info?.createTime || b.info?.time || '';
						return timeB.localeCompare(timeA);
					});
				} catch (error) {
					console.error('加载账单列表失败:', error);
					uni.showToast({
						title: '加载账单列表失败',
						icon: 'none'
					});
					this.list = [];
				}
			},
			
			// 删除记录（云端删除）
			async bindClick(index) {
				const item = this.list[index];
				if (!item || !item.info || !item.info.id) {
					uni.showToast({
						title: '账单ID不存在',
						icon: 'none'
					});
					return;
				}
				
				const billId = item.info.id;
				
				uni.showModal({
					title: '提示',
					content: '确定要删除这条记录吗？',
					success: async (res) => {
						if (!res.confirm) return;
						
						try {
							const result = await deleteBill(billId);
							
							if (result && result.code === 200) {
								this.list.splice(index, 1);
								uni.showToast({
									title: '删除成功',
									icon: 'success'
								});
							} else {
								const message = result?.message || '删除失败';
								uni.showToast({
									title: message,
									icon: 'none'
								});
							}
						} catch (error) {
							console.error('删除账单失败:', error);
							uni.showToast({
								title: '删除失败，请重试',
								icon: 'none'
							});
						}
					}
				});
			},
			
			// 格式化备注信息
			formatNote(info) {
				if (!info) return '';
				const parts = [];
				if (info.money) {
					parts.push(`金额: ¥${info.money}`);
				}
				if (info.createTime || info.time) {
					parts.push(`时间: ${info.createTime || info.time}`);
				}
				return parts.join(' | ') || '第三方支付';
			},
			
			// 跳转到详情模板页（根据 billType 1..6）
			goPage(item) {
				const info = item && item.info ? item.info : null;
				if (!info || !info.id) {
					uni.showToast({ title: '账单ID不存在', icon: 'none' });
					return;
				}
				
				const billType = info.billType;
				const typeNum = typeof billType === 'number' ? billType : parseInt(String(billType || ''), 10);
				
				const routeMap = {
					1: '/pages/billDetail/billDetail',
					2: '/pages/ailpayThirdpartyPayment/ailpayThirdpartyPayment',
					3: '/pages/ailpayThirdpartyPaymentAnd/ailpayThirdpartyPaymentAnd',
					4: '/pages/billDetail2/billDetail2',
					5: '/pages/billDetail3/billDetail3',
					6: '/pages/ailpayThirdpartyPaymentAnd6/alipayThirdpartyPaymentAnd6'
				};
				
				const targetRoute = routeMap[typeNum] || routeMap[1];
				const url = `${targetRoute}?billId=${encodeURIComponent(String(info.id))}`;
				uni.navigateTo({ url });
			}
		}
	}
</script>

<style>
	.container {
		background-color: #fff;
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		box-sizing: border-box;
	}

	/* 内容区域 */
	.content {
		flex: 1;
		overflow-y: auto;
		background-color: #fff;
		padding-bottom: 20rpx;
	}

	.content-box {
		display: flex;
		background-color: #fff;
		height: 152rpx;
	}

	/* 空状态 */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 200rpx 0;
	}

	.empty-text {
		margin-top: 30rpx;
		font-size: 28rpx;
		color: #999;
	}
</style>

