<script setup lang="ts">
import copy from 'copy-to-clipboard';
import { defineProps, ref } from 'vue';
import { chunks, getDefaultColor, loadImage, pixelToRgba, rgbToHex, setColorList } from '~/composables/utils'

const { src } = defineProps(['src'])
const isInit = ref(false);
const imageSrc = ref<string>();
const activeHax = ref<string>();
const defaultBodyStyle = ref<any>({});
const $canvas = ref<HTMLCanvasElement | null>(null);
const $canvasContext = ref<CanvasRenderingContext2D | null>(null);
const imageStyle = ref<{ height: number; width: number }>({
  height: 0,
  width: 0,
});
const positionStyle = ref<any>({});
const matrix = ref<any[]>([]);

function onClose() {
  $canvas.value = null;
  $canvasContext.value = null;
  imageSrc.value = undefined;
  isInit.value = false;
  document.body.style.overflow = defaultBodyStyle.value.overflow;
  document.body.style.cursor = defaultBodyStyle.value.cursor;
  window.removeEventListener('keydown', onKeydown);
}

async function onClick() {
  copy(activeHax.value!)
  await setColorList(activeHax.value!)
  onClose();
}
/**
 * 键盘事件 如果按下 ESC 那么就关闭
 */
function onKeydown(ev: KeyboardEvent) {
  ev.stopPropagation();
  ev.preventDefault();
  // ESC 键
  if (ev.keyCode === 27 || ev.code === 'Escape')
    onClose();
}
function renderCanvas(img: CanvasImageSource) {
  $canvas.value = document.createElement('canvas');
  $canvasContext.value = $canvas.value.getContext('2d', {
    willReadFrequently: true,
  });
  $canvas.value.setAttribute('id', 'color-picker-canvas');
  $canvas.value.width = imageStyle.value.width;
  $canvas.value.height = imageStyle.value.height;
  $canvas.value.style.display = 'none';

  $canvasContext.value!.drawImage(
    img,
    0,
    0,
    imageStyle.value.width,
    imageStyle.value.height,
  );
}

async function onOpen(src: string) {
  // 如果是已经初始化过，直接返回，并且关闭
  if (isInit.value) {
    onClose();
    return;
  }
  // 1. 加载图片
  const computedStyle = window.getComputedStyle(document.body);
  defaultBodyStyle.value.overflow = computedStyle.overflow;
  defaultBodyStyle.value.cursor = computedStyle.cursor;
  // 鼠标手形
  document.body.style.cursor = 'wait';
  // 图片的渲染
  const image = await loadImage(src);
  imageStyle.value.height = Math.floor(image.height / window.devicePixelRatio);
  imageStyle.value.width = Math.floor(image.width / window.devicePixelRatio);
  // 2. 插入图片
  imageSrc.value = src;
  // 3. 渲染一个等高的 canvas
  renderCanvas(image);
  isInit.value = true;

  window.addEventListener('keydown', onKeydown, true);
  document.body.style.overflow = 'hidden';
  document.body.style.cursor = 'none';
}

function onMousemove(event: MouseEvent) {
  event.stopPropagation();
  event.preventDefault();
  requestAnimationFrame(() => {
    // 鼠标的显示
    const clientX = event.clientX;
    const clientY = event.clientY;
    // 数据原始 left top 的点
    const originX = clientX - 5;
    const originY = clientY - 5;

    const imageData = $canvasContext.value?.getImageData(
      originX,
      originY,
      11,
      11,
    );
    // 参考 https://developer.mozilla.org/zh-CN/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas
    // 每四个点表示一个 rgba 的值
    if (!imageData)
      return;
    const pixel = chunks(imageData.data as any, 4);
    const rgbArr = chunks(
      pixel.map(item => pixelToRgba(item)),
      11,
    );
    positionStyle.value = {
      top: `${clientY - 55}px`,
      left: `${clientX - 55}px`,
    };
    // 展示色板
    matrix.value = rgbArr.map((arr, yIndex) => {
      return arr.map((rgba, xIndex) => {
        const x = originX + xIndex;
        const y = originY + yIndex;
        const isActive = clientX === x && clientY === y;
        if (isActive) {
          activeHax.value = `#${rgbToHex(
            rgba.r,
            rgba.g,
            rgba.b,
          )}`.toUpperCase();
        }
        return {
          x,
          y,
          isActive,
          backgroundColor: rgba.rgba,
        };
      });
    });
  });
}

onMounted(() => {
  if (src)
    onOpen(src)
})

// onUnmounted
</script>

<template>
  <div class="top-0 right-0 z-99999 fixed">
    <div
      v-if="isInit"
      class="top-0 right-0 fixed ccp-wrap"
      :style="positionStyle"
    >
      <div class="ccp-area">
        <div
          v-for="(subArr, index) in matrix"
          :key="`label-${index}`"
          class="flex ccp-area-col"
        >
          <div
            v-for="item in subArr"
            :key="`${item.x}-${item.y}`"
            class="ccp-area-item"
            :style="{
              backgroundColor: item.backgroundColor,
              borderColor: `${item.isActive ? 'red' : '#ddd'}`,
            }"
          />
        </div>
      </div>
      <div v-if="!!activeHax" class="ccp-active">
        {{ activeHax }}
      </div>
    </div>
    <img
      v-if="!!imageSrc"
      :src="imageSrc"
      class="ccp-image"
      :style="{
        width: `${imageStyle.width}px`,
      }"
      @mousemove="onMousemove"
      @click="onClick"
    >
  </div>
</template>

<style>
.ccp-image {
  margin: 0px;
  padding: 0px;
  overflow: hidden;
  max-width: none !important;
  max-height: none !important;
  visibility: visible;
  height: auto;
  z-index: 999999;
}
.ccp-wrap {
  pointer-events: none;
  width: 110px;
}
.ccp-area {
  display: flex;
  flex-wrap: wrap;
  width: 110px;
  box-sizing: border-box;
  border-radius: 50%;
  overflow: hidden;
  border-collapse: collapse;
}
.ccp-area-col {
  width: 110px;
}
.ccp-area-item {
  box-sizing: border-box;
  height: 10px;
  width: 10px;
  border: 0.5px solid #ddd;
}
.ccp-active {
  background: #fff;
  color: rgba(0, 0, 0, 0.85);
  font-size: 14px;
  line-height: 22px;
  height: 22px;
  text-align: center;
  border-radius: 8px;
  margin: 8px;
}
</style>
