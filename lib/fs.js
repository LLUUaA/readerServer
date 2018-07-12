
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
            if (!bookId || !chapterNum || !data || !data.length) {
                return reject({
                    status: 203,
                    message: 'param not null'
                });
            }

            console.log('bookId:', bookId, 'chapterNum:', chapterNum);
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
    /**
     * @function chapterEnd
     * @param {number} bookId // id
     * @param {number} data //数据--书籍信息（序列化）,书籍名称，书籍作者，书籍简介
     * @param {object} options // writeFile options
     * @param {Boolean} append //是否追加
     * @description 向目标目录写入数据
     * @returns void
     */
    chapterEnd(bookId, data, options = {}, append = false) {
        if (!data) {
            return;
        }

        const tDir = `${saveDir}/${bookId}`;
        const path = `${tDir}/chapter_end.txt`;//存储路径
        if (!fs.existsSync(tDir)) {
            fs.mkdirSync(tDir);
        }

        if (typeof data === "object") {
            data = JSON.stringify(data);
        }
        fs.writeFile(path, data, options, (err) => {
            if (err) {
                logger(err);
            }
        })
    },

    checkFile(bookId, chapterNum) {
        return new Promise((resolve, reject) => {
            const path = `${saveDir}/${bookId}/chapter_${chapterNum}.txt`;//存储路径
            const endPath = `${saveDir}/${bookId}/chapter_end.txt`;//book info 路径表示已经抓取完成
            const exist = fs.existsSync(path);
            try {
                if (fs.existsSync(endPath)) {
                    return resolve( {
                         code: 200,
                         message: 'already end'
                     })
                 }
     
                 resolve({
                     code: exist ? 201 : 202,
                     message: exist ? 'exist' : 'not exist'
                 })
            } catch (error) {
                logger(error);
                resolve({
                    code: 202,
                    message: 'not exist'
                })
            }

        })
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
