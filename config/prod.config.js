module.exports = {
    mysql: {
        host: "localhost",
        port: "3306",
        user: "",
        password: "",
        database: "reader",
        connectionLimit: 10
    },
    request: {
        hostname: "localhost",
        port: null,
        agent: false
    },
    version: "v1.0.0",
    spider: {
        baseUrl: "www.xiashu.cc",
        mobileBaseUrl: "m.xiashu.cc"
    },
    wxConfig: {
        AppID: "",
        AppSecret: ""
    }
}