// use_balance_card.js
// 引入base_req
var basereq = require('../../../utils/base_req.js');

var loginMgr = require('../../../utils/loginManager/loginMgr.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    domain:'',
    cardId:'',
    card: {},
    isCardLoading: true,     //卡片是否真在加载
    cardLoadingFail: false,  //卡片是否加载失败
    reLoadingTipMsg: '网络似乎不太好...',
    canGift: false,
    canBuyAgain: false
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
        if (code == '200300') {
          // 获取卡详情成功
          var cardInfo = res.data.data;
          // 判定可赠送
          if ((cardInfo.cardStockInfo.isgive == 1) && (cardInfo.status == 1)) {
            var canGift = true
          }
          // 判断可再次购买
          var canBuyAgain;
          if (cardInfo.carddefine.cardgroupid === 16) {
            // 福利卡不可以再次购买
            canBuyAgain = false;
          } else {
            // 其余卡用卡状态判定
            if (cardInfo.status === 1 || cardInfo.status === 4) {
              canBuyAgain = false;
            } else {
              canBuyAgain = true;
            }
          }
                                                             
          that.setData({
            isCardLoading: false,
            card: cardInfo,
            canGift: canGift,
            canBuyAgain: canBuyAgain
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

  // 面额卡充值
  fetchUseCard: function () {
    var userInfo = loginMgr.fetchUserInfo();
    var dataBody = {};
    dataBody.userId = userInfo.user.id;
    dataBody.cardId = this.data.card.id;
    dataBody.accessToken = userInfo.user.accesstoken;
    var that = this;
    var encStr = basereq.encryptParam(dataBody);
    wx.showLoading({
      title: '',
    })
    wx.request({
      url: basereq.interfaceName + 'card/usedCard',
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
          // 充值成功
          wx.navigateTo({
            url: './rechargeSucc/rechargeSucc',
          })
          that.fetchCardInfo();
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
    })

    // 事件
    wx.reportAnalytics('use_card', {
      user_id: userInfo.user.id.toString(),
      membership_level: userInfo.glory.level.toString(),
      card_group_type: this.data.card.carddefine.cardtype.number.toString(),
      card_group_id: '',
      card_group_name: '',
      card_id: this.data.card.id.toString(),
      card_name: this.data.card.name,
      card_price: this.data.card.cardStockInfo.saleamount.toString(),
    });
  },

  fetchGiftCard: function () {
    var card = this.data.card;
    var userInfo = loginMgr.fetchUserInfo();
    // 发起卡片流转请求
    wx.showLoading({
      title: '',
    })
    var dataBody = {};
    dataBody.userId = userInfo.user.id;
    dataBody.cardId = card.id;
    dataBody.status = '1';
    dataBody.accessToken = userInfo.user.accesstoken;
    var encStr = basereq.encryptParam(dataBody);
    var that = this;

    wx.request({
      url: basereq.interfaceName + 'card/changeCard',
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
          // 流转成功
          card.receiveCode = res.data.data.code; // 卡片领取码
          var stringCard = JSON.stringify(card);
          var valueString = 'dataString=' + stringCard;
          wx.navigateTo({
            url: "../../cards/giftCard/giftCard?" + valueString,
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
    wx.reportAnalytics('gift_card', {
      user_id: userInfo.user.id.toString(),
      membership_level: userInfo.glory.level.toString(),
      card_group_type: card.carddefine.cardtype.number.toString(),
      card_group_id: '',
      card_group_name: '',
      card_id: card.id.toString(),
      card_name: card.name,
      card_price: card.cardStockInfo.saleamount.toString(),
    });
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

  // 点击赠送朋友
  didTapGive: function (event) {
    var that = this;
    wx.showModal({
      title: '要赠送这张卡吗？',
      content: '每份礼物只能送给一位朋友',
      confirmText: '是的',
      success: function (res) {
        if (res.confirm) {
          that.fetchGiftCard();
        }
      }
    })
  },
  //点击充值进账户余额
  didTapUse: function (event) {
    this.fetchUseCard();
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
})