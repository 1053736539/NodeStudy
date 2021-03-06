// mall.js
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
    selectedIndex: -1, // 已选择的索引
    selectPrice: '',
    showToastIndex: '',
    isLoading: true, //卡片组列表是否真在加载
    isLoadingFail: false, //卡片组列表是否加载失败
    reLoadingTipMsg: '网络似乎不太好...',
    cardGroupID: undefined,
    cardSpecList: [],
    cardGroupInfo: {},
    cardTypeInfo: {},
    focusInputPhone: false,
    focusInputValidCode: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '面额卡',
    });
    var strJSON = options.dataString; //字符串
    var objCard = JSON.parse(strJSON); // 转成对象
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
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.detecIfUserLogin();
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

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  tapReloadCards: function() {
    this.setData({
      isLoading: true,
      isLoadingFail: false,
    });
    this.fetchCardGroup();
  },

  /********** 网络请求 **********/
  // 请求卡片组列表
  fetchCardGroup: function() {
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
      success: function(res) {
        var CardGroup = res.data.data.cardDefineList[0];
        var selectedIndex = -1;
        // 添加选择数量属性
        for (var i = 0; i < CardGroup.cardticketdefines.length; i++) {
          var item = CardGroup.cardticketdefines[i];
          //自动选中首个库存非零的卡片
          if (item.usableqty > 0) {
            selectedIndex = i;
            break;
          };
        }
        var selectPrice = CardGroup.cardticketdefines[selectedIndex].saleamount;
        selectPrice = amountStd.amountStandard(selectPrice);
        that.setData({
          cardDefineInfo: CardGroup,
          cardSpecList: CardGroup.cardticketdefines,
          cardGroupInfo: CardGroup.cardgroup,
          cardTypeInfo: CardGroup.cardtype,
          selectedIndex: selectedIndex,
          selectPrice: selectPrice,
          isLoading: false,
        });
        that.saleAmountHandle();
      },
      fail: function(res) {
        that.setData({
          isLoadingFail: true,
        });
      }
    })
  },

  //处理请求到的面额卡金额
  saleAmountHandle: function() {
    var cardSpecList = this.data.cardSpecList;
    for (var i = 0; i < cardSpecList.length; i++) {
      //先调金额规范方法，将金额规范化
      var price = cardSpecList[i].saleamount;
      var showPrice = amountStd.amountStandard(price);
      cardSpecList[i].showPrice = showPrice;
      //对规范后的价格做文案显示处理
      if (cardSpecList[i].saleamount == cardSpecList[i].amount) {
        cardSpecList[i].showText = cardSpecList[i].showPrice + '元';
      } else if (!cardSpecList[i].amount) {
        cardSpecList[i].showText = cardSpecList[i].showPrice + '元';
      } else {
        cardSpecList[i].showText = cardSpecList[i].showPrice + '元 (加送' + (cardSpecList[i].amount - cardSpecList[i].saleamount) + '元)'
      };
    }
    this.setData({
      cardSpecList: cardSpecList
    })
  },


  // 支付方式
  fetchPaymentMode: function() {
    var dataBody = {};
    var items = [];
    dataBody.type = '1';
    dataBody.userId = this.data.userInfo.user.id;
    dataBody.accessToken = this.data.userInfo.user.accesstoken;
    var i = this.data.selectedIndex;
    var cardSpecList = this.data.cardSpecList[i];
    if (this.data.selectedIndex >= 0) {
      var item = {};
      item.id = cardSpecList.id.toString();
      item.qty = '1';
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
      success: function(res) {
        wx.hideLoading();

        var code = res.data.code.toString();
        var suffix = code.substr(code.length - 2, 2);
        if (suffix == '00') {
          var paymentMode = res.data.data;
          var cashierInfo = {}; // 用于传递给收银台的数据
          var itemList = [];
          // 物品（卡）
          var item = {};
          item.id = cardSpecList.id.toString(); // id
          item.qty = '1'; // 选择数量
          item.price = cardSpecList.saleamount; // 单价
          item.name = that.data.cardDefineInfo.name; // 名称
          item.spec = cardSpecList.spec; // 规格
          item.cardTypeNumber = that.data.cardTypeInfo.number; // 卡片类型
          itemList.push(item);
          cashierInfo.itemList = itemList; // 物品列表
          cashierInfo.totalPrice = cardSpecList.saleamount; // 物品总价
          cashierInfo.paymentData = paymentMode; // 支付列表
          cashierInfo.type = 1;
          cashierInfo.orderId = ''; // 是否已下单
          if (that.data.cardTypeInfo.number == '010') {
            // 早春卡
            cashierInfo.needEffecttime = true;
          }
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
      fail: function(res) {
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
  onSellOut: function() {
    wx.showModal({
      title: '库存不足',
      content: '因为库存发生变化，该笔订单下单失败',
      success: function(res) {}
    })
  },

  //展开规格选择框
  didTapOnfold: function(e) {
    var selectedIndex = this.data.selectedIndex;
    this.setData({
      showToastIndex: selectedIndex
    })
    this.setModalStatus(e);
  },

  //点击确认
  didTapSure: function(e) {
    var showToastIndex = this.data.showToastIndex;
    var selectPrice = this.data.cardSpecList[showToastIndex].saleamount;
    selectPrice = amountStd.amountStandard(selectPrice);
    this.setData({
      selectedIndex: showToastIndex,
      selectPrice: selectPrice,
    })
    this.setModalStatus(e);
  },

  //点击某个卡片
  onCardClick: function(event) {
    // 当前选择的索引
    var showToastIndex = event.currentTarget.dataset.index;
    var results = this.data.cardSpecList;
    var card = results[showToastIndex];
    if (card.usableqty <= 0) {
      this.onSellOut();
    } else {
      this.setData({
        showToastIndex: showToastIndex,
      })
    }

    // 事件
    var user_id = this.data.isLogin ? this.data.userInfo.user.id : '';
    var user_level = this.data.isLogin ? this.data.userInfo.glory.level : '';
    var selectedCard = this.data.cardSpecList[this.data.selectedIndex];
    wx.reportAnalytics('select_card', {
      user_id: user_id.toString(),
      membership_level: user_level.toString(),
      card_group_type: this.data.cardTypeInfo.number.toString(),
      card_group_id: this.data.cardGroupID.toString(),
      card_group_name: this.data.cardGroupInfo.name,
      card_id: selectedCard.id.toString(),
      card_name: selectedCard.name,
      card_price: selectedCard.saleamount.toString(),
    });
  },


  // 点击购买
  tapBuy: function(event) {
    // 已登录
    if (this.data.isLogin) {
      // 购物车中是否选择了商品
      if (this.data.selectedIndex < 0) {
        // 没有选择任何卡片
        wx.showToast({
          title: '还未选择商品',
          image: '/Resource/images/cross.png',
        })
      } else {
        // 已经选择了
        // 跳转收银台页
        this.fetchPaymentMode();
        // 事件
        var selectedCard = this.data.cardSpecList[this.data.selectedIndex];
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
      if (this.data.selectedIndex > 0) {
        var selectedCard = this.data.cardSpecList[this.data.selectedIndex];
        // 事件
        wx.reportAnalytics('buy_card', {
          user_id: '',
          membership_level: '',
          card_group_type: this.data.cardTypeInfo.number.toString(),
          card_group_id: this.data.cardGroupID.toString(),
          card_group_name: this.data.cardGroupInfo.name,
          card_id: selectedCard.id.toString(),
          card_name: selectedCard.name,
          card_price: selectedCard.saleamount.toString(),
        });
      }
    }
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

  // 面额卡规格选择弹窗
  setModalStatus: function(e) {
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      animationData: animation.export()
    })
    if (e.currentTarget.dataset.status == 1) {
      this.setData({
        showModalStatus: true
      });
    }
    setTimeout(function() {
      animation.translateY(0).step()
      this.setData({
        animationData: animation
      })
      if (e.currentTarget.dataset.status == 0) {
        this.setData({
          showModalStatus: false
        });
      }
    }.bind(this), 200)
  },
})