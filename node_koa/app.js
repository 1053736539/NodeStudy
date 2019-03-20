const koa = require('koa');
const app = new koa();
//koa配置路由
app.use(async (ctx, next) => {
    console.log("1");
    await next();
    console.log("2");
});
app.use(async (ctx, next) => {
    console.log("3");
    await next();
    console.log("4");
});
app.use(async ctx => {
    console.log("5");
    ctx.body = 'This Is The First KOA'
});
app.listen(3000,'localhost');
