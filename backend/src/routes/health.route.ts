import { Router } from 'express'

const healthRouter = Router()

healthRouter.get('/health', (req, res) => {
    try {
        return res.status(200).json({
            status: 'ok',
            message: 'server is alive',
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development'
        })
    } catch (err: unknown) {
        console.error(err)

        const errorMessage =
            err instanceof Error ? err.message : 'Unknown error'

        return res.status(503).json({
            status: 'error',
            message: errorMessage
        })
    }
})

export {
    healthRouter
}
