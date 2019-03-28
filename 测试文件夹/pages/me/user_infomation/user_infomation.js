// pages/me/user_infomation/user_infomation.js

// 引入base_req
var basereq = require('../../../utils/base_req.js');
// 引入loginMgr
var loginMgr = require('../../../utils/loginManager/loginMgr.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false,
    hasReward: false,
    userInfo: {},
    gender:'请选择',
    date: '请选择',
    trade: '请选择',
    genders: ['女','男'],
    nowDate: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.setNavigationBarTitle({
      title: '我的资料',
    });
    // 判断用户是否已登录
    this.detecIfUserLogin();
    // 获取当前时间
    var now = Date.parse(new Date());
    var nowDateString = this.dateStringWithTimeStamp(now);
    this.setData({nowDate: nowDateString});
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

  dateStringWithTimeStamp: function (timeStamp) {
    var date = new Date(timeStamp);
    var YEAR = date.getFullYear() + '-';
    var MONTH = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
    var DAY = date.getDate();
    var dateString = YEAR + MONTH + DAY;
    return dateString;
  },

  // 检查用户是否登录
  detecIfUserLogin: function () {
    var userInfo = loginMgr.fetchUserInfo();
    if (userInfo.isLogin) {
      // 前端先判断是否发放了生日券
      var hasReward;
      if (userInfo.user.industry.length > 0 && userInfo.user.birthdate){
        // 已经填写过个人信息的用户
        hasReward = true;
        // 性别
        var gender;
        if (userInfo.user.gender === 1) {
          gender = '男';
        } else if (userInfo.user.gender === 2) {
          gender = '女';
        } else {
          gender = '请选择';
        }
        // 生日
        var dateString = this.dateStringWithTimeStamp(userInfo.user.birthdate * 1000);
        
        this.setData({
          gender: gender,
          trade: userInfo.user.industry,
          date: dateString
        });
      } else {
        hasReward = false;
      }
      this.setData({
        isLogin: true,
        userInfo: userInfo,
        hasReward: hasReward
      });
    } else {
      this.setData({
        isLogin: false,
        userInfo: {},
      });
    }
  },

  tapTrade: function () {
    wx.navigateTo({
      url: './trade_selector/trade_selector',
    })
  },

  // 选择生日
  didDateChange: function(e) {
    this.setData({
      date: e.detail.value
    })
  },

  // 选择性别
  didGenderChange: function(e) {
    var indexOfGender = e.detail.value;
    var gender = this.data.genders[indexOfGender];
    this.setData({
      gender: gender
    })
  },

  // 选择行业
  didTradeChange: function(trade) {
    this.setData({
      trade: trade
    })
  },

  didGotUserInfo: function (e) {
    var wxUserInfo = e.detail.userInfo;
    if (wxUserInfo != null){
      var gender;
      if (wxUserInfo.gender === 1) {
        gender = '男';
      } else if (wxUserInfo.gender === 2) {
        gender = '女';
      } else {
        gender = '未知';
      }
      this.setData({
        wxUserInfo: wxUserInfo,
        gender: gender
      })
    }
  },

  // 点击保存
  tapSubmit: function () {
    var warningString = '';
    if (this.data.trade === '请选择') {
      warningString = '请填写行业';
    } 
    if (this.data.date === '请选择') {
      warningString = '请填写生日';
    }
    if (this.data.gender === '请选择') {
      warningString = '请填写性别';
    }

    if (warningString.length > 0) {
      wx.showToast({
        title: warningString,
        image: '/Resource/images/cross.png',
      })
    } else {
      // 填写完毕
      this.fetchModifyUserInfo();
    }
  },

  // 请求修改用户信息
  fetchModifyUserInfo: function () {
    // loading
    wx.showLoading({
      title: '',
    })

    var userInfo = this.data.userInfo;
    var dataBody = {};
    dataBody.userId = userInfo.user.id;
    dataBody.accessToken = userInfo.user.accesstoken;

    // 处理已填写的用户信息
    var totalUserInfo = {};
    totalUserInfo.id = userInfo.user.id;
    // 性别
    var genderNum;
    if (this.data.gender === '男') {
      genderNum = 1;
    } else if (this.data.gender === '女') {
      genderNum = 2;
    } else {
      genderNum = 0;
    }
    totalUserInfo.gender = genderNum;
    // 生日
    var birthDate = this.data.date;
    birthDate = birthDate.replace(/-/g, '/');
    var timestamp = Date.parse(new Date(birthDate));
    // 毫秒转秒
    timestamp = timestamp / 1000;
    totalUserInfo.birthdate = timestamp;
    // 行业
    totalUserInfo.industry = this.data.trade;
    // 微信获取的信息
    if (this.data.wxUserInfo != null) {
      totalUserInfo.nickname = this.data.wxUserInfo.nickName;
      totalUserInfo.country = this.data.wxUserInfo.country;
      totalUserInfo.province = this.data.wxUserInfo.province;
      totalUserInfo.city = this.data.wxUserInfo.city;
      totalUserInfo.avatarurl = this.data.wxUserInfo.avatarUrl;
      totalUserInfo.language = this.data.wxUserInfo.language;
    }
    // 完整用户信息转为json字符串
    var jsonString = JSON.stringify(totalUserInfo);
    dataBody.userInfo = jsonString;

    // 加密请求体
    var encStr = basereq.encryptParam(dataBody);
    var that = this;

    wx.request({
      url: basereq.interfaceName + 'user/modifyUserInfo',
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
          // 请求成功
          wx.showToast({
            title: '保存成功！',
            icon: 'success',
            duration: 3000,
            complete: function() {
              // 1.5秒延迟后再进入页面
              var time = setTimeout(function () {
                wx.navigateBack({
                  delta: 1
                })
              }, 1500);
            }
          });
        } else if (suffix === '01'){
          // 生日券已发放
          wx.showModal({
            content: '您本自然年的生日券已发放，明年的生日专享券将按照新修改的生日时间发放',
            confirmText: '知道了',
            showCancel: false,
            success: function (res) {
              wx.navigateBack({
                delta: 1
              });
            }
          });
        }else {
          // 请求错误
          wx.showToast({
            title: res.data.msg,
            image: '/Resource/images/cross.png',
            duration: 3000
          });
        }
      },
      fail: function (res) {
        // 请求错误
        wx.hideLoading();
        wx.showToast({
          title: '保存失败',
          image: '/Resource/images/cross.png',
          duration: 3000
        });
      }
    })
  }
})