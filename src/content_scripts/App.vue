<template>
  <div>
    <div :style="wrapStyle" id="color-picker-wrap" ref="pickWrap" @mousemove="mousemove" @click.stop="click">
      <div :style="rgbaArea"></div>
    </div>
  </div>
</template>

<script>
import { loadImage } from '../common'

function pixelToRgba(pixel) {
  var data = pixel.data
  var rgba =
    'rgba(' +
    data[0] +
    ',' +
    data[1] +
    ',' +
    data[2] +
    ',' +
    data[3] / 255 +
    ')'
  return rgba
}
export default {
  data() {
    return {
      wrapStyle: {
        display:'none',
        position:'fixed',
        top:0,
        left:0,
        zIndex:9999,
        cursor: 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAXCAYAAADgKtSgAAAAAXNSR0IArs4c6QAAAblJREFUSA3dVMtKw1AQzWsj/oULA0GD+AFacGshSat7/Qw3uvIzdG8pCcStWPoBUlQodeFfFFdJPCfckds8JIouNFBm7syZM3PnztQ2On5RFF24rnvveZ45n88nXcKsLqDvYv45eRiGW3me77I9lDx3aZX5GWgwGGyA7Looir0qzjTNqWVZJ+Px+LXqk3MreRAExwBd4bcu4Aa5hO00SZKbBp/RSM6Ksyx7REBJjCrfoN/hBgvoLvQD6GuKcGnbtt90A0cBVgRbAYMQM8lRHMcvAkLPN5FkhAQ+cQq/L36Rtcr5WAh6IkBVvKMTSyATQJ/JDYDdBu5Z/JTmcDjsIXNPjNA5FX2eEXCLgFIXvy6RIAX5obKleOAH8UOfOCTG71yMukTgQj9XdeUX8j54VgpxmEEPqlTOx2v9cDMXCcRfq/xXe177b+GjoKIpy0FVHLeRejyp0FBnTks5jsRXH5PgxlHk5smcg8BH8AyErXNO/EdmTam1RXw/saG1tgg5V5qbJy0Su0ja6W9bfeJaKxcSSrSEi3UJlaOWgvisqcfE6l9r5TqIROhruSCUXYgZ34lcT/QV/e+SvwPjb9Vawp+KUwAAAABJRU5ErkJggg==") 16 16, crosshair;',
      },
      rgbaArea:{
        backgroundColor:'rgba(255,255,255,0)',
        top:'-1px',
        position: 'absolute',
        height: '1px',
        width: '1px',
        left:'-1px',
        zIndex:'1111'
      },
      mousePos:{x:-1,y:-1},
      ctx:null
    }
  },
  computed:{
  },
  methods:{
    rednerCanvas($canvas, styles = {}) {
      Object.keys(styles).forEach(key => {
        $canvas.setAttribute(key, styles[key])
      })
      this.$refs.pickWrap.appendChild($canvas)
    },
    mousemove(ev){
      const x = ev.clientX
      const y = ev.clientY
      const pixel = this.ctx.getImageData(x, y, 1, 1)
      this.rgbaArea.backgroundColor = pixelToRgba(pixel)
      this.rgbaArea.top = `${y}px`
      this.rgbaArea.left = `${x}px`
      console.error(pixelToRgba(pixel))
    },
    click(){

    }
  },
  mounted() {
    // 接收来自后台的消息
    chrome.runtime.onMessage.addListener((
      request,
      sender,
      sendResponse
    ) =>{
      if (request.cmd == 'colorPicker') {
        loadImage(request.data.src, img => {
          const $canvas = document.createElement('canvas')
          $canvas.setAttribute('id', 'color-picker-canvas')
          const styles = {
            height:img.height,
            width:img.width,
          }
          this.rednerCanvas($canvas,styles)
          this.wrapStyle.height = `${styles.height}px`,
          this.wrapStyle.width = `${styles.width}px`,
          this.wrapStyle.display = `block`,

          this.ctx = $canvas.getContext('2d')
          this.ctx.drawImage(img, 0, 0)
        })
      }
      sendResponse('我收到你的消息了：' + JSON.stringify(request))
    })
  }
}
</script>
