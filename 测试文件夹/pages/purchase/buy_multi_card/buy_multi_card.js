// pages/purchase/buy_multi_card/buy_multi_card.js
var basereq = require('../../../utils/base_req.js');
// 引入loginMgr
var loginMgr = require('../../../utils/loginManager/loginMgr.js');
//引入金额规范 amount_standard
var amountStd = require('../../../utils/amount_standard.js');
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
    focusInputPhone: false,
    focusInputValidCode: false,
    sel_count: 1,
    maxUsableQty: 0,
    totalAmount: 0,
    cardGroupID:undefined,
    cardDefineInfo: {},
    cardGroupInfo: {},
    cardTypeInfo:{},
    cardIns: {},
    isLoading:true,
    isLoadingFail: false,
    reLoadingTipMsg: '网络似乎不太好...',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var strJSON = options.dataString; //字符串
    var objCard = JSON.parse(strJSON);// 转成对象
    this.setData({
      cardGroupID: objCard.cardInfo.id,
      domain: basereq.domain
    });
    this.detecIfUserLogin();
    this.fetchCardGroup();
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  tapReloadCards: function () {
    this.setData({
      isLoading: true,
      isLoadingFail: false,
    });
    this.fetchCardGroup();
  },

  // 请求卡组详情
  fetchCardGroup: function () {
    var dataBody = {};
    dataBody.cardGroupId = this.data.cardGroupID;
    dataBody.startPage = '1';
    dataBody.pageSize = '999';
    var encStr = basereq.encryptParam(dataBody);
    var that = this;
    wx.request({
      url: basereq.interfaceName + 'card/getRechargeCardDefineListbyGroupId',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var CardGroup = res.data.data.cardDefineList[0];
        if (CardGroup.cardticketdefines.length > 0) {
          var selectedIndex = 0;
          // 添加选择数量属性
          var item = CardGroup.cardticketdefines[selectedIndex];
          // 库存大于等于限购量 则最大可选数量为限购量
          var maxUsableQty = 0;
          if (item.usableqty >= item.limitqty) {
            maxUsableQty = item.limitqty;
          } else {
            // 库存小于限购量 则最大可选数量为库存
            maxUsableQty = item.usableqty;
          }
          //金额规范化显示
          var price = item.saleamount;
          var showPrice = amountStd.amountStandard(price);
          item.showPrice = showPrice;
          
          that.setData({
            cardDefineInfo: CardGroup,
            cardGroupInfo: CardGroup.cardgroup,
            cardTypeInfo:CardGroup.cardtype,
            selectedIndex: selectedIndex,
            cardIns: item,
            maxUsableQty: maxUsableQty,
            isLoading: false
          });
          wx.setNavigationBarTitle({
            title: CardGroup.cardgroup.name,
          });
          // 计算总价
          if (maxUsableQty > 0) {
            that.calculateAmount();
          }
        }
      },
      fail: function (res) {
        that.setData({
          isLoadingFail: true,
        });
      }
    })
  },

  // 支付方式
  fetchPaymentMode: function () {
    var dataBody = {};
    var items = [];
    dataBody.type = '1';
    dataBody.userId = this.data.userInfo.user.id;
    dataBody.accessToken = this.data.userInfo.user.accesstoken;
    var cardItem = this.data.cardIns;
    if (cardItem) {
      var item = {};
      item.id = cardItem.id.toString();
      item.qty = this.data.sel_count;
      items.push(item);
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
          var item = {};
          item.id = cardItem.id.toString();               // id
          item.qty = that.data.sel_count.toString();      // 选择数量
          item.price = cardItem.saleamount;               // 单价
          item.name = that.data.cardDefineInfo.name;                      // 名称
          item.spec = cardItem.spec;                            // 规格
          item.cardTypeNumber = that.data.cardTypeInfo.number; // 卡片类型
          itemList.push(item);
          cashierInfo.itemList = itemList;                // 物品列表
          cashierInfo.totalPrice = that.data.totalAmount; // 物品总价
          cashierInfo.paymentData = paymentMode;          // 支付列表
          cashierInfo.type = 1;
          cashierInfo.orderId = '';                       // 是否已下单
          var valueString = 'dataString=' + JSON.stringify(cashierInfo);
          //跳转收银台页
          wx.navigateTo({
            url: '../../cashier_desk/cashier_desk?' + valueString,
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

  // 点击减号
  tapMinus: function () {
    var curCount = this.data.sel_count;
    if (curCount <= 1) {
      return;
    }
    curCount--;
    this.setData({
      sel_count: curCount
    })
    this.calculateAmount();
  },

  // 点击加号
  tapAdd: function () {
    var curCount = this.data.sel_count;
    if (curCount >= this.data.maxUsableQty) {
      return;
    }
    curCount++;
    this.setData({
      sel_count: curCount
    })
    this.calculateAmount();
  },

  // 计算总价
  calculateAmount: function () {
    var total = 0;
    var curCount = this.data.sel_count;
    var price = this.data.cardIns.saleamount;
    total = price * curCount;
    var totalPrice = amountStd.amountStandard(total);
    this.setData({
      totalAmount: totalPrice,
    })
  },

  tapPurchase: function () {
    // 已登录
    if (this.data.isLogin) {
      // 购物车中是否选择了商品
      if (this.data.maxUsableQty <= 0) {
        // 没有库存
        return;
      } else {
        // 已经选择了
        // 跳转收银台页
        this.fetchPaymentMode();
        // 事件
        var selectedCard = this.data.cardDefineInfo.cardticketdefines[this.data.selectedIndex];
        wx.reportAnalytics('buy_card', {
          user_id: this.data.userInfo.user.id.toString(),
          membership_level: this.data.userInfo.glory.level.toString(),
          card_group_type: this.data.cardTypeInfo.number.toString(),
          card_group_id: this.data.cardGroupID.toString(),
          card_group_name: this.data.cardGroupInfo.name,
          card_id: selectedCard.id.toString(),
          card_name: selectedCard.name,
          card_price: selectedCard.saleamount.toString(),
        });
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
      that.detecIfUserLogin();
      that.closeAlert();
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