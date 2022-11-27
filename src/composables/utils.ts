import { storageLocal } from '~/composables/useStorageLocal';

export function pixelToRgba(data: number[] = []) {
  const r = data[0];
  const g = data[1];
  const b = data[2];
  const a = (data[3] / 255).toFixed(2);
  const rgba = `rgba(${r}, ${g}, ${b}, ${a})`;
  return {
    rgba,
    r,
    g,
    b,
    a,
  };
}

export function rgbToHex(r: number, g: number, b: number) {
  return ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
export function rgbStringToHex(str: string) {
  const match = str.match(/rgb\((\d+)\,\s+(\d+)\,\s+(\d+)\)/)
  if (!match)
    return ''
  return rgbToHex(Number(match[1]), Number(match[2]), Number(match[3]))
}
/**
 * Loads image element from given url and passes it to a callback
 * @param {String} url URL representing an image
 * @param {Object} [crossOrigin] crossOrigin value to set image element to
 */
export function loadImage(url: string, crossOrigin?: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    if (!url) {
      // eslint-disable-next-line prefer-promise-reject-errors
      reject('not url');
      return;
    }
    // const img = document.createElement('img')
    let img: any = document.createElement('img');

    /** @ignore */
    const onLoadCallback = function () {
      resolve(img);
      img = img.onload = img.onerror = null;
    };

    img.onload = onLoadCallback;
    /** @ignore */
    img.onerror = function () {
      // eslint-disable-next-line no-console
      console.log(`[chrome-color-picker] Error loading ${img.src}`);
      // eslint-disable-next-line prefer-promise-reject-errors
      reject(`Error loading ${img.src}`);
      img = img.onload = img.onerror = null;
    };
    // data-urls appear to be buggy with crossOrigin
    // https://github.com/kangax/fabric.js/commit/d0abb90f1cd5c5ef9d2a94d3fb21a22330da3e0a#commitcomment-4513767
    // see https://code.google.com/p/chromium/issues/detail?id=315152
    //     https://bugzilla.mozilla.org/show_bug.cgi?id=935069
    if (url.indexOf('data') !== 0 && crossOrigin)
      img.crossOrigin = crossOrigin;

    img.src = url;
  });
}

export function chunks(arr: any[] = [], size: number) {
  const r = []
  for (let i = 0; i < arr.length; i += size)
    r.push(arr.slice(i, i + size))

  return r
}
export function calcToOffsetArray(base: number, offset = 1, isAdd = true) {
  return [...Array(offset + 1)].reduce((newArr, item, index) => {
    if (isAdd)
      newArr.push(base + index)

    else
      newArr = [base - index].concat(newArr)

    return newArr
  }, [])
}

/**
 * 给定一个点，计算出来向前后各引申50个值的
 * @export
 * @param {*} x
 * @param {*} y
 */
export function getRectPoint(x: number, y: number, offset = 5) {
  const minXPosArr = calcToOffsetArray(x, offset, false)
  const maxXPosArr = calcToOffsetArray(x, offset, true)
  const minYPosArr = calcToOffsetArray(y, offset, false)
  const maxYPosArr = calcToOffsetArray(y, offset, true)
  const xPos = [...new Set(minXPosArr.concat(maxXPosArr))]
  const yPos = [...new Set(minYPosArr.concat(maxYPosArr))]
  const matrix = yPos.map((y) => {
    return xPos.map(x => ({
      x,
      y,
    }))
  })
  return matrix
}

/**
 * 一组默认值
 * @returns
 */
export function getDefaultColor() {
  return [
    '#4D4D4D',
    '#999999',
    '#FFFFFF',
    '#F44E3B',
    '#FE9200',
    '#FCDC00',
    '#DBDF00',
    '#A4DD00',
    '#68CCCA',
    '#73D8FF',
    '#AEA1FF',
    '#FDA1FF',
    '#333333',
    '#808080',
    '#CCCCCC',
    '#D33115',
  ]
}

export const setColorList = async (color: string) => {
  const list = await storageLocal.getItem('color-picker-color-list')
  let newList = []
  if (Array.isArray(list)) {
    newList = list
  }
  else if (typeof list === 'string') {
    try {
      newList = JSON.parse(list)
    }
    catch (error) {

    }
  }
  else {
    newList = getDefaultColor()
  }

  newList.pop()
  newList.unshift(color)
  await storageLocal.setItem('color-picker-color-list', JSON.stringify(newList))
}
