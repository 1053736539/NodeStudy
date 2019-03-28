// pages/cards/giftCard/giftCard.js
var loginMgr = require('../../../utils/loginManager/loginMgr.js');
var basereq = require('../../../utils/base_req.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    card: {},
    domain: '',
    leaveMsg: '',
    hasGift: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '赠送礼物',
    });
    var strJSON = options.dataString;
    var objCard = JSON.parse(strJSON);
    this.setData({
      card: objCard,
      leaveMsg: '送你的心意全在这张卡里',
      domain: basereq.domain
    })
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
  * 用户点击右上角分享
  */
  onShareAppMessage: function () {
    // 组装礼品信息
    var dataBody = {};
    var dataDic = {};
    var cardInfo = {};
    var senderInfo = {};
    var userInfo = loginMgr.fetchUserInfo();
    // 卡片信息
    cardInfo.name = this.data.card.name;                      // 卡片名称
    cardInfo.cardId = this.data.card.id;                      // 卡片ID
    cardInfo.detail = this.data.card.cardStockInfo.introduce;// 卡片简介
    cardInfo.imgUrl = this.data.card.cardStockInfo.imgurl1;      // 卡面图片URL
    cardInfo.cardtype = this.data.card.carddefine.cardtype;   // 卡片类型
    cardInfo.saleamount = this.data.card.cardStockInfo.saleamount// 卡片价格
    cardInfo.receiveCode = this.data.card.receiveCode;        // 卡片的领取码
    cardInfo.count = '1';
    // 赠送者信息
    senderInfo.userId = userInfo.user.id;
    senderInfo.nickname = userInfo.user.nickname;
    senderInfo.tel = userInfo.user.tel;
    senderInfo.leaveMsg = this.data.leaveMsg;
    senderInfo.staff_identity = this.data.card.staff_identity; // 麦隆员工标记
    dataDic.cardInfo = cardInfo;
    dataDic.senderInfo = senderInfo;
    dataBody.shareType = 'card_gift';
    dataBody.targetURL = '/pages/cards/receive/receive'
    dataBody.dataDic = dataDic;
    var dataString = JSON.stringify(dataBody);

    // 赠送状态
    this.setData({ hasGift: true });
    return {
      title: '送你一份心意，点击领取',
      path: '/pages/cards/cards?' + 'dataString=' + dataString,
      imageUrl: '/Resource/images/Card/bg_gift_share.png'
    }
  },

  // 点击赠送礼物
  tapGift: function() {
    // 返回使用页
    wx.navigateBack({
      delta: 2
    });
  },

  // 输入框输入
  finishInputMsg: function (e) {
    var msg = e.detail.value;
    this.setData({
      leaveMsg: msg
    })
  }
})