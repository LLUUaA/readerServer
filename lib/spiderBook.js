module.exports = async function () {
    const { write, initFolder, checkFile } = require('./fs');
    const { getChapterDetails } = require('../Controller/spider');
    const concurrent = 10,//并发
        granularity = 100;//粒度
    const getContent = (bookId, chapterNum, pos) => {

        if (checkFile(bookId, chapterNum)) {
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
                    bookId++;
                    chapterNum = 1;
                }

                if (bookId > pos * granularity) {
                    return;
                }

                getContent(bookId, chapterNum, pos);
            }, err => {
                //如果写入数据失败则尝试重新获取
                getContent(bookId, chapterNum, pos);
            })
    }

    await initFolder();

    for (let i = 0; i < concurrent; i++) {
        getContent((i * 100) + 1, 1, i + 1);
    }
}