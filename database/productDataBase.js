const mongoose = require('mongoose')
require('dotenv').config()

async function server() {
    await mongoose.connect('mongodb://localhost:27017/E-Commerce')
}

module.exports = server

server()