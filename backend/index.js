const express = require('express')
const cors = require('cors')

const app = express()

// Config JSON response
app.use(express.json())

// Solve CORS
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }))

// Public folder for images
app.use(express.static('public'))

// Routes
const PetRoutes = require('./routers/PetRouters')
const UserRoutes = require('./routers/UserRouters')
const LocationRoutes = require('./routers/LocationRoutes')

app.use('/pets', PetRoutes)
app.use('/users', UserRoutes)
app.use('/locations', LocationRoutes)


if (process.env.NODE_ENV !== 'test') {
    const PORT = 5000
    app.listen(PORT, () => {
        console.log(`Servidor rodando na porta ${PORT}'`)
    })
}

module.exports = app
