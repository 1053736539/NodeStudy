//wallet.js
//获取应用实例
var app = getApp()
// 引入base_req
var basereq = require('../../utils/base_req.js');
// 引入loginMgr
var loginMgr = require('../../utils/loginManager/loginMgr.js');
var param = {
  data: {
    domain: '',
    phoneNumber: '',
    validCode: '',
    isLogin: false,
    canShowAlert: false,
    second: '发送验证码',
    isCounting: false,
    userInfo: {},
    isCardTypeLoading: true,     //卡片组列表是否真在加载
    cardTypeLoadingFail: false,  //卡片组列表是否加载失败
    reLoadingTipMsg: '网络似乎不太好...',
    cardsGroupList: [],
    ticketsGroupList: [],
    showCardsList: [],
    showTicketsList: [],
    totalCards: 0,
    totalTickets: 0,
    focusInputPhone: false,
    focusInputValidCode: false
  },

  /********** 网络请求 **********/
  // 请求卡组列表
  fetchCardType: function () {
    var dataBody = {};
    dataBody.userId = this.data.userInfo.user.id;
    dataBody.startPage = '1';
    dataBody.pageSize = '4';
    dataBody.accessToken = this.data.userInfo.user.accesstoken;
    var encStr = basereq.encryptParam(dataBody);
    var that = this;
    wx.request({
      url: basereq.interfaceName + 'card/getCarBag',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        console.error(res)
        var code = res.data.code.toString();
        var suffix = code.substr(code.length - 2, 2);
        if (suffix == '00') {
          var cardBag = res.data.data;
          var showCards = [];
          var showTickets = [];
          // 券最多显示1项
          if (cardBag.ticket_list.cardOrTicketList.length > 0) {
            var ticketItem = cardBag.ticket_list.cardOrTicketList[0];
            showTickets.push(ticketItem);
          }
          // 卡最多显示3个项
          for (var i = 0; i < 3; i++) {
            if (cardBag.card_list.cardOrTicketList.length > i) {
              var cardItem = cardBag.card_list.cardOrTicketList[i];
              showCards.push(cardItem);
            };
          }
          that.setData({
            isCardTypeLoading: false,
            cardsGroupList: cardBag.card_list.cardOrTicketList,
            ticketsGroupList: cardBag.ticket_list.cardOrTicketList,
            showCardsList: showCards,
            showTicketsList: showTickets,
            totalCards: cardBag.card_list.total,
            totalTickets: cardBag.ticket_list.total
          });
        } else if (suffix == '07') {
          // 登录过期
          wx.showToast({
            title: res.data.msg,
            image: '/Resource/images/cross.png',
            duration: 3000
          });
          that.setData({
            isLogin: false,
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
        that.setData({
          cardTypeLoadingFail: true,
        });
      },
      complete: function () {
        wx.stopPullDownRefresh();
      }
    })
  },

  // 点击了卡片
  didTapCard: function (event) {
    var card = event.currentTarget.dataset.card;
    var prefixURL = '';
    if (card.carddefine.cardtype.number == '001') {
      // 面额卡
      prefixURL = './use_balance_card/use_balance_card?';
    } else if (card.carddefine.cardtype.number == '002') {
      // 活动卡
      prefixURL = './use_activity_card/use_activity_card?';
    } else if (card.carddefine.cardtype.number == '003' || card.carddefine.cardtype.number == '006') {
      // 礼品卡
      prefixURL = './use_gift_card/use_gift_card?';
    } else if (card.carddefine.cardtype.number == '000') {
      // 会员券
      prefixURL = './use_ticket/use_ticket?';
    } else if (card.carddefine.cardtype.number == '008') {
      // 员工券
      prefixURL = './use_ticket/use_ticket?';
    } else if (card.carddefine.cardtype.number == '010') {
      // 早春卡
      prefixURL = './use_activity_card/use_activity_card?';
    } else if (card.carddefine.cardtype.number == '013') {
      // 代金券  230新增
      prefixURL = './use_ticket/use_ticket?';
    } else if (card.carddefine.cardtype.number == '011') {
      // 麦粉卡
      prefixURL = './use_gift_card/use_gift_card?';
    } else if (card.carddefine.cardtype.number == '012') {
      // 体验券
      prefixURL = './use_ticket/use_ticket?';
    } else if (card.carddefine.cardtype.number == '014'){
      //预约卡
      prefixURL = './use_appointment_card/use_appointment_card?';
    }else{
      return;
    }
    var cardJSON = JSON.stringify(card);
    var valueString = 'dataString=' + cardJSON;
    wx.navigateTo({
      url: prefixURL + valueString,
    });

    // 事件
    wx.reportAnalytics('view_use_card', {
      user_id: this.data.userInfo.user.id.toString(),
      membership_level: this.data.userInfo.glory.level.toString(),
    });
  },

  tapCheckMoreTickets: function (e) {
    var jumpURL = './ticket_list/ticket_list';
    wx.navigateTo({
      url: jumpURL,
    });
    // 事件
    wx.reportAnalytics('view_ticket_list', {
      user_id: this.data.userInfo.user.id.toString(),
      membership_level: this.data.userInfo.glory.level.toString(),
    });
  },

  tapCheckMoreCards: function (e) {
    var jumpURL = './card_list/card_list';
    wx.navigateTo({
      url: jumpURL,
    });
    // 事件
    wx.reportAnalytics('view_card_list', {
      user_id: this.data.userInfo.user.id.toString(),
      membership_level: this.data.userInfo.glory.level.toString(),
    });
  },

  tapBindCard: function () {
    wx.navigateTo({
      url: './bind_card/bind_card',
    })
  },

  // dolaoding
  doLoading: function (e) {
    // e表示点击事件的对象event
  },

  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '我的卡包',
    });

    this.setData({
      domain: basereq.domain
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.closeAlert();
    // 判断用户是否已登录
    this.detecIfUserLogin();
    var userInfo = loginMgr.fetchUserInfo();
    if (userInfo.isLogin) {
      this.fetchCardType(); //卡列表请求
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    if (this.data.isLogin) {
      this.fetchCardType();
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
        userInfo: {}
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
    var that = this;
    // 登录成功回调
    var funcSucc = function loginSucc() {
      that.setData({ isLogin: true });
      that.closeAlert();
      that.detecIfUserLogin();
      wx.hideLoading();
      that.fetchCardType();
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
  },
  // 点击重新加载卡片列表
  tapReloadCards: function (event) {
    // 数据重置
    this.setData({
      isCardTypeLoading: true,
      cardTypeLoadingFail: false,
      cardsGroupList: [],
    });
    // 请求卡片列表
    this.fetchCardType();
  },
};

Page(param);
