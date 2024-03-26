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

为了书写简便， [RFC 2396](https://www.ietf.org/rfc/rfc2396.txt) 规定了对于 URI 可以不使用引号闭合：

```nix
UriWithoutQuotes = http://example.org/foo.tar.bz2
UriWithQuotes = "http://example.org/foo.tar.bz2"
```

两者是等价的。

#### 数字

数字被分为浮点型（比如 `.114514`）与整型（比如 `2233`）。

数字是类型兼容的：纯整数运算总是返回整数，而任何涉及至少一个浮点数的运算都会返回一个浮点数。

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

属性名可以是标识符或字符串。标识符必须以字母或下划线开头，可以包含字母、数字、下划线、撇号（`'`）或连接符（`-`）。

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

在特殊情况下，如果集合声明中的属性名求值为 null（这是错误的，因为 null 不能被强制为字符串），那么该属性将不会被添加到集合中：

```nix
{ ${if foo then "bar" else null} = true; }
```

如果 foo 的值为 `false`，则其值为 `{}`。

如果一个集合的 `__functor` 属性的值是可调用的（即它本身是一个函数或是其中一个集合的 `__functor` 属性的值是可调用的），那么它就可以像函数一样被应用，首先传入的是集合本身，例如：

```nix
let add = { __functor = self: x: x + self.x; };
    inc = add // { x = 1; };
in inc 1
```

求值为 2。这可用于为函数附加元数据，而调用者无需对其进行特殊处理，也可用于实现面向对象编程等形式。

## 数据构造

### 递归属性集

### `let` 绑定

### 继承至属性

### 函数

### 条件判断

### 断言

### `with` 表达式

### 注释
