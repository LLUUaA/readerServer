const { getWxData } = require('../utils/wxDecrypt/wxDecrypt');
const { find,add ,update} = require('../utils/mysql');
const { getLocalTime } = require('../utils/common');

function isExitUser(openid) {
    return new Promise((resolve,reject)=>{
        find('user',`openid='${openid}'`,'*','',1)
        .then(res=>{
            console.log(223,res.length);
            if(res&&res.length) {
                resolve()
            }else {
                reject()
            }
        },err=>{
            // throw new isExitUser(err); 
        })
    })
}

/**
 * @description 新增用户
 * @param {object} userData 
 */
function addUser(userData) {
    // INSERT INTO `reader`.`user` (`openid`, `nick_name`, `register_time`, `login_time`, `login_ip`, `status`) VALUES ( '1', 'admin', NULL, NULL, '0.0.0.0', '1');

    // console.log('userData',userData);
    // userData.nick_name = '';
    // userData.register_time = getLocalTime(true);
    // userData.login_time = getLocalTime(true);
    // userData.status = 1;
    add('user',{
        openid:userData.openid,
        nick_name:'',
        register_time:getLocalTime(true),
        login_time:getLocalTime(true),
        login_ip:userData.ip,
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
    update('user',{
        nick_name:'',
        login_time:getLocalTime(true),
        login_ip:userData.ip
    })
}

function wxLogin(code, ip) {
    return new Promise((resolve, reject) => {
        getWxData(code).then(res => {
            const openid = JSON.parse(res).openid;
            isExitUser(openid)
                .then(res => {
                    updateUser({ ip });
                },err=>{
                    addUser({ openid, ip })
                })
            resolve(openid);
        }, resolve);
    })
}

module.exports = {
    wxLogin
}