const express = require("express")
const connection = require("../db/connection")

const adsApi = express.Router()

adsApi.get('/ogloszenia', (req, res) => {
    connection.query(
        `SELECT uzytkownik_iduzytkownik AS id, imie , ogloszenia.opis ,jezyk , profil.jezyk_ojczysty AS ojczysty , cena , 
      AVG(opinie.liczba) AS srednia, zdjecie, film, ogloszenia.idogloszenia as idogloszenia from profil 
      JOIN ogloszenia ON profil.idprofil = ogloszenia.idprofil JOIN opinie ON profil.idprofil=opinie.odbiorca_opinii  
      WHERE imie IS NOT NULL AND znane_jezyki IS NOT NULL GROUP BY idogloszenia ORDER BY cena`,
        (err, rows, fields) => {
            if (err) throw err
            res.send(rows)
        }
    )
})

module.exports = adsApi