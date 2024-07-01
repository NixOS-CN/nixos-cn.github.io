import {sidebar} from "vuepress-theme-hope";

export default sidebar([
    {
        text: "安装教程",
        icon: "bulb",
        prefix: "/tutorials/installation/",
        collapsible: false,
        children: [
            "VirtualMachine",
            "WSL2",
            "Subsystem",
            "Networking"
        ],
    },
    {
        text: "伊始之章",
        icon: "book-fill",
        prefix: "/tutorials/concept/",
        collapsible: false,
        children: [
            "BinaryAndSourceDistribution",
            "HowToMakePath-dependentProgramsWork",
            "ConfigurationIsTheBlueprintOfTheSystem",
            "HowFunctionalProgrammingShapesNixOS",
            "PurityIsOurUltimatePursuit"
        ],
    },
    {
        text: "Nix 语言",
        icon: "nix",
        prefix: "/tutorials/",
        collapsible: false,
        children: [
            "lang/QuickOverview",
            "lang/Manuals",
            "module-system/intro"
        ],
    },
    {
        text: "开发环境部署",
        icon: "dev",
        prefix: "/tutorials/env/dev/",
        collapsible: false,
        children: [
            "haskell"
        ],
    },
    {
        text: "NixOS 使用手册",
        icon: "nix",
        prefix: "/manual/",
        collapsible: false,
        children: [
            "Intro",
            "Configuration"
        ],
    },
]);
