const request = require('supertest')
const app = require('../../index')
const User = require('../../models/User')
const jwt = require('jsonwebtoken')

jest.mock('uuid', () => ({
  v4: () => 'mock-uuid-123'
}))

describe('Teste de Upload - Pets', () => {
    let token

    beforeAll(async () => {
        await User.deleteMany({})
        
        const user = new User({
            name: 'teste Upload',
            email: 'upload@teste.com',
            phone: '11924121089',
            password: '123456',
        })

        await user.save()
        token = jwt.sign({ id: user._id }, 'nossosecret')
    })

    test('POST /pets/create deve retornar 401 sem token', async () => {
        const res = await request(app)
            .post('/pets/create')
            .field('name', 'Rex')
            .field('age', '3')
            .field('weight', '8')
            .field('color', 'preto')
        expect(res.statusCode).toBe(401)
    })

    test('POST /pets/create deve retornar 422 sem nome', async () => {
        const res = await request(app)
            .post('/pets/create')
            .set('Authorization', `Bearer ${token}`)
            .field('age', '3')
            .field('weight', '8')
            .field('color', 'preto')
        expect(res.statusCode).toBe(422)
        expect(res.body.message).toBe('O nome é obrigatório!')
    })

    test('GET /pets deve retornar 200', async () => {
        const res = await request(app).get('/pets')
        expect(res.statusCode).toBe(200)
        expect(res.body).toHaveProperty('pets')
    })
})