export default class ItemsService {

  constructor() { 
    this.count = 12;
    // this.list = [];
    this.itemIndex = 0
  }

  /**
   * 假装自己是数据接口
   * 模拟接口
   */
  getItems(type) {
    this.itemIndex = 0;
    let list = [];
    return new Promise((resolve) => {
      setTimeout(() => {
        for (let i = 0; i < this.count; i++) {
          list.push(`${type} line ${++this.itemIndex}`);
        }
        resolve(list);
      }, 1000);
    });
  }

  /**
   * 模拟获取新数据
   */
  getMoreItems(type) {
    let newPage = [];
    return new Promise((resolve) => {
      setTimeout(() => {
        for (let i = 0; i < 5; i++) {
          newPage.push(`new ${type} ${++this.itemIndex}`);
        }
        resolve(newPage);
      }, 1000);
    });
  }
}