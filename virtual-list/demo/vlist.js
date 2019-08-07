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
*/


const utils = {
  mergeStyle (element, style) {
    for (let i in style) {
      if (element.style[i] !== style[i]) {
        element.style[i] = style[i]
      }
    }
  },
  getMaxBrowserHeight () {
    // Create two elements, the wrapper is `1px` tall and is transparent and
    // positioned at the top of the page. Inside that is an element that gets
    // set to 1 billion pixels. Then reads the max height the browser can
    // calculate.
    const wrapper = document.createElement('div')
    const fixture = document.createElement('div')

    // As said above, these values get set to put the fixture elements into the
    // right visual state.
    HyperList.mergeStyle(wrapper, {position: 'absolute', height: '1px', opacity: 0})
    HyperList.mergeStyle(fixture, {height: '1e7px'})

    // Add the fixture into the wrapper element.
    wrapper.appendChild(fixture)

    // Apply to the page, the values won't kick in unless this is attached.
    document.body.appendChild(wrapper)

    // Get the maximum element height in pixels.
    const maxElementHeight = fixture.offsetHeight

    // Remove the element immediately after reading the value.
    document.body.removeChild(wrapper)

    return maxElementHeight
  }
}

class Vlist {
  constructor(element = window, config = {}){
    const defaultConfig = {
      width: '100%',
      height: '100%'
    }
    this.element = element;
    this.config = Object.assign({}, defaultConfig, config);
    this.maxElementHeight = utils.getMaxBrowserHeight();
  }

  initState() {
    this.scroller = this.scroller || document.createElement('div');
    if(!this.scroller){
      this.element.appendChild(this.scroller);
    }
    const scrollerHeight = this.config.itemHeight * this.config.total;
    utils.mergeStyle(this.element, {
      width: `${this.config.width}`,
      height: `${this.config.width}px`,
      position: 'relative',
    });
    utils.mergeStyle(this.scroller, {
      visibility: 'hidden',
      position: 'absolute',
      width: '1px',
      height: `${scrollerHeight}px`,
      position: 'relative',
    });

  }

  bindEvent() {
    const self = this;
    // 可以使用 requestAnimationFrame 进行节流
    const onScroll = function(event){
      const target = event.target;
      const scrollTop = target.scrollTop;
      if(scrollTop > self.config.triggerDistance){

      }
    }
    this.element.addEventListener('scroll', onScroll, false);
  }

}
