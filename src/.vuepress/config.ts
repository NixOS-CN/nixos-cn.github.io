import { defineUserConfig } from "vuepress";

import { removePwaPlugin } from "@vuepress/plugin-remove-pwa";
import { viteBundler } from '@vuepress/bundler-vite'

import theme from "./theme";

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
    plugins: [
        removePwaPlugin({}),
    ],
    bundler: viteBundler({
        viteOptions: {},
        vuePluginOptions: {},
      }),
});