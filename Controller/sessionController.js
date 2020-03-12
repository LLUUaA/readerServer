const {
    find,
    add,
    update
} = require('../utils/mysql');
const {
    generateToken,
    getLocalTime
} = require('../utils/common');
const expire_time = 1800;
/**
 * 
 * @param {number} userId 
 * @description 登陆获取session || 刷新session
 */
async function getSession(userId) {
    const [session] = await find('session', `user_id=${userId}`, '*', '', 1);
    const sessionKey = generateToken(16);
    if (session) {
        await update('session', {
            access_token: sessionKey,
            expire_time: getLocalTime() + expire_time,
            status: 1
        }, `user_id=${userId}`);
        return sessionKey;
    };
    await add('session', {
        user_id: userId,
        access_token: sessionKey,
        expire_time: getLocalTime() + expire_time,
        status: 1
    });
    return sessionKey;
}


/**
 * 
 * @param {string} session 
 * @description 检查session
 */
async function checkSession(session) {
    const [sessionData] = await find('session', `access_token='${session}' ORDER BY expire_time`, '', '', 1);
    if (!sessionData) {
        throw new Error("session error");
    }
    if (getLocalTime() > sessionData.expireTime) {
        //session 已过期||无效
        update('session', {
            status: 0
        }, `id=${sessionData.id}`)
        throw new Error("session is expired");
    }

    return {
        userId: sessionData.user_id
    }
}

module.exports = {
    checkSession,
    getSession
}