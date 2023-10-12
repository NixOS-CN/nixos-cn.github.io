import {sidebar} from "vuepress-theme-hope";

export default sidebar([
    {
        text: "安装教程",
        icon: "bulb",
        link: "/tutorials/installation/",
        prefix: "/tutorials/installation/",
        collapsible: true,
        children: [
            "VirtualMachine",
            "WSL2",
            "Subsystem"
        ],
    },
    {
        text: "伊始之章",
        link: "/tutorials/concept/",
        icon: "book-fill",
        prefix: "/tutorials/concept/",
        collapsible: true,
        children: [
            "BinaryAndSourceDistribution",
            "HowToResolvePathDependency",
            "ConfigurationIsTheBlueprintOfTheSystem",
            "HowFunctionalProgrammingShapesNixOS"
        ],
    },
    {
        text: "Nix 语言",
        link: "/tutorials/lang",
        icon: "nix",
    },
    {
        text: "开发环境部署",
        icon: "dev",
        link: "/tutorials/env/dev/",
        prefix: "/tutorials/env/dev/",
        collapsible: true,
        children: [
            "haskell"
        ],
    }
]);
