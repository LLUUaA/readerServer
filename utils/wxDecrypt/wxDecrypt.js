const { wxConfig } = require('../../config/index.config');
/**
 * 
 * @param {String} code -wxLogin code
 */
function getWxData(code) {
	const { request } = require('../request');
	return request({
		hostname: "api.weixin.qq.com",
		url: `/sns/jscode2session?appid=${wxConfig.AppID}&secret=${wxConfig.AppSecret}&js_code=${code}&grant_type=authorization_code`
	})
}

module.exports = {
	decryptWx(login) {
		return new Promise((resolve, reject) => {
			getWxData(login.code)
				.then(session => {
					const WXBizDataCrypt = require('./WXBizDataCrypt');
					var pc = new WXBizDataCrypt(wxConfig.AppID, session.session_key);
					var data = pc.decryptData(login.encryptedData, login.iv);
					data.sessionKey = session.session_key;
					resolve(data);
					// console.log('解密后 data: ', data)
				})
				.catch(err => {
					reject(err);
				})
		})
	},

	getWxData
}