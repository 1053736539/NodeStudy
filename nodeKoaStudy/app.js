// const koa = require("koa");
// const app = new koa();
//
// // 配置路由
//
// // 中间件
// app.use(async (ctx) => {
//     ctx.body = "holle worda";
// });
//
//
// app.listen(3000);
//

function getData(){
    return new Promise((res,rej)=>{
        var username="张三";
        res(username)
    })
}

async function test() {
    var data=await getData();
    console.log(data)
}
test();
