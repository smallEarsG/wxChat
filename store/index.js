// store/index.js
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    scale: uni.getStorageSync('scale') || 1.0
  },
  mutations: {
    setScale(state, val) {
      state.scale = val
	  // console.log(val);
      uni.setStorageSync('scale', val)
    }
  }
})
