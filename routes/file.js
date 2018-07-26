var Router = require('koa-router');
var router = new Router();
const { generateToken } = require('../utils/common');
const fileUpload = require('../lib/fileUpload');
const Upload = new fileUpload();

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
    Upload.start(ctx.req)
    ctx.body = {
        code:200,
        msg:'ok'
    }
})

module.exports = router