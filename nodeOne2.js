
var http = require('http');

var fs=require("fs");

var server=http.createServer(function (req,res) {
    // 通过调取remoteAddress方法来获取用户IP
    var IP=req.connection.remoteAddress;
    console.log("访问用户IP是:"+IP);
    fs.readFile("./public/test.html",function (err,filecontent) {
        res.setHeader("Content-Type","text/html;charset=UTF-8");
        res.end(filecontent);
        console.log("用户读取文件成功！！")
    })
});
server.listen(8888);
console.log("服务器已经运行在8888端口");


//
// http.createServer(function (request, response) {
//
//     response.writeHead(200, {'Content-Type': 'text/plain'});
//     // 发送响应数据 "Hello World"
//     response.end("<p>dsadsadsadsa</p>");
// }).listen(8888);
//
// // 终端打印如下信息
// console.log('Server running at http://127.0.0.1:8888/');
