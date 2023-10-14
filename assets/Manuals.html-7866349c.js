import{_ as i}from"./plugin-vue_export-helper-c27b6911.js";import{r as t,o,c as p,a,b as n,d as c,e as s}from"./app-d2084399.js";const d={},l=s(`<h1 id="语言手册" tabindex="-1"><a class="header-anchor" href="#语言手册" aria-hidden="true">#</a> 语言手册</h1><h2 id="数据类型" tabindex="-1"><a class="header-anchor" href="#数据类型" aria-hidden="true">#</a> 数据类型</h2><h3 id="原始数据类型" tabindex="-1"><a class="header-anchor" href="#原始数据类型" aria-hidden="true">#</a> 原始数据类型</h3><h4 id="字符串" tabindex="-1"><a class="header-anchor" href="#字符串" aria-hidden="true">#</a> 字符串</h4><p>有三种方式定义字符串。</p><h5 id="单行字符串" tabindex="-1"><a class="header-anchor" href="#单行字符串" aria-hidden="true">#</a> 单行字符串</h5><p>与大多数编程语言的字符串一致，使用双引号闭合：</p><div class="language-nix line-numbers-mode" data-ext="nix"><pre class="language-nix"><code><span class="token string">&quot;Hello, nix!\\n&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h5 id="多行字符串" tabindex="-1"><a class="header-anchor" href="#多行字符串" aria-hidden="true">#</a> 多行字符串</h5><p>多行字符串是通过<mark>两个单引号</mark>闭合的。</p><div class="language-nix line-numbers-mode" data-ext="nix"><pre class="language-nix"><code><span class="token string">&#39;&#39;
This is the first line.
This is the second line.
This is the third line.
&#39;&#39;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>多行字符串往往会带有不同程度的缩进，会被一步处理。也就是说对于以下字符串：</p><div class="language-nix line-numbers-mode" data-ext="nix"><pre class="language-nix"><code><span class="token string">&#39;&#39;
  This is the first line.
  This is the second line.
    This is the third line.
&#39;&#39;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>会被“智能缩进”处理，处理后的结果是：</p><div class="language-nix line-numbers-mode" data-ext="nix"><pre class="language-nix"><code><span class="token string">&#39;&#39;
This is the first line.
This is the second line.
  This is the third line.
&#39;&#39;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>每一行都被前移了最小缩进数个字符。</p><p>同时，假如第一行被占空了，也会对其进行处理：</p><div class="language-nix line-numbers-mode" data-ext="nix"><pre class="language-nix"><code><span class="token string">&#39;&#39;

There&#39;s a row of spaces up there.
&#39;&#39;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>处理后的数据是：</p><div class="language-nix line-numbers-mode" data-ext="nix"><pre class="language-nix"><code><span class="token string">&#39;&#39;
There&#39;s a row of spaces up there.
&#39;&#39;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>Nix 只会将自动处理后的字符串当作输入，而不是原始字符串（raw string）。</p><h5 id="uri" tabindex="-1"><a class="header-anchor" href="#uri" aria-hidden="true">#</a> URI</h5>`,22),r={href:"https://www.ietf.org/rfc/rfc2396.txt",target:"_blank",rel:"noopener noreferrer"},u=s(`<div class="language-nix line-numbers-mode" data-ext="nix"><pre class="language-nix"><code>UriWithoutQuotes <span class="token operator">=</span> <span class="token url">http://example.org/foo.tar.bz2</span>
UriWithQuotes <span class="token operator">=</span> <span class="token string">&quot;http://example.org/foo.tar.bz2&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p>两者是等价的。</p><h4 id="数字" tabindex="-1"><a class="header-anchor" href="#数字" aria-hidden="true">#</a> 数字</h4><p>数字被分为浮点型（比如 <code>.114514</code>）与整型（比如 <code>2233</code>）。</p><p>数字是类型兼容的：纯整数运算总是返回整数，而任何涉及至少一个浮点数的运算都会返回一个浮点数。</p><h4 id="路径" tabindex="-1"><a class="header-anchor" href="#路径" aria-hidden="true">#</a> 路径</h4><p>路径至少需要包含一个斜杠才能被识别为路径：</p><div class="language-nix line-numbers-mode" data-ext="nix"><pre class="language-nix"><code>/f<span class="token url">oo/bar/bla.nix</span>
<span class="token url">~/foo/bar.nix</span>
<span class="token url">../foo/bar/qux.nix</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>除了某些尖括号路径（比如 <code>&lt;nixpkgs&gt;</code>）外，其他路径都支持字符串插值。</p><p>&quot;\${./foo.txt}“</p><h4 id="布尔" tabindex="-1"><a class="header-anchor" href="#布尔" aria-hidden="true">#</a> 布尔</h4><p><code>true</code> 或 <code>false</code>。</p><h4 id="空" tabindex="-1"><a class="header-anchor" href="#空" aria-hidden="true">#</a> 空</h4><p>字面意思上的 <code>null</code>。</p><h3 id="列表" tabindex="-1"><a class="header-anchor" href="#列表" aria-hidden="true">#</a> 列表</h3><p>列表使用中括号闭合，空格分隔元素，一个列表允许包含不同类型的值：</p><div class="language-nix line-numbers-mode" data-ext="nix"><pre class="language-nix"><code><span class="token punctuation">[</span> <span class="token number">123</span> <span class="token url">./foo.nix</span> <span class="token string">&quot;abc&quot;</span> <span class="token punctuation">(</span>f <span class="token punctuation">{</span> x <span class="token operator">=</span> y<span class="token punctuation">;</span> <span class="token punctuation">}</span><span class="token punctuation">)</span> <span class="token punctuation">]</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>此处如果不给 <code>f { x = y; }</code> 打上括号，就会把函数也当作此列表的值。</p><h3 id="属性集" tabindex="-1"><a class="header-anchor" href="#属性集" aria-hidden="true">#</a> 属性集</h3><p>属性集是用大括号（{ }）括起来的名称-值对（称为属性）的集合。</p><p>属性名可以是标识符或字符串。标识符必须以字母（a-z、A-Z）或下划线（_）开头，也可以包含字母（a-z、A-Z）、数字（0-9）、下划线（_）、撇号（&#39;）或破折号（-）。</p><p>名称和值之间用等号 (=) 分隔。每个值都是一个任意表达式，以分号 (😉 结尾。</p><div class="language-nix line-numbers-mode" data-ext="nix"><pre class="language-nix"><code><span class="token punctuation">{</span>
  x <span class="token operator">=</span> <span class="token number">123</span><span class="token punctuation">;</span>
  text <span class="token operator">=</span> <span class="token string">&quot;Hello&quot;</span><span class="token punctuation">;</span>
  y <span class="token operator">=</span> f <span class="token punctuation">{</span> bla <span class="token operator">=</span> <span class="token number">456</span><span class="token punctuation">;</span> <span class="token punctuation">}</span><span class="token punctuation">;</span>
<span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>我们使用 <code>.</code> 访问各个属性：</p><div class="language-nix line-numbers-mode" data-ext="nix"><pre class="language-nix"><code><span class="token punctuation">{</span> a <span class="token operator">=</span> <span class="token string">&quot;Foo&quot;</span><span class="token punctuation">;</span> b <span class="token operator">=</span> <span class="token string">&quot;Bar&quot;</span><span class="token punctuation">;</span> <span class="token punctuation">}</span><span class="token punctuation">.</span>a
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>使用 <code>or</code> 关键字，可以在属性选择中提供默认值：</p><div class="language-nix line-numbers-mode" data-ext="nix"><pre class="language-nix"><code><span class="token punctuation">{</span> a <span class="token operator">=</span> <span class="token string">&quot;Foo&quot;</span><span class="token punctuation">;</span> b <span class="token operator">=</span> <span class="token string">&quot;Bar&quot;</span><span class="token punctuation">;</span> <span class="token punctuation">}</span><span class="token punctuation">.</span>c <span class="token keyword">or</span> <span class="token string">&quot;Xyzzy&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>因为属性 <code>c</code> 不在属性集里，故输出默认值。</p><p>也可以用字符串去访问属性：</p><div class="language-nix line-numbers-mode" data-ext="nix"><pre class="language-nix"><code><span class="token punctuation">{</span> <span class="token string">&quot;$!@#?&quot;</span> <span class="token operator">=</span> <span class="token number">123</span><span class="token punctuation">;</span> <span class="token punctuation">}</span><span class="token punctuation">.</span><span class="token string">&quot;$!@#?&quot;</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>属性名支持字符串插值：</p><div class="language-nix line-numbers-mode" data-ext="nix"><pre class="language-nix"><code><span class="token keyword">let</span> bar <span class="token operator">=</span> <span class="token string">&quot;foo&quot;</span><span class="token punctuation">;</span> <span class="token keyword">in</span>
<span class="token punctuation">{</span> foo <span class="token operator">=</span> <span class="token number">123</span><span class="token punctuation">;</span> <span class="token punctuation">}</span><span class="token punctuation">.</span><span class="token antiquotation important">$</span><span class="token punctuation">{</span>bar<span class="token punctuation">}</span>
<span class="token keyword">let</span> bar <span class="token operator">=</span> <span class="token string">&quot;foo&quot;</span><span class="token punctuation">;</span> <span class="token keyword">in</span>
<span class="token punctuation">{</span> <span class="token antiquotation important">$</span><span class="token punctuation">{</span>bar<span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token number">123</span><span class="token punctuation">;</span> <span class="token punctuation">}</span><span class="token punctuation">.</span>foo
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>两者的值都是 123。</p><p>在特殊情况下，如果集合声明中的属性名求值为 null（这是错误的，因为 null 不能被强制为字符串），那么该属性将不会被添加到集合中：</p><div class="language-nix line-numbers-mode" data-ext="nix"><pre class="language-nix"><code><span class="token punctuation">{</span> <span class="token antiquotation important">$</span><span class="token punctuation">{</span><span class="token keyword">if</span> foo <span class="token keyword">then</span> <span class="token string">&quot;bar&quot;</span> <span class="token keyword">else</span> <span class="token keyword">null</span><span class="token punctuation">}</span> <span class="token operator">=</span> <span class="token boolean">true</span><span class="token punctuation">;</span> <span class="token punctuation">}</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>如果 foo 的值为 <code>false</code>，则其值为 <code>{}</code>。</p><p>如果一个集合的 <code>__functor</code> 属性的值是可调用的（即它本身是一个函数或是其中一个集合的 <code>__functor</code> 属性的值是可调用的），那么它就可以像函数一样被应用，首先传入的是集合本身，例如：</p><div class="language-nix line-numbers-mode" data-ext="nix"><pre class="language-nix"><code><span class="token keyword">let</span> <span class="token function">add</span> <span class="token operator">=</span> <span class="token punctuation">{</span> __functor <span class="token operator">=</span> self<span class="token punctuation">:</span> x<span class="token punctuation">:</span> x <span class="token operator">+</span> self<span class="token punctuation">.</span>x<span class="token punctuation">;</span> <span class="token punctuation">}</span><span class="token punctuation">;</span>
    inc <span class="token operator">=</span> <span class="token function">add</span> <span class="token operator">//</span> <span class="token punctuation">{</span> x <span class="token operator">=</span> <span class="token number">1</span><span class="token punctuation">;</span> <span class="token punctuation">}</span><span class="token punctuation">;</span>
<span class="token keyword">in</span> inc <span class="token number">1</span>
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>求值为 2。这可用于为函数附加元数据，而调用者无需对其进行特殊处理，也可用于实现面向对象编程等形式。</p><h2 id="数据构造" tabindex="-1"><a class="header-anchor" href="#数据构造" aria-hidden="true">#</a> 数据构造</h2><h3 id="递归属性集" tabindex="-1"><a class="header-anchor" href="#递归属性集" aria-hidden="true">#</a> 递归属性集</h3><h3 id="let-绑定" tabindex="-1"><a class="header-anchor" href="#let-绑定" aria-hidden="true">#</a> <code>let</code> 绑定</h3><h3 id="继承至属性" tabindex="-1"><a class="header-anchor" href="#继承至属性" aria-hidden="true">#</a> 继承至属性</h3><h3 id="函数" tabindex="-1"><a class="header-anchor" href="#函数" aria-hidden="true">#</a> 函数</h3><h3 id="条件判断" tabindex="-1"><a class="header-anchor" href="#条件判断" aria-hidden="true">#</a> 条件判断</h3><h3 id="断言" tabindex="-1"><a class="header-anchor" href="#断言" aria-hidden="true">#</a> 断言</h3><h3 id="with-表达式" tabindex="-1"><a class="header-anchor" href="#with-表达式" aria-hidden="true">#</a> <code>with</code> 表达式</h3><h3 id="注释" tabindex="-1"><a class="header-anchor" href="#注释" aria-hidden="true">#</a> 注释</h3>`,48);function h(v,k){const e=t("ExternalLinkIcon");return o(),p("div",null,[l,a("p",null,[n("为了书写简便， "),a("a",r,[n("RFC 2396"),c(e)]),n(" 规定了对于 URI 可以不使用引号闭合：")]),u])}const x=i(d,[["render",h],["__file","Manuals.html.vue"]]);export{x as default};
