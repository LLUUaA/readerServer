var Router = require('koa-router');
var router = new Router();


router.get('/', async (ctx, next) => {
    const { checkFile } = require('../lib/fs');
    
    ctx.body = { test: 'test  ' + checkFile(2,3) }
})

module.exports = router