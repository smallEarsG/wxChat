<script>
export default {
	onLaunch: function() {
		console.log('App Launch test')
	},
	onShow: function() {
		console.log('App Show')
	},
	onHide: function() {
		console.log('App Hide')
	}
}
</script>

<style>
	@font-face {
	  font-family: 'CustomHeiti';
	  src: url('/static/font/simhei.ttf') format('opentype');
	  font-weight: normal;
	  font-style: normal;
	}
	
	@font-face {
	  font-family: 'WeChat Sans Std';
	  src: url('/static/font/wechatsansss-medium_mianfeiziti.com.ttf') format('opentype');
	  font-weight: normal;
	  font-style: normal;
	}
	@font-face {
	  font-family: 'heiti';
	  src: url('/static/font/simhei.ttf') format('opentype');
	  font-weight: normal;
	  font-style: normal;
	}
	@font-face {
		font-family: 'Bahnschrift';
		src: url('/static/font/bahnschrift.ttf') format('truetype');
		/* font-weight: 600; */
		/* 对应 Semibold */
		font-style: normal;
	}
	@font-face {
	  font-family: 'WeChat Sans SS';
	  src: url('/static/font/We Chat Sans SS Light_mianfeiziti.com.otf') format('opentype');
	  font-weight: normal;
	  font-style: normal;
	}
	
	@font-face {
	  font-family: 'WConsolas_mianfeiziti';
	  src: url('/static/font/Consolas_mianfeiziti.com.ttf') format('opentype');
	  font-weight: normal;
	  font-style: normal;
	}
	/*每个页面公共css */
	uni-tabbar .uni-tabbar__label {
		font-size: 24rpx !important;
	}
	page {
	  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", "Microsoft YaHei", "Roboto", "Noto Sans CJK SC", sans-serif;
	}
	:root {
	  --safe-area-inset-top: env(safe-area-inset-top);
	  --safe-area-inset-right: env(safe-area-inset-right);
	  --safe-area-inset-bottom: env(safe-area-inset-bottom);
	  --safe-area-inset-left: env(safe-area-inset-left);
	}
	
	/* 全局适配 */
	.page {
	  padding-bottom: constant(safe-area-inset-bottom); /* 兼容 iOS < 11.2 */
	  padding-bottom: env(safe-area-inset-bottom); /* 兼容 iOS >= 11.2 */
	  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;

	}

	/* 全局水印层 - 全屏平铺文字水印（密集版） */
	.watermark-layer {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100vw;
		height: 100vh;
		z-index: 9999;
		pointer-events: none;
		overflow: hidden;
		/* 使用 SVG 创建文字水印背景，全屏平铺 - 减小字体大小 */
		background-image: url("data:image/svg+xml,%3Csvg width='180' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Ctext x='50%25' y='50%25' font-size='16' fill='rgba(0,0,0,0.15)' text-anchor='middle' dominant-baseline='middle' transform='rotate(-20 90 60)' font-family='-apple-system, BlinkMacSystemFont, PingFang SC, Helvetica Neue, Microsoft YaHei, Roboto, Noto Sans CJK SC, sans-serif'%3E会员去水印%3C/text%3E%3C/svg%3E");
		background-repeat: repeat;
		background-size: 180px 120px;
		background-position: 0 0;
	}
	.order_info {
		
		font-family: 'heiti';
	}

</style>