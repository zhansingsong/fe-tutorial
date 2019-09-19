# 一个演示让你轻松了解 viewBox 如何工作


[演示链接](http://htmlpreview.github.io/?https://github.com/zhansingsong/fe-tutorials/blob/master/svg%E4%B9%8BviewBox/demo/vb_diff.html)

## viewport

SVG 元素都有个 viewport，即视图窗口。viewport 的大小由 SVG 元素的大小决定。

```html
<!-- 默认单位 px -->
<svg width="200" height="200">
  <!-- 其它 svg 元素 -->
</svg>
```
如上 SVG 元素的 viewport 为 `200 * 200`。

## viewBox(min-x, min-y, width, height)

**视盒**，即 SVG 的可视范围。当不设定 `viewBox` 时，`viewBox` 等于 `viewport`。 当设定地 `viewBox` 时，SVG 会把 `viewBox` 设定区域缩放到 `viewport` 的大小。即 `viewBox`可以用于控制 SVG 内容如何显示。不是很好理解，来个演示：

![viewBox](./imgs/vb.gif)

🌴 [演示实例链接](http://htmlpreview.github.io/?https://github.com/zhansingsong/fe-tutorials/blob/master/svg%E4%B9%8BviewBox/demo/vb.html) 🌴

上述演示实例 `viewBox` 的宽高比刚好与 `viewport` 的一致。如果比例不一致会怎样呢？在比例不一致的情况需要解决两个问题：

- viewBox 如何与 viewport 对齐
- viewBox 如何缩放

## preserveAspectRatio(align, meetOrSlice)

preserveAspectRatio 维持 `viewBox` 宽高比。

如果 `preserveAspectRatio: none` 则 `viewBox` 会被强制以`viewport` 的宽高比进行缩放。


要解决上述的两个问题，需要使用与viewBox密切相关属性 preserveAspectRatio。用于控制viewBox如何对齐及缩放。

### align

preserveAspectRatio提供的9种对齐模式：

xMinYMin、xMidYMin、xMaxYMin、xMinYMid、xMidYMid、xMaxYMid、xMinYMax、xMidYMax、xMaxYMax

如何对齐？

### meetOrSlice

在比例一致情况下，无论是按照宽或高比例缩放都一样。而如果比例一致，如何决定viewBox以哪个为准。这就是`meetOrSlice`的作用了。
提供了两个值

- meet: 以大比例为准。即如何最快的地让viewBox的宽或高与viewport的相等。类似于 `background-size: contain`
- slice：以小比例为准。即viewBox需要覆盖整个viewport。所以需要以小比例为准。类似于  dd`background-size: cover`


