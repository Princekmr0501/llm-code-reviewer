//makke a check that if output should not exceed more than 1500 words  
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
    return new Promise((resolve, reject) => {
        if (!base || !compare) {
            return reject(new Error("base and compare branch required"))
        }

        execFile(
            "git",
            ["diff", `${base}..${compare}`],
            { cwd: git_path, timeout: 5000 },
            (err, stdout) => {
                if (err) return reject(err)
                resolve(stdout)
            }
        )
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
