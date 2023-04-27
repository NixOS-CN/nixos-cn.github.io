import {sidebar} from "vuepress-theme-hope";

export default sidebar([
    {
        text: "安装教程",
        link: "/guide/installation",
        icon: "bulb",
    },
    {
        text: "使用手册",
        link: "/manual/",
        icon: "book-fill",
        prefix: "/manual/",
        collapsible: true,
        children: [
            "configuration"
        ],
    },
    {
        text: "Nix 表达式语言",
        link: "/guide/lang",
        icon: "nix",
    },
    {
        text: "开发环境部署",
        icon: "dev",
        link: "/guide/env/dev/",
        prefix: "/guide/env/dev/",
        collapsible: true,
        children: [
            "haskell"
        ],
    }
]);
