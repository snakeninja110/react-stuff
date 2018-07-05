import React, { Component } from 'react';
import Scroll from '../../base/Scroll/Scroll';
import ItemsService from '../../service/items';

import './List.styl';

const items = new ItemsService();

export default class List extends Component {
  constructor (props) {
    super(props);
    this.state = {
      list: [],
      type: 'tab1',
      probeType: 3,
      clickable: true,
      noMoreData: false,

      // infinite Scroll
      pullUpLoad: true,
      pullUpLoadThreshold: 0,
      pullUpLoadMoreTxt: '加载更多',
      pullUpLoadNoMoreTxt: '没有数据了',

      // pullDown Refresh
      pullDownRefresh: true,
      pullDownRefreshThreshold: 90,
      pullDownRefreshStop: 40
    };
  }

  scrollPos = (pos) => {
    console.log(pos);
  }

  // 上拉回调
  onPullingUp = () => {
    if (this.state.noMoreData) { // 没有更多数据可以在这里判断，我在Scroll组件里也同样做了判断
      this._setNoMore();
      return;
    }
    console.log('pulling up and load data');

    if (Math.random() > 0.5) {
      // 有新数据
      items.getMoreItems(this.state.type).then(newList => {
        this.setState(prev => ({
          list: [...prev.list, ...newList]
        }));
      })
    } else {
      this.setState({
        noMoreData: true
      });
      this.scroll.forceUpdate(false);
    }
  }

  // 下拉回调
  onPullingDown = async () => {
    console.log('pulling down and Refresh');
    // setTimeout(() => {
    //   if (Math.random() > 0.5) {
    //     // 如果有新数据
    //     // this.list.unshift(`new message ${+new Date()}`);
    //     this.setState(prev => ({
    //       list: [`new message ${+new Date()}`, ...prev.list]
    //     }))
    //   }
    //   this.scroll.forceUpdate(false);
    // }, 1000);
    this.setState({
      // list: [],
      noMoreData: false
    });
    await this.fetchData(this.state.type);
    this.scroll.forceUpdate(false);
  }

  _setNoMore = () => {
    this.scroll.forceUpdate();
  }

  // 模拟获取数据
  fetchData = async (type) => {
    const list = await items.getItems(type);
    this.setState({
      list: list
    });
  }

  componentWillMount () {
    this.pullDownRefreshObj = this.state.pullDownRefresh ? {
      threshold: this.state.pullDownRefreshThreshold,
      stop: this.state.pullDownRefreshStop
    } : false;

    this.pullUpLoadObj = this.state.pullUpLoad ? {
      threshold: this.state.pullUpLoadThreshold,
      txt: {more: this.state.pullUpLoadMoreTxt, noMore: this.state.pullUpLoadNoMoreTxt}
    } : false;
  }

  componentDidMount () {
    this.fetchData(this.state.type); // 获取初始列表
  }

  render() {
    const list = this.state.list;
    return (
      <div className="list-wrapper">
        <Scroll
          ref={(el) => this.scroll = el}
          data={this.state.list}
          probeType={this.state.probeType}
          clickable={this.state.clickable}
          pullUpLoad={this.pullUpLoadObj}
          pullDownRefresh={this.pullDownRefreshObj}
          pullingUp={this.onPullingUp}
          pullingDown={this.onPullingDown}
          scrollPos={this.scrollPos}>
          <ul className="list-content">
            {
              list.map(item =>
                <li key={item} className="list-item">{ item }</li>
              )
            }
          </ul>
        </Scroll>
      </div>
    );
  }
}