const express = require("express")
const connection = require("../db/connection")
const mysql = require("mysql")
const dayjs = require("dayjs")
const _ = require('lodash')
const validator = require("validator")


const newAdRouter = express.Router()

newAdRouter.get("/dodaj", function (req, res) {
  res.render("dodajOgloszenie", { logged: true })
})

newAdRouter.post("/dodaj", function (req, res) {
  const data = req.body;

  connection.query(
    "SELECT idprofil FROM profil WHERE uzytkownik_iduzytkownik = " +
    req.user.iduzytkownik,
    async function (err, rows) {
      if (err) {
        res.redirect("/logowanie");
        console.log(err);
      } else {
        console.log(rows);
        const time = dayjs().format("YYYY/MM/DD");

        const walidacjaResult = await validateOgloszenia(data)

        if (walidacjaResult == false){
          res.redirect("/profil")
        } else {

        const ogloszenieQuery =
          "INSERT INTO ogloszenia VALUES (NULL,?,?,?,?,?)";
        const ogloszenie = mysql.format(ogloszenieQuery, [
          rows[0].idprofil,
          data.cena,
          data.opis,
          time,
          data.jezyk,
        ]);

        connection.query(ogloszenie, function (error, response) {
          if (error) {
            console.log(error);
            res.redirect("/logowanie");
          } else {
            res.redirect("/profil");
          }
        })
      }
      }
    }
  )
})

async function validateOgloszenia(ogloszeniaData){
  
  var walidacjaOgloszen = {}

  var cenaOgloszenia = Number(ogloszeniaData.cena)
  var opisOgloszenia = ogloszeniaData.opis
  var jezykOgloszenia = ogloszeniaData.jezyk

  if (cenaOgloszenia == NaN){
    walidacjaOgloszen["cenaStringError"] = "Cena ogłoszenia musi być liczbą"
  }

  if (cenaOgloszenia < 0 || cenaOgloszenia > 1000){
    walidacjaOgloszen["cenaValueError"] = "Cena ogłoszenia nie może być mniejsza niż 0 ani większa niż 1000 zł"
  } 

  if (opisOgloszenia.length < 10 || opisOgloszenia > 2000){
    walidacjaOgloszen["opisError"] = "Opis musi się zawierać w zakresie od 10 do 2000"
  }

  if (jezykOgloszenia.length < 3 || opisOgloszenia.length > 30){
    walidacjaOgloszen["jezykLengthError"] = "Język nie istnieje"
  }
  
  if (!validator.isAlpha(jezykOgloszenia, 'pl-PL')){
    walidacjaOgloszen["jezykStringError"] = "Język nie istnieje"
  }

  return _.isEmpty(walidacjaOgloszen)

}

module.exports = newAdRouter