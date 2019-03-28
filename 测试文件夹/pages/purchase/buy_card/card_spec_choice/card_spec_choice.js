// mall.js
var basereq = require('../../../../utils/base_req.js');
// 引入loginMgr
var loginMgr = require('../../../../utils/loginManager/loginMgr.js');
//引入金额规范 amount_standard
var amountStd = require('../../../../utils/amount_standard.js');
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
    totalPrice: 0,
    showToastIndex: '',
    cardGroupID: undefined,
    cardSpecList: [],
    cardGroupInfo: {},
    cardTypeInfo: {},
    focusInputPhone: false,
    focusInputValidCode: false,
    isLoading: true, //卡片组列表是否真在加载
    isLoadingFail: false, //卡片组列表是否加载失败
    reLoadingTipMsg: '网络似乎不太好...',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '礼品卡',
    });
    var strJSON = options.dataString; //字符串
    var objCard = JSON.parse(strJSON); // 转成对象
    this.setData({
      cardInfo: objCard.selectedCard,
      domain: basereq.domain
    });
    this.detecIfUserLogin();
    this.fetchCardSpecList();
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
    this.detecIfUserLogin();
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

  tapReloadCards: function () {
    this.setData({
      isLoading: true,
      isLoadingFail: false,
    });
    this.fetchCardSpecList();
  },

  /********** 网络请求 **********/
  // 请求卡片组列表
  fetchCardSpecList: function () {
    var dataBody = {};
    dataBody.cardDefineId = this.data.cardInfo.id;
    var encStr = basereq.encryptParam(dataBody);
    var that = this;
    wx.request({
      url: basereq.interfaceName + 'card/getCardDefineInfoById',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var cardDefineInfo = res.data.data.cardDefineInfo;
        that.setData({
          cardDefineInfo: cardDefineInfo,
          cardSpecList: cardDefineInfo.cardticketdefines,
          cardGroupInfo: cardDefineInfo.cardgroup,
          cardTypeInfo: cardDefineInfo.cardtype,
          isLoading: false,
        });
        that.saleAmountHandle();
      },
      fail: function (res) {
        that.setData({
          isLoadingFail: true,
        });
      }
    })
  },

  //金额规范
  saleAmountHandle: function () {
    var cardSpecList = this.data.cardSpecList;
    for (var i = 0; i < cardSpecList.length; i++) {
      //先调金额规范方法，将金额规范化
      var price = cardSpecList[i].saleamount;
      var selectQty = 0;
      var showPrice = amountStd.amountStandard(price);
      var maxUsableQty = 0;
      if (cardSpecList[i].usableqty >= cardSpecList[i].limitqty) {
        maxUsableQty = cardSpecList[i].limitqty;
      } else {
        // 库存小于限购量 则最大可选数量为库存
        maxUsableQty = cardSpecList[i].usableqty;
      }
      cardSpecList[i].maxUsableQty = maxUsableQty;
      cardSpecList[i].showPrice = showPrice;
      cardSpecList[i].selectQty = selectQty;
    }
    this.setData({
      cardSpecList: cardSpecList
    })
  },

  // 点击减号
  tapMinus: function (event) {
    var tapIndex = event.currentTarget.dataset.index;
    var cardSpecList = this.data.cardSpecList;
    var saleAmount = cardSpecList[tapIndex].saleamount; //当前操作规格数量单价
    var selectQty = cardSpecList[tapIndex].selectQty; //当前操作规格数量
    var totalPrice = this.data.totalPrice;   //当前总价
    if (selectQty <= 0) {
      return;
    }
    selectQty--;
    cardSpecList[tapIndex].selectQty = selectQty;
    var currentSpecPrice = saleAmount;
    totalPrice -= currentSpecPrice;
    this.setData({
      cardSpecList: cardSpecList,
      totalPrice: totalPrice
    })
    this.calculateAmount();
  },

  // 点击加号
  tapAdd: function (event) {
    var tapIndex = event.currentTarget.dataset.index;
    var cardSpecList = this.data.cardSpecList;
    var saleAmount = cardSpecList[tapIndex].saleamount; //当前操作规格数量单价
    var selectQty = cardSpecList[tapIndex].selectQty; //当前操作规格数量
    var totalPrice = this.data.totalPrice;   //当前总价 onSellOut
    if (selectQty >= cardSpecList[tapIndex].maxUsableQty) {
      return;
    }
    selectQty++;
    cardSpecList[tapIndex].selectQty = selectQty;
    var currentSpecPrice = saleAmount;
    totalPrice += currentSpecPrice;
    this.setData({
      cardSpecList: cardSpecList,
      totalPrice: totalPrice
    })
    this.calculateAmount();
  },

  // 计算总价
  calculateAmount: function () {
    var totalPrice = this.data.totalPrice;
    totalPrice = amountStd.amountStandard(totalPrice);
    totalPrice = parseInt(totalPrice);
    this.setData({
      totalPrice: totalPrice,
    })
  },

  // 支付方式
  fetchPaymentMode: function () {
    var dataBody = {};
    var items = [];
    dataBody.type = '1';
    dataBody.userId = this.data.userInfo.user.id;
    dataBody.accessToken = this.data.userInfo.user.accesstoken;
    var cardSpecList = this.data.cardSpecList;
    for (var i = 0; i < cardSpecList.length;i++){
      if (cardSpecList[i].selectQty > 0) {
        var item = {};
        item.id = cardSpecList[i].id.toString();
        item.qty = cardSpecList[i].selectQty;
        items.push(item);
      }
    }
    // items转为字符串
    dataBody.items = JSON.stringify(items);
    var that = this;
    var encStr = basereq.encryptParam(dataBody);
    wx.showLoading({

    });
    wx.request({
      url: basereq.interfaceName + 'payment/item/availablePayType',
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
          var paymentMode = res.data.data;
          var cashierInfo = {}; // 用于传递给收银台的数据
          var itemList = [];

          // 物品（卡）
          for (var i = 0; i < cardSpecList.length; i++) {
            if (cardSpecList[i].selectQty > 0) {
              var item = {};
              item.id = cardSpecList[i].id.toString(); // id
              item.qty = cardSpecList[i].selectQty; // 选择数量
              item.price = cardSpecList[i].saleamount; // 单价
              item.name = that.data.cardDefineInfo.name; // 名称
              item.spec = cardSpecList[i].spec; // 规格
              item.cardTypeNumber = that.data.cardTypeInfo.number; // 卡片类型
              itemList.push(item);
            }
          }

          cashierInfo.itemList = itemList; // 物品列表
          cashierInfo.totalPrice = that.data.totalPrice; // 物品总价
          cashierInfo.paymentData = paymentMode; // 支付列表
          cashierInfo.type = 1;
          cashierInfo.orderId = ''; // 是否已下单
          var valueString = 'dataString=' + JSON.stringify(cashierInfo);
          //跳转收银台页
          wx.navigateTo({
            url: '../../../cashier_desk/cashier_desk?' + valueString,
          })
        } else if (suffix == "07") {
          // 登录过期需要重新登录
          that.showAlert();
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
        wx.showToast({
          title: res.errMsg,
          image: '/Resource/images/cross.png',
          duration: 3000
        });
      }
    })
  },

  //卡片数量为零弹窗
  onSellOut: function () {
    wx.showModal({
      title: '库存不足',
      content: '',
      success: function (res) { }
    })
  },

  // 点击购买
  tapBuy: function (event) {
    var totalPrice = this.data.totalPrice;
    // 已登录
    if (this.data.isLogin) {
      // 购物车中是否选择了商品
      if (this.data.totalPrice <= 0) {
        // 没有选择任何卡片
        wx.showToast({
          title: '还未选择商品',
          image: '/Resource/images/cross.png',
        })
      } else {
        // 已经选择了
        this.fetchPaymentMode();
      }
    } else {
      // 未登录弹出登录框
      this.showAlert();
    }
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
  }
})