
/**
 * @description fs 文件
 * @description process.cwd() //相对路径
 * @description ws;//writeStream
 * @description rs;//readStream
 * @author WQS
 */


const fs = require('fs');
const logger = require('./logger');
const targetDir = process.cwd();//当前项目目录
const saveDir = `${process.cwd()}/xiashula`;//默认存储目录

/**
 * 
 * @param {string | Buffer} path 
 * @param {any} mode 
 */
function isAccess(path, mode = fs.constants.F_OK) {
    try {
        return fs.accessSync(path, mode)
    } catch (error) {
        logger(error);
        // throw error(error)
    }

}

module.exports = {

    /**
     * @function write
     * @param {number} bookId // id
     * @param {number} chapterNum //章节
     * @param {number} data //数据
     * @param {object} options // writeFile options
     * @param {Boolean} append //是否追加
     * @description 向目标目录写入数据
     * @returns Promise
     */
    write(bookId, chapterNum, data, options = {}, append = false) {
        return new Promise((resolve, reject) => {
            console.log('bookId:',bookId,'chapterNum:',chapterNum);
            if (!bookId || !chapterNum || !data) {
                resolve({
                    status: 203,
                    message: 'param not null'
                });
                return;
            }

            const tDir = `${saveDir}/${bookId}`;
            const path = `${tDir}/chapter_${chapterNum}.txt`;//存储路径

            if (!fs.existsSync(tDir)) {
                fs.mkdirSync(tDir);
            }

            fs.writeFile(path, data, options, (err) => {
                if (err) {
                    logger(err);
                    reject({
                        status: 204,
                        message: err
                    });
                } else {
                    resolve({
                        status: 200,
                        message: 'ok'
                    });
                }
            })
        })
    },

    checkFile(bookId,chapterNum){
        const path = `${saveDir}/${bookId}/chapter_${chapterNum}.txt`;//存储路径
        return fs.existsSync(path);

    },

    /**
     * @function initFolder
     * @param {string} path 
     * @description 检查book根目录是否创建，一开始调用spider检查一下则后面不用每次检查
     * @default saveDir
     * @returns Promise
     */
    initFolder(path) {
        //如果传入path则全局变量的dir需要改变为path
        return new Promise((resolve, reject) => {
            try {
                if (path) {
                    saveDir = path;
                } else {
                    path = saveDir;
                }

                if (!fs.existsSync(path)) {
                    fs.mkdirSync(path);
                }
                resolve();
            } catch (error) {
                reject('请重试');
            }

        })
    }
}