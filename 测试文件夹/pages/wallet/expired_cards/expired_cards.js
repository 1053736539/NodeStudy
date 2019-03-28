// pages/wallet/expired_cards/expired_cards.js
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
    cardsList: [],
    isLoading: true,       //列表是否真在加载
    isloadingFail: false,  //列表是否加载失败
    reLoadingTipMsg: '网络似乎不太好...',
    userInfo: {},
    isListEmpty: true,
    domain: '',
    listWxRefreshFtInfo: {
      isFromSearch: true, // 用于判断List数组是不是空数组，默认true，空的数组
      searchPageNum: 1, // 设置加载的第几次，默认是第一次  
      callbackcount: 15, //返回数据的个数  
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
      title: '失效卡',
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
      this.fetchExpiredCards();
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
        that.fetchExpiredCards();
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

  // 请求卡列表
  fetchExpiredCards: function () {
    var refreshInfoDic = this.data.listWxRefreshFtInfo;
    refreshInfoDic.isLoadMore = true;
    var that = this;
    this.setData({ // 正在加载
      listWxRefreshFtInfo: refreshInfoDic
    });

    var dataBody = {};
    dataBody.userId = this.data.userInfo.user.id;
    dataBody.type = '1';
    dataBody.accessToken = this.data.userInfo.user.accesstoken;
    dataBody.startPage = this.data.listWxRefreshFtInfo.searchPageNum;
    dataBody.pageSize = this.data.listWxRefreshFtInfo.callbackcount;
    var encStr = basereq.encryptParam(dataBody);
    var that = this;

    footerMgr.refreshFooterHandle({
      originObj: that,
      url: basereq.interfaceName + 'card/getInvalidCardOrTicketByPage',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      successCode: "00",
      bindList: that.data.cardsList, //绑定操作数据
      bindRefreshInfo: that.data.listWxRefreshFtInfo,
      curListData: function (res) { //置入数据源
        return res.data.data.result;
      },
      success: function (list, res) { // 获取数据成功对列表数据进行处理(可以不需要)
        var code = res.data.code.toString();
        var suffix = code.substr(code.length - 2, 2);
        if (suffix != "00") {
          // 接口成功，数据失败
          that.setData({
            isLoading: true,
            loadingFail: true,
            reLoadingTipMsg: res.data.msg,
          });
        } else {
          that.setData({
            isLoading: false,
          });
        }
      },
      reloadData: function (reloadObj) { //必须(因为在数据处理和数据刷新中间还有一些操作所以不能在success中刷新,请在这里填写)
        if (reloadObj.list != null) {
          // 列表不为空
          var cardsList = reloadObj.list;
          that.setData({
            isListEmpty: false,
            cardsList: cardsList,
            listWxRefreshFtInfo: reloadObj.refreshInfo
          });
        } else {
          // 空列表
          var isListEmpty;
          if (that.data.listWxRefreshFtInfo.searchPageNum === 1) {
            // 是首页且列表空 则说明整个接口数据为空
            isListEmpty = true;
          } else {
            // 是末尾页且列表空 则刚好最后一页是callbackcount条数据 说明其实前面是有数据的
            isListEmpty = false;
          }
          that.setData({
            isLoading: false,
            isListEmpty: isListEmpty,
          });
        }
      },
      fail: function (res) {
        that.setData({
          isLoading: true,
          isLoadingFail: true,
        });
      },
      complete: function (refreshInfo) {
        that.setData({
          listWxRefreshFtInfo: refreshInfo //结束正在加载 
        });
      }
    })
  },

  tapReload: function () {
    this.setData({
      isLoading: true,
      isLoadingFail: false,
    });
    this.fetchExpiredCards();
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
    } else if (card.carddefine.cardtype.number == '010') {
      // 早春卡
      prefixURL = '../use_activity_card/use_activity_card?'
    } else if (card.carddefine.cardtype.number == '011') {
      // 麦粉卡
      prefixURL = '../use_gift_card/use_gift_card?';
    } else {
      return;
    }
    var cardJSON = JSON.stringify(card);
    var valueString = 'dataString=' + cardJSON;
    wx.navigateTo({
      url: prefixURL + valueString,
    });
  },

  fetchCleanExpiredCards: function () {
    var dataBody = {};
    dataBody.type = '1';
    dataBody.userId = this.data.userInfo.user.id;
    dataBody.accessToken = this.data.userInfo.user.accesstoken;
    
    var that = this;
    var encStr = basereq.encryptParam(dataBody);
    wx.showLoading({

    });
    wx.request({
      url: basereq.interfaceName + 'card/delBatchCardOrTicket',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.hideLoading();

        var code = res.data.code.toString();
        var suffix = code.substr(code.length - 2, 2);
        if (suffix == '00') {
          // 删除成功
          that.setData({
            isListEmpty: true,
          });
        } else {
          // 其他错误
          wx.showToast({
            title: res.data.msg,
            image: '/Resource/images/cross.png',
            duration: 3000
          });
        }
      },
      fail: function (res) {
        wx.hideLoading();
        wx.showToast({
          title: res.errMsg,
          image: '/Resource/images/cross.png',
          duration: 3000
        });
      }
    })
  },

  didTapCleanExpiredCards: function () {
    var that = this;
    wx.showModal({
      title: '确认要清空失效卡吗？',
      confirmText: '是的',
      success: function (res) {
        if (res.confirm) {
          that.fetchCleanExpiredCards();
        }
      }
    })
  }
})