# SVG 之 viewBox(一个演示让你轻松了解viewBox如何工作)

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

## viewBox

**视盒**，即 SVG 的可视范围。当不设定 `viewBox` 时，`viewBox` 等于 `viewport`。 当设定地 `viewBox` 时，SVG 会把 `viewBox` 设定区域缩放到 `viewport` 的大小。即 `viewBox`可以用于控制 SVG 内容如何显示。不是很好理解，来个演示：

![viewBox](./imgs/vb.gif)

🌴 [演示实例链接](http://htmlpreview.github.io/?https://github.com/zhansingsong/fe-tutorials/blob/master/svg%E4%B9%8BviewBox/demo/vb.html) 🌴

上述演示实例 `viewBox` 的宽高比刚好与 `viewport` 的一致。如果不一致会怎样呢？
