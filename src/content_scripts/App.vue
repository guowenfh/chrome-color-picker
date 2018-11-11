<template>
  <div :style="wrapStyle" id="color-picker-wrap" ref="pickWrap">
    <div :style="position" v-if="isInit">
      <table :style="rgbaArea">
        <tr
          v-for="(item, index) in matrix"
          :key="'label' + index"
          style="display:flex;"
        >
          <td
            v-for="xyItem in item"
            :key="xyItem.x + '-' + xyItem.y"
            v-bind:style="{
              backgroundColor: xyItem.backgroundColor,
              height: '8px',
              width: '8px',
              boxShadow: `0 0px 0px 1px ${xyItem.isActive ? 'red' : '#ddd'}`,
              zIndex: `${xyItem.isActive ? 1 : 0}`
            }"
          />
        </tr>
      </table>

      <input
        type="text"
        :value="activeHax"
        id="color-picker-input"
        :style="{
          cursor: 'auto',
          marginTop: '12px',
          width: '110px',
          borderRadius: '4px',
          border: '1px solid #ddd'
        }"
      />
      <span
        v-if="showChoseBtn"
        :style="{
          height: '20px',
          width: '20px',
          position: 'absolute',
          top: 0,
          right: '-7px',
          cursor: 'pointer',
          background: `url(${closePng}) center center`,
          'background-size': '100% 100%'
        }"
        @click="close"
      ></span>
    </div>
  </div>
</template>

<script>
import { loadImage, chunks, sendMessageToContentScript } from '../common'
import crosshairPng from './crosshair.png'
import closePng from './close2x.png'
function pixelToRgba(data = []) {
  const r = data[0]
  const g = data[1]
  const b = data[2]
  const rgba = `rgba(${r}, ${g}, ${b}, ${data[3] / 255})`
  return {
    rgba,
    r,
    g,
    b
  }
}
function rgbToHex(r, g, b) {
  return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}
export default {
  data() {
    return {
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
      cursor: `url(${crosshairPng}) 12 12, crosshair;`,
      position: {
        top: '-1px',
        left: '-1px',
        position: 'absolute',
        zIndex: 1111
      },
      rgbaArea: {
        pointerEvents: 'none',
        borderRadius: '50%',
        overflow: 'hidden',
        borderCollapse: 'collapse',
        boxShadow: '0 0px 0px 1px #4c4c4c'
      },
      closePng: closePng,
      matrix: [], // 显示颜色值的正方形
      showChoseBtn: false,
      activeHax: 'ffffff',
      ctx: null,
      $canvas: null,
      isInit: false,
      $pickImage: null
    }
  },
  computed: {},
  methods: {
    rednerCanvas() {
      this.$canvas = document.createElement('canvas')
      this.ctx = this.$canvas.getContext('2d')
      this.$canvas.setAttribute('id', 'color-picker-canvas')
      this.$canvas.width = this.imgStyles.width
      this.$canvas.height = this.imgStyles.height
      this.$canvas.style.display = 'none'
      // this.$refs.pickWrap.appendChild(this.$canvas)
    },
    mousemove(ev) {
      requestAnimationFrame(() => {
        const clientX = ev.clientX
        const clientY = ev.clientY
        this.position.top = `${clientY + 10}px`
        this.position.left = `${clientX + 10}px`
        this.position.pointerEvents = 'none'

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
            const isActive = clientX === x && clientY === y
            if (isActive) {
              this.activeHax = rgbToHex(rgba.r, rgba.g, rgba.b)
            }
            return {
              x,
              y,
              isActive: isActive,
              backgroundColor: rgba.rgba
            }
          })
        })
      })
    },
    click(ev) {
      if (!this.showChoseBtn) {
        this.showChoseBtn = true
        this.position.pointerEvents = 'initial'
        this.$pickImage.removeEventListener('mousemove', this.mousemove)
        const $input = document.getElementById('color-picker-input')
        if ($input) {
          $input.focus()
          $input.select()
          document.execCommand('copy')
          localStorage.setItem('color-picker-select-color', this.activeHax)
          try {
            const isCopy = localStorage.getItem('color-picker-is-copy')
            if (JSON.parse(isCopy) !== true) return
            sendMessageToContentScript(
              {
                cmd: 'color-picker-select-color',
                data: { color: this.activeHax }
              },
              function(response) {
                console.log('-----color-picker-select-color', response)
              }
            )
          } catch (e) {
            console.error(e)
          }
        }
        return
      }
      this.$pickImage.addEventListener('mousemove', this.mousemove)
      this.$pickImage.addEventListener('click', this.click)
      this.mousemove(ev)
      this.showChoseBtn = false
    },
    close() {
      if (this.$pickImage) {
        this.$pickImage.removeEventListener('mousemove', this.mousemove)
        this.$pickImage.removeEventListener('click', this.click)
        this.$pickImage.parentNode.removeChild(this.$pickImage)
      }
      window.removeEventListener('keyup', this.keyup)
      this.$canvas = null
      this.ctx = null
      this.showChoseBtn = false
      this.isInit = false
    },
    keyup(ev) {
      // ESC 键
      if (ev.keyCode === 27) {
        this.close()
      }
    },

    onMessage() {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        sendResponse('我收到你的消息了：' + JSON.stringify(request))
        if (request.cmd == 'color-picker-close') {
          console.error('-------')
          this.close()
          return
        }
        if (request.cmd == 'color-picker-open') {
          if (this.isInit) return
          loadImage(request.data.src, img => {
            this.imgStyles = {
              height: Math.floor(img.height / window.devicePixelRatio),
              width: Math.floor(img.width / window.devicePixelRatio)
            }
            img.id = 'color-picker-image'
            img.style = `margin: 0px;padding: 0px;overflow: hidden;max-width: none !important;max-height: none !important;visibility: visible;width: ${
              this.imgStyles.width
            }px;height: auto;cursor:${this.cursor}`
            this.$refs.pickWrap.appendChild(img)
            this.$pickImage = img
            this.rednerCanvas()
            this.wrapStyle.height = `${this.imgStyles.height}px`
            this.wrapStyle.width = `${this.imgStyles.width}px`
            this.wrapStyle.display = 'block'

            this.ctx.drawImage(
              img,
              0,
              0,
              this.imgStyles.width,
              this.imgStyles.height
            )
            this.$pickImage.addEventListener('mousemove', this.mousemove)
            this.$pickImage.addEventListener('click', this.click)
            window.addEventListener('keyup', this.keyup)
            this.isInit = true
          })
        }
      })
    }
  },
  destroyed() {
    this.close()
  },
  mounted() {
    // 接收来自后台的消息
    this.onMessage()
  }
}
</script>
