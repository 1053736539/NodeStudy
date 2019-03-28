// 请求实例
var basereq = require('../base_req.js');
var canFetchVerifyCode = true;
var canFetchLogin = true;

//对输入的电话号码进行数字提取，超出11位的取前11位
function serializePhoneNumber(phoneNumber) {
  phoneNumber = phoneNumber.toString();
  var phone = '';
  for (var i = 0; i < phoneNumber.length; i++){
    var contrastData = phoneNumber.substr(i, 1);
    var reg = /^[0-9]*$/;
    var justice = reg.test(contrastData);
    if (justice) {
      phone = phone + contrastData;
    }
  }
  if (phone.length > 11){
    phone =  phone.substr(0, 11);
  };
  return phone;
}

// 点击获取验证码
function didTapGetVerify(phoneNumber, succCallback, failCallback) {
  // 没有在计时中
  phoneNumber = this.serializePhoneNumber(phoneNumber);
  if (phoneNumber.length == 0) {
    wx.showToast({
      title: '请输入手机号',
      image: '/Resource/images/cross.png',
    })
  } else if (phoneNumber.length < 11) {
    wx.showToast({
      title: '手机号错误',
      image: '/Resource/images/cross.png',
    })
  } else {
    // 禁止多次重复获取验证码
    if (!canFetchVerifyCode) {
      return;
    }
    canFetchVerifyCode = false;

    // loading
    wx.showLoading({
      title: '',
    })

    // 1.组装请求参数
    var dataBody = {};
    dataBody.tel = phoneNumber;

    // 2.加密参数(需要引入base_req.js)
    var encStr = basereq.encryptParam(dataBody);

    // 3.获取验证码请求
    var that = this;

    wx.request({
      url: basereq.interfaceName + 'common/sms/getVerifyCode',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.code) {
          var code = res.data.code.toString();
          var suffixCode = code.substr(code.length - 2, 2);
          if (suffixCode == '00') {
            wx.showToast({
              title: "验证码已发送",
              image: '',
              duration: 3000
            });
            if (typeof succCallback == "function") {
              succCallback();
            }
          } else {
            wx.hideLoading();
            wx.showToast({
              title: res.data.msg,
              image: '/Resource/images/cross.png',
            });
          }
        } else {
          wx.showToast({
            title: res.errMsg,
            image: '/Resource/images/cross.png',
            duration: 3000
          });
          if (typeof failCallback == "function") {
            failCallback();
          }
        }
      },
      fail: function (res) {
        wx.hideLoading();
        wx.showToast({
          title: res.errMsg,
          image: '/Resource/images/cross.png',
          duration: 3000
        });
      },
      complete: function () {
        canFetchVerifyCode = true;
      }
    })
  }
}

// 点击验证
function didTapValidate(phoneNumber, validCode, funcSucc, funcFail) {
  phoneNumber = this.serializePhoneNumber(phoneNumber);
  if (phoneNumber.length == 0) {
    wx.showToast({
      title: '请输入手机号',
      image: '/Resource/images/cross.png',
    })
  } else if (phoneNumber.length < 11) {
    wx.showToast({
      title: '手机号错误',
      image: '/Resource/images/cross.png',
    })
  } else if (validCode.length < 1) {
    wx.showToast({
      title: '请输入验证码',
      image: '/Resource/images/cross.png',
    })
  } else {
    // loading
    wx.showLoading({
      title: '',
    })
    // 调用登录接口
    this.loginWithPhoneCode(phoneNumber, validCode, funcSucc, funcFail);
  }
}

function loginWithPhoneCodeWithSenderID(phone, code, succCallback, failCallback, senderID) {
  if (phone.length == 0) {
    wx.showToast({
      title: '请输入手机号',
      image: '/Resource/images/cross.png',
      duration: 3000
    })
  } else if (phone.length < 11) {
    wx.showToast({
      title: '手机号错误',
      image: '/Resource/images/cross.png',
    })
  } else {
    // 禁止多次重复请求登录
    if (!canFetchLogin) {
      return;
    }
    canFetchLogin = false;

    // 调用登录接口
    var dataBody = {};
    dataBody.tel = phone;
    dataBody.smsCode = code
    // 门店扫码进入时传递门店ID
    var scanInfo = wx.getStorageSync('scanInfo');
    if (scanInfo) {
      dataBody.shop_id = scanInfo.shopID;
    }
    // 有员工标记（员工推荐顾客注册）传推荐人ID
    if (senderID) {
      dataBody.send_user_id = senderID;
    }

    // 设备信息
    var app = getApp();
    var systemInfo = app.globalData.systemInfo;
    var dicSystemInfo = {};
    dicSystemInfo.deviceBrand = systemInfo.brand;
    dicSystemInfo.deviceModel = systemInfo.model;
    var jsonString = JSON.stringify(dicSystemInfo);
    dataBody.weChatInfo = jsonString;

    // 加密参数
    var encStr = basereq.encryptParam(dataBody);

    wx.request({
      url: basereq.interfaceName + 'user/loginByTelCode',
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        data: encStr
      },
      success: function (res) {
        wx.hideLoading();
        // Response对象
        var objData = res.data;
        var suffix = objData.code.substring(objData.code.length - 2, objData.code.length);
        // code后缀是00，请求数据成功
        if (suffix == "00" || suffix == "99") {
          var user = objData.data.user;
          user.isLogin = true;
          // wx.setStorage({
          //   key: "userInfo",
          //   data: user
          // })
          wx.setStorageSync('userInfo', user);

          // 门店扫码进入时登录成功后销毁门店ID参数
          // var appInstance = getApp();
          // if (appInstance.globalData.shopId) {
          //   appInstance.globalData.shopId = '';
          // }
          if (typeof succCallback == "function") {
            succCallback();
          }
        } else {
          if (typeof failCallback == "function") {
            wx.showToast({
              title: objData.msg,
              image: '/Resource/images/cross.png',
              duration: 3000
            });
            failCallback(objData);
          }
        }
      },
      fail: function (res) {
        wx.showToast({
          title: res.errMsg,
          image: '/Resource/images/cross.png',
          duration: 3000
        });
        wx.hideLoading();
        if (typeof failCallback == "function") {
          failCallback(res);
        }
      },
      complete: function () {
        canFetchLogin = true;
      }
    })
  }
}

// 使用手机号和验证码登录
function loginWithPhoneCode(phone, code, succCallback, failCallback) {
  this.loginWithPhoneCodeWithSenderID(phone, code, succCallback, failCallback, '');
}

// 获取用户信息
function fetchUserInfo() {
  var userInfoDic = wx.getStorageSync('userInfo');
  return userInfoDic;
}

// 从服务器更新用户信息
function updateUserInfo(succCallback, failCallback) {
  var dataBody = {};
  var userInfoDic = wx.getStorageSync('userInfo');
  if (userInfoDic.isLogin) {
    dataBody.userId = userInfoDic.user.id.toString();
    dataBody.accessToken = userInfoDic.user.accesstoken;
    var encStr = basereq.encryptParam(dataBody);

    wx.request({
      url: basereq.interfaceName + 'user/getInfoById',
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      data: {
        data: encStr
      },
      success: function (res) {
        // Response对象
        var objData = res.data;
        var suffix = objData.code.substring(objData.code.length - 2, objData.code.length);
        // code后缀是00，请求数据成功
        if (suffix == "00" || suffix == "99") {
          var user = objData.data.user;
          user.isLogin = true;

          wx.setStorageSync('userInfo', user);

          if (typeof succCallback == "function") {
            succCallback();
          }
        } else {
          if (typeof failCallback == "function") {
            var msg = objData.msg;
            objData.errMsg = msg;
            failCallback(objData);
          }
        }
      },
      fail: function (res) {
        if (typeof failCallback == "function") {
          failCallback(res);
        }
      }
    })
  }
}

// 退出登录
function logout() {
  try {
    wx.removeStorageSync('userInfo');
    wx.removeStorageSync('wxUserInfo');
    wx.removeStorageSync('scanInfo');
  } catch (e) {
    // Do something when catch error
  }
}

// 请求微信用户信息
function fetchWxUserInfo() {
  wx.getSetting({
    success(res) {
      if (!res.authSetting['scope.userInfo']) {
        wx.authorize({
          scope: 'scope.userInfo',
          success() {
            // 用户已经同意用户信息授权
            wx.getUserInfo({
              withCredentials: false,
              success: function (res) {
                wx.setStorageSync('wxUserInfo', res.userInfo);
              },
            })
          }
        })
      } else {
        // 用户已经同意用户信息授权
        wx.getUserInfo({
          withCredentials: false,
          success: function (res) {
            wx.setStorageSync('wxUserInfo', res.userInfo);
          },
        })
      }
    }
  });
}

// 获取微信用户信息
function getWxUserInfo() {
  var wxUserInfo = wx.getStorageSync('wxUserInfo');
  return wxUserInfo;
}


module.exports = {
  serializePhoneNumber: serializePhoneNumber,
  didTapGetVerify: didTapGetVerify,
  didTapValidate: didTapValidate,
  loginWithPhoneCodeWithSenderID: loginWithPhoneCodeWithSenderID,
  loginWithPhoneCode: loginWithPhoneCode,
  fetchUserInfo: fetchUserInfo,
  updateUserInfo: updateUserInfo,
  logout: logout,
  fetchWxUserInfo: fetchWxUserInfo,
  getWxUserInfo: getWxUserInfo,
}