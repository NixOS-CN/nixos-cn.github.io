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
            "Subsystem"
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
        collapsible: false,
        children: [
            "/tutorials/lang/QuickOverview",
            "/tutorials/lang/Manuals",
            "/tutorials/module"
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
    }
]);
