# Nix 语言快速入门

<!-- prettier-ignore -->
::: tip
Nix 语言的主要工作是**描述打包过程**。同时 Nix 语言也是一门强类型和动态类型的语
言。

<!-- prettier-ignore -->
:::

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

<!-- prettier-ignore -->
::: tip 惰性求值
Nix语言的求值是惰性的，这意味着表达式不会在被绑定到变量后立即求值，而是在该值被
使用时才求值。

<!-- prettier-ignore -->
:::

## 即时计算被直接依赖的值

```bash
nix-repl> { a.b.c = 1; }
{ a = { ... }; }
```

在上面的例子中，我们输入了一个匿名集合，而这个匿名集合包含 `a` 集合。

<!-- prettier-ignore -->
::: note 匿名集合
匿名集合即没有分配名称的集合，与之对立的是命名集合，例如 `foo = { bar };`。

<!-- prettier-ignore -->
:::

`a` 集合中的值并没有被这个匿名集合直接依赖，自然顶级以下的集合不会被立刻求值。占
位的变成了 `...` 。

在下面这个例子，我们将显式声明 `qux` 的直接依赖：

```nix
let
  foo = { bar.qux = 1; };
  lax = foo.bar.qux;
in
  lax  # 我们需要 lax，lax 需要 foo.bar.qux
```

我们可以输入 `:p` 启用详尽求值，所有表达式都将被立刻求值：

```bash
nix-repl> :p { a.b.c = 1; }
{ a = { b = { c = 1; }; }; }
```

<!-- prettier-ignore -->
::: warning
`:p` 参数只能在交互模式使用，输入 `:q` 可以退出交互模式。

<!-- prettier-ignore -->
:::

## 文件求值

使用
[`nix-instantiate --eval`](https://nixos.org/manual/nix/stable/command-ref/nix-instantiate.html)
对 `*.nix` 文件中存在的表达式进行求值：

```bash
$ echo 1 + 2 > file.nix  # 该命令会往 file.nix 中写入 1 + 2
$ nix-instantiate --eval file.nix  # 文件求值
3  # 输出结果
```

<!-- prettier-ignore -->
::: tip 立即求值
在文件求值的情景下可以通过在命令行添加 `--strict` 参数来启用立即求值。

```bash
$ echo "{ a.b.c = 1; }" > file.nix
$ nix-instantiate --eval --strict file.nix
{ a = { b = { c = 1; }; }; }
```

<!-- prettier-ignore -->
:::

<!-- prettier-ignore -->
::: info echo 命令
`echo` 是 Linux 中最常见的命令之一，主要作用是输出文本，追加文本，返回输出。

你可以键入 `help echo` 来获取该命令的使用帮助。

<!-- prettier-ignore -->
:::

## 代码风格

好的代码风格会让程序员身心愉悦，同时也增加了代码可维护性。

<!-- prettier-ignore -->
::: info 格式化
[Alejandra](https://github.com/kamadorueda/alejandra) 是一个新兴的 Nix 代码格式
化工具，使用 Rust 编写。你可
以[在线尝试](https://kamadorueda.com/alejandra/)它。

<!-- prettier-ignore -->
:::

## 当心空格

空格用于分隔词法标记（Lexical tokens），在一些场景是必要的，不然会无法区分关键
字。

<!-- prettier-ignore -->
::: note

在许多中文资料中，混淆了 Lexical，Syntax 和 Grammar 三者的概念：

- Lexical（词法）：是指语言中单词的意义、形态和用法等方面的规则。词法规则定义了
  单词的基本形态和语法功能，例如名词、动词、形容词等。同时，它还规定了一些特殊单
  词的用法，例如冠词、介词、连词等。
- Syntax（句法）：是指语言中标记（Token）之间的组合方式，以及这种组合方式所遵循
  的规则。通俗点说，语法规定了单词应该如何排列、组合成句子，以及这些句子之间的联
  系方式。
- Grammar（语法）：是指语言中的规则体系，包括了语法规则、语义规则和语用规则等。
  它涉及到语言的整个结构和组成方式，而不仅仅是句子的构成。

<!-- prettier-ignore -->
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

原始数据类型，列表，属性集与函数都可以被当作值。我们可以使用 `=` 为名称绑定值，
然后用分号分隔赋值语句：

```nix
let
  foo = "I am a fool";
  bar = "I am at the bar";
in
  foo + bar
```

名称不等同常见编程语言中的变量，因为它一旦定义就无法修改。在概念上，它们更多地是
形成了一种绑定关系，一个值可以被多个名称绑定，一个名称只能绑定一个值。这种赋值没
有副作用（传统的赋值会改变变量的状态，Nix 语言中的变量一旦赋值无法改变）。

## 属性集

<!-- prettier-ignore -->
::: tip 集合

还记得我们在上面提到的集合吗？其实它真正的名字是属性集，没有过早引入属性集的概念
是为了方便读者渐进式地理解。

<!-- prettier-ignore -->
:::

属性集就是装载若干对名称与值的集合，**集合内的名称被称为这个集合的属性，集合内中
由名称和值组成的对则被称为该属性的元素**。示例如下：

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

<!-- prettier-ignore -->
::: info json 样式
你可能觉得莫名的像 json，下面是 json 的示例：

```json
{
  "string": "hello",
  "integer": 1,
  "float": 3.141,
  "bool": true,
  "null": null,
  "list": [1, "two", false],
  "object": {
    "a": "hello",
    "b": 1,
    "c": 2.718,
    "d": false
  }
}
```

<!-- prettier-ignore -->
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

<!-- prettier-ignore -->
::: note
元素的声明顺序并不决定元素在属性集中的排布顺序，属性集中的元素排布顺序是由求值顺
序决定的，优先被求值的被放在了前面。

<!-- prettier-ignore -->
:::

## `let` 绑定

一个完整的 `let` 绑定有两个部分： `let` 绑定名称与值， `in` 使用名称。在 `let`
与 `in` 之间的语句中，你可以声明需要被复用的名称，并将其与值绑定。它们可以在
`in` 之后的表达式中发挥作用：

```nix
let
  b = a + 1;
  a = 1;
in
  a + b
```

引用到 `a` 的地方有两处，它们都会将 `a` ＂替换＂成值来计算或赋值，类似于常量。

<!-- prettier-ignore -->
::: tip
你不需要关心名称的声明顺序，不会出现名称未定义的情况。

<!-- prettier-ignore -->
:::

**`in` 后面只能跟随一个表达式，并且 `let` 绑定的名称只在该表达式是有效的的**，这
里演示一个列表：

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

<!-- prettier-ignore -->
::: danger 作用域
**`let` 绑定是有作用域的，绑定的名称只能在作用域使用，或者说每个 `let` 绑定的名
称只能在该表达式内使用：**

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

<!-- prettier-ignore -->
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

`inherit` 本意就是继承，我们可以使用它完成一对命名相同的名称和属性之间的赋值：

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

`inherit` 同样可以在 `let` 表达式中使用：

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

**字符串插值语法只支持字符串类型**，所以引入的名称的值必须是字符串，或是可以转换
为字符串的类型：

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

这个时候 `<nixpkgs>` 实际上一依赖了系统变量中一个名为
[`$NIX_PATH`](https://nixos.org/manual/nix/unstable/command-ref/env-common.html?highlight=nix_path#env-NIX_PATH)
的路径值：

```nix
/nix/var/nix/profiles/per-user/root/channels/nixpkgs
```

我们建议你**避免**使用检索路径来指定其它相对路径，比如下面的例子：

```nix
<nixpkgs/lib>
```

**这是一种污染**，因为这样指定相对路径会让配置与环境产生联系。我们的配置文件应该
尽量保留纯函数式的特性，即输出只与输入有关，纯函数不应该与外界产生任何联系。

## 多行字符串

Nix 中被两对单引号 `''` 引用的内容即为多行字符串。

```nix
''
multi
line
string
''
```

等价于：

```nix
"multi\nline\nstring"
```

Nix 的多行字符串存在特殊行为，其一是，Nix 会智能地去除掉开头的缩进，这在其他语言
中是不常见的。

举个例子：

```nix
''
  one
   two
    three
''
```

等价于：

```nix
"one\n two\n  three\n"
```

## 字符串中的字符转义 {#multi-line-string-escape}

在单行字符串中，Nix 的转义语法与许多其他语言相同，`"` `\` `${` 以及其他 `\n`
`\t` 等特殊字符，都可直接使用 `\` 进行转义，比如：

```nix
"this is a \"string\" \\"  # 结果是: this is a "string" \
```

但在多行字符串中，情况会有点特殊。Nix 规定在多行字符串中需要使用两个单引号 `''`
来转义。

比如如下 Nix 代码会输出原始字符 `${a}`，而不是做字符串插值：

```nix
let
  a = "1";
in
''the value of a is:
  ''${a}
''  # 结果是 "the value of a is ${a}"
```

其他 `\n` `\t` 等特殊字符的转义也类似，必须使用两个单引号来转义，如

```nix
''
  this is a
  multi-line
  string
  ''\n
''
```

但如果我们希望在字符串中使用原始字符 `''`，因为会与多行字符串原有的语义冲突，不
能直接写 `''`，而必须改用 `'''` 三个单引号。也就是说，在多行字符串中的 `'''` 三
个单引号这样的组合，实际输出的是原始字符串 `''`.

举个例子：

```nix
let
  a = "1";
in
''the value of a is:
  '''${a}'''
''  # 结果是 "the value of a is ''1''"
```

## 函数

函数在 Nix 语言中是人上人，我们先来声明一个匿名函数（Lambda）：

```nix
x: x + 1
```

冒号左边是函数参数，冒号右边跟随一个空格，随即是函数体。

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
{ a, b, ...}: a + b + c  # 即使传入的属性有 c，一样不会参与计算，这里会报错
```

为额外的参数绑定到参数集，然后调用：

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
concat { a = "Hello "; b = "NixOS"; }
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

我们将 `f (a,b,c)` 转换为 `f (a)(b)(c)` 的过程就是柯里化。为什么需要柯里化？因为
它很灵活，可以避免重复传入参数，当你传入第一个参数的时候，该函数就已经具有了第一
个参数的状态（闭包）。

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

当我们被要求必须传入多个参数时，使用这种函数声明方法：

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

## 可变参数

有的时候，我们设计的函数不得不接收一些我们不需要的额外参数，我们可以使用 `...`
允许接收可变数量的参数：

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

又名 ＂`@` 模式＂。在上文中，我们已经可以接收到额外的参数了，假如我们需要使用某
个额外参数，我们可以使用命名属性集将其接收到一个另外的集合：

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

除了一些
[内建操作符](https://nixos.org/manual/nix/stable/language/operators.html) （`+`,
`==`, `&&`, 等）,我们还要学习一些被视为事实标准的库。

### 内建函数

它们在 Nix 语言中并不是 `<LAMBDA>` 类型，而是 `<PRIMOP>` 元操作类型（primitive
operations）。这些函数是内置在 Nix 解释器中，由 C++ 实现。查询
[内建函数](https://nixos.org/manual/nix/stable/language/builtins.html) 以了解其
使用方法。

```nix
builtins.toString()  # 通过 builtins 使用函数
```

### 导入

`import` 表达式以其他 Nix 文件的路径为参数，返回该 Nix 文件的求值结果。

`import` 的参数如果为文件夹路径，那么会返回该文件夹下的 `default.nix` 文件的执行
结果。

如下示例中，`import` 会导入 `./file.nix` 文件，并返回该文件的求值结果：

```bash
$ echo 1 + 2 > file.nix
import ./file.nix
3
```

被导入的 Nix 文件可以返回任何内容，返回值可以向上面的例子一样是数值，也可以是属
性集（attribute set）、函数、列表，等等。

如下示例导入了 `file.nix` 文件中定义的一个函数，并使用参数调用了该函数：

```bash
$ echo "x: x + 1" > file.nix
import ./file.nix 1
2
```
