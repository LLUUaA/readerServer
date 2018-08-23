
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

//             // console.log('The solution is: ', results);
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

function connect() {
    return new Promise((resolve, reject) => {
        if(connection) {
            return resolve();
        }
        pool.getConnection(function (err, con) {
            // console.log(err,con);
            if (err) {
                reject(err);
                logger(err,'error');
                return;
            }
            connection = con;
            resolve();
        })
    })
}

function query(query, params = {}, autoEnd = true) {
    return new Promise((resolve, reject) => {
        connect().then(res => {
            connection.query(query, params, function (error, results, fields) {
                // When done with the connection, release it.
                connection.release();
                // Handle error after the release.
                if (error) {
                    reject(error);
                    logger(error,'error');
                    return;
                };
                // Don't use the connection here, it has been returned to the pool.
                resolve(results);
                if (true === autoEnd) {
                    connection.end();
                }
            });
        })
            .catch(err => {

            })
    })

}


module.exports = {
    query
}