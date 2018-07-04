// const iconv = require("iconv-lite");  
const { host } = require('./config.json');
const HTTP = require('http');
const HTTPS = require('https');
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

            const postData = JSON.stringify(opt.data || {});

            var options = Object.assign({
                hostname: host.hostname,
                method: 'GET',
                path: opt.url || opt.path,
                port: host.port,
                headers: {
                    "Content-Type": 'application/json',
                    "Content-Length": postData.length
                },        
                agent: false
            }, opt)
            
            // if( options.method==="get" || options.method==="GET") {
            //     options.path = 
            // }

            // console.log('options',options);
            const req = reqHttp.request(options, (res) => {
                // console.log('状态码：', res.statusCode);
                // console.log('请求头：', res.headers);
                var buff = "",
                    isBuffer = false,
                    result,
                    size = 0;
                res.on('data', (data) => {
                    // console.log('data', data);
                    if (!isBuffer && Buffer.isBuffer(data)) {
                        isBuffer = true;
                    }

                    buff += data;
                    size += data.length;
                })
                res.on("end", function () {
                    // var buff = Buffer.concat(datas, size);  
                    // var result = iconv.decode(buff, "utf8");//转码//var result = buff.toString();//不需要转编码,直接tostring  
                    // var result = buff.toString();
                    result = isBuffer ? buff.toString() : buff;
                    resolve(result);
                    // process.stdout.write('req end');
                });
            });
            req.write(postData);
            req.on('error', (e) => {
                reject(e);
                console.error(e);
            });
            req.end();
        })
    },

    getHtml(url) {
        const reqHttp = isHttps ? HTTPS : HTTP;
        var buff = "", isBuffer = false, result;
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