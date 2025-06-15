<template>
    <view class="receipt-container">
        <!-- 顶部返回箭头 -->
        <view class="back-arrow" @click="goBack" :style="{ paddingTop: statusBarHeight + 'px' }">
            <uni-icons type="arrow-left" size="30"></uni-icons>
        </view>
        
        <!-- 状态信息 -->
        <image class="clock-icon" src="/static/qiw/success.png"></image>
        <text class="status-text">已收款</text>
        
        <!-- 点击金额触发编辑弹窗 -->
        <view class="money-container" @click="showEditModal">
            <view class="money-text">￥<text style="font-family: WeChat Sans Std;">{{info.amount}}</text></view>
        </view>
        
        <text class="tip-text">资金已存入企业账户</text>
        
        <!-- 信息展示区域 -->
        <view class="info-container">
            <view class="info-item">
                <text class="info-label">入账商户</text>
                <text class="info-value">{{info.name}}</text>
            </view>
            <view class="info-item">
                <text class="info-label">收款说明</text>
                <view class="info-value" style="display: flex;align-items: center;">
                    {{info.remark}}  
                    <image class="exit-icon" src="/static/qiw/exit.png"></image>
                </view>
            </view>
            <view class="info-item">
                <text class="info-label">转账时间</text>
                <text class="info-value">{{info.transferTime}}</text>
            </view>
            <view class="info-item">
                <text class="info-label">收款时间</text>
                <text class="info-value">{{info.collectionTime}}</text>
            </view>
            <view class="info-item">
                <text class="info-label">交易账单</text>
                <view class="info-value" style="display: flex;flex-direction: column;">
                    <text>{{info.tradeNo}}</text>
                    <image class="lineCode" src="/static/qiw/lineCode.png" mode=""></image>
                </view>
            </view>
        </view>
        
        <!-- 编辑弹窗 -->
        <view class="modal-mask" v-show="showModal" @click="hideEditModal"></view>
        <view class="edit-modal" :class="{ 'modal-show': showModal }">
            <view class="modal-header">
                <text class="modal-title">编辑收款信息</text>
                <view class="close-btn" @click="hideEditModal">
                    <uni-icons type="closeempty" size="30"></uni-icons>
                </view>
            </view>
            
            <view class="modal-content">
                <view class="form-item">
                    <text class="form-label">金额</text>
                    <input class="form-input" type="digit" v-model="editInfo.amount" placeholder="请输入金额">
                </view>
                <view class="form-item">
                    <text class="form-label">入账商户</text>
                    <input class="form-input" v-model="editInfo.name" placeholder="请输入商户名称">
                </view>
                <view class="form-item">
                    <text class="form-label">收款说明</text>
                    <input class="form-input" v-model="editInfo.remark" placeholder="请输入说明">
                </view>
                <view class="form-item">
                    <text class="form-label">转账时间</text>
					  <input class="form-input" v-model="editInfo.transferTime" placeholder="请输入转账时间">
                    <!-- <picker mode="datetime" :value="formatDateTime(editInfo.transferTime)" @change="updateTransferTime">
                        <view class="picker">{{editInfo.transferTime}}</view>
                    </picker> -->
                </view>
                <view class="form-item">
                    <text class="form-label">收款时间</text>
					 <input class="form-input" v-model="editInfo.collectionTime" placeholder="请输入收款时间">
                    <!-- <picker mode="datetime" :value="formatDateTime(editInfo.collectionTime)" @change="updateCollectionTime">
                        <view class="picker">{{editInfo.collectionTime}}</view>
                    </picker> -->
                </view>
                <view class="form-item">
                    <text class="form-label">交易单号</text>
                    <input class="form-input" v-model="editInfo.tradeNo" placeholder="请输入交易单号">
                </view>
            </view>
            
            <view class="modal-footer">
                <button class="cancel-btn" @click="hideEditModal">取消</button>
                <button class="save-btn" @click="saveEdit">保存</button>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            statusBarHeight: uni.getSystemInfoSync().statusBarHeight,
            info: {
                amount: '1.00',
                name: '乐之享保健',
                remark: '2',
                transferTime: '2025年06月14日 21:14:51',
                collectionTime: '2025年06月14日 21:15:09',
                tradeNo: '4200002685202506148190459347'
            },
            editInfo: {}, // 编辑时的临时数据
            showModal: false // 是否显示弹窗
        };
    },
    onLoad(options) {
        console.log(options);
        try {
            const Info = JSON.parse(decodeURIComponent(options.info));
            this.info = {
                ...this.info,
                ...Info
            };
        } catch (e) {
            console.error('解析参数失败', e);
        }
        // 初始化编辑数据
        this.resetEditInfo();
    },
    methods: {
        // 返回上一页
        goBack() {
            uni.navigateBack({
                delta: 1
            });
        },
        
        // 显示编辑弹窗
        showEditModal() {
            this.resetEditInfo();
            this.showModal = true;
            // 添加动画效果
            setTimeout(() => {
                this.$nextTick(() => {
                    const modal = document.querySelector('.edit-modal');
                    if (modal) {
                        modal.classList.add('modal-show');
                    }
                });
            }, 10);
        },
        
        // 隐藏编辑弹窗
        hideEditModal() {
            this.showModal = false;
        },
        
        // 重置编辑数据
        resetEditInfo() {
            this.editInfo = JSON.parse(JSON.stringify(this.info));
        },
        
        // 格式化日期时间为picker组件需要的格式
        formatDateTime(dateTime) {
            if (!dateTime) return '';
            // 转换"2025年06月14日 21:14:51"为"2025-06-14 21:14:51"
            return dateTime.replace('年', '-').replace('月', '-').replace('日', ' ');
        },
        
        // 更新转账时间
        updateTransferTime(e) {
            // 转换"2025-06-14 21:14:51"为"2025年06月14日 21:14:51"
            this.editInfo.transferTime = e.detail.value.replace('-', '年').replace('-', '月') + '日';
        },
        
        // 更新收款时间
        updateCollectionTime(e) {
            // 转换"2025-06-14 21:14:51"为"2025年06月14日 21:14:51"
            this.editInfo.collectionTime = e.detail.value.replace('-', '年').replace('-', '月') + '日';
        },
        
        // 保存编辑
        saveEdit() {
            // 简单验证
            if (!this.editInfo.amount) {
                uni.showToast({
                    title: '金额不能为空',
                    icon: 'none'
                });
                return;
            }
            
            // 更新数据
            this.info = JSON.parse(JSON.stringify(this.editInfo));
            this.hideEditModal();
            
            // 显示保存成功提示
            uni.showToast({
                title: '修改成功',
                icon: 'success'
            });
        }
    }
};
</script>


<style scoped>
.receipt-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 40rpx;
}

.back-arrow {
    align-self: flex-start;
    color: #000;
    margin-bottom: 80rpx;
}

.clock-icon {
    margin-top: 36rpx;
    width: 100rpx;
    height: 100rpx;
    margin-bottom: 60rpx;
}

.status-text {
    font-size: 34rpx;
    color: #333;
    margin-bottom: 30rpx;
}

.money-container {
    position: relative;
    margin-bottom: 30rpx;
    cursor: pointer; /* 添加光标样式提示可点击 */
}

.money-text {
    font-family: 'WeChat Sans Std';
    font-size: 98rpx;
    color: #000;
    font-weight: 400;
}

.edit-hint {
    position: absolute;
    right: 0;
    bottom: 0;
    font-size: 24rpx;
    color: #999;
}

.tip-text {
    font-size: 30rpx;
    color: #999;
    margin-bottom: 80rpx;
}

.info-container {
    width: 100%;
}

.info-item {
    display: flex;
    width: 100%;
    margin-bottom: 30rpx;
}

.info-label {
    width: 160rpx;
    font-size: 14px;
    color: #666;
}

.info-value {
    font-size: 14px;
    color: #333;
    text-align: left;
}

.exit-icon {
    width: 28rpx;
    height: 28rpx;
    margin-left: 10rpx;
}

.lineCode {
    width: 45rpx;
    height: 45rpx;
}

/* 弹窗样式 */
.modal-mask {
    position: fixed;
    z-index: 998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.modal-mask[style*="display: block"] {
    opacity: 1;
}

.edit-modal {
    position: fixed;
    z-index: 999;
    bottom: -100%;
    left: 0;
    width: 100%;
    background-color: #fff;
    border-radius: 30rpx 30rpx 0 0;
    transition: bottom 0.3s ease;
    max-height: 80vh;
    overflow: hidden;
}

.modal-show {
    bottom: 0;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx 40rpx;
    border-bottom: 1rpx solid #eee;
}

.modal-title {
    font-size: 36rpx;
    font-weight: bold;
    color: #333;
}

.close-btn {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-content {
    padding: 20rpx 40rpx;
    max-height: calc(80vh - 200rpx);
    overflow-y: auto;
}

.form-item {
    display: flex;
    align-items: center;
    padding: 30rpx 0;
    border-bottom: 1rpx solid #eee;
}

.form-label {
    width: 200rpx;
    font-size: 30rpx;
    color: #666;
}

.form-input {
    flex: 1;
    font-size: 30rpx;
    color: #333;
    height: 60rpx;
    padding: 0 20rpx;
}

.picker {
    flex: 1;
    font-size: 30rpx;
    color: #333;
    height: 60rpx;
    line-height: 60rpx;
    padding: 0 20rpx;
    text-align: left;
}

.modal-footer {
    display: flex;
    justify-content: center;
    padding: 40rpx;
    border-top: 1rpx solid #eee;
}

.cancel-btn, .save-btn {
    width: 280rpx;
    height: 88rpx;
    line-height: 88rpx;
    text-align: center;
    border-radius: 16rpx;
    font-size: 36rpx;
    margin: 0 20rpx;
}

.cancel-btn {
    background-color: #f5f5f5;
    color: #333;
}

.save-btn {
    background-color: #277ef1;
    color: #fff;
}
</style>