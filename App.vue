<script>
	export default {
		onLaunch: function() {
			// 检查是否为 App 环境
			if (typeof plus === 'undefined') return;

			plus.runtime.getProperty(plus.runtime.appid, (wgtinfo) => {
				const currentVersion = wgtinfo.version;
				console.log(wgtinfo.version);
				// 请求后端版本接口
				uni.request({
					url: 'http://106.15.137.235:8080/api/app/version',
					method: 'GET',
					success: (res) => {
						console.log("code:",res);
						const data = res.data;
						const serverVersion = data.latestVersion;
						console.log(compareVersion(serverVersion, currentVersion));
						if (compareVersion(serverVersion, currentVersion) > 0) {
							// 有新版本，提示更新
							uni.showModal({
								title: '发现新版本',
								content: data.updateLog || '发现新版本，是否更新？',
								confirmText: '立即更新',
								showCancel: !data.forceUpdate,
								success: (modalRes) => {
									if (modalRes.confirm) {
										// 使用系统浏览器打开 APK 下载链接
										plus.runtime.openURL(data.apkUrl);
									} else if (data.forceUpdate) {
										// 强制更新时点击取消则退出应用
										plus.runtime.quit();
									}
								}
							});
						}
					}
				});
			});

			// 小工具：版本号比较
			function compareVersion(v1, v2) {
				const v1Parts = v1.split('.');
				const v2Parts = v2.split('.');
				const len = Math.max(v1Parts.length, v2Parts.length);
				while (v1Parts.length < len) v1Parts.push('0');
				while (v2Parts.length < len) v2Parts.push('0');

				for (let i = 0; i < len; i++) {
					const num1 = parseInt(v1Parts[i], 10);
					const num2 = parseInt(v2Parts[i], 10);
					if (num1 > num2) return 1;
					if (num1 < num2) return -1;
				}
				return 0;
			}
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

	/*每个页面公共css */
	uni-tabbar .uni-tabbar__label {
		font-size: 24rpx !important;
	}
	page {
	  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Helvetica Neue", "Microsoft YaHei", "Roboto", "Noto Sans CJK SC", sans-serif;
	}
	
</style>