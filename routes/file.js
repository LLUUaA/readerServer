var Router = require('koa-router');
var router = new Router();


router.get('/', async (ctx, next) => {
    const { write,initFolder } = require('../lib/fs');
    const {  getChapterDetails } = require('../Controller/spider');
    const concurrent = 10,//并发
        granularity = 100;//粒度

    const getContent = (bookId, chapterNum,pos) => {
        getChapterDetails(bookId, chapterNum)
            .then(res => {
                //先保存
                write(bookId, chapterNum, res.chapterContent);
                chapterNum++;
                if(res.chapterContent.length===0) {
                    bookId++;
                    chapterNum = 1; 
                }

                if (bookId > pos * granularity) {
                    return;
                }

                getContent(bookId,chapterNum,pos);
            },err=>{
                //如果写入数据失败则尝试重新获取
                getContent(bookId,chapterNum,pos);
            })
    }

    await initFolder();

    for (let i = 0; i < concurrent; i++) {
        getContent((i*100)+1, 1, i + 1);
    }



    // for (let id = 1; id < 10; id++) {
    //     for (let num = 1; num < 20; num++) {
    //         getChapterDetails(id,num)
    //             .then(res=>{
                   
    //             })
    //     }
    // }


    ctx.body = { test: 'test  ' + new Date().toLocaleString() }
})

module.exports = router