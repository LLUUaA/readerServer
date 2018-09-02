
(() => {
    const runSpider = require('./lib/newSpider');
    const logger = require('./lib/logger');
    logger('runSpider','log')


    const fs = require('fs');
    const MAX_BOOK_ID = 10415;
    let bookId = 1;

    const clearFun = (bookId) => {
        const basePath = `xiashula/${bookId}`;
        const endPath = `${basePath}/chapter_end.txt`;
        const firstCharpter = `${basePath}/chapter_1.txt`;

        const next = (bookId) => {
            clearFun(bookId + 1);
        };

        const tryAgain = (bookId) => {
            clearFun(bookId);
        };

        //如果不存在book id
        if (!fs.existsSync(basePath)) {
            next(bookId);
            return;
        }

        if (!fs.existsSync(firstCharpter) && fs.existsSync(endPath)) {
            fs.unlink(endPath, err => {
                if (err) {
                    tryAgain(bookId);
                    console.log(' delete try again ==>', bookId);
                    return;
                }
                next(bookId);
                console.log(' delete book ==>', bookId);
            });

        } else {
            next(bookId);
        }
    }

    // clearFun(bookId);

})();