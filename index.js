const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config()
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken')
const config = require('./config/config.js')

const app = express();

//BodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

//DB Connection
mongoose.connect(config.db_url, { useUnifiedTopology: true, useCreateIndex: true, useNewUrlParser: true, useFindAndModify: false }).then((a) => {
    console.log('DB Connected...');
}).catch((e) => {
    console.error(e)
})


// Routes
app.use('/auth', require("./userAuth/loggingAndRegister.js"));
app.use('/private', require("./private/privateRouter.js"));
app.use('/', require("./public/publicRouter.js"));


const PORT = process.env.PORT || 5050

app.listen(PORT, () => {
    console.log("Server running on port: " + PORT);
})