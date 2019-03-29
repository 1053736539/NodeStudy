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
    nowDate: null,
    arrPickerRange: [],
    arrPickerIndex: [0, 0, 0],
    arrArea: [],
    arrCity: [],
    arrShop: [],
    indexOfArea: 0,
    indexOfCity: 0,
    indexOfShop: 0,
    selectedArea: null,
    selectedCity: null,
    selectedShop: null
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
            regionList: arr,
          })
          console.log(arr);
          _this.updatePickerRange();

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

  // range update
  updatePickerRange: function() {
    // area
    // lazy load
    var arrArea = [];
    if (this.data.arrArea.length <= 0) {
      var arrAreaData = this.data.regionData;
      for (var indexArea in arrAreaData) {
        var item = arrAreaData[indexArea].area;
        arrArea.push(item);
      };
    } else {
      arrArea = this.data.arrArea;
    }
    // city
    var arrCityData = this.data.regionData[this.data.indexOfArea].cityAndStoreList;
    var arrCity = [];
    for (var indexCity in arrCityData) {
      var item = arrCityData[indexCity].city;
      arrCity.push(item);
    };
    // shop
    var arrShopData = arrCityData[this.data.indexOfCity].storeList;
    var arrShop = [];
    for (var indexShop in arrShopData) {
      var item = arrShopData[indexShop].name;
      arrShop.push(item);
    };
    // combine
    var arrPickerRange = [arrArea, arrCity, arrShop];

    this.setData({
      arrArea: arrArea,
      arrCity: arrCity,
      arrShop: arrShop,
      arrPickerRange: arrPickerRange,
    });

    this.updateSelectedAreaCityShop();
  },

  updateSelectedAreaCityShop: function() {
    // update selected area
    var indexOfArea = this.data.indexOfArea;
    var area = this.data.regionData[indexOfArea];
    var selectedAreaID = area.id;

    // update selected city
    // update selected shop

    // data set
    this.setData({
      selectedArea: area
    })
  },

  // picker index changed
  didPickerChange: function(e) {
    var column = e.detail.column;
    var index = e.detail.value;
    var arrIndex = this.data.arrPickerIndex;
    arrIndex[column] = index;
    var indexOfArea = arrIndex[0];
    var indexOfCity = column === 0 ? 0 : arrIndex[1];
    var indexOfShop = column <= 1 ? 0 : arrIndex[2];
    arrIndex = [indexOfArea, indexOfCity, indexOfShop];
    this.setData({
      arrPickerIndex: arrIndex,
      indexOfArea: arrIndex[0],
      indexOfCity: indexOfCity,
      indexOfShop: indexOfShop,
    });
    this.updatePickerRange();
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