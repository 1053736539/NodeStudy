// cashier_desk.js
//获取应用实例
var app = getApp();
var basereq = require('../../utils/base_req.js');
// 引入loginMgr
var loginMgr = require('../../utils/loginManager/loginMgr.js');
//引入金额规范 amount_standard
var amountStd = require('../../utils/amount_standard.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    paymentIndex: 0, // 点击支付方式参数
    userInfo: {},
    paymentInfo: {}, // 支付信息 包含如下信息节点:
    // orderId          订单号 为空则说明需要下单
    // itemList         用于收银台展示的商品列表
    // paymentData      支付方式数据(包含支付方式列表、余额等数据)
    // totalPrice       总价
    // type             1:卡片类型 2:实物商品类型 3:咖啡机订单类型
    // cardTypeNumber   卡类型（只有卡片商品才有这个字段）
    // needEffecttime   是否需要计时（早春卡购买，需要计算从扫码到下单的时间）
    totalPrice: 0, //总价格，用于保持查询优惠券时的价格
    totalDiscountPrice: 0, // 总折扣价
    isCoffeeMachine: false,
    name: '',
    couponInfo: {},
    couponList: [],
    orderInfo: {},
    couponQty: 0, //可用咖啡券数量
    isBindcoupon: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '确认订单',
    });

    // 卡片信息
    var strJSON = options.dataString; //字符串
    var objData = JSON.parse(strJSON); // 转成对象
    var userInfo = loginMgr.fetchUserInfo();
    var totalDiscountPrice = objData.totalPrice;
    totalDiscountPrice = amountStd.amountStandard(totalDiscountPrice);
    // 数据初始化
    this.setData({
      totalPrice: objData.totalPrice, // 总价
      totalDiscountPrice: totalDiscountPrice,
      paymentInfo: objData,
      userInfo: userInfo,
    });

    // 获取优惠券
    this.fetchCouponGroup();
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

  //下单
  fetchOrderCreat: function() {
    var dataBody = {};
    var items = [];
    dataBody.userId = this.data.userInfo.user.id;
    dataBody.accessToken = this.data.userInfo.user.accesstoken;
    dataBody.type = this.data.paymentInfo.type;
    for (var i = 0; i < this.data.paymentInfo.itemList.length; i++) {
      var item = {};
      var itemInfor = this.data.paymentInfo.itemList[i];
      item.qty = itemInfor.qty;
      item.id = itemInfor.id;
      items.push(item);
    }
    // items转为字符串
    dataBody.items = JSON.stringify(items);
    // 早春卡计时
    if (this.data.paymentInfo.needEffecttime) {
      var scanInfo = wx.getStorageSync('scanInfo');
      if (scanInfo) {
        dataBody.shop_id = scanInfo.shopID;
        var timestamp = Date.parse(new Date());
        timestamp = timestamp / 1000;
        // 时长为下单时间减扫码时间
        var effecttime = timestamp - scanInfo.scanDate;
        dataBody.effecttime = effecttime;
      }
    }
    var that = this;
    var encStr = basereq.encryptParam(dataBody);
    wx.showLoading({
      title: '生成订单',
    })
    wx.request({
      url: basereq.interfaceName + 'order/create',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        wx.hideLoading();
        var orderId = res.data.data.orderId;
        var code = res.data.code;
        var suffix = code.substr(code.length - 2, 2);
        if (suffix == '00') {
          var paymentData = that.data.paymentInfo.paymentData;
          var paymentIndex = that.data.paymentIndex;
          //微信支付类型
          if (paymentData.payType[paymentIndex].number == '1002') {
            that.fetchWeixinPaymentReady(orderId);
          };
          //余额支付类型
          if (paymentData.payType[paymentIndex].number == '1005') {
            that.fetchBalancePayment(orderId);
          };

          // 事件
          if (that.data.paymentInfo.type == 1) {
            // 卡片商品
            wx.reportAnalytics('order_card', {
              user_id: that.data.userInfo.user.id.toString(),
              order_id: res.data.data.orderId.toString(),
              order_price: that.data.totalDiscountPrice.toString(),
            });
          }
        } else {
          if (suffix == '02') {
            wx.showToast({
              title: '库存不足',
              image: '/Resource/images/cross.png',
            });
          } else if (suffix == '05') {
            wx.showToast({
              title: res.data.msg,
              image: '/Resource/images/cross.png',
            });
          } else {
            wx.showToast({
              title: '下单失败',
              image: '/Resource/images/cross.png',
            });
          }
        }

      },
      fail: function(res) {
        wx.showToast({
          title: '下单失败',
          image: '/Resource/images/cross.png',
        });
        wx.hideLoading();
      }
    })
  },
  
  // 获取微信用户授权码
  fetchWeixinPaymentReady: function(orderId) {
    var dataBody = {};
    dataBody.userId = this.data.userInfo.user.id;
    dataBody.accessToken = this.data.userInfo.user.accesstoken;
    dataBody.orderId = orderId;
    var orderIdTemp = orderId
    var that = this;
    wx.login({
      success: function(res) {
        dataBody.jsCode = res.code;
        that.fetchWeixinPayment(res.code, orderIdTemp);   //orderid自己生成  code调login接口系统返回，
      },
      fail: function(res) {
        wx.showToast({
          title: '你可能尚未登录微信',
          image: '/Resource/images/cross.png',
        });
      },
    });
  },

  // 微信支付
  fetchWeixinPayment: function(code, orderId) {

    var dataBody = {};
    var orderData = {};

    orderData.orderId = orderId; //订单ID
    orderData.orderType = this.data.paymentInfo.type; //订单类型：1卡片商品，3咖啡机订单
    orderData.coupontype = this.data.couponInfo.coupontype; //优惠券类型
    orderData.couponId = this.data.couponInfo.couponId; //优惠券ID
    var valueString = JSON.stringify(orderData);

    dataBody.userId = this.data.userInfo.user.id;
    dataBody.accessToken = this.data.userInfo.user.accesstoken;
    dataBody.orderdata = valueString;
    dataBody.jsCode = code;

    var that = this;
    var encStr = basereq.encryptParam(dataBody);
    wx.showLoading();
    wx.request({
      url: basereq.interfaceName + 'payment/weixinMiniPrePay',
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
          //调用微信支付接口
          var paymentData = res.data.data.wxConfig;
          wx.requestPayment({
            'timeStamp': paymentData.time_stamp,
            'nonceStr': paymentData.nonce_str,
            'package': paymentData.package_str,
            'signType': paymentData.sign_type,
            'paySign': paymentData.pay_sign,
            'success': function(res) {
              //跳转支付成功页面
              that.gotoPaymentSucc(orderId);
            },
            'fail': function(res) {
              //支付失败
              wx.showToast({
                title: '支付失败',
                image: '/Resource/images/cross.png',
              });
            }
          })
        } else if (suffix == '05'){
          // 免支付
          // 跳转支付成功页面
          that.gotoPaymentSucc(orderId);
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
      }
    })
  },

  //余额支付方式
  fetchBalancePayment: function(orderId) {

    var dataBody = {};
    var orderData = {};

    orderData.orderId = orderId; //订单ID
    orderData.orderType = this.data.paymentInfo.type; //订单类型：1卡片商品，3咖啡机订单
    orderData.coupontype = this.data.couponInfo.coupontype; //优惠券类型
    orderData.couponId = this.data.couponInfo.couponId; //优惠券ID
    var valueString = JSON.stringify(orderData);

    dataBody.userId = this.data.userInfo.user.id;
    dataBody.accessToken = this.data.userInfo.user.accesstoken;
    dataBody.orderdata = valueString;

    var that = this;
    var encStr = basereq.encryptParam(dataBody);
    wx.showLoading({
      title: '正在支付',
    })
    wx.request({
      url: basereq.interfaceName + 'payment/electronicPay',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        wx.hideLoading();
        var code = res.data.code;
        var suffix = code.substr(code.length - 2, 2);
        if (suffix == '00') {
          //跳转支付成功页面
          that.gotoPaymentSucc(orderId);
        } else if (suffix == '05'){
          // 免支付
          // 跳转支付成功页面
          that.gotoPaymentSucc(orderId);
        } else {
          wx.showToast({
            title: res.data.msg,
            image: '/Resource/images/cross.png',
          });
        }
      },
      fail: function(res) {
        wx.hideLoading();
        //支付失败
        wx.showToast({
          title: '支付失败',
          image: '/Resource/images/cross.png',
        });
      }
    })
  },


  // 点击选择支付方式
  clickPayMent: function(event) {
    var paymentIndex = event.currentTarget.dataset.index;
    this.setData({
      paymentIndex: paymentIndex,
    });

    // 事件
    wx.reportAnalytics('select_pay_type', {
      user_id: this.data.userInfo.user.id.toString(),
      account: this.data.userInfo.electronicAccount.balance.toString(),
      number: this.data.paymentInfo.paymentData.payType[paymentIndex].number,
    });
  },

  /************请求优惠券************/
  fetchCouponGroup: function() {
    var dataBody = {};
    dataBody.userId = this.data.userInfo.user.id;;                                    //用户id
    dataBody.accessToken = this.data.userInfo.user.accesstoken;                       //accesstoken
    dataBody.orderamount = this.data.totalPrice;                                      //订单总价
    dataBody.orderType = this.data.paymentInfo.type;                                  //订单类型
    dataBody.startPage = 1; 
    dataBody.pageSize = 15;

    var encStr = basereq.encryptParam(dataBody);
    var that = this;
    wx.request({
      url: basereq.interfaceName + '/coupon/getUseCouponList',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        var code = res.data.code;
        var suffix = code.substr(code.length - 2, 2);
        if (suffix == '00') {
          var couponGroup = res.data.data.coupon_list;
          var qty = res.data.data.couponcount;
          that.setData({
            couponQty: qty,
            couponList: couponGroup,
          });
          if (couponGroup.length == 1){
            that.oneCouponChoose();
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

      }
    })
  },
  
  //如果优惠券为1则默认选择该优惠券
  oneCouponChoose: function(){
    var couponList = this.data.couponList; //优惠券列表
    var orderamount = this.data.totalPrice; //订单总价
    var couponInfo = {};
    couponInfo.couponId = couponList[0].id;
    couponInfo.coupontype = couponList[0].coupondefine.coupontype.id;
    couponInfo.amount = couponList[0].coupondefine.amount;

    var totalDiscountPrice = orderamount - couponList[0].coupondefine.amount;
    if (totalDiscountPrice <= 0) {
      totalDiscountPrice = 0;
    } else {
      totalDiscountPrice = amountStd.amountStandard(totalDiscountPrice);
    }
    this.setData({
      couponInfo: couponInfo,
      isBindcoupon: true,
      totalDiscountPrice: totalDiscountPrice,
    })
  },

  didTapChooseCoupon: function() {
    var orderInfo = {}; // 用于传递给优惠券选择页面的数据
    orderInfo.userId = this.data.userInfo.user.id;
    orderInfo.accesstoken = this.data.userInfo.user.accesstoken;
    orderInfo.orderamount = this.data.totalPrice; //订单总价
    orderInfo.orderType = this.data.paymentInfo.type; //订单类型 1卡片商品 3咖啡机订单
    var valueString = 'dataString=' + JSON.stringify(orderInfo);
    //跳转优惠券选择页面
    wx.navigateTo({
      url: './available_coupon/available_coupon?' + valueString,
    })
  },

  //选择优惠券页选择优惠券后调起函数
  changeData: function(options) {
    var strJSON = options; //字符串
    var objData = JSON.parse(strJSON); // 转成对象
    this.setData({
      couponInfo: objData.couponInfo,
      isBindcoupon: true,
      totalDiscountPrice: objData.totalDiscountPrice,
    })
  },

  //点击去支付
  clickGoPayment: function(e) {
    var that = this;
    var paymentIndex = that.data.paymentIndex;
    var paymentData = that.data.paymentInfo.paymentData;
    if (paymentData.payType[paymentIndex].id != 1) {
      if (paymentData.payType[paymentIndex].number == '1005' && (this.data.paymentInfo.type == 3 || this.data.paymentInfo.type == 1)) { // 余额支付且为咖啡机扫码下单
        this.setElecModalStatus(e);
      } else {
        wx.showModal({
          content: '确认支付吗？',
          success: function(res) {
            if (res.confirm) {
              that.accedePayment();

            } else if (res.cancel) {

            }
          }
        })
      }
    } else {
      that.accedePayment();
    }
  },

  didTapElecPay: function(e) {
    this.setElecModalStatus(e);
    this.accedePayment();
  },

  didTapCloseElecPay: function(e) {
    this.setElecModalStatus(e);
  },

  //同意去支付
  accedePayment: function() {
    var warningString = '';
    if (warningString.length > 0) {
      // 信息填写有误
      wx.showToast({
        title: warningString,
        image: '/Resource/images/cross.png',
      });
    } else {
      // 信息填写正确
      var orderId = this.data.paymentInfo.orderId.toString();
      if (orderId.length > 0) {
        // 已下订单 已有订单号
        var orderId = this.data.paymentInfo.orderId;
        var paymentData = this.data.paymentInfo.paymentData;
        var paymentIndex = this.data.paymentIndex;
        //微信支付类型
        if (paymentData.payType[paymentIndex].number == '1002') {
          this.fetchWeixinPaymentReady(orderId);
        };
        //余额支付类型
        if (paymentData.payType[paymentIndex].number == '1005') {
          this.fetchBalancePayment(orderId);
        };
      } else {
        // 未下单 创建订单
        this.fetchOrderCreat();
      }
    }
  },

  // 跳转支付成功页
  gotoPaymentSucc: function(orderId) {
    var dataBody = {};
    var paymentInfo = this.data.paymentInfo;
    var paymentIndex = this.data.paymentIndex;
    dataBody.paymentInfo = paymentInfo;
    dataBody.paymentIndex = paymentIndex;
    dataBody.orderId = orderId;
    dataBody.totalDiscountPrice = this.data.totalDiscountPrice;
    dataBody.freeFlag = false;
    var dataString = JSON.stringify(dataBody);
    //跳转支付成功页面
    wx.navigateTo({
      url: './voucher/voucher?' + 'dataString=' + dataString,
    })
  },

  /***** 动画 *****/

  setModalStatus: function(e) {
    var animation = wx.createAnimation({
      duration: 250,
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

  setElecModalStatus: function(e) {
    var animation = wx.createAnimation({
      duration: 250,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(300).step()
    this.setData({
      elecAnimationData: animation.export()
    })
    if (e.currentTarget.dataset.status == 1) {
      this.setData({
        showElecModalStatus: true
      });
    }
    setTimeout(function() {
      animation.translateY(0).step()
      this.setData({
        elecAnimationData: animation
      })
      if (e.currentTarget.dataset.status == 0) {
        this.setData({
          showElecModalStatus: false
        });
      }
    }.bind(this), 200)
  }
})