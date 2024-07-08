# NixOS 入门

<!-- prettier-ignore -->
::: warning 内容施工中
本节内容正在修缮中，当前内容可能已经过时，仅供参考。

<!-- prettier-ignore -->
:::

## 何谓 nix-channel

`nix-channel` 是一个命令行工具，用于订阅系统频道和软件频道。

### 命令行

`nix-channel` 命令行工具的使用：

```bash
nix-channel {--add url [name] | --remove name | --list | --update [names…] | --rollback [generation] }
```

看起来，这个命令行工具提供的功能有：订阅频道，退订频道，列出频道，更新频道，还能
回滚“生成”。

### 频道是什么

上面我们演示了命令行工具的使用方式，却没有告知频道从哪里获取。

频道最直接的体现是一个形如 `https://nixos.org/channels/nixos22.11` 的 URL。

官方提供了[官方频道集合](https://channels.nixos.org/)。订阅了其中的频道以后，就
会从相应的频道获取更新，大致和你使用其他发行版的软件源类似，不过我们后面会详述
NixOS 中的“频道”概念和传统发行版中“软件源”的区别。

请你尝试访问上面的 URL。正如我们所说，这是一个频道集合，根目录下的每一个子目录就
代表一个频道，官方提供了若干个频道：

```
2022/8/4 22:51:25               0.1 kB         nixos-21.11
2022/8/4 22:59:10               0.1 kB         nixos-21.11-aarch64
2022/8/2 23:24:22               0.1 kB         nixos-21.11-small
2023/1/3 23:39:40               0.1 kB         nixos-22.05
2023/1/3 22:43:29               0.1 kB         nixos-22.05-aarch64
2023/1/2 04:11:11               0.1 kB         nixos-22.05-small
2023/3/16 05:19:03              0.1 kB         nixos-22.11
2023/3/16 22:18:18              0.1 kB         nixos-22.11-small
2023/3/16 14:55:20              0.1 kB         nixos-unstable
2023/3/16 21:27:06              0.1 kB         nixos-unstable-small
2023/1/2 21:05:38               0.1 kB         nixpkgs-22.05-darwin
2023/3/17 00:30:11              0.1 kB         nixpkgs-22.11-darwin
2023/3/16 04:06:35              0.1 kB         nixpkgs-unstable
```

### 项目结构

我们以官方频道 `nixpkgs-unstable` 为例，查看每个频道大致的构成。它们似乎都提供了
`nixexprs.tar.xz`，从文件名我们就了解到这是一个包含了若干 nix 文件的 tar 压缩档
（Tarball）。

<!-- prettier-ignore -->
::: tip Tarball
Tarball 是 `tar` 文件格式的全称，不是 Nix 独有。它可以将多个文件打包在一起。如果
你想在打包的时候压缩一下，还可以使用 gzip，bzip2 等软件压缩该档案。当你对 `tar`
文件启用压缩以后，后缀名会变更为 `tar.gz`, `tar.bz2` 等，具体取决于你使用的压缩
软件。

<!-- prettier-ignore -->
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

<!-- prettier-ignore -->
::: note 仅供演示
以上目录树是笔者为了方便演示而精简过的部分，实际构成肯定有差别。

<!-- prettier-ignore -->
:::

上面的每个子目录中都有一个 `default.nix` 文件，这是导入该目录时默认被求值的文
件。每个包名文件夹下面的 `nix` 文件，这些文件和脚本类似，运行它们时，会从五湖四
海获取源码和其他资源，再根据脚本的描述构建出相应的二进制包。

<!-- prettier-ignore -->
::: tip
如果你还没有学习过 Nix 表达式语言，大抵是看不懂的，你可以前往
[Nix 语言概览](https://nixos-cn.org/guide/lang/) 进行初步学习。

<!-- prettier-ignore -->
:::

每个频道都应该提供一个名为 `nixexprs` 的 Tarball。其中 `default.nix` 既是根目录
也是每一级目录的入口点。

## 系统频道与软件仓库频道

频道在 NixOS 中大致被分为两类：系统频道和软件仓库频道。

### 系统频道

系统频道可以从 URL 中直观的体现。形如 `https://nixos.org/channels/nixos22.11` 你
很快就了解到这是一个 22.11 版本的 NixOS 的频道。

<!-- prettier-ignore -->
::: tip 默认订阅的频道

NixOS 默认订阅了官方频道 `nixos`，即使你安装完系统什么都不做，它们也是存在的：

```bash
sudo nix-channel --list  # 列出频道
```

```bash
nixos https://nixos.org/channels/nixos22.11
```

这个频道提供了组成系统的一些驱动，设施等等。

<!-- prettier-ignore -->
:::

<!-- prettier-ignore -->
::: warning

这里的 `nixos` 与 `https://nixos.org/channels/nixos22.11` 并不是并列关系，前者是
频道名，后面是被订阅的 URL。

当你有两个及两个以上频道的时候，你就会理解我的意思：

```bash
nixos https://nixos.org/channels/nixos22.11
nixpkgs https://nixos.org/channels/nixpkgs-unstable
```

除非升级系统或更换镜像频道，否则不要动系统默认的 `nixos` 频道。

<!-- prettier-ignore -->
:::

#### 一些特殊的频道

- 稳定（stable）频道。如 `nixos-22.11`。这些频道只能得到保守的错误修复和软件包升
  级。例如，频道更新可能会导致系统上的Linux内核从 4.19.34 升级到 4.19.38（一个小
  错误修复），但不会从 4.19.x 升级到 4.20.x（一个可能会破坏一切的重大更改）。在
  创建下一个稳定分支之前，通常会保持稳定的频道。
- 不稳定（unstable）频道。这与 `nixos` 的主要开发分支相对应，因此可能有破坏性更
  新，不建议用于生产系统。
- 小型（small）频道，如 `nixos-22.11-small` 或 `nix-unstable-small`。这些频道与
  上述稳定和不稳定频道相同，只是它们包含较少的二进制包。这意味着它们比常规通道更
  新得更快（例如，当一个关键的安全补丁被提交到 NixOS 的源代码树时），但可能有更
  多的包需要从源代码构建。它们主要用于服务器环境，因此包含很少的 GUI 应用程序。

要查看可用的频道，请转到[官方频道](https://nixos.org/channels)。（请注意，各种频
道的 URI 重定向到一个包含最新版本频道的目录，还包括 ISO 映像和 VirtualBox 设
备。）

请注意，在发布过程中，尚未发布的频道也将出现在此处。请参
阅[官方 Getting NixOS 页面](https://nixos.org/nixos/download.html)以查找最新支持
的稳定版本。

#### 升级系统 #TODO

你可以使用以下命令获取当前的 `nixos` 频道

```bash
nix-channel --list | grep nixos
```

要切换到不同的NixOS通道，请执行

```bash
nix-channel --add https://nixos.org/channels/channel-name nixos
```

以 `nixos` 22.11 为例，命令为

```bash
nix-channel --add https://nixos.org/channels/nixos-22.11 nixos
```

使用以下命令以开始切换

```bash
nixos-rebuild switch --upgrade
```

该命令相当于 `nix-channel --update nixos`; `nixos-rebuild switch`

<!-- prettier-ignore -->
::: note
频道的切换是以用户为单位的。当你不以 `root` 权限执行时，不会影响
`/etc/nixos/configuration.nix` 的配置。

<!-- prettier-ignore -->
:::

<!-- prettier-ignore -->
::: warning
在频道之间来回切换通常是安全的。唯一的例外是，一个较新的NixOS也可能有一个较低的
Nix版本，这可能涉及到Nix数据库模式的升级。这是不容易撤消的，所以在这种情况下，您
将无法返回到原始频道。

<!-- prettier-ignore -->
:::

### 软件仓库频道

软件仓库频道不仅仅可以为 NixOS 使用，其他 Linux 发行版也可以安装 Nix 包管理器从
中获取软件包，甚至 Darwin 也可以。

#### 订阅 `nixpkgs-unstable` 频道

<!-- prettier-ignore -->
::: tip nixpkgs 仓库
nixpkgs 仓库更新非常快，所以没有稳定版。不过 darwin 是例外，因为 Nix 包管理器不
能保证实时兼容当前的 darwin 平台，所以要做版本控制。

<!-- prettier-ignore -->
:::

```bash
sudo nix-channel --add https://nixos.org/channels/nixpkgs-unstable  # 添加频道，不过我更喜欢称它为 “订阅”
sudo nix-channel --update  # 更新频道
```

如此，你便订阅上了官方的 nixpkgs-unstable 软件源。

<!-- prettier-ignore -->
::: warning 推荐订阅镜像频道
上文仅供教学。在下一节我们会指引大家订阅国内能正常访问的镜像频道，键入下面的命令
以退订官方的 `nixpkgs-unstable` 频道：

```bash
sudo nix-channel --remove nixpkgs-unstable
```

<!-- prettier-ignore -->
:::

<!-- prettier-ignore -->
::: tip 自定义频道名

默认情况下，频道名是截取自 URL 的最后一级：

```bash
nix-channel --add https://host/nixpkgs-unstable
```

我们列出频道名：

```bash
nixpkgs-unstable https://host/nixpkgs-unstable
```

如果我们需要手动命名频道，增加一个参数即可：

```bash
nix-channel --add https://host/nixpkgs-unstable nixpkgs
```

<!-- prettier-ignore -->
:::

## 使用镜像频道

由于不可抗力的因素，大陆对于环大陆主机的访问显得异常艰难，所以我们需要使用国内的
镜像频道来替代我们对官方频道（镜像频道通常由大学和企业公益性提供），下面列出了一
些在中国可用的一些镜像频道：

- 中国教育和科研计算机网（清华大
  学）`https://mirrors.cernet.edu.cn/nix-channels/store`
- 中国科学技术大学 `https://mirrors.ustc.edu.cn/nix-channels/store`
- 上海交通大学 `https://mirror.sjtu.edu.cn/nix-channels/store`
- 北京外国语大学 `https://mirrors.bfsu.edu.cn/nix-channels/store`
- 南京大学 `https://mirror.nju.edu.cn/nix-channels/store`
- 中国科学院软件研究所 `https://mirror.iscas.ac.cn/nix-channels/store`

我们使用镜像源替代官方的系统频道和软件仓库频道：

```bash
sudo nix-channel --add https://mirrors.ustc.edu.cn/nix-channels/nixpkgs-unstable nixpkgs  # 订阅镜像仓库频道
sudo nix-channel --add https://mirrors.ustc.edu.cn/nix-channels/nixos-22.11 nixos  # 请注意系统版本
sudo nix-channel --list  # 列出频道
```

<!-- prettier-ignore -->
::: note
特地修改频道名是因为许多表达式都会把 nixpkgs 而不是 nixpkgs-unstable 作输入。

<!-- prettier-ignore -->
:::

## 二进制构建缓存

源码分发是指将软件的源代码打包并分发给用户（Gentoo），二进制分发则是将已编译好的
二进制程序直接分发给用户（例如 Debian，RHEL）。NixOS 默认是源码分发形式，不过我
们可以添加二进制缓存源来让 NixOS 从缓存主机获取已经构建好的软件包。

### 为 NixOS 添加二进制缓存源

只需要修改 NixOS 配置中的 `substituters` 即可：

```nix
nix.settings.substituters = [ "https://mirrors.ustc.edu.cn/nix-channels/store" ];
```

由于官方的二进制缓存源是默认添加的，你可以通过下面的方式只启用自己指定的二进制缓
存源：

```nix
# 记得导入 lib
nix.settings.substituters = lib.mkForce [ "https://mirrors.cernet.edu.cn/nix-channels/store" ];
```

### 当前可用的二进制缓存主机列表

- 中国科研和教育计算机网 `https://mirrors.cernet.edu.cn/nix-channels/store`
- 中国科技大学 `https://mirrors.ustc.edu.cn/nix-channels/store`
- 上海交通大学 `https://mirror.sjtu.edu.cn/nix-channels/store`
- 中国教育和科研计算机网 `https://mirrors.cernet.edu.cn/nix-channels/store`
- 北京外国语大学 `https://mirrors.bfsu.edu.cn/nix-channels/store`
- 南京大学 `https://mirror.nju.edu.cn/nix-channels/store`
- 中国科学院软件研究所 `https://mirror.iscas.ac.cn/nix-channels/store`

### Cachix 服务

Cachix 服务是 Nix 二进制缓存服务实现的方式之一，你可以使用它在服务器构建缓存，然
后连接到该服务器的主机可以分享这些缓存，从而避免了二次构建。了解详情请参阅
[Cachix 官网](https://www.cachix.org/)。

## Nix 生态构成简述

Nix 生态主要由 Nix 表达式语言，NixOS，Nix 包管理器，Nixpkgs，NixOps，Hydra 构
成。**以下只是梗概，并不需要你完全理解或记住它。**

| 名称           | 描述                                                                                                                                                                                                                                                                                                                                                                       |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Nix 表达式语言 | Nix 表达式语言是一种函数式编程语言，用于描述软件包的构建过程、依赖关系和环境变量等信息。它支持函数定义、递归、模式匹配等特性，还支持嵌套语法，可描述复杂的依赖关系和构建过程。Nix 还支持原子事务，使得所有的包和环境都是原子的，不会相互影响。Nix 表达式语言可用于定义软件包和环境，也可用于描述系统配置。它是一种强大、灵活、可重复和可扩展的语言，用于管理软件包和环境。 |
| NixOS          | NixOS 是一种基于 Nix 包管理器的 Linux 发行版，具有高度可配置性、可重复性和安全性。它采用声明性配置，使用配置文件明确描述系统状态，使得配置更易于维护。NixOS 适用于需要高度可定制性的用例，如服务器和开发环境。                                                                                                                                                             |
| Nix 包管理器   | Nix 是跨平台的功能强大的包管理器，采用函数式编程思想描述依赖关系和多版本软件包管理，并提供一系列跨平台工具方便管理和部署。                                                                                                                                                                                                                                                 |
| NixOps         | NixOps是基于NixOS的云部署管理工具，支持多云平台，提供简单的命令行接口，可创建、部署、升级和回滚NixOS。用户可通过编写Nix表达式自定义部署和配置，使其成为灵活、可扩展和可定制的工具。适合需要管理大型、复杂基础设施的组织。                                                                                                                                                  |
| Hydra          | Hydra 是在 NixOS 中使用的 CI/CD 系统，它可以自动构建、测试和部署软件包，并决定是否发布和部署。Hydra 可以在不同环境下测试软件包，适用于开发、测试和部署任何类型的软件。                                                                                                                                                                                                     |
| Nixpkgs        | nixpkgs 是 Nix 软件包管理器的官方软件包集合，包含数以万计的软件包，并提供了构建、测试和部署工具，支持多平台和多架构，适用于开发、测试和部署各种类型的软件。                                                                                                                                                                                                                |
