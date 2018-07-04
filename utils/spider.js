const temme = require('temme').default; //or import temme from 'temme'
const { getHtml, request } = require('./request');
const { spider }  = require('./config.json');
function getHome() {
    return new Promise((resolve, reject) => {
        request({
            hostname: spider.baseUrl,
            port: 443
        })
            .then(res => {
                const html = res;
                /**
                 * @description hotBook 热门书籍 subMenu 分类菜单
                 *              maleMenu 男士分类菜单 femaleMenu 女士分类菜单
                 * 
                 */
                // a .infos img[src=$src]
                var hotBook,subMenu,maleMenu,femaleMenu;
                const selector = {
                    // todayHot: `.free_book_list .lists li@list {a[href=$href];}`,
                    todayHot: `.free_book_list .lists li@hotBook {a[href=$href];img[src=$coverImg];h3{$name}}`,
                    subMenu: `.subMenuCon .subMenu li@subMenu {li a[href=$href] {$subTxt};}`,
                    maleMenu: `.subMenuCon .subMenus .male li@maleMenu {a[href=$href] {$subTxt};}`,
                    femaleMenu: `.subMenuCon .subMenus .female li@femaleMenu {a[href=$href] {$subTxt};}`
                }
                hotBook = temme(html,selector.todayHot).hotBook;
                subMenu = temme(html,selector.subMenu).subMenu;
                maleMenu = temme(html,selector.maleMenu).maleMenu;
                femaleMenu = temme(html,selector.femaleMenu).femaleMenu;
                resolve({hotBook,subMenu,maleMenu,femaleMenu});
            }, err => {
                reject(err);
                throw error(err);
            })
            // getHome('www.xiashu.la');    
    })
}

module.exports = {
    getHome
}