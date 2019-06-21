import Vue from 'vue'
import App from './App'
// 注意，必须设置了run_at=document_start 此段代码才会生效
document.addEventListener('DOMContentLoaded', function() {
  const $div = document.createElement('div')
  $div.setAttribute('id', 'content__script__app')
  document.body.appendChild($div)
  /* eslint-disable no-new */
  new Vue({
    render: h => h(App)
  }).$mount('#content__script__app')
})
