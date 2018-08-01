var Router = require('koa-router');
var router = new Router();
const spiderPath = '../Controller/spider';

/**
 * @description 获取home数据
 */

router.get('/home',async (ctx,next)=>{
    const { getHome } = require(spiderPath);
    var result;
    await getHome().then(res => {
            result = res;
        })
    ctx.body = result
})

/**
 * @description 获取配置
 */

router.get('/getConfig', async (ctx, next) => {
    ctx.body = {
        tab: {
            showBookType: true,
            share: {
                path: null,
                title: null,
                imageUrl: null
            }
        },

        index: {
            share: {
                path: null,
                title: null,
                imageUrl: null
            }
        },

        reader: {
            share: {
                path: null,
                title: null,
                imageUrl: null
            },
        },

        bookDetail :{
            share: {
                path: null,
                title: null,
                imageUrl: null
            },
        }
    }
})

/**
 * @description 获取书籍分类 
 */
router.get('/type/:type',async (ctx,next)=>{
    const { getBookType } = require(spiderPath);
    var result;
    const { type } = ctx.params;
    await getBookType(type).then(res => {
            result = res;
        })
    ctx.body = result
})

/**
 * @description 获取auhor book 
 */
router.get('/author/:author',async (ctx,next)=>{
    const { getAuthorBook } = require(spiderPath);
    var result;
    const { author } = ctx.params;
    await getAuthorBook(author).then(res => {
            result = res;
        })
    ctx.body = result
})


/**
 * @description 搜索
 */
router.get('/search/:keyword',async (ctx,next)=>{
    const { searchBook } = require(spiderPath);
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


/**
 * @description 点击书籍进入页面
 */
router.get('/chapter/:bookId',async (ctx,next)=>{
    const { getChapter } = require(spiderPath);
    const { onlyBookInfo }  = ctx.query;
    var result;
    await getChapter(ctx.params.bookId,!!onlyBookInfo).then(res => {
            result = res;
        })
    ctx.body = result
})


/**
 * @description 章节分页数据 
 */
router.get('/chapter/other/:bookId/:pageIndex',async (ctx,next)=>{
    const { getOtherChapter } = require(spiderPath);
    var result;
    const {bookId,pageIndex} = ctx.params;
    await getOtherChapter(bookId,pageIndex).then(res => {
            result = res;
        })
    ctx.body = result
})


/**
 * @description 阅读章节 
 */
router.get('/chapter/details/:bookId/:chapterNum',async (ctx,next)=>{
    const { getChapterDetails } = require(spiderPath);
    var result;
    const {bookId,chapterNum } = ctx.params;
    await getChapterDetails(bookId,chapterNum).then(res => {
            result = res;
        })
    ctx.body = result
})


module.exports = router