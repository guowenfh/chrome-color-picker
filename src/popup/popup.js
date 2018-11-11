import Vue from 'vue'
import App from './App'
import store from '../store'
import router from './router'
import { Switch, Button } from 'ant-design-vue'
Vue.use(Switch)
Vue.use(Button)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
})
