# NixOS 配置

::: warning 内容施工中  
本节内容正在修缮中，当前内容可能已经过时，仅供参考。  
:::

## 包管理

这一节我们会讨论如何为你的系统添加额外的包。NixOS 包管理的方式有两种：

- 配置文件声明。你可以在配置文件为系统或用户声明需要安装的包，每次你重新生成系
  统，NixOS 都会确保本地包含了你指定的这些包。这是持久的。

- 非持久环境。使用 `nix-env` 管理软件包安装，升级与卸载。这种方式允许不同软件仓
  库频道版本的包共存。这也是非 root 用户唯一安装软件包的方式。

### 声明式包管理

在 `configuration.nix` 中， 提供用于声明系统环境包含的包的
`environment.systemPackages` 数组：

```nix
environment.systemPackages = [ pkgs.firefox ];  # 将来源于 pkgs(Nixpkgs) 的包安装到系统
```

==配置文件并不是实时生效的== 。你需要运行 `sudo nixos-rebuild switch` 来生成当前
配置文件描述的系统。

::: note 依赖配置  
对于某些包（例如依赖 D-Bus 或 systemd 服务注册的包），仅仅是安装还是不够的，我们
需要为它们对系统进行一些配置。  
你可以访问[选项列表](https://nixos.org/manual/nixos/stable/options.html)来检索需
要启用的 NixOS 模块。  
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

一些软件包会提供一些禁用或启用功能，更改一些特性的选项。例如 Firefox 插件捆绑包
（会额外提供一些诸如 Adobe Flash Player 的插件）会提供一个启用 Google Talk 的选
项，如此配置便可以：

```nix
nixpkgs.config.firefox.enableGoogleTalkPlugin = true;
```

::: warning 难以查询  
遗憾的是，Nixpkgs 依然无法提供一种简易查询这些选项的方式。  
:::

除了高阶选项外，你还可以以几乎任意方式调整软件包，例如更改或禁用软件包的依赖项。
例如，Nixpkgs 中的 Emacs 软件包默认依赖于 GTK 2。如果你想将其构建为使用 GTK 3 的
软件包，可以按如下方式指定：

```nix
environment.systemPackages = [ (pkgs.emacs.override { gtk = pkgs.gtk3; }) ];
```

我们使用了 `override` 函数指定了用户定义的参数，意味着我们覆写了一部分原本的参
数，构建的包也因此改变了。  
让我们来细看这个语句，`gtk` 默认是接受 `pkgs.gtk2` 参数的，我们使用 `pkgs.gtk3`
作输入的时候，默认参数已经失效了，于是构建出来的包是依赖 GTK 3 的了。

::: warning 运算优先级  
圆括号是必要的，因为在 Nix 语言中，列表构造优先级高于函数。如果不使用括号，列表
将会认为它接收了两个元素。  
:::

我们还可以使用 `overrideAttrs` 函数做出更多定制。`override` 函数的机制是覆写了包
输入函数的参数，而 `overrideAttrs` 允许覆写传递给 `mkDerivation` 的属性。如此你
几乎能修改这个包的方方面面，甚至包括源码。如果你想覆写源码输入，可以这样做：

```nix
environment.systemPackages = [
  (pkgs.emacs.overrideAttrs (oldAttrs: {
    name = "emacs-25.0-pre";
    src = /path/to/my/emacs/tree;  # 你的源码目录
  }))
];
```

在这里，`pkgs.emacs` 被衍生出了一个重新调用 `stdenv.mkDerivation` 并替换了
`name` 和 `src` 属性的版本。然后 `overrideAttrs` 接收了这个衍生，成为了目前系统
环境的 `emacs` 包。

### 添加自定义包

#### 使用 Nix 语言构建

#### 使用预构建文件

大多数可执行文件都不能在 NixOS 上直接工作，但是将依赖一起打包的容器格式就可以，
常见的容器格式有 `flatpaks` 和 `AppImages` 等。

### 非持久包管理（Ad-Hoc 包管理）

这种方式不持久是相对于声明式包管理的。声明式包管理可以保证系统的一致性和可复制
性，所以是持久的。不过 Ad-Hoc 方式非常灵活。

::: tip Ad-Hoc  
这个词语的起源是拉丁语，意思是“为此”。它通常表示一种针对特定目的，问题或任务的解
决方案，而不是一种可以适用于其他情况的通用解决方案。例如，一个政府为了解决一个具
体问题而设立的委员会就是一个 ad-hoc 委员会。更宽松地说，它也可以意味着“自发的
”，“未计划的”或“即兴的”。

在 nixos 中，Ad-Hoc 的意义是指可以在一个临时的 shell 环境中使用任何用 nix 打包的
程序，而不需要永久地安装它。这样可以方便地创建和使用开发环境，而不影响系统的状
态。  
:::

通过 `nix-env` 命令，你可以像常规发行版那样使用命令安装软件：

```bash
nix-env -iA nixos.thunderbird
```

如果以 root 权限执行此语句，软件包将会被安装到 `/nix/var/nix/profiles/default`，
并且对所有用户可见。如果你是普通用户，软件包将会安装到
`/nix/var/nix/profiles/per-user/username/profile`，并且仅对当前用户可见。`-A` 参
数指定了软件包所属的属性，如果不带属性，直接匹配 `thunderbird` 速度会较慢，同时
也可能匹配到多个名称相同的包，产生歧义。

假设我们需要更新的包来自于系统频道，我们可以先更新系统频道，然后重新安装或更新指
定包：

```bash
nix-channel --update nixos  # 更新系统频道
nix-env -iA nixos.thunderbird  # 再次安装时，此包会被替换为最新版
```

上面的语句可以指定另外的频道，从而用不同频道的包去代替当前包。如果你想用当前包默
认的来源升级包，尝试这样做：

```bash
nix-channel --update nixos
nix-env -u thunderbird
```

如果你想升级所有包，可以这样：

```bash
nix-env -u '*'
```

但是需要注意， ==它并不会升级系统配置中描述的包== ，那些包由
`nixos-rebuild switch` 命令管理。

如果你想更新那些包， `nixos-rebuild switch --upgrade` 即可，它会自动更新频道并更
新系统生成。

如果你想卸载使用命令安装的包，使用以下命令：

```bash
nix-env -e thunderbird
```

此外，用户环境的状态是可以回滚的：

```bash
nix-env --rollback
```

你可以查阅
[nix-env 手册页](https://nixos.org/manual/nix/unstable/command-ref/nix-env.html)
获取更多信息。

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

根据描述，该用户加入了 `wheel` 组，意味着它可以使用 `sudo` 命令提权，此外它还加
入了 `networkmanager` 组，意味着该用户可以配置网络。不过这样创建出来的用户是没有
初始密码的，你仍需要使用 `passwd` 命令为其分配密码， ==每次重新生成系统的时候不
会影响到密码的状态== 。对于 ssh 连接，你可以指定认证密钥，只要公钥与私钥匹配就能
连接。

如果你设置 `users.mutableUsers` 为 `False` ，`/etc/passwd` 与 `/etc/group` 目录
的内容将与配置文件中描述的一致。例如，如果你从配置文件中删除了某位用户，然后重新
生成系统，这个用户就真实消失了。同时通过命令行管理用户的方式将失效。不过你仍然可
以通过设置用户的
[`hashedPassword`](https://nixos.org/manual/nixos/stable/options.html#opt-users.users._name_.hashedPassword)
选项来分配密码。

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

为了让 nix 工具集可以为该用户所用，我们还需要给这个用户打开 login shell（加载用
户配置的 shell）。这一步会把 `~/.nix-defexpr` 链接到该用户的目录，这样该用户才能
使用 nix 的一系列命令。

```bash
su - alice -c "true"
```

我们还需要为其分配密码，才能登录：

```bash
passwd alice
Enter new UNIX password: ***
Retype new UNIX password: ***
```

可以使用 `userdel -r alice` 删除该用户，`-r` 参数用于移除该用户的 `home` 目录。
此外还有 `usermod`，`groupadd`, `groupmod` 和 `groupdel` 可以使用。

## 文件系统

你可以使用 `fileSystems` 来配置文件系统，然后按照挂载点配置文件系统，分区的参数
等等：

```nix
fileSystems."/data" =
  { device = "/dev/disk/by-label/data";
    fsType = "ext4";
  };
```

这条配置生成 `/etc/fstab`，系统在开机时会根据这个表文件来挂载分区。

`device` 不一定要根据 `label` 来指定，也可以通过 `uuid` 。

::: tip 块的 UUID  
你可以用下面的方法查看到这些块的 UUID：

```bash
tritium@KOVA ~> lsblk -o name,mountpoint,size,uuid
NAME
    MOUNTPOINT         SIZE UUID
sda                  363.3M
sdb [SWAP]               2G 1159b63e-3072-4483-b374-78cd487e6460
sdc                      1T 8108c250-d488-4724-9237-5d926569fbef
sdd /mnt/wslg/distro     1T 8677e11d-56ab-4ecb-8dfd-8effb322493f
```

:::

在默认情况下，所有被写在配置的分区都会被自动挂载，除非你指定了 `noauto` 的选项：

你也可以缺省 `fsType` 的值，因为它会自动检测文件系统类型。

::: tip nofail  
如果 `fstab` 内容有误，系统会在启动时显示令人窒息的急救 Shell。为了避免这种情
况，你可以在 `option` 里加入 `nofail` 来确保挂载是异步的且不会严重影响启动。  
:::

## 显示系统

X 窗口系统已经是上个世纪八十年代的软件了，冗余的功能拖累了它的性能，因此建议没有
特殊需求的用户勇敢试水 Wayland。

### X11

X 窗口系统可以提供最基础，成熟（稍微过时）的显示服务，只需要以下配置就能启用：

```nix
services.xserver.enable = true;
```

它会自动检测并启用适合的 xorg 驱动，比如 `mesa` 和 `xf86` 系列驱动。当然你也可以
手动指定：

```nix
services.xserver.videoDrivers = [ "r128" ];
```

通过以上配置就启用了 `xf86-video-r128` 驱动。

然后你应该至少启用一个桌面管理器或窗口管理器。我通常为新手和不喜欢折腾的人推荐桌
面管理器，窗口管理器为装逼和喜欢效率的极客所用。

```nix
#  挑一个喜欢的吧
services.xserver.desktopManager.plasma5.enable = true;
services.xserver.desktopManager.xfce.enable = true;
services.xserver.desktopManager.gnome.enable = true;
services.xserver.desktopManager.mate.enable = true;
services.xserver.windowManager.xmonad.enable = true;
services.xserver.windowManager.twm.enable = true;
services.xserver.windowManager.icewm.enable = true;
services.xserver.windowManager.i3.enable = true;
services.xserver.windowManager.herbstluftwm.enable = true;
```

NixOS 的默认显示管理器是 LightDM（它只在 X11 下工作），你也可以自行选择替代品：

```nix
services.xserver.displayManager.sddm.enable = true;  # KDE 的默认登录管理器
services.xserver.displayManager.gdm.enable = true;  # GNOME 的默认登陆管理器
```

你还可以指定 x11 的键盘布局：

```nix
services.xserver.layout = "de";
services.xserver.xkbVariant = "neo";
```

并且 x11 显示服务可以被手动启用或重启：

```nix
systemctl restart --now display-manager.service
```

在 64 位系统上，如果你想运行 32 位的 OpenGL 程序（比如 Wine）。你应该这样配置：

```nix
hardware.opengl.driSupport32Bit = true;
```

#### 自动登录

如果你的电脑不需要限制其他人访问，你可以设置自动登录来跳过恼人的用户登录界面。在
下面的例子中，我们定义了默认的会话，以便于自动登录到它：

```nix
services.xserver.displayManager.defaultSession = "none+i3";
```

格式是“桌面环境”+“窗口管理器”，但是光配置默认会话还不够，还需要将开启自动登陆的
布尔值传递给显示管理器，并指定自动登录的用户是谁：

```nix
services.xserver.displayManager.lightdm.enable = true;
services.xserver.displayManager.autoLogin.enable = true;
services.xserver.displayManager.autoLogin.user = "alice";
```

#### Intel 图形驱动

通常有两种驱动供 Intel 核心显卡用户选择：`modesetting` 与 `xf86-video-intel`。按
照正常人的脑子想，肯定是带有 `intel` 的专用驱动性能和稳定性更佳，但实际情况是，
后者缺乏维护，过时且不稳定。

`modesetting` 是一种运行在 KMS（Kernel Mode Setting）的通用驱动：

```nix
services.xserver.videoDrivers = [ "modesetting" ];
```

如果你想启用定制驱动，也不是不可以：

```nix
services.xserver.videoDrivers = [ "intel" ];
```

这样你就启用了 `xf86-video-intel` 驱动。

如果你遇到屏幕撕裂的问题，尝试以下设置：

```nix
services.xserver.videoDrivers = [ "intel" ];
services.xserver.deviceSection = ''
  Option "DRI" "2"
  Option "TearFree" "true"
'';
```

如果上面的改动不生效，也有可能是 Intel 自刷新适应的锅，在内核启动参数里加上
`i915.enable_psr=0` 也许会修复这种屏幕只刷新一半的情况（通常出现在机械革命 F1，
联想 Yoga 14s 等机型上）。

#### NVDIA 闭源驱动

皮衣客打死不做个能用的开源黄伟达驱动。由于专有驱动不自由，所以你需要手动启用它：

```nix
services.xserver.videoDrivers = [ "nvidia" ];
```

如果你的显卡很老了，那可能需要老驱动才能驱动它：

```nix
services.xserver.videoDrivers = [ "nvidiaLegacy390" ];
services.xserver.videoDrivers = [ "nvidiaLegacy340" ];
services.xserver.videoDrivers = [ "nvidiaLegacy304" ];
```

#### NVDIA 开源驱动

- nvdia 不公开其显卡的硬件规格和编程接口，导致开源驱动开发者无法完全利用显卡的功
  能和性能。
- nvdia 为其专有驱动添加了一些安全机制，如签名验证，固件加密等，使得开源驱动无法
  加载或修改这些驱动。

nouveau 就是那个自由和开源的驱动 NVIDA 显卡的程序。nouveau 的目标是利用逆向工程
Nvidia 的专有 Linux 驱动程序来创建一个开放源码的驱动程序。

```nix
services.xserver.videoDrivers = [ "nouveau" ];
```

> “nouveau” 是法语中的 “新的” 的意思。

效果见仁见智吧，反正 NVDIA 显卡的 Linux 用户日常没人权。

#### AMD 闭源驱动

AMD 的闭源驱动经常会坏掉，不建议使用：

```nix
services.xserver.videoDrivers = [ "amdgpu-pro" ];
```

建议用下面的开源驱动。

#### AMD 开源驱动

```nix
services.xserver.enable = true;
services.xserver.videoDrivers = [ "amdgpu" ];
```

#### 触控板

笔记本电脑通常会带有触控板，启用配置如下：

```nix
services.xserver.libinput.enable = true;
```

这个驱动还有很多可配置的功能，例如关闭“触碰以点击”功能：

```nix
services.xserver.libinput.touchpad.tapping = false;
```

::: note 废弃的 synaptics 选项  
`services.xserver.synaptics` 选项在 NixOS 17.09 之后的版本中被废弃。  
:::

#### GTK/QT 主题

所有的主题你可以去仓库里找到。如果你想让 QT 和 GTK 的主题一致一些：

```nix
qt.enable = true;
qt.platformTheme = "gtk2";
qt.style = "gtk2";
```

#### 自定义键盘布局（XKB）

这是一个例子，在这个例子中，我们稍微改造一下美式键盘。  
我们先创建一个文件 `us-greek`，放到一个 `symbols` 文件夹下面，在里面描述自定义的
键位：

```nix
xkb_symbols "us-greek"
{
  include "us(basic)"            // 包含基础美式键盘
  include "level3(ralt_switch)"  // 配置右 alt 作为一个第三级开关

  key <LatA> { [ a, A, Greek_alpha ] };
  key <LatB> { [ b, B, Greek_beta  ] };
  key <LatG> { [ g, G, Greek_gamma ] };
  key <LatD> { [ d, D, Greek_delta ] };
  key <LatZ> { [ z, Z, Greek_zeta  ] };
};
```

一个最小键盘布局还需要以下内容：

```nix
services.xserver.extraLayouts.us-greek = {
  description = "US layout with alt-gr greek";
  languages   = [ "eng" ];
  symbolsFile = /yourpath/symbols/us-greek;
};
```

`extraLayouts.` 后的名称应该与布局名匹配。

但是你要知道，你写的 XKB 布局要是坏的，X 显示系统会崩掉的，所以强烈建议先测试再
实装：

```nix
nix-shell -p xorg.xkbcomp
setxkbmap -I/yourpath us-greek -print | xkbcomp -I/yourpath - $DISPLAY
```

你还可以从预置的 XKB 文件获取获取灵感：

```nix
echo "$(nix-build --no-out-link '<nixpkgs>' -A xorg.xkeyboardconfig)/etc/X11/xkb/"
```

更改配置以后，你需要注销再登录才能生效。 然后你键入 `setxkbmap us-greek` 并键入
Alt + a（可能在你的终端不会立马生效）。如果你要更改默认行为，还是配置一下
`services.xserver.layout`。

一个布局可以拥有除了 `xkb_symbols` 以外的数个其他组件，比如我们可以为一些键码绑
定多媒体功能。我们可以通过使用 `pkgs.xorg.xev` 来找到中意的按键的码，然后再创建
定义：

```nix
xkb_keycodes "media"
{
 <volUp>   = 123;
 <volDown> = 456;
}
```

现在我们来引入刚刚新定义的键码：

```nix
xkb_symbols "media"
{
 key.type = "ONE_LEVEL";
 key <volUp>   { [ XF86AudioLowerVolume ] };
 key <volDown> { [ XF86AudioRaiseVolume ] };
}
```

在这里完成总装：

```nix
services.xserver.extraLayouts.media = {
  description  = "Multimedia keys remapping";
  languages    = [ "eng" ];
  symbolsFile  = /path/to/media-key;
  keycodesFile = /path/to/media-sym;
};
```

上面的两个自定义目录用于引用上面的两个 nix 模块。

### Wayland

X11 其实是一种显示协议，X.org 才是显示服务器。Wayland 作为新生的显示服务器，非常
缺乏生态，只能用某些方式才能部分兼容 X11。尽管如此，还是希望所有人能加入 Wayland
的阵营。

X11 在设计之初就分为了服务端与窗口管理器，而一个 Wayland 混成器则类似 X 窗口管理
器里内置了 服务端的功能，这样的设计让 Wayland 在本机体验上有了不少的提升。

Sway 是一个支持 Wayland 的窗口管理器，类似的软件还有 Wayfire，Hyprland 等：

```nix
programs.sway.enable = true;
```

如果你使用基于 wlroot 的窗口管理器，并且有共享屏幕或录制屏幕的需求，记得启用的
wlr 对应的 portal。

```nix
xdg.portal.wlr.enable = true;
```

与之相关的还有 `services.pipewire.enable`。

## GPU 加速

为了能够流畅的硬件解码视频，加速图形渲染等，我们需要配置一些常见的硬件加速 API。

## 桌面环境

### XFCE

### GNOME

### KDE
