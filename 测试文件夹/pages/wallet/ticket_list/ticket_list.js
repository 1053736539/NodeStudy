// pages/wallet/ticket_list/ticket_list.js
var basereq = require('../../../utils/base_req.js');
// 引入loginMgr
var loginMgr = require('../../../utils/loginManager/loginMgr.js');
// 引入下拉刷新
var footerMgr = require('../../../utils/refreshFooter.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ticketsList: [],
    usableCount: 0,
    isLoading: true,       //列表是否真在加载
    isLoadingFail: false,  //列表是否加载失败
    reLoadingTipMsg: '网络似乎不太好...',
    userInfo: {},
    listWxRefreshFtInfo: {
      isFromSearch: true, // 用于判断List数组是不是空数组，默认true，空的数组
      searchPageNum: 1, // 设置加载的第几次，默认是第一次  
      callbackcount: 15, //返回数据的个数  
      searchLoading: false, //"上拉加载"的变量，默认false，隐藏  
      searchLoadingComplete: false, //“没有数据”的变量，默认false，隐藏
      isLoadMore: false // 正在加载更多
    },
    domain: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '我的券',
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
    // 用户信息
    var userInfo = loginMgr.fetchUserInfo();
    this.setData({
      userInfo: userInfo,
      domain: basereq.domain
    });
    if (userInfo.isLogin) {
      this.resetData();
      this.fetchAllTickets();
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
      listWxRefreshFtInfo: footerMgr.onPullDownRefresh(that.data.listWxRefreshFtInfo) // 修改数据
    })
    this.fetchAllTickets();
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
        that.fetchAllTickets();
      }
    })
  },

  /********** 网络请求 **********/
  // 重置数据
  resetData: function () {
    let that = this;
    this.setData({
      listWxRefreshFtInfo: footerMgr.resetData(that.data.listWxRefreshFtInfo) // 修改数据
    })
  },

  // 请求券列表
  fetchAllTickets: function () {
    var refreshInfoDic = this.data.listWxRefreshFtInfo;
    refreshInfoDic.isLoadMore = true;
    var that = this;
    this.setData({ // 正在加载
      listWxRefreshFtInfo: refreshInfoDic
    });

    var dataBody = {};
    dataBody.userId = this.data.userInfo.user.id;
    dataBody.type = '2';
    dataBody.accessToken = this.data.userInfo.user.accesstoken;
    dataBody.startPage = this.data.listWxRefreshFtInfo.searchPageNum;
    dataBody.pageSize = this.data.listWxRefreshFtInfo.callbackcount;
    var encStr = basereq.encryptParam(dataBody);
    var that = this;

    footerMgr.refreshFooterHandle({
      originObj: that,
      url: basereq.interfaceName + 'card/checkMore',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      successCode: "01",
      bindList: that.data.ticketsList, //绑定操作数据
      bindRefreshInfo: that.data.listWxRefreshFtInfo,
      curListData: function (res) { //置入数据源
        return res.data.data.cardOrTicketList;
      },
      success: function (list, res) { // 获取数据成功对列表数据进行处理(可以不需要)
        var code = res.data.code.toString();
        var suffix = code.substr(code.length - 2, 2);
        var usableCount = res.data.data.total;
        if (suffix != "01") {
          // 接口成功，数据失败
          that.setData({
            isLoading: true,
            loadingFail: true,
            reLoadingTipMsg: res.data.msg,
          });
        } else {
          that.setData({
            usableCount: usableCount,
            isLoading: false,
          });
        }
      },
      reloadData: function (reloadObj) { //必须(因为在数据处理和数据刷新中间还有一些操作所以不能在success中刷新,请在这里填写)
        if (reloadObj.list != null) {
          // 列表不为空
          var ticketsList = reloadObj.list;
          that.setData({
            ticketsList: ticketsList,
            listWxRefreshFtInfo: reloadObj.refreshInfo
          });
        } else {
          // 空列表
          that.setData({
            isLoading: false,
          });
        }
      },
      fail: function (res) {
        that.setData({
          isLoading: true,
          loadingFail: true,
        });
      },
      complete: function (refreshInfo) {
        that.setData({
          listWxRefreshFtInfo: refreshInfo //结束正在加载 
        });
      }
    })
  },

  // 点击了卡片
  didTapCard: function (event) {
    var card = event.currentTarget.dataset.card;
    var prefixURL = '';
    if (card.carddefine.cardtype.number == '001') {
      // 面额卡
      prefixURL = '../use_balance_card/use_balance_card?';
    } else if (card.carddefine.cardtype.number == '002') {
      // 活动卡
      prefixURL = '../use_activity_card/use_activity_card?';
    } else if (card.carddefine.cardtype.number == '003' || card.carddefine.cardtype.number == '006') {
      // 礼品卡
      prefixURL = '../use_gift_card/use_gift_card?';
    } else if (card.carddefine.cardtype.number == '000') {
      // 会员券
      prefixURL = '../use_ticket/use_ticket?';
    } else if (card.carddefine.cardtype.number == '008') {
      // 员工券
      prefixURL = '../use_ticket/use_ticket?';
    } else if (card.carddefine.cardtype.number == '012') {
      // 体验券
      prefixURL = '../use_ticket/use_ticket?';
    } else if (card.carddefine.cardtype.number == '013') {
      // 代金券
      prefixURL = '../use_ticket/use_ticket?';
    } else {
      return;
    }
    var cardJSON = JSON.stringify(card);
    var valueString = 'dataString=' + cardJSON;
    wx.navigateTo({
      url: prefixURL + valueString,
    });

    // 事件
    wx.reportAnalytics('view_use_card', {
      user_id: this.data.userInfo.user.id.toString(),
      membership_level: this.data.userInfo.glory.level.toString(),
    });
  },

  didTapCheckExpiredTickets: function () {
    wx.navigateTo({
      url: '../expired_tickets/expired_tickets',
    });
  },

  tapReloadCards: function() {
    this.setData({
      isLoading: true,
      isLoadingFail: false,
    });
    this.fetchAllTickets();
  },
})