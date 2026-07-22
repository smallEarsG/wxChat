// 配置常量 

// 简章
 // export const REMOTE_API = 'http://106.15.137.235:9090/api'; 
 // 建军
 // export const REMOTE_API = 'http://106.15.137.235:9091/api';
//姐姐
// export const REMOTE_API = 'http://106.15.137.235:9092/api';
// 军哥
// export  const REMOTE_API = 'http://106.15.137.235:9093/api';
// 周宇
export  const REMOTE_API = 'http://106.15.137.235:9094/api';
//
// export  const REMOTE_API = 'http://106.15.137.235:8080/api';
const H5_PROXY = '/pawlapi';
const H5_LOCAL_API = 'http://localhost:9092/api'; 
 // const H5_LOCAL_API = 'http://106.15.137.235:8080/api'
// 请求超时：5 分钟（毫秒）
export const REQUEST_TIMEOUT = 5 * 60 * 1000;

// 判断当前环境是否为H5
function isH5Env() {
	// #ifdef H5
	return true;
	// #endif
	// #ifndef H5
	return false;
	// #endif
}

function resolveBaseUrl() {
	if (!isH5Env()) {
		return REMOTE_API;
	}
	// #ifdef H5
	if (process.env.NODE_ENV === 'development') {
		return H5_LOCAL_API;
	}
	// #endif
	return H5_PROXY;
}

// 根据环境动态选择BASE_URL
export const BASE_URL = resolveBaseUrl();

// 将对象转为 URL 编码形式
function formatFormData(data) {
	return Object.entries(data)
		.map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
		.join('&')
}

// 统一的请求处理函数
function createRequest(options = {}) {
	const {
		useFormData = false,
		showError = true,
		requireAuth = true
	} = options;

	return function request({
		url,
		method = 'GET',
		data = {}
	}) {
		const isPostOrPut = (method === 'POST' || method === 'PUT');
		const shouldUseFormData = useFormData && isPostOrPut;

		return new Promise((resolve, reject) => {
			console.log(BASE_URL + url);
			uni.request({
				url: BASE_URL + url,
				method,
				timeout: REQUEST_TIMEOUT,
				sslVerify: false,
				data: shouldUseFormData ? formatFormData(data) : data,
				header: {
					'Content-Type': shouldUseFormData ?
						'application/x-www-form-urlencoded' : 'application/json',
					...(requireAuth && { 'Authorization': uni.getStorageSync('token') || '' })
				},
				success: (res) => {
					if (res.statusCode === 200) {
						resolve(res.data);
					} else {
						if (showError) {
							uni.showToast({
								title: res.data?.message || '接口异常',
								icon: 'none'
							});
						}
						reject(res);
					}
				},
				fail: (err) => {
					if (showError) {
						uni.showToast({
							title: '网络异常',
							icon: 'none'
						});
					}
					reject({
						code: 500,
						message: '网络异常',
						error: err
					});
				}
			});
		});
	};
}

// 导出不同配置的请求函数
export const request = createRequest({ useFormData: true, showError: false });
export const requestJSON = createRequest({ useFormData: false, showError: false });


// export function Filerequest(file,userId) {
// 	console.log("开始上传文件", file);

// 	return new Promise((resolve, reject) => {
// 		// 使用plus.net.uploader替代FormData和uni.request
// 		const uploader = plus.uploader.createUpload(BASE_URL + '/file/upload/'+userId, {
// 			method: 'POST'
// 		}, (response, status) => {
// 			console.log("上传完成", status, response);

// 			if (status === 200) {
// 				try {
// 					const data = JSON.parse(response.responseText);
// 					resolve(data);
// 				} catch (e) {
// 					console.error("解析响应失败", e);
// 					uni.showToast({
// 						title: '解析响应失败',
// 						icon: 'none'
// 					});
// 					reject({
// 						message: '解析响应失败',
// 						error: e
// 					});
// 				}
// 			} else {
// 				console.error("上传失败", status, response);
// 				try {
// 					const data = JSON.parse(response.responseText);
// 					uni.showToast({
// 						title: data.message || '接口异常',
// 						icon: 'none'
// 					});
// 					reject(data);
// 				} catch (e) {
// 					uni.showToast({
// 						title: `上传失败: ${status}`,
// 						icon: 'none'
// 					});
// 					reject({
// 						message: `上传失败: ${status}`,
// 						status,
// 						response
// 					});
// 				}
// 			}
// 		});

// 		// 添加文件
// 		uploader.addFile(file.fullPath, {
// 			key: 'file'
// 		});

// 		// 开始上传
// 		uploader.start();

// 	});
// }
export function Filerequest(filePath, conversationId) {
	console.log("开始上传文件", filePath);
	console.log("conversationId:", conversationId);
	console.log("BASE_URL:", BASE_URL);
	
	// 尝试不同的路径
	const uploadUrl = BASE_URL + '/file/upload/' + conversationId;
	console.log("完整上传URL:", uploadUrl);

	return new Promise((resolve, reject) => {
		uni.uploadFile({
			url: uploadUrl,
			filePath: filePath,
			name: 'file',
			timeout: REQUEST_TIMEOUT,
			header: {
				// 不要手动设置 Content-Type，uni.uploadFile 会自动设置正确的 multipart/form-data 和 boundary
				'Authorization': uni.getStorageSync('token') || ''
			},
			success: (res) => {
				console.log('上传响应状态码:', res.statusCode);
				console.log('上传响应数据:', res.data);
				
				if (res.statusCode === 200) {
					try {
						const data = JSON.parse(res.data);
						console.log('解析后的响应数据:', data);
						resolve(data);
					} catch (e) {
						console.error("解析响应失败", e);
						console.error("原始响应数据:", res.data);
						uni.showToast({
							title: '解析响应失败',
							icon: 'none'
						});
						reject({
							message: '解析响应失败',
							error: e
						});
					}
				} else {
					console.error("上传失败", res);
					console.error("状态码:", res.statusCode);
					console.error("响应数据:", res.data);
					
					// 如果是404错误，尝试其他路径
					if (res.statusCode === 404) {
						console.log("404错误，尝试其他路径...");
						// 这里可以添加重试逻辑
					}
					
					let errorMessage = '上传失败';
					try {
						const errorData = JSON.parse(res.data);
						errorMessage = errorData.message || errorData.error || '上传失败';
					} catch (e) {
						errorMessage = `上传失败 (${res.statusCode})`;
					}
					
					uni.showToast({
						title: errorMessage,
						icon: 'none'
					});
					reject({
						message: errorMessage,
						status: res.statusCode,
						data: res.data
					});
				}
			},
			fail: (err) => {
				console.error("上传出错", err);
				console.error("错误详情:", JSON.stringify(err, null, 2));
				uni.showToast({
					title: err.errMsg || '网络错误',
					icon: 'none'
				});
				reject({
					message: err.errMsg || '网络错误',
					error: err
				});
			}
		});
	});
}

export function uploadImageByPath(tempFilePath, conversationId) {
	return Filerequest(tempFilePath, conversationId);
}
// export function uploadImageByPath(tempFilePath,userId) {
// 	return new Promise((resolve, reject) => {
// 		// 使用plus.io转换本地路径为可上传的文件
// 		plus.io.resolveLocalFileSystemURL(tempFilePath, (entry) => {
// 			entry.file((file) => {
// 				console.log(file, Filerequest);
// 				Filerequest(file,userId)
// 					.then(result => resolve(result))
// 					.catch(err => reject(err));
// 			}, (err) => {
// 				console.error('获取文件失败', err);
// 				uni.showToast({
// 					title: '文件处理失败',
// 					icon: 'none'
// 				});
// 				reject(err);
// 			});
// 		}, (err) => {
// 			console.error('解析文件路径失败', err);
// 			uni.showToast({
// 				title: '文件路径解析失败',
// 				icon: 'none'
// 			});
// 			reject(err);
// 		});
// 	});
// }


// request_m 已合并到 requestJSON，请使用 requestJSON 替代