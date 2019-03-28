// voucher.js
// 引入Base Request
var baseReq = require('../../../utils/base_req.js');
// 引入login manager
var loginMgr = require('../../../utils/loginManager/loginMgr.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    paymentInfo: {},
    paymentIndex: -1,
    receivePoints: '',
    orderId: '',
    totalPoints:0,
    totalDiscountPrice:0,
    btnTitle:'',
    isLoading: true,     //卡片是否真在加载
    hasDoubleBtns: false,
    tipContent: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '支付成功',
    });
    var strJSON = options.dataString; //字符串
    var objData = JSON.parse(strJSON);// 转成对象
    var titleString = '立即使用';
    var hasDoubleBtns = false;
    if (objData.paymentInfo.type == 1) {
      // 卡片商品
      hasDoubleBtns = true;
      var item = objData.paymentInfo.itemList[0];
      if (item.cardTypeNumber == '001') {
        // 面额卡
        titleString = '充值进余额';
      }
    }
    if (objData.paymentInfo.type == 1) {
      this.setData({ tipContent: "卡片已经放入我的卡包" });
    } else if (objData.paymentInfo.type == 3) {
      this.setData({ tipContent: "请确认杯子已放好，即将制作您的咖啡" });
    }
    this.setData({
      paymentInfo: objData.paymentInfo,
      paymentIndex: objData.paymentIndex,
      orderId: objData.orderId,
      totalDiscountPrice: objData.totalDiscountPrice,
      totalPoints: objData.totalPoints,
      btnTitle: titleString,
      hasDoubleBtns: hasDoubleBtns,
      freeFlag: objData.freeFlag,
    });
    if (!objData.freeFlag){
      this.fetchReceivePoints();
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

  // 请求获赠积分
  fetchReceivePoints: function () {
    var dataBody = {};
    var userInfo = loginMgr.fetchUserInfo();
    dataBody.userId = userInfo.user.id;
    dataBody.accessToken = userInfo.user.accesstoken;
    dataBody.orderId = this.data.orderId;
    dataBody.payType = this.data.paymentInfo.paymentData.payType[this.data.paymentIndex].id;
    dataBody.orderType = this.data.paymentInfo.type;

    var encStr = baseReq.encryptParam(dataBody);
    var that = this;

    wx.request({
      url: baseReq.interfaceName + 'payment/payFrontNotify',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        that.setData({
          isLoading: false,
        });
        var pointsInfo = res.data.data;
        var points = pointsInfo.point_flow[0].qty.toString();
        that.setData({
          receivePoints: points,
        });
      },
      fail: function (res) {

        that.setData({
          isLoading: false,
        });
      }
    })
  },

  // 根据订单号查询卡信息
  fetchCardInfoByOrderID: function () {
    var dataBody = {};
    var userInfo = loginMgr.fetchUserInfo();
    dataBody.userId = userInfo.user.id;
    dataBody.accessToken = userInfo.user.accesstoken;
    dataBody.orderId = this.data.orderId;

    var encStr = baseReq.encryptParam(dataBody);
    var that = this;
    wx.showLoading({
      title: '',
    })
    wx.request({
      url: baseReq.interfaceName + 'order/getCard',
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
        if (suffix == '00') {
          // 获取卡信息成功
          var cardInfo = res.data.data;
          // 卡类型判断
          var item = that.data.paymentInfo.itemList[0];
          if (item.cardTypeNumber == '001') {
            // 面额卡 充值
            that.fetchUseCard(cardInfo);
          } else {
            // 非面额卡 使用
            that.jumpToUseCard(cardInfo);
          }
        } else {
          // 获取失败
          wx.showToast({
            title: res.data.msg,
            image: '/Resource/images/cross.png',
          });
        }
      },
      fail: function (res) {
      }
    })
  },

  // 面额卡充值
  fetchUseCard: function (card) {
    var userInfo = loginMgr.fetchUserInfo();
    var dataBody = {};
    dataBody.userId = userInfo.user.id;
    dataBody.cardId = card.id;
    dataBody.accessToken = userInfo.user.accesstoken;
    var that = this;
    var encStr = baseReq.encryptParam(dataBody);
    wx.showLoading({
      title: '',
    })
    wx.request({
      url: baseReq.interfaceName + 'card/usedCard',
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
        if (suffix == '00') {
          // 充值成功
          that.setData({
            hasDoubleBtns: false,
          });
          wx.navigateTo({
            url: '../../wallet/use_balance_card/rechargeSucc/rechargeSucc',
          })
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
    })

    // 事件
    wx.reportAnalytics('use_card', {
      user_id: userInfo.user.id.toString(),
      membership_level: userInfo.glory.level.toString(),
      card_group_type: this.data.card.carddefine.cardtype.number.toString(),
      card_group_id: '',
      card_group_name: '',
      card_id: this.data.card.id.toString(),
      card_name: this.data.card.name,
      card_price: this.data.card.cardStockInfo.saleamount.toString(),
    });
  },

  // 面额卡点击使用或充值
  tapUseBalanceCard:function () {
    var item = this.data.paymentInfo.itemList[0];
    if(Number(item.qty) > 1) {
      // 包含多张卡 直接到卡包
      wx.switchTab({
        url: '/pages/wallet/wallet',
        success: function (res) { },
        fail: function (res) { },
        complete: function (res) { },
      })
    } else {
      // 只有一张卡 根据订单ID获取卡信息
      this.fetchCardInfoByOrderID();
    }
  },

  //其他卡的使用
  tapUseCard: function(){
    wx.showModal({
      title: '',
      content: '无需出示卡券二维码，向店员出示您的会员码即可使用卡券快速结账。是否前往会员码页？',
      confirmText: '好的',
      success: function (res) {
        if (res.confirm) {
          wx.navigateTo({
            url: "/pages/cards/my_qrcode/my_qrcode",
          })
        }
      }
    })
  },

  // 点击返回
  tapComplete: function () {
    var pagesList = [];
    pagesList = getCurrentPages();
    wx.navigateBack({
      delta: pagesList.length - 1,
    });
  },

  // 跳转至卡使用页
  jumpToUseCard:function (card) {
    var prefixURL = '';
    if (card.carddefine.cardtype.number == '001') {
      // 面额卡
      prefixURL = '../../wallet/use_balance_card/use_balance_card?';
    } else if (card.carddefine.cardtype.number == '002') {
      // 活动卡
      prefixURL = '../../wallet/use_activity_card/use_activity_card?';
    } else if (card.carddefine.cardtype.number == '003' || card.carddefine.cardtype.number == '006') {
      // 礼品卡
      prefixURL = '../../wallet/use_gift_card/use_gift_card?';
    } else if (card.carddefine.cardtype.number == '000') {
      // 会员券
      prefixURL = '../../wallet/use_ticket/use_ticket?';
    } else if (card.carddefine.cardtype.number == '008') {
      // 员工券
      prefixURL = '../../wallet/use_ticket/use_ticket?';
    } else if (card.carddefine.cardtype.number == '010') {
      // 早春卡
      prefixURL = '../../wallet/use_activity_card/use_activity_card?';
    } else if (card.carddefine.cardtype.number == '011') {
      // 麦粉卡
      prefixURL = '../../wallet/use_gift_card/use_gift_card?';
    } else if (card.carddefine.cardtype.number == '012') {
      // 体验券
      prefixURL = '../../wallet/use_ticket/use_ticket?';
    } else {
      return;
    }
    var cardJSON = JSON.stringify(card);
    var valueString = 'dataString=' + cardJSON;
    wx.navigateTo({
      url: prefixURL + valueString,
    });
  }
})