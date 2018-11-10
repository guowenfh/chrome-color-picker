<template>
  <div>
    111111111
  </div>
</template>

<script>
import { loadImage } from '../common'
export default {
  data() {
    return {}
  },
  mounted(){
// 接收来自后台的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log(
    '收到来自 ' +
      (sender.tab
        ? 'content-script(' + sender.tab.url + ')'
        : 'popup或者background') +
      ' 的消息：',
    request
  )
  if (request.cmd == 'colorPicker') {
    loadImage(request.data.src, img => {
      let $div = document.querySelector('#color-picker-wrap')
      if ($div) {
        document.body.removeChild($div)
      }
      $div = document.createElement('div')
      $div.setAttribute('id', 'color-picker-wrap')
      const $canvas = document.createElement('canvas')
      $canvas.setAttribute('id', 'color-picker-canvas')
      $canvas.setAttribute('width', img.width)
      $canvas.setAttribute('height', img.height)
      $div.appendChild($canvas)
      document.body.style.cursor =
        'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAXCAYAAADgKtSgAAAAAXNSR0IArs4c6QAAAblJREFUSA3dVMtKw1AQzWsj/oULA0GD+AFacGshSat7/Qw3uvIzdG8pCcStWPoBUlQodeFfFFdJPCfckds8JIouNFBm7syZM3PnztQ2On5RFF24rnvveZ45n88nXcKsLqDvYv45eRiGW3me77I9lDx3aZX5GWgwGGyA7Looir0qzjTNqWVZJ+Px+LXqk3MreRAExwBd4bcu4Aa5hO00SZKbBp/RSM6Ksyx7REBJjCrfoN/hBgvoLvQD6GuKcGnbtt90A0cBVgRbAYMQM8lRHMcvAkLPN5FkhAQ+cQq/L36Rtcr5WAh6IkBVvKMTSyATQJ/JDYDdBu5Z/JTmcDjsIXNPjNA5FX2eEXCLgFIXvy6RIAX5obKleOAH8UOfOCTG71yMukTgQj9XdeUX8j54VgpxmEEPqlTOx2v9cDMXCcRfq/xXe177b+GjoKIpy0FVHLeRejyp0FBnTks5jsRXH5PgxlHk5smcg8BH8AyErXNO/EdmTam1RXw/saG1tgg5V5qbJy0Su0ja6W9bfeJaKxcSSrSEi3UJlaOWgvisqcfE6l9r5TqIROhruSCUXYgZ34lcT/QV/e+SvwPjb9Vawp+KUwAAAABJRU5ErkJggg==") 16 16, crosshair;'
      $div.style = `z-index:9999;position:fixed;top:0;left:0;width:${
        img.width
      };height:${img.height};`
      document.body.appendChild($div)
      const ctx = $canvas.getContext('2d')

      ctx.drawImage(img, 0, 0)
      $canvas.addEventListener('mousemove', ev => {
        const x = ev.clientX
        const y = ev.clientY
        var pixel = ctx.getImageData(x, y, 1, 1)
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
        console.error(rgba)
      })
    })
  }
  sendResponse('我收到你的消息了：' + JSON.stringify(request))
})
  }
}
</script>