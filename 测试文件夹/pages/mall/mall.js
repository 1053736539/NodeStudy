// mall.js
var basereq = require('../../utils/base_req.js');

// 新增注释
var app = getApp();
Page({
  data: {
    domain: '',
    isCardLoading: true,     //卡片列表是否真在加载
    cardLoadingFail: false,  //卡片礼拜是否加载失败
    reLoadingTipMsg: '网络似乎有点不太好～',
    cardList: [],             //商品列表,
    bannerItems: [],
    indicatorDots: true,
    autoplay: true,
    interval: 3500,
    duration: 250,
  },

  /********** 生命周期 **********/
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    wx.setNavigationBarTitle({
      title: '商店',
    });
    this.getBannerList();
    this.fetchCardList();
    this.setData({
      domain: basereq.domain,
    })
  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  /**
  * 页面相关事件处理函数--监听用户下拉动作
  */
  onPullDownRefresh: function () {
    this.fetchCardList();
    this.getBannerList();
  },

  onShareAppMessage: function () {

  },

  /********** 网络请求 **********/
  // 请求卡片列表
  fetchCardList: function () {
    var dataBody = {};
    dataBody.startPage = '1';
    dataBody.pageSize = '999';
    var encStr = basereq.encryptParam(dataBody);
    var that = this;
    wx.request({
      url: basereq.interfaceName + 'card/getCardgroupList',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var code = res.data.code.toString();
        var suffix = code.substr(code.length - 2, 2);
        if (suffix == '00') {
          var card = res.data.data.cardgroup_list;
          var screenWidth = app.globalData.screenWidth; //获取屏幕宽度
          var textWidth = (330 * screenWidth)/750 //330rpx宽度换算成px，该公式算出来的单位是px
          var textHeadMaxLength = parseInt(textWidth / 14) - 1;  //14像素文字的最大字数,需要取整，-1是后面要用来加...
          var textbodyMaxLength = parseInt(textWidth / 12) - 1;  //12像素文字的最大字数，需要取整，-1是后面要用来加...
          for (var i = 0; i < card.length; i++) {
            var item = card[i];
            if (item.name.length > 2 * textHeadMaxLength){
              var name = item.name.substr(0, 2 * textHeadMaxLength) + '...'
              item.itemName = name;
            } else {
              item.itemName = item.name;
            }
          }

          that.setData({
            isCardLoading: false,
            cardList: card,
          });
        } else {
          that.setData({
            cardLoadingFail: true,
          });
        }
      },
      fail: function (res) {
        that.setData({
          cardLoadingFail: true,
        });
      },
      complete: function () {
        wx.stopPullDownRefresh();
      }
    })

  },

  getBannerList: function () {
    var dataBody = {};
    dataBody.position = '2';
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


  // 点击卡片
  didTapCard: function (event) {
    var card = event.currentTarget.dataset.card;
    var dataDic = {};
    dataDic.cardInfo = card;
    var cardJSON = JSON.stringify(dataDic);
    var valueString = 'dataString=' + cardJSON;
    if (card.cardtype.number == '003') {
      wx.navigateTo({
        url: '../purchase/buy_card/buy_card?' + valueString,
      })
    } else if (card.cardtype.number == '006') {
      wx.navigateTo({
        url: '../purchase/buy_multi_card/buy_multi_card?' + valueString,
      })
    } else if (card.cardtype.number == '010') {
      // 早春卡
      wx.navigateTo({
        url: '../purchase/buy_balance/buy_balance?' + valueString,
      })
    } else {
      wx.navigateTo({
        url: '../purchase/buy_balance/buy_balance?' + valueString,
      })
    }

    // 事件
    var user_id = this.data.isLogin ? this.data.userInfo.user.id : '';
    var user_level = this.data.isLogin ? this.data.userInfo.glory.level : '';
    wx.reportAnalytics('view_card_detail', {
      user_id: user_id.toString(),
      membership_level: user_level.toString(),
      card_group_type: card.cardtype.number.toString(),
      card_group_id: card.id.toString(),
      card_group_name: card.name,
    });
  },

  // 点击重新加载卡片列表
  tapReloadCards: function (event) {
    // 数据重置
    this.setData({
      isCardLoading: true,
      cardLoadingFail: false,
      cardList: [],
    });
    // 请求卡片列表
    this.fetchCardList();
    this.getBannerList();
  }
})