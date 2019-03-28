// pages/wallet/use_appointment_form/use_appointment_form.js
// barcode
var wxbarcode = require('../../../utils/index.js');
// 引入base_req
var basereq = require('../../../utils/base_req.js');
// Login Manager
var loginMgr = require('../../../utils/loginManager/loginMgr.js');



Page({

  /**
   * 页面的初始数据
   */
  data: {
    region: '',
    regionData: [],
    regionList: [],
    regionListIndex: [0, 0, 0],
    date: '',
    nowDate: null

  },
  /****************************************网络请求****************************************/

  // 获取门店地址列表
  ObtainstoreList() {
    var _this = this;
    var dataBody = {};
    var encStr = basereq.encryptParam(dataBody);
    wx.request({
      url: basereq.interfaceName + 'store/getStoreList',
      method: "POST",
      data: {
        data: encStr
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: function(res) {

        var code = res.data.code.toString();
        if (code == "210200") {
          var ragionList = res.data.data;
          var arr = [];
          console.error(1, ragionList)
          // 获取第一个门店地区
          var FirstArea = [];
          var SecondArea = [];
          var EndArea = [];
          for (var i in ragionList) {
            FirstArea.push(ragionList[i].area)
          }
          for (var i in ragionList[0].cityAndStoreList) {
            SecondArea.push(ragionList[0].cityAndStoreList[i].city)
          }
          for (var j in ragionList[0].cityAndStoreList[0].storeList) {
            EndArea.push(ragionList[0].cityAndStoreList[0].storeList[j].name)
          }
          console.log(FirstArea)
          console.log(SecondArea)
          console.log(EndArea)
          arr.push(FirstArea, SecondArea, EndArea);
          _this.setData({
            regionData: ragionList,
            regionList: arr
          })
          console.log(arr)



        } else {
          wx.showToast({
            title: res.data.msg,
            image: '/Resource/images/cross.png',
            duration: 3000
          });
        }
      }
    })



  },



  // 选择时间
  didDateChange: function(e) {

    this.setData({
      date: e.detail.value
    })
  },

  // 地址选择器
  bindRegionChange(e) {
    console.error(e)
    this.setData({
      region: e.detail.value,
    });


  },

  bindcolumnchange(e) {
    console.log(e)
    var index = e.detail.value;
    var column = e.detail.column;
    var arr = this.data.regionListIndex;
    var region = this.data.regionList;
    var SecondArea = [];
    var EndArea = [];
    arr[column] = index;
    this.setData({
      regionListIndex: arr
    })

    if (e.detail.column === 0) {

      for (var i in this.data.regionData[index].cityAndStoreList) {
        SecondArea.push(this.data.regionData[index].cityAndStoreList[i].city);
    
      }
      for (var j in this.data.regionData[index].cityAndStoreList[0].storeList) {
        EndArea.push(this.data.regionData[index].cityAndStoreList[0].storeList[j].name)
      }

      region[1] = SecondArea;
      region[2] = EndArea;
      console.log(index, SecondArea, this.data.regionList,this.data.regionListIndex)
      this.setData({
        regionList: region
      })

    }

    if (e.detail.column === 1) {
      for (var j in this.data.regionData[this.data.regionListIndex[1]].cityAndStoreList[index].storeList) {
        EndArea.push(this.data.regionData[this.data.regionListIndex[1]].cityAndStoreList[index].storeList[j].name)
      }
     
      region[2] = EndArea;
      this.setData({
        regionList: region
      })
    }
  },




  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.ObtainstoreList();
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})