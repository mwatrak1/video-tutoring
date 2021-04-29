const express = require("express")

const landingPageRouter = express.Router()


landingPageRouter.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        res.render("glowna", { logged: true })
    } else {
        res.render("glowna", { logged: false })
    }
})

module.exports = landingPageRouter