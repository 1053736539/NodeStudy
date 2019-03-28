// pages/cards/my_qrcode/my_qrcode.js

// 引入base_req
var basereq = require('../../../utils/base_req.js');

// barcode&qrcode的生成器
var codeMaker = require('../../../utils/index.js');
// 引入loginMgr
var loginMgr = require('../../../utils/loginManager/loginMgr.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false,
    userInfo: {},
    showTel: '',
    cardSum:'',
    imgLevelSrc: '',
    advList:'点单前，请出示此二维码，累计积分，尊享会员福利',
    isListLoading: true,
    listLoadingFail: false,
    reLoadingTipMsg: '网络似乎不太好...',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.fetchAdvList();
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
    wx.setNavigationBarTitle({
      title: '我的会员码',
    });
    this.fetchAdvList;
    // 判断用户是否已登录
    this.detecIfUserLogin();
    // 用户已登录更新用户信息
    var userInfo = loginMgr.fetchUserInfo();
    if (userInfo.isLogin) {
      // 更新用户信息
      var that = this;
      // 登录成功回调
      var funcSucc = function loginSucc() {
        that.detecIfUserLogin();
      };
      // 登录失败回调
      var funcFail = function loginFail(objData) {
        if (objData.code) {
          var code = objData.code.toString();
          var suffix = code.substr(code.length - 2, 2);
          if (suffix != '00') {
            wx.showToast({
              title: objData.msg,
              image: '/Resource/images/cross.png',
              duration: 3000
            });
            loginMgr.logout();
            that.detecIfUserLogin();
          }
        }
      };
      // 更新用户信息
      loginMgr.updateUserInfo(funcSucc, funcFail);
    }
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

  // 获取广告文字
  fetchAdvList: function () {
    var dataBody = {};
    dataBody.position = '1';
    var encStr = basereq.encryptParam(dataBody);
    var that = this;
    wx.request({
      url: basereq.interfaceName + 'common/getAdvertList ',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var adv = res.data.data[0];
        that.setData({
          advList: adv,
          isListLoading: false,
        });
      },
      fail: function (res) {
        that.setData({
          listLoadingFail: true,
        });
      },
    })
  },

  // 刷新会员信息和卡数量
  fetchCardInfo: function () {
    var dataBody = {};
    dataBody.userId = this.data.userInfo.user.id;
    dataBody.accessToken = this.data.userInfo.user.accesstoken;
    var that = this;
    var encStr = basereq.encryptParam(dataBody);
    wx.request({
      url: basereq.interfaceName + 'user/refreshUserInfo',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        // 条码 二维码
        var userNumber = res.data.data.userNumber;
        codeMaker.qrcode('qrcode', userNumber, 490, 490);
        // 接口成功 数据成功
        that.setData({
          isListLoading: false,
          cardSum: res.data.data.cardSum,
        });
      },
      fail: function (res) {
        console.log(res)
        that.setData({
          listLoadingFail: true,
        });
      }
    })
  },

  // 点击刷新
  didTapRefresh: function(){
    this.setData({
      isListLoading: true,
      listLoadingFail: false
    });
    this.detecIfUserLogin();
    this.fetchAdvList();
  },

  // 检查用户是否登录
  detecIfUserLogin: function () {
    // 判断用户是否已登录
    var userInfo = loginMgr.fetchUserInfo();
    if (userInfo.isLogin) {
      var level = userInfo.glory.level;  // 等级
      var prefix = userInfo.user.tel.substring(0, 3);  // 手机前缀
      var suffix = userInfo.user.tel.substring(7, 11); // 手机后缀
      var imgURL = '/Resource/images/Card/level_'
      if (level < 6) {
        imgURL = imgURL + level.toString() + '.png';
      } else {
        imgURL = imgURL + 'logout.png';
      }
      this.setData({
        isLogin: true,
        userInfo: userInfo,
        showTel: prefix + '****' + suffix,
        imgLevelSrc: imgURL
      });
      this.fetchCardInfo();
    } else {
      this.setData({
        isLogin: false,
        userInfo: {},
      });
      wx.showToast({
        title: '正在返回，请登录！',
      })
      wx.navigateBack({
        delta: 1,
      })
    }
  },
})