var Router = require('koa-router');
var router = new Router();
const { generateToken } = require('../utils/common');
const fileUpload = require('../lib/upload/fileUpload');


router.get('/', (ctx, next) => {
    ctx.body = 'file route'
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