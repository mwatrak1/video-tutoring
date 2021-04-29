const express = require("express")

const messsagesRouter = express.Router()

messsagesRouter.get('/wiadomosci', (req, res) => {
    if (req.isAuthenticated()) {
      res.render('wiadomosci', { logged: true })
    } else {
      res.render('logowanie', { logged: false })
    }
})

module.exports = messsagesRouter