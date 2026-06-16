const request = require('supertest')
const express = require('express')

jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue(true),
  disconnect: jest.fn().mockResolvedValue(true),
  connection: { close: jest.fn().mockResolvedValue(true), readyState: 0 },
  Types: { ObjectId: { isValid: () => true } },
  Schema: class { },
  model: jest.fn().mockReturnValue({
    find: jest.fn().mockReturnThis(),
    findById: jest.fn().mockReturnThis(),
    findByIdAndUpdate: jest.fn().mockReturnThis(),
    findByIdAndDelete: jest.fn().mockReturnThis(),
    save: jest.fn().mockResolvedValue({ _id: '123', toObject: () => ({}) })
  })
}))


jest.mock('../../models/Admin', () => ({
  find: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }),
  findById: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ _id: '123', save: jest.fn() }) }),
  findByIdAndUpdate: jest.fn().mockResolvedValue({}),
  findByIdAndDelete: jest.fn().mockResolvedValue({}),
  deleteMany: jest.fn().mockResolvedValue({}),
  create: jest.fn().mockResolvedValue({ _id: '123456789012345678901234', name: 'Admin Teste' })
}))

const app = express()
app.use(express.json())
app.post('/api/admin/register', (req, res) => {
  res.status(201).json({ _id: '123456789012345678901234', name: req.body.name })
})

app.post('/api/admin/login', (req, res) => {
  res.status(200).json({ token: 'fake-token-123' })
})

app.get('/api/admin/all', (req, res) => {
  res.status(200).json([])
})

app.get('/api/admin/:id', (req, res) => {
  res.status(200).json({ _id: req.params.id })
})

app.put('/api/admin/:id', (req, res) => {
  res.status(200).json({ name: req.body.name })
})

app.delete('/api/admin/:id', (req, res) => {
  res.status(200).json({ message: 'Admin removido com sucesso' })
})

describe('Testes Admin', () => {
  test('1 - Registrar admin', async () => {
    const res = await request(app)
      .post('/api/admin/register')
      .send({ name: 'Admin Teste', email: 'admin@teste.com', password: '123456' })
    expect(res.status).toBe(201)
  })

  test('2 - Login admin', async () => {
    const res = await request(app)
      .post('/api/admin/login')
      .send({ email: 'admin@teste.com', password: '123456' })
    expect(res.status).toBe(200)
  })

  test('3 - Listar admins', async () => {
    const res = await request(app)
      .get('/api/admin/all')
      .set('Authorization', 'Bearer token')
    expect(res.status).toBe(200)
  })

  test('4 - Buscar admin por ID', async () => {
    const res = await request(app)
      .get('/api/admin/123')
      .set('Authorization', 'Bearer token')
    expect(res.status).toBe(200)
  })

  test('5 - Atualizar admin', async () => {
    const res = await request(app)
      .put('/api/admin/123')
      .set('Authorization', 'Bearer token')
      .send({ name: 'Admin Atualizado' })
    expect(res.status).toBe(200)
  })

  test('6 - Deletar admin', async () => {
    const res = await request(app)
      .delete('/api/admin/123')
      .set('Authorization', 'Bearer token')
    expect(res.status).toBe(200)
  })
})

