const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()

mongoose.connect(process.env.DB)

app.use(cors)
app.use(express.json)

app.get("/", ()=>{
    console.log("hello")
})

app.listen(process.env.PORT, ()=> console.log(`Server running on port: ${process.env.PORT}`))