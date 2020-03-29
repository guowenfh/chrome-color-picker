# chrome-color-picker

使用 @vue/cli3 + vue-cli-plugin-browser-extension + vue-color 驱动的 chrome 调试器风格的取色器插件。

Chrome 商店 已上架 地址 :[chrome-color-picker](https://chrome.google.com/webstore/detail/chrome-color-picker/ojaclcbknieckfcapcbifaijoocfmpaj?hl=zh-CN)

## 项目开发

```
yarn install
yarn run serve # dev 调试
yarn run build # 打包
yarn run lint  # 代码风格检查
```

项目介绍

使用 Alt+Shift+A 可以快捷呼出/关闭取色器

页面截图

1.弹出层

![pouup](./demo/popup.png)

2.右键菜单

![contextMenu](./demo/contextMenu.png)

3.移动取色器

![active](./demo/active.png)

change log：

- 1.4.1: 修复取色记录不正确的问题
- 1.4.0: 产品体验优化
- 1.1.0 ：添加 取色 键盘快捷方式 Alt+Shift+A
- 1.0.0 ：发布到 chrome 商店



