var Router = require('koa-router');
var router = new Router();
const { getHome, getChapter, getBookType, getAuthorBook, getChapterDetails, getOtherChapter, searchBook } = require('../Controller/spider');

const {
    getLastRead,
    getBookShelf,
    searchRecord,
    historyRecord,
    bookShelf,
    checkAddShelf,
    addBookShelf,
    removeBookShelf,
} = require('../Controller/bookController');

/**
 * @description 获取home数据
 */
router.get('/home', async (ctx, next) => {
    var result;
    ctx.body = await getHome();
})

/**
 * @description 获取上一次阅读 
 */
router.get('/lastRead', async (ctx, next) => {
    const { _uid } = ctx.request.body;
    ctx.body = await getLastRead(_uid, ctx.query.bookId);
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
router.get('/type/:type', async (ctx, next) => {
    const { type } = ctx.params;
    ctx.body = await getBookType(type);
})

/**
 * @description 获取auhor book 
 */
router.get('/author/:author', async (ctx, next) => {
    const { author } = ctx.params;
    ctx.body = await getAuthorBook(author)
})

/**
 * @description 搜索
 */
router.get('/search/:keyword', async (ctx, next) => {
    const { _uid } = ctx.request.body || {};

    var keyword = ctx.params.keyword;
    searchRecord(_uid, keyword);
    ctx.body = await searchBook(keyword, ctx.query.pageIndex);
})

/**
 * @description 点击书籍进入页面
 */
router.get('/chapter/:bookId', async (ctx, next) => {
    const { onlyBookInfo } = ctx.query;
    const { bookId } = ctx.params;
    const { _uid } = ctx.request.body;
    const bookInfos = await getChapter(bookId, !!onlyBookInfo);
    bookInfos.isAddBookShelf = await checkAddShelf(_uid, bookId);
    ctx.body = bookInfos;
})

/**
 * @description 章节分页数据 
 */
router.get('/chapter/other/:bookId/:pageIndex', async (ctx, next) => {
    const { bookId, pageIndex } = ctx.params;
    ctx.body = await getOtherChapter(bookId, pageIndex);
})

/**
 * @description 阅读章节 
 */
router.get('/chapter/details/:bookId/:chapterNum', async (ctx, next) => {

    const { bookId, chapterNum } = ctx.params;
    const { _uid } = ctx.request.body || {};
    historyRecord(bookId, chapterNum, _uid);//记录阅读
    ctx.body = await getChapterDetails(bookId, chapterNum);
})

/**
 * @description 记录阅读的章节 
 */
router.post('/chapter/record', (ctx, next) => {

    const { id, num, _uid } = ctx.request.body;
    historyRecord(id, num, _uid);
    ctx.status = 204;
})

/**
 * @description 记录搜索关键字 
 */
router.post('/search/record', (ctx, next) => {
    const { keyword, _uid } = ctx.request.body;
    searchRecord(keyword, _uid);
    ctx.status = 204;
})

/**
 * @description 书架加入和取消（偷懒没用put）
 */
router.post('/bookshelf', (ctx, next) => {
    const { _uid, _array } = ctx.request.body;
    bookShelf(_uid, _array);
    ctx.status = 204;
});

/**
 * @description 加入书架
 * @datatime 2020年3月24日
 * @description 手机app api
 */
router.post('/bookshelf/add', async (ctx, next) => {
    const { _uid, bookId, bookInfo } = ctx.request.body;
    await addBookShelf(_uid, bookId, bookInfo);
    ctx.status = 204;
});

/**
 * @description 取消加入书架
 * @datatime 2020年3月24日
 * @description 手机app api
 */
router.post('/bookshelf/remove', async (ctx, next) => {
    const { _uid, bookId } = ctx.request.body;
    await removeBookShelf(_uid, bookId);
    ctx.status = 204;
});

/**
 * @description 获取书架
 */
router.get('/bookshelf', async (ctx, next) => {
    const { _uid } = ctx.request.body;
    const bookList = await getBookShelf(_uid);
    try {
        for (const book of bookList) {
            const bookInfo = JSON.parse(book.book_info);
            for (const key in bookInfo) {
                book[key] = bookInfo[key];
            }
        }
    } catch (error) { }
    ctx.body = bookList;
})

module.exports = router