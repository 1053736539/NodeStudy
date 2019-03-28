// 引入Base Request
var baseReq = require('../../../../utils/base_req.js');
// 引入login manager
var loginMgr = require('../../../../utils/loginManager/loginMgr.js');
// 引入金额显示规范 amount_standard
var amount_standard = require('../../../../utils/amount_standard.js');
Page({
  data: {
    orderTailInfo: {},
    ticketNumber: '',
    coffeentryList: [],
    signal: '', //订单状态（顶部栏）
    status: '', //卡券状态（中部栏）
    userInfo: {},
    domain: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '订单详情',
    });
    var strJSON = options.dataString; //字符串
    var objData = JSON.parse(strJSON); // 转成对象
    var user = loginMgr.fetchUserInfo();
    this.setData({
      userInfo: user,
      orderTailInfo: objData.orderTailInfo,
      coffeentryList: objData.orderTailInfo.coffeentryList,
      domain: baseReq.domain
    });
    this.cardNumJustice();
    this.amountStandard();
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

  // 一个订单只含有一张卡，且该卡不为多券卡时候的卡券状态判断方法
  cardNumJustice: function () {
    // 卡number显示 ticketnumber长度为0或大于1则为卡片名称
    var coffeentryList = this.data.coffeentryList;
    var orderTailInfo = this.data.orderTailInfo;
    // 卡状态
    var signal = orderTailInfo.signal;
    this.setData({
      signal: signal,
    })
  },

  // 点击去支付
  tapPayment: function () {
    // 订单信息
    var orderTailInfo = this.data.orderTailInfo;
    var dataBody = {};
    dataBody.orderId = orderTailInfo.id;
    dataBody.userId = this.data.userInfo.user.id;
    dataBody.accessToken = this.data.userInfo.user.accesstoken;
    var that = this;
    var encStr = baseReq.encryptParam(dataBody);
    wx.showLoading({
      title: '',
    })
    // 请求支付方式列表
    wx.request({
      url: baseReq.interfaceName + 'payment/order/availablePayType',
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
          var cashierItems = [];
          if (orderTailInfo.type == 1) {
            // 卡片类型商品
            for (var i = 0; i < orderTailInfo.coffeentryList.length; i++) {
              var card = orderTailInfo.coffeentryList[i]
              // 装配收银台需要的数据
              var toPayItem = {};
              toPayItem.id = card.cardInfo.id;
              toPayItem.introduce = '';
              toPayItem.name = card.cardInfo.name;
              toPayItem.qty = card.qty;
              toPayItem.price = card.cardInfo.saleamount;
              toPayItem.carddefineid = card.carddefine; //卡定义ID（200版本，保持和卡片购买页参数一致）
              cashierItems.push(toPayItem);
            }

            var cashierInfo = {};
            cashierInfo.orderId = orderTailInfo.id; // 是否来自于订单
            cashierInfo.type = 1; // 订单类型为卡片订单 （200版本，保持和卡片购买页参数一致）
            cashierInfo.itemList = cashierItems; // 展示的商品列表
            cashierInfo.paymentData = res.data.data; // 支付方式数据
            cashierInfo.totalPrice = orderTailInfo.payamount; // 总价
            var paramStr = JSON.stringify(cashierInfo);
            // 跳转收银台页
            wx.navigateTo({
              url: '../../../cashier_desk/cashier_desk?' + 'dataString=' + paramStr,
            })
          }

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
          title: '获取支付列表失败',
          image: '/Resource/images/cross.png',
          duration: 3000
        });
      }
    })
  },

  //金额显示规范
  amountStandard: function () {
    var orderTailInfo = this.data.orderTailInfo;
    if (orderTailInfo.couponamount != '') {
      var couponamount = amount_standard.amountStandard(orderTailInfo.couponamount); //咖啡红包
    }
    if (orderTailInfo.payamount != '') {
      var payamount = amount_standard.amountStandard(orderTailInfo.payamount); // 需付 合计
    } else {
      var payamount = 0;
    }
    if (orderTailInfo.actamount != '') {
      var actamount = amount_standard.amountStandard(orderTailInfo.actamount); // 实付
    } else {
      var actamount = 0;
    }
    if (orderTailInfo.giftAccountFlow != '') {
      var qty = amount_standard.amountStandard(orderTailInfo.giftAccountFlow.qty); // 积分
    }
    this.setData({
      couponamount: couponamount,
      payamount: payamount,
      actamount: actamount,
      qty: qty
    })
  }

})