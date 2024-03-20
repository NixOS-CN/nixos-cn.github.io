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
            "HowToMakePath-dependentProgramsWork",
            "ConfigurationIsTheBlueprintOfTheSystem",
            "HowFunctionalProgrammingShapesNixOS",
            "PurityIsOurUltimatePursuit"
        ],
    },
    {
        text: "Nix 语言",
        link: "/tutorials/lang/",
        icon: "nix",
        collapsible: true,
        children: [
            "/tutorials/lang/Manuals",
            "/tutorials/lang/Utils",
            "/tutorials/module"
        ],
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
