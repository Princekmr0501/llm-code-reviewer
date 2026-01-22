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
//Now catch the path and action  of a git repo and access the request
app.get("/git_repo/:action", (req, res) => {
    const git_path = req.query.path
    const action = req.params.action
    if (!git_path) {
        return res.status(400).send("Path required")
    }

    if (action === "commit") {
        //Now go the folder and store the stdoutput insid two varibles one for commit and one for suggestion 
        execFile("git", ["diff", "--staged"], { cwd: git_path }, (err, stdout) => {
            if (err) {
                return res.status(400).send("Git action failed")
            }
            return res.json({ type: commit, commit: stdout })
        })//exec fie 
    }
    else if (action === "review") {
        const base = req.query.base
        const compare = req.query.compare
        if (!base || !compare) {
            return res.status(400).send("base and compare branch required")
        }
        execFile("git", ["diff", '${base}..${compare}'], { cwd: git_path }, (err, stdout) => {
            if (err) {
                return res.status(400).send("Git action failed")
            }
            return res.json({ type: review, commit: stdout })
        })
    }
 else {
            return res.status(400).send("Invalid action")
        }
    })











//Now connect to api using a key
//Now make prompts for review  and commit respectively
//if commit is choosed send the commit_stdoutput + prompt to the ai
//now get back the response 






