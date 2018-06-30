export default class ItemsService {

  constructor() { 
    this.count = 12;
    this.list = [];
    this.itemIndex = 0
  }

  /**
   * 假装自己是数据接口
   */

  getItems() {
    for (let i = 0; i < this.count; i++) {
      this.list.push(`line ${++this.itemIndex}`);
    }
    return this.list;
  }

  getMoreItems() {
    let newPage = [];
    for (let i = 0; i < 5; i++) {
      newPage.push(`new Line ${++this.itemIndex}`);
    }
    return newPage;
  }
}