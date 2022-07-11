import Vue from 'vue'
import App from './App.vue'
import router from './router'
import Icon from 'vue-svg-icon/Icon.vue'
Vue.config.productionTip = false
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
Vue.use(Element)
Vue.component('icon', Icon)
new Vue({
  render: h => h(App),
  router
}).$mount('#app')
