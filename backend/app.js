


const express = require("express")
const app = express()
const dotenv = require("dotenv")

dotenv.config({ path: "llmkey.env" })

app.use(express.json())

let port = 8080

app.listen(port, () => {
    console.log("Working on the Server")
})









