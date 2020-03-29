<template>
  <div :style="wrapStyle" id="color-picker-wrap" ref="pickWrap">
    <div :style="position" v-if="isInit">
      <div :style="rgbaAreaStyles">
        <div
          v-for="(item, index) in matrix"
          :key="'label-' + index"
          style="display:flex;box-sizing: boder-box;"
        >
          <div
            v-for="xyItem in item"
            :key="xyItem.x + '-' + xyItem.y"
            v-bind:style="{
              boxSizing: 'boder-box',
              backgroundColor: xyItem.backgroundColor,
              height: '10px',
              width: '10px',
              boxShadow: `0 0px 0px 1px ${xyItem.isActive ? 'red' : '#ddd'}`,
              zIndex: `${xyItem.isActive ? 1 : 0}`
            }"
          />
        </div>
      </div>
      <input
        ref="colorInput"
        type="text"
        :value="activeHax"
        id="color-picker-input"
        :style="colorInputStyles"
      />
    </div>
  </div>
</template>

<script>
import {
  loadImage,
  chunks,
  sendMessageToBackground,
  getDefaultColor
} from '../common'
import crosshairPng from './crosshair.png'

var _requestAnimFrame =
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.oRequestAnimationFrame ||
  window.msRequestAnimationFrame ||
  function(callback) {
    window.setTimeout(callback, 1000 / 60)
  }

/**
 * requestAnimationFrame polyfill based on http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 * In order to get a precise start time, `requestAnimFrame` should be called as an entry into the method
 * @memberOf fabric.util
 * @param {Function} callback Callback to invoke
 * @param {DOMElement} element optional Element to associate with animation
 */
export function requestAnimFrame() {
  return _requestAnimFrame.apply(window, arguments)
}

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
const colorInputStyles = {
  cursor: 'auto',
  marginTop: '12px',
  width: '110px',
  borderRadius: '4px',
  border: '1px solid #ddd',
  boxSizing: 'border-box',
  fontVariant: 'tabular-nums',
  listStyle: 'none',
  position: 'relative',
  display: 'inline-block',
  height: '24px',
  color: 'rgba(0,0,0,.65)',
  fontSize: '16px',
  lineHeight: '1.5',
  backgroundColor: '#fff',
  backgroundImage: 'none',
  transition: 'all .3s',
  outline: 'none'
}
const initRgbaAreaStyles = {
  boxSizing: 'boder-box',
  pointerEvents: 'none',
  borderRadius: '50%',
  overflow: 'hidden',
  borderCollapse: 'collapse',
  boxShadow: '0 0px 0px 1px #4c4c4c'
}
const initWrapStyle = {
  display: 'none',
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 9999
}
const initPosition = {
  position: 'fixed',
  top: 0,
  left: 0,
  zIndex: 9999
}
export default {
  data() {
    return {
      colorInputStyles: colorInputStyles,
      wrapStyle: {
        // 整个选择器的样式
        ...initWrapStyle
      },
      imgStyles: {
        width: 0,
        height: 0
      },
      cursor: `url(${crosshairPng}) 12 12, crosshair;`,
      position: {
        // 选择器的位置
        ...initPosition
      },
      rgbaAreaStyles: {
        // 颜色选择器的rgb表
        ...initRgbaAreaStyles
      },
      matrix: [], // 显示颜色值的正方形
      showChoseBtn: false,
      activeHax: '#FFFFFF',
      ctx: null,
      $canvas: null,
      isInit: false,
      $pickImage: null
    }
  },
  beforeDestroy() {
    this.close()
  },
  mounted() {
    // 接收来自后台的消息
    this.onMessage()
  },
  methods: {
    /**
     * 事件监听，接受来自 右键菜单等地方的事件
     */
    onMessage() {
      chrome.runtime.onMessage.addListener(
        async (request, sender, sendResponse) => {
          sendResponse('我收到你的消息了：' + JSON.stringify(request))
          if (request.cmd == 'color-picker-close') {
            this.close()
            return
          }
          if (request.cmd == 'color-picker-open') {
            this.pickerOpen(request)
            return
          }
        }
      )
    },
    /**
     * 打开取色器
     */
    async pickerOpen(request) {
      // 如果是已经初始化过，直接返回，并且关闭
      if (this.isInit) return this.close()
      // 鼠标手形
      document.body.cursor = 'wait'
      // 1. 加载图片
      const img = await new Promise(resolve =>
        loadImage(request.data.src, resolve)
      )
      this.imgStyles = {
        height: Math.floor(img.height / window.devicePixelRatio),
        width: Math.floor(img.width / window.devicePixelRatio)
      }
      // 插入图片
      img.id = 'color-picker-image'
      img.style = `margin: 0px;padding: 0px;overflow: hidden;max-width: none !important;max-height: none !important;visibility: visible;width: ${this.imgStyles.width}px;height: auto;`

      this.$refs.pickWrap.appendChild(img)
      // 2. 插入图片
      this.$pickImage = img

      // 3.渲染一个等高的canvas
      this.rednerCanvas(img)

      // 4. 把容器宽高设置为图片一样
      this.wrapStyle.height = `${this.imgStyles.height}px`
      this.wrapStyle.width = `${this.imgStyles.width}px`
      this.wrapStyle.display = 'block'
      document.body.style = `cursor:${this.cursor} overflow: hidden;`

      // 5. 添加鼠标移动的事件，点击的事件，键盘事件
      this.$pickImage.addEventListener('click', this.click)
      this.$pickImage.addEventListener('mousemove', this.mousemove, true)
      window.addEventListener('keyup', this.keyup, true)

      this.isInit = true
    },
    /**
     * 渲染 canvas
     */
    rednerCanvas(img) {
      this.$canvas = document.createElement('canvas')
      this.ctx = this.$canvas.getContext('2d')
      this.$canvas.setAttribute('id', 'color-picker-canvas')
      this.$canvas.width = this.imgStyles.width
      this.$canvas.height = this.imgStyles.height
      this.$canvas.style.display = 'none'

      this.ctx.drawImage(img, 0, 0, this.imgStyles.width, this.imgStyles.height)
    },
    /**
     * 鼠标移动，实时获取鼠标位置所在的点
     */
    mousemove(ev) {
      ev.stopPropagation()
      ev.preventDefault()
      // ev.
      requestAnimFrame(() => {
        // 鼠标的显示
        const clientX = ev.clientX
        const clientY = ev.clientY
        // 数据原始 left top 的点
        const originX = clientX - 5
        const originY = clientY - 5

        const imageData =
          this.ctx && this.ctx.getImageData(originX, originY, 11, 11)
        // 参考 https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
        // 每四个点表示一个 rgba 的值
        if (!imageData) return
        const pixel = chunks(imageData.data, 4)
        const rgbarr = chunks(
          pixel.map(item => pixelToRgba(item)),
          11
        )

        this.position = {
          ...this.position,
          display: 'block',
          top: `${clientY + 10}px`,
          left: `${clientX + 10}px`,
          pointerEvents: 'none'
        }
        this.matrix = rgbarr.map((arr, yIndex) => {
          return arr.map((rgba, xIndex) => {
            const x = originX + xIndex
            const y = originY + yIndex
            const isActive = clientX === x && clientY === y
            if (isActive) {
              this.activeHax = `#${rgbToHex(
                rgba.r,
                rgba.g,
                rgba.b
              )}`.toUpperCase()
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
    async setCache() {
      const data = await sendMessageToBackground('color-picker-cache-get', {
        key: 'color-picker-color-list'
      })
      let colorList = JSON.parse(data)
      colorList = colorList === null ? getDefaultColor() : colorList
      colorList.unshift(
        this.activeHax.includes('#')
          ? this.activeHax.split('#')[1]
          : this.activeHax
      )
      colorList = [...new Set(colorList)]
      if (colorList.length > 16) {
        colorList.pop()
      }
      await sendMessageToBackground('color-picker-cache-set', {
        key: 'color-picker-color-list',
        value: JSON.stringify(colorList)
      })
    },
    /**
     * 点击事件， 代表选中状态，
     */
    async click() {
      try {
        this.position.pointerEvents = 'initial'
        this.$refs.colorInput.focus()
        this.$refs.colorInput.select()

        window.postMessage(
          {
            cmd: 'rc-set-color',
            type: 'fill',
            value: this.activeHax
          },
          '*'
        )
        await this.setCache()
        document.execCommand('copy')
        this.$refs.colorInput.blur()
        this.activeHax = '颜色复制成功'

        setTimeout(() => {
          this.close()
        }, 400)
      } catch (e) {
        console.error(e)
      }
    },
    /**
     * 关闭选择器
     */
    close() {
      if (this.$pickImage) {
        this.$pickImage.removeEventListener('click', this.click)
        this.$pickImage.parentNode.removeChild(this.$pickImage)
      }
      this.$pickImage.removeEventListener('mousemove', this.mousemove, true)
      window.removeEventListener('keyup', this.keyup, true)
      this.$canvas = null
      this.ctx = null
      this.isInit = false
      document.body.style = ''
      this.wrapStyle.display = 'none'
    },
    /**
     * 键盘事件 如果按下 ESC 那么就关闭
     */
    keyup(ev) {
      ev.stopPropagation()
      ev.preventDefault()
      // ESC 键
      if (ev.keyCode === 27) {
        this.close()
      }
    }
  }
}
</script>
