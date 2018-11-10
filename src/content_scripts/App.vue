<template>
  <div>
    <div :style="wrapStyle" id="color-picker-wrap" ref="pickWrap">
      <table :style="rgbaArea">
        <tr v-for="(item, index) in matrix" :key="'label' + index" style="display:flex;">
          <td v-for="xyItem in item" :key="xyItem.x + '-' + xyItem.y" v-bind:style="{
              backgroundColor: xyItem.backgroundColor,
              height: '8px',
              width: '8px',
              boxShadow: `0 0px 0px 1px ${xyItem.isActive ? 'red' : '#ddd'}`,
              zIndex: `${xyItem.isActive ? 1 : 0}`
            }" />
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import { loadImage, chunks } from '../common'

function pixelToRgba(data = []) {
  const rgba = `rgba(${data[0]}, ${data[1]}, ${data[2]}, ${data[3] / 255})`
  return rgba
}
export default {
  data() {
    return {
      matrix: [],
      wrapStyle: {
        display: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 9999
      },
      imgStyles: {
        width: 0,
        height: 0
      },
      cursor:
        'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAXCAYAAADgKtSgAAAAAXNSR0IArs4c6QAAAblJREFUSA3dVMtKw1AQzWsj/oULA0GD+AFacGshSat7/Qw3uvIzdG8pCcStWPoBUlQodeFfFFdJPCfckds8JIouNFBm7syZM3PnztQ2On5RFF24rnvveZ45n88nXcKsLqDvYv45eRiGW3me77I9lDx3aZX5GWgwGGyA7Looir0qzjTNqWVZJ+Px+LXqk3MreRAExwBd4bcu4Aa5hO00SZKbBp/RSM6Ksyx7REBJjCrfoN/hBgvoLvQD6GuKcGnbtt90A0cBVgRbAYMQM8lRHMcvAkLPN5FkhAQ+cQq/L36Rtcr5WAh6IkBVvKMTSyATQJ/JDYDdBu5Z/JTmcDjsIXNPjNA5FX2eEXCLgFIXvy6RIAX5obKleOAH8UOfOCTG71yMukTgQj9XdeUX8j54VgpxmEEPqlTOx2v9cDMXCcRfq/xXe177b+GjoKIpy0FVHLeRejyp0FBnTks5jsRXH5PgxlHk5smcg8BH8AyErXNO/EdmTam1RXw/saG1tgg5V5qbJy0Su0ja6W9bfeJaKxcSSrSEi3UJlaOWgvisqcfE6l9r5TqIROhruSCUXYgZ34lcT/QV/e+SvwPjb9Vawp+KUwAAAABJRU5ErkJggg==") 16 16, crosshair;',
      rgbaArea: {
        borderRadius: '50%',
        overflow: 'hidden',
        borderCollapse: 'collapse',
        boxShadow: '0 0px 0px 1px #4c4c4c',
        pointerEvents: 'none',
        top: '-1px',
        position: 'absolute',
        left: '-1px',
        zIndex: '1111'
      },
      mousePos: { x: -1, y: -1 },
      ctx: null,
      $canvas: null
    }
  },
  computed: {},
  methods: {
    rednerCanvas($canvas, styles = {}) {
      Object.keys(styles).forEach(key => {
        $canvas.setAttribute(key, styles[key])
      })
      this.$refs.pickWrap.appendChild($canvas)
    },
    mousemove(ev) {
      const clientX = ev.clientX
      const clientY = ev.clientY
      this.rgbaArea.top = `${clientY + 10}px`
      this.rgbaArea.left = `${clientX + 10}px`
      const originX = clientX - 5
      const originY = clientY - 5
      const imageData = this.ctx.getImageData(originX, originY, 11, 11)
      // 参考 https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
      // 每四个点表示一个 rgba 的值
      const pixel = chunks(imageData.data, 4)
      const rgbarr = chunks(pixel.map(item => pixelToRgba(item)), 11)
      this.matrix = rgbarr.map((arr, yIndex) => {
        return arr.map((rgba, xIndex) => {
          const x = originX + xIndex
          const y = originY + yIndex
          return {
            x,
            y,
            isActive: clientX === x && clientY === y,
            backgroundColor: rgba
          }
        })
      })
    },
    click() {
      this.$canvas.removeEventListener('mousemove', this.mousemove)
    }
  },
  mounted() {
    // 接收来自后台的消息
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.cmd == 'colorPicker') {
        loadImage(request.data.src, img => {
          this.$canvas = document.createElement('canvas')
          this.$canvas.setAttribute('id', 'color-picker-canvas')
          this.imgStyles = {
            height: Math.floor(img.height / window.devicePixelRatio),
            width: Math.floor(img.width / window.devicePixelRatio)
          }
          this.rednerCanvas(this.$canvas, this.imgStyles)
          this.$canvas.style = `cursor:${this.cursor}`
          document.body.style = `cursor:${this.cursor}`
          this.wrapStyle.height = `${this.imgStyles.height}px`
          this.wrapStyle.width = `${this.imgStyles.width}px`
          this.wrapStyle.display = 'block'

          this.ctx = this.$canvas.getContext('2d')
          this.ctx.drawImage(img, 0, 0)
          this.$canvas.addEventListener('mousemove', this.mousemove)
          this.$canvas.addEventListener('click', this.click)
        })
      }
      sendResponse('我收到你的消息了：' + JSON.stringify(request))
    })
  }
}
</script>
