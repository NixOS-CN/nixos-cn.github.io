import { sidebar } from "vuepress-theme-hope";

export default sidebar([
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
    prefix: "/guide/env/dev/",
    collapsible: true,
    children: [
      "haskell"
    ],
  }
]);
