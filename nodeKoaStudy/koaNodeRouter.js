var koa = require('koa');
var Router = require('koa-router');
var app = new koa();
var router = new Router();

// ctx 上下文context 包含了req和res等信息
// 配置路由
router.get('/', async (ctx) => {
    ctx.body = '首页'
});
router.get('/news', async (ctx) => {
    console.log(ctx.query) ; //获取的是对象
    console.log(ctx.querystring);  //获取的是字符串
    console.log(ctx.url);//获取url地址
    console.log(ctx.request.query);
    // ctx里面的request get传值
    console.log(ctx.request.querystring);
    ctx.body = "新闻页"
});
// 动态路由http://127.0.0.1:3000/newsDetail/111
router.get('/newsDetail/:aid',async (ctx)=>{
    ctx.body = "新闻详情页";
    console.log(ctx.params);
});


app
    .use(router.routes())//启动路由
    .use(router.allowedMethods());//可以配置也可以不配置建议配置

//router.allowedMethods如果没设置响应头的话中间件处理完成后会自动加上响应头
app.listen(3000);
