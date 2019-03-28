// pages/coffee_machine/coffee_holder/coffee_holder.js
// 引入base_req
var basereq = require('../../../utils/base_req.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLoading: true,
    isLoadingFail: false,
    tipMsg: '',
    coffeeMachineID: '',
    dataJSON: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 解析URL
    if (options.dataString) {
      var dataStr = options.dataString;
      var dataJSON = JSON.parse(dataStr);
      if (dataJSON.machineID) {
        this.setData({
          coffeeMachineID: dataJSON.machineID,
          dataJSON: dataJSON,
        });
        this.fetchJumpInfoWithMachineID();
      }
    }
    
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

  fetchJumpInfoWithMachineID: function () {
    var machineID = this.data.coffeeMachineID;
    var dataBody = {};
    dataBody.deviceNumber = machineID;
    var encStr = basereq.encryptParam(dataBody);
    var that = this;
    wx.showLoading({
      title: '',
    })
    wx.request({
      url: basereq.interfaceName + 'coffeeMachine/getDeviceInfoByDeviceNumber',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.hideLoading();
        that.setData({
          isLoading: true,
          isLoadingFail: false
        });
        var dataJSON = that.data.dataJSON
        dataJSON = JSON.stringify(dataJSON);
        if (res.data.data.makeOrderWay == 1) {
          // 跳转收银台页
          wx.redirectTo({
            url: '/pages/coffee_machine/coffee_order/coffee_order?' + 'dataString=' + dataJSON,
          })
        } else if (res.data.data.makeOrderWay == 2) {
          wx.redirectTo({
            url: '/pages/coffee_machine/coffee_machine?' + 'dataString=' + dataJSON,
          })
        } else {
          // 其他错误
          that.setData({
            isLoadingFail: true,
            tipMsg: res.data.msg
          });
        }
      },
      fail: function (res) {
        // wx.hideLoading();
        wx.showToast({
          title: '页面加载失败',
          image: '/Resource/images/cross.png',
          duration: 3000
        });
        that.setData({
          isLoadingFail: true,
          tipMsg: '页面加载失败'
        });
      }
    })
  },

  tapReloadCards: function () {
    this.setData({
      isLoading: true,
      isLoadingFail: false
    });
    this.fetchJumpInfoWithMachineID();
  }

})