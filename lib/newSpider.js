const { getChapterDetails, getChapter } = require('../Controller/spider');
const { write, initFolder, checkFile, chapterEnd } = require('./fs');
const logger = require('./logger');

(function () {
  const startId = 1,
    concurrent = 50,//并发
    granularity = 10,//粒度
    MAX_ID = 1000000;//最大id
  const next = (bookId, charpterNum) => {

  }

  const execute = async (bookId, chapterNum = 1) => {
    if (bookId > MAX_ID) return;

    let checkStatus = await checkFile(bookId, chapterNum);

    if (checkStatus && checkStatus.code === 200) {
      //已经抓取完成
      console.log('book already done-->', bookId);
      bookId = bookId + 1;
      chapterNum = 1;
      getContent(bookId, chapterNum);
      return;
    }

    if (checkStatus && checkStatus.code === 201) {
      //存在
      chapterNum++;
      getContent(bookId, chapterNum);
      return;
    }

    if (checkStatus && checkStatus.code === 203) {
      //check errror
      getContent(bookId, chapterNum);
      return;
    }

    getChapterDetails(bookId, chapterNum)
      .then(res => {
        //先保存
        write(bookId, chapterNum, res.chapterContent).catch(err => { });
        chapterNum++;//章节++
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
        execute(bookId, chapterNum); //执行
      }, err => {
        execute(bookId, chapterNum); //如果获取数据失败则尝试重新获取
      })
  }

  const start = () => {
    for (let i = 0; i < concurrent; i++) {
      execute((i * granularity) + startId);
    }
  }

  start();
})();