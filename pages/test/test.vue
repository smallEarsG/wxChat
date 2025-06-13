<template>
  <view class="container">
    <text class="normal-text">这是普通字体</text>
    <text class="heiti-text">这是黑体字</text>
    <text class="custom-heiti">930.85</text>
  </view>
</template>

<style>

/* 基本黑体使用方式 */
.heiti-text {
  font-family: 'CustomHeiti'
}

/* 自定义黑体样式 */
.custom-heiti {
  font-family: 'WeChat Sans Std';
  font-size: 60px;
  /* font-weight: bold; */
  color: #333;
  line-height: 1.5;
}

/* 通用样式 */
.container {
  padding: 20px;
}
.normal-text {
  margin-bottom: 15px;
}
.heiti-text {
  margin-bottom: 15px;
}
</style>
