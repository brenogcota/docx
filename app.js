const express = require("express")
const { docs } = require("./util");
const { appConfig } = require("./middlewares")

const app = express()

app.set('view engine', 'ejs');

app.use(appConfig)

app.get('/_json/docs', async (req, res) => {
    const data = await docs('docs')
    res.json(data)
})

app.get('/', async (req, res) => {
    const data = await docs('docs')
    res.render('index', { ...data, ...req.appConfig, ...req.messages })
})

app.get('/:slug', async (req, res) => {
    const { slug } = req.params
    const data = await docs('docs', slug)
    res.render('index', { ...data, ...req.appConfig, ...req.messages })
})

app.listen(3000, function() {
    console.log('running..')
})