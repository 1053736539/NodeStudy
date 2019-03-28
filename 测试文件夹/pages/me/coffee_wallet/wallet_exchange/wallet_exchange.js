
var basereq = require('../../../../utils/base_req.js');

var loginMgr = require('../../../../utils/loginManager/loginMgr.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cdkey: '',
    isLoading: true,       //列表是否真在加载
    isLoadingFail: false,  //列表是否加载失败
    bindingExplain: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '兑换红包',
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

  // 兑换请求
  fetchExchange: function (cdkey) {
    var dataBody = {};
    var userInfo = loginMgr.fetchUserInfo();
    dataBody.userId = userInfo.user.id;
    dataBody.accessToken = userInfo.user.accesstoken;
    dataBody.bindCode = cdkey;
    var encStr = basereq.encryptParam(dataBody);
    var that = this;
    wx.showLoading({
      title: '',
    })
    wx.request({
      url: basereq.interfaceName + 'card/bindCodeVer',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.hideLoading();
        var code = res.data.code.toString();
        var suffix = code.substr(code.length - 2, 2);
        if (suffix == '00' || suffix == '06') {
          //兑换成功
          var prefixURL = '/pages/wallet/use_balance_card/rechargeSucc/rechargeSucc?';
          var data = {};
          data.type = 'exchange_coupon'
          data.msg = '咖啡红包已经放入您的账户';
          var dataJSON = JSON.stringify(data);
          var valueString = 'dataString=' + dataJSON;
          wx.navigateTo({
            url: prefixURL + valueString,
          });
        } else {
          // 其他错误
          wx.showToast({
            title: res.data.msg,
            image: '/Resource/images/cross.png',
            duration: 3000
          });
        }
      },
      fail: function (res) {
        wx.hideLoading();
        wx.showToast({
          title: res.data.msg,
          image: '/Resource/images/cross.png',
          duration: 3000
        });
      }
    });
  },

  finishInput: function (e) {
    var cdkey = e.detail.value;
    this.setData({
      cdkey: cdkey,
    })
  },

  tapExchange: function () {
    var cdkey = this.data.cdkey;
    if (cdkey.length <= 0) {
      wx.showToast({
        title: '请输入兑换码',
        image: '/Resource/images/cross.png',
        duration: 3000
      });
    } else {
      this.fetchExchange(cdkey);
    }
  },

  tapCMCC: function () {
    wx.navigateTo({
      url: '../cmcc_exchange/cmcc_exchange',
    })
  }
})