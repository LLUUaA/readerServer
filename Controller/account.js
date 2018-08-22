const { getWxData } = require('../utils/wxDecrypt/wxDecrypt');
const { query } = require('../utils/mysql');
function wxLogin(code) {
    return new Promise((resolve,reject)=>{
        query();
        getWxData(code).then(res=>{
            resolve(JSON.parse(res).openid);
        },resolve);
    })
}

module.exports = {
    wxLogin
}