import bwipjs from 'bwip-js'

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

	function formatNumber(n) {
		// 为一位数时前面补 0，让时间格式更规范，比如 9 变成 09
		return n < 10 ? `0${n}` : n;
	}
	// 拼接成想要的格式，比如 2025-06-15 09:30:10
	return `${year}年${formatNumber(month)}月${formatNumber(day)}日  ${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(seconds)}`;
}
// export async function generateBarcodeBase64(content, options = {}) {
//   // 默认配置，可灵活扩展
//   const defaultOptions = {
//     format: "CODE128",
//     width: 2,
//     height: 100,
//     displayValue: true,
//     margin: 10,
//     ...options
//   }

//   // 动态加载 JsBarcode
//   const JsBarcode = await loadJsBarcode()

//   // 创建离屏 Canvas
//   const canvas = document.createElement('canvas')

//   JsBarcode(canvas, content, defaultOptions)

//   return canvas.toDataURL("image/png")
// }

// function loadJsBarcode() {
//   return new Promise((resolve, reject) => {
//     if (typeof JsBarcode !== 'undefined') {
//       resolve(JsBarcode)
//     } else {
//       const script = document.createElement('script')
//       script.src = '/static/js/JsBarcode.all.min.js'
//       script.onload = () => {
//         resolve(JsBarcode)
//       }
//       script.onerror = () => {
//         reject('JsBarcode 加载失败')
//       }
//       document.head.appendChild(script)
//     }
//   })
// }
export async function generateBarcodeBase64(content, options = {}) {
  const defaultOptions = {
    bcid: 'code128',
    text: content,
    scale: 3,
    height: 10,
    includetext: true,
    textxalign: 'center',
    ...options
  }

  const canvasWidth = 600
  const canvasHeight = 300

  let canvas, ctx

  if (uni.createOffscreenCanvas) {
    canvas = uni.createOffscreenCanvas({ type: '2d', width: canvasWidth, height: canvasHeight })
    ctx = canvas.getContext('2d')
  } else {
    canvas = document.createElement('canvas')
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    ctx = canvas.getContext('2d')
  }

  try {
    bwipjs.toCanvas(canvas, defaultOptions)

    if (canvas.toDataURL) {
      return canvas.toDataURL()
    } else {
      return await new Promise((resolve, reject) => {
        canvas.toTempFilePath({
          success: res => resolve(res.tempFilePath),
          fail: reject
        })
      })
    }
  } catch (e) {
    console.error('条码生成失败', e)
    throw e
  }
}

/**
 * 生成水印背景图片（Base64）
 * @param {String} text - 水印文字
 * @param {Object} options - 配置选项
 * @returns {String} Base64图片数据
 */
export function generateWatermarkBackground(text = '企业微信工坊', options = {}) {
  const {
    width = 300,
    height = 200,
    fontSize = 16,
    color = 'rgba(0, 0, 0, 0.15)',
    rotate = -20,
    fontFamily = 'Arial'
  } = options

  let canvas, ctx

  // 创建canvas
  if (uni.createOffscreenCanvas) {
    canvas = uni.createOffscreenCanvas({ type: '2d', width, height })
    ctx = canvas.getContext('2d')
  } else if (typeof document !== 'undefined') {
    canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    ctx = canvas.getContext('2d')
  } else {
    // 如果都不支持，返回空字符串
    return ''
  }

  // 设置文字样式
  ctx.font = `${fontSize}px ${fontFamily}`
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // 旋转画布
  ctx.save()
  ctx.translate(width / 2, height / 2)
  ctx.rotate((rotate * Math.PI) / 180)
  ctx.translate(-width / 2, -height / 2)

  // 绘制文字
  ctx.fillText(text, width / 2, height / 2)

  // 恢复画布
  ctx.restore()

  // 转换为Base64
  try {
    if (canvas.toDataURL) {
      return canvas.toDataURL('image/png')
    } else if (canvas.toTempFilePath) {
      // uni-app环境
      return new Promise((resolve) => {
        canvas.toTempFilePath({
          success: (res) => resolve(res.tempFilePath),
          fail: () => resolve('')
        })
      })
    }
    return ''
  } catch (e) {
    console.error('水印生成失败', e)
    return ''
  }
}