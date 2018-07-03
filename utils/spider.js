const temme = require('temme').default; //or import temme from 'temme'
const { getHtml, request } = require('./request');
function getHome() {
    return new Promise((resolve, reject) => {
        request({
            hostname: 'www.xiashu.la',
            port: 443
        })
            .then(res => {
                const html = res;
                var homeDatas;
                const selector = `.free_book_list .lists li@list {a[href=$href];}`;
                homeDatas = temme(html,selector);
                resolve(homeDatas);
            }, err => {
                reject(err);
                throw error(err);
            })
    })
}

module.exports = {
    getHome
}