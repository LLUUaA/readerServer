const fs = require('fs');
const LOG_TYPE = {
    error:'error',
    warming:'warming',
    log:'log'
}

/**
 * 
 * @param {any} data 
 * @param {string} type error
 */
module.exports = (data,type='error')=>{
    if(!data) return;
    if("object" === typeof data) {
        data = JSON.stringify(data)
    }
    const folder = `${process.cwd()}/logs`;
    const saveFolder = `${folder}/${LOG_TYPE[type]}`

    if(!fs.existsSync(folder)){
        fs.mkdirSync(folder);
    }

    if(!fs.existsSync(saveFolder)){
        fs.mkdirSync(saveFolder);
    }

    data = `[${new Date().toLocaleString()}]: ${data}`+"\r\n";
    fs.appendFile(`${saveFolder}/${new Date().toLocaleDateString().replace(/\//g,'-')}.txt`,data),(err)=>{
        if(err) {
            console.log('The "data to append" was appended to file!');
        }
    };
}
