// machine_order.js
// 引入login manager
var loginMgr = require('../../../utils/loginManager/loginMgr.js');
// 引入Base Request
var baseReq = require('../../../utils/base_req.js');
// 引入Refresh Footer
var footerMgr = require('../../../utils/refreshFooter.js');
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
    orderRefreshFtInfo: {
      isFromSearch: true,           // 用于判断orderList数组是不是空数组，默认true，空的数组
      searchPageNum: 1,             // 设置加载的第几次，默认是第一次
      callbackcount: 15,            //返回数据的个数
      searchLoading: false,         //"上拉加载"的变量，默认false，隐藏
      searchLoadingComplete: false, //“没有数据”的变量，默认false，隐藏
      isLoadMore: false            // 正在加载更多
    },
    isListEmpty: true  //判断订单的数量是否为空
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '咖啡机订单',
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
      orderRefreshFtInfo: footerMgr.onPullDownRefresh(that.data.orderRefreshFtInfo) // 修改数据
    })
    this.fetchOrderList();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    footerMgr.onReachBottom({
      refreshInfo: that.data.orderRefreshFtInfo,
      reloadData: function (RefreshFtInfo) {
        that.setData({
          orderRefreshFtInfo: RefreshFtInfo // 修改数据
        });
        that.fetchOrderList();
      }
    })
  },

  /********** 网络请求 **********/
  // 请求订单列表
  fetchOrderList: function () {
    var refreshInfoDic = this.data.orderRefreshFtInfo;
    refreshInfoDic.isLoadMore = true;
    var that = this;
    this.setData({// 正在加载
      orderRefreshFtInfo: refreshInfoDic
    });
    var dataBody = {};
    dataBody.userId = this.data.userInfo.user.id;
    dataBody.accessToken = this.data.userInfo.user.accesstoken;
    dataBody.startPage = this.data.orderRefreshFtInfo.searchPageNum;
    dataBody.pageSize = this.data.orderRefreshFtInfo.callbackcount;
    var encStr = baseReq.encryptParam(dataBody);

    footerMgr.refreshFooterHandle({
      originObj: that,
      url: baseReq.interfaceName + 'order/coffeeMacOrderList',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      successCode: "00",
      bindList: that.data.orderList,//绑定操作数据
      bindRefreshInfo: that.data.orderRefreshFtInfo,
      curListData: function (res) {//置入数据源
        return res.data.data.order;
      },
      success: function (list,res) {// 获取数据成功对列表数据进行处理(可以不需要)
        var code = res.data.code.toString();
        var suffix = code.substr(code.length - 2, 2);
        if (suffix != "00") {
          // 接口访问成功，数据失败
          that.setData({
            isListLoading: true,
            listLoadingFail: true,
            orderList: list,
            reLoadingTipMsg: res.data.msg,
          });
        } else {
          // 接口成功 数据成功
          that.setData({
            isListLoading: false,
          });
        }
      },
      reloadData: function (reloadObj) {//必须(因为在数据处理和数据刷新中间还有一些操作所以不能在success中刷新,请在这里填写)
        if (reloadObj.list != null) {
          // 列表不为空
        var reloadObj = that.textCut(reloadObj);
        var orderList = reloadObj.list;
        that.setData({
          isListLoading: false,
          orderList: orderList,
          isListEmpty: false,
          orderRefreshFtInfo: reloadObj.refreshInfo
        });
        } else {
          // 列表为空
          var isListEmpty;
          if (that.data.orderRefreshFtInfo.searchPageNum === 1) {
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
          orderRefreshFtInfo: refreshInfo  //结束正在加载 
        });
      }
    })
  },

  /********** 点击事件 **********/
  // 点击重新加载商品列表
  tapReloadOrderList: function (event) {
    // 数据重置
    this.setData({
      isListLoading: true,
      listLoadingFail: false
    });
    // 请求商品列表
    this.resetData();
    this.fetchOrderList();
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

  tapToOrderTail: function (e) {
    var index = e.currentTarget.dataset.index;
    var orderList = this.data.orderList;
    var dataBody = {};
    dataBody.orderTailInfo = orderList[index];
    var dataString = JSON.stringify(dataBody);
    wx.navigateTo({
      url: './machine_order_tail/machine_order_tail?' + 'dataString=' + dataString,
    })
  },

  resetData: function () {
    let that = this;
    this.setData({
      orderRefreshFtInfo: footerMgr.resetData(that.data.orderRefreshFtInfo) // 修改数据
    })
  },

})