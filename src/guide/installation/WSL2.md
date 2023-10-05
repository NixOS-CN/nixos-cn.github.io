# WSL2 安装

## 启用 WSL 2 环境

## 快捷启用

对于新系统（Windows 11，Windows 10 的 2004 版本或更新的系统），使用==管理员权限==下的 CMD 或 Powershell 执行下面的命令即可：

```powershell
wsl --install --no-distribution
```

这条命令会帮助你安装 WSL2 环境的依赖，相比逐个去启用组件是更简单快捷。

## 手动启用

与上面不同的是，这种方法可能适合稍旧一些系统。

我们需要启用两个可选功能，他们分别是 “适用于 Linux 的 Windows 子系统” 和 “虚拟机平台”：

```powershell
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

然后重新启动计算机。

我们还需要一个完整的 Linux 内核：[WSL 2 Linux 内核更新包](https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi)，安装它。

记得设置默认版本为 2：

```powershell
wsl --set-default-version 2
```

::: warning 尽力支持
NixOS-WSL 对 inbox 版本的 WSL（即通过 Window 可选功能启用的 WSL）是尽力支持的，如果有条件，请更新到最新 Windows 使用 Windows 商店分发（使用第一种方法安装方式）的最新 WSL 支持。
:::

## 下载根文件系统

在 [NixOS-WSL 项目的最新 Release 页](https://github.com/nix-community/NixOS-WSL/releases) 中下载  `nixos-wsl.tar.gz`。

然后决定好你要将这个文件系统导入至哪里，这里以 `E:\wslDistroStorage\NixOS` 举例，并且确认当前的工作文件夹就是你刚刚下载的根文件系统档案所在的文件夹。

```powershell
wsl --import NixOS E:\wslDistroStorage\NixOS nixos-wsl.tar.gz --version 2
```

然后引导到 NixOS：

```powershell
wsl -d NixOS
```

::: tip 默认发行版
可以通过 `wsl -s NixOS` 将 NixOS 设置为默认启动的发行版。
:::

第一次启用会稍久，但是你不够幸运的话，可能终端上会出现令人厌烦的错误码，你可以在 [疑难解答](https://learn.microsoft.com/zh-cn/windows/wsl/troubleshooting) 页面找到找到你可能期待的答案。
