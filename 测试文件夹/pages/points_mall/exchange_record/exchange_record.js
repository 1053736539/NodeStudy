// pages/points_mall/exchange_record/exchange_record.js
// 引入请求基础类
var baseReq = require('../../../utils/base_req.js');
// 引入loginMgr
var loginMgr = require('../../../utils/loginManager/loginMgr.js');
// 引入Refresh Footer
var footerMgr = require('../../../utils/refreshFooter.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    domain: '',
    isListLoading: true,
    listLoadingFail: false,
    reLoadingTipMsg: '网络似乎不太好...',
    isListEmpty: true,
    userInfo: null,
    recordList: [],
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
  onLoad: function(options) {
    wx.setNavigationBarTitle({
      title: '兑换记录',
    });
    this.setData({
      domain: baseReq.domain
    });
    this.detecIfUserLogin();
    this.resetData();
    this.fetchExchangeRecordList();
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
      listWxRefreshFtInfo: footerMgr.onPullDownRefresh(that.data.listWxRefreshFtInfo) // 修改数据
    })
    this.fetchExchangeRecordList();
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
        that.fetchExchangeRecordList();
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
  // 检查用户是否登录
  detecIfUserLogin: function() {
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

  // 获取积分兑换记录列表
  fetchExchangeRecordList: function() {
    var refreshInfoDic = this.data.listWxRefreshFtInfo;
    refreshInfoDic.isLoadMore = true;
    var that = this;
    this.setData({ // 正在加载
      listWxRefreshFtInfo: refreshInfoDic
    });
    var dataBody = {};
    dataBody.userId = this.data.userInfo.user.id;
    dataBody.accessToken = this.data.userInfo.user.accesstoken;
    dataBody.startPage = this.data.listWxRefreshFtInfo.searchPageNum;
    dataBody.pageSize = this.data.listWxRefreshFtInfo.callbackcount;
    var encStr = baseReq.encryptParam(dataBody);

    footerMgr.refreshFooterHandle({
      originObj: that,
      url: baseReq.interfaceName + 'pointshop/convertRecord',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      successCode: "00",
      bindList: that.data.recordList, //绑定操作数据
      bindRefreshInfo: that.data.listWxRefreshFtInfo,
      curListData: function(res) { //置入数据源
        return res.data.data.convertList;
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
          // 接口成功，数据也成功
        }
      },
      reloadData: function(reloadObj) { //必须(因为在数据处理和数据刷新中间还有一些操作所以不能在success中刷新,请在这里填写)
        if (reloadObj.list != null) {
          // 列表不为空
          // 做文案末尾省略处理
          var recordList = reloadObj.list;
          var screenWidth = getApp().globalData.screenWidth;
          // 标题文案宽度 = 屏幕宽 - 图片宽80 - 文案与图片间隔10
          var titleWidth = screenWidth - 80 - 10 - 30;
          // 限制两行 字体大小16px 减一位用来放"..."
          var titleMaxLength = 2 * parseInt(titleWidth / 16) - 1;
          // 遍历列表 插入显示的字符串
          for (var index = 0; index < recordList.length; index++) {
            var item = recordList[index];
            if (item.type === 6) {
              // 优惠券
              for (var i = 0; i < item.couponentryList.length; i++) {
                var couponItem = item.couponentryList[i];
                var name = couponItem.couponDefineInfo.name;
                if (name.length > titleMaxLength) {
                  var displayName = name.substr(0, titleMaxLength - 1) + '...';
                  couponItem.displayName = displayName;
                } else {
                  couponItem.displayName = name;
                }
              }
            } else if (item.type === 5) {
              // 卡券
              for (var i = 0; i < item.cardentryList.length; i++) {
                var cardItem = item.cardentryList[i];
                var name = cardItem.cardInfo.name;
                if (name.length > titleMaxLength) {
                  var displayName = name.substr(0, titleMaxLength - 1) + '...';
                  cardItem.displayName = displayName;
                } else {
                  cardItem.displayName = name;
                }
              }
            }
          }
          that.setData({
            isListEmpty: false,
            isListLoading: false,
            recordList: recordList,
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

  // 重新加载
  // 点击重新加载
  tapReload: function() {
    this.setData({
      isListLoading: true,
      listLoadingFail: false,
    });
    this.detecIfUserLogin();
    this.resetData();
    this.fetchExchangeRecordList();
  },

  tapToOrderTail: function (e) {
    var id = e.currentTarget.dataset.id;
    var dataBody = {};
    dataBody.orderId = id;
    var dataString = JSON.stringify(dataBody);
    wx.navigateTo({
      url: './record_tail/record_tail?' + 'dataString=' + dataString,
    })
  }
})