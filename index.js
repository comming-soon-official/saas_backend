const express = require('express')
const cors = require('cors')
const { dashboardConfig, parseConfig } = require('./main-config')

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Routes
app.get('/', (req, res) => {
    res.json({ success: 'Hey There Im from New Saas Backend' })
})

app.post('/saas', (req, res) => {
    try {
        // Add your saas route logic here
        res.json({ status: 'success' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.post('/synthetic', (req, res) => {
    try {
        // Add your synthetic route logic here
        res.json({ status: 'success' })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// Mount Parse Dashboard and Parse Server
app.use('/dashboard', dashboardConfig)
app.use('/parse', parseConfig.app) // Use parseConfig.app instead of parseConfig directly

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).json({ error: 'Something broke!' })
})

// Server initialization
const port = 1337

// Initialize Parse Server first, then start Express
async function startServer() {
    try {
        await parseConfig.start()
        app.listen(port, () => {
            console.log(
                `🚀 Parse Server running on http://localhost:${port}/parse`
            )
            console.log(
                `📊 Parse Dashboard running on http://localhost:${port}/dashboard`
            )
        })
    } catch (error) {
        console.error('Failed to start server:', error)
        process.exit(1)
    }
}

startServer()
