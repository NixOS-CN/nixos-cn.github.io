import { sidebar } from "vuepress-theme-hope";

export default sidebar([
  {
    text: "为什么是 NixOS",
    link: "/guide/whyNixOS.md",
    icon: "fa-solid fa-circle-question",
  },
  {
    text: "在尝试中实践",
    link: "/guide/greenhand",
    icon: "fa-solid fa-hand-back-fist",
  },
  {
    text: "Nix 语言",
    link: "/guide/lang",
    icon: "fa-solid fa-file-code",
  },
  {
    text: "常见问题",
    link: "/guide/faq.md",
    icon: "fa-solid fa-message",
    activeMatch: "^/guide/faq",
  },
  {
    text: "开发环境部署",
    icon: "fa-solid fa-code",
    link: "/guide/env/dev/",
    // 可选的，会添加到每个 item 链接地址之前
    prefix: "/guide/env/dev/",
    // 可选的, 设置分组是否可以折叠，默认值是 false,
    collapsible: true,
    // 必要的，分组的子项目
    children: [
      "haskell"
    ],
  }
]);
