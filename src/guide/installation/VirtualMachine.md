# 虚拟机安装

无论你使用什么虚拟机安装，过程都是大同小异的。需要注意的是 HyperV 的安全启动是默认开启的，需要你手动关掉。
以下教程是基于 UEFI 的安装，所以还需要你启用 VMWARE 的 UEFI 选项（如果你真的使用 VMWARE 的话）。

![启用 UEFI](/images/GreenHand/EnableUefi.png)

## 创建虚拟机

虚拟机的资源大小取决于你的应用，这个教程仅为新手提供一种基本系统的安装方法，更加高阶的个性化教程会在额外的章节提及。
本文使用创建的虚拟机的内存为 8GB，硬盘为 32GB 大小。如果你的计算机资源不够，理论上是可以尝试开辟更小的资源。

![资源分配](/images/GreenHand/VmResAllocation.png)

## 检查虚拟网络

部分 VMWARE 用户会遇到网络无法连接到宿主机网络的问题，可能是虚拟网络未配置导致的，推荐下面的 NAT 配置：

![虚拟网络](/images/GreenHand/VmNet.png)

如果你看到图上的按钮和文本框大多为灰色，记得点击以下右下角的 UAC 蓝色盾牌以修改设置。HyperV 的虚拟交换机保持默认设置就好，一般而言没有那么容易出问题。

## 检查 UEFI 变量

然后假设你如愿开机进入 Live CD 了：

![与 TTY 相遇](/images/GreenHand/FirstEncounterWithTty.png)

为了分区的时候遇到麻烦，还是先验证一下 UEFI 是否真正启用：

```bash
ls /sys/firmware/efi/efivars
```

![EFI 变量](/images/GreenHand/Efivars.png)

## 检查网络

随便 Ping 几个主机：

```bash
ping www.baidu.com -c 4
ping 119.29.29.29 -c 4
```

![Ping](/images/GreenHand/CheckNet.png)

## 更换镜像频道

频道类似一种获取软件源码包的一种软件源。

由于未知原因大陆访问远洋主机有点困难，还是用镜像服务器吧：

::: warning 注意系统版本
截至笔者截稿，NixOS 当前最新版本为 23.05，遂命令也是针对这个版本而生效的，更新的版本请注意替换命令中的==系统版本号==。
:::

```bash
sudo nix-channel --add https://mirrors.ustc.edu.cn/nix-channels/nixpkgs-unstable nixpkgs  # 订阅镜像仓库频道
sudo nix-channel --add https://mirrors.ustc.edu.cn/nix-channels/nixos-23.05 nixos  # 请注意系统版本
sudo nix-channel --list  # 列出频道，这一步是确认修改没有出错
sudo nix-channel --update  # 更新并解包频道
sudo nixos-rebuild --option substituters "https://mirrors.ustc.edu.cn/nix-channels/store" switch --upgrade  # 临时切换二进制缓存源，并更新生成
```

不出意外就能顺利构建：

![使配置生效](/images/GreenHand/RebuildSystem.png)

## 分区与格式化

查看一下我们要分区的设备：

```bash
lsblk
```

![块设备](/images/GreenHand/Lsblk.png)

可以看出 `/dev/sda` 就是我们要分区的设备。

接下来进入 `parted` 的交互模式开始分区，请注意这些修改是实时生效的，所以不需要你操心保存的事。

::: tip 单位问题
两种单位的计算方法不一致，MB 以 10 为底计算，而 MiB 以 2 为底计算，这也许能解答你对 `parted` 显示的硬盘时大时小的疑惑。GiB 与 GB 同理。
:::

```bash
sudo parted /dev/sda
mklabel gpt
mkpart ESP fat32 1MiB 256MiB
p
set 1 esp on
mkpart primary 256MB -8GB
mkpart primary linux-swap -8GB 100%
p
quit
```

::: note 保留 1 MiB
1 MiB 可以保证分区标识，也就是说，分区的起始扇区包含了分区的类型、大小、位置等信息，这些信息是操作系统识别和加载分区的重要依据，如果这些信息被破坏或覆盖，就会导致分区无法启动或者数据丢失。
:::
以上命令创建的分区有：

- 一个引导分区，存放内核和引导
- 一个主分区，放置软件，用户数据
- 一个交换分区（虚拟内存）

但是光创建分区还不够，还需要格式化：

```bash
sudo mkfs.fat -F 32 /dev/sda1
sudo mkfs.btrfs -L nixos /dev/sda2
sudo mkswap -L /dev/sda3
sudo mount /dev/sda2 /mnt
sudo btrfs subvolume create /mnt/root
sudo btrfs subvolume create /mnt/home
sudo btrfs subvolume create /mnt/nix
sudo umount /mnt
sudo mount -o compress=zstd,subvol=root /dev/sda2 /mnt
sudo mkdir /mnt/{home,nix,boot} 
sudo mount -o compress=zstd,subvol=home /dev/sda2 /mnt/home
sudo mount -o compress=zstd,noatime,subvol=nix /dev/sda2 /mnt/nix
sudo mount /dev/sda1 /mnt/boot
sudo swapon /dev/sda3
```

以上命令创建了三个 btrfs 子卷，格式化了引导分区，然后我们挂载他们，并启用交换分区。然后生成配置到目标系统中：

```bash
sudo nixos-generate-config --root /mnt
```

我们还需要在默认配置上修改一些内容，才能完成一个粗放的安装：

```bash
sudo vim /mnt/etc/nixos/configuration.nix
```

```nix
boot.loader.systemd-boot.enable = true;
boot.loader.efi.canTouchEfiVariables = true;
networking.networkmanager.enable = true;
time.timeZone = "Asia/Shanghai";
i18n.defaultLocale = "en_US.UTF-8";
services.xserver.enable = true;
enviroment.systemPackages = with pkgs; [
    vim,
    wget,
    curl,
    alacritty
];
```

由于生成配置命令没有写入 btrfs 的挂载参数，我们需要自己加上：

```bash
sudo vim /mnt/etc/nixos/configuration.nix
```

然后开始部署系统：

```bash
sudo nixos-install --option substituters "https://mirrors.ustc.edu.cn/nix-channels/store"
```

::: note 缓存缺失
如果缓存主机缺失某些二进制缓存，带来了冗长的编译环节，可以尝试更换一个 `substituter`，比如 `https://mirror.sjtu.edu.cn/nix-channels/store`。
:::

添加用户

```bash
sudo nixos-enter
passwd root 
useradd -m -G wheel tritium
passwd tritium
```

然后重启（最好断掉虚拟机的光驱），就能看到安装好的系统了
