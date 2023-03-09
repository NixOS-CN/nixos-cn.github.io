import { navbar } from "vuepress-theme-hope";

export default navbar([
  "/", // 主页
  /* 检索工具 */
  {
    text: "检索工具",
    icon: "fa-solid fa-screwdriver-wrench",
    children: [
      {
        text: "软件包",
        icon: "fa-solid fa-box-archive",
        link: "https://search.nixos.org/packages",
      },
      {
        text: "Options",
        icon: "fa-solid fa-code",
        link: "https://search.nixos.org/options",
      },
      {
        text: "Channel 状态",
        icon: "fa-solid fa-boxes-packing",
        link: "https://status.nixos.org/",
      },
      {
        text: "软件包 Pull Request 追踪",
        icon: "fa-solid fa-code-pull-request",
        link: "https://nixpk.gs/pr-tracker.html",
      },
    ],
  },
]);
