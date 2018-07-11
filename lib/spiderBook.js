module.exports = async function () {
    const { write, initFolder, checkFile, chapterEnd } = require('./fs');
    const { getChapterDetails, getChapter } = require('../Controller/spider');
    const concurrent = 10,//并发
        granularity = 100;//粒度
    const getContent = (bookId, chapterNum, pos) => {


        /**
         *@description 执行文件检查，当二次抓取打开此代码 to do 
         */

        // const checkStatus = checkFile(bookId, chapterNum);
        // if (checkStatus.code === 202) {
        //     chapterNum++;
        //     getContent(bookId, chapterNum, pos);
        //     return;
        // }

        // if (checkStatus.code === 200) {
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

                if (bookId > pos * granularity) {
                    return;
                }

                getContent(bookId, chapterNum, pos);
            }, err => {
                //如果获取数据失败则尝试重新获取
                getContent(bookId, chapterNum, pos);
            })
    }

    await initFolder();

    getContent(201,39);
    // for (let i = 0; i < concurrent; i++) {
    //     getContent((i * 100) + 1, 1, i + 1);
    // }
}