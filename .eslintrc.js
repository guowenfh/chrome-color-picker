module.exports = {
  root: true,
  env: {
    node: true,
    webextensions: true
  },
  extends: ['plugin:vue/essential', '@vue/prettier'],
  rules: {
    // 要求或禁止使用分号而不是 ASI（这个才是控制行尾部分号的，）
    semi: [2, 'never'],
    // 强制使用一致的反勾号、双引号或单引号
    quotes: [2, 'single', 'avoid-escape'],
    'vue/no-unused-components': 0,
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        bracketSpacing: true,
        semi: false
      }
    ]
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
