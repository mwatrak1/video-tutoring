const express = require("express")
const connection = require("../db/connection")
const mysql = require("mysql")
const dayjs = require("dayjs")

const forumApi = express.Router()

forumApi.get('/listaPrzewijana/:id', function (req, res) {
    var listId = { id: req.params.id }
    connection.query(
        "SELECT idtemat, tytul_tematu, tresc, data_wstawienia,idkategorie FROM temat JOIN kategorie ON kategorie_idkategorie = idkategorie WHERE kategorie_idkategorie = " + listId.id + " ORDER BY data_wstawienia DESC",
        function (err, rows) {
            if (!err) {
                res.send(rows)
            } else {
                res.send(err)
            }
        }
    )
})

forumApi.get("/forumjezyka/:jezyk", async (req, res) => {
    const forumJezykQuery = mysql.format("SELECT * FROM temat JOIN kategorie ON kategorie_idkategorie = idkategorie WHERE nazwa_kategorii = ?",
        [req.params.jezyk])

    connection.query(forumJezykQuery, (err, forumJezykResult) => {
        res.send({ tematy: forumJezykResult })
    })
})


forumApi.post('/dodajOdpowiedz', function (req, res) {
    const data = req.body;
    const time = dayjs().format("YYYY-MM-DD h:mm:ss");
    const postQuery =
        "INSERT INTO odpowiedzi VALUES (NULL,?,?,?,?)"
    const insertQuery = mysql.format(postQuery, [
        data.tresc,
        time,
        data.idtematu,
        req.user.iduzytkownik
    ]);
    connection.query(
        insertQuery, function (error, rows) {
            if (error) {
                res.send(error);
            } else {
                res.send(rows);
            }

        })
})

module.exports = forumApi