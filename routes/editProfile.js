const express = require("express")
const multiparty = require("multiparty")
const fs = require("fs")
const AWS = require("aws-sdk")
require("dotenv").config()
const connection = require("../db/connection")


var creds = new AWS.Credentials(process.env.ACCESS_KEY, process.env.SECRET_KEY)
var s3 = new AWS.S3({ credentials: creds, region: 'eu-central-1' })

const editProfileRouter = express.Router()

editProfileRouter.get("/edycjaProfilu", function (req, res) {
    if (req.isAuthenticated()) {

        const queryEdycja = "SELECT * FROM profil WHERE uzytkownik_iduzytkownik =" + req.user.iduzytkownik
        connection.query(queryEdycja, (err, rows) => {
            console.log(rows)
            if (err) res.redirect('/logowanie', { logged: false })
            else res.render('edycjaProfilu', { logged: true, profil: rows[0] })
        })
    } else {
        res.render("logowanie", { logged: false })
    }
})

editProfileRouter.post("/edycjaProfilu", async function (req, res) {
    if (!req.isAuthenticated()) res.redirect('/logowanie', { logged: false })

    var form = new multiparty.Form()

    form.parse(req, async function (err, fields, files) {
        if (err) throw err


        for (const file of Object.entries(files)) {
            console.log(file)

            if (fs.existsSync(file[1][0].path) && file[1][0].size > 0) {
                console.log("Istnieje")

                fs.readFile(file[1][0].path, (err, fileData) => {
                    if (err) throw err

                    if (file[0] == 'zdjecie') {

                        var fileName = "zdjecie" + req.user.iduzytkownik + ".jpg"
                        uploadFile(fileData, fileName)

                    } else {

                        var fileName = "film" + req.user.iduzytkownik + ".mp4"
                        uploadFile(fileData, fileName)

                    }
                })
            }
        }
        var updateResult = await updateProfile(files, fields, req.user.iduzytkownik)
        if (updateResult == true) res.redirect('/profile/' + req.user.iduzytkownik)
        res.redirect('/edycjaProfilu')


    })
})

async function updateProfile(filesObject, fieldsObject, userid) {
    var edycjaQuery = "UPDATE profil SET "
    for (const item of Object.entries(fieldsObject)) {

        if (item[1][0].length > 0) {

            edycjaQuery += item[0] + " = '" + item[1][0] + "', "
        }
    }

    for (const file of Object.entries(filesObject)) {

        if (file[1][0].originalFilename.length > 0) {
            let fileName = file[0] + userid + file[1][0].originalFilename.substring(file[1][0].originalFilename.length - 4, file[1][0].originalFilename.length)
            edycjaQuery += file[0] + " = '" + fileName + "', "
        }
    }

    edycjaQuery = edycjaQuery.substring(0, edycjaQuery.length - 2)

    edycjaQuery += "WHERE uzytkownik_iduzytkownik =" + userid

    console.log(edycjaQuery)

    connection.query(edycjaQuery, function (error, response) {
        console.log(error, response);
        if (!error) {
            return true
        } else {
            return false
        }
    })

}

async function uploadFile(fileObject, fileName) {
    params = { Bucket: "inzynierkanativespeakerzy", Key: fileName, Body: fileObject }
    s3.upload(params, function (err, data) {
        if (err) return false
        return true
    })
}

module.exports = editProfileRouter