import { defineUserConfig } from "vuepress"

import { removePwaPlugin } from "@vuepress/plugin-remove-pwa"
import { viteBundler } from "@vuepress/bundler-vite"
import cjk_breaks_plugin from "@searking/markdown-it-cjk-breaks"

import theme from "./theme"

export default defineUserConfig({
  base: "/",
  locales: {
    "/": {
      lang: "zh-CN",
      title: "NixOS 中文",
      description: "由 NixOS-CN 社区驱动",
    },
  },
  theme,
  shouldPrefetch: true,
  plugins: [removePwaPlugin({})],
  extendsMarkdown: (md) => {
    md.use(cjk_breaks_plugin)
  },
  bundler: viteBundler({
    viteOptions: {},
    vuePluginOptions: {},
  }),
})
