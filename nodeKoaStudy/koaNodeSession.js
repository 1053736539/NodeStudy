var koa = require('koa');
var Router = require('koa-router');
var views = require('koa-views');
var bodyParser = require('koa-bodyparser');
var Static = require('koa-static');
const session = require('koa-session');
var MongoDb=require('./module/db.js');
var app = new koa();
var router = new Router();


// router.get('/', async (ctx) => {
//     var userinfo = new Buffer('测试').toString('base64')
//     ctx.cookies.set('userinfo', userinfo, {
//         maxAge: 60 * 1000 * 60
//     });
//     await ctx.render('index')
// });
router.get('/login', async (ctx) => {
    ctx.session.userinfo = '111111';
    ctx.body = "登录页"
});
router.get('/news', async (ctx) => {
    var result=await MongoDb.find('user',{});
    console.log(result)
    ctx.body = "新闻页"
});

router.get('/shop', async (ctx) => {
    console.log(ctx.session.userinfo);
    ctx.body = "这是食品业"
});


// 配置session中间件
app.keys = ['some secret hurr']; //cookie的签名

const CONFIG = {
    key: 'koa:sess',
    maxAge: 10000,//过期时间需要设置
    autoCommit: true,
    overwrite: true,
    httpOnly: true, /** 只有服务器端可以获取cookie */
    signed: true, /** 默认签名 */
    rolling: false,
    renew: false,
};
app.use(session(CONFIG, app));


app
    .use(router.routes())//启动路由
    .use(router.allowedMethods());//可以配置也可以不配置建议配置

app.listen(3000);
