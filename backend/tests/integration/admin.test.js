const request = require('supertest')
const mongoose = require('mongoose')
const app = require('../../index')
const Admin = require('../../models/Admin')

describe('Testes Admin', () => {
  let token
  let adminId

  beforeAll(async () => {
    await Admin.deleteMany({})
  })

  afterAll(async () => {
    await mongoose.connection.close()
  })

  test('1 - Registrar admin', async () => {
    const res = await request(app)
      .post('/api/admin/register')
      .send({
        name: 'Admin Teste',
        email: 'admin@teste.com',
        password: '123456'
      })
    
    expect(res.status).toBe(201)
    adminId = res.body._id
  })

  test('2 - Login admin', async () => {
    const res = await request(app)
      .post('/api/admin/login')
      .send({
        email: 'admin@teste.com',
        password: '123456'
      })
    
    expect(res.status).toBe(200)
    token = res.body.token
    console.log('TOKEN OBTIDO:', token ? 'Sim' : 'Não')
  })

  test('3 - Listar admins', async () => {
    if (!token) {
      console.log('Sem token, pulando teste')
      return
    }
    
    const res = await request(app)
      .get('/api/admin/all')
      .set('Authorization', `Bearer ${token}`)
    
    console.log('Listar status:', res.status)
    console.log('Listar body:', res.body)
    expect(res.status).toBe(200)
  })

  test('4 - Buscar admin por ID', async () => {
    if (!token) {
      console.log('Sem token, pulando teste')
      return
    }
    
    const res = await request(app)
      .get(`/api/admin/${adminId}`)
      .set('Authorization', `Bearer ${token}`)
    
    console.log('Buscar status:', res.status)
    expect(res.status).toBe(200)
  })

  test('5 - Atualizar admin', async () => {
    if (!token) {
      console.log('Sem token, pulando teste')
      return
    }
    
    const res = await request(app)
      .put(`/api/admin/${adminId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Admin Atualizado' })
    
    console.log('Atualizar status:', res.status)
    expect(res.status).toBe(200)
  })

  test('6 - Deletar admin', async () => {
    if (!token) {
      console.log('Sem token, pulando teste')
      return
    }
    
    const res = await request(app)
      .delete(`/api/admin/${adminId}`)
      .set('Authorization', `Bearer ${token}`)
    
    console.log('Deletar status:', res.status)
    expect(res.status).toBe(200)
  })
})
