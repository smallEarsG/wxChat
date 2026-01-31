import App from './App'
import store from './store'
import watermarkMixin from './mixins/watermarkMixin.js'
import WatermarkLayer from './components/WatermarkLayer/WatermarkLayer.vue'
// #ifndef VUE3
import Vue from 'vue'
Vue.config.productionTip = false
App.mpType = 'app'
 // import Vant from 'vant';
 // import 'vant/lib/index.css';
 // import "@vant/weapp/index.wxss";
 // Vue.use(Vant);
// 全局注册水印 mixin
Vue.mixin(watermarkMixin)
// 全局注册水印组件
Vue.component('WatermarkLayer', WatermarkLayer)
const app = new Vue({
	store,
    ...App
})
app.$mount()
// #endif

// #ifdef VUE3
import { createSSRApp } from 'vue'
export function createApp() {
  const app = createSSRApp(App)
  return {
    app
  }
}
// #endif