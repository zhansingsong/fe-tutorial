/**
 * * 映射关系
 *  data ---> itemsHeights ---> itemsPositions
 *
 */

const utils = {
  mergeStyle(element, style) {
    for (let i in style) {
      if (element.style[i] !== style[i]) {
        element.style[i] = style[i];
      }
    }
  },
  getUrl(url, callback) {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        callback(JSON.parse(xhr.responseText));
      }
    };
    xhr.open('GET', url, true);
    xhr.send();
  },
  getMaxBrowserHeight() {
    // Create two elements, the wrapper is `1px` tall and is transparent and
    // positioned at the top of the page. Inside that is an element that gets
    // set to 1 billion pixels. Then reads the max height the browser can
    // calculate.
    const wrapper = document.createElement('div');
    const fixture = document.createElement('div');

    // As said above, these values get set to put the fixture elements into the
    // right visual state.
    this.mergeStyle(wrapper, {
      position: 'absolute',
      height: '1px',
      opacity: 0,
    });
    this.mergeStyle(fixture, {height: '1e7px'});

    // Add the fixture into the wrapper element.
    wrapper.appendChild(fixture);

    // Apply to the page, the values won't kick in unless this is attached.
    document.body.appendChild(wrapper);

    // Get the maximum element height in pixels.
    const maxElementHeight = fixture.offsetHeight;

    // Remove the element immediately after reading the value.
    document.body.removeChild(wrapper);

    return maxElementHeight;
  },
};

class VList {
  constructor(element = window, url, config = {}) {
    // 默认配置
    const defaultConfig = {};
    // 请求URL
    this.url = url;
    // 页面中容器
    this.element = element;
    // 配置项
    this.config = Object.assign({}, defaultConfig, config);
    // 最大高
    this.maxElementHeight = utils.getMaxBrowserHeight();
    // 容器的高
    this.containerHeight = element.clientHeight;
    // 上一次重绘scrollTop
    this.lastRepaint = 0;
    // 每个item的position
    this.itemsPositions = [0];
    // 缓存item的长度
    this.cachedItemsLen = undefined;
    // 每个item的平均高
    this.averageHeight = undefined;
    // 每个item对应的高
    this.itemsHeights = [];
    // 已有的items
    this.cacheItems = [];
    // 当前总数
    this.currentTotal = 0;
    // 当前的Index
    this.currentIndex = -1;
    // 请求标识
    this.pending = false;
    // 初始化状态
    this.initState();
  }

  initState() {
    // 滚动容器
    this.scroller = document.createElement('div');
    this.element.appendChild(this.scroller);
    // 绑定事件
    this.bindEvent();
  }
  // 查找起始点
  getFrom(scrollTop) {
    let i = 0;
    while (this.itemsPositions[i] < scrollTop) {
      i++;
    }
    return i;
  }
  // 渲染chunk
  renderChunk(scrollTop) {
    // total
    const total = this.currentIndex;
    let from = this.getFrom(scrollTop) - 1;
    // 小于 0 或不够一屏都置为 0
    if (from < 0 || from - this.screenItemsLen < 0) {
      from = 0;
    }
    // 缓存上次起始点
    this.lastFrom = from;
    // 计算结束点
    let to = from + this.cachedItemsLen;
    // 大于 total 或 不够最后一屏都置为 total
    if (to > total || to + this.cachedItemsLen > total) {
      to = total;
    }
    // fragment
    const fragment = document.createDocumentFragment();
    // 获取当前 items
    const currentItems = this.cacheItems.slice(from, to);
    currentItems.forEach((itemEl) => {
      fragment.appendChild(itemEl);
    });
    // 填充 fragment
    this.scroller.innerHTML = '';
    this.scroller.appendChild(fragment);
  }
  // 更新
  update(data) {
    // 填充新数据
    data.forEach(itemData => {
      this.getItem(itemData, ++this.currentIndex);
    });
    // 更新 currentTotal
    this.currentTotal = this.currentIndex + 1;
    console.log('总条数：', this.currentTotal);
    this.computeScrollHeight();
    this.renderChunk(this.element.scrollTop);
  }

  getItem(itemData, i) {
    // 优先从缓存获取
    if (this.cacheItems[i]) {
      return this.cacheItems[i];
    }
    // 生成对应item
    let item = this.config.generateItem(itemData, i);
    // 缓存itemsHeights
    this.itemsHeights[i] = item.height;
    // 第一个不用计算，默认为 0
    if (i > 0) {
      this.itemsPositions[i] =
        this.itemsHeights[i - 1] + this.itemsPositions[i - 1];
    }
    // 增加定位样式
    utils.mergeStyle(item.el, {
      position: 'absolute',
      top: `${this.itemsPositions[i]}px`,
    });
    // 更新 cacheItems
    this.cacheItems.push(item.el);
  }

  computeScrollHeight() {
    // 计算总高度
    const scrollHeight = this.itemsHeights.reduce((a, b) => a + b, 0);
    // 计算平均高度
    const averageHeight = Math.floor(scrollHeight / this.currentTotal);
    // 计算一屏的个数
    const screenItemsLen = Math.ceil(this.containerHeight / averageHeight);
    this.averageHeight = averageHeight;
    this.screenItemsLen = screenItemsLen;
    this.scrollHeight = scrollHeight;
    // 每次缓存的个数
    this.cachedItemsLen = Math.floor(
      Math.max(this.cachedItemsLen || 0, screenItemsLen * 2)
    );
    // 更新滚动容器样式
    utils.mergeStyle(this.scroller, {
      position: 'absolute',
      height: `${scrollHeight}px`,
      width: '100%',
    });
  }

  bindEvent() {
    const self = this;
    // 可以使用 requestAnimationFrame 进行节流
    const onScroll = function(event) {
      const scrollTop = self.element.scrollTop;
      // 控制请求
      if (self.pending) {
        return;
      }
      // 第一次 或 触发距离
      if (
        !self.lastRepaint ||
        self.scrollHeight - scrollTop - self.containerHeight <=
          self.config.triggerDistance
      ) {
        self.pending = true;
        utils.getUrl(self.url, function(data) {
          self.update(data.data);
          self.pending = false;
        });
      }
      if (scrollTop === self.lastRepaint) {
        return;
      }
      const diff = self.lastRepaint ? scrollTop - self.lastRepaint : 0;
      if (!self.lastRepaint || diff < 0 || diff > self.averageHeight) {
        self.renderChunk(scrollTop);
        self.lastRepaint = scrollTop;
      }
    };
    this.element.addEventListener('scroll', onScroll, false);
    // 初始化
    onScroll();
  }
}
