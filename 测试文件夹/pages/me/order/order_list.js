// order_list.js
// 引入login manager
var loginMgr = require('../../../utils/loginManager/loginMgr.js');
// 引入Base Request
var baseReq = require('../../../utils/base_req.js');
// 引入Refresh Footer
var footerMgr = require('../../../utils/refreshFooter.js');
// 引入金额显示规范 amount_standard
var amount_standard = require('../../../utils/amount_standard.js');

var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    domain: '',
    userInfo: {},
    isListLoading: true,
    listLoadingFail: false,
    reLoadingTipMsg: '网络似乎不太好...',
    orderList: [],
    orderWxRefreshFtInfo: {
      isFromSearch: true, // 用于判断orderList数组是不是空数组，默认true，空的数组
      searchPageNum: 1, // 设置加载的第几次，默认是第一次  
      callbackcount: 15, //返回数据的个数  
      searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
      searchLoadingComplete: false, //“没有数据”的变量，默认false，隐藏
      isLoadMore: false // 正在加载更多
    },
    isListEmpty: true  //判断订单的数量是否为空
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '我的订单',
    });
    var user = loginMgr.fetchUserInfo();
    this.setData({
      userInfo: user,
      domain: baseReq.domain
    });
    this.resetData();
    this.fetchOrderList();
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
    var that = this;
    this.setData({
      orderWxRefreshFtInfo: footerMgr.onPullDownRefresh(that.data.orderWxRefreshFtInfo) // 修改数据
    })
    this.fetchOrderList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var that = this;
    footerMgr.onReachBottom({
      refreshInfo: that.data.orderWxRefreshFtInfo,
      reloadData: function(RefreshFtInfo) {
        that.setData({
          orderWxRefreshFtInfo: RefreshFtInfo // 修改数据
        });
        that.fetchOrderList();
      }
    })
  },

  /********** 网络请求 **********/
  // 请求订单列表
  fetchOrderList: function() {
    var refreshInfoDic = this.data.orderWxRefreshFtInfo;
    refreshInfoDic.isLoadMore = true;
    var that = this;
    this.setData({ // 正在加载
      orderWxRefreshFtInfo: refreshInfoDic
    });
    var dataBody = {};
    dataBody.userId = this.data.userInfo.user.id;
    dataBody.accessToken = this.data.userInfo.user.accesstoken;
    dataBody.startPage = this.data.orderWxRefreshFtInfo.searchPageNum;
    dataBody.pageSize = this.data.orderWxRefreshFtInfo.callbackcount;
    var encStr = baseReq.encryptParam(dataBody);
    footerMgr.refreshFooterHandle({
      originObj: that,
      url: baseReq.interfaceName + 'order/listByUser',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      successCode: "00",
      bindList: that.data.orderList, //绑定操作数据
      bindRefreshInfo: that.data.orderWxRefreshFtInfo,
      curListData: function(res) { //置入数据源
        return res.data.data.orders;
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
        }
      },
      reloadData: function(reloadObj) { //必须(因为在数据处理和数据刷新中间还有一些操作所以不能在success中刷新,请在这里填写)
        
        if (reloadObj.list != null) {

          // 列表不为空
          reloadObj = that.textCut(reloadObj);
          for (var i = 0; i < reloadObj.list.length; i++) {
            var orderItem = reloadObj.list[i];
            // 卡片订单
            if (orderItem.type == 1) {
              // 是否显示使用赠送按钮
              var canUseOrGive = false;
              // 可用
              if (orderItem.signal == 6) {
                canUseOrGive = true;
              }
              // 有人领取
              if (orderItem.fetchers.length > 0) {
                for (var j = 0; j < orderItem.fetchers.length; j++) {
                  var fetcher = orderItem.fetchers[j];
                  // 添加领取人隐藏格式的手机号
                  var tel = fetcher.tel;
                  var prefix = tel.substring(0, 3); // 手机前缀
                  var suffix = tel.substring(7, 11); // 手机后缀
                  var showTel = prefix + '****' + suffix;
                  fetcher.showTel = showTel;
                }
              }
              orderItem.canUseOrGive = canUseOrGive;
            }
          }
          that.setData({
            isListLoading: false,
            orderList: reloadObj.list,
            isListEmpty: false,
            orderWxRefreshFtInfo: reloadObj.refreshInfo
          });
          that.amountStandard();
        } else {
          // 列表为空
          var isListEmpty;
          if (that.data.orderWxRefreshFtInfo.searchPageNum === 1) {
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
      fail: function(res) {
        that.setData({
          isListLoading: true,
          listLoadingFail: true
        });
      },
      complete: function(refreshInfo) {
        that.setData({
          orderWxRefreshFtInfo: refreshInfo //结束正在加载 
        });
      }
    })
  },

  /********** 点击事件 **********/
  // 点击重新加载商品列表
  tapReloadOrderList: function(event) {
    // 数据重置
    this.setData({
      isListLoading: true,
      listLoadingFail: false
    });
    // 请求商品列表
    this.resetData();
    this.fetchOrderList();
  },

  // 点击去支付
  tapPayment: function(e) {
    // 订单信息
    var orderItem = e.currentTarget.dataset.orderitem;
    var dataBody = {};
    dataBody.orderId = orderItem.id;
    dataBody.userId = this.data.userInfo.user.id;
    dataBody.accessToken = this.data.userInfo.user.accesstoken;
    var that = this;
    var encStr = baseReq.encryptParam(dataBody);
    wx.showLoading({
      title: '',
    })
    // 请求支付方式列表
    wx.request({
      url: baseReq.interfaceName + 'payment/order/availablePayType',
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
          var cashierItems = [];
          if (orderItem.type == 1) {
            // 卡片类型商品
            for (var i = 0; i < orderItem.cardentryList.length; i++) {
              var card = orderItem.cardentryList[i]
              // 装配收银台需要的数据
              var toPayItem = {};
              toPayItem.id = card.cardInfo.id;
              toPayItem.introduce = '';
              toPayItem.name = card.cardInfo.name;
              toPayItem.qty = card.qty;
              toPayItem.price = card.cardInfo.saleamount;
              toPayItem.carddefineid = card.carddefine; //卡定义ID（200版本，保持和卡片购买页参数一致）
              cashierItems.push(toPayItem);
            }

            var cashierInfo = {};
            cashierInfo.orderId = orderItem.id; // 是否来自于订单
            cashierInfo.type = 1; // 订单类型为卡片订单 （200版本，保持和卡片购买页参数一致）
            cashierInfo.itemList = cashierItems; // 展示的商品列表
            cashierInfo.paymentData = res.data.data; // 支付方式数据
            cashierInfo.totalPrice = orderItem.payamount; // 总价
            var paramStr = JSON.stringify(cashierInfo);
            // 跳转收银台页
            wx.navigateTo({
              url: '../../cashier_desk/cashier_desk?' + 'dataString=' + paramStr,
            })
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
        wx.hideLoading();
        wx.showToast({
          title: '获取支付列表失败',
          image: '/Resource/images/cross.png',
          duration: 3000
        });
      }
    })

    // 事件
    var actAmount = orderItem.paytype == 4 ? orderItem.actintegral : orderItem.actamount;
    wx.reportAnalytics('pay', {
      user_id: this.data.userInfo.user.id.toString(),
      membership_level: this.data.userInfo.glory.level.toString(),
      order_type: orderItem.type.toString(),
      order_id: orderItem.id.toString(),
      order_price: actAmount.toString(),
      account: this.data.userInfo.electronicAccount.balance.toString(),
      point: this.data.userInfo.pointAccount.balance.toString(),
    });
  },
  
  //文字溢出操作
  textCut: function (reloadObj) {
    var orderList = reloadObj.list;
    var screenWidth = app.globalData.screenWidth; //获取屏幕宽度
    var textWidth = (300 * screenWidth) / 750;  //文本最大宽度为430rpx，该公式算出来的单位是px
    var textbodyMaxLength = parseInt(textWidth / 16) - 1; //12像素文字的最大字数，需要取整，-1是后面要用来加...
    for (var i = 0; i < orderList.length; i++) {
      //描述  12px   限制2行
      var item = orderList[i];
      if (item.name.length > textbodyMaxLength) {
        var name = item.name.substr(0, textbodyMaxLength) + '...'
        item.strName = name;
      } else {
        item.strName = item.name;
      }
      // 去除多余字符
      var justice = item.strName.indexOf("*");
      if (justice != -1) {
        var showName = item.strName.substr(0, justice);
        item.showName = showName;
      } else {
        item.showName = item.strName;
      }
    }
    return reloadObj
  },

  //金额显示规范
  amountStandard: function () {
    var orderList = this.data.orderList;
    for(var i=0;i<orderList.length;i++){
      if (orderList[i].unrealload != '') {
        var unrealload = amount_standard.amountStandard(orderList[i].unrealload); // 赠送金额
      } else {
        var unrealload = 0;
      }
      if (orderList[i].payamount != '') {
        var payamount = amount_standard.amountStandard(orderList[i].payamount); // 应付
      } else {
        var payamount = 0;
      }
      if (orderList[i].couponamount != '') {
        var couponamount = amount_standard.amountStandard(orderList[i].couponamount); // 咖啡红包
      } else {
        var couponamount = 0;
      }
      var actAmount = Number(payamount) - Number(unrealload) - Number(couponamount);
      if (actAmount < 0){
        actAmount = 0;
      }
      orderList[i].actAmount = actAmount;
    }

    this.setData({
      orderList: orderList
    })
  },

  tapToCoffeeOrder: function() {
    wx.navigateTo({
      url: './machine_order',
    })
  },

  tapToOrderTail: function(e){
    var id = e.currentTarget.dataset.id;
    var dataBody = {};
    dataBody.orderId =id;
    var dataString = JSON.stringify(dataBody);
    wx.navigateTo({
      url: './order_tail/order_tail?' + 'dataString=' + dataString,
    })
  },

  resetData: function() {
    let that = this;
    this.setData({
      orderWxRefreshFtInfo: footerMgr.resetData(that.data.orderWxRefreshFtInfo) // 修改数据
    })
  }
})