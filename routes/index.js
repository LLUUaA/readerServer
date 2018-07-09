const Router = require('koa-router');
var router = new Router();
const bookRoute = require('./book');

router.get('/',(ctx,next)=>{
    ctx.body = 'index hah';
})

router.use('/book',bookRoute.routes(),bookRoute.allowedMethods());

module.exports = router;