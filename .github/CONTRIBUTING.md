
# 贡献指南

> _一个真正的社区，只有在成员之间进行有意义互动，加深彼此了解并促进学习的情况下才能存在_

如果你想帮助完善这份文档，或者有些有趣的想法想加到这份文档中，或者发现了一些错误 - 请 fork 这个项目，添加你的修改，然后提交 Pull Request 到 main 分支。

## 使用 GitHub 的 issues 报告错误

[GitHub issues](https://github.com/NixOS-CN/nixos-cn.github.io/issues)
是报告错误、特性请求和提交 Pull Request 的首选渠道！

但是请遵守以下限制：

- 请**不要**使用 issues 来请求帮助解决某问题，此类需求请移步 NixOS-CN 的 Telegram 或 Matrix 群组。
- 请**不要**偏离或捣乱问题。保持讨论的主题性，并尊重他人的意见。

## 许可证

本网站或项目内容采用 [Creative Commons Attribution Share Alike 4.0 International](LICENSES/CC-BY-SA-4.0.txt)
许可，样例代码则采用 [MIT](LICENSES/MIT.txt) 开源许可证。

贡献此项目即表明，您同意您贡献的内容将受到上述许可证的约束。

## Pull Request

创建 Pull Request 时，请遵守以下规则：

- 基于最新的 main 分支编写代码，以避免内容冲突
- 可能会有代码审查，以帮助完善您的 PR
- 请在 PR 中解释清楚现存问题，以及此 PR 如何解决这些问题


## 开发环境设置

您需要安装 [nix](https://github.com/NixOS/nix) 并启用 flakes 实验特性。

克隆仓库后，首先进入一个已安装 pnpm、vitepress、拼写检查器和 markdown linter 的环境：

```sh
$ nix develop
$ pnpm install
```

在本地启动文档站点，并实时重新加载源代码：


```sh
$ pnpm run docs:dev
```

如果您进行了大量更改，在提交拉取请求之前，请运行以下命令以检查拼写错误和格式化文档：

> 通常，`nix develop` 会在您提交之前添加一个预提交钩子来运行以下命令。


```sh
$ typos -w
$ prettier --write .
```

执行上述命令后，访问 <http://localhost:5173> 并尝试修改源代码。您将获得实时更新。
