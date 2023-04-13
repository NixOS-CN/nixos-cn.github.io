# Nix 语言概览

该语言是为 [Nix 包管理器](https://nixos.wiki/wiki/Nix_package_manager) 设计的，用于配置 NixOS。以下是入门 Nix 语言的基础知识。

如果你使用过 json 配置文件格式，有一门函数式语言（例如 Haskell）的使用经验，或是至少一门面对对象编程语言的使用经验，那你能很快掌握
Nix 语言的使用。**倘若你不满足上面的一个或多个条件也无妨，我们也会详细阐述 Nix 语言的使用方法。**

> Nix
>
表达式语言是一门纯粹的，惰性的函数式语言。纯粹意味着语言操作没有副作用（例如传统的变量赋值）；惰性意味着函数的参数只有当函数被调用的时候才会被求值；函数式意味着函数可以被当作常规的值，从而被传递或操作。我们会在进阶篇里详细阐述这些特性，现在你只需要知晓即可。
>
> Nix 语言的主要工作是**描述打包过程**。同时 Nix 语言也是一门强类型和动态类型的语言。

## 交互模式

以下交互式教程需要使用 `nix repl` 命令调出交互命令模式：

```bash
$ nix repl
Welcome to Nix 2.5.1. Type :? for help.
```

它有点像用于调试 JavaScript 的控制台或 Python 的交互模式？

```bash
nix-repl> 1 + 2  # 输入表达式
3  # 输出结果
```

::: tip 惰性求值
Nix 语言默认是惰性求值的，这意味着它只会计算被直接依赖的值，不需要的值将不会被计算。
:::

## 即时计算被直接依赖的值

```bash
nix-repl> { a.b.c = 1; }
{ a = { ... }; }
```

在上面的例子中，我们输入了一个匿名集合，而这个匿名集合包含 `a` 集合。

::: note 匿名集合
匿名集合即没有分配名称的集合，与之对立的是命名集合，例如  `foo = { bar };`。
:::

`a` 集合中的值并没有被这个匿名集合直接依赖，自然顶级以下的集合不会被立刻求值。占位的变成了 `...` 。

::: warning 依赖关系
直接依赖则是直接赋值（值类型）或调用（函数）的关系。当一个值的求值依赖其他值的求值，我们称这个值间接依赖其他值。
:::

在下面这个例子，我们将显式声明  `lax` 的直接依赖：

```nix
let
  foo = { bar.qux = 1; };
  lax = foo.bar.qux
in
  lax  # 我们需要 lax，lax 需要 foo.bar.qux
```

我们可以输入 `:q` 启用详尽求值，所有表达式都将被立刻求值：

```bash
nix-repl> :p { a.b.c = 1; }
{ a = { b = { c = 1; }; }; }
```

::: warning
`:p` 参数只能在交互模式使用，输入 `:q`  可以退出交互模式。
:::

## 文件求值

使用 [`nix-instantiate --eval`](https://nixos.org/manual/nix/stable/command-ref/nix-instantiate.html) 对 `*.nix`
文件中存在的表达式进行求值：

```bash
$ echo 1 + 2 > file.nix  # 该命令会往 file.nix 中写入 1 + 2
$ nix-instantiate --eval file.nix  # 文件求值
3  # 输出结果
```

::: tip 详尽求值
在文件求值的情景下可以通过在命令行添加 `--strict`  参数来启用详尽求值。

```bash
$ echo "{ a.b.c = 1; }" > file.nix
$ nix-instantiate --eval --strict file.nix
{ a = { b = { c = 1; }; }; }
```

:::
::: info echo 命令
`echo` 是 Linux 中最常见的命令之一，主要作用是输出文本，追加文本，返回输出。

你可以键入 `help echo` 来获取该命令的使用帮助。
:::

## 代码风格

好的代码风格会让程序员身心愉悦，同时也增加了代码可维护性。

::: info 格式化
[Alejandra](https://github.com/kamadorueda/alejandra) 是一个新兴的 Nix 代码格式化工具，使用 Rust
编写。你可以[在线尝试](https://kamadorueda.com/alejandra/)它。
:::

## 当心空格

空格用于分隔词法标记（Lexical tokens），在一些场景是必要的，不然会无法区分关键字。

::: note

在许多中文资料中，混淆了 Lexical，Syntax 和 Grammar 三者的概念：

- Lexical（词法）：是指语言中单词的意义、形态和用法等方面的规则。词法规则定义了单词的基本形态和语法功能，例如名词、动词、形容词等。同时，它还规定了一些特殊单词的用法，例如冠词、介词、连词等。
- Syntax（句法）：是指语言中标记（Token）之间的组合方式，以及这种组合方式所遵循的规则。通俗点说，语法规定了单词应该如何排列、组合成句子，以及这些句子之间的联系方式。
- Grammar（语法）：是指语言中的规则体系，包括了语法规则、语义规则和语用规则等。它涉及到语言的整个结构和组成方式，而不仅仅是句子的构成。

:::

下面的两种示例是等价的：

```nix
let
  x = 1;
  y = 2;
in
  x + y
```

显然，下面的可读性比上面的差很多：

```nix
let x=1;y=2;in x+y
```

## 名称和值

原始数据类型，列表，属性集与函数都可以被当作值。

我们可以使用 `=`  为名称赋值，然后用分号分隔赋值语句：

```nix
let
  foo = "I am a fool";
  bar = "I am at the bar";
in
  foo + bar
```

名称不等同常见编程语言中的变量，没有声明时的开辟内存空间，因为每个名称在计算的时候都会被＂替换＂为常量。**名称赋值后是不可变的
**。它们形成了一种绑定关系，一个值可以被多个名称绑定，一个名称只能绑定一个值。它并不类似 C 语言中的赋值，C
语言中的变量赋值是修改变量引用的内存数据来赋值的。反而更像是常量和常量表达式，编译期就能确定值。

## 属性集

::: tip 集合

还记得我们在上面提到的集合吗？其实它真正的名字是属性集，没有过早引入属性集的概念是为了方便读者渐进式地理解。

:::

属性集就是装载若干对名称与值的集合，**集合内的名称被称为这个集合的属性，集合内中由名称和值组成的对则被称为该属性的元素**
。示例如下：

```nix
{
  string = "hello";
  integer = 1;
  float = 3.141;
  bool = true;
  null = null;
  list = [ 1 "two" false ];
  attribute-set = {
    a = "hello";
    b = 2;
    c = 2.718;
    d = false;
  };  # 标准 json 不支持注释
}
```

::: info json 样式
你可能觉得莫名的像 json，下面是 json 的示例：

```json
{
  "string": "hello",
  "integer": 1,
  "float": 3.141,
  "bool": true,
  "null": null,
  "list": [
    1,
    "two",
    false
  ],
  "object": {
    "a": "hello",
    "b": 1,
    "c": 2.718,
    "d": false
  }
}
```

:::

注意到了吗？

- 属性不需要添加引号
- 列表是用空格分隔的

## 递归属性集

当属性集内的属性需要访问该集合的另一个属性时，应当使用递归属性集：

```nix
rec {
  one = 1;
  two = one + 1;  # 直接依赖于 one
  three = two + 1; # 直接依赖于 two，间接依赖于 one
}
```

输出如下：

```nix
{ one = 1; three = 3; two = 2; }
```

::: note
元素的声明顺序并不决定元素在属性集中的排布顺序，属性集中的元素排布顺序是由求值顺序决定的，优先被求值的被放在了前面。
:::

## `let` 表达式 / `let` 绑定

一个完整的`let` 表达式有两个部分： `let` 和 `in`。在 `let` 与 `in`
之间的语句中，你可以声明需要被复用的名称，并将其与值绑定。它们可以在 `in` 之后的表达式中发挥作用：

```nix
let
  b = a + 1;
  a = 1;
in
  a + b
```

引用到 `a` 的地方有两处，它们都会将 `a` ＂替换＂成值来计算或赋值，类似于常量。

::: tip
你不需要关心名称的声明顺序，不会出现名称未定义的情况。
:::

**`in` 后面只能跟随一个表达式，并且 `let` 绑定的名称在该表达式是有效的的**，这里演示一个列表：

```nix
let
  b = a + 1;
  c = a + b;
  a = 1;
in
  [ a b c ]
```

输出的值为：

```nix
[ 1 2 3 ]
```

::: danger 作用域
**`let` 绑定是有作用域的，绑定的名称只能在作用域使用，或者说每个 `let` 绑定的名称只能在该表达式内使用：**

```nix
{
  a = let x = 1; in x;
  b = x;
}
```

`x` 未定义：

```bash
error: undefined variable 'x'

       at «string»:3:7:

            2|   a = let x = 1; in x;
            3|   b = x;
             |       ^
            4| }
```

:::

## 属性访问

使用 `.` 访问属性：

```nix
let
  attrset = { x = 1; };
in
  attrset.x
```

访问嵌套的属性也是同样的方式：

```nix
let
  attrset = { a = { b = { c = 1; }; }; };
in
  attrset.a.b.c
```

当然，就像如何访问属性一样，也可以用 `.` 直接赋值它：

```nix
let
  a.b.c = 1;
in
  a.b.c
```

## `with` 表达式

`with` 表达式可以让你少写几次属性集的名称，是个语法糖：

```nix
let
  a = {
    x = 1;
    y = 2;
    z = 3;
  };
in
  with a; [ x y z ]  # 等价 [ a.x a.y a.z ]
```

作用域被限制到了分号后面的第一个表达式内：

```nix
let
  a = {
    x = 1;
    y = 2;
    z = 3;
  };
in
  {
    b = with a; [ x y z ];
    c = x;  # a.x
  }
```

`x` 未定义：

```bash
error: undefined variable 'x'

       at «string»:10:7:

            9|   b = with a; [ x y z ];
           10|   c = x;
             |       ^
           11| }
```

## `inherit` 表达式

`inhherit` 本意就是继承，我们可以使用它完成一对命名相同的名称和属性之间的赋值：

```nix
let
  x = 1;
  y = 2;
in
  {
    inherit x y;
  }
```

没有这个语法糖，我们可能得这样写：

```nix
let
  x = 1;
  y = 2;
in
  {
    x = x;
    y = y;
  }
```

加上括号，就直接从属性集继承名称：

```nix
let
  a = { x = 1; y = 2; };
in
  {
    inherit (a) x y;
  }
```

`inhert` 同样可以在 `let` 表达式中使用：

```nix
let
  inherit ({ x = 1; y = 2; }) x y;
in 
  [ x y ]
```

等价于：

```nix
let
  x = { x = 1; y = 2; }.x;
  y = { x = 1; y = 2; }.y;
in
  [ x y ]
```

我们变相的将特定属性带到了全局作用域，实现了更方便的解构出名称的方法。

## 字符串插值

各大流行语言均已支持，使用 `"${ ... }"` 可以插入名称的值：

```nix
let
  name = "Nix";
in
  "hello ${name}"
```

输出为：

```nix
"hello Nix"
```

**字符串插值语法只支持字符串类型**，所以引入的名称的值必须是字符串，或是可以转换为字符串的类型：

```nix
let
  x = 1;
in
  "${x} + ${x} = ${x + x}"
```

因为是数字类型，所以报错：

```bash
error: cannot coerce an integer to a string

       at «string»:4:2:

            3| in
            4| "${x} + ${x} = ${x + x}"
             |  ^
            5|
```

字符串插值是可以被嵌套的：

```nix
let
  a = "no";
in
  "${a + " ${a + " ${a}"}"}"
```

输出为：

```nix
"no no no"
```

## 路径类型

路径在 Nix 语言中不是字符串类型，而是一种独立的类型，以下是一些路径的示例：

```bash
./relative  # 当前文件夹下 relative 文件（夹）的相对路径
/current/directory/absolute  # 绝对路径，从根目录开始指定
../  # 当前目录的上级目录
../../  # 当前目录的上级的上级目录
./  # 当前目录
```

## 检索路径

又名＂尖括号语法＂。

检索路径是通过系统变量来获取路径的语法，由一对尖括号组成：

```nix
<nixpkgs>
```

这个时候 `<nixpkgs>`
实际上一依赖了系统变量中一个名为 [`$NIX_PATH`](https://nixos.org/manual/nix/unstable/command-ref/env-common.html?highlight=nix_path#env-NIX_PATH)
的路径值：

```nix
/nix/var/nix/profiles/per-user/root/channels/nixpkgs
```

我们建议你**避免**使用检索路径来指定其它相对路径，比如下面的例子：

```nix
<nixpkgs/lib>
```

**这是一种亵渎**，因为这样指定相对路径会让配置与环境产生联系。我们的配置文件应该尽量保留纯函数式的特性，即输出只与输入有关，函数不应该与外界产生任何联系。

## 多行字符串

注意，这里不是一对双引号，而是两对单引号：

```nix
''
multi
line
string
''

''
  one
   two
    three
''
```

分别等价于：

```nix
"multi\nline\nstring"

"one\n two\n  three\n"
```

## 函数

函数在 Nix 语言中是人上人，我们先来声明一个匿名函数（Lambda）：

```nix
x: x + 1
```

引号左边是函数参数，引号右边跟随一个空格，随即是函数体。

这是个嵌套的函数，支持多重参数（柯里化函数）：

```nix
x: y: x + y
```

参数当然可以是属性集类型：

```nix
{ a, b }: a + b
```

为函数指定默认参数，在缺省该参数赋值的情况下，它就是默认值：

```nix
{ a, b ? 0 }: a + b
```

允许传入额外的属性：

```nix
{ a, b, ...}: a + b  # 明确传入的属性有 a 和 b，传入额外的属性将被忽略
{ a, b, ...}: a + b + c # 即使传入的属性有 c，一样不会参与计算，这里会报错
```

为额外的参数命名参数集，然后调用：

```nix
args@{ a, b, ... }: a + b + args.c
{ a, b, ... }@args: a + b + args.c  # 也可以是这样
```

为函数命名：

```nix
let
  f = x: x + 1;
in
  f
```

调用函数，并使用函数构建新属性集：

```nix
concat = { a, b }: a + b  # 等价于 concat = x: x.a + x.b
concat { a = "Hello"; b = "NixOS"; }
```

输出：

```nix
Hello NixOS
```

由于函数与参数使用空格分隔，所以我们可以使用括号将函数体与参数分开：

```nix
(x: x + 1) 1  # 向该 Lambda 函数传入参数 1
```

## 柯里化函数

我们将 `f (a,b,c)` 转换为 `f (a)(b)(c)`
的过程就是柯里化。为什么需要柯里化？因为它很灵活，可以避免重复传入参数，当你传入第一个参数的时候，该函数就已经具有了第一个参数的状态。说起状态我们就要引入闭包的概念，闭包就是带状态的函数。在离散数学中，闭包也是使某种关系具有某种性质的一种运算。

尝试声明一个柯里化函数：

```nix
x: y: x + y
```

为了更好的可读性，我们推荐你这样写：

```nix
x: (y: x + y)
```

这个例子中的柯里化函数，虽然接收两个参数，但不是＂迫切＂需要：

```nix
let
  f = x: y: x + y;
in
  f 1
```

输出为：

```nix
<LAMBDA>
```

`f 1` 的值依然是函数，这个函数大概是：

```nix
y: 1 + y;
```

我们可以保存这个状态的函数，稍后再来使用：

```nix
let
  f = x: y: x + y;
in
  let g = f 1; in g 2
```

也可以一次性赋值：

```nix
let
  f = x: y: x + y;
in
  f 1 2
```

## 属性集参数

更为人知的名字是＂关键字参数＂或＂解构＂。当我们被要求必须传入多个参数时，使用这种函数声明方法：

```nix
{a, b}: a + b
```

调用该函数：

```nix
let
  f = {a, b}: a + b;
in
  f { a = 1; b = 2; }
```

如果我们额外传入参数，会怎么样？

```nix
let
  f = {a, b}: a + b;
in
  f { a = 1; b = 2; c = 3; }
```

意外参数 `c`：

```bash
error: 'f' at (string):2:7 called with unexpected argument 'c'

       at «string»:4:1:

            3| in
            4| f { a = 1; b = 2; c = 3; }
             | ^
            5|
```

## 默认参数

前面稍微提到过一点，没有什么需要过多讲解的地方：

```nix
let
  f = {a, b ? 0}: a + b;
in
  f { a = 1; }
```

赋值是可选的，根据你的需要来：

```nix
let
  f = {a, b ? 0}: a + b;
in
  f { a = 1; b = 2; }
```

## 额外参数

有的时候，我们设计的函数不得不接收一些我们不需要的额外参数，我们可以使用 `...` 允许接收额外参数：

```nix
{a, b, ...}: a + b
```

不比上个例子，这次不会报错：

```nix
let
  f = {a, b, ...}: a + b;
in
  f { a = 1; b = 2; c = 3; }
```

## 命名参数集

又名 ＂`@` 模式＂。在上文中，我们已经可以接收到额外的参数了，假如我们需要使用某个额外参数，我们可以使用命名属性集将其接收到一个另外的集合：

```nix
{a, b, ...}@args: a + b + args.c  # 这样声明函数
args@{a, b, ...}: a + b + args.c  # 或是这样
```

具体示例如下：

```nix
let
  f = {a, b, ...}@args: a + b + args.c;
in
  f { a = 1; b = 2; c = 3; }
```

## 函数库

除了一些 [内建操作符](https://nixos.org/manual/nix/stable/language/operators.html) （`+`, `==`, `&&`, 等）,
我们还要学习一些被视为事实标准的库。

### 内建方法

它们在 Nix 语言中并不是 `<LAMBDA>` 类型，而是 `<PRIMOP>`  元操作类型（primitive
operations）。我们尽量不提供新的自造词，所以将标题译作内建方法，实际使用和面对对象编程中的＂转换类＂相差无几，只不过这些方法是内置在
Nix 解释器中，由 C++ 实现。查询 [内建方法](https://nixos.org/manual/nix/stable/language/builtins.html) 以了解其使用方法。

```nix
builtins.toString()  # 通过 builtins 使用方法
```

### 导入

```nix
import ./file.nix
```

`import` 会根据后面跟随的路径值导入该 `nix` 文件，读取该文件的返回值。

```bash
$ echo 1 + 2 > file.nix
import ./file.nix
3
```

也可以导入函数：

```bash
$ echo "x: x + 1" > file.nix
import ./file.nix 1
2
```

### 软件包仓库

在之前，我们已经学习了检索路径，现在让我们来应用它。检索路径 `<nixpkgs>` 映射了一个路径值，接下来我们导入这个路径中的 `nix`
文件：

```nix
import <nixpkgs>
```

你知道你刚刚导入了什么吗？你导入了超级无敌威武举世无双开天辟地的 nix 软件包仓库（`nixpkgs`），其中有个非常重要的属性集 `lib`
，其中提供了大量的有用的函数

导入就够了吗？我们需要使用它返回的值，所以声明一个命名保存它：

```nix
let
  pkgs = import <nixpkgs>;
in
  pkgs.lib
```

你好奇这个 `<nixpkgs>.nix`  文件到底返回的是什么类型吗？返回的是 `<LAMBDA>`
。这意味着我们需要传入参数使该函数返回一些东西。然后我们传入空参数 `{}` 使函数返回结果。

```nix
let
  pkgs = import <nixpkgs> {};
in
  pkgs.lib.strings.toUpper "search paths considered harmful"
```

上后面的例子中，我们调用了一个转换大写字母的函数。

::: tip pkgs 参数

但在实际配置中，我们会见到 `pkgs` 作为参数传入函数：

```nix
{ pkgs, ... }:
pkgs.lib.strings.removePrefix "no " "no true scotsman"
```

为了产生我们料想的结果，我们需要通过 shell 向文件传传递 `pkgs` 参数（在配置系统的时候包管理器会自动帮我们完成）：

```bash
$ nix-instantiate --eval test.nix --arg pkgs 'import <nixpkgs> {}'
"true scotsman"
```

还有直接传入 `lib` 的例子：

```nix
{ lib, ... }:
let
  to-be = true;
in
  lib.trivial.or to-be (! to-be)
```

```bash
$ nix-instantiate --eval file.nix --arg lib '(import <nixpkgs> {}).lib'
true
```

其实 NixOS 的配置文件就像一个＂函数＂，包管理器往里面输入参数，你书写的＂函数＂决定了输出，然后包管理器按照＂函数＂输出来部署系统。

:::

::: note

因为某些历史渊源， `pkgs.lib` 和  [`builtins`](https://nixos.org/guides/nix-language.html#builtins) 中的某些函数是等价的。

:::

## 污染

在开篇的时候我们就介绍了纯粹在 Nix 语言的概念，现在我们来介绍与之对立的＂污染＂。在你实际使用 Nix
语言的时候，仍然避免不了一些被＂污染＂（与环境产生依赖）的情况。

如果有唯一的因素能影响 Nix 代码的纯粹性，那就是从文件系统输入配置文件。我们不可能预知文件内容，所以我们就不可避免地读入文件系统，对文件进行求值，从而对文件系统产生了依赖。

所以我们应当显式的使用路径值和专用函数。

### 路径

每当你使用一个路径值用于字符串插值，就会触发一个副作用——路径指向的文件将被复制到一个叫 Nix store 的特殊位置。然后这个被插入的路径变成了文件副本在
Nix store 中的路径：

```bash
$ echo 123 > data
"${./data}"
"/nix/store/h1qj5h5n05b5dl5q4nldrqq8mdg7dhqk-data"
```

::: tip

Nix store 中的文件都是用哈希（Hash）进行索引的：

```bash
/nix/store/<hash>-<name>
```

:::

### 外部抓取

构建输入的文件并不一定要来自文件系统，也可以从网络抓取。

以下是 Nix 语言提供的一些内建的不纯粹的函数，可以从网络上抓取配置协助求值：

- [builtins.fetchurl](https://nixos.org/manual/nix/stable/language/builtins.html#builtins-fetchurl)
- [builtins.fetchTarball](https://nixos.org/manual/nix/stable/language/builtins.html#builtins-fetchTarball)
- [builtins.fetchGit](https://nixos.org/manual/nix/stable/language/builtins.html#builtins-fetchGit)
- [builtins.fetchClosure](https://nixos.org/manual/nix/stable/language/builtins.html#builtins-fetchClosure)

我们通过 URL 抓取参与求值的文件，在求值的时候它们会缓存到本地文件系统：

```nix
builtins.fetchurl "https://github.com/NixOS/nix/archive/7c3ab5751568a0bc63430b33a5169c5e4784a0ff.tar.gz"
```

然后被链接到 Nix store 里面：

```bash
"/nix/store/7dhgs330clj36384akg86140fqkgh8zf-7c3ab5751568a0bc63430b33a5169c5e4784a0ff.tar.gz"
```

如果你想让你抓取到的档案完成自动解压，可以使用这个内建方法：

```nix
builtins.fetchTarball "https://github.com/NixOS/nix/archive/7c3ab5751568a0bc63430b33a5169c5e4784a0ff.tar.gz"
```

如果网络异常，则会报错。更多细节，请参阅 [Fetchers](https://nixos.org/manual/nixpkgs/stable/#chap-pkgs-fetchers)

## 衍生

衍生（Derivations）是指一种描述如何构建软件包或构建过程的元数据格式，或者我们也可以称一次构建任务就是一次衍生。在 Nix
中，软件包的衍生通常是由一个 Nix
表达式描述的，这个表达式定义了如何从源代码构建软件包，包括依赖项、构建脚本和其他构建过程中需要的信息。衍生可以被视为一种构建规范，描述了如何构建软件包以及软件包依赖的其他软件包的版本和构建方式。Nix
使用这些衍生来构建可重复、可预测和隔离的软件包环境，这些环境中的软件包与主机系统和其他软件包环境是隔离的。

为什么叫衍生？因为分发到用户端的包你可以添加额外的编译参数，为其打上额外的补丁，修改一部分功能。总之，它已经不是原本的形状了，所以我们称之为衍生的包。

每次衍生（构建任务），都会产生构建结果，构建结果可以为其他构建任务所用。

Nix 原本提供的声明衍生的方法是使用内建方法 `builtins.derivation`
。但是我们通常使用的都是一个被包装的方法 `stdenv.mkDerivation` 。

下面是一个示例：

```nix
{ lib, stdenv }:

stdenv.mkDerivation rec {
  pname = "hello";
  version = "2.12";
  src = builtins.fetchTarball {
    url = "mirror://gnu/${pname}/${pname}-${version}.tar.gz";
    sha256 = "1ayhp9v4m4rdhjmnl2bq3cibrbqqkgjbl3s7yk2nhlh8vj3ay16g";
  };
  meta = with lib; {
    license = licenses.gpl3Plus;
  };
}
```

`stdenv.mkDerivation` 接收了一个属性集，属性集里面包含了这个包的一些属性（包名，版本，构建源，元数据等）然后当我们显式依赖它时，就会被立刻求值，求值的过程就是软件包衍生（构建）的过程。

这里以 Nix 包仓库举例，我们获取包仓库中的 `nix` ，字符串插值的时候：

```nix
let
  pkgs = import <nixpkgs> {};
in
  "${pkgs.nix}"
```

插入的依然是通过哈希链接的路径：

```bash
"/nix/store/sv2srrjddrp2isghmrla8s6lazbzmikd-nix-2.11.0"
```

::: note

将 `pkgs.nix` 通过字符串插值转换为字符串是合法的， 同时对 `pkgs.nix` 求值就会产生一个衍生结果。

:::

## 示范案例

以下案例的目的不是理解代码的含义或如何工作，而是理解代码在函数、属性集和其他Nix语言数据类型方面的结构。

### Shell 环境

```nix
{ pkgs ? import <nixpkgs> {} }:
let
  message = "hello world";
in
pkgs.mkShell {
  buildInputs = with pkgs; [ cowsay ];
  shellHook = ''
    cowsay ${message}
  '';
}
```

这个案例声明了一个 Shell 环境，`shellHook` 跟随的命令会在初始化时被执行。

### NixOS 配置

```nix
{ config, pkgs, ... }: {
  imports = [ ./hardware-configuration.nix ];
  environment.systemPackages = with pkgs; [ git ];
  # ...
}
```

### 打包

```nix
{ lib, stdenv }:
stdenv.mkDerivation rec {
  pname = "hello";
  version = "2.12";
  src = builtins.fetchTarball {
    url = "mirror://gnu/${pname}/${pname}-${version}.tar.gz";
    sha256 = "1ayhp9v4m4rdhjmnl2bq3cibrbqqkgjbl3s7yk2nhlh8vj3ay16g";
  };
  meta = with lib; {
    license = licenses.gpl3Plus;
  };
}
```
