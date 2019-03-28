// pages/points_mall/points_mall.js
// 引入请求基础类
var baseReq = require('../../utils/base_req.js');
// 引入loginMgr
var loginMgr = require('../../utils/loginManager/loginMgr.js');
// 引入Refresh Footer
var footerMgr = require('../../utils/refreshFooter.js');
// 引入banner_jump
var bannerJump = require('../../utils/url_jump.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    domain: '',
    isListLoading: true,
    listLoadingFail: false,
    reLoadingTipMsg: '网络似乎不太好...',
    bannerList: [],
    indicatorDots: true,
    autoplay: true,
    interval: 3500,
    duration: 250,
    goodsList: [],
    listWxRefreshFtInfo: {
      isFromSearch: true, // 用于判断List数组是不是空数组，默认true，空的数组
      searchPageNum: 1, // 设置加载的第几次，默认是第一次  
      callbackcount: 15, //返回数据的个数  
      searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
      searchLoadingComplete: false, //“没有数据”的变量，默认false，隐藏
      isLoadMore: false // 正在加载更多
    },
    isLogin: false,
    canShowAlert: false,
    phoneNumber: '',
    validCode: '',
    second: '发送验证码',
    userInfo: null,
    selectedGoods: null,
    orderAmount: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '积分商城',
    });
    this.setData({
      domain: baseReq.domain
    });
    this.resetData();
    this.fetchBannerList();
    this.fetchPointsMallList();
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
    var that = this;
    this.setData({
      listWxRefreshFtInfo: footerMgr.onPullDownRefresh(that.data.listWxRefreshFtInfo) // 修改数据
    })
    this.fetchPointsMallList();
    this.fetchBannerList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var that = this;
    footerMgr.onReachBottom({
      refreshInfo: that.data.listWxRefreshFtInfo,
      reloadData: function(RefreshFtInfo) {
        that.setData({
          listWxRefreshFtInfo: RefreshFtInfo // 修改数据
        });
        that.fetchPointsMallList();
      }
    })
  },

  /**
   * Network
   */

  // 重置数据
  resetData: function() {
    let that = this;
    this.setData({
      listWxRefreshFtInfo: footerMgr.resetData(that.data.listWxRefreshFtInfo) // 修改数据
    })
  },

  // 获取Banner
  fetchBannerList: function () {
    var dataBody = {};
    dataBody.position = '3';
    var encStr = baseReq.encryptParam(dataBody);
    var that = this;
    wx.request({
      url: baseReq.interfaceName + 'common/getBannerList ',
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
          bannerList: banner,
        });
      },
      fail: function (res) {

      },
    })
  },

  // 获取积分商城商品列表
  fetchPointsMallList: function() {
    var refreshInfoDic = this.data.listWxRefreshFtInfo;
    refreshInfoDic.isLoadMore = true;
    var that = this;
    this.setData({ // 正在加载
      listWxRefreshFtInfo: refreshInfoDic
    });
    var dataBody = {};
    dataBody.startPage = this.data.listWxRefreshFtInfo.searchPageNum;
    dataBody.pageSize = this.data.listWxRefreshFtInfo.callbackcount;
    var encStr = baseReq.encryptParam(dataBody);

    footerMgr.refreshFooterHandle({
      originObj: that,
      url: baseReq.interfaceName + 'pointshop/getPointShopList',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      successCode: "00",
      bindList: that.data.goodsList, //绑定操作数据
      bindRefreshInfo: that.data.listWxRefreshFtInfo,
      curListData: function(res) { //置入数据源
        return res.data.data.goods_list;
      },
      success: function(list, res) { // 获取数据成功对列表数据进行处理(可以不需要)
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
          that.setData({
            isListLoading: false,
          });
        }
      },
      reloadData: function(reloadObj) { //必须(因为在数据处理和数据刷新中间还有一些操作所以不能在success中刷新,请在这里填写)
        if (reloadObj.list != null) {
          // 列表不为空
          // 做文案末尾省略处理
          var goodsList = reloadObj.list;
          var screenWidth = getApp().globalData.screenWidth;
          // 标题文案宽度 = 屏幕宽 - 图片宽120 - 文案与图片间隔10 - 外边距30 - 内边距20
          var titleWidth = screenWidth - 120 - 10 - 30 - 20;
          // 限制两行 字体大小16px 减一位用来放"..."
          var titleMaxLength = 2 * parseInt(titleWidth / 16) - 1;
          // 遍历列表 插入显示的字符串
          for (var index = 0; index < goodsList.length; index++) {
            var item = goodsList[index];
            if (item.type === 1) {
              // 优惠券
              var name = item.coupondefine.name;
              if (name.length > titleMaxLength) {
                var displayName = name.substr(0, titleMaxLength - 1) + '...';
                item.displayName = displayName;
              } else {
                item.displayName = name;
              }
            } else if (item.type === 2) {
              // 卡券
              var name = item.cardDefineInfo.name;
              if (name.length > titleMaxLength) {
                var displayName = name.substr(0, titleMaxLength - 1) + '...';
                item.displayName = displayName;
              } else {
                item.displayName = name;
              }
            }
          }
          that.setData({
            goodsList: goodsList,
            listWxRefreshFtInfo: reloadObj.refreshInfo
          });
        } else {
          // 空列表
        } 
      },
      fail: function(res) {
        that.setData({
          isListLoading: true,
          listLoadingFail: true,
        });
      },
      complete: function(refreshInfo) {
        that.setData({
          listWxRefreshFtInfo: refreshInfo //结束正在加载 
        });
      }
    })
  },

  // 下单
  fetchOrderCreat: function() {
    var dataBody = {};
    dataBody.userId = this.data.userInfo.user.id;
    dataBody.accessToken = this.data.userInfo.user.accesstoken;
    // 订单内包含的商品
    var items = [];
    var item = {};
    item.qty = "1";
    // 订单类型 5：积分卡订单 6：积分优惠券订单
    if (this.data.selectedGoods.type === 1) {
      // 优惠券
      dataBody.type = "6";
      item.id = this.data.selectedGoods.coupondefine.id;
    } else if (this.data.selectedGoods.type === 2) {
      // 卡
      dataBody.type = "5";
      item.id = this.data.selectedGoods.cardStockInfo.id;
    }
    items.push(item);
    // items转为字符串
    dataBody.items = JSON.stringify(items);
    var that = this;
    var encStr = baseReq.encryptParam(dataBody);
    wx.showLoading({
      title: '生成订单',
    })
    wx.request({
      url: baseReq.interfaceName + 'order/create',
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
          //积分支付类型
          that.fetchPointsPayment(orderId);
        } else {
          if (suffix == '02') {
            wx.showToast({
              title: '库存不足',
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

  // 积分支付
  fetchPointsPayment: function (orderID) {
    var dataBody = {};
    dataBody.userId = this.data.userInfo.user.id;
    dataBody.accessToken = this.data.userInfo.user.accesstoken;
    dataBody.orderId = orderID;

    var that = this;
    var encStr = baseReq.encryptParam(dataBody);
    wx.showLoading({
      title: '正在支付',
    })
    wx.request({
      url: baseReq.interfaceName + 'payment/pointConvert',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.hideLoading();
        var code = res.data.code;
        var suffix = code.substr(code.length - 2, 2);
        if (suffix == '00') {
          //跳转支付成功页面
          that.gotoPaymentSucc();
        } else {
          wx.showToast({
            title: res.data.msg,
            image: '/Resource/images/cross.png',
          });
        }
      },
      fail: function (res) {
        wx.hideLoading();
        //支付失败
        wx.showToast({
          title: '支付失败',
          image: '/Resource/images/cross.png',
        });
      }
    })
  },

  /**
   * Actions
   */
  // 点击兑换记录
  didTapExchangeRecord: function(e) {
    wx.navigateTo({
      url: '/pages/points_mall/exchange_record/exchange_record',
    });
  },

  // 点击积分规则
  didTapPointsRules: function(e) {
    wx.navigateTo({
      url: '/pages/points_mall/points_rules/points_rules',
    });
  },

  // 点击Banner
  didTapBanner: function(e) {
    var bannerItem = e.currentTarget.dataset.item;
    if (bannerItem) {
      if (bannerItem.datastring) {
        // 包含跳转链接
        var strJSON = bannerItem.datastring;
        var comeplete = function () { };
        bannerJump.jumpWithStrJSON(strJSON, comeplete);
      }
    }
  },

  // 点击兑换
  didTapShowModal: function(event) {
    if (!this.data.isLogin) {
      // 未登录
      this.showLoginAlert();
    } else {
      // 已登录
      var goodsItem = event.currentTarget.dataset.item;
      if (goodsItem.type === 1 || goodsItem.type === 2) {
        // 优惠券 或 卡券
        var amount = goodsItem.type === 1 ? goodsItem.coupondefine.saleintegral : goodsItem.cardStockInfo.saleintegral;
        this.setData({
          selectedGoods: goodsItem,
          orderAmount: amount,
        });
        this.setModalStatus(event);
      } else {
        // 其余类型暂未出现
      };
    }
    
  },

  // 点击确认支付
  didTapPay: function(e) {
    this.setModalStatus(e);
    // 下单&积分支付
    this.fetchOrderCreat();
  },

  gotoPaymentSucc: function () {
    // 兑换成功
    var prefixURL = '../wallet/use_balance_card/rechargeSucc/rechargeSucc?';
    var data = {};
    data.type = 'points_mall';
    // 订单类型
    if (this.data.selectedGoods.type === 1) {
      // 优惠券
      data.msg = '商品已经放入我的咖啡红包';
    } else if (this.data.selectedGoods.type === 2) {
      // 卡
      data.msg = '商品已经放入我的卡包';
    }
    var dataJSON = JSON.stringify(data);
    var valueString = 'dataString=' + dataJSON;
    wx.navigateTo({
      url: prefixURL + valueString,
    });
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
    this.fetchPointsMallList();
  },

  /**
   * Animations
   */
  // 面额卡规格选择弹窗
  setModalStatus: function(e) {
    var animation = wx.createAnimation({
      duration: 250,
      timingFunction: "linear",
      delay: 0
    })
    this.animation = animation
    animation.translateY(330).step()
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


  /**
   * 登录相关
   */

  // 检查用户是否登录
  detecIfUserLogin: function () {
    var userInfo = loginMgr.fetchUserInfo();
    if (userInfo.isLogin) {
      this.setData({
        isLogin: true,
        userInfo: userInfo,
      });
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
      that.closeLoginAlert();
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
  showLoginAlert: function () {
    var currentShowStatus = true;
    this.animateAlert(currentShowStatus);
  },

  // 关闭弹窗
  closeLoginAlert: function () {
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
      loginAnimationData: animation.export()
    });

    setTimeout(function () {
      // 执行第二组动画 
      animation.opacity(1).step();
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象 
      this.setData({
        loginAnimationData: animation
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