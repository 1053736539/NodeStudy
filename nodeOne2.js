
var http = require('http');
// HTTP创建服务器用的
var fs=require("fs");
// 读取文件用的

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



// Node.js适合开发I/O多的业务，而不适合计算任务繁重的业务
//
// 在多线程程序中例如PHP,CPU经常会等待I/O结束，但是CPU还是处于空闲状态，导致性能白白消耗。
// 在单线程中，当访问并行极大的时候，CPU理论上能发挥100%的性能

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
