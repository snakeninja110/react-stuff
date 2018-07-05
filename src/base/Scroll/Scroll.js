/**
 * better-scroll 参数用法请参考官方文档
 * https://ustbhuangyi.github.io/better-scroll/doc/zh-hans/options-advanced.html
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BScroll from 'better-scroll';
import Bubble from '../Bubble/Bubble';
import Loading from '../Loading/Loading';
import { getRect } from '../../common/js/dom';

import './Scroll.styl';

// const COMPONENT_NAME = 'scroll-list';
// const DIRECTION_H = 'horizontal';
const DIRECTION_V = 'vertical';
const DEFAULT_LOAD_TXT_MORE = '加载更多';
const DEFAULT_LOAD_TXT_NO_MORE = '没有更多数据了';
const DEFAULT_REFRESH_TXT = '刷新成功';

export default class Scroll extends Component {
  constructor (props) {
    super(props);
    this.state = {
      bubbleY: 0,
      isPullUpLoad: false,
      beforePullDown: true,
      pulling: false,
      isRebounding: false,
      isPullingDown: false,
      pullUpDirty: true,
      pullDownInitTop: null,
      pullDownStyle: ''
    }
  }

  componentWillMount () {
    this.pullDownInitTop = -50;

    this.moreTxt = (this.props.pullUpLoad && this.props.pullUpLoad.txt && this.props.pullUpLoad.txt.more) || DEFAULT_LOAD_TXT_MORE;

    this.noMoreTxt = (this.props.pullUpLoad && this.props.pullUpLoad.txt && this.props.pullUpLoad.txt.noMore) || DEFAULT_LOAD_TXT_NO_MORE;

    this.refreshTxt = (this.props.pullDownRefresh && this.props.pullDownRefresh.txt) || DEFAULT_REFRESH_TXT;
  }

  componentDidMount () {
    // 初始化完组件视图及其子视图之后调用。
    // BScroll加载必须放在此钩子中否则无法滚动
    setTimeout(() => {
      this._initScroll();
    }, 20);
  }

  componentDidUpdate (prevProps) {
    if (prevProps.data !== this.props.data) {
      setTimeout(() => {
        this.forceUpdate(true)
      }, this.props.refreshDelay)
    }
  }

  componentWillUnmount () {
    this.destroy();
  }

  _initScroll() {
    // 初始化BScroll
    if (!this.wrapper) {
      return;
    }

    // 当数据不足一页时默认scroll组件不会滚动，为了让上拉加载和下拉刷新能正常使用给ul加了min-height
    if (this.listWrapper && (this.props.pullDownRefresh || this.props.pullUpLoad)) {
      this.listWrapper.style.minHeight = `${getRect(this.wrapper).height + 2}px`;
    }

    const options = {
      probeType: this.props.probeType,
      click: this.props.clickable,
      scrollY: true,
      // scrollX: true,
      pullDownRefresh: this.props.pullDownRefresh,
      pullUpLoad: this.props.pullUpLoad,
      scrollbar: this.props.scrollbar
    };

    this.scroll = new BScroll(this.wrapper, options);

    if (this.props.listenScroll) {
      this.scroll.on('scroll', (pos) => {
        this.props.scrollPos(pos);
      });
    }

    if (this.props.pullUpLoad) {
      this._initPullUpLoad();
    }

    if (this.props.pullDownRefresh) {
      this._initPullDownRefresh();
    }

    if (this.props.beforeScroll) {
      this.scroll.on('beforeScrollStart', () => {
        // this.$emit('beforeScroll');
      });
    }
  }

  _initPullUpLoad = () => {
    this.scroll.on('pullingUp', () => {
      // if (!this.state.pullUpDirty) {
      //   return;
      // }
      this.setState({
        isPullUpLoad: true
      })
      this.props.pullingUp();
    });
  }

  _initPullDownRefresh = () => {
    this.scroll.on('pullingDown', () => {
      this.setState({
        beforePullDown: false,
        isPullingDown: true,
        pulling: true
      })
      this.props.pullingDown();
    });

    this.scroll.on('scroll', (pos) => {
      if (this.state.beforePullDown) {
        this.setState({
          bubbleY: Math.max(0, pos.y + this.pullDownInitTop),
          pullDownStyle: `${Math.min(pos.y + this.pullDownInitTop, 10)}px`
        });
      } else {
        this.setState({
          bubbleY: 0
        })
      }

      if (this.state.isRebounding) {
        this.setState({
          pullDownStyle: `${10 - (this.props.pullDownRefresh.stop - pos.y)}px`
        })
      }
    });
  }

  _reboundPullDown = () => {
    const {stopTime = 600} = this.props.pullDownRefresh;
    return new Promise((resolve) => {
      setTimeout(() => {
        this.setState({
          isRebounding: true,
          isPullingDown: false
        })
        this.scroll.finishPullDown();
        resolve();
      }, stopTime);
    });
  }

  // 下拉完成后，bubble回到初始位置并刷新scroll
  _afterPullDown = () => {
    setTimeout(() => {
      this.setState({
        pullDownStyle: `${this.pullDownInitTop}px`,
        beforePullDown: true,
        isRebounding: false
      });
      this.refresh();
    }, this.scroll.options.bounceTime);
  }

  enable = () => { // 开启scroll
    this.scroll && this.scroll.enable();
  }

  disable = () => { // 关闭scroll
    this.scroll && this.scroll.disable();
  }

  refresh = () => { // 刷新scroll
    this.scroll && this.scroll.refresh();
  }

  scrollTo = () => { // 滚动到坐标
    this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments);
  }

  scrollToElement = () => { // 滚动到元素
    this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments);
  }

  destroy = () => { // 销毁
    this.scroll.destroy();
  }

  forceUpdate = (dirty) => {
    if (this.props.pullDownRefresh && this.state.isPullingDown) {
      this.setState({
        pulling: false,
        pullUpDirty: dirty // 这里是否要重置请根据实际项目微调
      })
      this._reboundPullDown().then(() => {
        this._afterPullDown();
      });
    } else if (this.props.pullUpLoad && this.state.isPullUpLoad) {
      this.setState({
        isPullUpLoad: false,
        pullUpDirty: dirty
      });
      this.scroll.finishPullUp();
      this.refresh();
    } else {
      this.refresh();
    }
  }

  render() {
    const { data, children } = this.props;

    let pullupDom = null;
    if (!this.state.isPullUpLoad) {
      pullupDom = (
        <div className="before-trigger">
          <span>{this.state.pullUpDirty ? this.moreTxt : this.noMoreTxt}</span>
        </div>
      )
    } else {
      pullupDom = (
        <div className="after-trigger" >
          <Loading></Loading>
        </div>
      )
    }

    return (
      <div className="scroll-wrapper" ref={(el) => this.wrapper = el}>
        <div className="scroll-content" ref={(el) => this.listWrapper = el}>
          { children }
          { data && data.length > 0 &&
            <div className="pullup-wrapper">
              { pullupDom }
            </div>
          }
        </div>
        <div className="pulldown-wrapper" style={{top: this.state.pullDownStyle}}>
          { this.state.beforePullDown && 
            <div className="before-trigger" >
              <Bubble y={ this.state.bubbleY }></Bubble>
            </div>
          }
          { !this.state.beforePullDown && 
            <div className="after-trigger" >
            { this.state.pulling && 
              <div className="loading" >
                <Loading></Loading>
              </div>
            }
            { !this.state.pulling && 
              <div>
                <span>{ this.refreshTxt }</span>
              </div>
            }
            </div>
          }
        </div>
      </div>
    );
  }
}

Scroll.defaultProps = {
  probeType: 1,
  click: true,
  data: null,
  listenScroll: false,
  derection: DIRECTION_V,
  scrollbar: false,
  pullUpLoad: false,
  pullDownRefresh: false,
  beforeScroll: false,
  startY: 0,
  refreshDelay: 20
}

Scroll.probeTypes = {
  probeType: PropTypes.number,
  click: PropTypes.bool,
  data: PropTypes.array.isRequired,
  listenScroll: PropTypes.bool,
  derection: PropTypes.string,
  scrollbar: PropTypes.bool,
  pullUpLoad: PropTypes.any,
  pullDownRefresh: PropTypes.any,
  beforeScroll: PropTypes.bool,
  startY: PropTypes.number,
  refreshDelay: PropTypes.number
}
