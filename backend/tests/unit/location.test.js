
const request = require('supertest')
const app = require('../../index')
const User = require('../../models/User')
const Pet = require('../../models/Pet')
const jwt = require('jsonwebtoken')

describe('Testes de Location', () => {
    let token
    let petId

    beforeAll(async () => {
        await User.deleteMany({})
        await Pet.deleteMany({})

        const user = new User({
            name: 'Teste Location',
            email: 'location@teste.com',
            phone: '11999999999',
            password: '123456',
        })
        await user.save()
        token = jwt.sign({ id: user._id }, 'nossosecret')

        const pet = new Pet({
            name: 'Rex',
            age: 3,
            weight: 8,
            color: 'preto',
            available: true,
            images: ['teste.jpg'],
            user: { _id: user._id, name: user.name, phone: user.phone },
        })
        await pet.save()
        petId = pet._id
    })

    test('POST /locations/create deve criar localizacao com CEP valido', async () => {
        const res = await request(app)
            .post('/locations/create')
            .set('Authorization', `Bearer ${token}`)
            .send({ petId, cep: '01001000' })

        expect(res.statusCode).toBe(201)
        expect(res.body.message).toBe('Localização salva com sucesso!')
    })

    test('POST /locations/create deve retornar erro sem petId', async () => {
        const res = await request(app)
            .post('/locations/create')
            .set('Authorization', `Bearer ${token}`)
            .send({ cep: '01001000' })

        expect(res.statusCode).toBe(422)
        expect(res.body.message).toBe('Pet ID é obrigatório!')
    })

    test('POST /locations/create deve retornar erro sem CEP', async () => {
        const res = await request(app)
            .post('/locations/create')
            .set('Authorization', `Bearer ${token}`)
            .send({ petId })

        expect(res.statusCode).toBe(422)
        expect(res.body.message).toBe('CEP é obrigatório!')
    })

    test('GET /locations/pet/:petId deve listar localizacoes do pet', async () => {
        const res = await request(app).get(`/locations/pet/${petId}`)
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('locations')
    })
})