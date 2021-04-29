require("dotenv").config()
const express = require("express")
const ejs = require("ejs")
const bodyParser = require("body-parser");
const passport = require("./auth/passport")
const session = require("express-session")
const path = require('path')
const serveStatic = require('serve-static')

const { RSA_PKCS1_OAEP_PADDING } = require("constants")
const { url } = require("inspector")
const { resolve } = require("path")
const { response } = require("express")
const fetch = require("node-fetch");
const { reject, result } = require("lodash");


const adsRouter = require("./routes/ads")
const registrationRouter = require("./routes/registration")
const loginRouter = require("./routes/login")
const newAdRouter = require("./routes/newAd")
const forumRouter = require("./routes/forum")
const editAdRouter = require("./routes/editAd")
const profileRouter = require("./routes/profile")
const editProfileRouter = require("./routes/editProfile")
const lessonsRouter = require("./routes/lessons")
const landingPageRouter = require("./routes/landingPage")
const videoChatRouter = require("./routes/videoChat")
const messsagesRouter = require("./routes/messages")

const messagingApi = require("./api/messaging")
const scheduleApi = require("./api/schedule");
const adsApi = require("./api/ads")
const forumApi = require("./api/forum")

const app = express();


app.use(serveStatic(path.join(__dirname, 'public')))
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(
  session({
    name: "Session",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
)

app.use(passport.initialize())
app.use(passport.session())

app.use(adsRouter)
app.use(registrationRouter)
app.use(loginRouter)
app.use(newAdRouter)
app.use(forumRouter)
app.use(editAdRouter)
app.use(profileRouter)
app.use(editProfileRouter)
app.use(lessonsRouter)
app.use(landingPageRouter)
app.use(videoChatRouter)
app.use(messsagesRouter)

app.use(messagingApi)
app.use(scheduleApi)
app.use(adsApi)
app.use(forumApi)


module.exports = app