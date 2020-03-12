const {
    getWxData
} = require('../utils/wxDecrypt/wxDecrypt');
const {
    find,
    add,
    update
} = require('../utils/mysql');
const {
    getLocalTime,
    getPasswordSha1
} = require('../utils/common');
// const jwt = require('jsonwebtoken');
const {
    getSession
} = require('../Controller/sessionController');


async function isExitUser(openid) {
    const [user] = await find('user', `openid='${openid}'`, '*', '', 1);
    if (user) {
        return user.id;
    }
    return null;
}

/**
 * @description 新增用户
 * @param {object} userData 
 */
function addUser(userData) {

    const key = '.@o0o0o0o0o0@.';
    return add('user', {
        openid: userData.openid,
        nick_name: '',
        password: getPasswordSha1(userData.openid, key),
        register_time: getLocalTime(false),
        login_time: getLocalTime(false),
        login_ip: userData.ip,
        status: 1
    })
}

function deleteUser() {

}

/**
 * @param {object} userData
 * @description 暂时没有用户信息，只有openid 没有获取用户信息
 */
function updateUser(userData) {
    update('user', {
        nick_name: '',
        login_time: getLocalTime(false),
        login_ip: userData.ip
    }, `id=${userData.userId}`)
}

async function wxLogin(code, ip) {
    const { openid } = await getWxData(code);
    const userId = await isExitUser(openid);
    if (userId) {
        await updateUser({  ip,  userId });
        const session = await getSession(userId);
        return {
            session
        };
    }

    const user = await addUser({ openid, ip });
    const session = await getSession(user.insertId);
    return {
        session
    };
}

module.exports = {
    wxLogin
}