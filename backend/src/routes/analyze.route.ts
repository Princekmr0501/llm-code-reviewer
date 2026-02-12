import { Router } from 'express'
const analyzeRouter = Router()

import { askllm } from '../connectors/llm.ts'
import { get_diff_between_branches } from '../services/git.services.ts'

// import { SAFE_ROOT } from '../config/constants.ts'
import { git_validation } from '../services/git.services.ts'
import { get_staged_diff } from '../services/git.services.ts'

import path from 'path'

//  ADDED: interface for request body
interface GitRepoRequestBody {
    path: string
    base?: string
    compare?: string
}

analyzeRouter.post('/git_repo/:action', async( req, res) => {
    const { path: git_path, base, compare } = req.body
    
    if (typeof base !== 'string') {
        throw new Error('base should be a string')
    }

    const action = req.params.action
        
    const allowed_actions = ['commit', 'review']

    if (!allowed_actions.includes(action)) {
        return res.status(400).send('Invalid Action')
    }

    if (typeof git_path !== 'string') {
        return res.status(400).send('Invalid path')
    }

    const resolvedGitPath = path.resolve(git_path)

    try {
        await git_validation(resolvedGitPath)

        if (action === 'commit') {
            const diff: string = await get_staged_diff(resolvedGitPath)

            if (!diff.trim()) {
                return res.status(400).send('No staged changes found')
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

        if (action === 'review') {
               
            const diffBetweenBranches = await get_diff_between_branches(resolvedGitPath, base, compare)

            const prompt = `Review the following branch difference and provide feedback:\n${diffBetweenBranches}`

            const aiResponse = await askllm(prompt)
            return res.json({ Suggestion: aiResponse })
        }

    } catch (err: unknown) { 
           
        if (err instanceof Error) {
            return res.status(500).send(err.message)
        }

        return res.status(500).send('Internal Server Error')
    }
})

export {
    analyzeRouter
}