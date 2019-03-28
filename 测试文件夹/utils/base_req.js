var meCrypto = require('./crypto_util.js');

// ynyixiang地址
// var interfaceName = 'https://www.ynyixiang.com/Mellower/v1.1.3/';
// var domain = 'https://www.ynyixiang.com';

// 254 地址
var interfaceName = 'http://10.12.1.254:8080/Mellower/v1.0.0/';
var domain = 'http://10.12.1.254:8080';

// 98 地址
// var interfaceName = 'http://10.12.3.98:8080/Mellower/v1.0.0/';
// var domain = 'http://10.12.3.98:8080';

// // 正式地址
// var interfaceName = 'https://app.mellowercoffee.com/Mellower/v2.3.0/';
// var domain = 'https://app.mellowercoffee.com';


// 返回加密好的参数
function encryptParam (dataBody) {
  var dataAll = {};
  var clientInfo = {};
  dataAll.clientInfo = clientInfo;
  dataAll.data = dataBody;
  var jsonString = JSON.stringify(dataAll);
  console.log(jsonString);
  var encStr = meCrypto.Encrypt(jsonString);
  return encStr;
}

module.exports = {
  encryptParam: encryptParam,
  interfaceName: interfaceName,
  domain: domain
}                                                                                                                                                                                                                                                                                                                         