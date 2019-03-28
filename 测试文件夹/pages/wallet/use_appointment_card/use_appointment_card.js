// pages/wallet/use_appointment_card/use_appointment_card.js

// use_gift_card.js
// barcode
var wxbarcode = require('../../../utils/index.js');
// 引入base_req
var basereq = require('../../../utils/base_req.js');
// Login Manager
var loginMgr = require('../../../utils/loginManager/loginMgr.js');




Page({

  /**
   * 页面的初始数据
   */
  data: {
    domain: '',
    code: '',
    card: {},
    cardId: '',
    canShowAlert: false,
    isCardLoading: true, //卡片是否真在加载
    cardLoadingFail: false, //卡片是否加载失败
    reLoadingTipMsg: '网络似乎不太好...',
    canGift: false,
  },


  /******************************************************网络请求******************************************************/
  // 请求预约卡片详情
  fetchCardInfo: function () {
    var userInfo = loginMgr.fetchUserInfo();
    var dataBody = {};
    dataBody.userId = userInfo.user.id;
    dataBody.accessToken = userInfo.user.accesstoken;
    dataBody.cardId = this.data.cardId;
    var encStr = basereq.encryptParam(dataBody);
    var that = this;
    wx.request({
      url: basereq.interfaceName + 'card/getCardInfo',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.error('1111', res)
        var code = res.data.code.toString();
        if (code == '200300') {
          // 获取卡详情成功
          var cardInfo = res.data.data;
          if ((cardInfo.cardStockInfo.isgive == 1) && (cardInfo.status == 1)) {
            var canGift = true
          }
          that.setData({
            isCardLoading: false,
            card: cardInfo,
            canGift: canGift,
          });
        } else if (code == '200302') {
          // 卡片已经被朋友领取
          that.cardHasReceived();
        } else {
          // 获取卡详情失败
          that.setData({
            cardLoadingFail: true,
          });
        }
      },
      fail: function (res) {
        that.setData({
          cardLoadingFail: true,
        });
      },
      complete: function () {
        wx.stopPullDownRefresh();
      }
    })
  },

  // 点击赠送朋友
  didTapGive: function (event) {
    var that = this;
    wx.showModal({
      title: '要赠送这张卡吗？',
      content: '每份礼物只能送给一位朋友',
      confirmText: '是的',
      success: function (res) {
        if (res.confirm) {
          that.fetchGiftCard();
        }
      }
    })
  },





  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var strJSON = options.dataString; //字符串
    var objCard = JSON.parse(strJSON);// 转成对象
    this.setData({
      cardId: objCard.id,
      domain: basereq.domain
    });
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.fetchCardInfo();
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },






  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})