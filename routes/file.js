var Router = require('koa-router');
var router = new Router();
const { generateToken } = require('../utils/common');
const fileUpload = require('../lib/upload/fileUpload');
const iconv = require('iconv-lite');
const fs = require("fs");

router.get('/', async (ctx, next) => {
    // const path = process.cwd() + '/upload/README.md';
    const path = 'upload/README.md';
    var result;
    var datas = [];
    var size = 0;

    const getContent = () => {
        return new Promise((resolve,reject)=>{
            fs.open(path, 'r', (err, fd) => {
                if (err) throw err
                const rstrem = fs.createReadStream('', { fd });
                rstrem.on('data', (oData) => {
                    datas.push(oData);  
                    size += oData.length;  
                })
                rstrem.on('end', () => {
                    console.log('end');
                    var buff = Buffer.concat(datas, size);  
                    var result = iconv.decode(buff, "utf8");
                    resolve(result);
                })
            })
        })
    }
    // getContent();

    ctx.body =  'file route';
})

/**
 * @description 获取上传key
 */
router.get('/key', (ctx, next) => {
    ctx.body = generateToken(5);
})

router.post('/', (ctx, next) =>{
    // Upload.start(ctx.req)
    var Upload,
        files = [],
        isChunk = true,
        fields = []; 
    isChunk = ctx.query.total > 0 && ctx.query.chunkIndex !== undefined;

    Upload = new fileUpload({isChunk})

    Upload
        .on('field', function (field, value) {
            // console.log(field, value);
            fields.push([field, value]);
        })
        .on('file', function (field, file) {
            // console.log(field, file);
            files.push([field, file]);
        })
        .on('end', function () {
            console.log('-> upload done');

        });
    Upload.parse(ctx.req);

    ctx.body = {
        code: 200,
        msg: 'ok'
    }
})

module.exports = router