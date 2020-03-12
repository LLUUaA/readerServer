var Router = require('koa-router');
var router = new Router();
const { wxLogin } = require('../Controller/account');
const { find } = require('../utils/mysql');

router.get('/wxLogin', async (ctx, next) => {
    ctx.body = 'wxLogin'
})

router.post('/wxLogin', async (ctx, next) => {
    
    try {
        const { code } = ctx.request.body || {};
       const data = await wxLogin(code, ctx.request.header["x-real-ip"] || '');
       ctx.body = data;
    } catch (error) {
        console.log("err",error)
    }

})

module.exports = router