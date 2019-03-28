// pages/wallet/bind_card/bind_card.js
var wxbarcode = require('../../../utils/index.js');

var basereq = require('../../../utils/base_req.js');

var loginMgr = require('../../../utils/loginManager/loginMgr.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardNumber: '',
    isLoading: true,       //列表是否真在加载
    isLoadingFail: false,  //列表是否加载失败
    bindingExplain:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '兑换卡片',
    });

    this.fetchBindingExplain();
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

  // 请求绑定卡片
  fetchCardBinding: function (cardNumber) {
    var dataBody = {};
    var userInfo = loginMgr.fetchUserInfo();
    dataBody.userId = userInfo.user.id;
    dataBody.accessToken = userInfo.user.accesstoken;
    dataBody.bindCode = cardNumber;
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
          // 充值成功
          var prefixURL = '../use_balance_card/rechargeSucc/rechargeSucc?';
          var data = {};
          data.type = 'binding_card'
          data.msg = res.data.msg;
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
      }
    });

    // 事件
    wx.reportAnalytics('binding_card', {
      user_id: userInfo.user.id.toString(),
      membership_level: userInfo.glory.level.toString(),
      card_id: card.id.toString(),
      card_name: card.name,
    });
  },

  // 请求绑定说明
  fetchBindingExplain: function () {
    var dataBody = {};
    var encStr = basereq.encryptParam(dataBody);
    var that = this;
    wx.request({
      url: basereq.interfaceName + 'card/getBindDescription',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var code = res.data.code.toString();
        var suffix = code.substr(code.length - 2, 2);
        if (suffix == '00') {
          that.setData({
            isLoading: false,
            bindingExplain: res.data.data.remark,
          });
        } else {
          // 其他错误
          that.setData({
            isLoadingFail: true,
          });
        }
      },
      fail: function (res) {
        that.setData({
          isLoadingFail: true,
        });
      }
    })
  },

  finishInput: function (e) {
    var cardNum = e.detail.value;
    this.setData({
      cardNumber: cardNum,
    })
  },

  tapBindCard: function () {
    var cardNum = this.data.cardNumber;
    if(cardNum.length <= 0){
      wx.showToast({
        title: '请输入兑换码',
        image: '/Resource/images/cross.png',
        duration: 3000
      });    
    }else {
      this.fetchCardBinding(cardNum);
    }
  },
})