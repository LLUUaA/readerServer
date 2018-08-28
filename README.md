# reader
技术栈：nodejs + koa , koa-router, temme

1.负责抓取小说及解析小说内容，并且提供接口 （抓取网站：https://www.xiashu.la/）

2.html --解析使用temme [git地址](https://github.com/shinima/temme) 安装  npm install temme 

3.iconv --Pure JS character encoding conversion [git地址](https://github.com/ashtuchkin/iconv-lite)

# tips
1.更新时注意 app.js ->authMidWare
2.routes/account.js ->wxLogin
3.routes/book.js ->historyRecord
4.routes/book.js ->searchRecord