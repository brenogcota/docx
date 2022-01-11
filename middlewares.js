const config = require("./config")
const messages = require("./messages")


function appConfig (req, res, next) {
    req.appConfig = config;
    req.messages = messages

    next()
}

module.exports = {
    appConfig
}