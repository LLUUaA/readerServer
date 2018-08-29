const { find, add, update } = require('../utils/mysql');
const { generateToken, getLocalTime } = require('../utils/common');
const expire_time = 1800; 
/**
 * 
 * @param {number} userId 
 * @description 登陆获取session || 刷新session
 */
function getSession(userId) {
    return new Promise((resolve, reject) => {
        find('session', `user_id=${userId}`)
            .then(res => {
                const { results } = res,
                    sessionKey = generateToken(16);
                if (!results.length) {
                    // 1800 ==30 min==0.5h
                    add('session', {
                        user_id: userId,
                        access_token: sessionKey,
                        expire_time: getLocalTime() + expire_time,
                        status: 1
                    }).then(() => {
                        resolve(sessionKey);
                    }, reject)
                } else {
                    update('session', {
                        access_token: sessionKey,
                        expire_time: getLocalTime() + expire_time,
                        status: 1
                    },`user_id=${userId}`).then(() => {
                        resolve(sessionKey);
                    }, reject)
                }
            })
    })
}

/**
 * 
 * @param {string} session 
 * @description 检查session
 */
function checkSession(session) {
    return new Promise((resolve, reject) => {
        find('session', `access_token='${session}' ORDER BY expire_time`)
            .then(res => {
                const { results } = res;
                const sessionData = results[0] || false;

                if (!sessionData
                    || sessionData.status === 0
                ) {
                    reject({
                        msg: 'session error'
                    });
                    return;
                }
                if (getLocalTime() > sessionData.expire_time) {
                    //session 已过期||无效
                    reject({
                        msg: 'session is expired'
                    });
                    update('session', {
                        status: 0
                    },`id=${sessionData.id}`)
                    return;
                }
                resolve({
                    userId: sessionData.user_id
                })
            }, err = {

            })
    })
}

module.exports = {
    checkSession,
    getSession
}