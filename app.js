var Koa = require('koa');
var Router = require('koa-router');
var app = new Koa();
var router = new Router();
const cros = require('./middleware/cros');
const response = require('./middleware/response');

app.use(cros);//解决跨域 middleware
app.use(response);//处理响应 middleware

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