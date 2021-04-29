const express = require("express")
const connection = require("../db/connection")
const mysql = require("mysql")
const dayjs = require("dayjs")

const forumRouter = express.Router()

forumRouter.get("/forum", function (req, res) {
    connection.query(
        "SELECT idkategorie, nazwa_kategorii FROM kategorie",
        function (err, rows) {
            if (err) {
                console.log(err);
            } else {
                if (req.isAuthenticated()) {
                    console.log(rows);
                    res.render("forum", {
                        logged: true,
                        kategorie: rows
                    })
                } else {
                    res.render("logowanie", { logged: false })
                }

            }
        }
    )
})


forumRouter.get("/forum/:idkategorii/:idtematu", function (req, res) {
    const idkategorii = req.params.idkategorii;
    const idtematu = req.params.idtematu;
    connection.query(
        "SELECT idtemat, tytul_tematu, tresc, data_wstawienia FROM temat WHERE kategorie_idkategorie = " + idkategorii + " AND idtemat = " + idtematu,
        function (err, rows) {
            if (!err) {
                if (req.isAuthenticated()) {
                    if (rows) {
                        rows.forEach((element) => {
                            element.data_wstawienia = element.data_wstawienia
                                .toString()
                                .slice(0, 25);
                        });
                    }
                    var newPost = {
                        idtemat: rows[0].idtemat, tytul_tematu: rows[0].tytul_tematu,
                        tresc: rows[0].tresc, data_wstawienia: rows[0].data_wstawienia
                    }
                    connection.query("SELECT tresc, data_wpisu FROM odpowiedzi WHERE temat_idtemat = " + idtematu + " ORDER BY data_wpisu DESC",
                        function (err, rows) {
                            if (!err) {
                                if (rows) {
                                    rows.forEach((element) => {
                                        element.data_wpisu = element.data_wpisu
                                            .toString()
                                            .slice(0, 25)
                                    });
                                }
                                console.log("Temat rows: ", newPost)
                                console.log("Odpowiedzi rows: ", rows)
                                res.render("odpowiedz", { logged: true, temat: newPost, odpowiedz: rows })
                            } else {
                                console.log(err)
                                res.render("logowanie", { logged: false })
                            }
                        })
                } else {
                    res.render("logowanie", { logged: false })
                }
            } else {
                console.log(err)
            }
        }
    )
})



forumRouter.post("/forum/:idkategorii/:idtematu", function (req, res) {
    const idkategorii = req.params.idkategorii;
    const idtemat = req.params.idtematu;
    connection.query(
        "SELECT idtemat, tytul_tematu, tresc, data_wstawienia FROM temat JOIN kategorie ON kategorie_idkategorie = idkategorie WHERE kategorie_idkategorie = " + idkategorii + " AND idtemat = " + idtemat + " ORDER BY data_wstawienia DESC", function (err, rows) {
            if (req.isAuthenticated()) {
                console.log("Tutaj jestem")
                console.log(rows);
                if (rows) {
                    rows.forEach((element) => {
                        element.data_wstawienia = element.data_wstawienia
                            .toString()
                            .slice(0, 25)
                    });
                }
                res.render("odpowiedz", { logged: true, temat: rows })
            } else {
                res.render("logowanie", { logged: false })
            }
        })
})


forumRouter.get("/forum/:id", function (req, res) {
    var forumId = { id: req.params.id };
    connection.query(
        "SELECT idtemat, tytul_tematu, tresc, data_wstawienia, nazwa_kategorii FROM temat JOIN kategorie ON kategorie_idkategorie = idkategorie WHERE kategorie_idkategorie = " + forumId.id + " ORDER BY data_wstawienia DESC",
        function (err, rows) {
            if (!err) {
                if (req.isAuthenticated()) {
                    console.log(rows);
                    if (rows) {
                        rows.forEach((element) => {
                            element.data_wstawienia = element.data_wstawienia
                                .toString()
                                .slice(0, 25)
                        });
                    }
                    //console.log("TUtaj jest id tematu",rows[0].idtemat);
                    console.log("id: ", forumId.id);
                    if (rows.length == 0) {
                        console.log("nie ma nic");
                        connection.query("SELECT nazwa_kategorii FROM kategorie WHERE idkategorie = " + forumId.id,
                            function (err, rows) {
                                if (!err) {
                                    console.log("Nazwa kategorii:  ", rows[0].nazwa_kategorii);
                                    var empty = { idtemat: "", tytul_tematu: "", tresc: "", data_wstawienia: "", nazwa_kategorii: rows[0].nazwa_kategorii }
                                    console.log("Empty: ", empty)
                                    console.log("rows w !err: ", rows)
                                    res.render("temat", { logged: true, temat: rows, kategorie: forumId.id })
                                } else {
                                    console.log(err)
                                    res.render("logowanie", { logged: false })
                                }
                            })
                    } else {
                        console.log("Tutaj przekazuje id.id: ", forumId.id)
                        res.render("temat", { logged: true, temat: rows, kategorie: forumId.id })
                    }

                } else {
                    console.log(rows)
                    res.render("logowanie", { logged: false, temat: rows })
                }
            } else {
                console.log(err)
            }
        }
    )

})

forumRouter.post("/dodajj", function (req, res) {
    const data = req.body.idkategorii;
    console.log("Id kategorii: ", req.body.idkategorii);
    if (req.isAuthenticated()) {
      console.log("Halo jestem tutaj")
      res.render("dodajTemat", { logged: true, kategorie: data });
    } else {
      res.render("logowanie", { logged: false });
    }
  })

forumRouter.post("/dodajTemat", function (req, res) {
    const data = req.body
    const time = dayjs().format("YYYY-MM-DD h:mm:ss")
    const postQuery =
        "INSERT INTO temat VALUES (NULL,?,?,?,?,?)"
    const insertQuery = mysql.format(postQuery, [
        data.postBody,
        time,
        req.user.iduzytkownik,
        data.idkategorii,
        data.postTitle
    ])
    connection.query(
        insertQuery, function (error, rows) {
            if (error) {
                console.log("jestem tutaj po insercie")
                console.log(error)
                res.render("forum.ejs")
            } else {
                res.redirect("/forum/" + data.idkategorii + "/" + rows.insertId)
            }
        }

    )
})

module.exports = forumRouter