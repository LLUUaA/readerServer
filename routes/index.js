const Router = require('koa-router');
var router = new Router();
const bookRoute = require('./book');
const fileRoute = require('./file');
const accountRoute = require('./account');
// const bodyParse = require('/');

router.get('/',(ctx,next)=>{
    ctx.body = 'index hah ';
})

router.use('/book',bookRoute.routes(),bookRoute.allowedMethods());
router.use('/file',fileRoute.routes(),fileRoute.allowedMethods());
router.use('/account',accountRoute.routes(),accountRoute.allowedMethods());

module.exports = router;