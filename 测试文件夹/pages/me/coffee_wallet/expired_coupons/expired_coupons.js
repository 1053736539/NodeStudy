// pages/me/coffee_wallet/coffee_wallet.js
var basereq = require('../../../../utils/base_req.js');
// 引入loginMgr
var loginMgr = require('../../../../utils/loginManager/loginMgr.js');
// 引入下拉刷新
var footerMgr = require('../../../../utils/refreshFooter.js');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    couponGroupList: [],
    couponQty: 0,
    isListLoading: true,
    listLoadingFail: false,
    reLoadingTipMsg: '网络似乎不太好...',
    couponWxRefreshFtInfo: {
      isFromSearch: true, // 用于判断couponList数组是不是空数组，默认true，空的数组
      searchPageNum: 1, // 设置加载的第几次，默认是第一次  
      callbackcount: 15, //返回数据的个数  
      searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
      searchLoadingComplete: false, //“没有数据”的变量，默认false，隐藏
      isLoadMore: false // 正在加载更多
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '过期券',
    });
    var userInfo = loginMgr.fetchUserInfo();
    this.setData({
      userInfo: userInfo,
    });
    this.fetchExpiredCouponGroup();
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
      couponWxRefreshFtInfo: footerMgr.onPullDownRefresh(that.data.couponWxRefreshFtInfo) // 修改数据
    })
    this.fetchExpiredCouponGroup();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var that = this;
    footerMgr.onReachBottom({
      refreshInfo: that.data.couponWxRefreshFtInfo,
      reloadData: function(RefreshFtInfo) {
        that.setData({
          couponWxRefreshFtInfo: RefreshFtInfo // 修改数据
        });
        that.fetchExpiredCouponGroup();
      }
    })
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  fetchExpiredCouponGroup: function() {
    var refreshInfoDic = this.data.couponWxRefreshFtInfo;
    refreshInfoDic.isLoadMore = true;
    var that = this;
    this.setData({ // 正在加载
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
      url: basereq.interfaceName + '/coupon/getExpiredCouponList',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      successCode: "00",
      bindList: that.data.couponGroupList, //绑定操作数据
      bindRefreshInfo: that.data.couponWxRefreshFtInfo,
      curListData: function(res) { //置入数据源
        return res.data.data.coupon_list;
      },
      success: function(list, res) { // 获取数据成功对列表数据进行处理(可以不需要)
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
          if (list.length > 0) {
            //由于过期优惠券不计数，因此数量当列表不为空的时候置为1
            var couponQty = 1;
          }
          that.setData({
            isListLoading: false,
            couponGroupList: list,
            couponQty: couponQty,
          });
        }
      },
      reloadData: function(reloadObj) { //必须(因为在数据处理和数据刷新中间还有一些操作所以不能在success中刷新,请在这里填写)
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

      fail: function(res) {
        that.setData({
          isListLoading: true,
          listLoadingFail: true,
        });
      },

      complete: function(refreshInfo) {
        that.setData({
          couponWxRefreshFtInfo: refreshInfo //结束正在加载 
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
      var dateString = "有效期：" + item.createtime + " 至" + item.expirationtime;
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
  tapReloadCouponList: function(event) {
    // 数据重置
    this.setData({
      isListLoading: true,
      listLoadingFail: false
    });
    this.fetchExpiredCouponGroup();
  },

})