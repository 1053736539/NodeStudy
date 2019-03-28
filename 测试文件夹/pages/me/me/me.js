// me.js~～ 
// 引入base_req
var basereq = require('../../../utils/base_req.js');
// 引入loginMgr
var loginMgr = require('../../../utils/loginManager/loginMgr.js');

Page({
  data: {
    imgLevelSrc: '',
    phoneNumber: '',
    validCode: '',
    isLogin: false,
    userInfo:{},
    wxUserInfo: null,
    showTel:'',  // 用于显示的电话号码
    canShowAlert: false,
    second: '发送验证码',
    isCounting: false,
    couponQty: 0,
    menuList: [
      {
        title: '我的订单',
        src: '/Resource/images/Me/hd_order.png',
        page_url: '/pages/me/order/order_list',
        remind: '',
      },
      {
        title: '消费记录',
        src: '/Resource/images/Me/hd_POS_order.png',
        page_url: '/pages/me/pos_order/pos_order',
        remind: '',
      },
      {
        title: '咖啡红包',
        src: '/Resource/images/Me/hd_wallet.png',
        page_url: '/pages/me/coffee_wallet/coffee_wallet',
        remind: '',
      },
      {
        title: '积分商城',
        src: '/Resource/images/Me/hd_points.png',
        page_url: '/pages/points_mall/points_mall',
        remind: 'NEW !',
      },
      {
        title: '会员规则',
        src: '/Resource/images/Me/hd_service.png',
        page_url: '/pages/cards/member_rules/member_rules',
        remind: '',
      },
      {
        title: '退出登录',
        src: '/Resource/images/Me/hd_quit.png',
        page_url: '',
        remind: '',
      },
    ],
    logoutMenuList: [
      {
        title: '我的订单',
        src: '/Resource/images/Me/hd_order.png',
        page_url: '/pages/me/order/order_list',
        remind: '',
      },
      {
        title: '消费记录',
        src: '/Resource/images/Me/hd_POS_order.png',
        page_url: '/pages/me/pos_order/pos_order',
        remind: '',
      },
      {
        title: '咖啡红包',
        src: '/Resource/images/Me/hd_wallet.png',
        page_url: '/pages/me/coffee_wallet/coffee_wallet',
        remind: '',
      },
      {
        title: '积分商城',
        src: '/Resource/images/Me/hd_points.png',
        page_url: '/pages/points_mall/points_mall',
        remind: 'NEW !',
      },
      {
        title: '会员规则',
        src: '/Resource/images/Me/hd_service.png',
        page_url: '/pages/cards/member_rules/member_rules',
        remind: '',
      },
    ],
    focusInputPhone: false,
    focusInputValidCode: false
  },

  // 点击列表(已登录)
  didTapCell: function (e) {
    var that = this;
    var itemCell = e.currentTarget.dataset.item;
    if(itemCell.title == '退出登录'){
      wx.showModal({
        title: '确定要退出登录吗？',
        content: '',
        success: function (res) {
          // 退出登录
          var userInfo = that.data.userInfo;
          if (res.confirm) {
            wx.reportAnalytics('logout', {
              user_id: userInfo.user.id.toString(),
              membership_level: userInfo.glory.level.toString(),
              account: userInfo.electronicAccount.balance.toString(),
              point: userInfo.pointAccount.balance.toString(),
            });
            loginMgr.logout();
            that.detecIfUserLogin();
          } else if (res.cancel) {
          }
        }
      })
    } else if (itemCell.title == '我的订单') {
      wx.reportAnalytics('view_order_list', {
        user_id: this.data.userInfo.user.id.toString(),
        membership_level: this.data.userInfo.glory.level.toString(),
      });
      wx.navigateTo({
        url: itemCell.page_url,
      });
    } else {
      wx.navigateTo({
        url: itemCell.page_url,
      });
    } 
  },

  // 点击列表(未登录)
  didTapCellLogout: function (e) {
    var that = this;
    var itemCell = e.currentTarget.dataset.item;
    if (itemCell.title == '我的订单' || itemCell.title == '咖啡红包' || itemCell.title == '消费记录') {
      this.showAlert();
    } else {
      wx.navigateTo({
        url: itemCell.page_url,
      });
    }
  },

  //获取可用咖啡红包数量
  fetchCouponGroup: function () {
    var dataBody = {};
    dataBody.userId = this.data.userInfo.user.id;;                                    //用户id
    dataBody.accessToken = this.data.userInfo.user.accesstoken;                       //accesstoken
    dataBody.startPage = 1;
    dataBody.pageSize = 15;
    var encStr = basereq.encryptParam(dataBody);
    var that = this;
    wx.request({
      url: basereq.interfaceName + '/coupon/getCouponList',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var code = res.data.code;
        var suffix = code.substr(code.length - 2, 2);
        if (suffix == '00') {
          var qty = res.data.data.couponcount;
          that.setData({
            couponQty: qty,
          });
          that.textHandle(qty);
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

      }
    })
  },

  //咖啡红包显示可用数量文字处理
  textHandle: function (qty){
    var menuList = this.data.menuList;
    var couponQty = qty;
    if (couponQty > 0){
      menuList[2].remind = couponQty + '个即将过期';
    } else {
      menuList[2].remind = '';
    }
    this.setData({
      menuList: menuList
    })
  },

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '我',
    });
    // 页面初始化 options为页面跳转所带来的参数
    this.detecIfUserLogin();
  },
  onReady: function () {
    // 页面渲染完成
    // var wxUserInfo = loginMgr.getWxUserInfo();
    // if (wxUserInfo) {
    //   this.setData({
    //     wxUserInfo: wxUserInfo,
    //   })
    // }
  },
  onShow: function () {
    // 页面显示
    this.closeAlert();
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
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    if (this.data.isLogin) {
      var that = this;
      // 登录成功回调
      var funcSucc = function loginSucc() {
        that.detecIfUserLogin();
        wx.stopPullDownRefresh();
      };

      // 登录失败回调
      var funcFail = function loginFail(objData) {
        wx.stopPullDownRefresh();
      };
      loginMgr.updateUserInfo(funcSucc, funcFail);
    } else {
      wx.stopPullDownRefresh();
    }
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
        this.setData(
          {
            canShowAlert: false
          }
        );
      }
    }.bind(this), 200)

    // 显示 
    if (isShow == true) {
      this.setData(
        {
          canShowAlert: true,
          focusInputPhone: true,
        }
      );
    }
  },

  // 维护个人信息的入口
  tapUserInfomation: function () {
    wx.navigateTo({
      url: '../user_infomation/user_infomation',
    })
  },

  tapAuth: function (e) {
    if (e.userInfo) {
      wx.setStorageSync('wxUserInfo', e.userInfo);
      this.setData({
        wxUserInfo: e.userInfo,
      })
    }
  },

  // 检查用户是否登录
  detecIfUserLogin: function () {
    var userInfo = loginMgr.fetchUserInfo();
    if (userInfo.isLogin) {
      var prefix = userInfo.user.tel.substring(0, 3);  // 手机前缀
      var suffix = userInfo.user.tel.substring(7, 11); // 手机后缀
      var level = userInfo.glory.level;
      var imgURL = '/Resource/images/Card/level_'
      if (level < 6) {
        imgURL = imgURL + level.toString() + '.png';
      };
      this.setData({
        isLogin: true,
        userInfo: userInfo,
        showTel: prefix + '****' + suffix,
        imgLevelSrc: imgURL,
      });
      this.fetchCouponGroup();
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
    var funcFail = function loginFail() {
    };
    if(!isCounting){
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
      that.setData({ isLogin: true });
      that.closeAlert();
      that.detecIfUserLogin();
    };
    // 登录失败回调
    var funcFail = function loginFail(objData) {
    };
    loginMgr.didTapValidate(phoneNumber, validCode, funcSucc, funcFail);
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