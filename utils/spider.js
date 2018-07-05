const temme = require('temme').default; //or import temme from 'temme'
const { defineFilter } = require('temme');
const { getHtml, request } = require('./request');
const { spider } = require('./config.json');
defineFilter('filterData', function () {
    if (this) {
        return this.filter(item => item !== null)
    } else {
        return {};
    }
})

/**
 * @function getHome
 * 
 * @description 获取主页书籍信息（分类，热门，男、女）
 * 
 */

function getHome() {
    return new Promise((resolve, reject) => {
        request({
            hostname: spider.baseUrl,
            port: 443
        })
            .then(res => {
                const html = res;
                /**
                 * @description hotBook 热门书籍 subMenu 分类菜单
                 *              maleMenu 男士分类菜单 femaleMenu 女士分类菜单
                 * 
                 */
                // a .infos img[src=$src]
                var hotBook, subMenu, maleMenu, femaleMenu;
                const selector = {
                    // todayHot: `.free_book_list .lists li@list {a[href=$href];}`,
                    todayHot: `.free_book_list .lists li@ {a[href=$href];img[data-original=$coverImg];p{$description};h3{$name}}`,
                    subMenu: `.subMenuCon .subMenu li@ {li a[href=$href] {$subTxt};}`,
                    maleMenu: `.subMenuCon .subMenus .male li@|filterData {a[href=$href] {$subTxt};}`,
                    femaleMenu: `.subMenuCon .subMenus .female li@|filterData {a[href=$href] {$subTxt};}`
                }
                hotBook = temme(html, selector.todayHot);
                subMenu = temme(html, selector.subMenu);
                maleMenu = temme(html, selector.maleMenu);
                femaleMenu = temme(html, selector.femaleMenu);
                resolve({ hotBook, subMenu, maleMenu, femaleMenu });
            }, err => {
                reject(err);
                // throw error(err);
            })
        // getHome('www.xiashu.la');    
    })
}

/**
 * @function search
 * 
 * @description 搜索 path为公用selector (接口处理 eg:nan-> path=/type/nan_0_0_allvisit_1.html )
 * 
 * @param { keyword, pageIndex,path } keyword关键字 pageIndex页码 path传入页面path
 */
function search(keyword, pageIndex = 1,path) {
    return new Promise((resolve, reject) => {
        request({
            hostname: spider.baseUrl,
            path: `/search.html?searchkey=${keyword}&searchtype=all&page=${pageIndex}`,
            port: 443,
            data: {
                "searchkey": keyword,
                "searchtype": "all"
            }
        }).then(res => {
            var result, pager = {};
            const html = res;
            const selector = {
                searchBook: `#waterfall div.item@ {.pic a[href=$href];.pic img[data-original=$coverImg]; .title h3{$content};.nickname{$nickname};.intro{$intro}}`,
                pageIndex: `.footer a@|filterData {&a[class="current"] {$pageIndex};}`,
                pageContent: `.footer span{$pageContent};`,
            }
            result = temme(html, selector.searchBook);
            pager.pageIndex = temme(html, selector.pageIndex)[0].pageIndex;
            pager.pageContent = temme(html, selector.pageContent).pageContent;
            resolve({ result, pager });
        }, err => {
            reject(err);
        })
    })
}


/**
 * @function getchapter
 * @param {bookId} bookId
 * @description 获取章节
 */

function getChapter(bookId) {
    return new Promise((resolve, reject) => {
        request({
            hostname: spider.baseUrl,
            path: `/${bookId}/`,
            port: 443
        }).then(res => {
            var result = {}, otherNum; //otherNum 中间隐藏章节数量
            const html = res;
            const selector = {
                chapterTop: `#main #mainleft #detaillist #toplist li@ {a[hreft=$hreft] {$chapterName};}`,
                chapterLast: `#main #mainleft #detaillist #lastchapter li@ {a[hreft=$hreft] {$chapterName};}`,
                otherNum: `#main #mainleft #detaillist #hidc .ycnum{$}`
            }
            result.top = temme(html, selector.chapterTop);
            result.last = temme(html, selector.chapterLast);
            otherNum = temme(html, selector.otherNum);
            resolve({ result, otherNum });
        }, err => {
            reject(err)
        })
    })
}

/**
 * @function getOtherChapter
 * @param {bookId ,otherNum} bookId,otherNum
 * @description 获取剩余章节
 * 
 */

function getOtherChapter(bookId, otherNum) {
    return new Promise((resolve, reject) => {
        request({
            hostname: spider.baseUrl,
            path: `/api/ajax/zj?id=${bookId}&num=${otherNum}&order=asc`,
            port: 443
        }).then(res => {
            var result;
            const html = res;
            const selector = {
                chapter:`li@ {a[href=$href]{$chapterName};span{$time}}`
            }
            result = temme(html, selector.chapter);
            resolve(result);
        }, err => {
            reject(err)
        })
    })
}

/**
 * 
 * @function getChapterDetails
 * @param {bookId,chapterNum} bookId:章节id chapterNum:章节num
 * @description 阅读章节
 * 
 */

function getChapterDetails(bookId,chapterNum=1) {
    return new Promise((resolve, reject) => {
        request({
            hostname: spider.baseUrl,
            path: `/${bookId}/read_${chapterNum}.html`,
            port: 443
        }).then(res=>{
            var chapterContent,chapterName;
            const html = res;
            const selector = {
                content:`.readpage .readbox #chaptercontent{$}`,
                chapterName:`.readpage .readbox .title h1 a{$}`
            }
            chapterContent = temme(html, selector.content);
            chapterName = temme(html, selector.chapterName);
            resolve({chapterName,chapterContent});
        },err=>{
            reject(err);
        })
    })
}

module.exports = {
    getHome,
    searchBook: search,
    getChapter,
    getOtherChapter,
    getChapterDetails
}