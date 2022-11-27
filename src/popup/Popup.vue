<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { sendMessage } from 'webext-bridge'
import { Chrome } from '@ckpack/vue-color'
import copy from 'copy-to-clipboard'
import { getDefaultColor } from '~/composables/utils'
import { useStorageLocal } from '~/composables/useStorageLocal'

const isStartPicker = ref(false)
const svgFill = computed(() => {
  return isStartPicker.value ? '#008dff' : '#666'
})
const $picker = ref<any>(null)
const currentColor = ref('red')

/**
 * 吸管 的 svg
 */
function getSvgHtml(svgFill: string) {
  return `<svg width="12px" height="12px" viewBox="0 0 12 12" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
    <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
      <g transform="translate(-2.000000, -2.000000)" fill="${svgFill}">
        <rect opacity="0" x="0" y="0" width="16" height="16"></rect>
        <path d="M13.8033333,3.75333333 L12.2466667,2.19666666 C11.9866667,1.93666666 11.5633333,1.93666666 11.3033333,2.19666666 L9.22,4.27999998 L7.94333333,2.99999998 L7,3.94333331 L7.94666667,4.88999998 L2,10.8333333 L2,14 L5.16666667,14 L11.1133333,8.05333331 L12.0566667,8.99999998 L13,8.05666666 L11.72,6.77666666 L13.8033333,4.69333333 C14.0666667,4.43333333 14.0666667,4.01333333 13.8033333,3.75333333 Z M4.61333333,12.6666667 L3.33333333,11.3866667 L8.71,6.01 L9.99,7.29 L4.61333333,12.6666667 Z"  fill-rule="nonzero"></path>
      </g>
    </g>
  </svg>`
}

function pickerClick() {
  isStartPicker.value = !isStartPicker.value
  $picker.value.innerHTML = getSvgHtml(svgFill.value)
  if (!isStartPicker.value)
    return
  // 通知到 bg 截图，再通过 bg 发送给 content-script
  sendMessage('color-picker-start', { data: null })
  window.close()
}
const colorList = useStorageLocal('color-picker-color-list', getDefaultColor(), { listenToStorageChanges: true })
watch(colorList, () => {
  currentColor.value = colorList.value[0]
})
onMounted(() => {
  const $strawWrap = document.querySelector('.vc-chrome-controls')
  if (!$strawWrap)
    return
  $picker.value = document.createElement('div')
  $picker.value.style = 'position:absolute;top:10px;left:2px;cursor: pointer;'
  $picker.value.innerHTML = getSvgHtml(svgFill.value)
  $strawWrap.appendChild($picker.value)
  $picker.value.addEventListener('click', pickerClick)
})
function onFillColor(color: string) {
  currentColor.value = color
  copy(color)
}
</script>

<template>
  <main class="flex flex-col h-[300px] text-center w-[225px]">
    <Chrome v-model="currentColor" />
    <div class="flex flex-wrap py-2.5 pl-2">
      <div
        v-for="(item, index) in colorList"
        :key="`${index}-${item}`"
        class="h-5 shadow mx-[3px] mt-1 w-5"
      >
        <div
          class="cursor-pointer h-full w-full"
          :style="{ backgroundColor: `${item}` }"
          @click="onFillColor(`${item}`)"
        />
      </div>
    </div>
  </main>
</template>
