import { hopeTheme } from "vuepress-theme-hope";

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
      navbar: [
        "/",
        {
          text: "检索工具",
          icon: "fa-solid fa-screwdriver-wrench",
          children: [
            {
              text: "包检索",
              icon: "fa-solid fa-box-archive",
              link: "https://search.nixos.org/packages",
            },
            {
              text: "选项检索",
              icon: "fa-solid fa-code",
              link: "https://search.nixos.org/options",
            },
          ],
        },
      ],

      sidebar: [
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
          link: "/docs/lang",
          icon: "fa-solid fa-file-code",
        },
        {
          text: "常见问题",
          link: "/guide/faq.md",
          icon: "fa-solid fa-message",
          activeMatch: "^/guide/faq",
        },
      ],

      footer:
        '<a href="https://t.me/nixos_zhcn" target="_blank">Telegram 群组</a> | <a href="https://matrix.to/#/#zh-cn:nixos.org" target="_blank"> Matrix 群组</a> | <a href="https://nixos.org/" target="_blank">NixOS 官网</a>',

      displayFooter: true,
      metaLocales: {
        editLink: "前往 GitHub 编辑此页",
      },
    },
  },

  plugins: {
    // components: {
    //   // 你想使用的组件
    //   components: ["SiteInfo"],
    // },
    // comment: {
    //   // @ts-expect-error: You should generate and use your own comment service
    //   provider: "Waline",
    // },

    // all features are enabled for demo, only preserve features you need here
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
