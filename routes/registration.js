const express = require("express")
const validator = require("validator")
const _ = require('lodash')
const dayjs = require('dayjs')
const mysql = require("mysql")
const bcrypt = require("bcrypt-nodejs")
const connection = require("../db/connection")

const passport = require("../auth/passport")

const registrationRouter = express.Router()

const saltRounds = 10

registrationRouter.get("/rejestracja", (req, res) => {
    if (req.isAuthenticated()) {
      res.render("rejestracja", { logged: true, walidacja: {} })
    } else {
      res.render("rejestracja", { logged: false, walidacja: {} })
    }
})
  
registrationRouter.post("/rejestracja", (req, res) => {
const data = req.body;

var walidacja = {}
if (validator.isLength(data.nazwa_uzytkownika.toString(), { min: 8, max: 32 }) === false) {
    walidacja["nazwaError"] = true
}

if (data.pass1 != data.pass2) {
    walidacja["hasloError"] = true
}

if (validator.isEmail(data.email) == false){
    walidacja["emailError"] = true
}

console.log(walidacja)

if (_.isEmpty(walidacja)) {
    const password = data.pass1;
    bcrypt.hash(password, saltRounds, function (err, result) {

    const insertQuery = "INSERT INTO ??  VALUES (NULL,?,?,?,?)";
    const query = mysql.format(insertQuery, [
        "uzytkownik",
        data.nazwa_uzytkownika,
        data.email,
        result,
        data.userr
    ])

    connection.query(query, function (err, response) {
        if (err) {
        console.log(err);
        } else {
        console.log(response);

        const profileInsertQuery =
            "INSERT INTO profil VALUES (NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,?, NULL, NULL)";
        const profileQuery = mysql.format(profileInsertQuery, [
            response.insertId,
        ]);

        connection.query(profileQuery, function (
            profileError,
            profileResponse
        ) {
            if (profileError) {
            console.log(profileError);
            } else {
            const time = dayjs().format("YYYY/MM/DD");
            const insertOpinie =
                "INSERT INTO opinie VALUES (NULL , ? , NULL ,? ,? ,NULL)";
            const opinie = mysql.format(insertOpinie, [
                "rejestracja",
                time,
                profileResponse.insertId,
            ]);

            connection.query(opinie, function (opinieError, opinieResponse) {
                if (opinieError) {
                console.log(opinieError);
                } else {
                console.log(opinieResponse);
                }
            });
            }
        });

        passport.authenticate("local");
        res.redirect("/znajdzKorepetytora");
        }
    })
    })
} else {
    console.log("zla walidacja");
    res.render("rejestracja", { logged: false, walidacja: walidacja })
}

})

module.exports = registrationRouter