console.log('Hello from the content-script')

import Vue from 'vue'
import App from './App'
// 注意，必须设置了run_at=document_start 此段代码才会生效
console.time('-----')
document.addEventListener('DOMContentLoaded', function() {
  console.timeEnd('-----')
  const $div = document.createElement('div')
  $div.setAttribute('id', 'conetnt__script__app')
  document.body.appendChild($div)
  /* eslint-disable no-new */
  new Vue({
    render: h => h(App)
  }).$mount('#conetnt__script__app')
})
