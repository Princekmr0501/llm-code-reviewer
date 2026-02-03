// Accesing the REQUEST **select repo**
const review_code=require("./services/git.services")
app.get("/check", async (req, res) => {
    try {
        if (!req.query.path) {
            return res.status(400).send("Path required")
        }

        const userPath = path.resolve(req.query.path)

        if (!userPath.startsWith(SAFE_ROOT)) {
            return res.status(403).send("Access denied")
        }

        const stats = await fs.stat(userPath)
        if (!stats.isDirectory()) {
            return res.status(400).send("Invalid Directory")
        }

        const items = await fs.readdir(userPath)
        const results = []
        await Promise.all(items.map(async (item) => {
            const fullPath = path.join(userPath, item)
           try{ const itemStats = await fs.stat(fullPath)
                if (!itemStats.isDirectory()) return
           }
           catch {
                return // safely ignore fs errors
               }
            return new Promise((resolve) => {
                execFile(
                    "git",
                    ["rev-parse", "--show-toplevel"],
                    { cwd: fullPath, timeout: 5000 },
                    (err, stdout) => {
                        if (!err && stdout.trim() === "true") {
                            results.push({ name: item, isGitRepo: true })
                        }
                        resolve()
                    }
                )
            })
        }))

        return res.json(results)

    } catch (err) {
        console.error(err)
        return res.status(500).send(err.message)
    }
})