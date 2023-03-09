# [Nix-CN 官方网站](https://nixos-cn.org/)

## 项目结构

本项目使用 [VuePress](https://vuepress.vuejs.org/zh/) 框架，辅以 [vuepress-hope-theme](https://vuepress-theme-hope.github.io/v2/zh/) 主题完成整体构建。

```bash
├─.vuepress
│  ├─dist  // 自动生成的静态页面
│  ├─public  // 网页资源，这里是一些图标
│  │  └─assets
│  │      └─icon
│  ├─styles  // 样式
   ├─config.ts  // 配置文件
   ├─navbar.ts  // 顶栏配置
   ├─sidebar.ts  // 侧栏配置
│  └─theme.ts  // 主题配置
│
├─docs  // 文档目录
└─guide  // 教程目录
    └─lang  // 语言教程
```

其中最为重要的两个目录是 `docs` 和 `guide`，你应该把文档或教程分别放置在那里，如果有必要，可以单独分出一个子文件夹。

如果你要在侧边栏添加导航目录，请修改 `theme.ts`。

## 许可证

本网站或项目内容采用 [Creative Commons Attribution Share Alike 4.0 International](LICENSES/CC-BY-SA-4.0.txt) 许可，样例代码则采用 [MIT](LICENSES/MIT.txt) 开源许可证，使用请遵循协议。

一些特别标注的文件或片段可能采用了不同的开源许可协议，请多多注意。
