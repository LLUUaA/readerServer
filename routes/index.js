const Router = require('koa-router');
var router = new Router();
const bookRoute = require('./book');
const fileRoute = require('./file');
const accountRoute = require('./account');
const crypto = require('crypto');

router.all('/',(ctx,next)=>{
    const { signature,echostr,nonce,timestamp } = ctx.query;
    const wxToken = '15_RcTh_PrkymQVEqtMjvZQqQxgeXIwhyQOKbRvOqGCXeUlotelXYy49tR-BlYF637LZhalvOq8njE0voDOrj_Ppq8vY_XfbjWme3wjwR-z6s65atXTyKlkg_OCaGL6j-q2XtG2_T1wu5KKVswuQAEeAIAGQU';
    console.log('ctx query',ctx.query);
    if(signature) {
        let tmpStr = [wxToken,timestamp,nonce]
        .sort()
        .join('');

        console.log(tmpStr);
        const hash = crypto.createHash('sha1');
        let encrypted = hash.update(tmpStr,'utf8').digest('hex');
        console.log('encrypted',encrypted);
        ctx.body = echostr || 'index hah';
        return;
    }
    ctx.body = 'index hah ';
})

router.use('/book',bookRoute.routes(),bookRoute.allowedMethods());
router.use('/file',fileRoute.routes(),fileRoute.allowedMethods());
router.use('/account',accountRoute.routes(),accountRoute.allowedMethods());

module.exports = router;