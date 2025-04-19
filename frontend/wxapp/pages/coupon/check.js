Page({
  data: {
    productList: [{ key: 0, name: '', code: '' }],
  },
  onLoad(options) {
    const { id } = options;
    if (id) {
      //
    }
  },
  handleAddProduct() {
    const { productList } = this.data;
    productList.push({ key: productList.length, name: '', code: '' });
    this.setData({ productList });
  },
  handleMinusProduct(e) {
    const { key } = e.currentTarget.dataset;
    const { productList } = this.data;
    productList.splice(key, 1);
    this.setData({ productList });
  },
  handlePass() {},
  handleReject() {},
});
