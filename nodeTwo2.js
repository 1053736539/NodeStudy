// 路由模块
var http=require("http");
var fs=require("fs");
var url=require("url");
var querystring=require("querystring");



var server=http.createServer((req,res)=>{
    // 将地址转为对象
    var urljson= url.parse(req.url);
    // 得到文件路径
    var pathname= urljson.pathname;
    //得到扩展名
    var extname= path.extname(pathname);
    // 得到查询字符串
    var qs = urljson.query;
    // 转为查询对象，和url.parse加上true非常类似
    console.log(pathname);
    console.log(extname);
    console.log(qs);
    res.end("");

}).listen(8888);
console.log("端口8888已经部署成功！！");

