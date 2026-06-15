require('dotenv').config()
const express = require('express')
const cors = require('cors')
const logger = require('./config/logger')
const initializeSentry = require('./config/sentry')
const sentryErrorMiddleware = require('./middlewares/sentryErrorMiddleware')
const PetRoutes = require('./routers/PetRouters')
const UserRoutes = require('./routers/UserRouters')
const LocationRoutes = require('./routers/LocationRoutes')
const AdminRoutes = require('./routers/AdminRoutes')
const VaccineRoutes = require('./routers/VaccineRoutes')
const BreedRoutes = require('./routers/BreedRoutes')
const profileRoutes = require('./routers/ProfileRoutes')
const DietRoutes = require('./routers/DietRoutes')
const MessageRoutes = require('./routers/MessageRoutes')
const DockerRoutes = require('./routers/DockerRoutes')

const app = express()

initializeSentry()

app.use(express.json())
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}))

app.use(express.static('public'))

app.use('/pets', PetRoutes)
app.use('/users', UserRoutes)
app.use('/locations', LocationRoutes)
app.use('/api/admin', AdminRoutes)
app.use('/vaccines', VaccineRoutes)
app.use('/breeds', BreedRoutes)
app.use('/api/profiles', profileRoutes)
app.use('/diets', DietRoutes)
app.use('/messages', MessageRoutes)
app.use('/api/docker', DockerRoutes)

app.get('/health', (req, res) => {
    res.json({ status: 'ok', docker: process.env.DOCKER_ENV === 'true' })
})

app.use(sentryErrorMiddleware)

if (process.env.NODE_ENV !== 'test') {
    const PORT = process.env.PORT || 5000
    app.listen(PORT, () => {
        logger.info(`Servidor rodando na porta ${PORT}`)
        console.log(`Servidor rodando na porta ${PORT}`)
    })
}

module.exports = app