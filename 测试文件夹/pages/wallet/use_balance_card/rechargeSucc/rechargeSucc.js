// rechargeSucc.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mainTitle:'充值成功！',
    subTitle:'用账户余额购买你的咖啡吧',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var strJSON = options.dataString; //字符串
    var objData = JSON.parse(strJSON);// 转成对象
    var titleString = '充值成功';
    if (objData.type == 'binding_card' || objData.type === 'points_mall' || objData.type === 'exchange_coupon') {
      titleString = '兑换成功';
      this.setData({
        fromType: objData.type,
        mainTitle:'兑换成功！',
        subTitle: objData.msg,
      });
    }
    wx.setNavigationBarTitle({
      title: titleString,
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

  tapComplete: function () {
    var pagesList = getCurrentPages();
    // 返回页面的层数
    var delta = pagesList.length - 1;
    if (this.data.fromType === 'points_mall' || this.data.fromType === 'exchange_coupon') {
      // 返回到积分商城页和咖啡红包页的页面值
      delta = pagesList.length - 2;

      //返回咖啡红包页特殊操作，刷新咖啡红包列表
      var pages = getCurrentPages();
      var prePage = pages[pages.length - 3];
      var isFunction = false;
      try {
        //这里的代码需要用try一下,因为当changeData不存在时会抛出异常
        isFunction = typeof (prePage.fetchCouponGroup) == "function";
      } catch (e) { }
      if (isFunction) {
        prePage.fetchCouponGroup();
      }
    } 
    wx.navigateBack({
      delta: delta,
    });
  }
})