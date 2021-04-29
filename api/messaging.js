const express = require("express")
const connection = require("../db/connection")
const dayjs = require("dayjs")
const mysql = require("mysql")

const messagingApi = express.Router()

messagingApi.post('/nowaWiadomosc', (req, res) => {

    if (!req.isAuthenticated()) res.redirect('logowanie', { logged: false })
  
    const time = dayjs().format("YYYY-MM-DD h:mm:ss");
  
    const trescWiadomosci = req.body.trescWiadomosci
  
    console.log(trescWiadomosci, req.body)
  
    const wiadomoscQuery = "INSERT INTO wiadomosci VALUES (NULL, ?, ?, ?)"
  
    const wiadomoscFullQuery = mysql.format(wiadomoscQuery, [
      trescWiadomosci,
      time,
      time
    ])
  
    connection.query(wiadomoscFullQuery, (err, result) => {
      if (err) {
        console.log(err)
        throw err
      } else {
        console.log(result)
        const uzytkownicyHasWiadomosciQuery = "INSERT INTO uzytkownicy_has_wiadomosci VALUES (?, ?, ?)"
        const uzytkownicyHasWiadomosciFullQuery = mysql.format(uzytkownicyHasWiadomosciQuery, [
          req.user.iduzytkownik,
          result.insertId,
          req.body.odbiorcaId
        ])
        connection.query(uzytkownicyHasWiadomosciFullQuery, (error, finalResult) => {
          if (error) {
  
            throw error
          } else {
            console.log('Wyslano wiadomosc')
            const newMessageTime = dayjs().format("YYYY-MM-DD h:mm:ss")
            //mozna cos innego wyslac i wstawic ta nowa wiadomosc do rozmowy
            res.send(finalResult)
          }
        })
      }
    })
  
  })
  
  messagingApi.get('/kontakty', (req, res) => {
    const selectKontakty = `SELECT  imie, nazwisko , uzytkownik_iduzytkownik FROM uzytkownicy_has_wiadomosci 
    JOIN profil ON id_odbiorcy=uzytkownik_iduzytkownik 
     WHERE (uzytkownicy_iduzytkownicy =? OR id_odbiorcy=?) AND id_odbiorcy != ?  GROUP BY uzytkownik_iduzytkownik  UNION
     SELECT imie, nazwisko , uzytkownik_iduzytkownik FROM uzytkownicy_has_wiadomosci 
    JOIN profil ON uzytkownicy_iduzytkownicy=uzytkownik_iduzytkownik 
     WHERE (uzytkownicy_iduzytkownicy =? OR id_odbiorcy=?)  AND uzytkownicy_iduzytkownicy != ? GROUP BY uzytkownik_iduzytkownik;`;
  
    const selectKontaktyFormatted = mysql.format(selectKontakty, [
      req.user.iduzytkownik,
      req.user.iduzytkownik,
      req.user.iduzytkownik,
      req.user.iduzytkownik,
      req.user.iduzytkownik,
      req.user.iduzytkownik
    ])
  
    connection.query(selectKontaktyFormatted, (err, rows) => {
      if (err) {
        throw err
      } else {
        res.send(rows)
  
      }
    })
  })
  
  messagingApi.get('/konwersacje/:conversationId', (req, res) => {
    const convoId = req.params.conversationId
  
    const selectWiadomosci = `SELECT  imie, nazwisko, tresc  FROM uzytkownicy_has_wiadomosci 
    JOIN profil ON uzytkownicy_iduzytkownicy=uzytkownik_iduzytkownik JOIN wiadomosci ON wiadomosci_idwiadomosci = idwiadomosci
    WHERE (uzytkownicy_iduzytkownicy =? AND id_odbiorcy=?) OR (uzytkownicy_iduzytkownicy =? AND id_odbiorcy=?) order by wiadomosci_idwiadomosci ASC`;
  
    const selectWiadomosciFormatted = mysql.format(selectWiadomosci, [
      req.user.iduzytkownik,
      convoId,
      convoId,
      req.user.iduzytkownik
    ])
  
    connection.query(selectWiadomosciFormatted, (err, rows) => {
      if (err) {
        throw err
      } else {
  
        res.send(rows)
      }
    })
  
  })

module.exports = messagingApi