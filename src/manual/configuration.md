---
shortTitle: 配置
icon: modules
---

# 配置

## 包管理

这一节我们会讨论如何为你的系统添加额外的包。NixOS 包管理的方式有两种：

- 配置文件声明。你可以在配置文件为系统或用户声明需要安装的包，每次你重新生成系统，NixOS 都会确保本地包含了你指定的这些包。这是持久的。

- 非持久环境。使用 `nix-env` 管理软件包安装，升级与卸载。需要注意的是配置文件并不会与你的命令行操作同步，也就是说，当你使用 `nix-env` 安装一个包以后，系统环境已经脱离配置文件所描述的那样了。这也是非 root 用户唯一安装软件包的方式。

### 声明式包管理

在 `configuration.nix` 中， 提供用于声明系统环境包含的包的 `environment.systemPackages` 数组：

```nix
environment.systemPackages = [ pkgs.firefox ];  # 将来源于 pkgs(Nixpkgs) 的包安装到系统
```

配置文件并不是实时生效的。你需要运行 `sudo nixos-rebuild switch` 来生成当前配置文件描述的系统。

::: note 依赖配置
对于某些包（例如依赖 D-Bus 或 systemd 服务注册的包），仅仅是安装还是不够的，我们需要为它们对系统进行一些配置。
你可以访问[选项列表](https://nixos.org/manual/nixos/stable/options.html)来检索需要启用的 NixOS 模块。
:::

你可以使用以下命令获取在线包仓库中可用的软件包的列表：

```bash
$ nix-env -qaP '*' --description
nixos.firefox   firefox-23.0   Mozilla Firefox - the browser, reloaded
...
```

通常会输出很多行可以获取的包的信息。第一列输出是属性名（例如`nixos.firefox`）。

::: note 前缀
`nixos` 前缀表明当前包是从 `nixos` 频道获取的。
:::

如果你想卸载这个包，修改配置后重新生成系统即可。

### 定制软件包

一些软件包会提供一些禁用或启用功能，更改一些特性的选项。例如 Firefox 插件捆绑包（会额外提供一些诸如 Adobe Flash Player 的插件）会提供一个启用 Google Talk 的选项，如此配置便可以：

```nix
nixpkgs.config.firefox.enableGoogleTalkPlugin = true;
```

::: warning 难以查询
遗憾的是，Nixpkgs 依然无法提供一种简易查询这些选项的方式。
:::

除了高阶选项外，你还可以以几乎任意方式调整软件包，例如更改或禁用软件包的依赖项。例如，Nixpkgs 中的 Emacs 软件包默认依赖于 GTK 2。如果你想将其构建为使用 GTK 3 的软件包，可以按如下方式指定：

```nix
environment.systemPackages = [ (pkgs.emacs.override { gtk = pkgs.gtk3; }) ];
```

我们使用了 `override` 函数指定了用户定义的参数，意味着我们覆写了一部分原本的参数，构建的包也因此改变了。
让我们来细看这个语句，`gtk` 默认是接受 `pkgs.gtk2` 参数的，我们使用 `pkgs.gtk3` 作输入的时候，默认参数已经失效了，于是构建出来的包是依赖 GTK 3 的了。

::: warning 运算优先级
圆括号是必要的，因为在 Nix 语言中，列表构造优先级高于函数。如果不使用括号，列表将会认为它接收了两个元素。
:::

我们还可以使用 `overrideAttrs` 函数做出更多定制。`override` 函数的机制是覆写了包输入函数的参数，而 `overrideAttrs` 允许覆写传递给 `mkDerivation` 的属性。如此你几乎能修改这个包的方方面面，甚至包括源码。如果你想覆写源码输入，可以这样做：

```nix
environment.systemPackages = [
  (pkgs.emacs.overrideAttrs (oldAttrs: {
    name = "emacs-25.0-pre";
    src = /path/to/my/emacs/tree;  # 你的源码目录
  }))
];
```

在这里，`pkgs.emacs` 被衍生出了一个重新调用 `stdenv.mkDerivation` 并替换了 `name` 和 `src` 属性的版本。然后 `overrideAttrs` 接收了这个衍生，成为了目前系统环境的 `emacs` 包。

### 添加自定义包

#### 使用 Nix 语言构建

#### 使用预构建文件

大多数可执行文件都不能在 NixOS 上直接工作，但是将依赖一起打包的容器格式就可以，常见的容器格式有 `flatpaks` 和 `AppImages` 等。

### 非持久包管理

通过 `nix-env` 命令，你可以像常规发行版那样使用命令安装软件：

```bash
nix-env -iA nixos.thunderbird
```

如果以 root 权限执行此语句，软件包将会被安装到 `/nix/var/nix/profiles/default`，并且对所有用户可见。如果你是普通用户，软件包将会安装到 `/nix/var/nix/profiles/per-user/username/profile`，并且仅对当前用户可见。`-A` 参数指定了软件包所属的属性，如果不带属性，直接匹配 `thunderbird` 速度会较慢，同时也可能匹配到多个名称相同的包，产生歧义。

假设我们需要更新的包来自于系统频道，我们可以先更新系统频道，然后重新安装或更新指定包：

```bash
nix-channel --update nixos  # 更新系统频道
nix-env -iA nixos.thunderbird  # 再次安装时，此包会被替换为最新版
```

上面的语句可以指定另外的频道，从而用不同频道的包去代替当前包。如果你想用当前包默认的来源升级包，尝试这样做：

```bash
nix-channel --update nixos
nix-env -u thunderbird
```

如果你想升级所有包，可以这样：

```bash
nix-env -u '*'
```

但是需要注意， ==它并不会升级系统配置中描述的包== ，那些包由 `nixos-rebuild switch` 命令管理。

如果你想更新那些包， `nixos-rebuild switch --upgrade` 即可，它会自动更新频道并更新系统生成。

如果你想卸载使用命令安装的包，使用以下命令：

```bash
nix-env -e thunderbird
```

此外，用户环境的状态是可以回滚的：

```bash
nix-env --rollback
```

你可以查阅 [nix-env 手册页](https://nixos.org/manual/nix/unstable/command-ref/nix-env.html) 获取更多信息。

## 用户管理

类似的，NixOS 支持声明式用户管理和命令行用户管理。

### 声明式用户管理

我们以下面的例子说明声明式用户管理的大致细节：

```nix
users.users.alice = {
  isNormalUser = true;
  home = "/home/alice";
  description = "Alice Foobar";
  extraGroups = [ "wheel" "networkmanager" ];
  openssh.authorizedKeys.keys = [ "ssh-dss AAAAB3Nza... alice@foobar" ];
};
```

根据描述，该用户加入了 `wheel` 组，意味着它可以使用 `sudo` 命令提权，此外它还加入了 `networkmanager` 组，意味着该用户可以配置网络。不过这样创建出来的用户是没有初始密码的，你仍需要使用 `passwd` 命令为其分配密码， ==每次重新生成系统的时候不会影响到密码的状态== 。对于 ssh 连接，你可以指定认证密钥，只要公钥与私钥匹配就能连接。

如果你设置 `users.mutableUsers`  为 `False` ，`/etc/passwd` 与 `/etc/group` 目录的内容将与配置文件中描述的一致。例如，如果你从配置文件中删除了某位用户，然后重新生成系统，这个用户就真实消失了。同时通过命令行管理用户的方式将失效。不过你仍然可以通过设置用户的 [`hashedPassword`](https://nixos.org/manual/nixos/stable/options.html#opt-users.users._name_.hashedPassword) 选项来分配密码。

用户 `uid` 是自动分配的，不过你也可以自行指定：

```nix
uid = 1000;
```

`gid` 分配也是自动的，同样可以用户定义，也是类似的方法：

```nix
users.groups.students.gid = 1000;
```

### 命令行式用户管理

创建一个名为 `alice` 的用户，`-m` 参数用于给该用户创建 `home` 目录：

```bash
useradd -m alice
```

为了让 nix 工具集可以为该用户所用，我们还需要给这个用户打开 login shell（加载用户配置的 shell）。这一步会把 `~/.nix-defexpr` 链接到该用户的目录，这样该用户才能使用 nix 的一系列命令。

```bash
su - alice -c "true"
```

我们还需要为其分配密码，才能登录：

```bash
passwd alice
Enter new UNIX password: ***
Retype new UNIX password: ***
```

可以使用 `userdel -r alice` 删除该用户，`-r` 参数用于移除该用户的 `home` 目录。此外还有 `usermod`，`groupadd`, `groupmod` 和 `groupdel` 可以使用。

## 文件系统

## 显示服务

### X11

### Wayland

## GPU 加速

## 桌面环境

### XFCE

### GNOME

### KDE
