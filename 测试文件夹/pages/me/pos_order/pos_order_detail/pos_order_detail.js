// pages/me/pos_order/pos_order_detail/pos_order_detail.js
// 引入login manager
var loginMgr = require('../../../../utils/loginManager/loginMgr.js');
// 引入amount standard
var amountStd = require('../../../../utils/amount_standard.js');
// 引入Base Request
var baseReq = require('../../../../utils/base_req.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId: '',
    shopname:'',
    orderTime:'',
    arrTickets: [],
    isLoading: true,
    loadingFail: false,
    reLoadingTipMsg: '网络似乎不太好...',
    menuDetail: null,
    payDetail: null,
    hasIntegral: false,
    hasVitality: false, 
    hasDiscount: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '消费详情',
    });
    var strJSON = options.dataString; //字符串
    var objData = JSON.parse(strJSON);// 转成对象
    var user = loginMgr.fetchUserInfo();
    this.setData({
      userInfo: user,
      orderId: objData.orderId,
      shopname:objData.shopname,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
      domain: baseReq.domain
    });

    this.fetchPosOrderDetail();
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

  // 请求POS消费订单详情
  fetchPosOrderDetail: function() {
    var userInfo = this.data.userInfo;
    var dataBody = {};
    dataBody.orderId = this.data.orderId;
    dataBody.userId = userInfo.user.id;
    dataBody.accessToken = userInfo.user.accesstoken;
    var encStr = baseReq.encryptParam(dataBody);
    var that = this;

    wx.request({
      url: baseReq.interfaceName + 'order/getPosOrderInfo',
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
          // 请求成功
          // 订单时间
          var orderTime = res.data.data.menuDetail[0].BILLTIME;

          // 是否有核销卡券信息
          var arrTickets;
          if (res.data.data.payDetail.TICKETNAME != null) {
            // 有卡券核销信息，核销卡券使用字符串记录，用逗号分隔
            var ticketsString = res.data.data.payDetail.TICKETNAME;
            arrTickets = ticketsString.split(",");
          } else {
            // 没有核销卡券
            arrTickets = [];
          }

          // 金额显示处理
          var payDetail = res.data.data.payDetail;
          var showPAYAMOUNT = amountStd.amountStandard(payDetail.PAYAMOUNT);
          var showDISCOUNT = amountStd.amountStandard(payDetail.DISCOUNT);
          var showACTAMOUNT = amountStd.amountStandard(payDetail.ACTAMOUNT);
          payDetail.showPAYAMOUNT = showPAYAMOUNT;
          payDetail.showDISCOUNT = showDISCOUNT;
          payDetail.showACTAMOUNT = showACTAMOUNT;

          // 是否有折扣金额
          var hasDiscount;
          if (payDetail.DISCOUNT != null && payDetail.DISCOUNT > 0) {
            hasDiscount = true;
          } else {
            hasDiscount = false;
          }

          // 是否有获得积分
          var hasIntegral;
          if (payDetail.INTEGRAL != null && payDetail.INTEGRAL > 0) {
            hasIntegral = true;
          } else {
            hasIntegral = false;
          }

          // 是否有获得积分
          var hasVitality;
          if (payDetail.VITALITY != null && payDetail.VITALITY > 0) {
            hasVitality = true;
          } else {
            hasVitality = false;
          }

          // 数据源赋值
          that.setData({
            isLoading: false,
            orderTime: orderTime,
            menuDetail: res.data.data.menuDetail,
            payDetail: payDetail,
            arrTickets: arrTickets,
            hasIntegral: hasIntegral,
            hasVitality: hasVitality,
            hasDiscount: hasDiscount
          });
        } else {
          // 请求错误
          wx.showToast({
            title: res.data.msg,
            image: '/Resource/images/cross.png',
            duration: 3000
          });
          that.setData({
            loadingFail: true,
          });
        }
      },
      fail: function (res) {
        that.setData({
          loadingFail: true,
        });
      }
    })
  }
})