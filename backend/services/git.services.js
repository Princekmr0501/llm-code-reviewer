//make a check that if output should not exceed more than 1500 words  

function get_staged_diff(git_path) {
    return new Promise((resolve, reject) => {
        execFile(
            "git",
            ["diff", "--staged"],
            { cwd: git_path, timeout: 5000 },
            (err, stdout) => {
                if (err) return reject(err)
                resolve(stdout)
            }
        )
    })
}

function review_code(git_path, base, compare) {
    return new Promise(async(resolve, reject) => {

        if (!base || !compare) {
            return reject(new Error("base and compare branch required"))
        }
    //checking if the base and compare branches exist 
    try {
            //  CHANGED: fetch latest branches
            await git_fetch(git_path)

            // CHANGED: verify base branch exists
            await git_branch_exists(git_path, base)

            //  CHANGED: verify compare branch exists
            await git_branch_exists(git_path, compare)
    
        execFile(
            "git",
            ["diff", `${base}..${compare}`],
            { cwd: git_path, timeout: 5000 },
            (err, stdout) => {
                if (err) return reject(err)
                resolve(stdout)
            }
        )
    }
    catch (err) {
            reject(err)
        }
    })
}

    


function git_validation(git_path) {
    return new Promise((resolve, reject) => {
        execFile(
            "git",
            ["rev-parse", "--is-inside-work-tree"],
            { cwd: git_path, timeout: 5000 },
            (err) => {
                if (err) {
                    return reject(new Error("Not a git repo"))
                }
                resolve(true)
            }
        )
    })
}


//  CHANGED: new helper to fetch latest refs
function git_fetch(git_path) {
    return new Promise((resolve, reject) => {
        execFile(
            "git",
            ["fetch", "--all"],
            { cwd: git_path, timeout: 5000 },
            (err) => {
                if (err) return reject(new Error("Git fetch failed"))
                resolve(true)
            }
        )
    })
}

  function git_branch_exists(git_path, branch) {
    return new Promise((resolve, reject) => {
        execFile(
            "git",
            ["rev-parse", "--verify", branch],
            { cwd: git_path, timeout: 5000 },
            (err) => {
                if (err) {
                    return reject(new Error(`Branch not found: ${branch}`))
                }
                resolve(true)
            }
        )
    })
}