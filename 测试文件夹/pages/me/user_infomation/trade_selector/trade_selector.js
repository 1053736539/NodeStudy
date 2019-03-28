// pages/me/user_infomation/trade_selector/trade_selector.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    selectedTrade: null,
    trades: ["互联网 - 软件","通信 - 硬件","房地产 - 建筑","文化传媒","金融类","消费品","教育","贸易","生物 - 医疗","能源 - 化工","政府机构","服务业","其他行业"],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '行业',
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

  tapTradeItem: function (e) {
    var selectedTrade = e.currentTarget.dataset.item;
    var pages = getCurrentPages();
    if (pages.length > 1) {
      //上一个页面实例对象
      var prePage = pages[pages.length - 2];
      var isFunction = false;
      try {
        //这里的代码需要用try一下,因为当changeData不存在时会抛出异常
        isFunction = typeof (prePage.didTradeChange) == "function";
      } catch (e) { }
      if (isFunction) {
        prePage.didTradeChange(selectedTrade);
      } else {
        wx.showToast({
          title: '行业选取失败',
        })
      }
    };

    // 返回上个页面
    wx.navigateBack({
      delta: 1,
    });
  }
})