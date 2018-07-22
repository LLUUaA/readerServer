const temme = require('temme').default; //or import temme from 'temme'
const logger = require('../lib/logger');
const { defineFilter } = require('temme');
const { getHtml, request } = require('../utils/request');
const { spider } = require('../utils/config.json');

/**
 * @function {filterData} 过滤空数据
 * @description 获取book id
 * @returns {Array}
 */
defineFilter('filterData', function () {
    if (this) {
        return this.filter(item => item !== null)
    } else {
        return [];
    }
})

/**
 * @function {defineFilter} getBookId --temme filter
 * @description 获取book id
 * @returns {Int}
 */
defineFilter('getBookId',function(){
    const matchStr = '?id=';//pc book id
    const matchStrMobile = '/read_';//mobile book id
    const str = this;
    const oIdx = str.indexOf(matchStr);
    const mIdx = str.indexOf(matchStrMobile);
    if(oIdx>=0) {
        return parseInt(str.substring(oIdx + matchStr.length));
    }else if(mIdx>=0){
        return parseInt(str.substr(1,mIdx));
    }else{
        return parseInt(str.replace('/',''));
    }

//    return parseInt(str.substring(oIdx + matchStr.length,str.length));
})

/**
 * @function {getChapter} getChapter --temme filter
 * @description 获取章节
 * @returns {Int}
 */
defineFilter('getChapter',function(){
    const matchStrMobile = '/read_';
    const str = this;
    const mIdx = str.indexOf(matchStrMobile);
    if(mIdx>=0){
        return parseInt(str.substring(mIdx + matchStrMobile.length,str.length-5));
    }else{
        return 1
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
                    todayHot: `.free_book_list .lists li@ {a[href=$bookId|getBookId];img[data-original=$coverImg];p{$description};h3{$name}}`,
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
 * @description 请注意，encodeURI 自身无法产生能适用于HTTP GET 或 POST 请求的URI，例如对于 XMLHTTPRequests,
 *              因为 "&", "+", 和 "=" 不会被编码，然而在 GET 和 POST 请求中它们是特殊字符。
 *              然而encodeURIComponent这个方法会对这些字符编码。
 * 
 * @param { keyword, pageIndex,path } keyword关键字 pageIndex页码 path传入页面path
 */
function search(keyword, pageIndex = 1,path) {
    return new Promise((resolve, reject) => {
        request({
            hostname: spider.baseUrl,
            path: encodeURI(`/search.html?searchkey=${keyword}&searchtype=all&page=${pageIndex}`), //keyword带有中文字符需要encodeURI,不用encodeURIComponent
            port: 443,
            data: {
                "searchkey": keyword,
                "searchtype": "all"
            }
        }).then(res => {
            var result, pager = {};
            const html = res;
            const selector = {
                searchBook: `#waterfall div.item@ {.pic a[href=$bookId|getBookId];.pic img[data-original=$coverImg]; .title h3{$name};.nickname{$author};.intro{$description}}`,
                pageIndex: `.footer a@|filterData {&a[class="current"] {$};}`,
                pageContent: `.footer span{$};`,
            }
            result = temme(html, selector.searchBook);
            pager.pageIndex = parseInt(temme(html, selector.pageIndex)[0]);
            pager.pageContent = temme(html, selector.pageContent);
            resolve({ result, pager });
        }, err => {
            reject(err);
        })
    })
}


/**
 * @function getchapter
 * @param {number} bookId
 * @param {boolean} onlyChapterInfo
 * @description 获取章节
 * @returns Promise
 */

function getChapter(bookId,onlyChapterInfo = false) {
    return new Promise((resolve, reject) => {
        request({
            hostname: spider.baseUrl,
            path: `/${bookId}/`,
            port: 443
        }).then(res => {
            var result = {}, otherNum,bookInfo = {} ; //otherNum 中间隐藏章节数量
            const html = res;
            const selector = {
                chapterTop: `#main #mainleft #detaillist #toplist li@ {a[href=$chapterNum|getChapter] {$chapterName}; .time{$time}}`,
                chapterLast: `#main #mainleft #detaillist #lastchapter li@ {a[href=$chapterNum|getChapter] {$chapterName};.time{$time}}`,
                otherNum: `#main #mainleft #detaillist #hidc .ycnum{$}`,
                bookIntro:`#main #bookdetail #info #aboutbook{$}`,
                bookAuthor:`#main #bookdetail #infobox .ainfo .username a{$}`,
                bookName:`#main #bookdetail #info .infotitle h1{$}`,
                status:`#main #bookdetail #info .infotitle span{$}`,
                chapter:`#main .infonum ul@ {li{$}}`,
                coverImg:`#main #bookdetail #picbox .img_in img[data-original=$];`
            }

            bookInfo.bookIntro = temme(html, selector.bookIntro);
            bookInfo.bookAuthor = temme(html, selector.bookAuthor);
            bookInfo.bookName = temme(html, selector.bookName);
            bookInfo.status = temme(html, selector.status);
            bookInfo.chapter = temme(html, selector.chapter);
            bookInfo.coverImg = temme(html, selector.coverImg);
            bookInfo.bookIntro = bookInfo.bookIntro?bookInfo.bookIntro.replace('[+展开]',''):'暂无简介';
            bookInfo.bookId = bookId;

            if (onlyChapterInfo) {
                resolve({bookInfo});
            } else {
                result.top = temme(html, selector.chapterTop);
                result.last = temme(html, selector.chapterLast);
                otherNum = temme(html, selector.otherNum);
                resolve({ result, otherNum, bookInfo });
            }
        }, err => {
            logger(err)
            reject(err)
        })
    })
}

/**
 * @function getOtherChapter
 * @param {bookId ,pageIndex} bookId,pageIndex 
 * @description 获取分页章节，每页100章
 * 
 */

function getOtherChapter(bookId, pageIndex = 1) {
    return new Promise((resolve, reject) => {
        request({
            hostname: spider.mobileBaseUrl,
            path: `/${bookId}/chapters.html?page=${pageIndex}&sort=asc`,// asc | desc
            port: 443
        }).then(res => {
            var result,chapterPager;
            const html = res;
            const selector = {
                chapter:`.content .cataloglist li@ {a[href=$chapterNum|getChapter];span{$chapterName}}`,
                chapterPager:`.content .pagers:first-of-type #select #pagelist option@ {&{$}}`
            }
            result = temme(html, selector.chapter);
            chapterPager = temme(html, selector.chapterPager);
            resolve({chapterList:result,chapterPager,pageIndex,bookId});
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
            hostname: spider.mobileBaseUrl,
            path: `/${bookId}/read_${chapterNum}.html`,
            port: 443
        }).then(res=>{
            var chapterContent,chapterName;
            const html = res;
            /**
             * pc selector
             */
            // const selector = {
            //     content:`.readpage .readbox #chaptercontent{$}`,
            //     chapterName:`.readpage .readbox .title h1 a{$}`
            // }

            /**
             * mobile selector
             */
            const selector = {
                content:`.content .articlecon p@ {&{$}}`,
                chapterName:`.content .titlename{$}`
            }
            chapterContent = temme(html, selector.content);
            chapterName = temme(html, selector.chapterName);
            resolve({chapterName,chapterContent});
        },err=>{
            logger(err);
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