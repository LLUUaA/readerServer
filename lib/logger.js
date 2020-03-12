const fs = require('fs');
const path = require("path");
const LOG_TYPE = {
    error: 'error',
    warming: 'warming',
    log: 'log'
}

/**
 * 
 * @param {any} data 
 * @param {string} type error
 */
module.exports = (data, type = 'error') => {
    try {
        if (!data) return;
        if ("object" === typeof data) {
            data = JSON.stringify(data)
        }
        const folder = path.join(__dirname,'../logs');
        const saveFolder = path.resolve(folder,LOG_TYPE[type]);

        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }

        if (!fs.existsSync(saveFolder)) {
            fs.mkdirSync(saveFolder);
        }
        data = `[${new Date().toLocaleString()}]: ${data}` + "\r\n";
        
        fs.appendFile(path.resolve(saveFolder,`${new Date().toLocaleDateString()}.txt`), data, (err) => {
            if (err) {
                console.log('The "data to append" was appended to file!');
            }
        });
    } catch (error) {
        if (error) {}
    }
}