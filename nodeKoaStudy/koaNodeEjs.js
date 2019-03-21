var koa = require('koa');
var Router = require('koa-router');
var views = require('koa-views');
var bodyParser = require('koa-bodyparser');
var Static = require('koa-static');

var MongoDb=require('./module/db.js');

var app = new koa();
var router = new Router();


// 配置静态服务中间件
app.use(Static(__dirname + '/static'));

app.use(views('views', {
    extension: 'ejs'//引用模板引擎
}));

app.use(bodyParser());
router.get('/', async (ctx) => {
    await ctx.render('index')
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
