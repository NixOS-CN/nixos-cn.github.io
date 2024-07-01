# Nix 语言进阶手册

## 数据类型

### 原始数据类型

#### 字符串

有三种方式定义字符串。

##### 单行字符串

与大多数编程语言的字符串一致，使用双引号闭合：

```nix
"Hello, nix!\n"
```

##### 多行字符串

多行字符串是通过==两个单引号==闭合的。

```nix
''
This is the first line.
This is the second line.
This is the third line.
''
```

多行字符串往往会带有不同程度的缩进，会被进一步处理。也就是说对于以下字符串：

```nix
''
  This is the first line.
  This is the second line.
    This is the third line.
''
```

会被“智能缩进”处理，处理后的结果是：

```nix
''
This is the first line.
This is the second line.
  This is the third line.
''
```

每一行都被前移了最小缩进数个字符。

同时，假如第一行被占空了，也会对其进行处理：

```nix
''

There's a row of spaces up there.
''
```

处理后的数据是：

```nix
''
There's a row of spaces up there.
''
```

Nix 只会将自动处理后的字符串当作输入，而不是原始字符串（raw string）。

##### URI

为了书写简便， [RFC 2396](https://www.ietf.org/rfc/rfc2396.txt) 规定了对于 URI
可以不使用引号闭合：

```nix
UriWithoutQuotes = http://example.org/foo.tar.bz2
UriWithQuotes = "http://example.org/foo.tar.bz2"
```

两者是等价的。

#### 数字

数字被分为浮点型（比如 `.114514`）与整型（比如 `2233`）。

数字是类型兼容的：纯整数运算总是返回整数，而任何涉及至少一个浮点数的运算都会返回
一个浮点数。

#### 路径

路径至少需要包含一个斜杠才能被识别为路径：

```nix
/foo/bar/bla.nix
~/foo/bar.nix
../foo/bar/qux.nix
```

除了某些尖括号路径（比如 `<nixpkgs>`）外，其他路径都支持字符串插值。

```nix
"${./foo.txt}"
```

#### 布尔

`true` 或 `false`。

#### 空

字面意思上的 `null`。

### 列表

列表使用中括号闭合，空格分隔元素，一个列表允许包含不同类型的值：

```nix
[ 123 ./foo.nix "abc" (f { x = y; }) ]
```

此处如果不给 `f { x = y; }` 打上括号，就会把函数也当作此列表的值。

### 属性集

属性集是用大括号括起来的名称与值对（称为属性）的集合。

属性名可以是标识符或字符串。标识符必须以字母或下划线开头，可以包含字母、数字、下
划线、撇号（`'`）或连接符（`-`）。

```nix
{
  x = 123;
  text = "Hello";
  y = f { bla = 456; };
}
```

我们使用 `.` 访问各个属性：

```nix
{ a = "Foo"; b = "Bar"; }.a
```

使用 `or` 关键字，可以在属性选择中提供默认值：

```nix
{ a = "Foo"; b = "Bar"; }.c or "Xyzzy"
```

因为属性 `c` 不在属性集里，故输出默认值。

也可以用字符串去访问属性：

```nix
{ "$!@#?" = 123; }."$!@#?"
```

属性名也支持字符串插值：

```nix
let bar = "foo"; in
{ foo = 123; }.${bar}
let bar = "foo"; in
{ ${bar} = 123; }.foo
```

两者的值都是 123。

在特殊情况下，如果集合声明中的属性名求值为 null（这是错误的，因为 null 不能被强
制为字符串），那么该属性将不会被添加到集合中：

```nix
{ ${if foo then "bar" else null} = true; }
```

如果 foo 的值为 `false`，则其值为 `{}`。

如果一个集合的 `__functor` 属性的值是可调用的（即它本身是一个函数或是其中一个集
合的 `__functor` 属性的值是可调用的），那么它就可以像函数一样被应用，首先传入的
是集合本身，例如：

```nix
let add = { __functor = self: x: x + self.x; };
    inc = add // { x = 1; };
in inc 1
```

求值为 2。这可用于为函数附加元数据，而调用者无需对其进行特殊处理，也可用于实现面
向对象编程等形式。

## 数据构造

### 递归属性集

### `let` 绑定

### 继承至属性

### 函数

### 条件判断

Nix 的条件判断表达式的结构类似于这样：

```nix
if <exprCond> then <exprThen> else <exprElse>
```

其中 _exprCond_ 的求值结果必须为布尔值 `true` 或 `false`. 当 _exprCond_ 求值为
`true` 时，上述条件表达式的结果为 _exprThen_ ，否则结果为 _exprElse_.

定义时的使用例子如下：

```nix
# 利用 if-then-else 表达式实现函数：
myFunction = x: if x > 0 then "Positive" else "Non-positive"
myFunction 0 # Non-positive
myFunction 1 # Positive
```

```nix
# 利用 if-then-else 表达式定义变量：
no = 7
gt0 = if no > 0 then "yes" else "no"
# gt0 变量值为 "yes"
gt0
# => "yes"
```

亦可嵌套使用

```nix
# 利用 if-then-else 表达式实现函数：
myPlan = target: if target == "fitness" then "I'm going swimming."
                else if target == "purchase" then "I'm going shopping."
                else if target == "learning" then "I'm going to read a book."
                else "I'm not going anywhere."
myPlan "fitness" # "I'm going swimming."
myPlan null # "I'm not going anywhere."

#  利用 if-then-else 表达式定义变量：
x = null
text =
  if x == "a" then
    "hello"
  else if x == "b" then
    "hi"
  else if x == "c" then
    "ciao"
  else
    "x is invalid"
```

### 循环控制

Nix 是一种函数式编程语言，每一段 Nix 程序都是一个完整的表达式。  
这与流行的 Java, Python 等命令式编程语言有很大不同，命令式编程语言的程序往往是一
段包含变量声明、赋值、跳转等指令的指令序列。

这里不展开说明函数式编程与命令式编程的区别，不了解这个的读者建议先阅读
[什么是函数式编程思维？- 知乎](https://www.zhihu.com/question/28292740) 与
[函数式编程 - WIkipedia](https://zh.wikipedia.org/wiki/%E5%87%BD%E6%95%B0%E5%BC%8F%E7%BC%96%E7%A8%8B)
理清个中关系。

一言蔽之，Nix 语言中没有 while/for 循环这类控制结构，取而代之的是以递归为基础实
现的一系列高阶函数。Nix 的标准库提供了一系列此类高阶函数用于对字符串、列表等可迭
代对象进行操作。

#### 内建函数与 `nixpkgs.lib` 函数库

Nix 语言自身提供了一些精简的内建函数，可通过 `builtins.xxx` 这种方式使用，官方文
档参见
[Built-in Functions - Nix Manual](https://nix.dev/manual/nix/2.22/language/builtins#built-in-functions).

此外，官方函数库 [nixpkgs.lib](https://github.com/NixOS/nixpkgs/lib) 提供了比
builtins 更丰富的功能。

社区提供的 [Noogle Search](https://noogle.dev/) 可以相当容易地搜索上述两类函数，
推荐一用。

下面针对 `builtins` 与 `nixpkgs.lib` 的用法各举一例：

例子如下：

```nix
# 通过 nixpkgs.lib.range，生成指定范围元素的列表
nixpkgs = import <nixpkgs> {}
alist = nixpkgs.lib.range 4 7
alist
# => [ 4 5 6 7 ]

# 通过内建函数 filter，遍历列表中的元素并过滤
builtins.filter (item: item == "hello") [ "hello" "world" ]
# => [ "hello" ]
```

具体请参考:

- [属性集相关函数](https://nixos.org/manual/nixpkgs/stable/#sec-functions-library-attrsets)
- [列表相关函数](https://nixos.org/manual/nixpkgs/stable/#sec-functions-library-lists)

#### 递归函数

如前所述，Nix 语言作为一种函数式编程语言，它采用递归取代了命令式编程语言中的循环
等控制结构。

这里举个简单的例子来说明 Nix 语言中如何实现一个递归函数：

> ⚠️注意：对新手而言，`nixpkgs.lib` 中的函数基本够用了，建议优先查找使用内建函数
> 和 `nixpkgs.lib` 中的函数，如果找不到自己想要的功能再考虑自行实现。

```nix
let
  recurse = n: if n <= 0 then [] else recurse (n - 1) ++ [n];
in
  recurse 5
```

### 断言

### `with` 表达式

### 注释
