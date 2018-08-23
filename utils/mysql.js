
// function Mysql() {
//     this.connection;
// }
// /**
//  * 
//  * @param {条件} query 
//  * @param {参数} params 
//  * @param {自动end连接} autoEnd 
//  */
// Mysql.prototype.query = function (query, params = {}, autoEnd = false) {
//     return new Promise((resolve, reject) => {
//         const mysql = require('mysql');
//         const config = require('./config.json');
//         this.connection = mysql.createConnection(config.mysql);
//         this.connection.connect();
//         this.connection.query(query, params, function (error, results, fields) {
//             if (error) throw error; //to do 开发用
//             // if (error) {
//             //     return reject(error);
//             // }

//             resolve(results);
//             if (true === autoEnd) {
//                 this.connection.end(); 
//             }
//         });
//     })
// }
// Mysql.prototype.end = function () {
//     try {
//         this.connection.end();
//     } catch (error) {
//         throw error; // to do
//     }

// }

// module.exports = Mysql

const mysql = require('mysql');
const config = require('./config.json');
const pool = mysql.createPool(config.mysql);
const logger = require('../lib/logger');
let connection;

function rTrim(c) {
    if (!c) {
        c = ' ';
    }
    var reg = new RegExp('([' + c + ']*$)', 'gi');
    return this.replace(reg, '');
}


function connect() {
    return new Promise((resolve, reject) => {
        if (connection) {
            return resolve();
        }
        pool.getConnection(function (err, con) {
            if (err) {
                reject(err);
                logger(err, 'error');
                return;
            }
            connection = con;
            resolve();
        })
    })
}

function end() {
    connection.end();
    connection = null;
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
    return whereStr ? `WHERE ${whereStr}` : '';//whereStr 加上 '',否则会报错。
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
    } else if (limit && limitType === 'string') {
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
    let fieldsStr = '';
    const fieldsType = typeof fields;
    if (Array.isArray(fields)) {
        fieldsStr = fields.join(',');
    } else if (fields && fieldsType === 'string') {
        fieldsStr = fields;
    }

    return fieldsStr;
}

/**
 * @description 执行查询
 * @param {string} sql 
 */
function execute(sql) {
    return new Promise((resolve, reject) => {
        console.log('sql', sql);
        connect().then(() => {
            connection.query(sql, function (error, results, fields) {
                /**
                 * results 查询结果
                 * fields 数据字段显示 FieldPacket->name
                 * [FieldPacket {
                        catalog: 'def',
                        db: 'reader',
                        table: 'user',
                        orgTable: 'user',
                        name: 'id',
                        orgName: 'id',
                        charsetNr: 63,
                        length: 10,
                        type: 3,
                        flags: 16899,
                        decimals: 0,
                        default: undefined,
                        zeroFill: false,
                        protocol41: true }
                    ]
                 */
                connection.release();//释放
                if (error) {
                    reject(error);
                    return;
                }
                resolve(results, fields);
            });
        })
            .catch(logger)
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
            data.push(`'${datas[key]}'`);
        }

        values = values.join(',');
        data = data.join(',');
    } else {
        data = datas;
    }

    const sql = `INSERT INTO ${table} (${values}) VALUES (${data})`;
    return execute(sql)
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
    for(let key in datas) {
        data += `${key}='${datas[key]}',` 
    }
    data = rTrim(data);
    const sql = `UPDATE ${table} SET ${data} ${parseWhere}`; 
    return execute(sql)
}

function deleteRow() {

}

module.exports = {
    find,
    add,
    update,
    deleteRow
}