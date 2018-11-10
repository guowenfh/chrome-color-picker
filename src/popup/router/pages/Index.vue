<template>
  <div>
    <p>Hello world!</p>

    <chrome-picker v-model="colors" />
    <button @click="click">截图</button>
  </div>
</template>

<script>
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
  mounted() {
    browser.runtime.sendMessage({})
  },
  methods: {
    click() {
      chrome.tabs.captureVisibleTab(null, {}, function(image) {
        console.error('----', image)
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
