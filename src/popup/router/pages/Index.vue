<template>
  <div class="wrap">
    <chrome-picker v-model="colors" />
    <div class="end">
      <div>开启自动复制到剪贴板</div>
      <a-switch :checked="isCopy" @change="onChange" />
    </div>
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
      colors: { r: 255, g: 0, b: 0 },
      isCopy: false,
        $picker:null,
        isStartPicker:false,
        colorList:[],
    }
  },
  computed:{
    svgFill(){
     return this.isStartPicker ? '#008dff' : '#666'
    }
  },
  mounted() {

   this.initPicker()
      this.onMessage()
      this.initLocalSetting()
  },
  methods: {
      initLocalSetting(){
          try {
              const isCopy = localStorage.getItem('color-picker-is-copy')
              this.isCopy =  JSON.parse(isCopy) === true
              console.error(this.isCopy)
          } catch (e) {
            console.error(e)
          }
      },
      onMessage(){
          chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
              if(request.cmd==='addColor'){
                const color = request.data.color
                  const length = this.colorList.length
                  if(length>10){
                    this.colorList.pop()
                  }
                  this.colorList.unshift(color)
              }
          })
      },
      getSvgHtml(){
          return`<svg width="12px" height="12px" viewBox="0 0 12 12" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <g transform="translate(-2.000000, -2.000000)" fill="${this.svgFill}">
            <rect opacity="0" x="0" y="0" width="16" height="16"></rect>
            <path d="M13.8033333,3.75333333 L12.2466667,2.19666666 C11.9866667,1.93666666 11.5633333,1.93666666 11.3033333,2.19666666 L9.22,4.27999998 L7.94333333,2.99999998 L7,3.94333331 L7.94666667,4.88999998 L2,10.8333333 L2,14 L5.16666667,14 L11.1133333,8.05333331 L12.0566667,8.99999998 L13,8.05666666 L11.72,6.77666666 L13.8033333,4.69333333 C14.0666667,4.43333333 14.0666667,4.01333333 13.8033333,3.75333333 Z M4.61333333,12.6666667 L3.33333333,11.3866667 L8.71,6.01 L9.99,7.29 L4.61333333,12.6666667 Z"  fill-rule="nonzero"></path>
          </g>
        </g>
      </svg>`
      },
      initPicker(){
          const $strawWrap =  document.querySelector('.vc-chrome-controls')
          if(!$strawWrap) return
          $strawWrap.style.paddingLeft='25px'
          $strawWrap.style.position='relative'
          this.$picker= document.createElement('div')
          this.$picker.style="position:absolute;top:5px;left:5px;cursor: pointer;"
          this.$picker.innerHTML= this.getSvgHtml()
          $strawWrap.appendChild(this.$picker)
          this.$picker.addEventListener('click',this.click)
      },
    onChange() {
      this.isCopy = !this.isCopy
        localStorage.setItem('color-picker-is-copy',JSON.stringify(this.isCopy))
    },
    click() {
        this.isStartPicker = !this.isStartPicker
        this.$picker.innerHTML= this.getSvgHtml()
          if(this.isStartPicker){
              chrome.tabs.captureVisibleTab(null, {}, function(image) {
                  sendMessageToContentScript(
                    { cmd: 'color-picker-open', data: { src: image } },
                    function(response) {
                        console.log('-----发送 colorPicker', response)
                    }
                )
              })
              return
          }
        sendMessageToContentScript(
            { cmd: 'color-picker-close'},
            function(response) {
                console.log('-----发送 colorPicker', response)
            }
        )
    }
  }
}
</script>

<style scoped>
p {
  font-size: 20px;
}
.wrap {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.picker-btn {
  /* margin-bottom: 8px; */
}
.end {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
}
</style>
<style>
.vc-chrome-body .vc-chrome-controls {
  padding-left: 25px;
}
</style>