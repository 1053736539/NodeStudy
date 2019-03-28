// 引入Base Request
var baseReq = require('../../../../utils/base_req.js');
// 引入login manager
var loginMgr = require('../../../../utils/loginManager/loginMgr.js');
// 引入金额显示规范 amount_standard
var amount_standard = require('../../../../utils/amount_standard.js');

Page({
  data: {
    orderTailInfo: {},
    cardentryList: [],
    belongings: [],
    signal: '', //订单状态（顶部栏）
    userInfo: {},
    domain: '',
    isLoading: true, //卡片组列表是否真在加载
    isLoadingFail: false, //卡片组列表是否加载失败
    reLoadingTipMsg: '网络似乎不太好...',
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

    this.setData({
      domain: baseReq.domain
    });
    this.detecIfUserLogin();
    this.fetchCardTailList(objData.orderId);
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

  tapReload: function () {
    this.setData({
      isLoading: true,
      isLoadingFail: false,
    });
    this.fetchCardTailList();
  },

  /********** 网络请求 **********/
  // 请求卡片组列表
  fetchCardTailList: function (orderId) {
    var that = this;
    var dataBody = {};
    dataBody.orderId = orderId;
    dataBody.userId = this.data.userInfo.user.id;
    dataBody.accessToken = this.data.userInfo.user.accesstoken;
    var encStr = baseReq.encryptParam(dataBody);
    var that = this;
    wx.request({
      url: baseReq.interfaceName + 'order/getById',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var orderTailInfo = res.data.data.order;
        that.setData({
          orderTailInfo: orderTailInfo,
          cardentryList: orderTailInfo.cardentryList,
          isLoading: false,
        });
        if (orderTailInfo.type === 5){
          that.cardNumJustice();
          that.sendStatusHandle();
        }
        that.amountStandard();
      },
      fail: function (res) {
        that.setData({
          isLoadingFail: true,
        });
      }
    })
  },

  // 已支付订单（有belongings时）的belongings赋值，和对券码做出判断
  cardNumJustice: function () {
    var cardentryList = this.data.cardentryList;
    var orderTailInfo = this.data.orderTailInfo;
    var belongings = [];
    if (orderTailInfo.status == 1) {
      belongings = cardentryList[0].belongings;
      for (var i = 0; i < belongings.length; i++) {
        if (belongings[i].ticketnumber != '') {
          var strJSON = belongings[i].ticketnumber; //字符串
          var ticketnumber = JSON.parse(strJSON); // 转成对象
          belongings[i].ticketnumber = ticketnumber;
        }
      }
    }
    // 卡状态
    var signal = orderTailInfo.signal;

    this.setData({
      signal: signal,
      belongings: belongings,
    })

  },

  //已赠送状态判断
  sendStatusHandle: function () {
    var orderTailInfo = this.data.orderTailInfo;
    if (orderTailInfo.status == 1 && orderTailInfo.fetchers.length > 0) {
      var belongings = this.data.belongings;
      var j = 0;
      var fetcher = orderTailInfo.fetchers;
      for (var i = 0; i < belongings.length; i++) {
        if (belongings[i].status == 12) {
          var tel = fetcher[j].tel;
          var prefix = tel.substring(0, 3); // 手机前缀
          var suffix = tel.substring(7, 11); // 手机后缀
          var showTel = prefix + '****' + suffix;
          belongings[i].showTel = showTel;
          j++;
        }
      }
      this.setData({
        belongings: belongings
      })
    }
  },

  //金额显示规范
  amountStandard: function () {
    var orderTailInfo = this.data.orderTailInfo;
    if (orderTailInfo.payintegral != '') {
      var payintegral = amount_standard.amountStandard(orderTailInfo.payintegral); // 需付 合计
    } else {
      var payintegral = 0;
    }
    if (orderTailInfo.actintegral != '') {
      var actintegral = amount_standard.amountStandard(orderTailInfo.actintegral); // 实付
    } else {
      var actintegral = 0;
    }
    this.setData({
      payintegral: payintegral,
      actintegral: actintegral,
    })
  },

  // 检查用户是否登录
  detecIfUserLogin: function () {
    // 判断用户是否已登录
    var userInfo = loginMgr.fetchUserInfo();
    if (userInfo.isLogin) {
      this.setData({
        isLogin: true,
        userInfo: userInfo
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
      that.detecIfUserLogin();
      that.closeAlert();
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

  /***** 动画 *****/
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

})