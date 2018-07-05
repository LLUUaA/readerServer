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

router.get('/book/home',async (ctx,next)=>{
    const { getHome } = require('./utils/spider');
    var result;
    await getHome().then(res => {
            result = res;
        })
    ctx.body = result
})

router.get('/book/search',async (ctx,next)=>{
    const { searchBook } = require('./utils/spider');
    var result;
    await searchBook('99',4).then(res => {
            result = res;
        })
    ctx.body = result
})

router.get('/book/chapter',async (ctx,next)=>{
    const { getChapter } = require('./utils/spider');
    var result;
    await getChapter(5596).then(res => {
            result = res;
        })
    ctx.body = result
})

router.get('/book/chapter/other',async (ctx,next)=>{
    const { getOtherChapter } = require('./utils/spider');
    var result;
    await getOtherChapter(5596,485).then(res => {
            result = res;
        })
    ctx.body = result
})

router.get('/book/chapter/details',async (ctx,next)=>{
    const { getChapterDetails } = require('./utils/spider');
    var result;
    await getChapterDetails(5596,1).then(res => {
            result = res;
        })
    ctx.body = result
})


app.use(router.routes()).use(router.allowedMethods());
app.listen(3000);