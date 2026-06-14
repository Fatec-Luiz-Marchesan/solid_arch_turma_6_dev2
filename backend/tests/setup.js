const mongoose = require('mongoose')
const { MongoMemoryServer } = require('mongodb-memory-server')

let mongoServer

beforeAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect()
    }

    mongoServer = await MongoMemoryServer.create()
    const uri = mongoServer.getUri()

    mongoose.set('strictQuery', false)

    await mongoose.connect(uri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000
    })

    console.log('Banco de testes conectado')
})

afterEach(async () => {
    const collections = mongoose.connection.collections

    for (const key in collections) {
        if (collections[key]) {
            await collections[key].deleteMany()
        }
    }
})

afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.dropDatabase()
        await mongoose.disconnect()
    }

    if (mongoServer) {
        await mongoServer.stop()
    }

    console.log('Banco de testes desconectado')
})