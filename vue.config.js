module.exports = {
  pages: {
    'popup/popup': {
      entry: 'src/popup/popup.js',
      title: 'Popup'
    },
    'standalone/standalone': {
      entry: 'src/standalone/standalone.js',
      filename: 'app.html',
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
            'content_scripts/content-script': [
              'src/content_scripts/content-script.js'
            ]
          }
        }
      }
    }
  }
}
