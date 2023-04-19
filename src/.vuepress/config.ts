import {defineUserConfig} from "vuepress";
import {searchProPlugin} from "vuepress-plugin-search-pro";
import { removePWAPlugin } from "vuepress-plugin-remove-pwa";
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
    plugins: [searchProPlugin({indexContent: true}),removePWAPlugin({
      }),],
});
