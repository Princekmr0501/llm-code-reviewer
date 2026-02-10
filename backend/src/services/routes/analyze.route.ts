
import  { Request, Response } from "express"

import express from "express";
const app = express();

import askllm from "./connectors/llm.js"
import review_code from "../services/git.services.js"

import { SAFE_ROOT } from "./config.js";
import { git_validation } from "./git.services.js"; 
import { get_staged_diff } from "./git.services.js"; 



import path from "path"

//  ADDED: interface for request body
interface GitRepoRequestBody {
    path: string
    base?: string
    compare?: string
}


app.post(
    "/git_repo/:action",
    async (
        req: Request<{ action: string }, unknown, GitRepoRequestBody>,
        res: Response
    ) => {

        
        const { path: git_path, base, compare } = req.body

    
        const action: string = req.params.action

        
        const allowed_actions: string[] = ["commit", "review"]

        if (!allowed_actions.includes(action)) {
            return res.status(400).send("Invalid Action")
        }

        if (typeof git_path !== "string") {
            return res.status(400).send("Invalid path")
        }


        const resolvedGitPath: string = path.resolve(git_path)

        if (!resolvedGitPath.startsWith(SAFE_ROOT as string)) {
            return res.status(403).send("Access denied")
        }

        try {
            await git_validation(resolvedGitPath)

            if (action === "commit") {
                const diff: string = await get_staged_diff(resolvedGitPath)

                if (!diff.trim()) {
                    return res.status(400).send("No staged changes found")
                }

                const prompt: string = `
You are a senior developer.
Analyze the following git diff and suggest:
1. A clear commit message
2. Short feedback

Git diff:
${diff}
                `

                const airesponse: string = await askllm(prompt)
                return res.json({ Suggestion: airesponse })
            }

            if (action === "review") {
               
                const review_code1: string = await review_code(
                    resolvedGitPath,
                    base as string,
                    compare as string
                )

                const prompt: string =
                    `Review the following branch difference and provide feedback:\n${review_code1}`

                const airesponse: string = await askllm(prompt)
                return res.json({ Suggestion: airesponse })
            }

        } catch (err: unknown) { 

           
            if (err instanceof Error) {
                return res.status(500).send(err.message)
            }

            return res.status(500).send("Internal Server Error")
        }
    }
)
