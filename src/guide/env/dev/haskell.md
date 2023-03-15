---
shortTitle: Haskell
title: Haskell 开发环境部署
description: 以 GHC 实践
author: Potato Hatsue
---
## Nixpkgs 中的 Haskell 基础设施

除了软件开发过程本身外，软件分发也是很重要的一个话题。在发行版上建立编程语言生态系统可能不是一件简单的事情。本文将引入 [NixOS/nixpkgs](https://github.com/NixOS/nixpkgs) 中 Haskell 相关的基础知识，并说明如何使用 Nix 搭建科学的 Haskell 开发环境。

## Haskell 开发工具

### 编译器

在进入 Nix 相关的话题之前，有必要介绍一下现在 Haskell 的工具链以及常用的包管理器。首先 GHC 多年来已经成为 Haskell 编译器的业界标准——其他编译器譬如 JHC、GHC-JS、UHC 等等通常只实现了很基础的 Haskell 语言（例如 Haskell 2010）。它们的开发重点可能在提供不同的后端支持或者极致优化性能，总之并不是为了生产准备的。因此，对于发行版而言一般来说分发 Haskell 软件意味着使用 GHC 作为编译器。

### 包管理

除了编译器外，非平凡编程语言不可或缺的还有包管理器。与 GCC 等 C 语言编译器不同，GHC 内建了“包”的概念，或者说它本身就是一个包管理器。如果安装了 GHC，运行 `ghc-pkg list` 可以看到全局的包集：

```bash
$ ghc-pkg list
/nix/store/322zfsd89g1xph46glm0jjvwjkj09mv4-ghc-9.2.6/lib/ghc-9.2.6/package.conf.d
    Cabal-3.6.3.0
    array-0.5.4.0
    base-4.16.4.0
    binary-0.8.9.0
    ...
```

可以看出 GHC 所谓的包仅仅是一个名字和版本号，并且 GHC 本身不提供任何“正常的”包管理器拥有的功能，例如版本解析、管理已编译的依赖等等。默认 FHS 环境下，全局包集位于 `/usr/lib/ghc-版本/package.conf.d`。这个路径可以使用环境变量覆盖，在 Nix 中就使用了该方法。该目录包含了包集中每个包的一些元数据，例如包名、版本、编译结果等等。GHC 可以对包集增删新的包，但不会去编译相应的，如果文件丢失或者依赖损坏只会报错。显然，这样的包管理能力并不是为直接面向开发者准备的。对于开发，有两个流行的包管理器—— Cabal 和 Stack。

#### Cabal

首先介绍 Cabal。在实践中很多用户混淆 `cabal-install`（命令行包管理工具）与 `Cabal`（GHC 的一个 Boot Library）。后者相当于 Haskell 的构建系统，它定义了什么是一个 Haskell 包（样例来源于 Cabal 文档）：

```cabal
name:            TestPackage
version:         0.0
synopsis:        Package with library and two programs
license:         BSD3
author:          Angela Author
build-type:      Simple
cabal-version:   >= 1.8

library
  build-depends:   HUnit >= 1.1.1 && < 1.2
  exposed-modules: A, B, C

executable program1
  main-is:         Main.hs
  hs-source-dirs:  prog1
  other-modules:   A, B

executable program2
  main-is:         Main.hs
  hs-source-dirs:  prog2
  other-modules:   A, C, Utils
```

其中包有版本、名字、不同的组件（库或者可执行文件）、以及它们的依赖和编译器参数等等。所有构建相关的实现都实现在 `Cabal` 库中。在很多 Haskell 项目中，存在一个 `Setup.hs` 文件：

```haskell
import Distribution.Simple
main = defaultMain
```

当运行 `runhaskell Setup.hs configure`、`runhaskell Setup.hs build` 时，调用的是 `Cabal` 中的代码。发行版通常会选择这种方式来构建 Haskell 包，而不是开发者常用的 `cabal build`，因为在这种情况下由发行版的包管理提供 Haskell 包需要的依赖，而不是 Haskell 的包管理提供。注意 `Cabal` 只会检查依赖及环境是否满足要求（考虑版本约束与系统架构等等）而不会去真正地管理依赖（下载并构建缺失依赖）。真正提供包管理功能的是 `cabal-install`，即命令行程序 `cabal`（后文将使用该命名作为简写，注意它与 `Cabal` 不同）。它是一个依赖 `Cabal` 的 Haskell 程序，提供依赖解析、下载 Haskell 包源码等功能。在 2.0 版本后，`cabal` 引入了类似 Nix Store 的概念——在 `~/.cabal/store` 目录下存在一个 global store，包含包的编译结果。Haskell 包在 [Hakcage](https://hackage.haskell.org/) 由开发者上发布，因此当需要编译一个包时，如果该包的依赖不存在于 global store 中，`cabal` 会从 Hackage 上下载源码，并先编译该依赖，存到 global store 中。当依赖处理完成时，`cabal` 会在项目的目录下创建一个临时的 包集传给 GHC 内建包管理，再调用 `Cabal` 构建系统编译。这个过程类似沙盒构建：global store 用于共享已编译依赖、项目之间的依赖互不干扰。这和 Nix 的思想如出一辙，`cabal` 将这个功能命名为 Nix-style local builds。然而在 1 版本时代，`cabal` 只维护一个全局包集而不是可以共享的 global store，如同 FHS 发行版那样，每个依赖只能有一个版本安装在包集里。然而编程语言包的维护很难做到发行版软件包那样细致，并且也没有人来解决冲突问题——每个用户的包集是不一样的，面对冲突用户只能自己想办法。举个例子，开发 A 项目需要 `http-client >=0.3.2 && <0.4`，但是 `pandoc` 需要 `http-client >= 0.4.1 && <0.4.2` 由于依赖版本冲突，为了同时能够构建项目 A 并且安装 `pandoc`，用户只能自行在 `cabal install` 中指定版本号解决冲突。在当时无法直接安装一个 Haskell 程序或者构建一个 Haskell 项目是非常常见的，并且在面对 GHC 版本改变时，事情会变得更糟。

#### Stack

这时，新的包管理器 Stack 诞生了。正如前文已经所述，在旧 `cabal` 时代 Haskell 程序员天天面对的是依赖火葬场。既然用户因为各种版本不一致难以维护自己的包集，那么是不是可以像维护 Linux 发行版那样，帮用户维护一个呢？这就是 [Stackage](https://www.stackage.org/)。为了避免不同 GHC 版本带来包版本的变化 Stackage 还指定了 GHC 版本。例如在本文编写时最新的 LTS 版本是 [LTS 20.13 for ghc-9.2.7](https://www.stackage.org/lts-20.13)。与某些发行版相似，Stackage 有一个 nightly 的滚动版本以及定期发布 LTS 版本，必要时会将新的变动向后移植到 LTS 版本中。Stack 可以代替 `cabal` 作为 Haskell 开发者的包管理工具，同时 [hpack](https://github.com/sol/hpack) 使用户能用 `package.yaml` 而不是 `<项目名>.cabal` 来配置项目：

```yaml
name: TestPackage
version: 0.0
synopsis: Package with library and two programs
maintainer: Angela Author

dependencies:
  - base >= 4.9 && < 5

library:
  source-dirs: src

executable:
  main: Main.hs
  source-dirs: prog1
  dependencies:
    - HUnit
```

相信不少读者的第一个 Haskell 项目可能就是用 `stack` 创建并构建的。Stack 作为构建系统同样依赖 `Cabal`，只是使用了不同的依赖管理策略——让用户使用现成的包集。然而这里存在一个问题：如果用户需要使用一个 Stackage 包集没有的包，或者没有相应版本的包，用户需要手动将想要的版本或者包的源码添加到 `extra-deps` 中，例如：[IHaskell/stack-8.10.yaml](https://github.com/IHaskell/IHaskell/blob/8afa4e22c5724da89fec85a599ee129ab5b4cb9a/stack-8.10.yaml)：

```yaml
extra-deps:
- active-0.2.0.14
- Chart-cairo-1.9.3
- diagrams-1.4
- diagrams-cairo-1.4.1.1
- diagrams-contrib-1.4.4
- diagrams-core-1.5.0
- diagrams-lib-1.4.4
- diagrams-svg-1.4.3
- cairo-0.13.8.1
- pango-0.13.8.1
- glib-0.13.8.1
- gtk2hs-buildtools-0.13.8.3
- plot-0.2.3.11
# - static-canvas-0.2.0.3
- statestack-0.3
- dual-tree-0.2.2.1
- monoid-extras-0.6
- svg-builder-0.1.1
- force-layout-0.4.0.6
```

这个过程是传递性的，换句话说即将一个不存在于包集的包添加进去时，需要确保它所有的依赖在包集中，并且版本是正确的。至于如何选择每个版本，需要用户自己根据版本约束判断（运行 `stack` 可以在错误信息中看到约束）。这是非常痛苦的过程，并且通常项目需要为每个目标 GHC 版本选择一个 Stackage 包集然后重复这件事很多次。但是由于其稳定性（有效减少了版本不一致的问题），仍然有很大一部分用户选择使用 Stack。

## Nixpkgs 和 Haskell

前文已经介绍 Haskell 的包管理工具，但它们是面向 Haskell 开发者的，而不是使用 Haskell 程序的用户。对于发行版而言，优先满足最终用户的需求可能是首要目标，因为开发者总是可以使用编程语言的包管理器搭建开发环境。如果发行版能提供一定便利自然更好，但这不是必要的。Nixpkgs 提供了一个较为先进的 Haskell 基础设施，不光方便分发 Haskell 程序，同时提升了 Haskell 开发者的体验。离题一下，除了 Nixpkgs，[input-output-hk/haskell.nix](https://github.com/input-output-hk/haskell.nix) 提供了另一个 Haskell 基础设施：与 Nixpkgs 相比它更为复杂，适用于更复杂的项目。例如它使用 Nix 语言抽象了类似 `.cabal` 的 Haskell 包配置文件；它还抽象了一个包的构建计划，其中包含该包的依赖集以及编译器版本、参数等等。用户可以从 Stackage 或者 Cabal plan 创建 Haskell 包的构建计划，完成对依赖的细粒度控制。这些都是 Nixpkgs 中没有的功能。因为可自定义化程度高，这个基础设施在没有 cachix 缓存的情况下是难以使用的——用户可能轻而易举就需要编译多次 GHC 以及各种配置不同的 Haskell 依赖。本文将重点目光放在 Nixpkgs 中的基础设施中。

### Haskell derivation

Nix 用户可能熟悉 `stdenv` 中的 `mkDerivation`：

```nix
stdenv.mkDerivation {
  name = "libfoo-2.3.3";
  src = fetchurl {
    url = http://example.org/libfoo-2.3.3.tar.gz;
    sha256 = "...";
  };
  buildInputs = [ perl ncurses ];
}
```

标准环境提供了用于构建 Unix 软件包的环境，自动化了诸如 `./configure`、`make` 等步骤。在这基础上扩展，对于不同语言不同工具链可以衍生出相应的 derivation 生成函数，或者叫构建步骤，从而搭建出该语言的框架。例如构建一个 Python 包看起来是这样的（来源于 [NixOS Wiki](https://nixos.wiki/wiki/Python)）：

```nix
buildPythonPackage rec {
  pname = "deserialize";
  version = "1.8.3";
  src = fetchPypi {
    inherit pname version;
    sha256 = "sha256-0aozmQ4Eb5zL4rtNHSFjEynfObUkYlid1PgMDVmRkwY=";
  };
  doCheck = false;
  propagatedBuildInputs = [
    # Specify dependencies
    pkgs.python3Packages.numpy
  ];
}
```

 可以看出 Nixpkgs 中维护了 Python 包集，每个包都对应一个 Nix derivation。得益于 derivation 的概念，derivations 可以作为构建输入，达到由发行版包管理满足编程语言依赖需求的效果。Haskell 的框架与之十分类似，尽管更加复杂。以 `wxc` 为例，它的 Nix 表达式（来源于 `cabal2nix`）是：

```nix
{ mkDerivation, base, bytestring, Cabal, directory, filepath, process, split, wxdirect }:
mkDerivation {
  pname = "wxc";
  version = "0.92.3.0";
  sha256 = "0i7z4avy57qzrykz3kddfn313zddp3lnyl9a0krx5f2k3b2pz8i8";
  revision = "1";
  editedCabalFile = "1cgq577ddskmp1xdlnlz0581r8hsqblgxc7wy0avb7sgf181cbd4";
  setupHaskellDepends =
    [ base bytestring Cabal directory filepath process split ];
  libraryHaskellDepends = [ base split wxdirect ];
  librarySystemDepends = [ pkgs.libGL pkgs.libX11 ];
  libraryPkgconfigDepends = [ pkgs.wxGTK ];
  doHaddock = false;
  postInstall = "cp -v dist/build/libwxc.so.0.92.3.0 $out/lib/libwxc.so";
  postPatch = "sed -i -e '/ldconfig inst_lib_dir/d' Setup.hs";
  description = "wxHaskell C++ wrapper";
  license = "unknown";
  hydraPlatforms = lib.platforms.none;
}
```

Haskell 基础设施拥有类似的 `scope` 与 `callPackage` 机制——通常一个包对应的 Nix 表达式是一个函数，它接受其他 derivations 作为构建输入。注意这里函数参数都是 `haskellPackages` scope 中的 derivations，而不是 `pkgs` 中的。可以注意到系统依赖如 `librarySystemDepends` 是来自 `pkgs` 的，而 `haskellPackages.callPackage` 只传递 Haskell derivation。同样，`mkDerivation` 是 Haskell 的 generic builder，好奇的读者可以在 [generic-builder.nix](https://github.com/NixOS/nixpkgs/blob/master/pkgs/development/haskell-modules/generic-builder.nix) 找到它的定义。基本上它包装了标准环境中的 `mkDerivation`，添加了 Haskell 相关的构建步骤。其中核心步骤是上文提到的调用 `./Setup.hs configure` 与 `./Setup.hs build` 等。值得一提的是，Haskell derivation 还在 `passthru` 导出了全部构建依赖以及一个叫 `envFunc` 的函数。它们是用于创造开发该包所需要的 Nix shell，后文会详细介绍。

### Haskell 包集与顶层

Nixpkgs 中包含了 Hackage 所有软件包的最新版本的 Nix 表达式，尽管它们可能是无法构建的。维护者会定期对整个 Hackage 运行 `cabal2nix`，产生如同上文 `wxc` 的 Nix 表达式。生成结果位于 [hackage-packages.nix](https://github.com/NixOS/nixpkgs/blob/master/pkgs/development/haskell-modules/hackage-packages.nix)，一个超过 10M 的文本文件。如果包因为依赖无法满足或者构建失败（包括测试失败），它会被添加进 `configuration-hackage2nix/broken.yaml` 中，使得生成出的 Nix 表达式包含 `isBroken = true`。此外，该文件上级目录下有一些 `configuration-x.nix` 文件，它们的作用是调整 scope 中包名对应的 Haskell derivations：

* `configuration-{arm,darwin}.nix` - 特定系统架构上需要的修改，例如在某些架构上一些包的测试或编译无法通过，需要打补丁修复/禁用测试/添加依赖，例如在 drawin 配置中有 `hmatrix = addBuildDepend darwin.apple_sdk.frameworks.Accelerate super.hmatrix`。

* `configuration-ghc-x.nix` - 特定 GHC 版本上需要的修改，通常每个版本都需要将 GHC Boot Libraries 设置为 `null`。还有一些包的受 GHC 版本影响，它们需要在这里手动指定版本，例如在 GHC 8 的配置中有 `ghc-lib = doDistribute self.ghc-lib_8_10_7_20220219`。

* `cofiguration-common.nix` - 与前面特定架构的修改相似，但是它们与架构无关，通常是打一些补丁、jailbreak 等等。

* `configuration-nix.nix` - 因为 Nix 带来问题而需要作出的修改。大部分是禁用测试，因为在构建时没有网络。还有一些是添加 `cabal2nix` 未能发现的依赖，例如一些需要运行期依赖其他软件的 Haskell 程序也在这里被 wrap。

这些配置都是 extension，即形如 `self: super: {...}` 的函数。它们合并到一起并应用到 `haskellPackages` 上。事实上 `haskellPackages` 是 extensible 的，即该 AttrSet 有 `extend` 字段，方便用户在其上应用自己的修改。这在后文中搭建开发环境会用到。每个 GHC 版本都有一个对应的 `haskellPackages`，即 Haskell 包集和工具链。在 repl 中可以看到：

```bash
haskell.packages.ghc810                haskell.packages.ghc924Binary
haskell.packages.ghc8102Binary         haskell.packages.ghc924BinaryMinimal
haskell.packages.ghc8102BinaryMinimal  haskell.packages.ghc925
haskell.packages.ghc8107               haskell.packages.ghc926
haskell.packages.ghc8107Binary         haskell.packages.ghc94
haskell.packages.ghc8107BinaryMinimal  haskell.packages.ghc942
haskell.packages.ghc865Binary          haskell.packages.ghc943
haskell.packages.ghc88                 haskell.packages.ghc944
haskell.packages.ghc884                haskell.packages.ghcHEAD
haskell.packages.ghc90                 haskell.packages.ghcjs
haskell.packages.ghc902                haskell.packages.ghcjs810
haskell.packages.ghc92
haskell.packages.ghc924
```

而位于顶层的 `haskellPackages` 是人为定下的主流 GHC 版本，在本文编写时它导出了 `haskell.packages.ghc92`。诸如 `pandoc` 的 Haskell 程序通常在顶层被导出时会对相应 derivation 应用 `justStaticExecutables`，即静态链接可执行文件、避免应用程序依赖 Haskell 库和 GHC。许多该类修改位于前文所述的 `configuration-nix.nix` 中，也有一部分在顶层或者该包自己的 `.nix` 中。还有一个常用的函数集 `haskell.lib` 和 `haskell.packageOverrides`。前者是一个 AttrSet，包含了前文中提到的 `addBuildDepend`、`doDistribute`、`justStaticExecutables` 等调整 Haskell derivation 的函数；后者是一个 extension，它总是会被应用到所有 GHC 版本的 `haskellPackages` 上。因此，用户可以写诸如：

```nix
final: prev: {
  haskell = prev.haskell // {
    packageOverrides = hfinal: hprev:
      hprev.haskell.packageOverrides hfinal hprev // {
        # ...
      };
  };
}
```

的 overlay 来 override 整个 `haskell`。若要单独 override 某个 `haskellPackages`，可以用以下 overlay（其中 `haskellPackages` 可被 `haskell.packages.ghc94` 等替代）：

```nix
final: prev: {
  haskellPackages = prev.haskellPackages.override (old: {
    overrides = final.lib.composeExtensions (old.overrides or (_: _: { }))
      (hfinal: hprev:
        {
          # ...
        });
  });
}
```

后文中会介绍具体应用它们的例子。

## 搭建开发环境

前文大致讲述了 Nixpkgs 中的 Haskell 基础设施，但是搭建 Haskell 开发环境不一定完全依赖于 Nixpkgs 中的包集。Nix 语境中的搭建开发环境通常指构建出 dev shell 其中包含所需的开发工具以及依赖。

### 只用 Nix 获取编译器和包管理器

如果用户不想借助 Nix 来实现缓存或可重现（用 derivation 来打包），那么用户可以仅使用 Nixpkgs 中的 GHC 和 `cabal-install`：

```shell
$nix-shell -p "haskellPackages.ghcWithPackages (pkgs: with pkgs; [ cabal-install ])""
```

后续步骤就与在其他发行版中无二了。使用 `cabal init` 可以创建项目、`cabal build` 可以构建项目。相似地，Stack 用户也只需要在 dev shell 中准备好 GHC 和 `stack`，再加上打开 Stack 的 [Nix 支持](https://docs.haskellstack.org/en/stable/nix_integration/)即可像在其他发行版那样使用。这样的缺点显而易见，用户需要从头开始编译所有依赖，无法享受 Nix 带来的优势。

### Nixpkgs

可能使用 Nixpkgs 的 Haskell 基础设施创建 dev shell 是很多用户的选择。理想情况下，用户不需要在自己的机器上编译任意一个依赖，dev shell 将提供好一切。这样做的好处还有可以减少未来该 Haskell 程序在 Nixpkgs 中分发所需的努力，因为在一些情况下 dev shell 可以直接来源于 derivation 的 `envFunc`，而有了 derivation 就相当于在 Nix 中打出了这个包。当然，如果因为各种疑难问题不容易构造出 derivation 或者满足依赖要求，最终可以诉诸于 `cabal-install`。但这对分发是没有好处的，因为本质上依赖了开发者的环境。

#### developPackage

对于简单项目而言，`developPackage` 是一个很好来创建 dev shell 的办法。假设项目仅包含单包，即没有使用 `cabal.project` 将多个包一起构建，以下代码片段可构造带有 `cabal-install` 和 `haskell-language-server` 的 dev shell：

```nix
pkgs.haskellPackages.developPackage {
  root = ./.;
  modifier = drv:
    pkgs.haskell.lib.addBuildTools drv ([
      pkgs.cabal-install
      pkgs.haskell-language-server
    ]);
}
```

`modifier` 函数会应用到构建出的 derivation 上，这里的例子手动添加了两个依赖，它们会进入到 dev shell 中。如果需要 override 包集，可以在参数添加 `overrides` 函数：

```nix
pkgs.haskellPackages.developPackage {
  root = ./.;
  overrides = hfinal: hprev: {
    github = pkgs.haskell.lib.overrideCabal hprev.github (drv: { patches = [ ]; });
  };
}
```

这段代码修改了 `github` 的 derivation，移除了其中的补丁。此外，还有 `source-overrides` AttrSet 可以指定包集中一些包的源码：

```nix
pkgs.haskellPackages.developPackage {
  root = ./.;
  source-overrides = {
    foo = ./foo;
    graphviz = "2999.20.0.4";
  };
}
```

这段代码为包集添加了本地的 `foo`，覆盖 `graphviz` 的版本为 `2999.20.0.4`。事实上 `source-overrides` 传给了 `haskell.lib.packageSourceOverrides`，后者判断如果值是一个路径，就对它调用 `callCabal2nix`；如果是字符串，就对它调用 `callHackage`。`developPackage` 的源码如下：

```nix
 developPackage =
   { root
   , name ? lib.optionalString (builtins.typeOf root == "path") (builtins.baseNameOf root)
   , source-overrides ? {}
   , overrides ? self: super: {}
   , modifier ? drv: drv
   , returnShellEnv ? pkgs.lib.inNixShell
   , withHoogle ? returnShellEnv
   , cabal2nixOptions ? "" }:
   let drv =
     (extensible-self.extend
        (pkgs.lib.composeExtensions
           (self.packageSourceOverrides source-overrides)
           overrides))
     .callCabal2nixWithOptions name root cabal2nixOptions {};
   in if returnShellEnv
        then (modifier drv).envFunc {inherit withHoogle;}
        else modifier drv;
```

不难看出它先把 `source-overrides` 交给 `haskell.lib.packageSourceOverrides` 得到一个 extension（形如 `self: super: {<包名> = <drv>}` 的函数），再把 `overrides`（也是同样的 extension）和它 compose 到一起，修改包集后调用 `callCabal2nix`，再应用 `modifier` 到结果上。这样以来，`developPackage` 是在构建位于 `root` Haskell 包的 derivation，并且根据需求返回 derivation 本身，或者它的 `envFunc`。`envFunc` 在前文提到过，旨在为该 Haskell derivation 创建 dev shell。将上面调用 `developPackage` 的代码放到 `default.nix` 即可（不要忘记指定 `pkgs`），在该目录下运行 `nix-build` 可构建出该包的 derivation；运行 `nix-shell` 可进入 dev shell。

#### shellFor

`developPackage` 在应对单包项目时比较方便，但在多包项目时就会遇到问题。`shellFor` 可以为多包项目创建 dev shell。以下面项目结构 `cabal.package` 为例（来自 [NixOS Wiki](https://nixos.wiki/wiki/Haskell)）：

```cabal
packages:
  frontend/
  backend/
```

以下代码可以创建相应的 dev shell：

```nix
(pkgs.haskellPackages.extend (pkgs.haskell.lib.packageSourceOverrides {
  frontend = ./frontend;
  backend = ./backend;
})).shellFor {
  packages = p: [ p.frontend p.backend ];
  buildInputs = [ pkgs.haskell-language-server pkgs.cabal-install ];
}
```

可以看出首先本地的 `frontend` 和 `backend` 被添加到包集，然后 `shellFor` 接受了 `packages` 函数和 `buildInputs` 列表。后者很好理解，相当于非 Haskell 的额外依赖。但前者是什么呢？事实上 `shellFor` 和 `developPackage` 完成的操作完全不同：`developPackage` 是修改包集后构造项目的 Haskell derivation；而 `shellFor` 是按类别筛选出 `packages` 函数所返回列表中所有 Haskell derivations 的依赖后，构造一个临时的 Haskell derivation，使得它的依赖是上一部步的筛选结果，并对它调用 `envFunc`。换句话说，`shellFor` 基本上是创建一个包含项目中所有依赖的 dev shell，但是不构建项目本身。它的源码比较长，就不在这里贴出了。`shellFor` 的返回结果只能被用来创建 dev shell，而不能构建包。因此可以将该段代码放进 `shell.nix` 中，运行 `nix-shell` 即可进入 dev shell。

#### envFunc

不管 `developPackage` 还是 `shellFor`，它们最终调用的都是 `envFunc`。`envFunc` 每一个 Haskell derivation 都有的，它会创建一个含有该 derivation 所有 Haskell 依赖的 dev shell。如果不想使用这两个函数，也可以自己调用 `envFunc` 创建 dev shell。以下面使用了 flakes 的代码为例（来自 [pixiv/flake.nix](https://github.com/The-closed-eye-of-love/pixiv)）：

```nix
{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs = { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
          overlays = [ self.overlays.default ];
        };
      in with pkgs; {
        devShells.default = pixiv-dev.envFunc { withHoogle = true; };
        packages.default = pixiv;
      }) // {
        overlays.default = final: prev:
          let
            hpkgs = prev.haskellPackages;
            linkHaddockToHackage = drv:
              prev.haskell.lib.overrideCabal drv (drv: {
                haddockFlags = [
                  "--html-location='https://hackage.haskell.org/package/$pkg-$version/docs'"
                ];
              });
            pixiv = with prev.haskell.lib;
              linkHaddockToHackage (disableLibraryProfiling
                (dontCheck (hpkgs.callCabal2nix "pixiv" ./. { })));
          in with prev;
          with haskell.lib; {
            inherit pixiv;
            pixiv-dev =
              addBuildTools pixiv [ haskell-language-server cabal-install ];
          };
      };
}
```

这里并没有修改 Haskell 包集，而是使用 `callCabal2nix` 创建了 `pixiv` 的 Haskell derivation，同时对该 derivation 作出了一系列修改，例如 `dontCheck` 和 `disableLibraryProfiling`。`pixiv-dev` 则是 `pixiv` 添加上两个必要的开发工具，它唯一的用处是将它的 `envFunc` 导出到 flake 的 `devShells.default` 用于创建 dev shell（使用 `nix develop`）。而被当成 `packages.default` 导出的则是 `pixiv` 这个 Haskell derivation。在其他 flake 中，可以直接将该 flake 添加为 input，并使用导出的 `pixiv`。由此可见，自己调用 `envFunc` 搭配上 flake 可以更灵活地创建开发环境以及分发程序。

### haskell.nix

与 Nixpkgs 大体相似，但细节不同。本文不作重点讨论，具体可参照文档：[Alternative Haskell Infrastructure for Nixpkgs](https://input-output-hk.github.io/haskell.nix/)。

## 一些注意

在使用 Nixpkgs 的 Haskell 基础设施时，有些常见问题需要注意。它们中的一些是仍未解决的。

### IFD

`callCabal2nix` 本质上依靠 [IFD](https://nixos.wiki/wiki/Import_From_Derivation) 工作，因此由它创建的 Haskell derivation 无法使用 `flake show` 或者 `flake check`。

### 依赖版本

Nixpkgs 这套基础设施并不会考虑包的版本，读者应该已经清楚 Nixpkgs 中 Haskell 包集的结构：`{ <包名> = <drv>; <包名> = <drv>; }`。这和 Nixpkgs 中其他语言的基础设施是一致的，因此在一些情况下用户可能需要自己解决依赖冲突的问题。

### 引用泄露

可执行 Haskell 程序不应该引用任何其他 Haskell 编译产物，例如依赖库或者文档，否则该程序将间接引用 GHC，使得 closure 大小超过 2G，显然这对一个可执行程序是不合理的。使用 `justStaticExecutables` 可以让可执行文件静态链接，但引用泄露有时还会发生。[pandoc - statically linked closure-size · Issue #34376 · NixOS/nixpkgs · GitHub](https://github.com/NixOS/nixpkgs/issues/34376) 中有对该问题具体的讨论。
