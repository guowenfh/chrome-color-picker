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

// 向content-script注入JS片段
export function executeScriptToCurrentTab(code) {
  getCurrentTabId(tabId => {
    chrome.tabs.executeScript(tabId, { code: code })
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