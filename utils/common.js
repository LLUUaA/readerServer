const word = 'A_1_B_2_C_3_D_4_E_5_F_6_G_7_H_8_I_9_J_0'.split('_');
// const crypto = require('crypto');
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
module.exports = {
    /**
     * 
     * @param {生成token长度} len 
     * @returns {token} token
     */
    generateToken(len = 20) {
        let token = '';
        // let md5 = crypto.createHash('md5');
        for (let i = 0; i < len; i++) {
            token += word[getRandomInt(0, 19)]
        }
        // return md5.update(token).digest('hex'); //32 位
        return token
    },

    /**
     * 
     * @param {是否返回时间戳} timestamp
     * @returns { time } time
     */
    getLocalTime(timestamp = false) {
        return timestamp ? Math.round(Date.now() / 1000) : new Date().toLocaleString();
    },

    /**
     * 
     * @desc   判断是否为邮箱地址
     * @param  {String}  str
     * @return {Boolean} 
     */
    isEmail(str) {
        return /\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(str);
    },
    /**
     * 
     * @desc   判断是否为手机号
     * @param  {String|Number} str 
     * @return {Boolean} 
     */
    isPhoneNum(str) {
        return /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/.test(str)
    },

    /**
     * 
     * @desc  判断是否为身份证号
     * @param  {String|Number} str 
     * @return {Boolean}
     */
    isIdCard(str) {
        return /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])((\d{4})|\d{3}[Xx])$)$/.test(str)
    },
    /**
     * 
     * @desc 生成指定范围随机数
     * @param  {Number} min 
     * @param  {Number} max 
     * @return {Number} 
     */
    randomNum(min, max) {
        return Math.floor(min + Math.random() * (max - min));
    },
    /**
     * 
     * @desc   判断是否为URL地址
     * @param  {String} str 
     * @return {Boolean}
     */
    isUrl(str) {
        return /[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/i.test(str);
    },

    /**
     * @author wqs
     * @description 参数解析
     * @param { String } url 
     * @return { Object }
     */
    getUrlParam(url) {
        var name, value, param = {};
        var str = url//取得整个地址栏
        var num = str.indexOf("?");
        str = str.substr(num + 1); //取得所有参数   stringvar.substr(start [, length ]
        var arr = str.split("&"); //各个参数放到数组里

        for (var i = 0; i < arr.length; i++) {
            num = arr[i].indexOf("=");
            if (num > 0) {
                name = arr[i].substring(0, num);
                value = arr[i].substr(num + 1);
                param[name] = value;
            }
        }

        return param;
    },

    /**
     * @author wqs
     * @description 获取路由
     * @param { String } url 
     * @return { Array }
     */
    getRout(url) {
        if (!url) return false;
        var route;
        route = url.split('/');
        route.splice(0, 1);//删除第一个空位
        route[route.length-1] = route[route.length-1].split('?')[0];
        return route;
    }
}