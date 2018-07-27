
const fs = require ('fs');
const logger = require('./logger');

function getConfig(cfg = {}) {
    return Object.assign({
        limitSize: 1073741824,//文件上传大小限制1073741824b = 1Gb
        tempPath: 'temp',//存储分片路径
        savePath: process.cwd() + '/upload',//文件保存路径
        isChunk: true//是否分片
    }, cfg)
}

function Upload(cfg) {
    this.cfg = getConfig(cfg);
}

module.exports = Upload;

/**
 * @function start
 * @description 开始上传，处理是否分片上传
 */
Upload.prototype.start = function (req){
    var buffData = [] ,chunkSize = 0;
    req.on('data', (chunk) => {
        var size = chunk.length;
        chunkSize += size;
        buffData.push(chunk);
        // console.log(`data ${chunk.toString()}`);

        // logger(chunk.toString().split(/[\n]/),'log');
        console.log(`Received ${size} bytes of data.`);
    });

    req.on('end', () => {
        console.log('There will be no more data.');
        var fileData = Buffer.concat(buffData,chunkSize);
        for(var a = 0;a<fileData.length;a++){
            // console.log(`toString ==> ${fileData[a]}`);
        }

        this.save(fileData);
      });
}

/**
 * @function upload
 * @description 上传handle
 */
Upload.prototype.upload = function (){

}

/**
 * @function save
 * @description 保存文件
 */
Upload.prototype.save = function (data) {
    if (!fs.existsSync(this.cfg.savePath)) {
        fs.mkdirSync(this.cfg.savePath)
    }
    fs.writeFile(`${this.cfg.savePath}/test1.txt`, data, (err) => {
        logger(err);
    })
}


/**
 * @function parserMultipart
 * @description 解析内容
 */
Upload.prototype.parserMultipart = function (data) {

}

