/*
* 应用程序启动（入口）文件
* */
// 引用
const express = require('express');
const swig=require('swig');
// 创建APP应用 实例化=>node.js Http.createServer();
var app = express();

// 设置静态文件托管
app.use('/public',express.static(__dirname+'/public'));


//配置引用模板
//定义当前应用所使用的模板引擎
//第一个参数 模板引擎的名称，同时也是模板文件的后缀，第二个参数表示用于处理模板内容的方法
app.engine('html',swig.renderFile);
//设置模板文件存放的目录，第一个参数必须是views 第二个参数是目录
app.set('views','./views');
//注册使用的模板引擎，第一个参数必须是view engine，第二个参数和app.engine这个方法中定义的模板引擎名称（第一个参数）是一致的
app.set('view engine','html');
//在开发过程中，需要取消模板缓存
swig.setDefaults({cache:false});

/*根据不同功能来划分模块*/
app.use('/admin',require('./routers/admin'));
app.use('/api',require('./routers/api'));
app.use('/',require('./routers/main'));


// 监听
app.listen(8000);


// 用户发送HTTP请求=>url=>解析路由=>找到匹配的规则=>执行指定的绑定函数，返回对应内容至用户
//以“/public”=>静态=>直接读取指定目录下的文件，返回给用户
//以“/”=>动态=>处理业务逻辑，加载模板，解析模板=>返回数据给用户
