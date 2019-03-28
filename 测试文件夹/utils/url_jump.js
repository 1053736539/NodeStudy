function jumpWithStrJSON(strJSON, comeplete) {
  var dataObj = JSON.parse(strJSON); // 数据对象
  // 跳转卡片领取页面
  wx.showLoading({
    title: '',
  });
  var dataJSON = JSON.stringify(dataObj.dataDic);
  if (dataObj.shareType == 'coffee') {
    var jumpURL = '/pages/coffee_machine/coffee_holder/coffee_holder' + '?dataString=' + dataJSON;
  } else {
    var jumpURL = dataObj.targetURL + '?dataString=' + dataJSON;
  }
  // 1.5秒延迟后再进入页面
  var time = setTimeout(function () {
    wx.navigateTo({
      url: jumpURL,
      complete: function () {
        wx.hideLoading();
        if (typeof completeCallback == "function") {
          completeCallback();
        }
      }
    })
  }, 1500);
  
}

module.exports = {
  jumpWithStrJSON: jumpWithStrJSON,
}