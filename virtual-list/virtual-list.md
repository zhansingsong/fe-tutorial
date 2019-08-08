# virtual list

第一次了解这项技术是通过 [react-virtualized](https://bvaughn.github.io/react-virtualized/) 组件。当时就大概了解了一下，没有深入研究。近期刚好有时间折腾了一下，想将其技术对现有项目进行优化，就对其技术研究了一番。有点收获，就整理一了一下，与大家分享分享。
> singsong: react-virtualized 的作者已对 react-virtualized 进行重写。并重新构建新为 [react-window](https://github.com/bvaughn/react-window)。

## 背景

该技术算是对无限滚动加载的一种优化。无限滚动加载随着加载数量的增多，对性能的影响就越来越大。因为每次浏览器需要重绘的 DOM 节点数越来越多，耗时越长。这对用户体验造成的影响也是不容忽略的。为了减少 DOM 节点数量，virtual list 技术应运而生。


## 参考文章

- [https://jsfiddle.net/jpeter06/ao464o8g/](https://jsfiddle.net/jpeter06/ao464o8g/)
- [https://sergimansilla.com/blog/virtual-scrolling/](https://sergimansilla.com/blog/virtual-scrolling/)
