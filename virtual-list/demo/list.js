/**
 * * 映射关系
 *  data ---> itemsHeights ---> itemsPositions
 *
 */

const utils = {
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
};

class List {
  constructor(element = window, url, config = {}) {
    // 默认配置
    const defaultConfig = {};
    // 请求URL
    this.url = url;
    // 页面中容器
    this.element = element;
    // 配置项
    this.config = Object.assign({}, defaultConfig, config);
    // 容器的高
    this.containerHeight = element.clientHeight;
    // 已有的items
    this.cacheItems = [];
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

  // 更新
  update(data) {
    // 填充新数据
    data.forEach((itemData, i) => {
      this.cacheItems.push(this.config.generateItem(itemData, i))
    });
    // fragment
    const fragment = document.createDocumentFragment();
    this.cacheItems.forEach((itemEl) => {
      fragment.appendChild(itemEl);
    });
    // 填充 fragment
    this.scroller.appendChild(fragment);
  }

  bindEvent() {
    const self = this;
    // 可以使用 requestAnimationFrame 进行节流
    const onScroll = function(init) {
      const scrollTop = self.element.scrollTop;
      // 控制请求
      if (self.pending) {
        return;
      }
      // 第一次 或 触发距离
      if (init || self.scrollHeight - scrollTop - self.containerHeight <=
          self.config.triggerDistance
      ) {
        self.pending = true;
        utils.getUrl(self.url, function(data) {
          self.update(data.data);
          self.pending = false;
        });
      }

    };
    this.element.addEventListener('scroll', onScroll, false);
    // 初始化
    onScroll(true);
  }
}
