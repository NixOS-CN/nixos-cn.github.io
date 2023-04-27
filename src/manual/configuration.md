---
shortTitle: 配置
icon: modules
---

# 配置

## 包管理

这一节我们会讨论如何为你的系统添加额外的包。NixOS 包管理的方式有两种：

- 配置文件声明。你可以在配置文件为系统或用户声明需要安装的包，每次你重新生成系统，NixOS 都会确保本地包含了你指定的这些包。

- 即抛环境。你可以创建一个临时环境，运行或安装你需要的软件。当你退出这个环境后，环境会被销毁，一切都是你创建环境前的样子，保证了系统的纯净。

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

你可以使用以下命令获取当前可用的包列表：

```nix
$ nix-env -qaP '*' --description
nixos.firefox   firefox-23.0   Mozilla Firefox - the browser, reloaded
...
```

通常会输出很多行可以获取的包的信息。第一列输出是属性名（例如`nixos.firefox`）。

::: note 前缀
`nixos` 前缀表明当前包是从 `nixos` 频道获取的。
:::

如果你想卸载这个包，修改配置后重新生成系统即可。

## 用户管理

## 文件系统

## 显示服务

### X11

### Wayland

## GPU 加速

## 桌面环境

### XFCE

### GNOME

### KDE
