# 新手一百问

## Nix 包管理器与其他包管理器的区别

| 包管理器          | 所属发行版 | 描述 |
| ----------------- | ---------- | ---- |
| `apt` / `apt-get` |            |      |
| `pacman`          |            |      |
| `dnf`             |            |      |
| `rpm`             |            |      |
| `yum`             |            |      |
| `zypper`          |            |      |
| `YaST`            |            |      |

## 何谓 nix-channel



## 什么是二进制缓存



## 如何更换镜像源



## 如何升级 NixOS 版本

NixOS 并不是 ArchLinux 那样的滚动发行版，所以需要定期更迭系统版本来获取最新的支持。

### 列出 nix-channels

```bash
sudo nix-channel --list
```

这里使用了 `sudo`，因此列出的是 root 用户所属的 nix-channels：

```bash
nixos https://nixos.org/channels/nixos-20.03
```

> 如果你是其他的版本，请不要惊慌。这里演示的是 20.03 版本。 
