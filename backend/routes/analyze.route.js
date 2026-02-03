
// Now catch the path and action of a git repo and access the request
const askllm = require("./connectors/llm")
const review_code=require("./services/git.services")

app.post("/git_repo/:action", async (req, res) => {
    const { path: git_path, base, compare } = req.body
    const action = req.params.action

    const allowed_actions = ["commit", "review"]
    if (!allowed_actions.includes(action)) {
        return res.status(400).send("Invalid Action")
    }

    if (typeof git_path !== "string") {
        return res.status(400).send("Invalid path")
    }

    const resolvedGitPath = path.resolve(git_path)
    if (!resolvedGitPath.startsWith(SAFE_ROOT)) {
        return res.status(403).send("Access denied")
    }

    try {
        await git_validation(resolvedGitPath)

        if (action === "commit") {
            const diff = await get_staged_diff(resolvedGitPath)

            if (!diff.trim()) {
                return res.status(400).send("No staged changes found")
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

        if (action === "review") {
            const review_code1 = await review_code(resolvedGitPath, base, compare)
            const prompt = `Review the following branch difference and provide feedback:\n${review_code1}`
            const airesponse = await askllm(prompt)
            return res.json({ Suggestion: airesponse })
        }

    } catch (err) {
        console.error(err)
        return res.status(500).send(err.message)
    }
})
