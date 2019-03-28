//金额规范
function amountStandard(price) {
  var v_price = price.toString()
  var justice = v_price.indexOf(".");
  //判断是否含有小数点 有则进行处理
  if (justice != -1) {
    price = price.toFixed(2);
    var zero_justice = price.substr((price.length - 1), price.length);
    while (zero_justice == 0 || zero_justice == '.') {
      price = price.substr(0, price.length - 1);
      zero_justice = price.substr((price.length - 1), price.length);
    }
  }
  return price;
}

module.exports = {
  amountStandard: amountStandard,
}