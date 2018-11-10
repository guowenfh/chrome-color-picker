<template>
  <div>
    <p>Hello world!</p>

    <chrome-picker v-model="colors" />
    <button @click="click">取色</button>
  </div>
</template>

<script>
import { sendMessageToContentScript } from '../../../common.js'
import { Chrome } from 'vue-color'
export default {
  components: {
    'chrome-picker': Chrome
  },
  data() {
    return {
      colors: { r: 255, g: 0, b: 0 }
    }
  },
  mounted() {},
  methods: {
    click() {
      chrome.tabs.captureVisibleTab(null, {}, function(image) {
        sendMessageToContentScript(
          { cmd: 'colorPicker', data: { src: image } },
          function(response) {
            console.log('-----发送 colorPicker', response)
          }
        )
        // You can add that image HTML5 canvas, or Element.
      })
    }
  }
}
</script>

<style scoped>
p {
  font-size: 20px;
}
</style>
