import { onMessage, sendMessage } from 'webext-bridge';

import type { Tabs } from 'webextension-polyfill';

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client');
  // load latest content script
  import('./contentScriptHMR');
}
/**
 * 将当前页面截图
 * @returns {Promise<number>}
 */
async function getCurrentTabId(): Promise<number> {
  if (previousTabId) {
    return Promise.resolve(previousTabId);
  }
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  return (tabs[0] as any)?.id || 0;
}
/**
 * 将当前页面截图
 * @returns {Promise<string>}
 */
async function captureVisibleTab(): Promise<string> {
  return browser.tabs.captureVisibleTab(undefined, { format: 'png' });
}

async function colorPickerOpen(id?:number) {
  try {
    const image = await captureVisibleTab();
    let tabId = id
    if(!tabId) tabId = await getCurrentTabId();
    sendMessage(
      'color-picker-open',
      { src: image },
      { context: 'content-script', tabId: tabId }
    );
  } catch (error) {
    console.error('[color-picker-start]', error);
  }  
}

browser.runtime.onInstalled.addListener((): void => {
  // eslint-disable-next-line no-console
  console.log('Extension installed');
  browser.contextMenus.create({
    title: 'Color Picker',
    id: 'chrome-color-picker-menu',
  });
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id) return;
  if (info.menuItemId === 'chrome-color-picker-menu') {
    await colorPickerOpen()
  }
});

let previousTabId = 0;

// communication example: send previous tab title from background page
// see shim.d.ts for type declaration
browser.tabs.onActivated.addListener(async ({ tabId }) => {
  if (!previousTabId) {
    previousTabId = tabId;
    return;
  }

  let tab: Tabs.Tab;

  try {
    tab = await browser.tabs.get(previousTabId);
    previousTabId = tabId;
  } catch {
    return;
  }

  // eslint-disable-next-line no-console
  console.log('previous tab', tab);
  sendMessage(
    'tab-prev',
    { title: tab.title },
    { context: 'content-script', tabId }
  );
});

onMessage('get-current-tab', async () => {
  try {
    const tab = await browser.tabs.get(previousTabId);
    return {
      title: tab?.title,
    };
  } catch {
    return {
      title: undefined,
    };
  }
});



onMessage('color-picker-start', async () => {
  await colorPickerOpen()
});
