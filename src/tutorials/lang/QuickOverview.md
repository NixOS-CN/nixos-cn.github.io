# Nix 语言快速入门

<!-- prettier-ignore -->
::: warning 基础要求
以下教程需要你具有一定基础。
具体来说，如果你已经知道在编程领域什么是变量（variable）、
字符串（string）、函数（function）及参数（argument），
那么你的知识水平就差不多足够了。

<!-- prettier-ignore -->
:::

<details><summary>仅面向本文维护者的说明，单击以切换折叠/展开</summary>
本文在设计上是线性的，也即只需要读者具备一点点基础，就可以通过按顺序从头读到尾的方式完成本文的学习。因此，请留心说明顺序，例如讲 let 绑定时如果举了一个列表的例子，你需要确保前面已经正式介绍过列表。再如，讲 with 语法糖的时候同时用到 let 绑定和列表，那么这两个概念都需要在前面已经正式介绍过。否则，读者很可能会面对初次接触的语法或者概念而被卡住，这会严重影响学习效率甚至是完成率。若出于顺序安排的其他合理性原因，实在无法避开在说明中涉及陌生概念，可以提示读者相关部分不需要理解，后面会讲到。另外，常用的 callout 块中，info 显示为蓝色，适用于普通知识点；而 note 显示为灰色，适用于就算不理解也没关系的高阶或补充知识。至于 tip 和 warning，它们有可能涉及到知识，也可能不涉及，重点区别在于 tip 偏向于“实用建议/能帮助理解或加强记忆的提示”，而 warning 偏向于“能够避免损失的提示”（包括时间精力方面的）以及“一不小心就可能陷入误区”。
</details>

Nix 作为语言，是一门简单的函数式语言，它被专门设计并用于 Nix 包管理器及相关生态
（NixOS、Home-Manager 等）。

## 实践环境

在学习 Nix 语言时，虽然不是必须，但若动手实践，效率往往会高得多。

以下给出两种实践方法。这不是必须的，你也可以跳过本节。

<!-- prettier-ignore -->
::: warning
本节需要你已经安装了 Nix 或正在使用 NixOS。

另外，本教程中的示例代码并不全是为了供直接运行而写的。对于每一段代码，若想实践其
效果，请先理解对应的知识，再基于这段代码自己编写测试代码以运行。

（对于 Nix 来说，运行代码被称为**求值**（evaluate），而只有**表达
式**（expression）能被求值；但是，示例的代码未必是表达式，而可能是属性集的元素
等。）

<!-- prettier-ignore -->
:::

### 交互模式

你可以通过在命令行运行

```bash
nix repl
```

进入交互模式，其界面类似下面的样子：

```plain
Nix 2.31.1
Type :? for help.
nix-repl>
```

此时输入表达式，例如

```nix
1 + 2
```

回车即可求值，得到结果如下：

```plain
3
```

<!-- prettier-ignore -->
::: tip
输入 `:q` 可以退出交互模式。

<!-- prettier-ignore -->
:::

### 文件求值

交互模式简单快捷，但我们平时使用 Nix 语言进行编辑配置、打包等操作时，大多数情况
下不会直接使用交互模式，而是对 `*.nix` 纯文本文件进行编辑。

因此，如果你习惯于使用编辑器，这里更推荐利用文件求值进行实践。每个 nix 文件的内容都是**一个**表达式，这是 nix 文件能被求值的前提。

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

<!-- prettier-ignore -->
::: note 拓展说明：求值的惰性与嵌套迭代

此部分内容较长，仅供有兴趣的人阅读。

<details><summary>单击以切换折叠/展开</summary>

Nix 的求值具有惰性（laziness），只会在有必要时进行。例如，下述代码（看不懂没关
系）将名称 `a` 分配给值 $\dfrac{2}{0}$ ，这是一种典型的数学错误：

```nix
let a = builtins.div 2 0; b = 3; in b
```

运行它所得结果为 `3`，竟然不会报错？实际上，这正是因为 `a` 的值不被需要（只需要
输出 `b` 的值），所以也未被求值。

---

与惰性类似的是另一种行为是，嵌套属性集的求值，在交互模式和文件求值模式下，除非必
要，默认不会迭代，而是以占位符替代，例如

```nix
{ a.b.c = 1; }
```

使用交互模式，结果如下

```plain
{
  a = { ... };
}
```

使用文件求值的结果如下

```plain
{ a = <CODE>; }
```

不过，与惰性不同，迭代求值的行为可以直接控制。

- 交互模式：在开头添加 `:p`，例如 `:p { a.b.c = 1; }`。
- 文件求值：添加 `--strict` 参数，例如
  `nix-instantiate --eval --strict foo.nix`。

结果如下：

```plain
{
  a = {
    b = { c = 1; };
  };
}
```

</details>
<!-- prettier-ignore -->
:::

**好了，下面正式介绍 Nix 语法。**

## 注释、缩进与换行
注释、缩进与换行的语法与机制，对编程语言的风格有重要影响。本节将介绍 Nix 语言中的注释、缩进与换行。

- 注释：在 Nix 语言中，用 `#` 表示注释，在它之后直到行末的部分都会被忽略。
- 缩进与换行：与 Python 这种对缩进有要求的语言不同，在 Nix 语言中，大多数情况下，换行与缩进只是为了更好的可读性，并不影响代码的本质。

例如，下面的两段示例代码（你目前还不需要理解它们的含义），它们在本质上（也即在 Nix 解释器看来）并没有区别。

第一例：
```nix
{ a = 1; b = 2; }
```

第二例：
```nix
{     # 这是一句注释，放在代码所在行的末尾。
  # 这也是一句注释，单独占了一行。
  a = 1;    # 这一行即使不缩进，也不影响代码本质。
  b = 2; 
  # c = 3;  # 这里的代码被注释掉了，相当于不存在。
}
```

<!-- prettier-ignore -->
::: warning
换行与空格一样具有分隔作用，请勿在不可分隔的地方胡乱断行。

<!-- prettier-ignore -->
:::

## 名称与属性集
变量是大多数编程语言中最基础的概念，而与之类似的名称则是 Nix 语言中最基础的概念。本节将会介绍 Nix 中如何将名称**分配给值**，以及最常用的数据类型——**属性集**，继而引出**递归属性集**与**列表**的概念。

### 名称和值

我们可以使用 `=` 将名称分配给值，形成“名称 - 值”对。例如将名称 `foo` 分配给值 `123`：

```nix
foo = 123
```

<!-- prettier-ignore -->
::: tip 如何测试此示例
上面的示例不属于表达式（但可以作为表达式的一部分），所以你无法将它直接写入 nix 文件进行文件求值；不过 `nix repl` 有一些灵活的处理，允许你输入这样的结构。

<!-- prettier-ignore -->
:::

<!-- prettier-ignore -->
::: info 函数式语言与命令式语言中“变量”的区别
太长不看版：在 Nix 里，“名称”就是“变量”，只是这个变量一旦绑定便成永恒；它保留了数学“可取不同值”的语义，却丢掉了命令式“可重新赋值”的含义。

| 维度 | 命令式语言 | Nix（函数式） |
|---|---|---|
| 底层模型 | 存储格（内存单元） | 无存储格，只有「名称-值」映射 |
| 操作 | 赋值：随时把新值写回同一单元 | 绑定：一次性把名称贴到值，不可重写 |
| 所谓“变量” | 存储格的别名 → 之后可反复擦写 | 数学意义上的变量 → 同一作用域内值固定 |
| 文档用词 | variable = 可重写的存储格 | variable = 一次性绑定的名称（不会变） |

<!-- prettier-ignore -->
:::

名称的值并不仅限于 `123` 这种整数。具体来说有以下数据类型（不需要完全理解，留下印象
即可）

- 字符串（string），例如 `"Hello world"`
- 整数（integer），例如 `1`
- 浮点数（float），例如 `3.141`
- 布尔（bool），只有 `true` 与 `false` 两种
- null，只有 `null` 一种
- 列表（list），例如 `[ 1 "tux" false ]`
- 属性集（attribute set），例如 `{ a = 1; b = "tux"; c = false; }`

### 属性集

在 Nix 语法中，属性集是最常见的数据类型之一，基本示例如下：

```nix
{
  a = 1;
  b = 2;
}
```

概念说明：

- 属性集（attribute set）就是装载若干对**名称与值**的集合。
- 属性集内的名称被称为这个属性集的**属性**（attribute）；
- 属性集内由名称和值组成的对被称为该属性的**元素**（element）；

语法说明：

- 属性集以 `{` `}` 为边界，其内部为多个“名称-值”对，且它们末尾必须添加 `;` 。

上述代码将 `foo` 的值定义为属性集 `{ a = 1; b = 2; }` ，因此可称之为属性集 `foo` 。

属性集 `foo` 中有两个属性：

- 属性 `a`，其值为 `1`
- 属性 `b`，其值为 `2`

属性的值除了可以是 `1` `2` 这样的数值外，也可以是一个属性集（也即支持嵌套），例如
将 `b` 的值改为属性集 `{ c = 2; d = 3; }`：

```nix
{
  a = 1;
  b = {
    c = 2;
    d = 3;
  };
}
```

嵌套属性集中的属性也可以利用 `.` 表示，例如上面这段的一种等价写法如下：

```nix
{
  a = 1;
  b.c = 2;
  b.d = 3;
}
```

<!-- prettier-ignore -->
::: tip
上面的写法被称为“属性访问”，后面会再次介绍。

<!-- prettier-ignore -->
:::

### 递归属性集

普通的属性集不支持递归引用，举个例子：
```nix
{ 
  a = 1;
  b = a + 1;
}
```
对上面的表达式求值，会报错：
```
error: undefined variable 'a'
```
可见，当属性集内的属性 `b` 需要访问该属性集的另一个属性 `a` 时，即使 `a` 是“先”定义的，也无法访问到。此时就需要我们改用递归（recursive）属性集，它相比普通的属性集，在前面多加了 `rec `：

```nix
rec {
  a = 1;
  b = a * 2 + 1;
}
```

对上面的表达式求值，结果如下：

```nix
{ a = 1; b = 3; }
```

<!-- prettier-ignore -->
::: info 求值结果的排序依据
可以看到，结果中的 `a = 1` 在前面，`b = 3` 在后面。这种顺序实际上与任何其它因素（包括声明顺序、求值依赖关系）都无关，而只与**属性名称本身的排序**有关。例如，对 `rec { a = 1; b = 2; }` 与 `rec { b = 2; a = 1; }` 的求值，都会把 `a = 1` 放在前面，归因到底，只是 `a` 在字母表中位于 `b` 之前罢了。（直接原因则与 Nix 解释器对名称排序所用到的算法或者调用的库有关，这里不再深入。）

<!-- prettier-ignore -->
:::

<!-- prettier-ignore -->
::: note 拓展说明：求值过程的顺序机制
既然求值结果的排序与求值顺序等因素无关，那么求值顺序由什么决定呢？

将刚才例子中属性集里的两个元素位置对调：
```nix
rec {
  b = a * 2 + 1;
  a = 1;
}
```
你会发现，Nix 解释器能自动处理求值顺序，并不会因为 `a` 的声明被调整到后面而影响求值结果（与之前的完全一致，从略）。这看起来相当“智能”，你甚至可以写得更复杂一些，比如 Nix 解释器也能自动处理下面的例子（结果略）：
```nix
rec {
  c = a * 2 - b + d - 35;
  a = 12;
  b = d * 2 + 64;
  d = a - 15;
}
```

不过，这并不代表你可以直接用它来解方程。例如我们再写一个在数学上有唯一解的方程组：
```nix
rec {
  b = a * 2 + 1;
  a = b + 1;
}
```
此表达式求值的输出如下：
```nix
{
  a = «error: infinite recursion encountered»;
  b = «error: infinite recursion encountered»;
}
```
由此可见，递归属性集内部处理求值顺序的机制，确实是递归的，而如果递归陷入死循环就会报错。

<!-- prettier-ignore -->
:::

### 列表
之前我们学习了属性集，它含有多个元素，例如：
```nix
{
  a = "apple";
  b = "orange";
  c = "banana";
}
```
上面的名称 `a` `b` `c` 或许可以有明确的含义，但有些场景不需要这些名称，而只关心后面的值，这种情况下就可以使用列表，例如：
```nix
[ "apple" "orange" "banana" ]
```
需要注意语法细节：
- 列表以 `[` `]` 为边界，其内部为多个元素，每个元素都是值（value）。
- 元素之间使用空格（或换行）分隔，各元素**不**以 `;` 结尾。

## let 绑定与属性访问
前面关于名称的使用是非常基本的，我们还需要更灵活的处理方法。本节将会介绍另一种将名称分配给值的方法——**let 绑定**，以及风格简洁的**属性访问**。
### `let` 绑定
有时我们希望在指定的范围内为值分配名称，此时就可以使用 `let` 绑定，示例如下：

```nix
let
  a = 1;
  b = 2;
in
  a + b  # 结果是 3
```

注意语法细节：
- `let` 与 `in` 之间的“名称-值”对以 `;` 结尾；
- `in` 之后**只有一个表达式**。注意，这只是语法形式上的要求，并不代表 `let` 绑定的用处很有限，因为表达式本身可以很复杂，常见的是嵌套属性集。作为基本示例，下面演示刚刚学到的列表：
```nix
let
  b = a + 1;
  c = a + b;
  a = 1;
in
  [ a b c ]
```
求值的结果如下：
```
[ 1 2 3 ]
```

<!-- prettier-ignore -->
::: info 作用域
`let` 绑定是有作用域的，绑定的名称只能在作用域使用，或者说每个 `let` 绑定的名称只能在该表达式内使用。例如下面的例子：

```nix
{
  a = let x = 1; in x;
  b = x;
}
```

由于 `b = x;` 不在作用域之内，会有报错如下：

```
error: undefined variable 'x'
```

<!-- prettier-ignore -->
:::

<!-- prettier-ignore -->
::: note 拓展说明：局部变量（？）
Nix 中不存在“全局变量”，因而“局部变量”的说法可能引起误会，应当尽量避免使用。

不过，[Nix manual](https://nix.dev/manual/nix/2.31/language/syntax.html) 中对 let 绑定的介绍提到了局部变量（local variable）。
> A let-expression allows you to define local variables for an expression.

这种说法可能不合适，但既然官方文档也有用到，其他地方自然也可能会出现，留心即可。

<!-- prettier-ignore -->
:::

### 属性访问

前面提到，嵌套属性集中的属性可以利用 `.` 表示，这被称为属性访问（attribute access）。

在下面这个例子中，我们定义了一个嵌套属性集 `a`，并使用 `a.b.c` 访问值 `123`：
```nix
let
  a = { b = { c = 123; }; };
in
  a.b.c
```
求值，结果如下：
```plain
123
```

利用访问属性的写法，可以更加方便地为值分配名称。
比如，上面的例子也可以这样写（返回结果不变）：

```nix
let
  a.b.c = 123;
  # 还可以写成下面这样
  # a = { b.c = 123; };
  # 再或者这样
  # a.b = { c = 123; };
in
  a.b.c
```

<!-- prettier-ignore -->
::: tip 小结
本小节给出了属性访问的两种应用场景，第一种是获取属性的值，第二种是为值分配属性名称。

显然，第二种场景**不是**必须使用属性访问的写法，它只是更方便。仅就这个场景来看，这是一种**语法糖**。

我们将在下一节介绍另外两种常用的语法糖。

<!-- prettier-ignore -->
:::

## 语法糖 `with` 和 `inherit`
语法糖（syntactic sugar）是对语言功能没有影响，但更方便使用的一种语法。本节将介绍两种常用的语法糖 `with` 和 `inherit`。

### `with` 表达式

`with` 能简化特定形式的列表。
- 举个例子，列表 `[ a.x a.y ]` 中出现了两次 `a`。
- `with` 表达式就可以帮助你简化这种列表，将其写作 `with a; [ x y ]`。
- 注意语法细节：`a` 后面有一个分号 `;`，而 `with` 表达式的作用域为分号后的第一个列表。

在下面的例子中，由于 `[ a.x a.y ]` 等价于 `with a; [ x y ];` ，`R1` 和 `R2` 的值一致。

```nix
let
  a = {
    x = 1;
    y = 2;
  };
in
  {
    R1 = [ a.x a.y ];
    R2 = with a; [ x y ];
  }
```
进行严格求值，返回结果：
```plain
{ R1 = [ 1 2 ]; R2 = [ 1 2 ]; }
```

<!-- prettier-ignore -->
::: info 就近性
不过，这种等价并不是恒定的，
比如下面的例子，
我们在 `let` 后面直接加一行 `x = 0;`：
```nix
let
  x = 0;
  a = {
    x = 1;
    y = 2;
  };
in
  {
    R1 = [ a.x a.y ];
    R2 = with a; [ x y ];
  }
```
进行严格求值，返回结果：
```plain
{ R1 = [ 1 2 ]; R2 = [ 0 2 ]; }
```

可见，`with` 表达式具有一种“就近性”，
当 `x` 的值可以不经嵌套地直接访问时，
它会直接返回这个值，而不会使用 `a` 来嵌套地访问。

<!-- prettier-ignore -->
:::

### `inherit` 语法

首先说明什么是“继承”。

例如下面的表达式：
```nix
let
  a = 1;
  b = 2;
  x = 3;
  y = 4;
in
  {
    m = a;
    n = b;
    x = x;
    y = y;
  }
```
求值结果：
```plain
{ m = 1; n = 2; x = 3; y = 4; }
```
在此例中，
- `m` 获取了 `a` 的值，`n` 获取了 `b` 的值。
- 而 `x` `y` 则直接从同名变量获取值，这被称为“继承”（inherit）。

下面将要介绍的 `inherit` 语法，
则简化了这种继承所需的“名称-值”对。
比如，刚才的例子可以这样写（求值结果不变）：
```nix
let
  a = 1;
  b = 2;
  x = 3;
  y = 4;
in
  {
    m = a;
    n = b;
    inherit x y;
    # 也可以分开写
    # inherit x;
    # inherit y;
  }
```

<!-- prettier-ignore -->
::: warning
`inherit` 的语法结构，例如上面的 `inherit x;`，本质上仍然属于“名称-值”对，不属于表达式。

<!-- prettier-ignore -->
:::

`inherit` 还支持前置一对括号 `()` 包裹属性集，实现属性访问的效果。
例如下面的例子：
```nix
let
  a = { x = 1; y = 2; };
in
  {
    inherit (a) x y;
    # 等价于
    # x = a.x;
    # y = a.y
    # 注：这里没有列表，不要和 with 混淆。
  }
```
严格求值，结果如下：
```plain
{ x = 1; y = 2; }
```

<!-- prettier-ignore -->
::: tip 利用 inherit 提升“嵌套级别”

由于 `inherit` 可实现这种属性访问的效果，
它的用法还可以更灵活。比如下面的例子：
```nix
let
  a = { x = 1; y = 2; };
in
  with a; [ x y ]
```
严格求值，结果如下：
```plain
[ 1 2 ]
```
而如果利用 `inherit` 我们还可以这样写：
```nix
let
  inherit ({ x = 1; y = 2; }) x y;
  # 等价于
  # x = { x = 1; y = 2; }.x;
  # y = { x = 1; y = 2; }.y;
in
  [ x y ]
```
对其严格求值的结果不变。
可见，利用 `inherit`，
我们变相地提升了 `{ x = 1; y = 2; }` 中属性的“嵌套级别”，
在后续代码中得以省去属性访问。

<!-- prettier-ignore -->
:::

## 文件系统路径

在 Nix 语言中，文件系统路径（file system paths；简称路径）是一种数据类型，它不同于后面要介绍的字符串类型。

### 路径的基本语法

路径有绝对路径（absolute path）
和相对路径（relative path）两种，
它们都必须满足：
- 路径至少包含一个 `/`。
  - 对于相对路径，若目标已经在当前目录，可前置 `./`。
- 路径不能以 `/` 结尾。
  - 若有需要，可在 `/` 后加 `.`。

<!-- prettier-ignore -->
::: warning
因路径的语法不正确导致的报错，
看起来可能会很奇怪，留心即可。

例如把当前路径 `./.` 错写成 `.`：
```nix
.
```
求值报错：
```plain
error: syntax error, unexpected '.'
```

<!-- prettier-ignore -->
:::

**绝对路径**以 `/` 开头。

例一：`/etc/os-release` 文件
```nix
/etc/os-release
```
- 不能写成 `/etc/os-release/`
  - 注意，这不是因为 `os-release` 属于文件而非目录，而是因为路径不能以 `/` 结尾。
- 可以写成 `/etc/os-release/.`

求值结果：
```plain
/etc/os-release
```

例二：根目录
```nix
/.
```
- 不能写成 `/`（路径不能以 `/` 结尾）

求值结果：
```plain
/
```

**相对路径**不以 `/` 开头，
且求值结果与当前所在目录（以下假设 `/home/user`）有关。

例一：当前目录（用 `.` 表示）：
```nix
./.
```
- （虽然一般不合适）还可以写成 `././././.`
- 但是不能写成 `.`（缺少 `/`，不构成路径）

求值结果：
```plain
/home/user
```

例二：当前目录下的 `Downloads`
```nix
./Downloads
```
- 也可以写成 `Downloads/.`
- 但是不能写成 `Downloads`（缺少 `/`，不构成路径）
- 也不能写成 `Downloads/`（路径不能以 `/` 结尾）

求值结果：
```plain
/home/user/Downloads
```

例三：用 `..` 指定上级目录
```nix
../../etc
```
- 也可以写成 `./../../etc`

求值结果：
```plain
/etc
```

### 检索路径

检索路径（lookup paths）又名“尖括号语法”（angle bracket syntax），
是通过系统变量来获取路径的语法。
其最简单的形式是以一对尖引号 `<` `>` 包裹所需内容。

例如：

<!-- prettier-ignore -->
::: warning
请不要急着运行下面的示例，因为它实际包含更多内容。

<!-- prettier-ignore -->
:::

```nix
<nixpkgs>
```

这个时候 `<nixpkgs>` 实际上依赖了系统变量中一个名为
[`$NIX_PATH`](https://nixos.org/manual/nix/unstable/command-ref/env-common.html?highlight=nix_path#env-NIX_PATH)
的路径值：

```plain
/nix/var/nix/profiles/per-user/root/channels/nixpkgs
```

<!-- prettier-ignore -->
::: warning
我们建议你**避免**使用检索路径来指定其它相对路径，比如下面的例子：

```nix
<nixpkgs/lib>
```

**这是一种污染**，因为这样指定相对路径会让配置与环境产生联系。
我们的配置文件应该尽量保留纯函数式的特性，
即输出只与输入有关，
纯函数不应该与外界产生任何联系。

<!-- prettier-ignore -->
:::

## 字符串

字符串（string）是一种常见的数据类型，其最简单的形式是以一对双引号 `"` `"` 包裹所需内容。

例如：

```nix
"hello world!"
```

### 字符串插值

字符串插值，这个功能是各大流行语言的标配。

在 Nix 中，使用 `"${ ... }"` 可以插入名称的值：

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

<!-- prettier-ignore -->
::: warning 名称的值的数据类型
字符串插值语法支持的值必须为字符串类型，
或是可以转换为字符串的数据类型。例如：

```nix
let
  x = 1;
in
  "${x} + ${x} = ${x + x}"
```

由于 `x` 的值为数字类型，对此求值的报错如下：

```plain
# ... 前面略
error: cannot coerce an integer to a string
```

如果确实需要将数字作为插值参数，应该怎么办呢？

虽然有点早，提前告诉你——
对于非字符串类型，
可以显式使用内置函数 `toString`，
将其转换为字符串类型：

```nix
let
  x = 1;
in
  "${toString x} + ${toString x} = ${toString (x + x)}"
```
求值的结果如下：
```plain
"1 + 1 = 2"
```

<!-- prettier-ignore -->
:::

字符串插值也支持嵌套，例如：

```nix
let
  a = "pen";
  b = "apple";
  c = "pineapple";
in
  {
    # 请注意 plus 和 equals 两侧留出的空格
    # 对比下面两行，它们的值完全一致
    L1="${a + " plus ${b + " equals ${c}"}"}.";
    L2="${a+" plus ${b+" equals ${c}"}"}.";
  }
```
求值结果如下：
```nix
{
  L1 = "pen plus apple equals pineapple.";
  L2 = "pen plus apple equals pineapple.";
}
```

### 多行字符串

有时我们需要用字符串表示多行内容，
此时可利用转义，将 `\n` 作为换行符。

比如对于以下内容：
```plain
Please run
  cat /etc/os-release
to get distro info.
```
可用字符串表示为
```nix
"Please run\n  cat /etc/os-release\nto get distro info.\n"
```
求值结果如下：
```plain
"Please run\n  cat /etc/os-release\nto get distro info.\n"
```

<!-- prettier-ignore -->
::: tip
上面的求值结果看起来仍然不是多行的，
但其实从数据本身内容来说是没有问题的。

如果想要渲染出多行的样子，
文件求值时可以加 `--raw` 参数，
比如 `nix-instantiate --eval --raw foo.nix`，
结果如下：
```plain
Please run
  cat /etc/os-release
to get distro info.
```

而若使用 `nix repl` 则需要其它方法来达成目的，这里不再展开。

<!-- prettier-ignore -->
:::

但是，这样做的可读性较差，可维护性也不好。

一个更合适的方法是使用缩进字符串（indented strings），
也称为多行字符串（multi-line strings）。

其基本形式为，
用两组 `''` 作为开头和结尾，
中间包裹所需内容。

比如刚才的例子等价于：（求值结果不变）

```nix
''
Please run
  cat /etc/os-release
to get distro info.
''
```

<!-- prettier-ignore -->
::: info 智能去除缩进
Nix 的多行字符串会统一去除开头的缩进，
这在其他语言中是不常见的。

比如刚才的例子还等价于：（求值结果不变）
```nix
''
    Please run
      cat /etc/os-release
    to get distro info.
''
```

<!-- prettier-ignore -->
:::

### 字符串中的字符转义 {#multi-line-string-escape}

在单行字符串中，
Nix 的转义语法与许多其他语言相同，
`"` `\` `${` 以及其他 `\n` `\t` 等特殊字符，
都可直接使用 `\` 进行转义。

比如，内容 `this is a "string" \` 可用下面的代码表示：

```nix
"this is a \"string\" \\"
```

但在多行字符串中，不是使用 `\`，
而是使用 `''` 来转义。

比如，下面的例子会输出原始字符 `${a}`，而不是做字符串插值：

```nix
let
  a = "1";
in
''the value of a is:
  ''${a}
''
```
求值结果如下：
```plain
"the value of a is:\n  \${a}\n"
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

但如果我们希望在字符串中使用原始字符 `''`，
因为会与多行字符串原有的语义冲突，
不能直接写 `''`，而必须改用 `'''` 三个单引号。

也就是说，
在多行字符串中的 `'''` 三个单引号这样的组合，
实际输出的是原始字符串 `''`.

举个例子：

```nix
let
  a = "1";
in
''the value of a is:
  '''${a}'''
''
```
求值结果如下：
```plain
"the value of a is:\n  ''1''\n"
```

## 函数

作为函数式编程（functional programming）的语言，
Nix 中函数的地位非常重要。

### 函数的基本构成
函数由参数和函数体组合而成，它们之间由 `:` 分隔。

例如，对于数学上的函数 $f(x)=x+1$ ，用 Nix 的函数表达如下：

```nix
x: x + 1
```

在此例中，左边的 `x` 是参数，右边的 `x+1` 是函数体。

<!-- prettier-ignore -->
::: info 匿名函数与 λ
机智的你可能会发现，
此示例实现的 $f(x)=x+1$ 并不完整——

毕竟，$f(x)=x+1$ 的函数名 $f$ 去哪里了？

确实，上面的例子所写的是**匿名函数**，即没有和名称绑定。
我们对它进行求值，结果如下：
```plain
<LAMBDA>
```

这里的 LAMBDA（即希腊字母 λ）就是函数的代表符号。

在一些语言中，λ 特指匿名函数，
而在 Nix 语言中，`<LAMBDA>` 只是一种数据类型，指代一般的函数。

至于为什么 λ 被用来代表函数，
请自行搜索“lambda 演算”以及“函数式编程”，
这里不再展开。

<!-- prettier-ignore -->
:::

<!-- prettier-ignore -->
:::tip 直接调用匿名函数
利用 `(` `)` 将匿名函数的整体包裹起来，就可以直接调用了，例如
```nix
(x: x + 1) 2
```
求值结果为 `3`。

<!-- prettier-ignore -->
:::

函数是一种数据类型，自然可以将函数与名称绑定。

在前面例子的基础上，我们将函数绑定到名称 `f`，并且将 2 作为其参数来调用：

```nix
let
  f = x: x + 1;
in
  f 2
```

求值，结果如下：
```plain
3
```
这相当于先定义函数 $f(x)=x+1$ ，再求 $f(2)$ 的值，结果为 3。

### 作为参数的属性集：基本形式
在前面的例子中，我们只实现了一个简单的一元函数 $f(x)=x+1$。

那么对于多元函数，比如 $f(x,y)=3x+\frac{y}{2}$，在 Nix 中应该怎么实现呢？
- 坏消息是，根据 Nix 语法规范，每个函数在形式上**有且仅有一个参数**。
- 好消息是，这个参数**可以是属性集**，并且在函数体中可以将属性集中的**各个属性单独拿出来使用**。

例如

```nix
{ x, y }: ( 3 * x ) + ( y / 2 )
```

上面的函数虽然仅接受一个参数（属性集 `{ x, y }`），
实际功能却相当于数学上的二元函数 $f(x,y)=3x+\frac{y}{2}$。

<!-- prettier-ignore -->
::: warning 属性集的语法细节
在**函数定义**中作为参数出现的属性集，只包含属性名称，并且用 `,` 分隔。

这与之前介绍的属性集和列表都不同。

作为对比，下面是一个标准的属性集的示例：
```nix
{ a = 1; b = 2; }
```

再来一个列表的示例：
```nix
[ a b ]
```

<!-- prettier-ignore -->
:::

我们为前面的例子绑定名称 `f` 并且以参数 `{ x = 1; y = 4; }` 来调用它：

```nix
let
  f = { x, y }: ( 3 * x ) + ( y / 2 );
in
  f { x = 1; y = 4; }
```
求值，结果如下：
```plain
5
```
这相当于定义了函数 $f(x,y)=3x+\frac{y}{2}$ 之后求值 $f(1,4)$，结果为 5。

<!-- prettier-ignore -->
:::tip 更多示例
Nix 的函数也能处理其它数据类型。

例如，定义一个函数 `concat3` 并调用它来拼接 `"Hello"` `" "` 和 `"world"`：
```nix
let
  concat3 = { a, b, c }: a + b + c;
in
  concat3 { a = "Hello"; b = " "; c = "world"; }
```
求值结果如下：
```plain
"Hello world"
```

调用函数进行的求值，自然也可以嵌套使用。
例如，定义一个函数 `concat2`，并两次调用它来拼接 `"Hello"` `" "` 和 `"world"`：
```nix
let
  concat2 = { a, b }: a + b;
in
  concat2 {
    a = concat2 { a = "Hello"; b = " "; };
    b = "world";
  }
```
由于 `concat2` 接受的属性集仅含两个属性，
此例先拼接了 `"Hello"` 和 `" "`，再将此结果与 `"world"` 拼接。
求值结果仍然为 `"Hello world"`。

<!-- prettier-ignore -->
:::

<!-- prettier-ignore -->
:::warning
函数被调用时所接受的属性集，
必须符合**定义中作为参数的属性集的要求**，
否则就会报错。

例如前面的 `concat2` 函数，我们多给一个 `c` 的值：
```nix
let
  concat2 = { a, b }: a + b;
in
  concat2 { a = "Hello"; b = "world"; c = "!"; }
```
求值，报错：
```plain
error: function 'concat2' called with unexpected argument 'c'
```
或者，这次我们只给出 `b` 的值：
```nix
let
  concat2 = { a, b }: a + b;
in
  concat2 { b = "world"; }
```
求值，报错：
```plain
error: function 'concat2' called without required argument 'a'
```

但是，前述要求可以设置得更加灵活，
下面的若干节将会对此进行介绍。

<!-- prettier-ignore -->
:::

### 作为参数的属性集：属性默认值
在属性后面加 `? <value>` ，会将此属性的默认值设为 `<value>`。

例如，我们来定义一个“问候”函数 `greet`：
- 它的功能是对 `object` 进行“问候”；
- 支持设定问候语 `greeting`，默认值为 `"Hello "`。
  - 设置方法是，在函数定义中参数里的 `greeting` 后面附加 `? "Hello, "`。

测试例：
```nix
let
  greet = { greeting ? "Hello, ", object }: greeting + object + "!";
in
  {
    # 对 world 进行问候
    R1 = greet { object = "world"; } ;
    # 对 my friend 进行问候
    R2 = greet { object = "my friend"; } ;
    # 自定义问候语，对 my friend 进行问候
    R3 = greet { greeting = "Welcome, "; object = "my friend"; } ;
  }
```
严格求值，结果如下：
```plain
{
  R1 = "Hello, world!";
  R2 = "Hello, my friend!";
  R3 = "Welcome, my friend!";
}
```

### 作为参数的属性集：额外属性
为了在调用函数时能传入额外属性，需要在属性集中添加一个占位符 `...`。

例如：
```nix
let
  concat2 = { a, b, ... }: a + b;
in
{
  R1 = concat2 { a = "Hello "; b = "world"; };
  # 传入额外的 c 不会引发报错
  R2 = concat2 { a = "Hello "; b = "world"; c = "!"; };
}
```
严格求值结果如下：
```plain
{ 
  R1 = "Hello world";
  R2 = "Hello world";
}
```
注意这里的 `R1` 和 `R2` 的值相同，
因为 `c` 作为额外属性，不能出现在函数定义中，自然也不会参与计算。

<!-- prettier-ignore -->
::: warning
在函数定义中，若函数体使用了参数中未定义的属性，不论参数是否含 `...` 都会报错。
例如：
```nix
let
  # 参数中没有 c，但函数体里有 c
  concat2 = { a, b, ... }: a + b + c;
in
  concat2 { a = "Hello "; b = "world"; c = "!"; }
```
求值，报错（注意这个报错发生在函数的定义部分）：
```plain
error: undefined variable 'c'
```

<!-- prettier-ignore -->
:::

### 作为参数的属性集：命名属性集

这里再次展示前面举过的例子，
定义函数 $f(x,y)=3x+\frac{y}{2}$，求值 $f(1,4)=5$，
用 Nix 实现如下：
```nix
let
  f = { x, y }: ( 3 * x ) + ( y / 2 );
in
  f { x = 1; y = 4; }
```
求值，结果如下：
```plain
5
```

<!-- prettier-ignore -->
:::info 命名属性集
与匿名函数的概念类似，
若一个属性集没有与名称绑定，
则称其为匿名属性集。
反之，则称为命名属性集。
<!-- prettier-ignore -->
:::

此例的函数定义中，匿名属性集 `{ x, y }` 作为了参数。

而命名属性集也可以作为参数，
此时往往需要结合属性访问。

例如，上面的例子等价于：（求值结果不变）
```
let
  # 用命名属性集 A 代替了匿名属性集 { x, y }
  # 同时 x、y 也要改用属性访问的写法 A.x、A.y
  f = A: ( 3 * A.x ) + ( A.y / 2 );
in
  f { x = 1; y = 4; }
```

此外，函数的参数可以是**一个**命名属性集与**一个**匿名属性集的结合，
两者以 `@` 连接（先后顺序不限），并且匿名属性集必须包含 `...` 以允许额外属性。

例如，上面的例子还等价于：（求值结果不变）
```nix
let
  f = { x, ... }@A: ( 3 * x ) + ( A.y / 2 );
  # 也可以写成
  # f = A@{ x, ... }: ( 3 * x ) + ( A.y / 2 );
in
  f { x = 1; y = 4; }
```
### 柯里化函数

柯里化（currying）指的是将一个 N 元函数转换为 N 个一元函数的嵌套序列的过程。

<!-- prettier-ignore -->
:::note 拓展说明：数学上的柯里化

这里所说的一元函数不是普通的函数，在数学上对应的概念实际上是映射。

例如，三元函数 $F(x,y,z)=x+y+z$ 也即映射 $F: x,y,z\mapsto x+y+z$
可以转换为三个一元映射的嵌套，分别是：
1. $F_1: x \mapsto ( y \mapsto ( z \mapsto x + y + z ))$
2. $F_2: y \mapsto ( z \mapsto x + y + z )$
3. $F_3: z \mapsto x + y + z$

<!-- prettier-ignore -->
:::

<!-- prettier-ignore -->
:::note 拓展说明：柯里化的核心优点

柯里化很灵活，可以避免重复传入参数。

当你传入第一个参数的时候，
该函数就已经具有了第一个参数的状态（闭包）。

<!-- prettier-ignore -->
:::

例如，函数 `{x,y}:x+y` 的柯里化形式如下：

```nix
x: (y: x + y)
```

<!-- prettier-ignore -->
:::tip
虽然会降低可读性，下面的写法也是可以的：
```nix
x: y: x + y
```
<!-- prettier-ignore -->
:::

虽然这个柯里化函数最终需要两个参数，
但它可以逐次接受这两个参数。
例如我们先给它其中一个参数作为 `x` 的值：

```nix
let
  f = x: y: x + y;
in
  f 1
```
求值，结果显示为：
```nix
<LAMBDA>
```
也即 `f 1` 的值依然是函数，此函数实际上就是
```nix
y: 1 + y;
```

我们可以保存这个状态的函数，稍后再来使用。
例如将 `f 1` 绑定到名称 `g`，再求值 `g 2`。
其中 1 会作为参数 `x` 的值。
而 2 会作为参数 `y` 的值。
```nix
let
  f = x: y: x + y;
in
  let
    g = f 1;
  in
    g 2
```
求值结果为 `3`。

也可以一次性接收两个参数（求值结果不变）：
```nix
let
  f = x: y: x + y;
in
  f 1 2
```

## 函数库

前面我们已经接触到了 `+`、`-`、`*`、`/` 等运算符号，
实际上它们都属于 Nix 语言中的内建操作符。
常用的内建操作符还有 `==` `&&` 等。
建议至少浏览一遍[内建操作符的文档页面](https://nix.dev/manual/nix/stable/language/operators.html)，
以熟悉可用的功能。

除了内建操作符之外，还有两个被广泛使用的函数库，
它们加在一起被视为 Nix 语言的事实标准。

### builtins
builtins 即内建函数，也称为“原始操作”
（primitive operations，简写为 primops）。

Nix 附带许多内建函数，
它们作为 Nix 语言解释器的一部分，用 C++ 实现。

Nix 手册列出了所有 [builtins](https://nix.dev/manual/nix/stable/language/builtins.html) 函数。

这些函数可以通过常量 `builtins` 访问，例如前面提到过的 `toString`：

```nix
builtins.toString
```
求值，结果如下：
```plain
<PRIMOP>
```

<!-- prettier-ignore -->
:::info import 函数
大多数内置函数只能通过 `builtins` 访问。
一个显著的例外是 `import`，它可在顶层直接使用。

`import` 接受的参数是 Nix 文件的路径，
会对其进行文件求值并返回结果。
此路径也可以是目录，
这种情况下则会使用该目录下的 `default.nix` 文件。

例如，令 `foo.nix` 的文件内容为 `1 + 2`，
有如下示例
```nix
import ./foo.nix
```
求值，结果为 `3`。

被导入的 Nix 文件必须是 Nix 表达式，
这个表达式自然也可以是函数本身。

例如，令 `foo.nix` 的文件内容为 `x: x + 1`，
有如下示例
```nix
import ./foo.nix 4
```
求值，结果为 `5`。

<!-- prettier-ignore -->
:::

### pkgs.lib

[`nixpkgs`](https://github.com/NixOS/nixpkgs) 仓库包含一个名为 [`lib`](https://github.com/NixOS/nixpkgs/blob/master/lib/default.nix) 的属性集，
它提供了大量有用的函数，详见 [Nixpkgs 手册](https://nixos.org/manual/nixpkgs/stable/#sec-functions-library)。

这些函数是基于 Nix 语言实现的，
而不是像 `builtins` 那样本身作为语言的一部分而存在。

这些函数通常通过 `pkgs.lib` 访问，因为 Nixpkgs 的属性集通常约定命名为 `pkgs`。

例如能够将小写转大写的 `pkgs.lib.strings.toUpper` 函数，示例：

```nix
let
  pkgs = import <nixpkgs> {};
in
pkgs.lib.strings.toUpper "Have a good day!"
```
求值，结果如下：
```plain
"HAVE A GOOD DAY!"
```

上面的例子较为复杂，不过到现在你应该熟悉它的各个组成部分了。

名称 `pkgs` 被声明为从路径为 `<nixpkgs>` 的文件 `import` 出来的表达式。
至于 `<nixpkgs>` 的具体值则由环境变量 `$NIX_PATH` 决定。
由于该表达式是一个函数，需要一个参数才能求值，
在这个例子中传入空的属性集 `{}` 就足够了。

现在 `pkgs` 在 `let ... in ...` 的作用域内，其下的属性可以被访问。
据 Nixpkgs 手册可知，
其下存在一个函数 [`lib.strings.toUpper`](https://nixos.org/manual/nixpkgs/stable/#function-library-lib.strings.toUpper)，
作用是小写转大写：
> Converts an ASCII string s to upper-case.

<!-- prettier-ignore -->
:::note 固定 Nixpkgs 的版本
函数 `toUpper` 足够简单，使用不同版本的 Nixpkgs 一般不会有不同的结果，
因此使用 `<nixpkgs>` 也足够了。

然而，更复杂的情况下，要保证完全可重复的例子，
应该像下面这样使用固定（pin）版本的 Nixpkgs：

```nix
let
  nixpkgs = fetchTarball "https://github.com/NixOS/nixpkgs/archive/06278c77b5d162e62df170fec307e83f1812d94b.tar.gz";
  pkgs = import nixpkgs {};
in
pkgs.lib.strings.toUpper "Have a good day!"
```

<!-- prettier-ignore -->
:::

<!-- prettier-ignore -->
:::tip 作为参数的 pkgs 和 lib

`pkgs` 常被作为参数传递给函数。
按约定，可以假设它指的是 Nixpkgs 的属性集，
该属性集有一个 `lib` 属性。

例如，将下面的例子写入 `foo.nix`：
```nix
{ pkgs, ... }:
pkgs.lib.strings.removePrefix "I " "I see you!"
```
在命令行将 `{ pkgs = import <nixpkgs> {}; }` 作为参数，
进行文件求值：
```bash
nix-instantiate --eval foo.nix --arg pkgs 'import <nixpkgs> {}'
```
运行结果如下：
```plain
"see you!"
```

而在 NixOS 配置中以及 Nixpkgs 内部，
你还经常会看到直接传入 `lib` 的情况。
此时可以假设它指的是 Nixpkgs 的属性集下的 `lib`，
也即前面那种情况下的 `pkgs.lib`。

例如，将下面的例子写入 `foo.nix`：
```nix
{ lib, ... }:
lib.strings.removePrefix "I " "I see you!"
```
在命令行将 `{ lib = (import <nixpkgs> {}).lib; }` 作为参数，
进行文件求值：
```bash
nix-instantiate --eval foo.nix --arg lib '(import <nixpkgs> {}).lib'
```
运行结果与前面一例相同。

有时还会同时传入 `pkgs` 和 `lib`，
此时可以假设 `pkgs.lib` 与 `lib` 是等价的。
这样做则是为了通过避免重复使用 `pkgs.lib` 来提高可读性。

示例：
```nix
{ pkgs, lib, ... }:
# ... 多次使用 `pkgs`
# ... 多次使用 `lib`
```

<!-- prettier-ignore -->
:::

<!-- prettier-ignore -->
:::note
出于历史原因，`pkgs.lib` 中的一些函数与同名的 `builtins` 等价。

<!-- prettier-ignore -->
:::
