// 获取当前选项卡ID
export function getCurrentTabId(callback) {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (callback) callback(tabs.length ? tabs[0].id : null)
  })
}

// 向content-script主动发送消息
export function sendMessageToContentScript(message, callback) {
  getCurrentTabId(tabId => {
    chrome.tabs.sendMessage(tabId, message, function(response) {
      if (callback) callback(response)
    })
  })
}

/**
 * 从页面内容主动发送名单到后台等
 * @param {String}cmd 命令名称
 * @param {Object}data 数据
 * @param {Promise}cb 返回值
 */
export function sendMessageToBackground(cmd, data) {
  return new Promise(resolve => {
    chrome.runtime.sendMessage({ cmd, data }, function(response) {
      resolve(response)
    })
  })
}
// 向content-script注入JS片段
export function executeScriptToCurrentTab(code) {
  getCurrentTabId(tabId => {
    chrome.tabs.executeScript(tabId, { code: code })
  })
}

/**
 * 将当前页面截图
 * @returns {Promise<any>}
 */
export function captureVisibleTab() {
  return new Promise(resolve => {
    chrome.tabs.captureVisibleTab(null, {}, function(image) {
      resolve(image)
    })
  })
}

/**
 * Loads image element from given url and passes it to a callback
 * @memberOf fabric.util
 * @param {String} url URL representing an image
 * @param {Function} callback Callback; invoked with loaded image
 * @param {*} [context] Context to invoke callback in
 * @param {Object} [crossOrigin] crossOrigin value to set image element to
 */
export function loadImage(url, callback, context, crossOrigin) {
  if (!url) {
    callback && callback.call(context, url)
    return
  }
  // const img = document.createElement('img')
  var img = document.createElement('img')

  /** @ignore */
  var onLoadCallback = function() {
    callback && callback.call(context, img)
    img = img.onload = img.onerror = null
  }

  img.onload = onLoadCallback
  /** @ignore */
  img.onerror = function() {
    console.log('Error loading ' + img.src)
    callback && callback.call(context, null, true)
    img = img.onload = img.onerror = null
  }

  // data-urls appear to be buggy with crossOrigin
  // https://github.com/kangax/fabric.js/commit/d0abb90f1cd5c5ef9d2a94d3fb21a22330da3e0a#commitcomment-4513767
  // see https://code.google.com/p/chromium/issues/detail?id=315152
  //     https://bugzilla.mozilla.org/show_bug.cgi?id=935069
  if (url.indexOf('data') !== 0 && crossOrigin) {
    img.crossOrigin = crossOrigin
  }

  img.src = url
}

export function chunks(arr = [], size) {
  const r = []
  for (let i = 0; i < arr.length; i += size) {
    r.push(arr.slice(i, i + size))
  }
  return r
}
export function clacToOffsetArray(base, offset = 1, isAdd = true) {
  return [...Array(offset + 1)].reduce((newArr, item, index) => {
    if (isAdd) {
      newArr.push(base + index)
    } else {
      newArr = [base - index].concat(newArr)
    }
    return newArr
  }, [])
}
/**
 * 给定一个点，计算出来向前后各引申50个值的
 * @export
 * @param {*} x
 * @param {*} y
 */
export function getRectPoint(x, y, offset = 5) {
  const minXPosArr = clacToOffsetArray(x, offset, false)
  const maxXPosArr = clacToOffsetArray(x, offset, true)
  const minYPosArr = clacToOffsetArray(y, offset, false)
  const maxYPosArr = clacToOffsetArray(y, offset, true)
  const xPos = [...new Set(minXPosArr.concat(maxXPosArr))]
  const yPos = [...new Set(minYPosArr.concat(maxYPosArr))]
  const matrix = yPos.map(y => {
    return xPos.map(x => ({
      x: x,
      y: y
    }))
  })
  return matrix
}

export function getDefaultColor() {
  return [
    '4D4D4D',
    '999999',
    'FFFFFF',
    'F44E3B',
    'FE9200',
    'FCDC00',
    'DBDF00',
    'A4DD00',
    '68CCCA',
    '73D8FF',
    'AEA1FF',
    'FDA1FF',
    '333333',
    '808080',
    'CCCCCC',
    'D33115'
  ]
}
