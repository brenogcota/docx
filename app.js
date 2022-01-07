const express = require("express")
const check_host = require("./middlewares")

const app = express()

app.set('view engine', 'ejs');

app.use(check_host)

app.get('/', (req, res) => {
    res.render('index')
})

app.listen(3000, function() {
    console.log('running..')
})