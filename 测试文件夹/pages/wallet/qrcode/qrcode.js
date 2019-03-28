// pages/wallet/qrcode/qrcode.js

// barcode&qrcode的生成器
var codeMaker = require('../../../utils/index.js');
// 引入base_req
var basereq = require('../../../utils/base_req.js');
// 引入loginMgr
var loginMgr = require('../../../utils/loginManager/loginMgr.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardInfo: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var strJSON = options.dataString; //字符串
    var objCard = JSON.parse(strJSON);// 转成对象
    this.setData({
      cardInfo: objCard,
    });
    wx.setNavigationBarTitle({
      title: objCard.name,
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    codeMaker.qrcode('qrcode', this.data.cardInfo.number, 500, 500);
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },
})