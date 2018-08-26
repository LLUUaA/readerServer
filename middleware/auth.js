/**
 * body parser (基础版，只针对json)
 */

const logger = require('../lib/logger');
const { checkSession } = require('../Controller/sessionController');

function isCheckAuth(api) {
    if(!api) return false;
    const index = api.indexOf('?');
    api = index>0 ? api.substr(0, index) : api;
    const allowList = [
        '',
        '/book/getConfig',
        '/account/wxLogin'
    ];
    return allowList.indexOf(api) >= 0 ? false : true;
}

module.exports = async function (ctx, next) {
    const parseSession = () => {
        return new Promise((resolve, reject) => {
            const authorization = ctx.request.header['authorization'];
            const session = authorization ? authorization.split(' ')[1] : '';
    
            if (!isCheckAuth(ctx.request.url || '')) {
                return resolve();
            }
            checkSession(session)
                .then(sessionData => {
                    if (!ctx.request.body) ctx.request.body = {};
                    ctx.request.body = Object.assign(ctx.request.body, sessionData);
                    resolve();
                }, err => {
                    ctx.status = 401;
                    ctx.body = 'Unauthorized';
                    reject('Unauthorized');
                })
        })
    }

    await parseSession();
    await next();
}
