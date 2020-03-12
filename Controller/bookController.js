const { find, add, update } = require('../utils/mysql');
const { getLocalTime } = require('../utils/common');
/**
 * @param {number} book_id 
 * @param {number} chapter_num 
 * @description 记录阅读章节 记录用户阅读轨迹，当获取最新的阅读章节时，按时间排序获取最新的章节。
 */
function historyRecord(book_id, chapter_num, user_id) {
    add('history', {
        user_id,
        book_id,
        chapter_num,
        time: getLocalTime(false)
    })
}

/**
 * 
 * @param {number} user_id 
 * @param {string} keyword 
 */
function searchRecord( user_id,keyword) {
    add('search_record', {
        user_id,
        keyword,
        time: getLocalTime(false)
    })
}

/**
 * 
 * @param {number} user_id  
 * @param {array} datas  
 * @param {int} status  是否添加书架 0取消书架
 * @description add || update (isAdd) 
 */
function bookShelf(user_id, datas) {
    /**
     *
     * @param {boolean} hasBook 是否记录过
     */
    const excuteBookShelf = (hasBook, user_id, book_id, book_info, status) => {
        if (hasBook) {
            update('bookshelf', {
                time: getLocalTime(false),
                book_info,
                status
            },`book_id=${book_id}`)
        } else {
            add('bookshelf', {
                user_id,
                book_id,
                time: getLocalTime(false),
                book_info,
                status
            })
        }
    }

    const findBookShelf = (user_id, book_id, book_info, status) => {
        find('bookshelf', `user_id=${user_id} and book_id=${book_id}`)
            .then(results => {
                book_info = 'object' === typeof book_info ? JSON.stringify(book_info) : JSON.stringify({});
                let hasBook = false;
                if (results.length) {
                    hasBook = true;
                }
                excuteBookShelf(hasBook, user_id, book_id, book_info, status);
            })
            .catch(err => { })
    }

    for (let i = 0; i < datas.length; i++) {
        let book = datas[i];
        findBookShelf(user_id, book.bookId, book.bookInfo, book.status);
    }
}


function getBookShelf(user_id) {
    return new Promise((resolve,reject)=>{
        find('bookshelf',`user_id=${user_id} and status=1`,'book_info','id desc')
        .then(res=>{
            resolve(res);
        })
        .catch(reject)
    })
}

/**
 * 
 * @param {number} user_id 
 * @param {number} book_id 
 */
function getLastRead(user_id, book_id) {
    return new Promise((resolve, reject) => {
        find('history', `user_id=${user_id} AND book_id=${book_id}`, 'chapter_num', 'id DESC', 2).then(results => {
            resolve(results[1]?results[1].chapter_num : null );//why [1],chapter/details  记录的阅读记录，所以每次都会产生最新的一条为第一章。（在没有加入书架时）
        }, err => {
            // console.log('err', err);
            reject({
                msg: 'query error'
            });
        })
    })
}

module.exports = {
    historyRecord,
    searchRecord,
    bookShelf,
    getLastRead,
    getBookShelf
}

