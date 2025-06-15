export function isMemberExpired(ExpireAt) {
	// console.log("guestInfo", guestInfo);
	const memberExpireAt = ExpireAt;
	if (memberExpireAt === '--') {
		return false;
	}
	if (memberExpireAt === null) {
		return true;
	}
	const currentTime = new Date().getTime();
	const expireTime = new Date(memberExpireAt).getTime();
	// console.log("======",expireTime ,currentTime,memberExpireAt);
	return expireTime < currentTime;
}
export function getUUid() {
	const digits = '0123456789';
	let result = '';
	for (let i = 0; i < 10; i++) {
		result += digits.charAt(Math.floor(Math.random() * digits.length));
	}
	return result;
}
export function eadLocalFileToBase64(filePath) {
	return new Promise((resolve, reject) => {
		// 检查是否在5+环境中（修改此处）
		if (typeof plus !== 'undefined') {
			// 解析本地文件URL
			plus.io.resolveLocalFileSystemURL(filePath, function(entry) {
				// 获取文件对象
				entry.file(function(file) {
					// 创建文件读取器
					var reader = new plus.io.FileReader();

					// 读取成功回调
					reader.onloadend = function(e) {
						// 获取Base64编码结果
						var base64Data = e.target.result;
						resolve(base64Data);
					};

					// 读取失败回调
					reader.onerror = function(err) {
						reject(new Error('文件读取失败: ' + err.message));
					};

					// 以DataURL方式读取文件（自动转换为Base64）
					reader.readAsDataURL(file);
				}, function(err) {
					reject(new Error('获取文件对象失败: ' + err.message));
				});
			}, function(err) {
				reject(new Error('解析文件路径失败: ' + err.message));
			});
		} else {
			reject(new Error('当前环境不支持plus.io'));
		}
	});
}
export function getCurrentTime() {
      const date = new Date();
      // 获取年、月、日、时、分、秒，注意月份是 0 - 11，所以要 +1
      const year = date.getFullYear(); 
      const month = date.getMonth() + 1; 
      const day = date.getDate(); 
      const hours = date.getHours(); 
      const minutes = date.getMinutes(); 
      const seconds = date.getSeconds(); 
	  
	  function  formatNumber(n) {
	        // 为一位数时前面补 0，让时间格式更规范，比如 9 变成 09
	        return n < 10 ? `0${n}` : n; 
	      }
      // 拼接成想要的格式，比如 2025-06-15 09:30:10
    return `${year}年${formatNumber(month)}月${formatNumber(day)}日  ${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(seconds)}`; 
    }
