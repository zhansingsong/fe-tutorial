/**
 * 1. 提供指定 scroll-container 的 height，作为优化配置项。减少每次的重新计算的消耗
 * 2. 为了确保在滚动时，准备好显示内容。需要基于 Frame 来检测。
 *    - window.requestAnimationFrame()
 *    - window.cancelAnimationFrame()
 *    上述检测方式，对大数据量及计算量大的情景不是很友好。还是需要scroll+requestAnimationFrame+setTimeout方式是最佳
 *    检测条件
 *    - 初始化
 *    - 向上滚动
 *    - 向下滚动距离大于平均一个item height
 * 3. 刷新逻辑
 *    - 合并 config
 *    - 验证 config
 *    - 挂载 element
 *    - 设置 element 样式
 *    - 设置滚动容器的样式
 * 4. 渲染逻辑
 *
 *
 * 映射关系
 * data ---> itemsHeights ---> itemsPositions
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
    const defaultConfig = {
      // width: '100%',
      // height: '100%',
    };
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
    this.currentTotal = -1;
    this.pending = false;
    this.initState();
  }

  initState() {
    this.scroller = this.scroller || document.createElement('div');
    this.element.appendChild(this.scroller);
    this.bindEvent();
    // utils.mergeStyle(this.element, {
    //   width: `${this.config.width}`,
    //   height: `${this.config.height}`,
    //   position: 'relative',
    // });

    // const scrollerHeight = this.config.itemHeight * this.config.total;
  }
  getFrom(scrollTop) {
    let i = 0;
    while (this.itemsPositions[i] < scrollTop) {
      i++;
    }
    return i;
  }
  renderChunk(scrollTop) {
    const total = this.currentTotal + 1;
    let from = this.getFrom(scrollTop) - 1;
    if (from < 0 || from - this.screenItemsLen < 0) {
      from = 0;
    }
    this.lastFrom = from;
    let to = from + this.cachedItemsLen;
    if (to > total || to + this.cachedItemsLen > total) {
      to = total;
    }
    const fragment = document.createDocumentFragment();
    // for (let i = from; i < to; i++) {
    //   let item = getItem(i);
    //   fragment.appendChild(item);
    // }
    const tempItems = this.cacheItems.slice(from, to);
    tempItems.forEach((itemEl) => {
      fragment.appendChild(itemEl);
    })
    // fragment.appendChild.apply(fragment, this.cacheItems.slice(from, to));
    this.scroller.innerHTML = '';
    this.scroller.appendChild(fragment);
  }

  update(data) {
    data.forEach(itemData => {
      this.getItem(itemData, ++this.currentTotal);
    });
    this.computeScrollHeight();
    this.renderChunk(this.element.scrollTop);
  }

  getItem(itemData, i) {
    if (this.cacheItems[i]) {
      return this.cacheItems[i];
    }
    let item = this.config.generateItem(itemData, i);
    this.itemsHeights[i] = item.height;
    if (i > 0) {
      this.itemsPositions[i] =
        this.itemsHeights[i - 1] + this.itemsPositions[i - 1];
    }

    const top = this.itemsPositions[i];

    utils.mergeStyle(item.el, {
      position: 'absolute',
      top: `${top}px`,
    });
    this.cacheItems.push(item.el);
    return item.el;
  }

  computeScrollHeight() {
    const scrollHeight = this.itemsHeights.reduce((a, b) => a + b, 0);
    const averageHeight = Math.floor(scrollHeight / (this.currentTotal + 1));
    const screenItemsLen = Math.ceil(this.containerHeight / averageHeight);
    this.averageHeight = averageHeight;
    this.screenItemsLen = screenItemsLen;
    this.scrollHeight = scrollHeight;
    this.cachedItemsLen = Math.floor(
      Math.max(this.cachedItemsLen || 0, screenItemsLen * 2)
    );

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
      if (self.pending) {
        return;
      }
      console.log('vvvvv12');
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
      console.log('vvvvv1');
      if (scrollTop === self.lastRepaint) {
        return;
      }
      console.log('vvvvv');
      const diff = self.lastRepaint ? scrollTop - self.lastRepaint : 0;
      if (!self.lastRepaint || diff < 0 || diff > self.averageHeight) {
        self.renderChunk(scrollTop);
        self.lastRepaint = scrollTop;
      }
    };
    this.element.onscroll = onScroll;
    // this.element.addEventListener('scroll', onScroll, false);
    // 初始化
    onScroll();
  }
}
