
/**
 * @description fs 文件
 * @description process.cwd() //相对路径
 * @description ws;//writeStream
 * @description rs;//readStream
 * @author WQS
 */


const fs = require('fs');
const targetDir = process.cwd();//默认目录

/**
 * 
 * @param {string | Buffer} path 
 * @param {any} mode 
 */
function isAccess(path, mode = fs.constants.F_OK) {
    try {
        return fs.accessSync(path, mode)
    } catch (error) {
        throw error(error)
    }

}

module.exports = {

    /**
     * @function write
     * @param {string|Buffer} path //文件夹
     * @param {Any} data //数据
     * @param {Boolean} append //是否追加
     * @description 向目标目录写入数据
     * @returns Promise
     */
    write(path, data,options, append = false) {
        return new Promise((resolve, reject) => {
            fs.writeFile(path, data, options, (err) => {
                if (err) {
                    reject();
                } else {
                    resolve();
                }
            })
        })
    }
}
