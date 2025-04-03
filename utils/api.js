// utils/api.js
const BASE_URL = 'https://your-backend-api.com/api';

// 封装请求方法
const request = (url, method, data = {}, showLoading = true) => {
  return new Promise((resolve, reject) => {
    if (showLoading) {
      uni.showLoading({ title: '加载中...' });
    }
    uni.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${uni.getStorageSync('token') || ''}`
      },
      success: (res) => {
        uni.hideLoading();
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          uni.showToast({
            title: res.data.message || '请求失败',
            icon: 'none'
          });
          reject(res.data);
        }
      },
      fail: (err) => {
        uni.hideLoading();
        uni.showToast({
          title: '网络请求失败',
          icon: 'none'
        });
        reject(err);
      }
    });
  });
};

// 封装具体接口
const api = {
  // 手机号登录
  login: (phone, password) => request('/login', 'POST', { phone, password }),

  // 获取用户信息
  getUserInfo: () => request('/user/info', 'GET'),

  // 退出登录
  logout: () => request('/logout', 'POST'),



  // 获取收款记录
  getRecords: () => request('/records', 'GET')
};

export default api;
