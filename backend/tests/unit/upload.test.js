const request = require('supertest')
const express = require('express')
const jwt = require('jsonwebtoken')

const app = express()
app.use(express.json())

const PetController = {
    create: async (req, res) => {
        const auth = req.headers.authorization
        if (!auth) {
            return res.status(401).json({ message: 'Acesso negado!' })
        }
        if (!req.body.name) {
            return res.status(422).json({ message: 'O nome é obrigatório!' })
        }
        return res.status(201).json({ message: 'Pet cadastrado com sucesso!' })
    },
    getAll: async (req, res) => {
        return res.status(200).json({ pets: [] })
    }
}

app.post('/pets/create', (req, res) => PetController.create(req, res))
app.get('/pets', (req, res) => PetController.getAll(req, res))

describe('Teste de Upload - Pets', () => {
    let token

    beforeAll(async () => {
        token = jwt.sign({ id: '123456789012345678901234' }, 'nossosecret')
    })

    test('POST /pets/create deve retornar 401 sem token', async () => {
        const res = await request(app)
            .post('/pets/create')
            .send({
                name: 'Rex',
                age: 3,
                weight: 8,
                color: 'preto'
            })
        expect(res.statusCode).toBe(401)
    })

    test('POST /pets/create deve retornar 422 sem nome', async () => {
        const res = await request(app)
            .post('/pets/create')
            .set('Authorization', `Bearer ${token}`)
            .send({
                age: 3,
                weight: 8,
                color: 'preto'
            })
        expect(res.statusCode).toBe(422)
        expect(res.body.message).toBe('O nome é obrigatório!')
    })

    test('POST /pets/create deve retornar 201 com dados válidos', async () => {
        const res = await request(app)
            .post('/pets/create')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Rex',
                age: 3,
                weight: 8,
                color: 'preto'
            })
        expect(res.statusCode).toBe(201)
        expect(res.body.message).toBe('Pet cadastrado com sucesso!')
    })

    test('GET /pets deve retornar 200', async () => {
        const res = await request(app)
            .get('/pets')
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('pets')
        expect(Array.isArray(res.body.pets)).toBe(true)
    })
})
