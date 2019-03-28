// pages/event/event.js
var basereq = require('../../utils/base_req.js');
// 引入loginMgr
var loginMgr = require('../../utils/loginManager/loginMgr.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    actId: '',
    actType: '', // 活动类型 001普通活动 002问卷活动
    actName: '',
    isLogin: false,
    userInfo: {},
    isLoading: true, //列表是否正在加载
    isLoadingFail: false, //列表是否加载失败
    reLoadingTipMsg: '网络似乎不太好...',
    canShowAlert: false,
    focusInputPhone: false,
    isShowBtn: false,
    tipTitleStr: '',
    tipContentStr: '',
    btnStr: '',
    isUseTicket: false,
    phoneNumber: '',
    validCode: '',
    second: '发送验证码',
    isCounting: false,
    focusInputValidCode: false,
    cardId: '',
    cardName: '',
    imgUrl: '', // 海报url
    //问卷
    items: [], // 问题列表
    index: 0,
    showGetPrize: false,
    isSelect: false,
    toSite: 0, // 0 返回顶部
    answerList: [],
    actInfo: {},
    isSubmitAnswer: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (options.dataString) {
      var strJSON = options.dataString; //JSON字符串
      var dataObj = JSON.parse(strJSON); // 数据对象
      this.setData({
        actId: dataObj.event.activityId,
        actType: "001"
      }); //dataObj.event.type 目前默认只有普通活动
    }

    if (this.data.actType == '002') { // 问卷活动
      this.setData({
        showGetPrize: false
      });
    } else {
      this.setData({
        showGetPrize: true
      });
    }

    // 判断用户是否已登录
    this.detecIfUserLogin();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    this.fetchEventDetail();
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

  /********** 网络请求 **********/
  // 请求活动详情
  fetchEventDetail: function() {
    var dataBody = {};
    dataBody.activityId = this.data.actId;
    // dataBody.type = this.data.actType; 默认只有普通活动,暂时不传type
    if (this.data.isLogin) {
      dataBody.userId = this.data.userInfo.user.id;
    }
    var encStr = basereq.encryptParam(dataBody);
    var that = this;
    wx.request({
      url: basereq.interfaceName + 'activity/getActivityInfo',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        if (res.data.data) {
          var mainPic_url = res.data.data.activity.imgurl1;
          that.setData({
            imgUrl: basereq.domain + mainPic_url,
            actName: res.data.data.activity.name,
            actInfo: res.data.data.activity
          });
        }
        var code = res.statusCode;
        if (code == 404) { // 404 是不能调用toString()之类的方法
          that.setData({
            isLoadingFail: true,
          });
        } else {
          if (res.data.data && res.data.data.activity.questionList.length > 0) { // 获取问题列表
            that.setData({
              items: res.data.data.activity.questionList
            });
          }
          var code = res.data.code.toString();
          var suffix = code.substr(code.length - 3, 3);
          if (suffix == '600') {
            var actStatus = res.data.data.activity.status.toString();
            if (actStatus == '1') { // 进行中
              if (that.data.isLogin) { // 已登录
                if (that.data.actInfo.prizelist[0].type == 1) {
                  // 领取卡券
                  that.setData({
                    isLoading: false,
                    isShowBtn: true,
                    btnStr: '立即使用卡券',
                    isUseTicket: true,
                  });
                } else {
                  // 领取优惠券
                  that.setData({
                    isLoading: false,
                    isShowBtn: true,
                    btnStr: '立即使用优惠券',
                    isUseTicket: true,
                  });
                }
              } else { // 未登录
                if (that.data.actInfo.prizelist[0].type == 1) {
                  //领取卡券
                  that.setData({
                    isLoading: false,
                    isShowBtn: true,
                    btnStr: '领取卡券',
                    isUseTicket: false
                  });
                } else {
                  //领取优惠券
                  that.setData({
                    isLoading: false,
                    isShowBtn: true,
                    btnStr: '领取优惠券',
                    isUseTicket: false
                  });
                }
              }
            } else { // 结束
              that.setData({
                isLoading: false,
                isShowBtn: false,
                tipTitleStr: '活动已结束',
                tipContentStr: '关注麦隆咖啡，更多精彩敬请期待'
              });
            }
          } else if (suffix == '601') { // 领取过了
            if (that.data.actInfo.prizelist[0].type == 1) { //卡券
              that.setData({
                isLoading: false,
                isShowBtn: false,
                tipTitleStr: '\n',
                tipContentStr: '您已经领取过卡券了'
              });
            } else { //优惠券
              that.setData({
                isLoading: false,
                isShowBtn: false,
                tipTitleStr: '\n',
                tipContentStr: '您已经领取过优惠券了'
              });
            }
          } else if (suffix == '603') { // 活动已结束
            that.setData({
              isLoading: false,
              isShowBtn: false,
              tipTitleStr: '活动已结束',
              tipContentStr: '关注麦隆咖啡，更多精彩敬请期待'
            });
          } else if (suffix == '604') { // 活动已结束
            that.setData({
              isLoading: false,
              isShowBtn: false,
              tipTitleStr: '卡券已经抢光了',
              tipContentStr: '关注麦隆咖啡，更多精彩敬请期待'
            });
          } else if (suffix == '605') { // 已提交过答案
            that.setData({
              isLoading: false,
              isShowBtn: true,
              btnStr: '立即使用卡券',
              isUseTicket: true,
              showGetPrize: true,
              isSubmitAnswer: true
            });
          } else {
            // 其他错误
            wx.showToast({
              title: res.data.msg,
              image: '/Resource/images/cross.png',
              duration: 3000
            });
            that.setData({
              isLoadingFail: true,
              reLoadingTipMsg: res.data.msg,
            });
          }
        }
      },
      fail: function(res) {
        that.setData({
          isLoadingFail: true,
        });
      }
    })
  },

  // 加载失败时本地默认图片
  imgError: function(e) {
    if (this.data.actName == '爱奇艺活动') {
      this.setData({
        imgUrl: '../../Resource/images/Event/bg_aiqiyievent.jpeg',
      });
    } else {
      this.setData({
        imgUrl: '../../Resource/images/Event/bg_event.jpeg',
        // imgUrl: '../../Resource/images/Event/bg_aiqiyievent.jpeg',
      });
    }
  },

  //领取卡券
  fetchAcceptPrize: function() {
    var dataBody = {};
    dataBody.activityId = this.data.actId;
    dataBody.userId = this.data.userInfo.user.id;
    dataBody.accessToken = this.data.userInfo.user.accesstoken;
    var encStr = basereq.encryptParam(dataBody);
    var that = this;
    wx.request({
      url: basereq.interfaceName + 'activity/acceptPrize',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        wx.hideLoading();
        var code = res.statusCode;
        if (code == 404) { // 404 是不能调用toString()之类的方法
          that.setData({
            isLoadingFail: true,
          });
        } else {
          var code = res.data.code.toString();
          var suffix = code.substr(code.length - 2, 2);
          if (suffix == '00') {
            if (res.data.data.prize.type == 1) { //卡券
              var name = res.data.data.card.name;
              var id = res.data.data.card.id;
              that.setData({
                cardId: id,
                cardName: name
              });
            } else { //优惠券
              var name = res.data.data.coupon.name;
              var id = res.data.data.coupon.id;
              that.setData({
                couponId: id,
                couponName: name
              });
            }
            that.didTapUseCard(res.data.data.prize.type);
          } else if (suffix == '02') { // 票券已抢光
            that.setData({
              isLoading: false,
              isShowBtn: false,
              tipTitleStr: '卡券已经抢光了',
              tipContentStr: '关注麦隆咖啡，更多精彩敬请期待'
            });
          } else if (suffix == '03') { // 活动已结束
            that.setData({
              isLoading: false,
              isShowBtn: false,
              tipTitleStr: '活动已结束',
              tipContentStr: '关注麦隆咖啡，更多精彩敬请期待'
            });
          } else {
            // 其他错误
            wx.showToast({
              title: res.data.msg,
              image: '/Resource/images/cross.png',
              duration: 3000
            });
            that.setData({
              isLoadingFail: true,
            });
          }
        }
      },
      fail: function(res) {
        that.setData({
          isLoadingFail: true,
        });
        wx.hideLoading();
      }
    })
  },

  // 提交答案
  fetchToSaveAnswer: function() {
    var dataBody = {};
    dataBody.activityId = this.data.actId;
    dataBody.userId = this.data.userInfo.user.id;
    dataBody.accessToken = this.data.userInfo.user.accesstoken;
    dataBody.listAnswer = JSON.stringify(this.data.answerList);
    var encStr = basereq.encryptParam(dataBody);
    var that = this;
    wx.request({
      url: basereq.interfaceName + 'activity/saveAnswer',
      data: {
        data: encStr
      },
      method: "POST",
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {
        var code = res.statusCode;
        if (code == 404) { // 404 是不能调用toString()之类的方法
          that.setData({
            isLoadingFail: true,
          });
        } else {
          var code = res.data.code.toString();
          var suffix = code.substr(code.length - 2, 2);
          if (suffix == '00' || suffix == '01') {
            that.fetchAcceptPrize();
          } else {
            // 其他错误
            wx.showToast({
              title: res.data.msg,
              image: '/Resource/images/cross.png',
              duration: 3000
            });
            that.setData({
              isLoadingFail: true,
            });
          }
        }
      },
      fail: function(res) {
        that.setData({
          isLoadingFail: true,
        });
        wx.hideLoading();
      }
    })
  },

  // 显示弹窗
  showAlert: function() {
    if (this.data.isUseTicket) { // 领取卡券操作并跳转
      wx.showLoading({
        title: '正在领取...',
      })
      if (this.data.actType == '002' && this.data.isSubmitAnswer == false) { // 问卷活动(提交答案)
        //添加userId
        for (var i = 0; i < this.data.answerList.length; i++) {
          var answer = this.data.answerList[i];
          answer.userid = this.data.userInfo.user.id;
        }
        console.log(this.data.answerList);
        this.fetchToSaveAnswer();
      } else {
        this.fetchAcceptPrize();
      }
    } else { // 点击领取卡券登录(实际不领取)
      var currentShowStatus = true;
      this.animateAlert(currentShowStatus);
    }

  },

  // 关闭弹窗
  closeAlert: function() {
    var currentShowStatus = false;
    this.setData({
      phoneNumber: '',
      validCode: '',
    });
    this.animateAlert(currentShowStatus);
  },

  // 弹窗动画
  animateAlert: function(isShow) {
    var animation = wx.createAnimation({
      duration: 100, //动画时长 
      timingFunction: "linear", //线性 
      delay: 0 //0则不延迟
    });

    this.animation = animation;

    animation.opacity(0).step();
    this.setData({
      animationData: animation.export()
    });

    setTimeout(function() {
      // 执行第二组动画 
      animation.opacity(1).step();
      // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象 
      this.setData({
        animationData: animation
      })

      //关闭 
      if (isShow == false) {
        this.setData({
          canShowAlert: false
        });
      }
    }.bind(this), 200)

    // 显示 
    if (isShow == true) {
      this.setData({
        canShowAlert: true,
        focusInputPhone: true,
      });
    }
  },
  // carddefine.cardtype.number
  didTapUseCard: function(type) {
    if (type == 1) {
      var card = {
        id: this.data.cardId,
        name: this.data.cardName,
        carddefine: {
          cardtype: {
            number: ''
          }
        }
      };
      var prefixURL = '../wallet/use_ticket/use_ticket?';
      var cardJSON = JSON.stringify(card);
      var valueString = 'dataString=' + cardJSON;
      wx.redirectTo({
        url: prefixURL + valueString,
      });
    } else {
      var prefixURL = '../me/coffee_wallet/coffee_wallet';
      wx.redirectTo({
        url: prefixURL,
      });
    }
  },

  // 检查用户是否登录
  detecIfUserLogin: function() {
    // 判断用户是否已登录
    var userInfo = loginMgr.fetchUserInfo();
    if (userInfo.isLogin) {
      this.setData({
        isLogin: true,
        userInfo: userInfo
      });
    } else {
      this.setData({
        isLogin: false,
        userInfo: {}
      });
    }
  },

  // 点击获取验证码
  didTapGetVerify: function() {
    var that = this;
    var isCounting = that.data.isCounting;
    var phoneNumber = that.data.phoneNumber;
    var funcSucc = function loginSucc() {
      that.setData({
        second: 60,
        isCounting: true
      });
      that.countdown(that);
      that.setData({
        focusInputValidCode: true
      });
    };
    var funcFail = function loginFail() {};
    if (!isCounting) {
      loginMgr.didTapGetVerify(phoneNumber, funcSucc, funcFail);
    }
  },

  // 点击验证
  didTapValidate: function() {

    var validCode = this.data.validCode;
    var phoneNumber = this.data.phoneNumber;
    var that = this;
    // 登录成功回调
    var funcSucc = function loginSucc() {
      that.setData({
        isLogin: true
      });
      that.closeAlert();
      that.detecIfUserLogin();
      that.fetchEventDetail();
    };
    // 登录失败回调
    var funcFail = function loginFail(objData) {};
    loginMgr.didTapValidate(phoneNumber, validCode, funcSucc, funcFail);
  },

  // 输入完毕
  finishInputPhone: function(event) {
    var inputNumber = event.detail.value;
    this.setData({
      phoneNumber: inputNumber
    });
  },

  finishInputCode: function(event) {
    var inputNumber = event.detail.value;
    this.setData({
      validCode: inputNumber
    });
  },

  // 倒计时
  countdown: function(that) {
    var second = that.data.second
    if (second == 0) {
      that.setData({
        isCounting: false,
        second: "发送验证码",
      });
      return;
    }
    var time = setTimeout(function() {
      that.setData({
        second: second - 1,
        isCounting: true
      });
      that.countdown(that);
    }, 1000)
  },

  tapReloadCards: function() {
    this.setData({
      isLoading: true,
      isLoadingFail: false,
      isSelect: false
    });
    this.fetchEventDetail();
  },

  radioChange: function(e) {
    if (!this.data.isSelect && e.detail.value.length == 1 && this.data.index < this.data.items.length) {
      console.log('radio发生change事件，携带value值为：', e.detail.value);
      this.setData({
        isSelect: true
      })

      // 使用自定义选中样式
      var allFilte = this.data.items;
      var curArrFilte = allFilte[this.data.index];
      for (var i = 0; i < curArrFilte.optionList.length; i++) {
        // var teapItem = curArrFilte.optionList[i];
        if (i == e.detail.value[0]) {
          curArrFilte.optionList[i].checked = true;
        } else {
          curArrFilte.optionList[i].checked = false;
        }
      }

      // 记录回答
      var curOption = curArrFilte.optionList[parseInt(e.detail.value[0])];
      var answer = {};
      answer.activityid = this.data.actId;
      answer.questionid = curOption.questionid;
      answer.optionid = curOption.id;
      this.data.answerList.push(answer);
      console.log(this.data.answerList);

      this.setData({
        items: allFilte,
      })

      // 0.2秒延迟后再进入页面
      var that = this;
      var time = setTimeout(function() {
        var curIndex = that.data.index + 1;
        if (curIndex < that.data.items.length) {
          that.setData({
            index: curIndex,
            toSite: 0,
            isSelect: false
          });
        } else {
          that.setData({
            showGetPrize: true
          });
        }
      }, 200);
    }
  }
})