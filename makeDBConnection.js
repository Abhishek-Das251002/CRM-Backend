const mongoose = require('mongoose')
require("dotenv").config()

const connectionUri = process.env.MONGODB

const makeDbConnection = async () => {
    await mongoose
    .connect(connectionUri)
    .then(() => {console.log("connected to database.")})
    .catch((error) => {console.log("an error occured while connecting to database.", error)})
}

module.exports = {makeDbConnection}