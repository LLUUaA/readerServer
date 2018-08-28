var Router = require('koa-router');
var router = new Router();
const spiderPath = '../Controller/spider';

/**
 * @description 获取home数据
 */
router.get('/home',async (ctx,next)=>{
    const { getHome } = require(spiderPath);
    var result;
    await getHome().then(res => result = res);
    ctx.body = result
})

/**
 * @description 获取上一次阅读 
 */
router.get('/lastRead', async (ctx,next)=>{
    const { getLastRead }  = require('../Controller/bookController');
    const { userId } = ctx.request.body;
    let result;
    await getLastRead(userId,ctx.query.bookId)
    .then(res=>result = res)
    .catch(err=>result = null);
    ctx.body = result;
})

/**
 * @description 获取配置
 */
router.get('/getConfig', async (ctx, next) => {
    const { name } = ctx.query;  
    ctx.body = require(`../public/config/${name || 'gConfig'}.json`);
})

/**
 * @description 获取书籍分类 
 */
router.get('/type/:type',async (ctx,next)=>{
    const { getBookType } = require(spiderPath);
    var result;
    const { type } = ctx.params;
    await getBookType(type)
    .then(res => result = res)
    .catch(err=>ctx.body = '查询出现错误');
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
    const { searchRecord }  = require('../Controller/bookController');
    const { userId } = ctx.request.body ||{};

    var result,
    keyword = ctx.params.keyword;
    if(keyword.length>1) {
        // searchRecord(userId,keyword);
        await searchBook(keyword,ctx.query.pageIndex).then(res => {
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
    const { historyRecord } = require('../Controller/bookController');
    const { bookId,chapterNum } = ctx.params;
    const { userId } = ctx.request.body ||{};

    var result;
    // historyRecord(bookId, chapterNum, userId);//记录阅读
    await getChapterDetails(bookId,chapterNum).then(res => {
            result = res;
        })
    ctx.body = result
})

/**
 * @description 记录阅读的章节 
 */
router.post('/chapter/record', (ctx, next) => {
    const { historyRecord } = require('../Controller/bookController');
    const { id, num, userId } = ctx.request.body;
    historyRecord(id, num, userId);
    ctx.status = 204;
})

/**
 * @description 记录搜索关键字 
 */
router.post('/search/record', (ctx, next) => {
    const { searchRecord } = require('../Controller/bookController');
    const { keyword, userId } = ctx.request.body;
    searchRecord(keyword, userId);
    ctx.status = 204;
})

/**
 * @description 书架加入和取消（偷懒没用put）
 */
router.post('/bookshelf', (ctx, next) => {
    const { bookShelf } = require('../Controller/bookController');
    const { userId, _array } = ctx.request.body;
    bookShelf(userId, _array);
    ctx.status = 204;
})

/**
 * @description 书架加入和取消
 */
router.get('/bookshelf', async (ctx, next) => {
    const { getBookShelf } = require('../Controller/bookController');
    const { userId } = ctx.request.body;
    let result;
    await getBookShelf(userId)
    .then(res=>result=res)
    .catch(err=>result = [])
    ctx.body = result;
})

module.exports = router