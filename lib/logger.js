const fs = require('fs');
module.exports = (data)=>{

    if(!data) return;
    if("object" === typeof data) {
        data = JSON.stringify(data)
    }
    const folder = `${process.cwd()}/logs`;

    if(!fs.existsSync(folder)){
        fs.mkdirSync(folder);
    }

    data = `[${new Date().toLocaleString()}]: ${data}`+"\r\n";
    fs.appendFile(`${folder}/${new Date().toLocaleDateString()}.txt`,data),(err)=>{
        if(err) {
            console.log('The "data to append" was appended to file!');
        }
    };
}