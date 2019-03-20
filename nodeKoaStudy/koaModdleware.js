var koa = require('koa');
var Router = require('koa-router');


var app = new koa();
var router = new Router();

// 中间件

// 应用级中间件，匹配路由之前匹配任意路由
app.use(async (ctx, next) => {
    ctx.body('这是一个中间件');

    console.log(new Data());
    await next();//当前路由匹配完成以后继续向下匹配
});


// 路由级中间件






app.listen(3000);
