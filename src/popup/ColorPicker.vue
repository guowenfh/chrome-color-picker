<template>
  <div class="wrap">
    <chrome-picker v-model="colors" />
    <div class="color-list">
      <div
        v-for="(item, index) in colorList"
        :key="index + '-' + item"
        class="color-item"
      >
        <div
          class="color"
          :style="{ backgroundColor: `#${item}` }"
          @click="fillColor(`#${item}`)"
        ></div>
      </div>
    </div>
  </div>
</template>

<script>
import {
  sendMessageToContentScript,
  getDefaultColor,
  captureVisibleTab
} from '../common'
import { Chrome } from 'vue-color'
// 主动发送消息给后台
export default {
  components: {
    'chrome-picker': Chrome
  },
  data() {
    return {
      colors: '#000000',
      $picker: null,
      isStartPicker: false,
      colorList: []
    }
  },
  computed: {
    svgFill() {
      return this.isStartPicker ? '#008dff' : '#666'
    }
  },
  mounted() {
    this.initLocalSetting()
    this.$nextTick(() => {
      this.initPicker()
    })
  },
  methods: {
    /**
     * 初始化颜色列表
     */
    initLocalSetting() {
      try {
        const colorList =
          JSON.parse(localStorage.getItem('color-picker-color-list')) ||
          getDefaultColor()
        if (colorList && colorList.length) {
          this.colorList = colorList
          this.colors = this.colorList[0]
        }
      } catch (e) {
        console.error(e)
      }
    },
    fillColor(clickColor) {
      this.colors = clickColor
    },
    /**
     * 吸管 的 svg
     */
    getSvgHtml() {
      return `<svg width="12px" height="12px" viewBox="0 0 12 12" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <g transform="translate(-2.000000, -2.000000)" fill="${this.svgFill}">
            <rect opacity="0" x="0" y="0" width="16" height="16"></rect>
            <path d="M13.8033333,3.75333333 L12.2466667,2.19666666 C11.9866667,1.93666666 11.5633333,1.93666666 11.3033333,2.19666666 L9.22,4.27999998 L7.94333333,2.99999998 L7,3.94333331 L7.94666667,4.88999998 L2,10.8333333 L2,14 L5.16666667,14 L11.1133333,8.05333331 L12.0566667,8.99999998 L13,8.05666666 L11.72,6.77666666 L13.8033333,4.69333333 C14.0666667,4.43333333 14.0666667,4.01333333 13.8033333,3.75333333 Z M4.61333333,12.6666667 L3.33333333,11.3866667 L8.71,6.01 L9.99,7.29 L4.61333333,12.6666667 Z"  fill-rule="nonzero"></path>
          </g>
        </g>
      </svg>`
    },
    /**
     * 初始化一个吸管工具到选择器中去
     */
    initPicker() {
      try {
        const $strawWrap = document.querySelector('.vc-chrome-controls')
        if (!$strawWrap) return
        $strawWrap.style.paddingLeft = '25px'
        $strawWrap.style.position = 'relative'
        this.$picker = document.createElement('div')
        this.$picker.style =
          'position:absolute;top:5px;left:5px;cursor: pointer;'
        this.$picker.innerHTML = this.getSvgHtml()
        $strawWrap.appendChild(this.$picker)
        this.$picker.addEventListener('click', this.pickerClick)
      } catch (error) {
        console.error(error)
      }
    },
    /**
     * 点击吸管工具创建 网页内容中的真正的取色器
     */
    pickerClick() {
      this.isStartPicker = !this.isStartPicker
      this.$picker.innerHTML = this.getSvgHtml()
      if (this.isStartPicker) {
        return captureVisibleTab().then(image => {
          sendMessageToContentScript(
            { cmd: 'color-picker-open', data: { src: image } },
            () => {
              console.log('-----发送 color-picker-open')
              window.close()
            }
          )
        })
      }
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
.color-list {
  padding: 20px 0px 0px 10px;
  border-top: 1px solid rgb(238, 238, 238);
  display: flex;
  flex-wrap: wrap;
  position: relative;
}
.color-item {
  width: 16px;
  height: 16px;
  margin: 0px 10px 10px 0px;
}
.color {
  height: 100%;
  width: 100%;
  cursor: pointer;
  border-radius: 3px;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 0px 0px 1px inset;
}
</style>
<style>
.vc-chrome-body .vc-chrome-controls {
  padding-left: 28px;
}
</style>
