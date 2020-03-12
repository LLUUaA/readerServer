const { request: requestConfig } = require("../config/index.config");
const HTTP = require('http');
const HTTPS = require('https');
const logger = require('../lib/logger');
const iconv = require('iconv-lite');
const querystring = require('querystring');
/**
 * @description hostname不能带协议(http|https) 自带http、https请求，否则报错。
 *              如果是string eg:https://wwww.google.com 则可以带协议
 */
module.exports = {
    /**
     * 
     * @param {请求参数} opt 
     * @param {是否是https 默认true} https 
     */
    request(opt, isHttps = true) {
        return new Promise((resolve, reject) => {
            const reqHttp = isHttps ? HTTPS : HTTP;
            var options = Object.assign({
                hostname: requestConfig.hostname,
                method: 'get',
                path: opt.url || opt.path,
                port: requestConfig.port,
                headers: {
                    "Content-Type": 'application/json',
                },
                agent: false
            }, opt)

            let postData;
            const method = options.method.toLocaleLowerCase();
            if(options.mode === "query") {
                postData = querystring.stringify(options.data || {});
            } else if (method === 'post') {
                postData = JSON.stringify(options.data || {});
                options.headers["Content-Length"] = Buffer.byteLength(postData)
            } else if (method === "get") {
                if ("object" === typeof options.query) {
                    options.path += `?${querystring.stringify(options.query)}`;
                }
            }
            // console.log('options', options);
            const req = reqHttp.request(options, (res) => {
                // console.log('状态码：', res.statusCode);
                // console.log('请求头：', res.headers);
                var datas = [];
                var size = 0;
                res.on('data', (data) => {
                    datas.push(data);
                    size += data.length;
                });
                res.on("end", function () {
                    const buff = Buffer.concat(datas, size);
                    var result = iconv.decode(buff, "utf8"); //转码
                    //var result = buff.toString();//不需要转编码,直接tostring  
                    try {
                        result = JSON.parse(result);
                    } catch (error) {

                    }
                    resolve(result);
                })
            });

            req.on('error', (e) => {
                req.destroy();
                logger(e);
                reject(e);
            });
            if (postData) {
                req.write(postData);
            }
            req.end();
        })
    },

    getHtml(url) {
        const reqHttp = isHttps ? HTTPS : HTTP;
        var buff = "",
            isBuffer = false,
            result;
        reqHttp.get(url, function (res) {
            res.on('data', function (data) {
                if (!isBuffer && Buffer.isBuffer(data)) {
                    isBuffer = true;
                }
                buff += data;
            }).on("end", function () {
                result = isBuffer ? buff.toString() : buff;
            });
        });
    }
}

/**
 * @description https.get
 *         const req = https.get(reqOptions, (res) => {
            // ..
            var datas = [];
            var size = 0;
            res.on('data', (data) => {
                datas.push(data);  
                size += data.length;  

                // console.log('data', res)
            })
            res.on("end", function () {  
                var buff = Buffer.concat(datas, size);  
                // var result = iconv.decode(buff, "utf8");//转码//var result = buff.toString();//不需要转编码,直接tostring  
                var result = buff.toString();
                console.log(result);  
            }); 

        }).on('error', (err) => {
            console.error('error', err)
        })
        req.end()
 */