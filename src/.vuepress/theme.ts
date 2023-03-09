import { hopeTheme } from "vuepress-theme-hope";
import navbar from "./navbar";
import sidebar from "./sidebar";
export default hopeTheme({
  hostname: "https://nixos-cn.github.io",
  author: {
    name: "NixOS-CN",
    url: "https://github.com/nixos-cn",
  },
  iconAssets: "fontawesome",
  logo: "/logo.svg",
  repo: "nixos-cn/nixos-cn.github.io",
  docsDir: "src",
  print: false,
  locales: {
    "/": {
      navbar,
      sidebar,
      footer:
        `<a href="https://t.me/nixos_zhcn" target="_blank">
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
    pwa: {
      favicon: "/favicon.ico",
      cacheHTML: true,
      cachePic: true,
      appendBase: true,
      apple: {
        icon: "/assets/icon/apple-icon-152.png",
        statusBarColor: "black",
      },
      msTile: {
        image: "/assets/icon/ms-icon-144.png",
        color: "#ffffff",
      },
      manifest: {
        icons: [
          {
            src: "/assets/icon/chrome-mask-512.png",
            sizes: "512x512",
            purpose: "maskable",
            type: "image/png",
          },
          {
            src: "/assets/icon/chrome-mask-192.png",
            sizes: "192x192",
            purpose: "maskable",
            type: "image/png",
          },
          {
            src: "/assets/icon/chrome-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/assets/icon/chrome-192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
        shortcuts: [
          {
            name: "Demo",
            short_name: "Demo",
            url: "/demo/",
            icons: [
              {
                src: "/assets/icon/guide-maskable.png",
                sizes: "192x192",
                purpose: "maskable",
                type: "image/png",
              },
            ],
          },
        ],
      },
    },
  },
});
