// 自动添加路由 小型阿帕奇
var http = require("http");
var fs = require("fs");
var url = require("url");
var querystring = require("querystring");

// 自定义mime类型映射对儿
var mime = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".png": "image/png",
    ".html": "text/html;charset=UTF-8",
    ".css": "text/css",
    "js": "application/x-javascript",
};

var server = http.createServer((req, res) => {

// 得到用户将要读取什么
    var pathname = url.parse(req.url).pathname;
    // 得到扩展名
    var extname = path.extname(pathname);
    // 如果url中不存在拓展名，此时表示这是一个文件夹，此时胡自动补全index.html
    if (!extname) {
        // 如果不是已/结尾，此时会造成浏览器识别图片路径层次有问题
        //比如http://127.0.0.1/b 和http://127.0.0.1/b/ 不一样。
        //同样的资源前者会认为是同级目录下的图片，后者认为是B文件夹中额.

        if (pathname.substr(-1) !== "/") {
            res.writeHead(302, {"location": pathname + "/"})
        }

        pathname += "/index.html";
    }


    fs.readFile("./public/" + pathname, function (err, data) {
        if (err) {
            res.end("暂时无法访问该文件！！！");
            return;
        }
        // 检查Content-Type是否属于已知类型
        if (mime.hasOwnProperty(extname)) {
            res.setHeader("Content-Type", mime[extname]);
        }
        res.end(data);
    })

}).listen(8888);
console.log("端口8888已经部署成功！！");
