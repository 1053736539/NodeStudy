/********************** 说明使用 **********************/
/*********** 在页面的js文件里的page方法中要写上系统对应的下拉onPullDownRefresh和上拉onReachBottom的方法并在里边进行处理 ***********/
/**
 * requestInfo对象中须有以下属性
 * url
 * data
 * method
 * header
 * successCode: 返回码后两位
 * bindList:    绑定操作的列表[]
 * bindRefreshInfo: 绑定刷新是的配置数据{} 如分页大小之类(所需字段详见下面)
 * curListData:function (res) // 从请求回来的数据置入所需要操作的数据列表 []
 * success:function (res) // 成功之后的回调 -- 用来预处理一些数据的,已经做过返回码处理
 * reloadData:function (res) // 用来刷新相对应的操作列表[]和其对应的配置信息{}
 * fail:function (res) // 失败的处理
 * complete:function () // 请求完成的处理
 */
function refreshFooterHandle(requestInfo) {
  wx.request({
    url: requestInfo.url,
    data: requestInfo.data,
    method: requestInfo.method,
    header: requestInfo.header,
    success: function (res) {
      var code = res.data.code.toString();
      var suffix = code.substr(code.length - 2, 2);
      if (suffix == requestInfo.successCode) {

        //判断是否有数据，有则取数据 
        var dataList = requestInfo.curListData(res);

        if (dataList.length > 0) {
          var list = dataList;

          //如果isFromSearch是true从data中取出数据，否则先从原来的数据继续添加  
          list = requestInfo.bindRefreshInfo.isFromSearch ? list : requestInfo.bindList.concat(list);
          requestInfo.bindRefreshInfo.searchLoading = true;

          if (dataList.length < requestInfo.bindRefreshInfo.callbackcount) {// 一页就加载完毕
            requestInfo.bindRefreshInfo.searchLoadingComplete = true; //把“没有数据”设为true，显示
            requestInfo.bindRefreshInfo.searchLoading = false; //把"上拉加载"的变量设为false，隐藏 
          }

          //reloadData
          if (requestInfo.reloadData != null) {
            requestInfo.reloadData({
              list: list,
              refreshInfo: requestInfo.bindRefreshInfo
              });
          }

          //成功获取数据之后进行数据处理
          if (requestInfo.success != null) {
            requestInfo.success(list, res);
          }
        } else {// 没有数据加载完毕
          if (requestInfo.bindRefreshInfo.searchPageNum == 1) {// 订单列表为空
            requestInfo.bindRefreshInfo.searchLoadingComplete = false; 
            requestInfo.bindRefreshInfo.searchLoading = false;  
          } else {
            requestInfo.bindRefreshInfo.searchLoadingComplete = true;  //把“没有数据”设为true，显示
            requestInfo.bindRefreshInfo.searchLoading = false;   //把"上拉加载"的变量设为false，隐藏 
          }

          //reloadData
          if (requestInfo.reloadData != null) {
            requestInfo.reloadData({
              list: list,
              refreshInfo: requestInfo.bindRefreshInfo
            });
          }
        }

      } else {
        // 其他错误
        wx.showToast({
          title: res.data.msg,
          image: '/Resource/images/cross.png',
          duration: 3000
        });
        // 接口访问成功，数据失败
        if (requestInfo.success != null) {
          requestInfo.success(list, res);
        }
      }
    },
    fail: function (res) {
      if (requestInfo.fail != null) {
        requestInfo.fail(res);
      }
    },
    complete: function () {
      wx.stopPullDownRefresh();
      requestInfo.bindRefreshInfo.isLoadMore = false;//结束正在加载
      if (requestInfo.complete != null) {
        requestInfo.complete(requestInfo.bindRefreshInfo);
      }

    }
  })
}

/**
 * refreshFooterInfo : 刷新所需要的一些基础配置:字段名称要一致
 * {  (初始化默认设置)
 *    isFromSearch: true,           // 用于判断orderList数组是不是空数组，默认true，空的数组
 *    searchPageNum: 1,             // 设置加载的第几次，默认是第一次
 *    callbackcount: 5,             //返回数据的个数
 *    searchLoading: false,         //"上拉加载"的变量，默认false，隐藏
 *    searchLoadingComplete: false, //“没有数据”的变量，默认false，隐藏
 *    isLoadMore: false             // 正在加载更多
 *  }
 */
function onPullDownRefresh(refreshFooterInfo) {
  refreshFooterInfo.searchPageNum = 1;              //第一次加载，设置1 
  // refreshFooterInfo.orderList = [];              //放置返回数据的数组,设为空  
  refreshFooterInfo.isFromSearch = true;            //第一次加载，设置true 
  refreshFooterInfo.searchLoading = false;          //把"上拉加载"的变量设为true，显示
  refreshFooterInfo.searchLoadingComplete = false;  //把“没有数据”设为false，隐藏  
  return refreshFooterInfo;
}

/**
 * refreshObj.refreshInfo 刷新所需要的一些基础配置
 * refreshObj.reloadData  刷新回调
 */
function onReachBottom (refreshObj){
  var refreshInfo = refreshObj.refreshInfo;
  if (!refreshInfo.isLoadMore) {
    if (refreshInfo.searchLoading && !refreshInfo.searchLoadingComplete) {
      refreshInfo.searchPageNum = refreshInfo.searchPageNum + 1; //每次触发上拉事件，把searchPageNum+1
      refreshInfo.isFromSearch = false; //触发到上拉事件，把isFromSearch设为为false
      refreshObj.reloadData(refreshInfo);
    }
  }
}

function resetData(refreshFooterInfo) {
  refreshFooterInfo.searchPageNum = 1;              //第一次加载，设置1 
  // refreshFooterInfo.orderList = [];              //放置返回数据的数组,设为空  
  refreshFooterInfo.isFromSearch = true;            //第一次加载，设置true 
  refreshFooterInfo.searchLoading = true;          //把"上拉加载"的变量设为true，显示
  refreshFooterInfo.searchLoadingComplete = false;  //把“没有数据”设为false，隐藏 
  return refreshFooterInfo;
}

module.exports = {
  refreshFooterHandle: refreshFooterHandle,
  onPullDownRefresh: onPullDownRefresh,
  onReachBottom: onReachBottom,
  resetData: resetData
}