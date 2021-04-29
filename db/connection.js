const mysql = require("mysql")
require("dotenv").config()

var connection = mysql.createConnection({
    host: process.env.HOSTNAME,
    user: "admin",
    password: process.env.PASS,
    database: "mydb",
    timezone: "+00:00"
  })

module.exports = connection