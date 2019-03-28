// pages/me/coffee_wallet/cmcc_exchange/cmcc_exchange.js

var basereq = require('../../../../utils/base_req.js');

var loginMgr = require('../../../../utils/loginManager/loginMgr.js');

var canFetchVerifyCode = true;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    exchangeCode: '',
    second: '发送验证码',
    isCounting: false,
    phoneNumber: '',
    validCode: '',
    canFetchVerifyCode: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '移动商城红包兑换',
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

  fetchGetVerifyCode: function (phoneNumber) {
    // 没有在计时中
    var phoneNumber = loginMgr.serializePhoneNumber(phoneNumber);
    if (phoneNumber.length == 0) {
      wx.showToast({
        title: '请输入手机号',
        image: '/Resource/images/cross.png',
      })
    } else if (phoneNumber.length < 11) {
      wx.showToast({
        title: '手机号错误',
        image: '/Resource/images/cross.png',
      })
    } else {
      // 禁止多次重复获取验证码
      if (!canFetchVerifyCode) {
        return;
      }
      canFetchVerifyCode = false;

      // loading
      wx.showLoading({
        title: '',
      })

      // 1.组装请求参数
      var dataBody = {};
      dataBody.tel = phoneNumber;
      var userInfo = loginMgr.fetchUserInfo();
      dataBody.userId = userInfo.user.id;
      dataBody.accessToken = userInfo.user.accesstoken;
      // 2.加密参数(需要引入base_req.js)
      var encStr = basereq.encryptParam(dataBody);

      // 3.获取验证码请求
      var that = this;

      wx.request({
        url: basereq.interfaceName + 'coupon/chlSmsCode',                                      
        data: {
          data: encStr
        },
        method: "POST",
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: function (res) {
          wx.hideLoading();
          if (res.data.code) {
            var code = res.data.code.toString();
            var suffixCode = code.substr(code.length - 2, 2);
            if (suffixCode == '00') {
              wx.showToast({
                title: "验证码已发送",
                image: '',
                duration: 3000
              });
              // 开始倒计时
              that.setData({
                second: 60,
                isCounting: true
              });
              that.countdown(that);
              that.setData({
                focusInputValidCode: true
              });
            } else {
              wx.hideLoading();
              wx.showToast({
                title: res.data.msg,
                image: '/Resource/images/cross.png',
              });
            }
          } else {
            wx.showToast({
              title: res.errMsg,
              image: '/Resource/images/cross.png',
              duration: 3000
            });
          }
        },
        fail: function (res) {
          wx.hideLoading();
          wx.showToast({
            title: res.errMsg,
            image: '/Resource/images/cross.png',
            duration: 3000
          });
        },
        complete: function () {
          canFetchVerifyCode = true;
        }
      })
    }
  },

  fetchSubmitCode: function() {
    var dataBody = {};
    var userInfo = loginMgr.fetchUserInfo();
    dataBody.userId = userInfo.user.id;
    dataBody.accessToken = userInfo.user.accesstoken;
    dataBody.tel = this.data.phoneNumber;
    dataBody.sms = this.data.validCode;
    var encStr = basereq.encryptParam(dataBody);
    var that = this;
    wx.showLoading({
      title: '',
    })
    wx.request({
      url: basereq.interfaceName + 'coupon/chlConsume',
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
          // 兑换成功
          var prefixURL = '/pages/wallet/use_balance_card/rechargeSucc/rechargeSucc?';
          var data = {};
          data.type = 'points_mall';
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
      }
    });
  },

  // 点击获取验证码
  didTapGetVerify: function () {
    var that = this;
    var isCounting = that.data.isCounting;
    var phoneNumber = that.data.phoneNumber;
    // 计时停止
    if (!isCounting) {
      this.fetchGetVerifyCode(phoneNumber);
    }
  },

  didTapExchange:function () {
    var phoneNumber = this.data.phoneNumber;
    var validCode = this.data.validCode;
    phoneNumber = loginMgr.serializePhoneNumber(phoneNumber);
    if (phoneNumber.length == 0) {
      wx.showToast({
        title: '请输入手机号',
        image: '/Resource/images/cross.png',
      })
    } else if (phoneNumber.length < 11) {
      wx.showToast({
        title: '手机号错误',
        image: '/Resource/images/cross.png',
      })
    } else if (validCode.length < 1) {
      wx.showToast({
        title: '请输入验证码',
        image: '/Resource/images/cross.png',
      })
    } else {
      // 调用兑换接口
      this.fetchSubmitCode();
    }
  },

  // 输入完毕
  finishInputPhone: function (event) {
    var inputNumber = event.detail.value;
    this.setData({ phoneNumber: inputNumber });
  },

  finishInputCode: function (event) {
    var inputNumber = event.detail.value;
    this.setData({ validCode: inputNumber });
  },

  // 倒计时
  countdown: function (that) {
    var second = that.data.second
    if (second == 0) {
      that.setData({
        isCounting: false,
        second: "发送验证码",
      });
      return;
    }
    var time = setTimeout(function () {
      that.setData({
        second: second - 1,
        isCounting: true
      });
      that.countdown(that);
    }, 1000)
  }
})