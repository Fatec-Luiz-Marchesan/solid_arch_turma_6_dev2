const express = require('express')
const cors = require('cors')
const logger = require('./config/logger')

const app = express()

app.use(express.json())

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }))

app.use(express.static('public'))

const PetRoutes = require('./routers/PetRouters')
const UserRoutes = require('./routers/UserRouters')
const LocationRoutes = require('./routers/LocationRoutes')
const AdminRoutes = require('./routers/AdminRoutes')

app.use('/pets', PetRoutes)
app.use('/users', UserRoutes)
app.use('/locations', LocationRoutes)
app.use('/api/admin', AdminRoutes)

if (process.env.NODE_ENV !== 'test') {
    const PORT = 5000
    app.listen(PORT, () => {
        logger.info(`Servidor rodando na porta ${PORT}`)
        console.log(`Servidor rodando na porta ${PORT}`)
    })
}

module.exports = app