import fs from 'fs-extra';

import { isDev, port, r } from '../scripts/utils';

import type { Manifest } from 'webextension-polyfill'
import type PkgType from '../package.json'
export async function getManifest() {
  const pkg = await fs.readJSON(r('package.json')) as typeof PkgType

  // update this file to update this manifest.json
  // can also be conditional based on your need
  const manifest: Manifest.WebExtensionManifest = {
    manifest_version: 2,
    name: pkg.displayName || pkg.name,
    version: pkg.version,
    description: pkg.description,
    browser_action: {
      default_icon: './assets/icons/48.png',
      default_popup: './dist/popup/index.html',
    },
    // options_ui: {
    //   page: './dist/options/index.html',
    //   open_in_tab: true,
    //   chrome_style: false,
    // },
    background: {
      page: './dist/background/index.html',
      persistent: false,
    },
    icons: {
      16: './assets/icons/16.png',
      48: './assets/icons/48.png',
      128: './assets/icons/128.png',
    },
    permissions: [
      'tabs',
      'clipboardWrite',
      'storage',
      'activeTab',
      'contextMenus',
      '<all_urls>',
    ],
    "commands": {
      "color-picker-start": {
        "suggested_key": {
          "default": "Alt+Shift+A",
          "mac": "Alt+Shift+A"
        },
        "description": "Quick Color Pick-up"
      }
    },
    content_scripts: [{
      matches: ['<all_urls>'],
      js: ['./dist/contentScripts/index.global.js'],
    }],
    web_accessible_resources: [
      'dist/contentScripts/style.css',
    ],
  }

  if (isDev) {
    // for content script, as browsers will cache them for each reload,
    // we use a background script to always inject the latest version
    // see src/background/contentScriptHMR.ts
    delete manifest.content_scripts
    manifest.permissions?.push('webNavigation')

    // this is required on dev for Vite script to load
    manifest.content_security_policy = `script-src \'self\' http://localhost:${port}; object-src \'self\'`
  }

  return manifest
}
