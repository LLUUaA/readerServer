module.exports = async function () {
    const { write, initFolder, checkFile, chapterEnd } = require('./fs');
    const logger = require('./logger');
    const { getChapterDetails, getChapter } = require('../Controller/spider');
    const concurrent = 10,//并发
        baseNumber = 1,
        granularity = 1;//粒度
    const getContent = (bookId, chapterNum, pos) => {


        /**
         *@description 执行文件检查，当二次抓取打开此代码 to do 
         */

        try {
            // let checkStatus = checkFile(bookId, chapterNum);
            // if (checkStatus&&checkStatus.code === 202) {
            //     chapterNum++;
            //     getContent(bookId, chapterNum, pos);
            //     return;
            // }

            // if (checkStatus&&checkStatus.code === 200) {
            //     bookId += 1;
            //     chapterNum = 1;
            // }
        getChapterDetails(bookId, chapterNum)
            .then(res => {
                //先保存
                write(bookId, chapterNum, res.chapterContent);
                chapterNum++;
                if (res.chapterContent.length === 0) {
                    getChapter(bookId,true)
                    .then(res=>{
                        chapterEnd(res.bookInfo.bookId,res.bookInfo)
                    })

                    bookId++;
                    chapterNum = 1;
                }

                if (bookId >= (pos * granularity) + baseNumber) {
                    return;
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