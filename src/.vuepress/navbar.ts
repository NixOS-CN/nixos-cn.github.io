import {navbar} from "vuepress-theme-hope";

export default navbar([
    "/",
    {
        text: "检索工具",
        icon: "toolkit",
        children: [
            {
                text: "软件包",
                icon: "pkg",
                link: "https://search.nixos.org/packages",
            },
            {
                text: "Options",
                icon: "options",
                link: "https://search.nixos.org/options",
            },
            {
                text: "Channel 状态",
                icon: "nix-channel",
                link: "https://status.nixos.org/",
            },
            {
                text: "软件包 Pull Request 追踪",
                icon: "pullrequest",
                link: "https://nixpk.gs/pr-tracker.html",
            },
        ],
    },
]);
