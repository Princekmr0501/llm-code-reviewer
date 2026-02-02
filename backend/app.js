


const express = require("express")
const app = express()
const dotenv = require("dotenv")

dotenv.config({ path: "llmkey.env" })

app.use(express.json())

let port = 8080

console.log(process.env.OPENAI_API_KEY)
console.log(process.env.PORT)

app.listen(port, () => {
    console.log("Working on the Server")
})



//Now connect to api using a key
//Now make prompts for review  and commit respectively
//if commit is choosed send the commit_stdoutput + prompt to the ai
//now get back the response 






