const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy;
const mysql = require("mysql")
const connection = require("../db/connection")
const bcrypt = require("bcrypt-nodejs")


passport.use(
"local",
new LocalStrategy(
    {
    usernameField: "email",
    passwordField: "password",
    passReqToCallback: true,
    },
    function (req, email, password, done) {
    console.log(req.body);
    const selectQuery = "SELECT iduzytkownik, email, typ_uzytkownika, idprofil FROM uzytkownik  JOIN profil ON uzytkownik_iduzytkownik = iduzytkownik WHERE email = ? ";
    const query = mysql.format(selectQuery, [req.body.email]);

    connection.query(query, function (err, rows, fields) {
        if (err) {
        return done(err);
        }
        else if (rows.length == 0) {
        return done(null, false)
        } else {
        console.log(rows);
        bcrypt.compare(password, rows[0].haslo, function (err, result) {
            if (result === false) {
            console.log("Bledne haslo");
            console.log(password, rows[0].haslo);
            return done(null, false);
            } else {
            console.log(result)
            return done(null, rows[0])
            }
        })
        }
    })
    }
)
)

passport.serializeUser(function (user, done) {
    done(null, user.iduzytkownik)
});
  
passport.deserializeUser(function (iduzytkownik, done) {
    connection.query(
        "select iduzytkownik, email, typ_uzytkownika, idprofil from uzytkownik  JOIN profil ON iduzytkownik = uzytkownik_iduzytkownik where iduzytkownik = " + iduzytkownik,
        function (err, rows) {
        done(err, rows[0])
        }
    );
});

module.exports = passport