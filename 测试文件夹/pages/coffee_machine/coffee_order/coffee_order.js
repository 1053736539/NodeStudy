// pages/coffee_machine/coffee_machine.js

// 引入base_req
var basereq = require('../../../utils/base_req.js');
// 引入loginMgr
var loginMgr = require('../../../utils/loginManager/loginMgr.js');

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
    isLoading: true,
    isLoadingFail: false,
    coffeeMachineID:undefined,
    tipMsg:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 检查登录状态
    this.detecIfUserLogin();

    // 解析URL
    if(options.dataString) {
      var dataStr = options.dataString;
      var dataJSON = JSON.parse(dataStr);
      if (dataJSON.machineID) {
        this.setData({
          coffeeMachineID: dataJSON.machineID,
        });
      }
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    if(!this.data.isLogin) {
      // 未登录显示登录弹窗
      this.showAlert();
    } else {
      // 已登录获取订单信息
      this.fetchOrderInfoWithMachineID(this.data.coffeeMachineID);
    }
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
   * 请求订单信息
   */
  fetchOrderInfoWithMachineID: function(machineID) {
    this.setData({
      tipMsg: '正在获取订单'
    });
    var dataBody = {};
    dataBody.device_id = machineID;
    dataBody.userId = this.data.userInfo.user.id;
    dataBody.accessToken = this.data.userInfo.user.accesstoken;
    var encStr = basereq.encryptParam(dataBody);
    var that = this;
    // wx.showLoading({
    //   title: '',
    // })
    wx.request({
      url: basereq.interfaceName + 'order/getCoffeeMacOrder',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        // wx.hideLoading();
        that.setData({
          isLoading: true,
          isLoadingFail: false
        });
        
        var code = res.data.code.toString();
        var suffix = code.substr(code.length - 3, 3);//返回码中参数缺失和订单已支付后两位都是04所以判断三位
        if (suffix == '100') {
          // 支付方式
          var payType = { 
            electronicAccount: res.data.data.electronicAccount,
            payType: res.data.data.pay_type_list,
            pointAccount:{balance:0}
          }
          // 订单信息
          var orderInfo = res.data.data.orderInfo;
          // 装配收银台需要的商品信息数据
          var cashierItems = [];
          var toPayItem = {};
          toPayItem.id = orderInfo.id;
          toPayItem.introduce = '';
          toPayItem.name = orderInfo.name;
          toPayItem.qty = orderInfo.qty;
          toPayItem.price = orderInfo.payamount;
          toPayItem.priceList = [{ cusamount: orderInfo.payamount, cusintegral: 0 }, { cusamount: orderInfo.payamount, cusintegral: 0 }, { cusamount: orderInfo.payamount, cusintegral: 0 }];// 咖啡机没有会员折扣.为了兼容(如果以后有,这里就填一个折扣为零的会员信息)
          toPayItem.carddefineid = 0;      //卡定义ID（200版本，保持和卡片购买页参数一致）
          cashierItems.push(toPayItem);

          var cashierInfo = {};
          cashierInfo.orderId = orderInfo.id;              // 是否来自于订单
          cashierInfo.itemList = cashierItems;             // 展示的商品列表
          cashierInfo.paymentData = payType;               // 支付方式数据
          cashierInfo.totalPrice = orderInfo.payamount;    // 总价
          cashierInfo.type = orderInfo.type;               // 3:咖啡机订单类型
          var paramStr = JSON.stringify(cashierInfo);

          // 跳转收银台页
          wx.redirectTo({
            url: '/pages/cashier_desk/cashier_desk?' + 'dataString=' + paramStr,
          })
        } else if (suffix == '106' || suffix == '105' || suffix == '104' || suffix == '103'){
          that.setData({
            isLoadingFail: false,
            tipMsg: res.data.msg
          });
        } else {
          // 其他错误
          that.setData({
            isLoadingFail: true,
            tipMsg: res.data.msg
          });
        }
      },
      fail: function (res) {
        // wx.hideLoading();
        wx.showToast({
          title: '获取订单信息失败',
          image: '/Resource/images/cross.png',
          duration: 3000
        });
        that.setData({
          isLoadingFail: true,
          tipMsg: '获取订单信息失败'
        });
      }
    })
  },

  /** 
   * 登录&注册
   */
  // 检查用户是否登录
  detecIfUserLogin: function () {
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
        isLoadingFail: true,
        tipMsg:'欢迎使用  麦隆咖啡  小程序'
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
        isLoading: true,
        isLoadingFail:false
      });
      // 获取订单信息
      that.fetchOrderInfoWithMachineID(that.data.coffeeMachineID);
    };
    // 登录失败回调
    var funcFail = function loginFail(objData) {
    };
    // 普通用户登录
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
  },

  tapReloadCards:function () {
    this.setData({
      isLoading: true,
      isLoadingFail: false
    });
    if (!this.data.isLogin) {
      // 未登录显示登录弹窗
      this.showAlert();
    } else {
      // 已登录获取订单信息
      this.fetchOrderInfoWithMachineID(this.data.coffeeMachineID);
    }
  }
})