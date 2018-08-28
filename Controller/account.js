const { getWxData } = require('../utils/wxDecrypt/wxDecrypt');
const { find, add, update } = require('../utils/mysql');
const { getLocalTime, getPasswordSha1 } = require('../utils/common');
// const jwt = require('jsonwebtoken');
const { getSession } = require('../Controller/sessionController');


function isExitUser(openid) {
    return new Promise((resolve, reject) => {
        find('user', `openid='${openid}'`, '*', '', 1)
            .then(res => {
                const { results } = res;
                if (results && results.length) {
                    resolve(results[0].id);
                } else {
                    reject()
                }
            }, err => {
                new Error(err);
            })
    })
}

/**
 * @description 新增用户
 * @param {object} userData 
 */
function addUser(userData) {
    // INSERT INTO `reader`.`user` (`openid`, `nick_name`, `register_time`, `login_time`, `login_ip`, `status`) VALUES ( '1', 'admin', NULL, NULL, '0.0.0.0', '1');

    // userData.nick_name = '';
    // userData.register_time = getLocalTime(true);
    // userData.login_time = getLocalTime(true);
    // userData.status = 1;
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
    })
}
 
function  wxLogin(code, ip) {
    return new Promise((resolve, reject) => {
        getWxData(code).then(res => {
            const openid = JSON.parse(res).openid;
            isExitUser(openid)
                .then(userId => {
                    updateUser({ ip });
                    getSession(userId)
                    .then(session=>resolve({session}))
                }, err => {
                    addUser({ openid, ip })
                    .then(res=>{
                        const { results } = res;
                        getSession(results.insertId)
                        .then(session=>resolve({session}))
                    },new Error)
                })

        }, resolve);
    })
}

module.exports = {
    wxLogin
}