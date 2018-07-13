
(() => {
    const runSpider = require('./lib/spiderBook');
    const logger = require('./lib/logger');
    logger('runSpider','log')
    runSpider();
})();