// pages/wallet/use_activity_card/use_activity_card.js
// barcode
var wxbarcode = require('../../../utils/index.js');

var basereq = require('../../../utils/base_req.js');

var loginMgr = require('../../../utils/loginManager/loginMgr.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    domain: '',
    cardId: '',
    code: '',
    isCardLoading: true,     // 卡片是否真在加载
    cardLoadingFail: false,  // 卡片是否加载失败
    reLoadingTipMsg: '网络似乎不太好...',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var strJSON = options.dataString; //字符串
    var objCard = JSON.parse(strJSON);// 转成对象
    this.setData({
      cardId: objCard.id,
      domain: basereq.domain
    });
    // this.fetchCardInfo();
    wx.setNavigationBarTitle({
      title: objCard.name,
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
    this.fetchCardInfo();
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
    this.fetchCardInfo();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /********** 网络请求 **********/
  // 请求卡片详情
  fetchCardInfo: function () {
    var userInfo = loginMgr.fetchUserInfo();
    var dataBody = {};
    dataBody.userId = userInfo.user.id;
    dataBody.accessToken = userInfo.user.accesstoken;
    dataBody.cardId = this.data.cardId;
    var encStr = basereq.encryptParam(dataBody);
    var that = this;
    wx.request({
      url: basereq.interfaceName + 'card/getCardInfo',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var code = res.data.code.toString();
        if (code =='200300') {
          // 获取卡详情成功
          var cardInfo = res.data.data;
          that.setData({
            isCardLoading: false,
            card: cardInfo,
          });
        } else if (code == '200302') {
          // 卡片已经被朋友领取
          that.cardHasReceived();
        } else {
          // 获取卡详情失败
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

  cardHasReceived: function () {
    wx.showModal({
      title: '卡片已被领取',
      content: '朋友已经领取了你送出的礼物',
      showCancel: false,
      success: function (res) {
        wx.navigateBack({
          delta: 1
        });
      }
    });
  },

  // 点击重新加载
  tapReloadCards: function (event) {
    // 数据重置
    this.setData({
      isCardLoading: true,
      cardLoadingFail: false,
    });
    // 请求卡片
    this.fetchCardInfo();
  },

  // 点击再买一张
  tapBuyAgain: function () {
    wx.showLoading({
      title: '',
    })
    var dataBody = {};
    dataBody.cardGroupId = this.data.card.carddefine.cardgroupid;
    dataBody.startPage = '1';
    dataBody.pageSize = '999';
    var encStr = basereq.encryptParam(dataBody);
    var that = this;
    wx.request({
      url: basereq.interfaceName + 'card/getCardListbyGroupId',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var cardGroupInfo = res.data.data;
        wx.hideLoading();
        if (cardGroupInfo.cardgroup.status == 3) {
          // 卡组还在上架中
          var card = {};
          card.id = that.data.card.carddefine.cardgroupid;
          card.cardtype = that.data.card.carddefine.cardtype;
          var dataDic = {};
          dataDic.cardInfo = card;
          var cardJSON = JSON.stringify(dataDic);
          var valueString = 'dataString=' + cardJSON;
          if (card.cardtype.number == '003') {
            wx.navigateTo({
              url: '../../purchase/buy_card/buy_card?' + valueString,
            })
          } else if (card.cardtype.number == '006') {
            wx.navigateTo({
              url: '../../purchase/buy_multi_card/buy_multi_card?' + valueString,
            })
          } else if (card.cardtype.number == '010') {
            // 早春卡
            wx.navigateTo({
              url: '../../purchase/buy_balance/buy_balance?' + valueString,
            })
          } else {
            wx.navigateTo({
              url: '../../purchase/buy_balance/buy_balance?' + valueString,
            })
          }
        } else {
          // 卡组已经下架
          wx.switchTab({
            url: '/pages/mall/mall',
            success: function (res) { },
            fail: function (res) { },
            complete: function (res) { },
          })
        }
      },
      fail: function (res) {
        wx.hideLoading();
      }
    })
  },

  // 点击删除卡片
  tapDeleteCard: function () {
    var cardlist = [];
    var item = {};
    item.id = this.data.card.id;
    cardlist.push(item);
    var userInfo = loginMgr.fetchUserInfo();
    // 发起卡片删除
    wx.showLoading({
      title: '',
    })
    var dataBody = {};
    dataBody.userId = userInfo.user.id;
    // 转字符串
    dataBody.cardlist = JSON.stringify(cardlist);
    dataBody.accessToken = userInfo.user.accesstoken;
    var encStr = basereq.encryptParam(dataBody);
    var that = this;

    wx.request({
      url: basereq.interfaceName + 'card/del',
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
          // 删卡成功
          wx.navigateBack({
          })
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
      }
    });

    // 事件
    wx.reportAnalytics('delete_card', {
      user_id: userInfo.user.id.toString(),
      membership_level: userInfo.glory.level.toString(),
      card_id: card.id.toString(),
      card_name: card.name,
    });
  },

  //点击立即使用
  didTapShowMultiQRcode: function () {
    wx.showModal({
      title: '',
      content: '无需出示卡券二维码，向店员出示您的会员码即可使用卡券快速结账。是否前往会员码页?',
      confirmText: '好的',
      success(res) {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/cards/my_qrcode/my_qrcode'
          });
        } else if (res.cancel) {

        }
      }
    })
  },

})