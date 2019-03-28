// pages/cards/receive/receive.js
var loginMgr = require('../../../utils/loginManager/loginMgr.js');
var basereq = require('../../../utils/base_req.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    domain: '',
    isLogin: false,
    userInfo: {},
    canShowAlert: false,
    phoneNumber: '',
    validCode: '',
    second: '发送验证码',
    isCounting: false,
    cardInfo: {},
    senderInfo: {},
    showTel: '',
    focusInputPhone: false,
    focusInputValidCode: false,
    isLoading: true,
    loadingFail: false,
    canReceiveCode: '',
    tipMsg: '',
    reLoadingTipMsg: '网络似乎不太好...',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.detecIfUserLogin();
    var strJSON = options.dataString; //字符串
    var objData = JSON.parse(strJSON);// 转成对象
    var prefix = objData.senderInfo.tel.substring(0, 3);  // 手机前缀
    var suffix = objData.senderInfo.tel.substring(7, 11); // 手机后缀
    this.setData({
      cardInfo: objData.cardInfo,
      senderInfo: objData.senderInfo,
      showTel: prefix + '****' + suffix,
      domain: basereq.domain
    });
    if (this.data.isLogin) {
      this.fetchCardChecking();
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

  tapReceive: function (e) {
    this.detecIfUserLogin();
    if (this.data.isLogin) {
      // 已登录请求卡片流转
      this.fetchReceiveCard();
    } else {
      // 未登录弹出登录框
      this.showAlert();
    }

    // 事件
    wx.reportAnalytics('receive_card', {
      card_id: this.data.cardInfo.cardId.toString(),
      card_name: this.data.cardInfo.name,
    });
  },

  tapReloadCards: function () {
    this.setData({
      isLoading: true,
      isLoadingFail: false,
    });
    this.fetchCardChecking();
  },

  // 请求卡状态 
  fetchCardChecking: function () {
    var card = this.data.cardInfo;
    var userInfo = this.data.userInfo;
    var senderInfo = this.data.senderInfo;
    // 发起卡片流转请求
    var dataBody = {};
    dataBody.cardId = card.cardId;
    dataBody.senderId = senderInfo.userId;
    dataBody.userId = userInfo.user.id;
    dataBody.accessToken = userInfo.user.accesstoken;
    dataBody.code = card.receiveCode;
    var encStr = basereq.encryptParam(dataBody);
    var that = this;

    wx.request({
      url: basereq.interfaceName + 'card/checkCardUser',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var code = res.data.code.toString();
        var tipMsg = res.data.msg;

        if (code == '100007') {
          // 登录过期
          wx.showToast({
            title: res.data.msg,
            image: '/Resource/images/cross.png',
            duration: 3000
          });
          // 弹出登录窗
          that.showAlert();
        } else if (code == '100001') {
          // 参数错误
          that.setData({
            loadingFail: true,
          });
        } else {
          // if (code == '201600') {
          //   // 超过24小时未被领取
          // } else if (code == '201601') {
          //   // 等待好友领取
          // } else if (code == '201602') {
          //   // 好友已领取
          // } else if (code == '201603') {
          //   // 超过24小时未领取
          // } else if (code == '201604') {
          //   // 可领取
          // } else if (code == '201605') {
          //   // 已经领取过这份礼物了
          // } else if (code == '201606') {
          //   // 检查卡用户失败
          // } else {
          // }
          that.setData({  
            canReceiveCode: code,
            tipMsg: tipMsg,
            isLoading: false
          });
        }
      },
      fail: function (res) {
        that.setData({
          loadingFail: true,
        });
      }
    })
  },

  /********** 发起卡片流转请求 **********/
  fetchReceiveCard: function () {
    var card = this.data.cardInfo;
    var userInfo = this.data.userInfo;
    // 发起卡片流转请求
    wx.showLoading({
      title: '',
    })
    var dataBody = {};
    dataBody.userId = userInfo.user.id;
    dataBody.cardId = card.cardId;
    dataBody.status = '2';
    dataBody.accessToken = userInfo.user.accesstoken;
    dataBody.code = card.receiveCode;
    var encStr = basereq.encryptParam(dataBody);
    var that = this;

    wx.request({
      url: basereq.interfaceName + 'card/changeCard',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.hideLoading();
        var dataBody = {};
        dataBody.cardInfo = that.data.cardInfo;
        dataBody.receiveInfo = res.data;
        var dataString = JSON.stringify(dataBody);
        wx.navigateTo({
          url: './receiveSuccess/receiveSuccess?' + 'dataString=' + dataString,
        })
      },
      fail: function (res) {
        wx.hideLoading();
      }
    })
  },

  // 检查用户是否登录
  detecIfUserLogin: function () {
    // 判断用户是否已登录
    // var that = this;
    // wx.getStorage({
    //   key: 'userInfo',
    //   success: function (res) {
    //     var userInfo = res.data;
    //     if (userInfo.isLogin) {
    //       that.setData({
    //         isLogin: true,
    //       });
    //     };
    //   }
    // })
    var userInfo = loginMgr.fetchUserInfo();
    if (userInfo.isLogin) {
      this.setData({
        isLogin: true,
        userInfo: userInfo
      });
    } else {
      this.setData({
        isLogin: false,
        userInfo: {},
        isLoading: false,
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
    if (!isCounting) {
      loginMgr.didTapGetVerify(phoneNumber, funcSucc, funcFail);
    }
  },

  // 点击验证
  didTapValidate: function () {

    var validCode = this.data.validCode;
    var phoneNumber = this.data.phoneNumber;
    phoneNumber = loginMgr.serializePhoneNumber(phoneNumber);
    var that = this;
    // 登录成功回调
    var funcSucc = function loginSucc() {
      that.detecIfUserLogin();
      that.closeAlert();
      // 刷新页面
      that.setData({
        isLoading: true
      });
      that.fetchCardChecking();
    };
    // 登录失败回调
    var funcFail = function loginFail(objData) {
    };
    if (this.data.senderInfo.staff_identity == '1') {
      // 麦隆员工推荐
      var send_user_id = this.data.senderInfo.userId;
      loginMgr.loginWithPhoneCodeWithSenderID(phoneNumber, validCode, funcSucc, funcFail, send_user_id);
    } else {
      // 普通用户登录
      loginMgr.didTapValidate(phoneNumber, validCode, funcSucc, funcFail);
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