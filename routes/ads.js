const express = require("express")
const connection = require("../db/connection")
const dayjs = require("dayjs")


const adsRouter = express.Router()

adsRouter.get("/znajdzKorepetytora", (req, res) => {
    connection.query(
      "SELECT uzytkownik_iduzytkownik AS id, imie , ogloszenia.opis ,jezyk, profil.jezyk_ojczysty AS ojczysty , cena , AVG(opinie.liczba) AS srednia from profil JOIN ogloszenia ON profil.idprofil = ogloszenia.idprofil JOIN opinie ON profil.idprofil=opinie.odbiorca_opinii  WHERE imie IS NOT NULL AND znane_jezyki IS NOT NULL GROUP BY idogloszenia",
      function (err, rows, fields) {
        if (err) throw err;

        if(rows){
          rows.forEach((element) => {
            element.srednia = Math.round(element.srednia*100)/100;
          });
        }
        
        if (req.isAuthenticated()) {
          
          res.render("szukaj", {
            ogloszenia: rows,
            logged: req.user.iduzytkownik,
          });
        } else {
          res.render("szukaj", { ogloszenia: rows, logged: false });
        }
      }
    );
});

adsRouter.get("/ogloszenie/:id", (req, res) => {
  var ogloszenieId = req.params.id;

    connection.query(
      "SELECT uzytkownik_iduzytkownik, jezyk_ojczysty, lokalizacja, znane_jezyki, imie, zdjecie,  nazwisko, ogloszenia.opis, profil.uzytkownik_iduzytkownik AS idprofil FROM profil JOIN ogloszenia ON profil.idprofil=ogloszenia.idprofil WHERE idogloszenia = " + ogloszenieId,
      function (err, rows) {
        if (!err) {
          const ogloszenieRezerwacjaQuery = `SELECT idharmonogram, dostepne_dni, godzina_od, godzina_do, czas_trwania_zajec FROM harmonogram JOIN profil ON idharmonogram_uzytkownik=uzytkownik_iduzytkownik JOIN ogloszenia ON ogloszenia.idprofil= profil.idprofil WHERE idogloszenia = ` + ogloszenieId
          connection.query(ogloszenieRezerwacjaQuery, (error, dostepnosc) => {

            dostepnosc.forEach(dateTimeElement => {
              dateTimeElement.dostepne_dni = dayjs(dateTimeElement.dostepne_dni, "YYYY-MM-DD mm:ss:SS").format("YYYY-MM-DD")
            })

            if (!error){ 
              if (req.user && req.user.typ_uzytkownika == "uczen"){
                res.render("ogloszenie", { logged: true, ogloszenie: rows, dostepnosc: dostepnosc })
              } else {
                res.render("ogloszenie", { logged: true, ogloszenie: rows, dostepnosc: [] })  
              }
            }
          })

        } else {
          console.log(err)
        }

      }
    )
})

module.exports = adsRouter