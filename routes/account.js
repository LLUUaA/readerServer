var Router = require('koa-router');
var router = new Router();
const { wxLogin } = require('../Controller/account');

router.get('/wxLogin', async (ctx, next) => {
    ctx.body = 'wxLogin'
})

router.post('/wxLogin', async (ctx, next) => {
    let openid;
    let { code } = ctx.request.body || {};
    await wxLogin(code).then(res => openid = res);
    ctx.body = { openid };
})

module.exports = router