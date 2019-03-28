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
    userInfo: {},
    domain: '',
    isLoading: true, //卡片组列表是否真在加载
    isLoadingFail: false, //卡片组列表是否加载失败
    reLoadingTipMsg: '网络似乎不太好...',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
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
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

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

  tapReload: function() {
    this.setData({
      isLoading: true,
      isLoadingFail: false,
    });
    this.fetchCardTailList();
  },

  /********** 网络请求 **********/
  // 请求卡片组列表
  fetchCardTailList: function(orderId) {
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
      success: function(res) {
        var orderTailInfo = res.data.data.order;
        that.setData({
          orderTailInfo: orderTailInfo,
          cardentryList: orderTailInfo.cardentryList,
          isLoading: false,
        });
        that.cardNumJustice();
        that.sendStatusHandle();
        that.amountStandard();
      },
      fail: function(res) {
        that.setData({
          isLoadingFail: true,
        });
      }
    })
  },

  // 已支付订单（有belongings时）的belongings赋值，和对券码做出判断
  cardNumJustice: function() {
    var cardentryList = this.data.cardentryList;
    var orderTailInfo = this.data.orderTailInfo;
    if (orderTailInfo.status == 1) {
      for (var i = 0; i < cardentryList.length; i++) {
        var belongings = cardentryList[i].belongings;
        for (var j = 0; j < belongings.length; j++) {
          if (belongings[j].ticketnumber != '') {
            var strJSON = belongings[j].ticketnumber; //字符串
            var ticketnumber = JSON.parse(strJSON); // 转成对象
            belongings[j].ticketnumber = ticketnumber;
          }
        }
        cardentryList[i].belongings = belongings;
      }
    }
    this.setData({
      cardentryList: cardentryList,
    })

  },

  //已赠送状态判断
  sendStatusHandle: function() {
    var orderTailInfo = this.data.orderTailInfo;
    var cardentryList = this.data.cardentryList;
    var sendMark = 0;   //用于标识手机号码在fetcher中的位置
    if (orderTailInfo.status == 1 && orderTailInfo.fetchers.length > 0) {
      for (var i = 0; i < cardentryList.length; i++) {
        var fetcher = orderTailInfo.fetchers;
        var belongings = cardentryList[i].belongings;
        for (var j = 0; j < belongings.length; j++) {
          if (belongings[j].status == 12) {
            var tel = fetcher[sendMark].tel;
            var prefix = tel.substring(0, 3); // 手机前缀
            var suffix = tel.substring(7, 11); // 手机后缀
            var showTel = prefix + '****' + suffix;
            belongings[j].showTel = showTel;
            sendMark++;
          }
        }
        cardentryList[i].belongings = belongings;
      }
      this.setData({
        cardentryList: cardentryList
      })
    }
  },

  // 点击去支付
  tapPayment: function() {
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
      success: function(res) {
        wx.hideLoading();
        var code = res.data.code.toString();
        var suffix = code.substr(code.length - 2, 2);
        if (suffix == '00') {
          var cashierItems = [];
          if (orderTailInfo.type == 1) {
            // 卡片类型商品
            for (var i = 0; i < orderTailInfo.cardentryList.length; i++) {
              var card = orderTailInfo.cardentryList[i]
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
      fail: function(res) {
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
  amountStandard: function() {
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
    if (orderTailInfo.realload != '') {
      var realload = amount_standard.amountStandard(orderTailInfo.realload); // 储值金额
    }
    if (orderTailInfo.unrealload != '') {
      var unrealload = amount_standard.amountStandard(orderTailInfo.unrealload); // 赠送金额
    }
    if (orderTailInfo.givepoint != '') {
      var givepoint = amount_standard.amountStandard(orderTailInfo.givepoint); // 积分
    }
    if (orderTailInfo.givepoint != '') {
      var vitality = orderTailInfo.givepoint; // 活力
    }
    this.setData({
      couponamount: couponamount,
      payamount: payamount,
      actamount: actamount,
      givepoint: givepoint,
      realload: realload,
      unrealload: unrealload,
      vitality: vitality
    })
  },

  // 检查用户是否登录
  detecIfUserLogin: function() {
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
  didTapGetVerify: function() {
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
    var funcFail = function loginFail() {};
    if (!isCounting) {
      loginMgr.didTapGetVerify(phoneNumber, funcSucc, funcFail);
    }
  },

  // 点击验证
  didTapValidate: function() {

    var validCode = this.data.validCode;
    var phoneNumber = this.data.phoneNumber;
    var that = this;
    // 登录成功回调
    var funcSucc = function loginSucc() {
      that.detecIfUserLogin();
      that.closeAlert();
    };
    // 登录失败回调
    var funcFail = function loginFail(objData) {};
    loginMgr.didTapValidate(phoneNumber, validCode, funcSucc, funcFail);
  },

  // 输入完毕
  finishInputPhone: function(event) {
    var inputNumber = event.detail.value;
    this.setData({
      phoneNumber: inputNumber
    });
  },

  finishInputCode: function(event) {
    var inputNumber = event.detail.value;
    this.setData({
      validCode: inputNumber
    });
  },

  /***** 动画 *****/
  // 显示弹窗
  showAlert: function() {
    var currentShowStatus = true;
    this.animateAlert(currentShowStatus);
  },

  // 关闭弹窗
  closeAlert: function() {
    var currentShowStatus = false;
    this.setData({
      phoneNumber: '',
      validCode: '',
    });
    this.animateAlert(currentShowStatus);
  },

  // 弹窗动画
  animateAlert: function(isShow) {
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

    setTimeout(function() {
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
  countdown: function(that) {
    var second = that.data.second
    if (second == 0) {
      that.setData({
        isCounting: false,
        second: "发送验证码",
      });
      return;
    }
    var time = setTimeout(function() {
      that.setData({
        second: second - 1,
        isCounting: true
      });
      that.countdown(that);
    }, 1000)
  },

})