const data = require("./data.json")

function check_host(req, res, next) {
    const host = req.headers.host.split(':')[0]
    const subdomain = host.split('.')[0]

    const account = data.accounts.find(item => item.domain === subdomain)

    if(!account) res.status(404).json({ message: 'Account not found' })

    req.subdomain = subdomain
    next()
}

module.exports = check_host