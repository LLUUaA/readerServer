const Router = require('koa-router');
var router = new Router();
const bookRoute = require('./book');
const fileRoute = require('./file');

router.get('/',(ctx,next)=>{
    ctx.body = 'index hah';
})

router.use('/book',bookRoute.routes(),bookRoute.allowedMethods());
router.use('/file',fileRoute.routes(),bookRoute.allowedMethods());

module.exports = router;