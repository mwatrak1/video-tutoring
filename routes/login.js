const express = require("express")
const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy;

const loginRouter = express.Router()

loginRouter.get("/logowanie", function (req, res) {
    if (req.isAuthenticated()) {
      res.redirect("/znajdzKorepetytora")
    } else {
      res.render("logowanie", { logged: false });
    }
})
  
loginRouter.post(
"/logowanie",
passport.authenticate("local", {
    successRedirect: "/znajdzKorepetytora",
    failureRedirect: "/logowanie",
}),
function (req, res, info) {
    console.log(info)
    res.send(info)
}
);
  
  
  
loginRouter.get("/wyloguj", function (req, res) {
    req.logout()
    res.redirect("/logowanie")
});

module.exports = loginRouter