import { defineUserConfig } from "vuepress";
import theme from "./theme";

export default defineUserConfig({
  base: "/",
  locales: {
    "/": {
      lang: "zh-CN",
      title: "NixOS 中文",
      description: "非官方文档，由 NixOS-CN 社区驱动",
    },
  },
  theme,
  shouldPrefetch: false,
});
