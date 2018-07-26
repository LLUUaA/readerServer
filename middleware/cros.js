/**
 * 跨域处理模块
 */
module.exports = async function (ctx, next) {
    try {
        /**
         * @description 获取是否跨域
         * @return {Boolean} 
         */
        const getCrosStatus = (url) => {
            const urlList = [
                'http://localhost:8080',
                'http://192.168.66.100:8080'
            ];
            return urlList.indexOf(url) >= 0 ? true : false;
        }

        // 调用下一个 middleware
        await next();
        const origin = ctx.header.origin;
        if (getCrosStatus(origin)) {
            /**
             * 跨域解决
             */
            ctx.set('Access-Control-Allow-Origin', origin);

            if(ctx.path== '/api/file') ctx.set('Access-Control-Allow-Headers','Content-Range')//file upload
            // ctx.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, DELETE, PUT');
            ctx.set('Access-Control-Allow-Methods', 'POST, GET');
            // ctx.set('Access-Control-Max-Age', 1000);
            // ctx.set('Access-Control-Allow-Headers', 'RIDER-APPID, RIDER-APPKEY');
        }
    } catch (e) {
        // 输出详细的错误信息
        ctx.body = {
            code: -1,
            error: e && e.message ? e.message : e.toString()
        }
    }
}
