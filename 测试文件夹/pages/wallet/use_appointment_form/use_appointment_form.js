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
    regionData: [{
      area: "华南区",
      areaid: "ac7f6d5445784075986108679ac8814e",
      city: "",
      cityAndStoreList: [{
        area: "",
        areaid: "",
        city: "深圳",
        cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
        id: "",
        status: 1,
        storeList: [{
          cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
          id: 1,
          name: "11111111",
          remark: "",
          status: 1,
          storeid: "1b9ecf433ef74a759679b07a867db931"
        }, {
          cityid: "b9339a71ffac40b7bf37eebdfc6fc782",
          id: 2,
          name: "copy之神腾讯",
          remark: "",
          status: 1,
          storeid: "2c9d0b86339841d484ebecaed792fd96"
        }, {
          cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
          id: 3,
          name: "深圳高研究院店",
          remark: "",
          status: 1,
          storeid: "1b9ecf433ef74a759679b07a867db931"
        }, {
          cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
          id: 1,
          name: "深圳高等金融研究院店",
          remark: "",
          status: 1,
          storeid: "1b9ecf433ef74a759679b07a867db931"
        }]
      }],
      cityid: "",
      id: "",
      status: 1,

    }, {
      area: "华南区",
      areaid: "ac7f6d5445784075986108679ac8814e",
      city: "",
      cityAndStoreList: [{
        area: "",
        areaid: "",
        city: "广东",
        cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
        id: "",
        status: 1,
        storeList: [{
          cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
          id: 1,
          name: "大萨达撒多",
          remark: "",
          status: 1,
          storeid: "1b9ecf433ef74a759679b07a867db931",
        }, {
          cityid: "b9339a71ffac40b7bf37eebdfc6fc782",
          id: 2,
          name: "大萨达撒多撒多撒",
          remark: "",
          status: 1,
          storeid: "2c9d0b86339841d484ebecaed792fd96"
        }, {
          cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
          id: 3,
          name: "深圳高研究院店大萨达",
          remark: "",
          status: 1,
          storeid: "1b9ecf433ef74a759679b07a867db931",
        }, {
          cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
          id: 1,
          name: "深圳高等金融研究院店大萨达",
          remark: "",
          status: 1,
          storeid: "1b9ecf433ef74a759679b07a867db931"
        }]
      }],
      cityid: "",
      id: "",
      status: 1

    }, {
      area: "西南区",
      areaid: "ac7f6d5445784075986108679ac8814e",
      city: "",
      cityAndStoreList: [{
        area: "",
        areaid: "",
        city: "昆明",
        cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
        id: "",
        status: 1,
        storeList: [{
          cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
          id: 1,
          name: "昆明高等金融研究院店",
          remark: "",
          status: 1,
          storeid: "1b9ecf433ef74a759679b07a867db931"
        }, {
          cityid: "b9339a71ffac40b7bf37eebdfc6fc782",
          id: 2,
          name: "copy之神腾讯昆明",
          remark: "",
          status: 1,
          storeid: "2c9d0b86339841d484ebecaed792fd96"
        }, {
          cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
          id: 3,
          name: "深圳高研究院店昆明昆明",
          remark: "",
          status: 1,
          storeid: "1b9ecf433ef74a759679b07a867db931",
        }, {
          cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
          id: 1,
          name: "昆明昆明昆明",
          remark: "",
          status: 1,
          storeid: "1b9ecf433ef74a759679b07a867db931"
        }]
      }],
      cityid: "",
      id: "",
      status: 1,
    }, {
      area: "华南区",
      areaid: "ac7f6d5445784075986108679ac8814e",
      city: "",
      cityAndStoreList: [{
        area: "",
        areaid: "",
        city: "深圳",
        cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
        id: "",
        status: 1,
        storeList: [{
          cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
          id: 1,
          name: "深圳高等金融研究院店",
          remark: "",
          status: 1,
          storeid: "1b9ecf433ef74a759679b07a867db931"
        }, {
          cityid: "b9339a71ffac40b7bf37eebdfc6fc782",
          id: 2,
          name: "copy之神腾讯",
          remark: "",
          status: 1,
          storeid: "2c9d0b86339841d484ebecaed792fd96"
        }, {
          cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
          id: 3,
          name: "深圳高研究院店",
          remark: "",
          status: 1,
          storeid: "1b9ecf433ef74a759679b07a867db931"
        }, {
          cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
          id: 1,
          name: "深圳高等金融研究院店",
          remark: "",
          status: 1,
          storeid: "1b9ecf433ef74a759679b07a867db931"
        }]
      }],
      cityid: "",
      id: "",
      status: 1,
    }, {
      area: "华南区",
      areaid: "ac7f6d5445784075986108679ac8814e",
      city: "",
      cityAndStoreList: [{
        area: "",
        areaid: "",
        city: "深圳",
        cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
        id: "",
        status: 1,
        storeList: [{
          cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
          id: 1,
          name: "深圳高等金融研究院店",
          remark: "",
          status: 1,
          storeid: "1b9ecf433ef74a759679b07a867db931",
        }, {
          cityid: "b9339a71ffac40b7bf37eebdfc6fc782",
          id: 2,
          name: "copy之神腾讯",
          remark: "",
          status: 1,
          storeid: "2c9d0b86339841d484ebecaed792fd96",
        }, {
          cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
          id: 3,
          name: "深圳高研究院店",
          remark: "",
          status: 1,
          storeid: "1b9ecf433ef74a759679b07a867db931"
        }, {
          cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
          id: 1,
          name: "深圳高等金融研究院店",
          remark: "",
          status: 1,
          storeid: "1b9ecf433ef74a759679b07a867db931"
        }]
      }],
      cityid: "",
      id: "",
      status: 1,
    }, {
      area: "华南区",
      areaid: "ac7f6d5445784075986108679ac8814e",
      city: "",
      cityAndStoreList: [{
        area: "",
        areaid: "",
        city: "深圳",
        cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
        id: "",
        status: 1,
        storeList: [{
          cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
          id: 1,
          name: "深圳高等金融研究院店",
          remark: "",
          status: 1,
          storeid: "1b9ecf433ef74a759679b07a867db931",
        }, {
          cityid: "b9339a71ffac40b7bf37eebdfc6fc782",
          id: 2,
          name: "copy之神腾讯",
          remark: "",
          status: 1,
          storeid: "2c9d0b86339841d484ebecaed792fd96",
        }, {
          cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
          id: 3,
          name: "深圳高研究院店",
          remark: "",
          status: 1,
          storeid: "1b9ecf433ef74a759679b07a867db931"
        }, {
          cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
          id: 1,
          name: "深圳高等金融研究院店",
          remark: "",
          status: 1,
          storeid: "1b9ecf433ef74a759679b07a867db931"
        }]
      },{
          area: "",
          areaid: "",
          city: "深圳546456465",
          cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
          id: "",
          status: 1,
          storeList: [{
            cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
            id: 1,
            name: "深圳高等金融研究院店",
            remark: "",
            status: 1,
            storeid: "1b9ecf433ef74a759679b07a867db931",
          }, {
            cityid: "b9339a71ffac40b7bf37eebdfc6fc782",
            id: 2,
            name: "copy之神腾讯",
            remark: "",
            status: 1,
            storeid: "2c9d0b86339841d484ebecaed792fd96",
          }, {
            cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
            id: 3,
            name: "深圳高研究院店",
            remark: "",
            status: 1,
            storeid: "1b9ecf433ef74a759679b07a867db931"
          }, {
            cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
            id: 1,
            name: "深圳高等金融研究院店",
            remark: "",
            status: 1,
            storeid: "1b9ecf433ef74a759679b07a867db931"
          }]
        }, {
          area: "",
          areaid: "",
          city: "读好书骄",
          cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
          id: "",
          status: 1,
          storeList: [{
            cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
            id: 1,
            name: "深圳高等金融研究院店",
            remark: "",
            status: 1,
            storeid: "1b9ecf433ef74a759679b07a867db931",
          }, {
            cityid: "b9339a71ffac40b7bf37eebdfc6fc782",
            id: 2,
            name: "copy之神腾讯",
            remark: "",
            status: 1,
            storeid: "2c9d0b86339841d484ebecaed792fd96",
          }, {
            cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
            id: 3,
            name: "深圳高研究院店",
            remark: "",
            status: 1,
            storeid: "1b9ecf433ef74a759679b07a867db931"
          }, {
            cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
            id: 1,
            name: "深圳高等金融研究院店",
            remark: "",
            status: 1,
            storeid: "1b9ecf433ef74a759679b07a867db931"
          }]
        }],
      cityid: "",
      id: "",
      status: 1,
    }, {
      area: "华南区",
      areaid: "ac7f6d5445784075986108679ac8814e",
      city: "",
      cityAndStoreList: [{
        area: "",
        areaid: "",
        city: "深圳",
        cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
        id: "",
        status: 1,
        storeList: [{
          cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
          id: 1,
          name: "深圳高等金融研究院店",
          remark: "",
          status: 1,
          storeid: "1b9ecf433ef74a759679b07a867db931"
        }, {
          cityid: "b9339a71ffac40b7bf37eebdfc6fc782",
          id: 2,
          name: "copy之神腾讯",
          remark: "",
          status: 1,
          storeid: "2c9d0b86339841d484ebecaed792fd96",
        }, {
          cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
          id: 3,
          name: "深圳高研究院店",
          remark: "",
          status: 1,
          storeid: "1b9ecf433ef74a759679b07a867db931",
        }, {
          cityid: "b9339a71ffac40b7bf37eebdfc6fc78f",
          id: 1,
          name: "深圳高等金融研究院店",
          remark: "",
          status: 1,
          storeid: "1b9ecf433ef74a759679b07a867db931",
        }]
      }],
      cityid: "",
      id: "",
      status: 1
    }],
    regionList: [],
    regionListIndex: [0, 0, 0],
    last_arry_ids:[],
    date: '',
    nowDate: null

  },
  /****************************************网络请求****************************************/

  // 获取门店地址列表
  ObtainstoreList() {
    var _this = this;
    var dataBody = {};
    var encStr = basereq.encryptParam(dataBody);
    // wx.request({
    //   url: basereq.interfaceName + 'store/getStoreList',
    //   method: "POST",
    //   data: {
    //     data: encStr
    //   },
    //   header: {
    //     'content-type': 'application/x-www-form-urlencoded'
    //   },
    //   success: function(res) {

        // var code = res.data.code.toString();
        // if (code == "210200") {
          var ragionList = this.data.regionData;
          var arr = [];
          console.error(1, ragionList)
          // 获取第一个门店地区
          var FirstArea = [];
          var SecondArea = [];
          var EndArea = [];
          var ids = [];
          for (var i = 0; i< ragionList.length; i++) {
            FirstArea.push(ragionList[i].area)
          }
          for (var i = 0; i <ragionList[0].cityAndStoreList.length;i++) {
            SecondArea.push(ragionList[0].cityAndStoreList[i].city)
          }
          for (var j = 0; j < ragionList[0].cityAndStoreList[0].storeList.length; j++) {
            EndArea.push(ragionList[0].cityAndStoreList[0].storeList[j].name);
            ids.push(ragionList[0].cityAndStoreList[0].storeList[j].storeid)
          }
          arr.push(FirstArea, SecondArea, EndArea);
          _this.setData({
            regionData: ragionList,
            regionList: arr,
            last_arry_ids: ids,
          })
          console.log(arr,this.data.regionListIndex)



        // } else {
        //   wx.showToast({
        //     title: res.data.msg,
        //     image: '/Resource/images/cross.png',
        //     duration: 3000
        //   });
        // }
      },
    //})



 // },



  // 选择时间
  didDateChange: function(e) {
    this.setData({
      regionListIndex: e.detail.value,
      copyIndex: e.detail.value
    })
  },

  // 地址选择器
  bindRegionChange(e) {

    let storeId = this.data.last_arry_ids[e.detail.value[2]];
    console.log(storeId)

  },

  bindcolumnchange(e) {
    console.log(e)
    var index = e.detail.value;
    var column = e.detail.column;
    var arr = this.data.regionListIndex;
    var region = this.data.regionList;
    var SecondArea = [];
    var EndArea = [];
    var ids = [];
    arr[column] = index;
    this.setData({
      regionListIndex: arr,
      
    })

  
    if (e.detail.column === 0) {
      EndArea = [];
      ids = [];
      for (var i = 0; i < this.data.regionData[index].cityAndStoreList.length; i++) {
        SecondArea.push(this.data.regionData[index].cityAndStoreList[i].city);
      }
      
      for (var j = 0; j<this.data.regionData[index].cityAndStoreList[0].storeList.length; j++) {
        EndArea.push(this.data.regionData[index].cityAndStoreList[0].storeList[j].name);
        ids.push(this.data.regionData[index].cityAndStoreList[0].storeList[j].storeid);
        console.log(EndArea)
      }

      region[1] = SecondArea;
      region[2] = EndArea;
      this.setData({
        last_arry_ids: ids,
        regionList: region
      })
      
    }

    if (e.detail.column === 1) {
      EndArea = [];
      ids = [];
      for (var j = 0; j< this.data.regionData[this.data.regionListIndex[0]].cityAndStoreList[index].storeList.length; j++) {
        EndArea.push(this.data.regionData[this.data.regionListIndex[0]].cityAndStoreList[index].storeList[j].name)
        ids.push(this.data.regionData[this.data.regionListIndex[0]].cityAndStoreList[index].storeList[j].storeid);
      }

      region[2] = EndArea;

      this.setData({
        last_arry_ids: ids,
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