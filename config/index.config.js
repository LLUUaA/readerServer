const envKeys = {
    development: "dev",
    production: "prod"
}

console.log("READER SERVER NODE_ENV", process.env.NODE_ENV);
const NODE_ENV = process.env.NODE_ENV || "production"; // env
const configs = require(`./${envKeys[NODE_ENV]}.config`); // configs
module.exports = configs;
