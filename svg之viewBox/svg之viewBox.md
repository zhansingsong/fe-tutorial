# svg 之 viewBox

## viewport

svg元素都有个 viewport，即视图窗口。viewport 的大小由 svg 元素的大小决定。

```html
<!-- 默认单位 px -->
<svg width="200" height="200">
  <!-- 其它 svg 元素 -->
</svg>
```
如上 svg 元素的 viewport 为 `200 * 200`。

## viewBox

一个用于控制 SVG viewport 如何显示的属性

为什么需要 viewBox ？