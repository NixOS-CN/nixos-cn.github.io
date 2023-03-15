# 渐进式了解

## Nix 生态构成简述

Nix 生态主要由 Nix 表达式语言，NixOS，Nix 包管理器，Nixpkgs，NixOps，Hydra 构成。

| 名称           | 描述                                                         |
| -------------- | ------------------------------------------------------------ |
| Nix 表达式语言 | Nix 表达式语言是一种函数式编程语言，用于描述软件包的构建过程、依赖关系和环境变量等信息。它支持函数定义、递归、模式匹配等特性，还支持嵌套语法，可描述复杂的依赖关系和构建过程。Nix 还支持原子事务，使得所有的包和环境都是原子的，不会相互影响。Nix 表达式语言可用于定义软件包和环境，也可用于描述系统配置。它是一种强大、灵活、可重复和可扩展的语言，用于管理软件包和环境。 |
| NixOS          | NixOS 是一种基于 Nix 包管理器的 Linux 发行版，具有高度可配置性、可重复性和安全性。它采用声明性配置，使用配置文件明确描述系统状态，使得配置更易于维护。NixOS 适用于需要高度可定制性的用例，如服务器和开发环境。 |
| Nix 包管理器   | Nix是跨平台的功能强大的包管理器，采用函数式编程思想描述依赖关系和多版本软件包管理，并提供一系列跨平台工具方便管理和部署。 |
| NixOps         | NixOps是基于NixOS的云部署管理工具，支持多云平台，提供简单的命令行接口，可创建、部署、升级和回滚NixOS。用户可通过编写Nix表达式自定义部署和配置，使其成为灵活、可扩展和可定制的工具。适合需要管理大型、复杂基础设施的组织。 |
| Hydra          | Hydra 是在 NixOS 中使用的 CI/CD 系统，它可以自动构建、测试和部署软件包，并决定是否发布和部署。Hydra 可以在不同环境下测试软件包，适用于开发、测试和部署任何类型的软件。 |
| Nixpkgs        | nixpkgs 是 Nix 软件包管理器的官方软件包集合，包含数以万计的软件包，并提供了构建、测试和部署工具，支持多平台和多架构，适用于开发、测试和部署各种类型的软件。 |

## 何谓 nix-channel

`nix-channel` 既是一个命令行工具也是“软件源”的别称，这个“软件”可以是系统也可以是软件包仓库。为了尽量避免混淆，我们接下来统一使用“频道”代称“软件源”。

### 命令行

`nix-channel` 命令行工具的使用：

```bash
nix-channel {--add url [name] | --remove name | --list | --update [names…] | --rollback [generation] }
```

看起来这个命令行工具提供的功能有：订阅频道，退订频道，列出频道，更新频道，还能回滚“生成”。

### 官方提供的频道（nix-channels）

官方提供了[官方频道集合](https://channels.nixos.org/)。订阅了其中的频道以后，就会从该频道获取包仓库或系统镜像的更新。

::: tip 默认订阅的频道

NixOS 默认订阅了官方频道 nixos，即使你安装完系统什么都不做，它们也是存在的：

```bash
sudo nix-channel -list  # 列出频道
```

```bash
nixos https://nixos.org/channels/nixos22.11
```

::: warning

这里的 `nixos` 与 `https://nixos.org/channels/nixos22.11` 并不是并列的，前者是频道名，后面是被订阅的 URL。

:::

请你尝试访问上面的 URL。正如我们所说，这是一个频道集合，根目录下的每一个子目录就代表一个频道，官方提供了若干个频道，这些频道功能和版本各异：

```
2022/8/4 22:59:10               0.1 kB         nixos-21.11-aarch64
2022/8/2 23:24:22               0.1 kB         nixos-21.11-small
2023/1/3 23:39:40               0.1 kB         nixos-22.05
2023/1/3 22:43:29               0.1 kB         nixos-22.05-aarch64
2023/1/2 04:11:11               0.1 kB         nixos-22.05-small
2023/3/14 13:56:02              0.1 kB         nixos-22.11
2023/3/15 03:53:42              0.1 kB         nixos-22.11-small
2023/3/13 18:40:11              0.1 kB         nixos-unstable
2023/3/14 19:23:44              0.1 kB         nixos-unstable-small
2023/3/15 07:13:34              0.1 kB         nixpkgs-22.11-darwin
2023/3/14 20:36:26              0.1 kB         nixpkgs-unstable
```

### 项目结构

我们以官方频道 `nixpkgs-unstable` 为例，查看每个频道大致的构成。它们似乎都提供了 `nixexprs.tar.xz`，从文件名我们就了解到这是一个包含了若干 nix 文件的 tar 压缩档案（Tarball）。

::: tip Tarball

Taball 是 `tar` 文件格式的全称，不是 Nix 独有。它可以将多个文件打包在一起。如果你想在打包的时候压缩一下，还可以使用 gzip，bzip2 等软件压缩该档案。

:::

于是我们解压它，列出目录树：

```powershell
├─.github
├─doc
├─lib
├─maintainers
├─nixos
└─pkgs
    ├─applications
    │  ├─accessibility
    │  │  ├─contrast
    │  │  └─wvkbd
    │  ├─audio
    │  │  ├─a2jmidid
    │  │  ├─ario
    │  │  ├─csound
    │  │  │  ├─csound-manual
    │  │  │  └─csound-qt
    ......
```

::: note 仅供演示

以上目录树是笔者删减过的部分，实际构成肯定有差别。

:::

上面的每个子目录中都有一个 `default.nix` 文件，这是导入该目录时默认被求值的文件。每个包名文件夹下面的 nix 文件，都是对于该软件包的描述。

::: tip

如果你还没有学习过 Nix 表达式语言，大抵是看不懂的，你可以前往 [Nix 语言概览](https://nixos-cn.org/guide/lang/) 进行初步学习。

:::

每个频道都应该提供一个名为 `nixexprs` 的 Tarball。其中 `default.nix`  既是根目录也是每一级目录的入口点。

## Nixpkgs

它是一个软件包集合，或者也可以被称为软件仓库？正如其他发行版一样，不同的系统版本对应了不同的软件包仓库，但是有人更加偏爱在 Release 的系统版本中使用 `nixpkgs-unstable` 软件频道，因为它们提供的包又多又新。

### 订阅官方的 nixpkgs-unstable 频道

```bash
nix-channel --add https://nixos.org/channels/nixpkgs-unstable  # 添加频道，不过我更喜欢称它为 “订阅”
nix-channel --update  # 更新频道
```

如此，你便订阅上了官方的 nixpkgs-unstable 软件源。

::: warning 自定义频道名

默认情况下，频道名是截取自 URL 的最后一级：

```bash
nix-channel --add https://URL/nixpkgs-unstable
```

我们列出频道名：

```bash
nixpkgs-unstable https://URL/nixpkgs-unstable
```

如果我们需要手动命名频道，增加一个参数即可：

```bash
nix-channel --add https://URL/nixpkgs-unstable nixpkgs
```

:::

### 使用镜像频道

由于不可抗力的因素，大陆对于环大陆主机的访问显得异常艰难，所以我们需要使用国内的镜像频道来加速我们的访问（镜像频道通常由大学和企业公益性提供），下面列出了一些在中国可用的一些镜像频道：

- [清华大学](https://mirrors.tuna.tsinghua.edu.cn/help/nix-channels/)
- [中国科技大学](https://mirrors.ustc.edu.cn/help/nix-channels.html)
- [上海交通大学](https://sjtug.org/post/mirror-help/nix-channels/)

我们使用清华大学的镜像源作订阅演示：

```bash
nix-channel --add https://mirrors.tuna.tsinghua.edu.cn/nix-channels/nixpkgs-unstable nixpkgs  # 订阅频道，并分配 nixpkgs 命名
nix-channel --update  # 更新频道
```

::: note

特地修改频道名是因为许多表达式都会把 nixpkgs 而不是 nixpkgs-unstable 作输入。

:::

## 什么是二进制构建缓存

## 如何更换镜像源

## 如何升级 NixOS 版本

NixOS 并不是 ArchLinux 那样的滚动发行版，所以需要定期更迭系统版本来获取最新的支持。
