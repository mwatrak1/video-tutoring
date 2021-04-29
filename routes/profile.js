const express = require("express")
const connection = require("../db/connection")
const mysql = require("mysql")
const dayjs = require("dayjs")

const profileRouter = express.Router()

profileRouter.get("/profil", function (req, res) {
  if (req.isAuthenticated()) {
    var current_date = dayjs().format("YYYY/MM/DD");
    connection.query(
      "SELECT ogloszenia.opis , cena , data_wstawienia ,jezyk, uzytkownik_iduzytkownik AS id, ogloszenia.idogloszenia AS idogloszenia, typ_uzytkownika  FROM ogloszenia JOIN profil ON profil.idprofil =ogloszenia.idprofil JOIN uzytkownik ON iduzytkownik = uzytkownik_iduzytkownik WHERE profil.uzytkownik_iduzytkownik = " +
      req.user.iduzytkownik,
      function (err, rows) {
        if (rows.length > 0) {
          rows.forEach((element) => {
            element.data_wstawienia = element.data_wstawienia
              .toString()
              .slice(0, 16)
          });

        }
        res.render("profil", { logged: true, mojeOgloszenia: rows, min_date: current_date, iduzytkownika: req.user.iduzytkownik, typ_uzytkownika: req.user.typ_uzytkownika });
      }
    )
  } else {
    console.log('brak profilu')
    res.redirect("/logowanie")
  }
})

profileRouter.get("/profil/:id", function (req, res) {
  var profilId = { profilId: req.params.id };
  var przyszle = [];
  var przeszle = [];

  console.log("ID to :", profilId.profilId);
  connection.query(
    "SELECT imie, jezyk_ojczysty, lokalizacja, znane_jezyki, profil.opis as opisProfilu, opinie.opis as opisOpinii, autor_opinii, data_wpisu,odbiorca_opinii, liczba, zdjecie FROM profil JOIN opinie ON odbiorca_opinii = idprofil WHERE uzytkownik_iduzytkownik = " + profilId.profilId,
    function (err, rows) {
      if (!err) {
        if (req.isAuthenticated()) {
          if (rows) {
            rows.forEach((element) => {
              element.data_wpisu = element.data_wpisu
                .toString()
                .slice(0, 16);
            });
          }

          connection.query(
            "SELECT idprofil FROM uzytkownik JOIN profil ON iduzytkownik=uzytkownik_iduzytkownik WHERE iduzytkownik = " + req.user.iduzytkownik,
            function (error, rows1) {
              if (!error) {

                const profilHarmonogramQuery = "SELECT"
                connection.query("SELECT idprofil from profil where uzytkownik_iduzytkownik = " + profilId.profilId, function (err1, rows2) {
                  if (!err1) {
                    connection.query("SELECT imie, nazwisko FROM profil JOIN opinie ON autor_opinii=idprofil WHERE odbiorca_opinii = " + rows2[0].idprofil, function (err2, rows3) {
                      if (!err2) {
                        console.log(rows3);
                        var newList = rows.map((item, i) => Object.assign({}, item, rows3[i]));
                        console.log("Najnowsza lista osob: ", newList);
                        console.log("TO SĄ REQ.USER", req.user.iduzytkownik, profilId.profilId);
                        connection.query("SELECT idzajecia, data_zajec FROM zajecia WHERE iduczen = " + req.user.iduzytkownik + " AND idnauczyciel=" + profilId.profilId, function (err4, rows4) {
                          if (!err4) {
                            console.log(rows4);
                            var data = dayjs();
                            if (rows4) {
                              rows4.forEach((element) => {
                                var dataZajec = dayjs(element.data_zajec, "YYYY-MM-DD hh:mm:ss:SS")
                                element.data_zajec = dataZajec.format("YYYY-MM-DD hh:mm:ss");
                                if (data < dataZajec) {
                                  //przyszle
                                  przyszle.push(element)
                                } else {
                                  //przeszle
                                  przeszle.push(element);
                                }
                              })

                            }
                            if (przeszle.length > 0) {
                              res.render("zobaczProfil", { logged: true, profil: newList, imie_odbiorcy: rows, idUzytkownika: profilId.profilId, autor: rows1[0].idprofil, zalogowany: req.user.iduzytkownik, przyszle: true });
                            } else {
                              res.render("zobaczProfil", { logged: true, profil: newList, imie_odbiorcy: rows, idUzytkownika: profilId.profilId, autor: rows1[0].idprofil, zalogowany: req.user.iduzytkownik, przyszle: false });
                            }

                          } else {
                            res.render("zobaczProfil", { logged: false, profil: rows });
                          }
                        })
                      } else {
                        res.render("zobaczProfil", { logged: false, profil: rows });
                      }
                    })
                  } else {
                    console.log(error);
                    res.render("zobaczProfil", { logged: false, profil: rows });
                  }
                })



              } else {
                console.log(error);
                res.render("zobaczProfil", { logged: false, profil: rows });
              }
            }
          )
        } else {
          console.log(rows)
          res.render("logowanie", { logged: false, profil: rows });

        }
      } else {
        console.log(err)
      }
    }
  );
});

profileRouter.post("/dodajOpinie", function (req, res) {
  const data = req.body;
  const time = dayjs().format("YYYY-MM-DD");
  console.log(data);
  const opinieQuery =
    "INSERT INTO opinie VALUES(NULL,?,?,?,?,?)"
  const insertQuery = mysql.format(opinieQuery, [
    data.Opis,
    data.autor_opinii,
    time,
    data.buttonOpinie,
    data.Ocena
  ])
  connection.query(
    insertQuery, function (err, rows) {
      if (err) {
        console.log(err);
        res.render("logowanie.ejs", { logged: false });
      } else {
        console.log("id uzytkownika: ", data.idUzytkownika);
        res.redirect("/profil/" + data.idUzytkownika);
      }
    }
  )
})

module.exports = profileRouter