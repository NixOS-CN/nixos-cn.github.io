# 双系统安装

## Windows 系统上的准备

本章将介绍如何在已经安装了 Windows 系统的物理机上再安装 NixOS 。

### 关闭快速启动

若不关闭 Windows 的快速启动，可能会导致 NixOS 掉网卡。点击 “更改当前不可用配置”
以后会出现一个 UAC 窗口，点击允许以后，再取消 “启用快速启动（推荐）” 复选框。

![关闭快速启动](/images/GreenHand/TurnOffWindowsFastboot.webp)

### 调整时间设置

由于 Windows 与 Linux 时间标准不同，从 Linux 切换回 Windows 会导致系统时间变更的
问题。

在这里我们提供修改 Windows 设置，以让两种系统时间保持一致的的方法。

PowerShell 管理员权限运行：

```powershell
Reg add HKLM\SYSTEM\CurrentControlSet\Control\TimeZoneInformation /v RealTimeIsUniversal /t REG_DWORD /d 1
```

该命令向注册表添加了字段，下次重启生效。

### 腾出空间

我们需要为 NixOS 的安装准备一些空间，我们推荐为 NixOS 保留的分区不少于 64GB。

你可以使用 Windows 自带的磁盘管理或 DiskGenius 等其他分区软件腾出这些空间。

![Windows 磁盘管理](/images/GreenHand/WindowsDiskManager.webp)

### 制作引导媒介

我们使用 [Ventoy](https://www.ventoy.net/cn/download.html) 制作引导媒介，Ventoy
会将引导写入媒介（驱动器），然后你可以间接选择引导你媒介中的镜像。这样的好处是刻
录一次就能引导多镜像（具体请参阅 Ventoy 官网以获取使用方法）。

下
载[最简镜像](https://nixos.org/download.html#nix-more:~:text=without%20a%20desktop.-,Minimal%20ISO%20image,-The%20minimal%20installation)
（Minimal ISO image），我们不使用官方安装程序做演示，因为没有太多的自定义选项。
下载完成后，拷贝镜像至已经安装 Ventoy 的驱动器的任意目录。

## 调整 BIOS 设置

在执行以下操作时，请将电脑关机，并将启动媒介连接电脑。

### 关闭安全引导

在按下开机键，屏幕出现厂商品牌的时候，按住可以使你进入 BIOS 设置的按键，然后你会
进入跟下图相同或类似的界面。

<!-- prettier-ignore -->
::: warning 厂商差异
具体情况以厂商主板为准。
不同厂商生产的机型进入 BIOS 设置的按键不相同，甚至界面也不会相同。
对于某些厂商（比如联想，宏碁），关闭安全启动需要为主板设置管理员密码，建议完成系
统安装后立刻移除主板密码，以防止密码被遗忘。

<!-- prettier-ignore -->
:::

![关闭安全引导](/images/GreenHand/DisableSecureBoot.webp)

请关闭安全引导，NixOS 官方暂时不支持安全引导。这一步没有代价，安装完成后，你随时
可以把安全引导再开启。

<!-- prettier-ignore -->
::: tip 安全引导
安全引导的技术原理是用数字签名来验证软件是否可信，如果不可信就不让它运行。

<!-- prettier-ignore -->
:::

### 调整启动顺序

<!-- prettier-ignore -->
::: warning UEFI 支持
UEFI 和 Legacy 是两种不同的引导方式，安装前请查阅你的主板是否支持 UEFI，或者当前
系统是否以 UEFI 方式安装。
对于 Windows 系统只需要使用磁盘管理或 DiskGenius 查看是否存在 ESP 分区即可。
而对于 Linux，键入：

```bash
ls /sys/firmware/efi/efivars
```

若存在输出，就代表支持 UEFI。

<!-- prettier-ignore -->
:::

默认情况下，BIOS 会从本地硬盘开始查找 EFI（ESP） 分区，然后启动这个分区的启动管
理器，所以我们要在 BIOS 设置中找到诸如“启动顺序”选项，将 USB 拉到最高优先级。

保存后重启，不出意外就到了接下来的环节。

## 引导选择

你会先进入 Ventoy 的引导界面，然后使用上下按键选择你需要引导的镜像，回车确认。下
图就是你即将见到的 NixOS 的引导界面：

![初见引导界面](/images/GreenHand/FirstBoot.webp)

正常来说选择第一项正常启动即可。如果你想引导完成后移除启动媒介，可以使用
`copytoram` 启动项，这样会把系统复制到内存。

<!-- prettier-ignore -->
::: warning 屏幕工作不正常
如果在正常的内核引导下，屏幕会有闪烁，撕裂的情况发生，导致安装难以继续。那么请重
启后选择 `nomodeset` 项引导，此项会禁用一些内核针对显卡的功能。

<!-- prettier-ignore -->
:::

## 进入 Live CD

![初遇](/images/GreenHand/TrulyMeet.webp)

由于我们选择的是最小化镜像，所以是没有桌面环境的，当前在我们面前的是 `tty` 界
面。

我们现在进入的系统是由镜像直接初始化的，系统并未被安装到硬盘上。我们需要使用现在
这个已经被加载的基本系统完成 NixOS 到硬盘的部署。

### 网络连接

如果你有可选的有线连接，请将网线接入到电脑。

#### USB 热点

退而求其次，如果你手机数据流量充足，也可以使用 USB 共享网络给主机。

#### WiFi 连接

NixOS 默认使用 `wpa_supplicant` 作为无线守护程序。

```bash
sudo systemctl start wpa_supplicant  # 启动服务
sudo wpa_cli  # 进入 wpa 命令行交互模式
```

然后就进入了交互模式，不同区域的 WiFi 网络认证协议也不相同。大多数情况下使用家庭
网络的方式即可：

<!-- prettier-ignore -->
::: code-tabs#shell

@tab 开放网络

```bash
> add_network
0
> set_network 0 ssid "WIFI SSID"
OK
> set_network 0 key_mgmt NONE
OK
> enable_network 0
OK
```

@tab 家庭网络

```bash
> add_network
0
> set_network 0 ssid "你家 WIFI 的 SSID"
OK
> set_network 0 psk "WIFI 密码"
OK
> set_network 0 key_mgmt WPA-PSK
OK
> enable_network 0
OK
```

@tab 企业网络

```bash
> add_network
0
> set_network 0 ssid "eduroam"
OK
> set_network 0 identity "myname@example.com"
OK
> set_network 0 password "mypassword"
OK
> set_network 0 key_mgmt WPA-EAP
OK
> enable_network 0
OK
```

<!-- prettier-ignore -->
:::

```bash
<3>CTRL-EVENT-CONNECTED - Connection to 32:85:ab:ef:24:5c completed [id=0 id_str=]
```

等待出现上面的消息说明你已经连接上了，可以输入 `quit` 以退出交互模式。

#### 检测网络

```bash
ping www.baidu.com -c 4  # 此项不通优先先检查域名解析服务器
ping 119.29.29.29 -c 4  # 腾讯 DNSPod，不通请检查网络连接
```

如果收到了大多数乃至全部包，说明网络是连通的。

### 更换频道

使用以下命令将两个频道（系统频道和软件仓库频道）替换到镜像源频道：

<!-- prettier-ignore -->
::: warning 不要盲目复制
在订阅系统版本时请指定系统版本，一般指定当前的最新稳定版。
如果不清楚可以去官网查询或查看你的 Live CD 版本。

<!-- prettier-ignore -->
:::

```bash
sudo -i
nix-channel --add https://mirrors.ustc.edu.cn/nix-channels/nixpkgs-unstable nixpkgs  # 订阅镜像仓库频道
nix-channel --add https://mirrors.ustc.edu.cn/nix-channels/nixos-22.11 nixos  # 请注意系统版本
nix-channel --list  # 列出频道
nix-channel --update  # 更新并解包频道
nixos-rebuild --option substituters "https://mirror.sjtu.edu.cn/nix-channels/store" switch --upgrade  # 临时切换二进制缓存源，并更新生成
```

### 分区与格式化

首先，我们使用 `lsblk` 命令查看一手分区情况：

| NAME       | MAJ:MIN | RM  | SIZE   | RO  | TYPE | MOUNTPOINTS      |
| ---------- | ------- | --- | ------ | --- | ---- | ---------------- |
| loop0      | 7:0     | 0   | 799.4M | 1   | loop | `/nix/.ro-store` |
| sda        | 8:0     | 1   | 0B     | 0   | disk |                  |
| sdb        | 8:16    | 1   | 57.7G  | 0   | disk |                  |
| -sdb1      | 8:17    | 1   | 57.6G  | 0   | part |                  |
| --ventory  | 254:0   | 0   | 833M   | 1   | dm   | `/iso`           |
| -sda2      | 8:18    | 1   | 32M    | 0   | part |                  |
| nvme0n1    | 259:0   | 0   | 476.9G | 0   | disk |                  |
| -nvme0n1p1 | 259:1   | 0   | 256M   | 0   | part |                  |
| -nvme0n1p2 | 259:2   | 0   | 16M    | 0   | part |                  |
| -nvme0n1p3 | 259:3   | 0   | 320G   | 0   | part |                  |

`TYPE` 列指示了分区类型还是硬盘类型。这里需要的是硬盘类型。根据接口类型和硬盘容
量大小，你很快就能分辨出我电脑的唯一硬盘是 `nvme0n1`，`sda` 是我的引导 U 盘。

```bash
parted -a optimal /dev/nvme0n1  # 启用对齐，并进行分区
```

我们已经进入了交互模式。在这个模式中，所有操作都是即时生效的，所以请再三确认你的
操作。你可以输入 `help` 查看帮助手册，然后输入 `p` 查看当前分区状况。

| Number | Start  | End   | Size   | File system | Name                         | Flags                   |
| ------ | ------ | ----- | ------ | ----------- | ---------------------------- | ----------------------- |
| 1      | 20.5KB | 268MB | 268MB  | fat32       | EFI system partition         | boot, esp, no_automount |
| 2      | 268MB  | 285MB | 16.8MB |             | Microsoft reserved partition | msftres, no_automount   |
| 3      | 286MB  | 344GB | 344GB  | ntfs        | Basic data partition         | msftdata                |

在现有的 GPT 分区表上，我们添加额外的分区。首先我们需要一个 NixOS 的主分区，用来
容纳 NixOS 的根文件系统。

```bash
mkpart primary 344GB -16GiB
```

然后添加一个 SWAP 分区，它可以拓展你的内存能力以及将内存数据休眠于此。

```bash
mkpart primary linux-swap -16GiB 100%
```

<!-- prettier-ignore -->
::: warning 分区对齐
不出意外的话，会出现一个警告：

**Warnning: The resulting partition is not properly aligned for best
performance: 966660784s % 2048s != 0s Ignore/Cancel?**

==我在这里输入了 Ignore，忽略这个警告。==

在我的设备上，现有的 GPT 分区表是由 Disk Genius 生成的，出现这个警告我并不意外，
我选择忽略这个警告。这个警告提示你分区没有对齐，对齐以后才能获得最佳性能。如果你
想让分区重新对齐，就只能重新创建 GPT 表，再重新安装两个系统。

如果你想让你的分区对齐，可以在创建第一张分区表时使用百分比表示分区的开始和结束位
置：

```bash
mkpart primary 0% 100%
```

或者在开始的时候就使用对齐参数：

```bash
parted -a optimal /dev/nvme0n1
```

你还可以使用下面的命令检查分区是否对齐，最后一个数字是分区序号：

```bash
align-check optimal 1
```

<!-- prettier-ignore -->
:::

现在的分区表应当是：

| Number | Start  | End   | Size   | File system    | Name                         | Flags                   |
| ------ | ------ | ----- | ------ | -------------- | ---------------------------- | ----------------------- |
| 1      | 20.5KB | 268MB | 268MB  | fat32          | EFI system partition         | boot, esp, no_automount |
| 2      | 268MB  | 285MB | 16.8MB |                | Microsoft reserved partition | msftres, no_automount   |
| 3      | 286MB  | 344GB | 344GB  | ntfs           | Basic data partition         | msftdata                |
| 4      | 344GB  | 495GB | 151GB  |                | primary                      |                         |
| 5      | 495GB  | 512GB | 17.2GB | linux-swap(v1) | primary                      | swap                    |

然后输入 `quit` 退出交互模式。

接下来进行格式化环节。格式化根目录：

```bash
mkfs.btrfs -L nixos /dev/nvme0n1p4
```

再格式化交换分区：

```bash
mkswap -L swap /dev/nvme0n1p5
```

然后挂载根分区到当前的 `/mnt` 目录下：

```bash
mount /dev/nvme0n1p4 /mnt
```

创建几个子卷，我们今后可以对子卷进行更细粒化的管理：

```bash
btrfs subvolume create /mnt/root
btrfs subvolume create /mnt/home
btrfs subvolume create /mnt/nix
```

取消挂载根目录，因为我们要重新挂载子卷：

```bash
umount /mnt
```

挂载子卷时启用透明压缩：

```bash
mount -o compress=zstd,subvol=root /dev/nvme0n1p4 /mnt
mkdir /mnt/{home,nix,boot}
mount -o compress=zstd,subvol=home /dev/nvme0n1p4 /mnt/home
mount -o compress=zstd,noatime,subvol=nix /dev/nvme0n1p4 /mnt/nix
mount /dev/nvme0n1p1 /mnt/boot
swapon /dev/nvme0n1p5
```

### 编辑系统配置

我们使用以下命令生成基础配置：

```bash
nixos-generate-config --root /mnt
```

然后编辑配置：

```bash
vim /mnt/etc/nixos/configuration.nix
```

因为是基本的安装，我并没有为配置加太多花，==不要改动你配置中的最后一行的版本号
==：

```nix
{ config, lib, pkgs, ...}:
{
    imports = [ ./hardware-configuration.nix ];
    boot.loader = {
        grub = {
            enable = true;
            device = "nodev";
            efiSupport = true;
            extraEntries = ''
                menuentry "Windows" {
                    search --file --no-floppy --set=root /EFI/Microsoft/Boot/bootmgfw.efi
                    chainloader (''${root})/EFI/Microsoft/Boot/bootmgfw.efi
                }
            '';
        };
        efi = {
            canTouchEfiVariables = true;
            efiSysMountPoint = "/boot";
        };
    };
    networking = {
        hostName = "nixos";
        networkmanager.enable = true;
    };
    time.timeZone = "Asia/Shanghai";
    i18n.defaultLocale = "en_US.UTF-8";
    services.xserver = {
        enable = true;
        displayManager.sddm.enable = true;
        desktopManager.plasma5.enable = true;
    };
    environment.systemPackages = with pkgs; [
        vim alacritty
    ];
    sound.enable = true;
    hardware.pulseaudio.enable = true;
    nix.settings.substituters = [ "https://mirror.sjtu.edu.cn/nix-channels/store" ];
    system.stateVersion = "23.11";  # 不要改动
}
```

对于 `hardware-configuration.nix` 不需要太多改动。==每个机器有不同的特征，不要直
接复制==：

```nix
{ config, lib, pkgs, modulesPath, ...}:
{
    imports = [ (modulesPath + "/installer/scan/not-detected.nix") ];
    boot = {
        initrd = {
            availablekernelModules = [ "xhci_pci" "thunderbolt" "nvme" "usbhid" "usb_storage" "sd_mod" ];
            kernelModules = [ ];
        }
        kernelPackages = pkgs.linuxPackages_latest;
        kernelModules = [ "kvm-intel" ];
        kernelParams = [ "i915.enable_psr=0" ];
        extraModulesPackages = [ ];
        fileSystem = {
            "/" = {
                device = "/dev/disk/bu-uuid/a3c4d78a-4e74-4c0a-9ecc-680d5f69f042";
                fsType = "btrfs";
                options = [ "subvol=root" "compress=zstd" ];
            };
            "/home" = {
                device = "/dev/disk/bu-uuid/a3c4d78a-4e74-4c0a-9ecc-680d5f69f042";
                fsType = "btrfs";
                options = [ "subvol=home" "compress=zstd" ];
            };
            "/nix" = {
                device = "/dev/disk/bu-uuid/a3c4d78a-4e74-4c0a-9ecc-680d5f69f042";
                fsType = "btrfs";
                options = [ "subvol=nix" "noatime" "compress=zstd" ];
            };
            "/boot" = {
                device = "/dev/disk/by-uuid/9DCC-7A56";
                fsType = "vfat";
            };
        };
    };
    swapDevices = [
        {
            device = "/dev/disk/by-uuid/ad463837-1b84-45f5-8ca9-42ee8f05377d"
        }
    ];
    networking.useDHCP = lib.mkDefault true;
    nixpkgs.hostPlatform = lib.mkDefault "x86_64-linux";
    powerManagement.cpuFreqGovernor = lib.mkDefault "powersave";
    hardware.cpu.intel.updateMicrocode = lib.mkDefault config.hardware.enableRedistributableFirmware;
}
```

你只需要修改各个子卷的挂载参数（添加 `"compress=zstd"` 和 `"noatime"`），还有启
用最新的内核就好。需要注意的是上面的内核启动参数，对于我的机型，没有
`i915.enable_psr=0` 屏幕显示就会闪烁撕裂，对于其他机型（比如联想 Yoga 14s），键
盘会无法工作，这个时候就需要添加 `i8042.dumbkbd` 启动参数。其他机型遇到的各种问
题请通过本页面底部的链接联系 NixOS-CN 社区以寻求支持。

### 部署系统

```bash
sudo nixos-install --option substituters "https://mirror.sjtu.edu.cn/nix-channels/store"
```

添加用户，tritium 是我的用户名，记得改成你自己的：

```bash
nixos-enter  # 进入部署好的系统，类似 arch 的 chroot
passwd root  # 重置 root 密码
useradd -m -G wheel tritium  # 添加普通用户，并加入 wheel 组
passwd tritium  # 设置普通账户密码
```

然后关机，不出意外的话还是需要你去 BIOS 调整一下启动项，推荐把 NixOS 的启动项拉
到最前面，因为在 GRUB 的界面你能选择引导至 NixOS 还是 Windows。当然有的机型可以
在出现厂商 Logo 时直接按 F10（或其他按钮）来选择启动项。

最终退后三步朝电脑跪拜祈求它能正常开机，至此基本安装教程完毕。
