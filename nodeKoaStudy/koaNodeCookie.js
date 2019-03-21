var koa = require('koa');
var Router = require('koa-router');
var views = require('koa-views');
var bodyParser = require('koa-bodyparser');
var Static = require('koa-static');


var app = new koa();
var router = new Router();


// 配置静态服务中间件
app.use(Static(__dirname + '/static'));

app.use(views('views', {
    extension: 'ejs'//引用模板引擎
}));

app.use(bodyParser());
router.get('/', async (ctx) => {
    var userinfo=new Buffer('测试').toString('base64')
    ctx.cookies.set('userinfo',userinfo,{
        maxAge:60*1000*60
    });
    await ctx.render('index')
});
router.get('/news', async (ctx) => {

    var data=ctx.cookies.get('userinfo');
    var userinfo=new Buffer(data,'base64').toString();
    console.log(userinfo);
    ctx.body = "新闻页"
});

router.get('/shop', async (ctx) => {

    var userinfo=ctx.cookies.get('userinfo');
    console.log(userinfo);
    ctx.body = "这是食品业"+userinfo;
});

// 接收POST提交的数据
router.post('/doAdd', async (ctx) => {
    ctx.body = ctx.request.body;//获取表单提交的数据
    console.log(ctx.request.body);
});

app
    .use(router.routes())//启动路由
    .use(router.allowedMethods());//可以配置也可以不配置建议配置

app.listen(3000);
