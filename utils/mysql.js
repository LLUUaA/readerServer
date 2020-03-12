const mysql = require('mysql');
const config = require("../config/index.config");
const logger = require('../lib/logger');
const TYR_TIMES = 2;
const RELEASE_TIMES = 1000 * 60 * 30; // 30 min
let pool = null,
    taskTimer = null, // 任务定时器
    errTimes = 0; // query查询错误次数

function rTrim(str, c) {
    if (!c) {
        c = ' ';
    }
    var reg = new RegExp('([' + c + ']*$)', 'gi');
    return str.replace(reg, '');
}

/**
 * @description 解析where
 * @param {string} where 
 */
function parseWhere(where) {
    let whereStr = '';
    if (where && 'string' === typeof where) {
        whereStr = where;
    }
    return whereStr ? `WHERE ${whereStr}` : ''; //whereStr 加上 '',否则会报错。
}

/**
 * @description 解析limit
 * @param {any} limit 
 */
function parseLimit(limit) {
    let limitStr = '';
    const limitType = typeof limit;
    if (Array.isArray(limit)) {
        if (limit.length > 1) {
            limitStr = ` LIMIT ${limit[0]},${limit[1]}`;
        } else {
            limitStr = ` LIMIT ${limit[0]}`
        }
    } else if (limit) {
        limitStr = `LIMIT ${limit}`;
    }

    return limitStr;
}

/**
 * @description 解析排序 order by
 * @param {any} order 
 */
function parseOrder(order) {
    let orderStr = '';
    const orderType = typeof order;
    if (Array.isArray(order)) {
        orderStr = ` ORDER BY ${order.join(',')}`;
    } else if (order && orderType === 'string') {
        orderStr = ` ORDER BY ${order}`;
    }

    return orderStr;
}

/**
 * @description 解析查询 fields
 * @param {any} fields 
 */
function parseFields(fields) {
    let fieldsStr = '*';
    const fieldsType = typeof fields;
    if (Array.isArray(fields)) {
        fieldsStr = fields.join(',');
    } else if (fields && fieldsType === 'string') {
        fieldsStr = fields;
    }

    return fieldsStr;
}


/**
 * @description释放连接池任务
 */
function releasePoolTask() {
    if (taskTimer) {
        clearTimeout(taskTimer);
        taskTimer = null;
    }
    taskTimer = setTimeout(() => {
        pool.end(function (err) {
            if (err) {
                return logger(err);
            }
            pool = null;
        }); // 关闭连接池

    }, RELEASE_TIMES);
}

/**
 * @description 执行查询
 * @param {string} sql 
 */
function execute(sql) {
    // console.log('sql', sql);
    return new Promise((resolve, reject) => {
        if (taskTimer) {
            clearTimeout(taskTimer);
            taskTimer = null;
        };
        if (!pool) {
            pool = mysql.createPool(config.mysql);
        }
        pool.getConnection(function (err, connection) {
            if (err) {
                reject({
                    code: -1,
                    msg: 'MYSQL Connect Error'
                })
                logger(err);
                return;
            }
            connection.query(sql, function (error, results) {
                connection.release(); //释放!!!
                if (!error) {
                    errTimes = 0;
                    resolve(results);
                    releasePoolTask();
                    return;
                }
                // 重试次数
                if (errTimes >= TYR_TIMES) {
                    return reject({
                        errno: error.errno,
                        msg: error.sqlMessage
                    })
                };
                ++errTimes;
                execute(sql).then(resolve, reject); //继续查询
                logger(error);
            });
        });
    })
}

/**
 * @description 查找
 * @param {string} table 
 * @param {string} where 
 * @param {string} fields 
 * @param {string} order 
 * @param {any} limit 
 */
function find(table, where = null, fields = '*', order = null, limit = null) {
    const sql = `SELECT ${parseFields(fields)} FROM ${table} ${parseWhere(where)} ${parseOrder(order)} ${parseLimit(limit)}`;
    return execute(sql)
}

/**
 * @description 添加
 * @param {object} table 
 * @param {any} data 
 */
function add(table, datas) {
    let values = [],
        data = [];
    if ('object' === typeof datas) {
        for (let key in datas) {
            // values += `${key},`;
            // data += `'${datas[key]},'`;
            values.push(key);
            data.push(`'${datas[key] ||''}'`);
        }

        values = values.join(',');
        data = data.join(',');
    }
    const sql = `INSERT INTO ${table} (${values}) VALUES (${data})`;
    return execute(sql)
}

function addRow(table, fields, datas) {
    const values = (datas || [])
        .map(v =>
            v.map(k => `'${k}'`)
            .join(','))
        .map(v => `(${v})`)
        .join(",");

    const sql = `INSERT INTO ${table} (${fields.join(',')}) VALUES ${values}`;

    return execute(sql);
}

/**
 * @description 更新
 * @param {string} table 
 * @param {any} data 
 * @param {string} where 
 * @param {string} order 
 * @param {any} limit 
 */
function update(table, datas, where = null, order = null, limit = null) {
    let data = '';
    for (let key in datas) {
        data += `${key}='${datas[key]}',`
    }
    data = rTrim(data, ',');
    const sql = `UPDATE ${table} SET ${data} ${parseWhere(where)}`;
    return execute(sql)
}

function deleteRow(table, where = null, order = null, limit = 0) {
    if (!where) return new Error('query error');
    const sql = `DELETE FROM ${table} ${parseWhere(where)} ${parseOrder(order)} ${parseLimit(limit)}`;
    return execute(sql)
}

function sql(sql) {
    return execute(sql);
}

module.exports = {
    find,
    add,
    addRow,
    update,
    delete: deleteRow,
    deleteRow,
    sql
}