const express = require("express")
const connection = require("../db/connection")
const mysql = require("mysql")
const dayjs = require("dayjs")

const scheduleApi = express.Router()

scheduleApi.get('/harmonogram/:id', (req, res) => {
    var harmonogramId = req.params.id

    if (harmonogramId == 0) {
        if (!req.isAuthenticated()) res.send([])
        harmonogramId = req.user.iduzytkownik
    }

    const harmonogramQuery = 'SELECT idharmonogram, dostepne_dni, godzina_od, godzina_do, czas_trwania_zajec FROM harmonogram WHERE idharmonogram_uzytkownik=' + harmonogramId

    connection.query(harmonogramQuery, (err, rows) => {
        if (err) throw err
        console.log(rows)
        res.send(rows)
    })
})

scheduleApi.post('/usunDostepnoscHarmonogramu', (req, res) => {
    const deleteQuery = "DELETE from harmonogram WHERE idharmonogram=" + req.body.idharmonogram

    connection.query(deleteQuery, (err, rows) => {
        if (!err) {
            res.send({ message: "Pomyslnie usunieto" })
        } else {
            res.send({ message: "Blad w usuwaniu" })
        }
    })

})


scheduleApi.post('/dodajDostepnoscHarmonogramu', async (req, res) => {
    if (!req.isAuthenticated()) res.send({ message: "Niezalogowany uzytkownik - ERROR" })

    const dostepny_dzien = req.body.dzien
    console.log(dostepny_dzien)
    const poczatek_Dostepnosci = req.body.godzina_poczatek
    const koniec_Dostepnosci = req.body.godzina_koniec
    const czas_trwania = req.body.czas_trwania

    const queryHarmongoram = 'INSERT INTO harmonogram VALUES (NULL, ?, ?, ?, ?, ?)'
    const queryHarmongoramFormatted = mysql.format(queryHarmongoram, [
        dostepny_dzien,
        req.user.iduzytkownik,
        poczatek_Dostepnosci,
        koniec_Dostepnosci,
        czas_trwania
    ])

    connection.query(queryHarmongoramFormatted, (err, rows) => {
        if (!err) {
            res.send({ message: 'success' })
        } else {
            res.send({ message: err })
        }
    })

})

scheduleApi.post("/rezerwujZajecia", async (req, res) => {
    if (!req.isAuthenticated()) res.send({ wiadomoscZwrotna: "loginError" })
    console.log(req.body)

    var rezerwacjaZajecQuery = "INSERT INTO zajecia VALUES (NULL, ?, ?, ?, ?)"
    var rezerwacjaZajecQueryFormatted = mysql.format(rezerwacjaZajecQuery, [
        req.user.iduzytkownik,
        req.body.idnauczyciel,
        req.body.data_zajec,
        req.body.czas_zajec
    ])

    var daneDoUpdate = await przygotujDaneDoUpdateHarmonogram(req.body.poczatekDostepnosci, req.body.koniecDostepnosci, req.body.czas_zajec, req.body.data_zajec)
    console.log('dane do update:', daneDoUpdate)
    await updateHarmonogram(daneDoUpdate, req.body.idharmonogram, req.body.idnauczyciel)

    var resultInserta = await connection.query(rezerwacjaZajecQueryFormatted)

    if (resultInserta.length > 0) {
        res.send({ wiadomosc: "Sekces" })
    } else {
        res.send({ wiadomosc: "Porazka" })
    }

})

// przyklad zajecia co 90 min --- poczatek 12:00 koniec 7:00 --- zmiesci sie 4 zajecia i zostanie godzina wolna

async function updateHarmonogram(dostepnosc, idharmonogram, idnauczyciel) {

    var resultQuery = await getQueryHarmonogram(dostepnosc, idharmonogram, idnauczyciel)
    console.log(resultQuery)
    var anotherQuery = connection.query(resultQuery)
    return new Promise(resolve => { resolve(anotherQuery) })

}

async function getQueryHarmonogram(dostepnosc, idharmonogram, idnauczyciel) {

    var usunZarezerwowaneZajecia = ""

    if (dostepnosc.poczatek.diff(dostepnosc.wybrany_termin) == 0) {
        console.log("poczatek")

        if (dostepnosc.koniec.diff(dostepnosc.wybrany_termin, "minute") == dostepnosc.czas_trwania) {

            usunZarezerwowaneZajecia = "DELETE FROM harmonogram WHERE idharmonogram = ?"
            usunZarezerwowaneZajecia = mysql.format(usunZarezerwowaneZajecia, [
                idharmonogram
            ])

        } else {

            usunZarezerwowaneZajecia = "UPDATE harmonogram SET godzina_od = ? WHERE idharmonogram = ?"
            usunZarezerwowaneZajecia = mysql.format(usunZarezerwowaneZajecia, [
                dostepnosc.poczatek.add(dostepnosc.czas_trwania, "minute").format("YYYY-MM-DD HH:mm:ss"),
                idharmonogram
            ])

        }

        return new Promise(resolve => { resolve(usunZarezerwowaneZajecia) })
    } else if (dostepnosc.koniec.subtract(dostepnosc.czas_trwania, "minute").diff(dostepnosc.wybrany_termin) == 0) {
        console.log("koniec")
        usunZarezerwowaneZajecia = "UPDATE harmonogram SET godzina_do = ? WHERE idharmonogram = ?"

        usunZarezerwowaneZajecia = mysql.format(usunZarezerwowaneZajecia, [
            dostepnosc.wybrany_termin.format("YYYY-MM-DD HH:mm:ss"),
            idharmonogram
        ])

        return new Promise(resolve => { resolve(usunZarezerwowaneZajecia) })
    } else {
        console.log("srodek")
        // aktualny rekord - zmiana godzina_do + nowy rekord gdzie jest dostepnosc na kolejne godziny
        usunZarezerwowaneZajecia = "UPDATE harmonogram SET godzina_do = ? WHERE idharmonogram = ?"

        usunZarezerwowaneZajecia = mysql.format(usunZarezerwowaneZajecia, [
            dostepnosc.wybrany_termin.format("HH:mm:ss"),
            idharmonogram
        ])

        const queryDodajHarmongoram = 'INSERT INTO harmonogram VALUES (NULL, ?, ?, ?, ?, ?)'
        const queryDodajHarmongoramFormatted = mysql.format(queryDodajHarmongoram, [
            dostepnosc.koniec.format("YYYY-MM-DD"),
            idnauczyciel,
            dostepnosc.wybrany_termin.add(dostepnosc.czas_trwania, 'minute').format("HH:mm:ss"),
            dostepnosc.koniec.format("HH:mm:ss"),
            dostepnosc.czas_trwania
        ])

        connection.query(queryDodajHarmongoramFormatted)

        return new Promise(resolve => { resolve(usunZarezerwowaneZajecia) })

    }
}

async function przygotujDaneDoUpdateHarmonogram(poczatek, koniec, czas_trwania, wybrany_termin) {
    var format = "YYYY-MM-DD HH:mm:ss"

    var obiekt = {
        poczatek: convertStringToDatetime(poczatek, format),
        koniec: convertStringToDatetime(koniec, format),
        czas_trwania: parseInt(czas_trwania),
        wybrany_termin: convertStringToDatetime(wybrany_termin, format)
    }

    return new Promise(resolve => { resolve(obiekt) })
}

function convertStringToDatetime(string_date, format) {
    return dayjs(string_date, format)
}


module.exports = scheduleApi