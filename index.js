const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')


const port = 5000
const app = express()

app.use(cors)
app.use(express.json)

app.get("/", ()=>{
    console.log("hello")
})

app.listen(port, ()=> console.log(`Server running on port: ${port}`))