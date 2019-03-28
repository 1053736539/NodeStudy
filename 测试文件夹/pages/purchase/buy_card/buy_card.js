// mall.js
var basereq = require('../../../utils/base_req.js');
// 引入loginMgr
var loginMgr = require('../../../utils/loginManager/loginMgr.js');
//引入金额规范 amount_standard
var amountStd = require('../../../utils/amount_standard.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    domain: '',
    isLogin: false,
    canShowAlert: false,
    userInfo: {},
    phoneNumber: '',
    validCode: '',
    second: '发送验证码',
    selectedIndex: -1, // 已选择的索引
    selectedCard: null, // 已选择的卡片
    selectedPrice: null, // 已选择卡片的价格
    isLoading: true, // 卡片是否真在加载
    isLoadingFail: false, // 卡片是否加载失败
    reLoadingTipMsg: '网络似乎不太好...',
    cardGroupID: undefined,
    cardGroupList: [],
    cardGroupInfo: {},
    focusInputPhone: false,
    focusInputValidCode: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var strJSON = options.dataString; //字符串
    var objCard = JSON.parse(strJSON); // 转成对象
    this.setData({
      cardGroupInfo: objCard.cardInfo,
      cardGroupID: objCard.cardInfo.id,
      domain: basereq.domain
    });
    // 更新已选择的卡片信息
    wx.setNavigationBarTitle({
      title: objCard.cardInfo.name,
    });
    this.fetchCardGroup();
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  tapReloadCards: function() {
    this.setData({
      isLoading: true,
      isLoadingFail: false,
    });
    this.fetchCardGroup();
  },

  /********** 网络请求 **********/
  // 请求卡片组列表
  fetchCardGroup: function() {
    var dataBody = {};
    dataBody.cardGroupId = this.data.cardGroupID;
    dataBody.startPage = '1';
    dataBody.pageSize = '999';
    var encStr = basereq.encryptParam(dataBody);
    var that = this;
    wx.request({
      url: basereq.interfaceName + 'card/getCardDefineListbyGroupId',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        var CardGroup = res.data.data;
        var cardGroupList = CardGroup.cardDefineList;
        //金额规范化显示
        for (var i = 0; i < cardGroupList.length;i++){
          var price = cardGroupList[i].cardticketdefines[0].saleamount;
          var showPrice = amountStd.amountStandard(price);
          cardGroupList[i].showPrice = showPrice;
        }
        // 数据赋值
        that.setData({
          cardGroupList: cardGroupList,
          isLoading: false,
        });
      },
      fail: function(res) {
        that.setData({
          isLoadingFail: true,
        });
      }
    })
  },

  //点击某个礼品卡
  tapCard: function(event) {
    // 更新已选择的卡片信息
    var selectedIndex = event.currentTarget.dataset.index
    var selectedCard = this.data.cardGroupList[selectedIndex];
    var cardInfo = {}; // 用于传递给收银台的数据
    cardInfo.selectedCard = selectedCard; // 是否已下单
    var valueString = 'dataString=' + JSON.stringify(cardInfo);
    //跳转收银台页
    wx.navigateTo({
      url: './card_spec_choice/card_spec_choice?' + valueString,
    })
  },

  
})