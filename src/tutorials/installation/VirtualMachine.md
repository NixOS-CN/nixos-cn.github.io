# 虚拟机安装

无论你使用什么虚拟机安装，过程都是大同小异的。需要注意的是 HyperV 的安全启动是默
认开启的，需要你手动关掉。

以下教程是基于 UEFI 的安装，所以还需要你启用 VMware 的 UEFI 选项（如果你真的使用
VMware 的话）。

![启用 UEFI](/images/GreenHand/EnableUefi.webp)

## 创建虚拟机

虚拟机的资源大小取决于你的应用，这个教程仅为新手提供一种基本系统的安装方法，更加
高阶的个性化教程会在额外的章节提及。

本文使用创建的虚拟机的内存为 8GB，硬盘为 32GB 大小。如果你的计算机资源不够，理论
上是可以尝试开辟更小的资源。

![资源分配](/images/GreenHand/VmResAllocation.webp)

## 检查虚拟网络

部分 VMWARE 用户会遇到网络无法连接到宿主机网络的问题，可能是虚拟网络未配置导致
的，推荐下面的 NAT 配置：

![虚拟网络](/images/GreenHand/VmNet.webp)

如果你看到图上的按钮和文本框大多为灰色并无法修改，记得点击右下角的 UAC 蓝色盾牌
以修改设置。HyperV 的虚拟交换机保持默认设置就好，一般而言没有那么容易出问题。

## 检查 UEFI 变量

然后假设你如愿开机进入 Live CD 了：

![与 TTY 相遇](/images/GreenHand/FirstEncounterWithTty.webp)

为了防止分区的时候遇到麻烦，还是先验证一下 UEFI 是否真正启用：

```bash
ls /sys/firmware/efi/efivars  # 列出 EFI 变量
```

![EFI 变量](/images/GreenHand/Efivars.webp)

## 检查网络

随便 Ping 几个主机：

```bash
ping www.baidu.com -c 4
ping 119.29.29.29 -c 4
```

如果域名不可及而 IP 可以访问，则优先检查 DNS 服务器配置。

![Ping](/images/GreenHand/CheckNet.webp)

## 更换镜像频道

频道类似一种获取软件源码包的软件源。

由于未知原因大陆访问远洋主机有点困难，还是用镜像服务器吧：

<!-- prettier-ignore -->
::: warning 注意系统版本
截至笔者截稿，NixOS 当前最新版本为 25.05，遂命令也是针对这个版本而生效的，更新的
版本请注意替换命令中的==系统版本号==。

<!-- prettier-ignore -->
:::

```bash
sudo -i
nix-channel --add https://mirrors.ustc.edu.cn/nix-channels/nixpkgs-unstable nixpkgs  # 订阅镜像仓库频道
nix-channel --add https://mirrors.ustc.edu.cn/nix-channels/nixos-25.05 nixos  # 请注意系统版本
nix-channel --list  # 列出频道，这一步是确认修改没有出错
nix-channel --update  # 更新并解包频道
nixos-rebuild --option substituters https://mirrors.ustc.edu.cn/nix-channels/store switch --upgrade  # 临时切换二进制缓存源，并更新生成
```

不出意外就能顺利构建：

![使配置生效](/images/GreenHand/RebuildSystem.webp)

## 分区与格式化

查看一下我们要分区的设备：

```bash
lsblk
```

![块设备](/images/GreenHand/Lsblk.webp)

可以看出 `/dev/sda` 就是我们要分区的设备。

接下来进入 `parted` 的交互模式开始分区，请注意这些修改是实时生效的，所以不需要你
操心保存的事。

<!-- prettier-ignore -->
::: tip 单位问题
两种单位的计算方法不一致，MB 以 10 为底计算，而 MiB 以 2 为底计算，这也许能解答
你对 `parted` 显示的硬盘时大时小的疑惑。GiB 与 GB 同理。

<!-- prettier-ignore -->
:::

```bash
parted /dev/sda  # 分区该设备
mklabel gpt  # 创建 GPT 表
mkpart ESP fat32 1MiB 256MiB  # 在 1 MiB - 256 MiB 的位置创建引导分区
p  # 打印当前分区表
set 1 esp on  # 将序号为 1 的分区标识为可启动
mkpart primary 256MiB -8GiB  # 在自 256MiB 至分区尾前 8GiB 的位置创建主分区
mkpart primary linux-swap -8GiB 100%  # 余下的 8GiB 用于创建交换分区
p  # 确认当前分区情况
quit  # 退出
```

<!-- prettier-ignore -->
::: note 保留 1 MiB
1 MiB 可以保证分区标识，也就是说，分区的起始扇区包含了分区的类型、大小、位置等信
息，这些信息是操作系统识别和加载分区的重要依据，如果这些信息被破坏或覆盖，就会导
致分区无法启动或者数据丢失。

<!-- prettier-ignore -->
:::
以上命令创建的分区有：

- 一个引导分区，存放内核和引导
- 一个主分区，放置软件，用户数据
- 一个交换分区（虚拟内存）

但是光创建分区还不够，还需要格式化他们：

```bash
mkfs.fat -F 32 /dev/sda1  # 格式化引导分区为 FAT32 格式
mkfs.btrfs -L nixos /dev/sda2  # 格式化根分区为 Btrfs 格式
mkswap -L swap /dev/sda3  # 设置交换分区
mount /dev/sda2 /mnt  # 将根分区挂载到 /mnt 下
btrfs subvolume create /mnt/root  # 创建 root 子卷
btrfs subvolume create /mnt/home  # 创建 home 子卷
btrfs subvolume create /mnt/nix  # 创建 nix 子卷
umount /mnt  # 取消挂载
mount -o compress=zstd,subvol=root /dev/sda2 /mnt  # 启用透明压缩参数挂载 root 子卷
mkdir /mnt/{home,nix,boot}  # 创建 home，nix，boot 目录
mount -o compress=zstd,subvol=home /dev/sda2 /mnt/home  # 启用透明压缩参数挂载 home 子卷
mount -o compress=zstd,noatime,subvol=nix /dev/sda2 /mnt/nix  # 启用透明压缩并不记录时间戳参数挂载 nix 子卷
mount /dev/sda1 /mnt/boot  # 挂载 boot
swapon /dev/sda3  # 启用交换分区
```

<!-- prettier-ignore -->
::: tip 引导分区
大多数厂商的主板只认 FAT32 格式的引导分区。

<!-- prettier-ignore -->
:::

<!-- prettier-ignore -->
::: tip Btrfs
Btrfs 是一种比较新颖的文件系统（不提还在冲击内核的 Bcachefs 的话），支持 Cow，校
验，快照等特性。划分子卷是为了更好的区分管理。

<!-- prettier-ignore -->
:::

我们还需要将当前状态生成配置到目标系统中：

```bash
nixos-generate-config --root /mnt
```

我们还需要在默认配置上修改一些内容，才能完成一个粗放的安装：

```bash
vim /mnt/etc/nixos/configuration.nix
```

```nix
{ config, pkgs, ...}:
{
    imports = [
        ./hardware-configuration.nix
    ];
  boot.loader.systemd-boot.enable = true;
  boot.loader.efi.canTouchEfiVariables = true;
  networking.networkmanager.enable = true;
  networking.hostName = "nixos";
  time.timeZone = "Asia/Shanghai";
  i18n.defaultLocale = "en_US.UTF-8";
  services.xserver.enable = true;
  services.xserver.displayManager.sddm.enable = true;
  services.xserver.desktopManager.plasma5.enable = true;
  environment.systemPackages = with pkgs; [
    vim
    alacritty
  ];

  nix.settings.substituters = [
    "https://mirrors.cernet.edu.cn/nix-channels/store"
  ];
  system.stateVersion = "25.05";
}
```

你肯定在安装 NixOS 之前就了解过它是一个根据配置文件生成系统的发行版，在上面的配
置中我们描述了一个带 KDE 桌面的基本系统。

由于生成配置命令没有写入 Btrfs 子卷的挂载参数，我们需要自己修改另一个配置文件：

```bash
vim /mnt/etc/nixos/hardware-configuration.nix
```

![挂载参数](/images/GreenHand/HardwareConfig.webp)

加一些小参数，比如 `"compress=zstd"` 和 `"noatime"`，需要注意的是 Nix 的列表语法
是用空格分隔元素的。

然后开始部署系统：

```bash
nixos-install --option substituters https://mirrors.ustc.edu.cn/nix-channels/store
```

<!-- prettier-ignore -->
::: note 缓存缺失
如果缓存主机缺失某些二进制缓存，带来了冗长的编译环节，可以尝试更换一个
`substituter`，比如 `https://mirror.sjtu.edu.cn/nix-channels/store`。

<!-- prettier-ignore -->
:::

添加用户，`tritium` 是我的用户名，记得改成你自己的：

```bash
nixos-enter  # 进入部署好的系统，类似 arch 的 chroot
passwd root  # 重置 root 密码
useradd -m -G wheel tritium  # 添加普通用户，并加入 wheel 组
passwd tritium  # 设置普通账户密码
```

<!-- prettier-ignore -->
::: note 重置 root 密码
`nixos-install` 有时候有毒，最后一步的设置密码不生效，所以才会有上面重置 root 密
码这步。

<!-- prettier-ignore -->
:::
然后重启（最好断掉虚拟机的光驱），就能看到安装好的系统了：

![好久不见，KDE](/images/GreenHand/HelloKde.webp)
