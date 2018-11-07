import store from './store'

browser.browserAction.onClicked.addListener(function (tab) {  console.log(`Hello ${store.getters.foo}!`)

})
