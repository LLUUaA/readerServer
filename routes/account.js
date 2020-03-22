var Router = require('koa-router');
var router = new Router();
const {
    wxLogin,
    deviceLogin
} = require('../Controller/account');
const {
    find
} = require('../utils/mysql');

router.get('/wxLogin', async (ctx) => {
    ctx.body = 'wxLogin'
})

router.post('/login', async (ctx) => {
    const { deviceId } = ctx.request.body;
    if(!deviceId) {
        ctx.throw("params error");
    }
    ctx.body = await deviceLogin(deviceId, ctx.request.header["x-real-ip"] || '');
})

router.post('/wxLogin', async (ctx, next) => {
    try {
        const { code } = ctx.request.body || {};
        ctx.body =  await wxLogin(code, ctx.request.header["x-real-ip"] || '');
    } catch (error) {
        console.log("err", error)
    }
})

router.all("*", ctx=> {
    ctx.body = ctx.request.path || "welcome"
})

module.exports = router