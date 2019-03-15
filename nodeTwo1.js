// 路由清单表
var http = require("http");
var fs=require("fs")
var server = http.createServer((req, res) => {
    res.setHeader("Content-Type","text/html;charset=UTF-8");
    if (req.url == "/") {
        res.end("首页");
    }else if (req.url=="/test1.html"){
        res.end("这是测试页面一");
    } else if(req.url=="/test2.html"){
        res.end("这是测试页面二")
    }else if (/\/test\/[\d]{6}$/.test(req.url)){
        var reg=/\/test\/([\d]{6})/;
        var num=reg.exec(req.url)[1];
        fs.readFile("./db.json",function (err,data) {
            if (err){
                res.end("获取文件列表失败")
                return;
            }else {
                // 转为对象，注意用readFile读取进来的文件一定要toString()一下
                var dataObj=JSON.parse(data.toString());
                // 调用hasOwnProperty()方法查看是否存在NUM,存在的话执行else
                if (!dataObj.hasOwnProperty(num)) {
                    res.end("<h1>你查询的用户信息不存在!!!</h1>")
                    return;
                }
                else {
                    // res.end("<h1>你已经成功看到路由地址了，地址是:"+num+"</h1>")
                    res.write("<h1>你查询的用户编号是:" + [num] + "</h1>");
                    res.write("<h1>姓名:" + dataObj[num]["name"]+ "</h1>");
                    res.write("<h1>年龄:" + dataObj[num]["age"] + "</h1>");
                    res.write("<h1>性别:" + dataObj[num]["sex"] + "</h1>");
                    res.end("")
                }

            }
        })
    }else {
        res.end("无法继续访问")
    }
}).listen(8888);
console.log("服务器8888端口部署成功！！！");

//
// 笔记：
// req里面是用户访问的请求信息，请求的网址当然是req了。res是服务器的响应信息。
// 事实上，我们并不存在test几个文件夹，甚至我们可以伪装一个路由地址。
// 上面的工作叫做restfull

//
// Node.js是没有apache的，是没有真实物理文件映射关系的。这叫做顶层路由设计
// 能够制作顶层路由设计的语言比较流行的仅有Node.js和python
