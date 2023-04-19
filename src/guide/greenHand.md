# 双系统安装

## Windows 系统上的准备

本章将介绍如何在已经安装了 Windows 系统的物理机上再安装 NixOS 。

### 关闭快速启动

若不关闭 Windows 的快速启动，可能会导致 NixOS 掉网卡。点击 “更改当前不可用配置” 以后会出现一个 UAC 窗口，点击允许以后，再取消 “启用快速启动（推荐）” 复选框。

![关闭快速启动](/images/GreenHand/TurnOffWindowsFastboot.webp)

### 调整时间设置

由于 Windows 与 Linux 时间标准不同，从 Linux 切换回 Windows 会导致系统时间变更的问题。

在这里我们提供修改 Windows 设置，以让两种系统时间保持一致的的方法。

PowerShell 管理员权限运行：

```powershell
Reg add HKLM\SYSTEM\CurrentControlSet\Control\TimeZoneInformation /v RealTimeIsUniversal /t REG_DWORD /d 1
```

该命令向注册表添加了字段，下次重启生效。

### 制作引导媒介

我们使用 [Ventoy](https://www.ventoy.net/cn/download.html) 制作引导媒介，Ventoy 会将引导写入媒介（驱动器），然后你可以间接选择引导你媒介中的镜像。这样的好处是你不用为了刻录整个驱动器，下次需要引导其他镜像时只需要把镜像拷贝到该驱动器即可。

下载[最简镜像](https://nixos.org/download.html#nix-more:~:text=without%20a%20desktop.-,Minimal%20ISO%20image,-The%20minimal%20installation)
（Minimal ISO image），我们不使用官方安装程序做演示，因为没有太多的自定义选项。下载完成后，拷贝镜像至已经安装 Ventoy 的驱动器的任意目录。

## 调整 BIOS 设置

在执行以下操作时，请将电脑关机，并将启动媒介连接电脑。

### 关闭安全引导

在按下开机键，屏幕出现厂商品牌的时候，按住可以使你进入 BIOS 设置的按键，然后你会进入跟下图相同或类似的界面。

::: warning 厂商差异
具体情况以厂商主板为准。
不同厂商生产的机型进入 BIOS 设置的按键不相同，甚至界面也不会相同。
对于某些厂商（比如联想，宏碁），关闭安全启动需要为主板设置管理员密码，建议完成系统安装后立刻移除主板密码，以防止密码被遗忘。
:::

![关闭安全引导](/images/GreenHand/DisableSecureBoot.webp)

请关闭安全引导，尽管 Ventoy 和 NixOS 都已经支持了安全引导，为了统一环境，我们还是建议关闭安全引导。这一步没有代价，安装完成后，你随时可以把安全引导再开启。

::: tip 安全引导
安全引导的技术原理是用数字签名来验证软件是否可信，如果不可信就不让它运行。
:::

### 调整启动顺序

::: warning UEFI 支持
UEFI 和 Legacy 是两种不同的引导方式，安装前请查阅你的主板是否支持 UEFI，或者当前系统是否以 UEFI 方式安装。
对于 Windows 系统只需要使用磁盘管理或 DiskGenius 查看是否存在 ESP 分区即可。
而对于 Linux，键入：

```bash
ls /sys/firmware/efi/efivars
```

若存在输出，就代表支持 UEFI。
本教程仅适用于支持 UEFI 的主板或机型，Legacy 的安装方式会有些许区别，但不多。
:::

默认情况下，BIOS 会从本地硬盘开始查找 EFI（ESP） 分区，然后启动这个分区的启动管理器，所以我们要在 BIOS 设置中找到诸如“启动顺序”选项，将 USB 拉到最高优先级。

保存后重启，不出意外就到了接下来的环节。

## 引导选择

你会先进入 Ventoy 的引导界面，然后使用上下按键选择你需要引导的镜像，回车确认。下图就是你即将见到的 NixOS 的引导界面：

![初见引导界面](/images/GreenHand/FirstBoot.webp)

正常来说选择第一项正常启动即可。如果你想引导完成后移除启动媒介，可以使用 `copytoram` 启动项，这样会把系统复制到内存。

::: warning 屏幕工作不正常
如果再正常的内核引导下，屏幕会有闪烁，撕裂的情况发生，导致安装难以继续。那么请重启后选择 `nomodeset` 项引导，此项会禁用一些内核针对显卡的功能。
:::

## 进入 Live CD

![初遇](/images/GreenHand/TrulyMeet.webp)

如果你是 ArchLinux 用户，那可能你会对这个 tty 界面无比熟悉。

我们现在进入的系统是由镜像直接初始化的，系统并未被安装到硬盘上，我们需要使用现在这个已经被加载的基本系统完成 NixOS 到硬盘的部署。

### 网络连接

如果你有可选的有线连接，请将网线接入到电脑。

#### USB 热点

退而求其次，如果你数据流量充足，也可以使用 USB 共享网络给主机。只需要将手机通过 USB 数据线连接到电脑，然后找到下属页面，打开对应的开关：

![OriginOS 示例](/images/GreenHand/UsbHostpot.webp)

#### WiFi 连接

NixOS 中自带的无线守护程序不是 `NetWorkManager`，也不是 `iwd`，而是 `wpa_supplicant`。

```bash
sudo systemctl start wpa_supplicant  # 启动服务
sudo wpa_cli  # 进入 wpa 命令行
```

然后就进入了交互模式：

```bash
> add_network
0
> set_network 0 ssid "你的 SSID"
OK
> set_network 0 psk "你的 WiFi 密码"
OK
> set_network 0 key_mgmt WPA-PSK  # 加密方式
OK
> enable_network 0
```

等待出现一条消息后即可 `quit` 退出交互模式。

#### 检测网络

```bash
ping www.baidu.com  # 此项不通优先先检查域名解析服务器
ping 119.29.29.29 # 腾讯 DNSPod，不通请检查网络连接
```

如果收到了大多数乃至全部包，说明网络是连通的。

### 更换 substituters

类似其他发行版的换源，我们当前修改的是 Live CD 的 `substituters`。

```bash
sudo vim /etc/nixos/configuration.nix
```

::: tip vim
vi/vim 是 linux 上最经典的文本编辑器之一，如果你不清楚操作的话这里简述一下：
`i` 进入编辑模式，`Esc` 退出任意模式，进入命令模式，命令模式下输入 `:wq` 或 `:x` 保存。
:::

添加 `substituter`：

```nix
(config, pkgs,...):
{  
  imports = [ <nixpkgs/nixos/modules/installer/cd-dvd/installation-cd-minimal.nix> ];
  nix.settings.substituters = [ "https://mirrors.ustc.edu.cn/nix-channels/store" ];
}
```

::: warning 只读写入警告
如果你发现打开文件以后，左下角出现 readonly 提示，那可能是你没有 sudo 提权，抑或你没有选择 copytoram 启动项。
如果你确认了使用 sudo 提权，那么无视提示即可，编辑完成后只需要命令模式下输入 `:wq!` 强制保存即可。这一步的代价是可能损坏 ISO 文件，不过 ISO 是可以再下载的，就算损坏了也无所谓。
:::

```bash
sudo nixos-rebuild switch  # 由于更新了配置，重新“生成”系统
sudo nix-channel --update  # 更新频道
sudo nixos-rebuild switch --upgrade  # 若有系统更新，重新构建系统“生成”
```

### 分区

首先，我们使用 `lsblk` 命令查看一手分区情况：
