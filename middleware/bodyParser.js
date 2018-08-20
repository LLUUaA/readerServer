/**
 * body parser (基础版，只针对json)
 */

const logger = require('../lib/logger');

function isAllowType(contentType) {
    const allowList = [
        'application/json'
    ];
    return allowList.indexOf(contentType) >= 0 ? true : false;
}
module.exports = async function (ctx, next) {

    const parse = () => {
        return new Promise((resolve, reject) => {
            try {
                const method = (ctx.request.method).toLowerCase();
                const contentType = ctx.request.header['content-type'];

                if ((method === 'post' || method === 'put') && isAllowType(contentType)) {
                    const req = ctx.req;
                    let data = '';
                    req.on('data', (buffer) => {
                        // data
                        data += buffer;
                    })

                    req.on('end', async () => {
                        // end 
                        if (!ctx.request.body) ctx.request.body = {};
                        ctx.request.body = Object.assign(ctx.request.body, JSON.parse(data.toString()));
                        resolve();
                    })

                    req.on('error', async () => {
                        // error 
                        logger(error, 'log');
                        ctx.request.body = {};
                        resolve();
                    })
                } else {
                    resolve();
                }
            } catch (error) {
                // reject(error);
                logger(error);
                resolve();
            }
        })
    }

    await parse();
    await next();
}
