module.exports = (data)=>{

    if(!data) return;
    if("object" === typeof data) {
        data = JSON.stringify(data)
    }

    const fs = require('fs');
    const folder = `${process.cwd()}/logs`;

    if(!fs.existsSync(folder)){
        fs.mkdirSync(folder);
    }

    data = `[${new Date().toLocaleString()}]: ${data}`+"\r\n";
    fs.appendFile(`${folder}/${new Date().toLocaleDateString()}.txt`,data);
}