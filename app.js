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

router.get('/book/search/:keyword',async (ctx,next)=>{
    const { searchBook } = require('./utils/spider');
    var result;
    
    if(ctx.params.keyword.length>1) {
        await searchBook(ctx.params.keyword,ctx.query.pageIndex).then(res => {
            result = res;
        })
    }else{
        result = 'keyword not null'
    }

    ctx.body = result
})

router.get('/book/chapter/:bookId',async (ctx,next)=>{
    const { getChapter } = require('./utils/spider');
    var result;
    await getChapter(ctx.params.bookId).then(res => {
            result = res;
        })
    ctx.body = result
})

router.get('/book/chapter/other/:bookId/:otherNum',async (ctx,next)=>{
    const { getOtherChapter } = require('./utils/spider');
    var result;
    const {bookId,otherNum} = ctx.params;
    await getOtherChapter(bookId,otherNum).then(res => {
            result = res;
        })
    ctx.body = result
})

router.get('/book/chapter/details/:bookId/:chapterNum',async (ctx,next)=>{
    const { getChapterDetails } = require('./utils/spider');
    var result;
    const {bookId,chapterNum } = ctx.params;
    await getChapterDetails(bookId,chapterNum).then(res => {
            result = res;
        })
    ctx.body = result
})


app.use(router.routes()).use(router.allowedMethods());
app.listen(3000);