# Nix 语言快速入门

<!-- prettier-ignore -->
::: tip 基础要求
以下教程需要你具有一定基础，但要求也不高。只要你知道在编程领域什么是变量（variable）、赋值（assign）、字符串（string）、函数（function）及参数（argument），那么你的知识水平应该就足够了。

<!-- prettier-ignore -->
:::

Nix 作为语言，是一门简单的函数式语言，它被专门设计并用于 Nix 包管理器及相关生态（NixOS、Nix Flakes、Home-Manager 等）。

## 实践准备
在学习 Nix 语言时，虽然不是必须，但若动手实践，效率往往会高得多。

以下给出两种实践方法。

<!-- prettier-ignore -->
::: tip
注意，本节需要你已经安装了 `nix` 或正在使用 NixOS，否则可以跳过这一节。

另外，本教程中不是所有代码都能直接原样运行，运行之前请理解它们的原理，以相应调整语法。

<!-- prettier-ignore -->
:::

### 交互模式
你可以通过在命令行运行
```bash
nix repl
```
进入交互模式，其界面类似下面的样子：
```plain
Welcome to Nix 2.5.1. Type :? for help.
nix-repl>
```
此时输入表达式，例如
```nix
1 + 2
```
回车，得到输出结果如下：
```plain
3
```

<!-- prettier-ignore -->
::: tip
输入 `:q` 可以退出交互模式。

<!-- prettier-ignore -->
:::

### 文件求值
交互模式简单快捷，但我们平时使用 Nix 语言进行编辑配置、打包等操作时，大多数情况下不会直接使用交互模式，而是对 `*.nix` 纯文本文件进行编辑。

因此，如果你习惯于使用编辑器，这里更推荐利用文件求值进行实践。

例如，新建文件 `foo.nix`，将其内容编辑如下：
```nix
1 + 2
```
保存后，在命令行运行
```bash
nix-instantiate --eval foo.nix
```
结果如下：
```plain
3
```

好了，下面正式介绍 Nix 语法。

## 名称和值

我们可以使用 `=` 为名称绑定值，形成赋值语句。例如将名称 `foo` 赋值为 `123`：

```nix
foo = 123
```

<!-- prettier-ignore -->
::: info 名称与变量的区别
名称不等同常见编程语言中的变量。
传统的赋值会改变变量的状态，而 Nix 语言中的名称一旦赋值（定义）就无法改变。

<!-- prettier-ignore -->
:::

名称的值并不仅限于 `123` 这种整数。具体来说有以下类型（不需要完全理解，留下印象即可）
- 字符串（string），例如 `"Hello world"`
- 整数（integer），例如 `1`
- 浮点数（float），例如 `3.141`
- 布尔（bool），只有 `true` 与 `false` 两种
- null，只有 `null` 一种
- 列表（list），例如 `[ 1 "tux" false ]`
- 属性集（attribute-set），例如 `{ a = 1; b = "tux"; c = false; }`

## 属性集
在 Nix 语法中，属性集（简称集合）是最常见的数据类型之一，基本示例如下：
```nix
foo = {
  a = 1;
  b = 2;
};
```

<!-- prettier-ignore -->
::: info 概念说明
属性集就是装载若干对**名称与值**的集合。
- 集合内的名称被称为这个集合的**属性**；
- 集合内由名称和值组成的对被称为该属性的**元素**。

<!-- prettier-ignore -->
:::

<!-- prettier-ignore -->
::: info 换行与缩进
对于 Nix 语言，大多数情况下，换行与缩进只是为了更好的可读性。（注意，换行一般相当于添加空格，请不要在本不应存在空格的地方胡乱断行。）

例如，上述代码与下面的代码在本质上并没有区别：
```nix
foo = { a = 1; b = 2; };
```

<!-- prettier-ignore -->
:::

上述代码将 `foo` 的值定义为集合 `{ a = 1; b = 2; }` ，因此可称之为集合 `foo` 。
集合 `foo` 中有两个属性（attribute）：
`a`（值为 1）和 `b`（值为 2）。

除了 `1` `2` 这样的数值外，属性的值也可以是一个集合（也即支持嵌套），例如将 `b` 的值改为集合 `{ c = 2; d = 3; }`：
```nix
foo = {
  a = 1;
  b = {
    c = 2;
    d = 3;
  };
};
```

也可以利用 `.` 表示嵌套集合中的属性，例如上面这段的一种等价写法如下：
```nix
foo.a = 1;
foo.b.c = 2;
foo.b.d = 3;
```

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

## 额外参数

有的时候，我们设计的函数不得不接收一些我们不需要的额外参数，我们可以使用 `...`
允许接收额外参数：

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
