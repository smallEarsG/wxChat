// utils/scale.js
export function getScale() {
  return uni.getStorageSync('scale') || 1.0
}

export function setScale(s) {
  uni.setStorageSync('scale', s)
}
