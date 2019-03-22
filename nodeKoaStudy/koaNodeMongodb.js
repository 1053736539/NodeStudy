var MongoClint = require("mongodb").MongoClient;
var Router = require('koa-router');
var koa = require('koa');
var dbUrl = "mongodb://127.0.0.1:27017/?gssapiServiceName=mongodb";
var dbName = "koa";
var MongoDb = require('./module/db.js');

var app = new koa();
var router = new Router();
// 连接数据库
MongoClint.connect(dbUrl, (err, client) => {
    if (err) {
        console.log(err);
        return;
    } else {
        var db = client.db(dbName);
        db.collection('user').insertOne({
            'username': "李四",
            'age': 26,
            'sex': "男",
            'status': "1"
        }, function (err, res) {
            if (!err) {
                console.log('增加数据成功');
                client.close();
            }
        })
    }
});

// router.get('/add', async (ctx) => {
//     let data = await MongoDb.insert('user', {'username': "张三228", 'age': 26, 'sex': "男", 'status': "1"});
//     console.log(data.result);
//     ctx.body = "这是食品业"
// });
//
// router.get('/edit', async (ctx) => {
//     let data = await MongoDb.updata('user', {"username":"张三22"},{"username":"李四"});
//     console.log(data.result);
//     ctx.body = "这是食品业"
// });




app
    .use(router.routes())//启动路由
    .use(router.allowedMethods());//可以配置也可以不配置建议配置

app.listen(3006);
