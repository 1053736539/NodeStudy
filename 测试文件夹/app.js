//app.js

// 引入loginMgr
var loginMgr = require('./utils/loginManager/loginMgr.js');
App({
  onLaunch: function (options) {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs);
    this.globalData.launchScene = options.scene;
    // loginMgr.fetchWxUserInfo();
    var that = this;
    // 获取设备信息
    wx.getSystemInfo({
      success: function (res) {
        that.globalData.systemInfo = res;
        that.globalData.screenWidth = res.screenWidth   //屏幕宽度，单位px
      }
    })
    
  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function (res) 
        {
          // wx.getUserInfo({
          //   success: function (res) {
          //     that.globalData.userInfo = res.userInfo
          //     typeof cb == "function" && cb(that.globalData.userInfo)
          //   }
          // })
        }
      })
    }
  },
  globalData:{
    userInfo:null,
    shopID:null,
    scanDate:null,
    purchaseDate:null,
    canFetchVerifyCode: true,
    screenWidth:null,
    systemInfo:null
  }
});