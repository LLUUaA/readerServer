var Koa = require('koa');
var Router = require('koa-router');
var app = new Koa();
var router = new Router();

// app.use(ctx=>{
//     ctx.body = 'hello reader';
// })



router.get('/', (ctx, next) => {
    ctx.body = 'hello koa'
})

router.get('/home/get',async (ctx,next)=>{
    const { getHome } = require('./utils/spider');
    var result;
    await getHome().then(res => {
            result = res;
        })
    ctx.body = result
})


app.use(router.routes()).use(router.allowedMethods());
app.listen(3000);