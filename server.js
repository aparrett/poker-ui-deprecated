const express = require('express')
const compression = require('compression')
const path = require('path')
const app = express()
const port = process.env.PORT || 3000

/* 
    This file is only used in production. In your local, the app is served from the Vue CLI.
*/

app.use(compression())

// Use express to serve up assets
app.use(express.static('dist'))

app.get('*', (req, res) => {
    res.sendFile(path.resolve('dist', 'index.html'))
})

app.listen(port)
