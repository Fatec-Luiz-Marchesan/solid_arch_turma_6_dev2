require('dotenv').config()

const express = require('express')
const cors = require('cors')

const logger = require('./config/logger')

const initializeSentry = require('./config/sentry')
const sentryErrorMiddleware = require('./middlewares/sentryErrorMiddleware')

// Routes
const PetRoutes = require('./routers/PetRouters')
const UserRoutes = require('./routers/UserRouters')
const LocationRoutes = require('./routers/LocationRoutes')
const AdminRoutes = require('./routers/AdminRoutes')
const VaccineRoutes = require('./routers/VaccineRoutes')
const BreedRoutes = require('./routers/BreedRoutes') // NOVO

const app = express()

initializeSentry()

// Middlewares
app.use(express.json())

app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:3000',
  })
)

app.use(express.static('public'))

// Routes
app.use('/pets', PetRoutes)
app.use('/users', UserRoutes)
app.use('/locations', LocationRoutes)
app.use('/api/admin', AdminRoutes)
app.use('/vaccines', VaccineRoutes)
app.use('/breeds', BreedRoutes) // NOVO

// Error Handler
app.use(sentryErrorMiddleware)

// Start Server
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 5000

  app.listen(PORT, () => {
    logger.info(`Servidor rodando na porta ${PORT}`)
    console.log(`Servidor rodando na porta ${PORT}`)
  })
}

module.exports = app