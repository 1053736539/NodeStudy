// pages/me/pos_order/pos_order.js

// 引入login manager
var loginMgr = require('../../../utils/loginManager/loginMgr.js');
// 引入amount_standard
var amountStd = require('../../../utils/amount_standard.js');
// 引入Base Request
var baseReq = require('../../../utils/base_req.js');
// 引入Refresh Footer
var footerMgr = require('../../../utils/refreshFooter.js');

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
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '消费记录',
    });
    var user = loginMgr.fetchUserInfo();
    this.setData({
      userInfo: user,
      domain: baseReq.domain
    });
    this.resetData();
    this.fetchPosOrderList();
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
      orderWxRefreshFtInfo: footerMgr.onPullDownRefresh(that.data.orderWxRefreshFtInfo) // 修改数据
    })
    this.fetchPosOrderList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    footerMgr.onReachBottom({
      refreshInfo: that.data.orderWxRefreshFtInfo,
      reloadData: function (RefreshFtInfo) {
        that.setData({
          orderWxRefreshFtInfo: RefreshFtInfo // 修改数据
        });
        that.fetchPosOrderList();
      }
    })
  },

  /********** 网络请求 **********/
  // 请求Pos订单列表
  fetchPosOrderList: function () {
    var refreshInfoDic = this.data.orderWxRefreshFtInfo;
    refreshInfoDic.isLoadMore = true;
    var that = this;
    this.setData({ // 正在加载
      orderWxRefreshFtInfo: refreshInfoDic
    });
    var dataBody = {};
    dataBody.userId = this.data.userInfo.user.id;
    dataBody.userNumber = this.data.userInfo.user.number;
    dataBody.accessToken = this.data.userInfo.user.accesstoken;
    dataBody.startPage = this.data.orderWxRefreshFtInfo.searchPageNum;
    dataBody.pageSize = this.data.orderWxRefreshFtInfo.callbackcount;
    var encStr = baseReq.encryptParam(dataBody);
    footerMgr.refreshFooterHandle({
      originObj: that,
      url: baseReq.interfaceName + 'order/posExpensesRecord',
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
      curListData: function (res) { //置入数据源
        return res.data.data.order;
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
        }
      },
      reloadData: function (reloadObj) { //必须(因为在数据处理和数据刷新中间还有一些操作所以不能在success中刷新,请在这里填写)

        if (reloadObj.list != null) {
          // 列表不为空
          // 处理总金额显示
          for (var i = 0; i < reloadObj.list.length; i++) {
            var orderItem = reloadObj.list[i];
            var showamount = amountStd.amountStandard(orderItem.actamount);
            orderItem.showamount = showamount;
          }
          that.setData({
            isListLoading: false,
            orderList: reloadObj.list,
            isListEmpty: false,
            orderWxRefreshFtInfo: reloadObj.refreshInfo
          });
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
      fail: function (res) {
        that.setData({
          isListLoading: true,
          listLoadingFail: true
        });
      },
      complete: function (refreshInfo) {
        that.setData({
          orderWxRefreshFtInfo: refreshInfo //结束正在加载 
        });
      }
    })
  },

  /********** 点击事件 **********/
  // 点击订单
  tapPosOrderDetail: function (e) {
    var orderItem = e.currentTarget.dataset.order;
    var dataBody = {};
    dataBody.orderId = orderItem.id;
    dataBody.shopname = orderItem.shopname;
    var dataString = JSON.stringify(dataBody);
    wx.navigateTo({
      url: './pos_order_detail/pos_order_detail' + '?dataString=' + dataString,
    })
  },

  // 点击重新加载
  tapReloadPosOrderList: function (event) {
    // 数据重置
    this.setData({
      isListLoading: true,
      listLoadingFail: false
    });
    // 请求商品列表
    this.resetData();
    this.fetchPosOrderList();
  },

  resetData: function () {
    let that = this;
    this.setData({
      orderWxRefreshFtInfo: footerMgr.resetData(that.data.orderWxRefreshFtInfo) // 修改数据
    })
  }
})