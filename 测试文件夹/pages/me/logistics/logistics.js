// pages/me/logistics/logistics.js
// 引入login manager
var loginMgr = require('../../../utils/loginManager/loginMgr.js');
// 引入Base Request
var baseReq = require('../../../utils/base_req.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    domain: '',
    orderItem:{},        // 订单信息
    companyInfo:{},      // 物流公司信息
    expressInfo:{},      // 物流数据
    isLoading: true,     // 是否真在加载
    loadingFail: false,  // 是否加载失败
    reLoadingTipMsg: '网络似乎不太好...',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '物流详情',
    });
    var strJSON = options.dataString; //字符串
    var objData = JSON.parse(strJSON);// 转成对象
    this.setData({
      orderItem: objData,
      domain: baseReq.domain
    });
    this.fetchTransportInfo();
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
    this.fetchTransportInfo();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /********** 网络请求 **********/ 
  fetchTransportInfo: function () {
    var userInfo = loginMgr.fetchUserInfo();
    var dataBody = {};
    dataBody.userId = userInfo.user.id;
    dataBody.accessToken = userInfo.user.accesstoken;
    dataBody.orderId = this.data.orderItem.id;
    var encStr = baseReq.encryptParam(dataBody);
    var that = this;

    wx.request({
      url: baseReq.interfaceName + 'transport/kuaidiAli/query',
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
          var company = res.data.data.company; // 物流公司信息
          var express = JSON.parse(res.data.data.transportation); // 运单信息(字符串 要转为对象)
          that.setData({
            isLoading: false,
            companyInfo: company,
            expressInfo: express,
          });
        } else {
          that.setData({
            loadingFail: true,
            reLoadingTipMsg: res.data.msg,
          });
          // 其他错误
          wx.showToast({
            title: res.data.msg,
            image: '/Resource/images/cross.png',
            duration: 3000
          });
        }
      },
      fail: function (res) {
        that.setData({
          loadingFail: true
        });
      },
      complete: function () {
        wx.stopPullDownRefresh();
      }
    })
  },

  tapReload: function () {
    this.setData({
      isLoading:true,
      loadingFail:false
    });
    this.fetchTransportInfo();
  }
})