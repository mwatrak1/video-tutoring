const express = require("express")
const mysql = require("mysql")
const connection = require("../db/connection")

const editAdRouter = express.Router()

editAdRouter.get('/edycjaOgloszenia/:id', (req, res) => {
    if (!req.isAuthenticated()) res.redirect('logowanie', { logged: false })
    const edycjaOgloszeniaQuery = "SELECT cena, opis FROM ogloszenia WHERE idogloszenia=" + req.params.id
    connection.query(edycjaOgloszeniaQuery, (err, rows) => {
        if (!err) res.render('edycjaOgloszenia', { logged: true, daneOgloszenia: rows, edytowaneOgloszenie: req.params.id })
    })
})

editAdRouter.post('/edycjaOgloszenia', (req, res) => {
    if (!req.isAuthenticated()) res.redirect('logowanie', { logged: false })
    const updateOgloszenieQuery = "UPDATE ogloszenia SET opis = ?, cena = ? WHERE idogloszenia = ?"
    const updateOgloszenieQueryFormatted = mysql.format(updateOgloszenieQuery, [
        req.body.opis,
        req.body.cena,
        req.body.idogloszenia
    ])

    connection.query(updateOgloszenieQueryFormatted, (err, updateResult) => {
        if (err) console.log(err)
        console.log(updateResult)
        res.redirect('/profil')
    })
})

module.exports = editAdRouter