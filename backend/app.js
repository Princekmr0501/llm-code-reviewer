
const express = require("express")
const app = express()
const dotenv =require("dotenv")
dotenv.config({path:"llmkey.env"});
app.use(express.json())
const fs = require("fs").promises
const path = require("path")
//first make it able to execute the commands 
const { execFile } = require("child_process")
let port = 8080
const SAFE_ROOT=path.resolve("/home/users/projects")
//Accesin  the REQUEST **select repo**
//taking the query from the url 
app.get("/check",async (req, res) => {
    try{
      if (!req.query.path) {
    return res.status(400).send("Path required");
  }
 
  const userPath = path.resolve(req.query.path)
 if (!userPath.startsWith(SAFE_ROOT)) {
    return res.status(403).send("Access denied")
  }

    //Now Checking if its a directroy
   
    const stats = await fs.stat(userPath);
     if (!stats.isDirectory()) {
      return res.status(400).send("Invalid Directory");
    }

        //Listing Folders 

        //reading the files inside directories  
    const items = await fs.readdir(userPath);
            const results = []

            
                    // Use Promise.all to handle async execFile calls
                    await Promise.all(items.map(async (item) => {
                        const fullPath = path.join(userPath, item); 
                        const itemStats = await fs.stat(fullPath);
                        if (!itemStats.isDirectory()) return;
            
                        return new Promise((resolve) => {
                            execFile(
                                "git",
                                ["rev-parse", "--is-inside-work-tree"],
                                { cwd: fullPath, timeout: 5000 },
                                (err, stdout) => {
                                    if (!err && stdout.trim() === "true") {
                                        results.push({ name: item, isGitRepo: true });
                                    }
                                    resolve(); 
                                }
                            );
                        });
                    }));
            
                    return res.json(results);
                } catch (err) {
                    console.error(err);
                    return res.status(500).send(err.message);
                }
            });
            
//Now catch the path and action  of a git repo and access the request
app.post("/git_repo/:action", async (req, res) => {
    const { path: git_path, base, compare } = req.body
     const action = req.params.action
    
    const allowed_actions =["commit","review"];
 if(!allowed_actions.includes(action)){
    return res.status(400).send("Inavalid Action");
 }
    
 if (typeof git_path !== "string") {
  return res.status(400).send("Invalid path");
}
// securing the git path
 const resolvedGitPath = path.resolve(git_path);
  if (!resolvedGitPath.startsWith(SAFE_ROOT)) {
    return res.status(403).send("Access denied");
  }

    //checking if its a git repo or not again through backend


    //Now go the folder and store the stdoutput insid two varibles one for commit and one for suggestion
    try {
        await git_validation(resolvedGitPath)
        if (action === "commit") {
            const diff = await get_staged_diff(resolvedGitPath);
             //what if the difference is empty
            if (!diff.trim()) {
        return res.status(400).send("No staged changes found");
      }
            const prompt = `
                          You are a senior developer.
                          Analyze the following git diff and suggest:
                          1. A clear commit message
                          2. Short feedback

                          Git diff:
                           ${diff}
                                    `
            const airesponse = await askllm(prompt)
            return res.json({ Suggestion: airesponse })
        }


        else if (action === "review") {
            const review_code1 = await review_code(resolvedGitPath, base, compare)
            const prompt = `Review the following branch difference and provide feedback:${review_code1}`
            const airesponse = await askllm(prompt)
            return res.json({ Suggestion: airesponse })
        }


        else {
            return res.status(400).send("Invalid action")
        }
    }
    catch (err) {
        console.error(err)
        return res.status(500).send(err.message)
    }
})


function get_staged_diff(git_path) {
    return new Promise((resolve, reject) => {
        execFile("git", ["diff", "--staged"], { cwd: git_path,timeout:5000}, (err, stdout) => {
            if (err) {
                return reject(err)
            }
            resolve(stdout)
        })
    })
}

function review_code(git_path, base, compare) {
    return new Promise((resolve, reject) => {
        if (!base || !compare) {
            return reject(new Error("base and compare branch required"))
        }
        execFile("git", ["diff", `${base}..${compare}`], { cwd: git_path, timeout:5000 }, (err, stdout) => {
            if (err) {
                return reject(err)
            }
            resolve(stdout);

        })
    })
}
function git_validation(git_path) {
    return new Promise((resolve, reject) => {
        execFile("git", ["rev-parse", "--is-inside-work-tree"], { cwd: git_path,timeout:5000 }, (err) => {
            if (err) {
                return reject(new Error("Not a  git repo"))
            }
            resolve(true)

        })
    })
}
async function askllm(prompt) {
  return "Mock response";
}

console.log(process.env.OPENAI_API_KEY); // ✅ prints sk-xxxxxxxxxxxx
console.log(process.env.PORT)

app.listen(port, () => {
    console.log("Working on the Server")
})






//Now connect to api using a key
//Now make prompts for review  and commit respectively
//if commit is choosed send the commit_stdoutput + prompt to the ai
//now get back the response 






