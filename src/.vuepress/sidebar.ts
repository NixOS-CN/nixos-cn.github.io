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
    text: "NixOS 中的 Haskell",
    link: "/guide/nixpkgsHsInfra",
    icon: "fa-solid fa-laptop-code",
  },
  {
    text: "常见问题",
    link: "/guide/faq.md",
    icon: "fa-solid fa-message",
    activeMatch: "^/guide/faq",
  },
]);
