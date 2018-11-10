<template>
  <div>
    <div :style="wrapStyle" id="color-picker-wrap" ref="pickWrap">
      <div :style="rgbaArea">
        <div v-for="(item, index) in matrix" :key="'label' + index">
          <div v-if="item.length" style="width:100px;display:flex;">
            <div
              v-for="xyItem in item"
              :key="xyItem.x + '-' + xyItem.y"
              v-bind:style="{
                backgroundColor: xyItem.backgroundColor,
                height: '10px',
                width: '10px',
                border: `1px solid ${xyItem.isActive ? 'red' : '#ddd'}`
              }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { loadImage, getRectPoint } from '../common'

function pixelToRgba(pixel) {
  const data = pixel.data
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
        backgroundColor: 'rgba(255,255,255,0)',
        top: '-1px',
        position: 'absolute',
        height: '100px',
        width: '100px',
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
      const x = ev.clientX
      const y = ev.clientY

      this.rgbaArea.top = `${y + 10}px`
      this.rgbaArea.left = `${x + 10}px`
      const matrix = getRectPoint(x, y, 5)
      const list = matrix.map(arr => {
        return arr.map(item => {
          const isContains =
            item.x > 0 &&
            item.x < this.imgStyles.width &&
            (item.y > 0 && item.y < this.imgStyles.height)
          const pixel = this.ctx.getImageData(item.x, item.y, 1, 1)
          return {
            ...item,
            isActive: item.x === x && item.y === y,
            backgroundColor: isContains
              ? pixelToRgba(pixel)
              : 'rgba(255,255,255,0)'
          }
        })
      })
      this.matrix = list
      console.error(list)
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
          ;(this.wrapStyle.height = `${this.imgStyles.height}px`),
            (this.wrapStyle.width = `${this.imgStyles.width}px`),
            (this.wrapStyle.display = 'block'),
            (this.ctx = this.$canvas.getContext('2d'))
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
