

// const Mysql = {
//     connect() {

//     },
//     // 'SELECT * FROM mytest.user'
//     query(query, params = {}) {
//         return new Promise((resolve, reject) => {
//             const mysql = require('mysql');
//             const config = require('./config.json');
//             var connection = mysql.createConnection(config.mysql);
//             connection.connect();
//             connection.query(query, params, function (error, results, fields) {
//                 if (error) throw error; //to do 开发用
//                 // if (error) {
//                 //     return reject(error);
//                 // }

//                 // console.log('The solution is: ', results);
//                 // console.log('The solution typeof: ', typeof (results));
//                 resolve(results);

//             });
//             connection.end();
//         })
//     },

//     end() {

//     }
// }
function Mysql() {
    this.connection;
}
/**
 * 
 * @param {条件} query 
 * @param {参数} params 
 * @param {自动end连接} autoEnd 
 */
Mysql.prototype.query = function (query, params = {}, autoEnd = false) {
    return new Promise((resolve, reject) => {
        const mysql = require('mysql');
        const config = require('./config.json');
        this.connection = mysql.createConnection(config.mysql);
        this.connection.connect();
        this.connection.query(query, params, function (error, results, fields) {
            if (error) throw error; //to do 开发用
            // if (error) {
            //     return reject(error);
            // }

            // console.log('The solution is: ', results);
            resolve(results);
            if (true === autoEnd) {
                this.connection.end(); 
            }
        });
    })
}
Mysql.prototype.end = function () {
    try {
        this.connection.end();
    } catch (error) {
        throw error; // to do
    }

}


module.exports = Mysql




// export class Mysql {

//     sql;
//     constructor(){
//         console.log('sql',this.sql);
//     }


//     _connect(){

//     }

//     query(query){

//     }

//     end(){

//     }

// }