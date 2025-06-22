import App from './App'
import store from './store'
// #ifndef VUE3
import Vue from 'vue'
Vue.config.productionTip = false
App.mpType = 'app'
 // import Vant from 'vant';
 // import 'vant/lib/index.css';
 // import "@vant/weapp/index.wxss";
 // Vue.use(Vant);
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