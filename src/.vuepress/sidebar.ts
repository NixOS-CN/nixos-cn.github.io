import {sidebar} from "vuepress-theme-hope";

export default sidebar([
    {
        text: "安装手册",
        link: "/guide/greenhand",
        icon: "fa-solid fa-person-walking-luggage",
    },
    {
        text: "渐进式学习",
        link: "/guide/faq.md",
        icon: "fa-solid fa-chalkboard-user",
    },
    {
        text: "Nix 表达式语言",
        link: "/guide/lang",
        icon: "fa-solid fa-file-code",
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
