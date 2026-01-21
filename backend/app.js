const express = require("express")
const app = express()
const fs = require("fs")
const pathModule = require("path")
//first make it able to execute the commands 
const { execFile } = require("child_process")
let port = 8080
app.listen(port, () => {
    console.log("Working on the Server")
})
//Accesin  the REQUEST **select repo**
//taking the query from the url 
app.get("/check", (req, res) => {
    const base_path = req.query.path

    //Now Checking if its a directroy
    if (!base_path) {
        return res.status(400).send("Path required")
    }
    fs.stat(base_path, (err, stats) => {
        if (err || !stats.isDirectory()) {
            return res.status(400).send("Invalid Directory")
        }

        //Listing Folders 

        //reading the files inside directories  
        fs.readdir(base_path, (err, items) => {
            if (err) {
                return res.status(500).send("cannot read directory")
            }
            const results = []
            //now looping through the folders and checking if a `.git` file is inside it or not
            let pending = items.length;


            if (pending === 0) {
                return res.json(results)
            }
            for (const item of items) {
                //checking that if the full path is a folder or not 
                const full_path = pathModule.join(base_path, item)
                fs.stat(full_path, (err, stats) => {
                    if (err || !stats.isDirectory()) {
                        pending--
                        if (pending === 0) {
                            return res.json(results)
                        }
                        return
                    }
                    execFile("git", ["rev-parse", "--is-inside-work-tree"], { cwd: full_path }, (err, stdout) => {
                        if (!err && stdout.trim() === "true") {
                            results.push({ name: item, isGitRepo: true })
                        }
                        pending--;
                        if (pending === 0) {
                            return res.json(results)
                        }
                    }
                    )
                })
            }

        })





    })
})








