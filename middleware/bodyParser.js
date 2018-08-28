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
                    let parseData = JSON.parse(data.toString());
                    if(Array.isArray(parseData)) {
                        // 如果传入的是数组
                        ctx.request.body = Object.assign(ctx.request.body, {_array:parseData} );
                    }else {
                        ctx.request.body = Object.assign(ctx.request.body,parseData );
                    }


  
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
        })
    }

    await parse();
    await next();
}
