const express = require("express")
const connection = require("../db/connection")
const dayjs = require("dayjs")

const lessonsRouter = express.Router()

lessonsRouter.get('/zajecia', async (req, res) => {
    var data = dayjs();
    var przyszle = [];
    var archiwalne = [];

    if (req.isAuthenticated()) {

        if (req.user.typ_uzytkownika == "uczen") {
            var zajeciaQuery = "SELECT uzytkownik_iduzytkownik, imie, nazwisko, data_zajec, czas_zajec FROM zajecia JOIN profil ON idnauczyciel=uzytkownik_iduzytkownik  WHERE iduczen = " + req.user.iduzytkownik;
        } else {
            var zajeciaQuery = "SELECT uzytkownik_iduzytkownik, imie, nazwisko, data_zajec, czas_zajec FROM zajecia JOIN profil ON iduczen=uzytkownik_iduzytkownik  WHERE idnauczyciel = " + req.user.iduzytkownik;
        }
        connection.query(zajeciaQuery, (err, rows) => {
            if (rows) {
                rows.forEach((element) => {
                    var dataZajec = dayjs(element.data_zajec, "YYYY-MM-DD hh:mm:ss:SS")
                    element.data_zajec = dataZajec.format("YYYY-MM-DD hh:mm:ss");
                    if (data < dataZajec) {
                        //przyszle
                        przyszle.push(element);
                    } else {
                        //archwialne
                        archiwalne.push(element);
                    }
                })
            }
            if (!err) {
                res.render("zajecia", { logged: true, przyszle: przyszle, archiwalne: archiwalne })
            }
        })
    } else {
        res.render('logowanie', { logged: false })
    }
})

module.exports = lessonsRouter