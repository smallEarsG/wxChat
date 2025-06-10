// utils/api.js
// export const BASE_URL = 'http://106.15.137.235:8080/api';

// export let BASE_URL  = "/pawlapi";
const REMOTE_API = 'http://106.15.137.235:8080/api';
// H5代理地址
const H5_PROXY = '/pawlapi';

// 判断当前环境是否为H5
function isH5Env() {
	// #ifdef H5
	return true;
	// #endif

	// #ifndef H5
	return false;
	// #endif
}

// 根据环境动态选择BASE_URL
export const BASE_URL = isH5Env() ? H5_PROXY : REMOTE_API;

// utils/request.js
export function request({
	url,
	method = 'GET',
	data = {}
}) {
	const isForm = (method === 'POST' || method === 'PUT')

	return new Promise((resolve, reject) => {
		uni.request({
			url: BASE_URL + url,
			method,
			sslVerify: false,
			data: isForm ? formatFormData(data) : data,
			header: {
				'Content-Type': isForm ?
					'application/x-www-form-urlencoded' : 'application/json',
				'Authorization': uni.getStorageSync('token') || ''
			},
			success: (res) => {
				if (res.statusCode === 200) {
					resolve(res.data)
				} else {
					console.log(res);
					uni.showToast({
						title: res.data.message || '接口异常',
						icon: 'none'
					})
					reject(res)
				}
			},
			fail: (err) => {
				uni.showToast({
					title: '网络异常',
					icon: 'none'
				})
				reject(err)
			}
		})
	})
}

// 将对象转为 URL 编码形式
function formatFormData(data) {
	return Object.entries(data)
		.map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
		.join('&')
}


export function Filerequest(file,userId) {
	console.log("开始上传文件", file);

	return new Promise((resolve, reject) => {
		// 使用plus.net.uploader替代FormData和uni.request
		const uploader = plus.uploader.createUpload(BASE_URL + '/file/upload/'+userId, {
			method: 'POST'
		}, (response, status) => {
			console.log("上传完成", status, response);

			if (status === 200) {
				try {
					const data = JSON.parse(response.responseText);
					resolve(data);
				} catch (e) {
					console.error("解析响应失败", e);
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
				console.error("上传失败", status, response);
				try {
					const data = JSON.parse(response.responseText);
					uni.showToast({
						title: data.message || '接口异常',
						icon: 'none'
					});
					reject(data);
				} catch (e) {
					uni.showToast({
						title: `上传失败: ${status}`,
						icon: 'none'
					});
					reject({
						message: `上传失败: ${status}`,
						status,
						response
					});
				}
			}
		});

		// 添加文件
		uploader.addFile(file.fullPath, {
			key: 'file'
		});

		// 开始上传
		uploader.start();

	});
}
export function uploadImageByPath(tempFilePath,userId) {
	return new Promise((resolve, reject) => {
		// 使用plus.io转换本地路径为可上传的文件
		plus.io.resolveLocalFileSystemURL(tempFilePath, (entry) => {
			entry.file((file) => {
				console.log(file, Filerequest);
				Filerequest(file,userId)
					.then(result => resolve(result))
					.catch(err => reject(err));
			}, (err) => {
				console.error('获取文件失败', err);
				uni.showToast({
					title: '文件处理失败',
					icon: 'none'
				});
				reject(err);
			});
		}, (err) => {
			console.error('解析文件路径失败', err);
			uni.showToast({
				title: '文件路径解析失败',
				icon: 'none'
			});
			reject(err);
		});
	});
}


export function request_m({
	url,
	method = 'GET',
	data = {}
}) {


	return new Promise((resolve, reject) => {
		uni.request({
			url: BASE_URL + url,
			method,
			sslVerify: false,
			data:  data,
			header: {
				'Content-Type': 'application/json',
				'Authorization': uni.getStorageSync('token') || ''
			},
			success: (res) => {
				if (res.statusCode === 200) {
					resolve(res.data)
				} else {
					console.log(res);
					uni.showToast({
						title: res.data.message || '接口异常',
						icon: 'none'
					})
					reject(res)
				}
			},
			fail: (err) => {
				uni.showToast({
					title: '网络异常',
					icon: 'none'
				})
				reject(err)
			}
		})
	})
}