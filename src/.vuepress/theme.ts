import { hopeTheme } from "vuepress-theme-hope";
import navbar from "./navbar";
import sidebar from "./sidebar";

export default hopeTheme({
    hostname: "https://nixos-cn.github.io",
    author: {
        name: "NixOS-CN",
        url: "https://github.com/nixos-cn",
    },
    iconAssets: "https://at.alicdn.com/t/c/font_4043253_1nmpv7tr2vk.css",
    iconPrefix: "iconfont icon-",
    logo: "/nixos-cn.svg",
    repo: "nixos-cn/nixos-cn.github.io",
    docsDir: "src",
    print: false,
    locales: {
        "/": {
            navbar,
            sidebar,
            footer: `<a href="https://t.me/nixos_zhcn" target="_blank">
          Telegram 群组
        </a> | 
        <a href="https://matrix.to/#/#zh-cn:nixos.org" target="_blank">
          Matrix 群组
        </a> | 
        <a href="https://nixos.org/" target="_blank">
          NixOS 官网
        </a>`,
            displayFooter: true,
            metaLocales: {
                editLink: "前往 GitHub 编辑此页",
            },
        },
    },

    plugins: {
        mdEnhance: {
            align: true,
            attrs: true,
            codetabs: true,
            container: true,
            demo: true,
            figure: true,
            flowchart: true,
            gfm: true,
            imgLazyload: true,
            imgSize: true,
            include: true,
            katex: true,
            mark: true,
            mermaid: true,
            stylize: [
                {
                    matcher: "Recommended",
                    replacer: ({ tag }) => {
                        if (tag === "em")
                            return {
                                tag: "Badge",
                                attrs: { type: "tip" },
                                content: "Recommended",
                            };
                    },
                },
            ],
            sub: true,
            sup: true,
            tabs: true,
            vPre: true,
        },
    },
});
