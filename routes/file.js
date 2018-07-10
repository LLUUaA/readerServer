var Router = require('koa-router');
var router = new Router();

router.get('/', async (ctx, next) => {
    const { write } = require('../lib/fs');
    // write()
    ctx.body = { test:'test  '+ new Date().toLocaleString() }
})

module.exports = router