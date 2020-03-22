const {
    getWxData
} = require('../utils/wxDecrypt/wxDecrypt');
const {
    find,
    add,
    update,
    sql: Sql
} = require('../utils/mysql');
const {
    getLocalTime,
    getPasswordSha1
} = require('../utils/common');
// const jwt = require('jsonwebtoken');
const {
    getSession
} = require('../Controller/sessionController');


/**
 * 
 * @param {string} openidOrDeviceId 
 * @param {boolean} isOpenid <true> 是否是weixin openid
 */
async function isExitUser(openidOrDeviceId, isOpenid = true) {
    // const [user] = await find('user', `${isOpenid ? 'openid' : 'device_id'}='${openid}'`, '*', '', 1);
    const whereStr = `u.${isOpenid ? 'openid':'device_id'}='${openidOrDeviceId}'`;
    const [userInfo] = await Sql(`SELECT u.id, s.access_token FROM user as u INNER JOIN session AS s ON u.id = s.user_id WHERE ${whereStr}`);
    if (userInfo) {
        return userInfo;
    }
    return null;
}

/**
 * @description 新增用户
 * @param {object} userData 
 */
function addUser(userData) {
    const key = '.@o0o0o0o0o0@.';
    const datas = {
        nick_name: '',
        password: getPasswordSha1(userData.openid, key),
        register_time: getLocalTime(false),
        login_time: getLocalTime(false),
        login_ip: userData.ip,
        is_weixin: userData.is_weixin,
        status: 1
    };
    if (userData.openid) {
        datas.openid = userData.openid;
    } else {
        datas.device_id = userData.device_id;
    }
    return add('user', datas)
}

function deleteUser() {

}

/**
 * @param {object} userData
 * @description 暂时没有用户信息，只有openid 没有获取用户信息
 */
function updateUser(userId, ip) {
    update('user', {
        login_time: getLocalTime(false),
        login_ip: ip
    }, `id=${userId}`)
    .catch(err=>{ });
}

// login
async function login(openidOrDeviceId, ip, isOpenid = true) {
    const userInfo = await isExitUser(openidOrDeviceId, isOpenid);
    if (userInfo) {
        updateUser(userInfo.id, ip);
        return {
            session: userInfo.access_token
        };
    }

    const addDatas = {
        ip,
    };

    if (isOpenid) {
        addDatas.openid = openidOrDeviceId;
        addDatas.is_weixin = 1;
    } else {
        addDatas.device_id = openidOrDeviceId;
        addDatas.is_weixin = 0;
    }
    const user = await addUser(addDatas);
    const session = await getSession(user.insertId);
    return {
        session
    };
}

/**x
 * @param {string} code 
 * @param {string} ip 
 */
async function wxLogin(code, ip) {
    const { openid } = await getWxData(code);
    if(!openid) {
        throw Error("code Error");
    }
    return await login(openid, ip);
}

/**
 * @param {string} deviceId 
 * @param {string} ip
 * @description 普通登陆 
 */
async function deviceLogin(deviceId, ip) {
    const res = await login(deviceId, ip, false);
    return res;
}

module.exports = {
    wxLogin,
    deviceLogin
}