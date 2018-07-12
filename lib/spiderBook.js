module.exports = async function () {
    const { write, initFolder, checkFile, chapterEnd } = require('./fs');
    const logger = require('./logger');
    const { getChapterDetails, getChapter } = require('../Controller/spider');
    const concurrent = 10,//并发
        baseNumber = 280,
        granularity = 1000;//粒度

    /**
     * 
     * @param {number} bookId id
     * @param {number} pos positon
     */
    const isOver = (bookId, pos) => {
        return (bookId >= (pos * granularity) + baseNumber)
    }

    const getContent = async (bookId, chapterNum, pos) => {

        /**
         *@description 执行文件检查，当二次抓取打开此代码 to do 
         */

        try {

            if (isOver(bookId, pos)) {
                return;
            }

            let checkStatus = await checkFile(bookId, chapterNum);
            console.log('bookId:', bookId, checkStatus);

            if (checkStatus && checkStatus.code === 200) {
                //已经抓取完成
                bookId = bookId + 1;
                chapterNum = 1;
                getContent(bookId, chapterNum, pos);
                return;
            }

            if (checkStatus && checkStatus.code === 201) {
                //存在
                chapterNum++;
                getContent(bookId, chapterNum, pos);
                return;
            }

            getChapterDetails(bookId, chapterNum)
                .then(res => {
                    //先保存
                    write(bookId, chapterNum, res.chapterContent);
                    chapterNum++;
                    if (res.chapterContent.length === 0) {
                        getChapter(bookId, true)
                            .then(res => {
                                chapterEnd(res.bookInfo.bookId, res.bookInfo)
                            })

                        bookId++;
                        chapterNum = 1;
                    }

                    getContent(bookId, chapterNum, pos);
                }, err => {
                    //如果获取数据失败则尝试重新获取
                    getContent(bookId, chapterNum, pos);
                })
        } catch (error) {
            logger(error);
        }
    }

    await initFolder();
    for (let i = 0; i < concurrent; i++) {
        getContent((i * granularity) + baseNumber, 1, i + 1);
    }
}