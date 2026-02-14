import express from 'express'
import dotenv from 'dotenv'

// routers
import { healthRouter } from './routes/health.route.ts'
import { analyzeRouter } from './routes/analyze.route.ts'


dotenv.config({ path: '.env' })

const app = express()

app.use(express.json())
app.use(healthRouter)
app.use(analyzeRouter)

const port = 8080

app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})
