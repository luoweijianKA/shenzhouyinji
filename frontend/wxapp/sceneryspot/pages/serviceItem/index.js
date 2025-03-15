
const { getCategoryByName } = require('../../../model/category');
const { getServiceItemsWithCategory } = require('../../../model/sceneryspot');

const app = getApp();

Page({
  data: {
    sceneryspot: [],
    serviceItems: [],
  },

  async onLoad(option) {
    this.setData({
      sceneryspot: app.globalData.sceneryspot,
    });

    const categoryId = await this.getCategory(option.type);
    this.loadServiceItems(app.globalData.sceneryspot.id, categoryId);
  },

  async loadServiceItems(sid, cid) {
    const serviceItems = await getServiceItemsWithCategory(sid, cid);
    this.setData({
      serviceItems: serviceItems
    });
  },

  async getCategory(name) {
    const category = await getCategoryByName(name);
    return category.id;
  },
  onDetails: function (e) {
    console.log({ e })
  },
  goMap: function (e) {
    const { value } = e.currentTarget.dataset
    if (value) {
      wx.navigateTo({ url: `/sceneryspot/pages/detail/index?id=${value.id}` })
    }
    // var coordinate = e.currentTarget.dataset.coordinate.split(',');
    // var latitude = Number(coordinate[0]);
    // var longitude = Number(coordinate[1]);

    // console.log(latitude);
    // console.log(longitude);
    // wx.getLocation({
    //   type: 'gcj02',
    //   success(res) {
    //     wx.openLocation({
    //       latitude,
    //       longitude,
    //       scale: 18
    //     })
    //   }
    // })
  },
  goMiniProgram: function (e) {
    const { value } = e.currentTarget.dataset;
    wx.navigateToMiniProgram({
      appId: value,
      extraData: {},
      envVersion: 'release',
    })
  },
});