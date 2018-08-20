const { getWxData } = require('../utils/wxDecrypt/wxDecrypt');
function wxLogin(code) {
    return new Promise((resolve,reject)=>{
        getWxData(code).then(res=>{
            resolve(JSON.parse(res).openid);
        },resolve);
    })
}

module.exports = {
    wxLogin
}