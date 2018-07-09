var Koa = require('koa');
var app = new Koa();
const cros = require('./middleware/cros');
const response = require('./middleware/response');
const enterRouter = require('./routes/index');

app.use(cros);//解决跨域 middleware
app.use(response);//处理响应 middlewar

app.use(enterRouter.routes()).use(enterRouter.allowedMethods());
app.listen(3000);