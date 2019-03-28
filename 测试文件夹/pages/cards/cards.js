// cards.js
// 引入base_req
var basereq = require('../../utils/base_req.js');
// 引入banner_jump
var bannerJump = require('../../utils/url_jump.js');
// 引入loginMgr
var loginMgr = require('../../utils/loginManager/loginMgr.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false,
    userInfo: {},
    imgLevelSrc: '',
    canShowAlert: false,
    phoneNumber: '',
    validCode: '',
    second: '发送验证码',
    isCounting: false,
    focusInputPhone: false,
    focusInputValidCode: false,
    dataString: '',
    domain: '',
    bannerItems: [],
    indicatorDots: true,
    autoplay: true,
    interval: 3500,
    duration: 250,
    isBnnaer: false,
    isIPhoneX: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getBannerList();
    // 判断用户是否已登录
    this.detecIfUserLogin();
    // 是否需要跳转其他页面
    if (options.dataString) {
      this.setData({
        dataString: options.dataString,
      });
    };
    
    this.setData({
      domain: basereq.domain,
    });

    // 门店扫码进入
    if (options.shop_id) {
      // 记录门店ID
      this.saveShopID(options.shop_id);
      // 事件上报
      wx.reportAnalytics('scan_qr_code', {
        shop_id: options.shop_id.toString(),
      });
    }

    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        var phoneModel = res.model   //手机机型，用于针对iPhone x的特殊界面
        if (phoneModel == 'iPhone X'){
        that.setData({
          isIPhoneX: true,
        })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 是否需要跳转其他页面
    if (this.data.dataString) {
      var that = this;
      var strJSON = that.data.dataString;
      var comeplete = function () {
        that.setData({
          dataString: ''
        })
      };
      bannerJump.jumpWithStrJSON(strJSON, comeplete);
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.setNavigationBarTitle({
      title: '会员卡',
    });
    this.closeAlert();
    // 判断用户是否已登录
    this.detecIfUserLogin();
    this.getBannerList();
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    if (this.data.isLogin) {
      var that = this;
      // 登录成功回调
      var funcSucc = function loginSucc() {
        that.getBannerList();
        that.detecIfUserLogin();
        wx.stopPullDownRefresh();
      };

      // 登录失败回调
      var funcFail = function loginFail(objData) {
        wx.stopPullDownRefresh();
      };
      // 更新用户信息
      loginMgr.updateUserInfo(funcSucc, funcFail);
    } else {
      wx.stopPullDownRefresh();
    }
  },

  // 记录门店ID
  saveShopID: function (shopID) {
    var scanInfo = {};
    scanInfo.shopID = shopID;
    wx.setStorageSync('scanInfo', scanInfo);
  },

  // 点击会员规则详情
  didTapRules: function () {
    wx.navigateTo({
      url: './member_rules/member_rules',
    });

    // 事件上报
    var user_id = this.data.isLogin ? this.data.userInfo.user.id : '';
    var user_level = this.data.isLogin ? this.data.userInfo.glory.level : '';
    wx.reportAnalytics('view_membership_rules', {
      user_id: user_id.toString(),
      membership_level: user_level.toString(),
    });
  },

  // 显示弹窗
  showAlert: function () {
    var currentShowStatus = true;
    this.animateAlert(currentShowStatus);
  },

  // 关闭弹窗
  closeAlert: function () {
    var currentShowStatus = false;
    this.setData({
      phoneNumber: '',
      validCode: '',
    });
    this.animateAlert(currentShowStatus);
  },

  // 弹窗动画
  animateAlert: function (isShow) {
    var animation = wx.createAnimation({
      duration: 100, //动画时长 
      timingFunction: "linear", //线性 
      delay: 0 //0则不延迟
    });

    this.animation = animation;

    animation.opacity(0).step();
    this.setData({
      animationData: animation.export()
    });

    setTimeout(function () {
      // 执行第二组动画 
      animation.opacity(1).step();
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象 
      this.setData({
        animationData: animation
      })

      //关闭 
      if (isShow == false) {
        this.setData({
          canShowAlert: false
        });
      }
    }.bind(this), 200)

    // 显示 
    if (isShow == true) {
      this.setData({
        canShowAlert: true,
        focusInputPhone: true,
      });
    }
  },

  getBannerList: function () {
    var dataBody = {};
    dataBody.position = '1';
    var encStr = basereq.encryptParam(dataBody);
    var that = this;
    wx.request({
      url: basereq.interfaceName + 'common/getBannerList ',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var banner = res.data.data;
        that.setData({
          bannerItems: banner,
        });
      },
      fail: function (res) {

      },
    })
  },

  // 点击banner的跳转
  didTapBanner: function (e) {
    if (e.currentTarget.dataset.item) {
      var bannerItem = e.currentTarget.dataset.item;
      if (bannerItem.datastring) {
        // 包含跳转链接
        var strJSON = bannerItem.datastring;
        var comeplete = function () { };
        bannerJump.jumpWithStrJSON(strJSON, comeplete);
      }
    }
  },

  // 检查用户是否登录
  detecIfUserLogin: function () {
    // 判断用户是否已登录
    var userInfo = loginMgr.fetchUserInfo();
    if (userInfo.isLogin) {
      // 等级
      var level = userInfo.glory.level;
      var imgURL = '/Resource/images/Card/level_'
      if (level < 6) {
        imgURL = imgURL + level.toString() + '.png';
      };
      this.setData({
        isLogin: true,
        userInfo: userInfo,
        imgLevelSrc: imgURL
      });
    } else {
      this.setData({
        isLogin: false,
        userInfo: {},
      });
    }
  },

  // 点击获取验证码
  didTapGetVerify: function () {
    var that = this;
    var isCounting = that.data.isCounting;
    var phoneNumber = that.data.phoneNumber;
    var funcSucc = function loginSucc() {
      that.setData({
        second: 60,
        isCounting: true
      });
      that.countdown(that);
      that.setData({
        focusInputValidCode: true
      });
    };
    var funcFail = function loginFail() { };
    if (!isCounting) {
      loginMgr.didTapGetVerify(phoneNumber, funcSucc, funcFail);
    }
  },

  // 点击验证
  didTapValidate: function () {

    var validCode = this.data.validCode;
    var phoneNumber = this.data.phoneNumber;
    var that = this;
    // 登录成功回调
    var funcSucc = function loginSucc() {
      that.setData({
        isLogin: true
      });
      that.closeAlert();
      that.detecIfUserLogin();
      that.getBannerList();
    };
    // 登录失败回调
    var funcFail = function loginFail(objData) { };
    loginMgr.didTapValidate(phoneNumber, validCode, funcSucc, funcFail);
  },

  // 输入完毕
  finishInputPhone: function (event) {
    var inputNumber = event.detail.value;
    this.setData({
      phoneNumber: inputNumber
    });
  },

  finishInputCode: function (event) {
    var inputNumber = event.detail.value;
    this.setData({
      validCode: inputNumber
    });
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
  },

  tapBindMyQrcode: function () {
    wx.navigateTo({
      url: './my_qrcode/my_qrcode',
    })
  },
})