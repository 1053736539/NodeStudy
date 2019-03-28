// pages/cards/receive/receiveSuccess/receiveSuccess.js
var basereq = require ('../../../../utils/base_req.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    domain:'',
    cardInfo: {},
    receiveInfo: {},
    isSucc: false,
    receiveStatus: '',
    isLoading: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var strJSON = options.dataString; //字符串
    var objData = JSON.parse(strJSON);// 转成对象

    this.setData({
      cardInfo: objData.cardInfo,
      domain: basereq.domain
    });

    var code = objData.receiveInfo.code;// 返回码
    var suffix = code.substring(code.length - 2, code.length);
    var status = '';
    var succ = false;
    if (suffix == '02') {
      // 领卡成功
      succ = true;
      // status = objData.cardInfo.cardtype.name + ' 已经放入卡包';
      status = '收到礼物, 已经放入卡包';
    } else {
      // 领卡失败
      succ = false;
      status = objData.receiveInfo.msg;
    }
    this.setData({
      isSucc: succ,
      receiveStatus: status,
      isLoading: false,
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

  tapBack: function () {
    var pagesList = [];
    pagesList = getCurrentPages();
    wx.navigateBack({
      delta: pagesList.length - 1,
    });
  },

  tapCheck: function () {
    wx.switchTab({
      url: '/pages/wallet/wallet',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },

  tapMall: function() {
    wx.switchTab({
      url: '/pages/mall/mall',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  
  tapCard: function () {
    wx.switchTab({
      url: '/pages/cards/cards',
      success: function (res) { },
      fail: function (res) { },
      complete: function (res) { },
    })
  }
})