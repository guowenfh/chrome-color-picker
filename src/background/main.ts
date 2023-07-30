import { onMessage, sendMessage } from 'webext-bridge';

// only on dev mode
if (import.meta.hot) {
  // @ts-expect-error for background HMR
  import('/@vite/client')
  // load latest content script
  import('./contentScriptHMR')
}

/**
 * 将当前页面截图
 * @returns {Promise<string>}
 */
async function captureVisibleTab(): Promise<string> {
  return browser.tabs.captureVisibleTab(undefined, { format: 'png', quality: 100 })
}

const sourceEnum = {
  popup: 'screenshot',
  shortcutKey: 'original',
  contextMenu: 'original',
}

async function colorPickerOpen(source: string = sourceEnum.popup) {
  try {
    const tabId = await getCurrentTabId()
    const image = await captureVisibleTab()
    sendMessage(
      'color-picker-open',
      { src: image, source },
      { context: 'content-script', tabId },
    )
  }
  catch (error) {
    console.error('[chrome-color-picker]:[color-picker-open]:error', error)
  }
}

/**
 * 将当前页面截图
 * @returns {Promise<number>}
 */
async function getCurrentTabId(): Promise<number> {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true })
  return (tabs[0] as any)?.id || 0
}

browser.runtime.onInstalled.addListener((): void => {
  // eslint-disable-next-line no-console
  console.log('[chrome-color-picker]:Extension installed')
  browser.contextMenus.create({
    title: 'Color Picker',
    id: 'chrome-color-picker-menu',
  })
})
// 右键菜单
browser.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id)
    return
  if (info.menuItemId === 'chrome-color-picker-menu')
    await colorPickerOpen(sourceEnum.contextMenu)
})

// communication example: send previous tab title from background page
// see shim.d.ts for type declaration

onMessage('color-picker-start', async () => {
  await colorPickerOpen(sourceEnum.popup)
})

browser.commands.onCommand.addListener(async (command) => {
  if (command !== 'color-picker-start')
    return
  await colorPickerOpen(sourceEnum.shortcutKey)
});
