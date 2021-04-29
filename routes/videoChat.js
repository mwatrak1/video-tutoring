const express = require("express")

const videoChatRouter = express.Router()

videoChatRouter.post("/wideokonferencja", function (req, res) {
    const dane = req.body;
    console.log("id przeciwnej osoby ", dane.idPrzeciwnejOsoby);
    if (req.isAuthenticated()) {
        var idzalogowanego = req.user.iduzytkownik;
        if (req.user.typ_uzytkownika == "uczen") {
            res.render('wideokonferencja', { logged: true, uczen: idzalogowanego, nauczyciel: dane.idPrzeciwnejOsoby })
        } else {
            res.render('wideokonferencja', { logged: true, nauczyciel: idzalogowanego, uczen: dane.idPrzeciwnejOsoby })
        }
    } else {
        res.render("logowanie", { logged: false });
    }
})

module.exports = videoChatRouter