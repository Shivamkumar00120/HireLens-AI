const express = require("express")
const cookieParser = require("cookie-parser")

const app = express()

// Middleware to parse incoming JSON bodies
app.use(express.json())

// Middleware to parse URL-encoded bodies (e.g. from Postman form-data)
app.use(express.urlencoded({ extended: true }))

// FIX: Executed cookieParser as a function call
app.use(cookieParser())

// Require all the routes here
const authRouter = require("./routes/auth.routes")

// Using all the routes here
app.use("/api/auth", authRouter)

module.exports = app
