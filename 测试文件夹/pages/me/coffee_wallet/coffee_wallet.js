// pages/me/coffee_wallet/coffee_wallet.js
var basereq = require('../../../utils/base_req.js');
// 引入loginMgr
var loginMgr = require('../../../utils/loginManager/loginMgr.js');
// 引入下拉刷新
var footerMgr = require('../../../utils/refreshFooter.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false,
    canShowAlert: false,
    phoneNumber: '',
    validCode: '',
    second: '发送验证码',
    userInfo: {},
    couponGroupList: [],
    isListEmpty: true,
    couponQty: 0,
    isListLoading: true,
    listLoadingFail: false,
    reLoadingTipMsg: '网络似乎不太好...',
    couponWxRefreshFtInfo: {
      isFromSearch: true,           // 用于判断couponList数组是不是空数组，默认true，空的数组
      searchPageNum: 1,             // 设置加载的第几次，默认是第一次  
      callbackcount: 15,             //返回数据的个数  
      searchLoading: false,         //"上拉加载"的变量，默认false，隐藏  
      searchLoadingComplete: false, //“没有数据”的 变量，默认false，隐藏
      isLoadMore: false             // 正在加载更多
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '咖啡红包',
    });
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
    if (this.data.isLogin) {
      this.fetchCouponGroup();
    }
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
      couponWxRefreshFtInfo: footerMgr.onPullDownRefresh(that.data.couponWxRefreshFtInfo) // 修改数据
    })
    this.fetchCouponGroup();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    footerMgr.onReachBottom({
      refreshInfo: that.data.couponWxRefreshFtInfo,
      reloadData: function (RefreshFtInfo) {
        that.setData({
          couponWxRefreshFtInfo: RefreshFtInfo // 修改数据
        });
        that.fetchCouponGroup();
      }
    })
  },

  fetchCouponGroup: function () {
    var refreshInfoDic = this.data.couponWxRefreshFtInfo;
    refreshInfoDic.isLoadMore = true;
    var that = this;
    this.setData({// 正在加载
      couponWxRefreshFtInfo: refreshInfoDic
    });
    var dataBody = {};
    dataBody.userId = this.data.userInfo.user.id;
    dataBody.accessToken = this.data.userInfo.user.accesstoken;
    dataBody.startPage = this.data.couponWxRefreshFtInfo.searchPageNum;
    dataBody.pageSize = this.data.couponWxRefreshFtInfo.callbackcount;
    var encStr = basereq.encryptParam(dataBody);

    footerMgr.refreshFooterHandle({
      originObj: that,
      url: basereq.interfaceName + '/coupon/getCouponList',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      successCode: "00",
      bindList: that.data.couponGroupList,//绑定操作数据
      bindRefreshInfo: that.data.couponWxRefreshFtInfo,
      curListData: function (res) {//置入数据源
        return res.data.data.coupon_list;
      },
      success: function (list,res) {// 获取数据成功对列表数据进行处理(可以不需要)
        var code = res.data.code.toString();
        var suffix = code.substr(code.length - 2, 2);
        if (suffix != "00") {
          // 接口访问成功，数据失败
          that.setData({
            isListLoading: true,
            listLoadingFail: true,
            reLoadingTipMsg: res.data.msg,
          });
        } else {
          // 接口成功 数据成功
          that.setData({
            isListLoading: false,
            couponGroupList: list,
            couponQty: res.data.data.couponcount,
          });
        }
      },
      reloadData: function (reloadObj) {//必须(因为在数据处理和数据刷新中间还有一些操作所以不能在success中刷新,请在这里填写)
        if (reloadObj.list != null) {
          // 列表不为空
          var couponGroupList = that.textCut(reloadObj);
          that.setData({
            isListEmpty: false,
            isListLoading: false,
            couponGroupList: couponGroupList,
            couponWxRefreshFtInfo: reloadObj.refreshInfo
          });
        } else {
          // 列表为空
          var isListEmpty;
          if (that.data.couponWxRefreshFtInfo.searchPageNum === 1) {
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
          couponWxRefreshFtInfo: refreshInfo  //结束正在加载 
        });
      }
    })
  },

  //文字溢出操作
  textCut: function (reloadObj) {
    var couponGroupList = reloadObj.list;
    var screenWidth = app.globalData.screenWidth; //获取屏幕宽度
    var textWidth = (430 * screenWidth) / 750 //文本最大宽度为430rpx，该公式算出来的单位是px
    var textHeadMaxLength = parseInt(textWidth / 16) - 1; //16像素文字的最大字数，需要取整，-1是后面要用来加...
    var textbodyMaxLength = parseInt(textWidth / 12) - 1; //12像素文字的最大字数，需要取整，-1是后面要用来加...
    var textDateMaxLength = parseInt(textWidth / 10) - 1; //10像素文字的最大字数，需要取整，-1是后面要用来加...
    for (var i = 0; i < couponGroupList.length; i++) {
      var item = couponGroupList[i];
      item.itemName = item.coupondefine.name;
      var dateString = "有效期：" + item.createtime +
        " 至" + item.expirationtime;
      item.itemDateString = dateString;
      //描述  12px   限制2行
      if (item.coupondefine.couponintroduce.length > 2 * textbodyMaxLength) {
        var description = item.coupondefine.couponintroduce.substr(0, 2 * textbodyMaxLength) + '...'
        item.itemDescription = description;
      } else {
        item.itemDescription = item.coupondefine.couponintroduce;
      }
    }
    return couponGroupList
  },

  // 点击重新加载商品列表
  tapReloadCouponList: function (event) {
    // 数据重置
    this.setData({
      isListLoading: true,
      listLoadingFail: false
    });
    this.fetchCouponGroup();
  },

  checkExpiredCoupons:function(){
    wx.navigateTo({
      url: './expired_coupons/expired_coupons',
    })
  },

  //跳转红包兑换页
  didTapExchange:function(){
    wx.navigateTo({
      url: "/pages/me/coffee_wallet/wallet_exchange/wallet_exchange",
    })
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
      that.fetchCouponGroup();
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