// pages/coffee_machine/coffee_machine.js

// 引入base_req
var basereq = require('../../utils/base_req.js');
// 引入loginMgr
var loginMgr = require('../../utils/loginManager/loginMgr.js');
// 引入Refresh Footer
var footerMgr = require('../../utils/refreshFooter.js');
// 引入banner_jump
var bannerJump = require('../../utils/url_jump.js');
var app = getApp();
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
    reLoadingTipMsg:'网络似乎有点不太好～',
    isCounting: false,
    isListLoading: true,
    listLoadingFail: false,
    isListEmpty: true,
    bannerItems: [],
    goodList: [],             //商品列表,
    paymentInfo: [],
    payType:{},
    coffeeMachineID:undefined,
    tipMsg:'',
    indicatorDots: true,
    autoplay: true,
    interval: 3500,
    duration: 250,
    listWxRefreshFtInfo: {
      isFromSearch: true, // 用于判断List数组是不是空数组，默认true，空的数组
      searchPageNum: 1, // 设置加载的第几次，默认是第一次  
      callbackcount: 16, //返回数据的个数  
      searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
      searchLoadingComplete: false, //“没有数据”的变量，默认false，隐藏
      isLoadMore: false // 正在加载更多
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '选咖啡',
    });

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
    this.setData({
      domain: basereq.domain,
    });
    // 检查登录状态
    this.detecIfUserLogin();
    this.fetchBannerList();
    this.fetchDrinkList();
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
    var that = this;
    this.setData({
      listWxRefreshFtInfo: footerMgr.onPullDownRefresh(that.data.listWxRefreshFtInfo) // 修改数据
    })
    this.fetchDrinkList();
    this.fetchBannerList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    footerMgr.onReachBottom({
      refreshInfo: that.data.listWxRefreshFtInfo,
      reloadData: function (RefreshFtInfo) {
        that.setData({
          listWxRefreshFtInfo: RefreshFtInfo // 修改数据
        });
        that.fetchDrinkList();
      }
    })
  },

  // 重置数据
  resetData: function () {
    let that = this;
    this.setData({
      listWxRefreshFtInfo: footerMgr.resetData(that.data.listWxRefreshFtInfo) // 修改数据
    })
  },

  // 点击重新加载
  tapReload: function () {
    this.setData({
      isListLoading: true,
      listLoadingFail: false,
    });
    this.detecIfUserLogin();
    this.resetData();
    this.fetchBannerList();
    this.fetchDrinkList();
  },

  /********** 网络请求 **********/
  // 请求卡片列表
  fetchDrinkList: function () {
    var refreshInfoDic = this.data.listWxRefreshFtInfo;
    refreshInfoDic.isLoadMore = true;
    var that = this;
    this.setData({ // 正在加载
      listWxRefreshFtInfo: refreshInfoDic
    });
    var dataBody = {};
    dataBody.deviceNumber = this.data.coffeeMachineID;
    dataBody.startPage = this.data.listWxRefreshFtInfo.searchPageNum;
    dataBody.pageSize = this.data.listWxRefreshFtInfo.callbackcount;
    var encStr = basereq.encryptParam(dataBody);

    footerMgr.refreshFooterHandle({
      originObj: that,
      url: basereq.interfaceName + 'coffeeMachine/getDrinkListByNumber',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      successCode: "00",
      bindList: that.data.goodList, //绑定操作数据
      bindRefreshInfo: that.data.listWxRefreshFtInfo,
      curListData: function (res) { //置入数据源
        return res.data.data;
      },
      success: function (list, res) { // 获取数据成功对列表数据进行处理(可以不需要)
        var code = res.data.code.toString();
        var suffix = code.substr(code.length - 2, 2);
        if (suffix != "00") {
          // 接口成功，数据失败
          that.setData({
            isListLoading: true,
            listLoadingFail: true,
            reLoadingTipMsg: res.data.msg,
          });
        } else {
          // 接口成功 数据成功
          that.fetchPayType();
          that.setData({
            isListLoading: false,
            goodList: list,
          });
        }
      },
      reloadData: function (reloadObj) { //必须(因为在数据处理和数据刷新中间还有一些操作所以不能在success中刷新,请在这里填写)
        if (reloadObj.list != null) {
          // 列表不为空
          var goodList = that.textCut(reloadObj);
          that.setData({
            isListEmpty: false,
            isListLoading: false,
            goodList: goodList,
            listWxRefreshFtInfo: reloadObj.refreshInfo
          });
        } else {
          // 列表为空
          var isListEmpty;
          if (that.data.listWxRefreshFtInfo.searchPageNum === 1) {
            // 是首页且列表空 则说明整个接口数据为空
            isListEmpty = true;
          } else {
            // 是末尾页且列表空 则刚好最后一页是callbackcount条数据 说明其实前面是有数据的
            isListEmpty = false;
          }
          that.setData({
            isListLoading: false,
            isListEmpty: isListEmpty,
          });
        }
      },
      fail: function (res) {
        that.setData({
          isListLoading: true,
          listLoadingFail: true,
        });
      },
      complete: function (refreshInfo) {
        that.setData({
          listWxRefreshFtInfo: refreshInfo //结束正在加载 
        });
      }
    })
  },

  //文字溢出操作
  textCut: function (reloadObj) {
    var goodList = reloadObj.list;
    var screenWidth = app.globalData.screenWidth; //获取屏幕宽度
    var textWidth = (330 * screenWidth) / 750 //文本最大宽度为330rpx，该公式算出来的单位是px
    var textHeadMaxLength = parseInt(textWidth / 14) - 1; //14像素文字的最大字数，需要取整，-1是后面要用来加...
    for (var i = 0; i < goodList.length; i++) {
      var item = goodList[i];
      //描述  14px   限制2行
      if (item.name.length > 2 * textHeadMaxLength) {
        var goodName = item.name.substr(0, 2 * textHeadMaxLength) + '...'
        item.name = goodName;
      } else {
        item.name = item.name;
      }
    }
    return goodList
  },

  fetchBannerList: function () {
    var dataBody = {};
    dataBody.position = '4';
    var encStr = basereq.encryptParam(dataBody);
    var that = this;
    wx.request({
      url: basereq.interfaceName + 'common/getBannerList ',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var banner = res.data.data;
        that.setData({
          bannerItems: banner,
        });
      },
      fail: function (res) {

      },
    })
  },

  didTapBanner: function (e) {
    if (e.currentTarget.dataset.item) {
      var bannerItem = e.currentTarget.dataset.item;
      if (bannerItem.datastring) {
        // 包含跳转链接
        var dataObj = JSON.parse(bannerItem.datastring);
        if (dataObj.shareType == 'mall_banner') {
          var dataJSON = JSON.stringify(dataObj.dataDic);
          wx.navigateTo({
            url: dataObj.targetURL + '?dataString=' + dataJSON,
          })
        }
      }
    }
  },

  didTapGood: function(e){
    var index = e.currentTarget.dataset.index;
    var goodList = this.data.goodList;
    var that = this;
    if (!this.data.isLogin) {
      this.showAlert();
    } else {
      if (goodList[index].price == 0){
        wx.showModal({
          title: '要点一杯 ' + goodList[index].name + ' 吗？',
          confirmText: "是的",
          cancelText: "取消",
          content: '',
          success: function (res) {
            if (res.cancel) {
              //点击取消,默认隐藏弹框
            } else {
              //点击确定
              that.fetchOrderCreat(index);
            }
          },
          fail: function (res) { },//接口调用失败的回调函数
          complete: function (res) { },//接口调用结束的回调函数（调用成功、失败都会执行）
        })
      } else {
        var payType = {
          electronicAccount: that.data.payType.electronicAccount,
          payType: that.data.payType.payType,
          pointAccount: { balance: 0 }
        }
        // 订单信息
        var orderInfo = goodList[index];
        // 装配收银台需要的商品信息数据
        var cashierItems = [];
        var toPayItem = {};
        toPayItem.id = orderInfo.id;
        toPayItem.introduce = '';
        toPayItem.name = orderInfo.name;
        toPayItem.qty = 1;
        toPayItem.price = orderInfo.price;
        toPayItem.priceList = [{ cusamount: orderInfo.price, cusintegral: 0 }, { cusamount: orderInfo.price, cusintegral: 0 }, { cusamount: orderInfo.price, cusintegral: 0 }];// 咖啡机没有会员折扣.为了兼容(如果以后有,这里就填一个折扣为零的会员信息)
        toPayItem.carddefineid = 0;      //咖啡机订单的卡定义ID默认为0（200版本，保持和卡片购买页参数一致）
        cashierItems.push(toPayItem);

        var cashierInfo = {}; 
        cashierInfo.orderId = '';              // 是否来自于订单
        cashierInfo.itemList = cashierItems;             // 展示的商品列表
        cashierInfo.paymentData = payType;               // 支付方式数据
        cashierInfo.totalPrice = orderInfo.price;    // 总价
        cashierInfo.type = 3;               // 3:咖啡机订单类型
        var paramStr = JSON.stringify(cashierInfo);
        // 跳转收银台页    
        wx.navigateTo({
          url: '/pages/cashier_desk/cashier_desk?' + 'dataString=' + paramStr,
        })
      }
    }
  },

  fetchPayType: function(){
    var dataBody = {};
    dataBody.userId = this.data.userInfo.user.id;
    dataBody.accessToken = this.data.userInfo.user.accesstoken;
    var that = this;
    var encStr = basereq.encryptParam(dataBody);
    wx.request({
      url: basereq.interfaceName + 'payment/order/coffeeMacPayType',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var payType = res.data.data
        that.setData({
          payType: payType
        })
        that.closeAlert();
      },
      fail: function (res) {

      }
    })
  },

  //下单
  fetchOrderCreat: function (index) {
    var items = [];
    var item = {};
    var itemInfor = this.data.goodList[index];
    item.qty = 1;
    item.id = itemInfor.id;
    items.push(item);
    
    var dataBody = {};
    dataBody.userId = this.data.userInfo.user.id;
    dataBody.accessToken = this.data.userInfo.user.accesstoken;
    dataBody.type = 3;
    dataBody.items = JSON.stringify(items);  // items转为字符串
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
      success: function (res) {
        wx.hideLoading();
        var orderId = res.data.data.orderId;
        var code = res.data.code;
        var suffix = code.substr(code.length - 2, 2);
        if (suffix == '04') {
            var orderInfo = that.data.goodList[index];
            var cashierItems = [];
            var toPayItem = {};
            toPayItem.id = orderInfo.id;
            toPayItem.introduce = '';
            toPayItem.name = orderInfo.name;
            toPayItem.qty = 1;
            toPayItem.price = orderInfo.price;
            toPayItem.priceList = [{ cusamount: orderInfo.price, cusintegral: 0 }, { cusamount: orderInfo.price, cusintegral: 0 }, { cusamount: orderInfo.price, cusintegral: 0 }];// 咖啡机没有会员折扣.为了兼容(如果以后有,这里就填一个折扣为零的会员信息)
            toPayItem.carddefineid = 0;      //咖啡机订单的卡定义ID默认为0（200版本，保持和卡片购买页参数一致）
            cashierItems.push(toPayItem);

            var paymentInfo = {};
            var paymentIndex = '';
            paymentInfo.orderId = '';              // 是否来自于订单
            paymentInfo.itemList = cashierItems;             // 展示的商品列表
            paymentInfo.paymentData = '';               // 支付方式数据
            paymentInfo.totalPrice = orderInfo.price;    // 总价
            paymentInfo.type = 3;               // 3:咖啡机订单类型

            var dataBody = {};
            dataBody.paymentInfo = paymentInfo;
            dataBody.paymentIndex = paymentIndex;
            dataBody.orderId = orderId;
            dataBody.totalDiscountPrice = '';
            dataBody.freeFlag = true;
            var dataString = JSON.stringify(dataBody);
            //跳转支付成功页面
            wx.navigateTo({
              url: '/pages/cashier_desk/voucher/voucher?' + 'dataString=' + dataString,
            })
        } else {
          if (suffix == '02') {
            wx.showToast({
              title: '库存不足',
              image: '/Resource/images/cross.png',
            });
          } else if (suffix == '05'){
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
      fail: function (res) {
        wx.showToast({
          title: '下单失败',
          image: '/Resource/images/cross.png',
        });
        wx.hideLoading();
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
      that.fetchPayType();
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
  }
})