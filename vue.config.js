module.exports = {
  pages: {
    'popup/popup': {
      entry: 'src/popup/popup.js',
      title: 'Popup'
    },
    popup: {
      template: 'public/browser-extension.html',
      entry: './src/popup/main.js',
      title: 'chrome-color-picker'
    }
  },
  pluginOptions: {
    browserExtension: {
      registry: undefined,
      components: {
        background: true,
        popup: true,
        contentScripts: true,
        standalone: true
      },
      api: 'browser',
      usePolyfill: true,
      autoImportPolyfill: true,
      componentOptions: {
        background: {
          entry: 'src/background.js'
        },
        contentScripts: {
          entries: {
            'content-script': ['src/content-scripts/content-script.js']
          }
        }
      }
    }
  }
}
