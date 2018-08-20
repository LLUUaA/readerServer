/**
 * body parser (基础版，只针对json)
 */

const logger = require('../lib/logger');
module.exports = async function (ctx, next) {

    const parse = () => {
        return new Promise((resolve, reject) => {
            try {
                const method = (ctx.request.method).toLowerCase();
                if (method === 'post' || method === 'put') {
                    const req = ctx.req;
                    let data = '';

                    req.on('data', (buffer) => {
                        // data
                        // console.log('buffer', buffer);
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
                        logger(error,'log');
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
