import 'uno.css';

import copy from 'copy-to-clipboard';
import { createApp } from 'vue';
import { onMessage } from 'webext-bridge';
import { setColorList } from '~/composables/utils';

// eslint-disable-next-line import/order
import App from './views/App.vue';

/* eslint-disable no-console */

// Firefox `browser.tabs.executeScript()` requires scripts return a primitive value
console.info('[chrome-color-picker] Hello world from content script')
// const view: any = null;
// communication example: send previous tab title from background page

// mount component to context window
const container = document.createElement('div')
const root = document.createElement('div')
const styleEl = document.createElement('link')
const shadowDOM = container.attachShadow?.({ mode: __DEV__ ? 'open' : 'closed' }) || container
styleEl.setAttribute('rel', 'stylesheet')
styleEl.setAttribute('href', browser.runtime.getURL('dist/contentScripts/style.css'))
shadowDOM.appendChild(styleEl)
shadowDOM.appendChild(root)
document.body.appendChild(container);
onMessage('color-picker-open', async ({ data }) => {
  if ((window as any).EyeDropper && window.AbortController && data.source === 'original') {
    try {
      const controller = new AbortController();
      const signal = controller.signal;
      const eyeDropper = new (window as any).EyeDropper({ signal });
      const data = await eyeDropper.open()
      const hexColor = data.sRGBHex.toUpperCase()
      await setColorList(hexColor)
      copy(hexColor)
      controller.abort();
    }
    catch (error) {

    }
  }
  else {
    createApp(App, { src: data.src }).mount(root)
  }
});

