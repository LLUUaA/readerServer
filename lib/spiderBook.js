/**
 * 
 * @param {number} baseNum 起始num
 * @param {number} concurrentNum 并发
 * @param {number} granularityNum 粒度
 */
module.exports = async function (baseNum, concurrentNum, granularityNum) {
    const { write, initFolder, checkFile, chapterEnd } = require('./fs');
    const logger = require('./logger');
    const { getChapterDetails, getChapter } = require('../Controller/spider');
    const baseNumber = baseNum || 8000,
        concurrent = concurrentNum || 50,//并发
        granularity = granularityNum || 10;//粒度
    let endNum = 0;//已经完成的数量（基于并发）
    /**
     * 
     * @param {number} bookId id
     * @param {number} pos positon
     */
    const isOver = (bookId, pos) => {
        const bOver = (bookId >= (pos * granularity) + baseNumber);
        if (bOver) {
            endNum++;
            //完成当前全部任务 abort()
            if (endNum === concurrent) {
                process.abort();
            }
        }
        return bOver;
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


            if (checkStatus && checkStatus.code === 200) {
                //已经抓取完成
                console.log('bookId:', bookId, checkStatus);
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

            if (checkStatus && checkStatus.code === 203) {
                //check errror
                getContent(bookId, chapterNum, pos);
                return;
            }

            getChapterDetails(bookId, chapterNum)
                .then(res => {
                    //先保存
                    write(bookId, chapterNum, res.chapterContent).catch(err => { });
                    chapterNum++;
                    if (res.chapterContent.length === 0) {
                        getChapter(bookId, true)
                            .then(res => {
                                chapterEnd(res.bookInfo.bookId, res.bookInfo)
                            }, err => {
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