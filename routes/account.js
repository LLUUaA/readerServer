var Router = require('koa-router');
var router = new Router();
const { wxLogin } = require('../Controller/account');
const { find } = require('../utils/mysql');

router.get('/wxLogin', async (ctx, next) => {
    ctx.body = 'wxLogin'
})

router.post('/wxLogin', async (ctx, next) => {
    let data = {};
    let { code } = ctx.request.body || {};
    await wxLogin(code,ctx.request.header["x-real-ip"]||'').then(res => data = res);
    ctx.body = data;
})

module.exports = router